import { SupabaseClient } from "@supabase/supabase-js";
import { parseFeed } from "rss";
import { Md5 } from "std/md5";
import { FeedEntry } from "rss/types";
import { Redis } from "redis";
import { unescape } from "lodash";

import { IItem } from "../models/item.ts";
import { ISource } from "../models/source.ts";
import { uploadItemMedia } from "./utils/uploadFile.ts";
import { IProfile } from "../models/profile.ts";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.ts";
import { log } from "../utils/log.ts";

/**
 * `isRedditUrl` checks if the provided `url` is a valid Reddit url. A url is considered valid if the hostname starts
 * with `reddit.com`.
 */
export const isRedditUrl = (url: string): boolean => {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname.endsWith("reddit.com");
};

export const getRedditFeed = async (
  supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  if (!source.options?.reddit) {
    throw new Error("Invalid source options");
  }

  if (
    source.options.reddit.startsWith("/r/") ||
    source.options.reddit.startsWith("/u/")
  ) {
    source.options.reddit =
      `https://www.reddit.com${source.options.reddit}.rss`;
  } else if (isRedditUrl(source.options.reddit)) {
    if (!source.options.reddit.endsWith(".rss")) {
      source.options.reddit = `${source.options.reddit}.rss`;
    }
  }

  /**
   * Get the RSS for the provided `youtube` url and parse it. If a feed doesn't contains an item we return an error.
   */
  const response = await fetchWithTimeout(source.options.reddit, {
    method: "get",
  }, 5000);
  const xml = await response.text();
  log("debug", "Add source", {
    sourceType: "reddit",
    requestUrl: source.options.reddit,
    responseStatus: response.status,
    responseBody: xml,
  });
  const feed = await parseFeed(xml);

  if (!feed.title.value) {
    throw new Error("Invalid feed");
  }

  /**
   * Generate a source id based on the user id, column id and the normalized `youtube` url. Besides that we also set the
   * source type to `youtube` and set the title and link for the source.
   */
  if (source.id === "") {
    source.id = generateSourceId(
      source.userId,
      source.columnId,
      source.options.reddit,
    );
  }
  source.type = "reddit";
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
     * Create the item object and add it to the `items` array. Before the item is added we also try to upload the media
     * of the item to our CDN and set the `item.media` to the URL of the uploaded media.
     */
    const item = {
      id: itemId,
      userId: source.userId,
      columnId: source.columnId,
      sourceId: source.id,
      title: entry.title.value,
      link: entry.links[0].href,
      media: getMedia(entry),
      description: entry.content?.value
        ? unescape(entry.content.value)
        : undefined,
      author: entry.author?.name,
      publishedAt: Math.floor(entry.published.getTime() / 1000),
    };

    const cdnItemMedia = await uploadItemMedia(supabaseClient, item);
    if (cdnItemMedia) {
      item.media = cdnItemMedia;
    }

    items.push(item);
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
  return `reddit-${userId}-${columnId}-${new Md5().update(link).toString()}`;
};

/**
 * `generateItemId` generates a unique item id based on the source id and the identifier of the item. We use the MD5
 * algorithm for the identifier, which can be the link of the item or the id of the item.
 */
const generateItemId = (sourceId: string, identifier: string): string => {
  return `${sourceId}-${new Md5().update(identifier).toString()}`;
};

/**
 * `getMedia` returns the media for a feed entry. If the entry does not contain a media we return `undefined`. Some
 * Reddit feed items are containing a thumbnail, which we can use as media.
 */
const getMedia = (entry: FeedEntry): string | undefined => {
  if (
    // deno-lint-ignore no-explicit-any
    (entry as any)["media:thumbnail"] && (entry as any)["media:thumbnail"].url
  ) {
    // deno-lint-ignore no-explicit-any
    return (entry as any)["media:thumbnail"].url;
  }

  return undefined;
};
