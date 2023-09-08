import { SupabaseClient } from "@supabase/supabase-js";
import { parseFeed } from "rss";
import { Md5 } from "std/md5";
import { FeedEntry } from "rss/types";
import { Redis } from "redis";
import { unescape } from "lodash";

import { IItem } from "../models/item.ts";
import { ISource } from "../models/source.ts";
import { uploadSourceIcon } from "./utils/uploadFile.ts";
import { IProfile } from "../models/profile.ts";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.ts";
import { log } from "../utils/log.ts";

export const getMastodonFeed = async (
  supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  if (!source.options?.mastodon || source.options.mastodon.length === 0) {
    throw new Error("Invalid source options");
  }

  if (source.options.mastodon[0] === "@") {
    const lastIndex = source.options.mastodon.lastIndexOf("@");
    const username = source.options.mastodon.slice(0, lastIndex);
    const instance = source.options.mastodon.slice(lastIndex + 1);
    source.options.mastodon = `https://${instance}/${username}.rss`;
  } else if (source.options.mastodon[0] === "#") {
    source.options.mastodon = `https://${getInstance()}/tags/${
      source.options.mastodon.slice(1)
    }.rss`;
  } else if (
    source.options.mastodon.startsWith("https://") &&
    !source.options.mastodon.endsWith(".rss")
  ) {
    source.options.mastodon = `${source.options.mastodon}.rss`;
  } else {
    throw new Error("Invalid source options");
  }

  /**
   * Get the RSS for the provided Mastodon username, hashtag or url.
   */
  const response = await fetchWithTimeout(
    source.options.mastodon,
    { method: "get" },
    5000,
  );
  const xml = await response.text();
  log("debug", "Add source", {
    sourceType: "mastodon",
    requestUrl: source.options.mastodon,
    responseStatus: response.status,
  });
  const feed = await parseFeed(xml);

  if (!feed.title.value) {
    throw new Error("Invalid feed");
  }

  /**
   * Generate a source id based on the user id, column id and the normalized `mastodon` options. Besides that we also
   * set the source type to `mastodon` and the link for the source. In opposite to the other sources we do not use the
   * title of the feed as the title for the source, instead we are using the user input as title.
   */
  if (source.id === "") {
    source.id = generateSourceId(
      source.userId,
      source.columnId,
      source.options.mastodon,
    );
  }
  source.type = "mastodon";
  source.title = feed.title.value;
  if (feed.links.length > 0) {
    source.link = feed.links[0];
  }

  /**
   * When the source doesn't has an icon yet and the feed contains an image we add an image to the source. We also
   * upload the image to our CDN and set the `source.icon` to the path of the uploaded image.
   */
  if (!source.icon && feed.image?.url) {
    source.icon = feed.image.url;
    source.icon = await uploadSourceIcon(supabaseClient, source);
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
     * Create the item object and add it to the `items` array. Before the item is created we also try to get a list of
     * media fils (images) and add it to the options. Since there could be multiple media files we add it to the options
     * and not to the media field.
     */
    const media = getMedia(entry);

    items.push({
      id: itemId,
      userId: source.userId,
      columnId: source.columnId,
      sourceId: source.id,
      title: "",
      link: entry.links[0].href,
      options: media && media.length > 0 ? { media: media } : undefined,
      description: entry.description?.value
        ? unescape(entry.description.value)
        : undefined,
      author: getAuthor(entry),
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
  return `mastodon-${userId}-${columnId}-${new Md5().update(link).toString()}`;
};

/**
 * `generateItemId` generates a unique item id based on the source id and the identifier of the item. We use the MD5
 * algorithm for the identifier, which can be the link of the item or the id of the item.
 */
const generateItemId = (sourceId: string, identifier: string): string => {
  return `${sourceId}-${new Md5().update(identifier).toString()}`;
};

/**
 * `getMedia` returns an image for the provided feed entry from it's description. If we could not get an image from the
 * description we return `undefined`.
 */
const getMedia = (entry: FeedEntry): string[] | undefined => {
  if (entry["media:content"]) {
    const images = [];
    for (const media of entry["media:content"]) {
      if (media.medium === "image" && media.url) {
        images.push(media.url);
      }
    }

    return images;
  }

  return undefined;
};

/**
 * `getAuthor` returns the author for the provided feed entry based on the link to the entry.
 */
const getAuthor = (entry: FeedEntry): string | undefined => {
  if (entry.links.length > 0 && entry.links[0].href) {
    const urlParts = entry.links[0].href.replace("https://", "").split("/");
    if (urlParts.length === 3) {
      return `${urlParts[1]}@${urlParts[0]}`;
    }
  }

  return undefined;
};

const getInstance = (): string => {
  const instances = [
    "mastodon.social",
    "fediscience.org",
    "fosstodon.org",
    "hachyderm.io",
    "hci.social",
    "indieweb.social",
    "ioc.exchange",
    "mindly.social",
    "techhub.social",
    "universeodon.com",
  ];

  return instances[Math.floor(Math.random() * instances.length)];
};
