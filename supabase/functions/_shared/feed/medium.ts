import { SupabaseClient } from "@supabase/supabase-js";
import { parseFeed } from "rss";
import { Md5 } from "std/md5";
import { FeedEntry } from "rss/types";
import { Redis } from "redis";
import { unescape } from "lodash";

import { IItem } from "../models/item.ts";
import { ISource } from "../models/source.ts";
import { Favicon, getFavicon } from "./utils/getFavicon.ts";
import { uploadSourceIcon } from "./utils/uploadFile.ts";
import { IProfile } from "../models/profile.ts";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.ts";
import { log } from "../utils/log.ts";

/**
 * `isMediumUrl` checks if the provided `url` is a valid Medium url. A url is considered valid if the hostname starts
 * with `medium.com`.
 */
export const isMediumUrl = (url: string): boolean => {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname.endsWith("medium.com");
};

export const getMediumFeed = async (
  supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  /**
   * Since the `medium` option supports multiple input format we need to normalize it to a valid Medium feed url. If
   * this is not possible we consider the provided option as invalid.
   */
  if (source.options?.medium) {
    const input = source.options.medium;
    if (input.length > 1 && input[0] === "#") {
      source.options.medium = `https://medium.com/feed/tag/${input.slice(1)}`;
    } else if (input.length > 1 && input[0] === "@") {
      source.options.medium = `https://medium.com/feed/${input}`;
    } else {
      const parsedUrl = new URL(input);
      const parsedHostname = parsedUrl.hostname.split(".");
      if (
        parsedHostname.length === 2 && parsedHostname[0] === "medium" &&
        parsedHostname[1] === "com"
      ) {
        source.options.medium = `https://medium.com/feed/${
          input.replace("https://medium.com/", "").replace("feed/", "")
        }`;
      } else if (
        parsedHostname.length === 3 && parsedHostname[1] === "medium" &&
        parsedHostname[2] === "com"
      ) {
        source.options.medium = `https://${parsedHostname[0]}.medium.com/feed`;
      } else {
        throw new Error("Invalid source options");
      }
    }
  } else {
    throw new Error("Invalid source options");
  }

  /**
   * Get the RSS for the provided `medium` url and parse it. If a feed doesn't contains an item we return an error.
   */
  const response = await fetchWithTimeout(source.options.medium, {
    method: "get",
  }, 5000);
  const xml = await response.text();
  log("debug", "Add source", {
    sourceType: "medium",
    requestUrl: source.options.medium,
    responseStatus: response.status,
  });
  const feed = await parseFeed(xml);

  if (!feed.title.value) {
    throw new Error("Invalid feed");
  }

  /**
   * When the source doesn't has an id yet we try to get an favicon from the feed for the source. We check if the source
   * has an id because we only want to try to get the favicon when the source is created the first time.
   */
  if (source.id === "" && feed.links.length > 0) {
    const favicon = await getFavicon(
      feed.links[0],
      (favicons: Favicon[]): Favicon[] => {
        return favicons.filter((favicon) => {
          return favicon.url.startsWith("https://cdn-images");
        });
      },
    );

    if (favicon && favicon.url.startsWith("https://")) {
      source.icon = favicon.url;
      source.icon = await uploadSourceIcon(supabaseClient, source);
    }
  }

  /**
   * Generate a source id based on the user id, column id and the normalized `medium` url. Besides that we also set the
   * source type to `medium` and set the title and link for the source.
   */
  if (source.id === "") {
    source.id = generateSourceId(
      source.userId,
      source.columnId,
      source.options.medium,
    );
  }
  source.type = "medium";
  source.title = feed.title.value;
  if (feed.links.length > 0) {
    source.link = feed.links[0];
  }

  /**
   * Now that the source does contain all the required information we can start to generate the items for the source, by
   * looping over all the feed entries. We only add the first 50 items from the feed, because we only keep the latest 50
   * items for each source in our deletion logic.
   */
  const items: IItem[] = [];

  for (const [index, entry] of feed.entries.entries()) {
    if (index === 50) {
      break;
    }

    /**
     * If the entry does not contain a title, a link or a published date we skip it.
     */
    if (
      !entry.title?.value ||
      (entry.links.length === 0 || !entry.links[0].href) || !entry.published
    ) {
      continue;
    }

    /**
     * Each item need a unique id which is generated using the `generateItemId` function. The id is a combination of the
     * source id and the id of the entry or if the entry does not have an id we use the link of the first link of the
     * entry.
     */
    let itemId = "";
    if (entry.id != "") {
      itemId = generateItemId(source.id, entry.id);
    } else if (entry.links.length > 0 && entry.links[0].href) {
      itemId = generateItemId(source.id, entry.links[0].href);
    } else {
      continue;
    }

    /**
     * Create the item object and add it to the `items` array.
     */
    items.push({
      id: itemId,
      userId: source.userId,
      columnId: source.columnId,
      sourceId: source.id,
      title: entry.title.value,
      link: entry.links[0].href,
      media: getMedia(entry),
      description: getItemDescription(entry),
      author: entry["dc:creator"]?.join(", "),
      publishedAt: Math.floor(entry.published.getTime() / 1000),
    });
  }

  return { source, items };
};

/**
 * `generateSourceId` generates a unique source id based on the user id, column id and the link of the RSS feed. We use
 * the MD5 algorithm for the link to generate the id.
 */
const generateSourceId = (
  userId: string,
  columnId: string,
  link: string,
): string => {
  return `medium-${userId}-${columnId}-${new Md5().update(link).toString()}`;
};

/**
 * `generateItemId` generates a unique item id based on the source id and the identifier of the item. We use the MD5
 * algorithm for the identifier, which can be the link of the item or the id of the item.
 */
const generateItemId = (sourceId: string, identifier: string): string => {
  return `${sourceId}-${new Md5().update(identifier).toString()}`;
};

/**
 * `getItemDescription` returns the description of the item. If the item has a `content` property we use that as our
 * description, otherwise we use the `description` property.
 */
const getItemDescription = (entry: FeedEntry): string | undefined => {
  if (entry.content?.value) {
    return unescape(entry.content.value);
  }

  if (entry.description?.value) {
    return unescape(entry.description.value);
  }

  return undefined;
};

/**
 * `getMedia` returns an image for the provided feed entry from it's content or description. If we could not get an
 * image from the content or description we return `undefined`.
 */
const getMedia = (entry: FeedEntry): string | undefined => {
  if (entry.content?.value) {
    const matches = /<img[^>]+\bsrc=["']([^"']+)["']/.exec(
      entry.content?.value,
    );
    if (matches && matches.length == 2 && matches[1].startsWith("https://")) {
      return matches[1];
    }
  }

  if (entry.description?.value) {
    const matches = /<img[^>]+\bsrc=["']([^"']+)["']/.exec(
      entry.description?.value,
    );
    if (matches && matches.length == 2 && matches[1].startsWith("https://")) {
      return matches[1];
    }
  }

  return undefined;
};
