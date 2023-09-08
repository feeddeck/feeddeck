import { SupabaseClient } from "@supabase/supabase-js";
import { parseFeed } from "rss";
import { Md5 } from "std/md5";
import { FeedEntry } from "rss/types";
import { unescape } from "lodash";
import { Redis } from "redis";

import { ISource } from "../models/source.ts";
import { IItem } from "../models/item.ts";
import { IProfile } from "../models/profile.ts";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.ts";
import { log } from "../utils/log.ts";

/**
 * `isTumblrUrl` checks if the provided `url` is a valid Tumblr url. A url is considered valid if the hostname starts
 * with `tumblr.com`.
 */
export const isTumblrUrl = (url: string): boolean => {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname.endsWith("tumblr.com");
};

export const getTumblrFeed = async (
  _supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  if (!source.options?.tumblr) {
    throw new Error("Invalid source options");
  }

  const parsedUrl = new URL(source.options.tumblr);
  const hostnameParts = parsedUrl.hostname.split(".");
  if (hostnameParts.length != 3) {
    throw new Error("Invalid source options");
  }

  if (hostnameParts[0] === "www") {
    const pathParts = parsedUrl.pathname.split("/");
    if (pathParts.length < 2) {
      throw new Error("Invalid source options");
    }
    source.options.tumblr = `https://${pathParts[1]}.tumblr.com/rss`;
  } else {
    source.options.tumblr = `https://${parsedUrl.hostname}/rss`;
  }

  /**
   * Get the RSS for the provided `tumblr` url and parse it. If a feed doesn't contains an item we return an error.
   */
  const response = await fetchWithTimeout(source.options.tumblr, {
    method: "get",
  }, 5000);
  const xml = await response.text();
  log("debug", "Add source", {
    sourceType: "tumblr",
    requestUrl: source.options.tumblr,
    responseStatus: response.status,
  });
  const feed = await parseFeed(xml);

  if (!feed.title.value) {
    throw new Error("Invalid feed");
  }

  /**
   * Generate a source id based on the user id, column id and the normalized `tumblr` url. Besides that we also set the
   * source type to `tumblr` and set the title and link for the source.
   */
  if (source.id === "") {
    source.id = generateSourceId(
      source.userId,
      source.columnId,
      source.options.tumblr,
    );
  }
  source.type = "tumblr";
  source.title = feed.title.value;
  if (feed.links.length > 0) {
    source.link = feed.links[0];
  }
  source.icon = undefined;

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
     * Create the item object and add it to the `items` array.
     */
    items.push({
      id: generateItemId(source.id, entry.id),
      userId: source.userId,
      columnId: source.columnId,
      sourceId: source.id,
      title: entry.title.value,
      link: entry.links[0].href,
      media: getMedia(entry),
      description: entry.description?.value
        ? unescape(entry.description?.value)
        : undefined,
      author: undefined,
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
  return `tumblr-${userId}-${columnId}-${new Md5().update(link).toString()}`;
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
const getMedia = (entry: FeedEntry): string | undefined => {
  if (entry.description?.value) {
    const matches = /<img[^>]+\bsrc=["']([^"']+)["']/.exec(
      unescape(entry.description?.value),
    );
    if (matches && matches.length == 2 && matches[1].startsWith("https://")) {
      return matches[1];
    }
  }

  return undefined;
};
