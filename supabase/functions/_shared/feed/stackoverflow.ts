import { SupabaseClient } from "@supabase/supabase-js";
import { parseFeed } from "rss";
import { Md5 } from "std/md5";
import { Redis } from "redis";
import { unescape } from "lodash";

import { ISource } from "../models/source.ts";
import { IItem } from "../models/item.ts";
import { IProfile } from "../models/profile.ts";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.ts";
import { log } from "../utils/log.ts";

export const getStackoverflowFeed = async (
  _supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  if (!source.options?.stackoverflow || !source.options?.stackoverflow?.type) {
    throw new Error("Invalid source options");
  }

  if (source.options.stackoverflow.type === "tag") {
    source.options.stackoverflow.url =
      `https://stackoverflow.com/feeds/tag?tagnames=${source.options.stackoverflow.tag}&sort=${source.options.stackoverflow.sort}`;
  }

  if (!source.options?.stackoverflow.url) {
    throw new Error("Invalid source options");
  }

  /**
   * Get the RSS for the provided `stackoverflow` url and parse it. If a feed doesn't contains an item we return an error.
   */
  const response = await fetchWithTimeout(source.options.stackoverflow.url, {
    method: "get",
  }, 5000);
  const xml = await response.text();
  log("debug", "Add source", {
    sourceType: "stackoverflow",
    requestUrl: source.options.stackoverflow.url,
    responseStatus: response.status,
  });
  const feed = await parseFeed(xml);

  if (!feed.title.value) {
    throw new Error("Invalid feed");
  }

  /**
   * Generate a source id based on the user id, column id and the normalized `stackoverflow` url. Besides that we also
   * set the source type to `stackoverflow` and set the title and link for the source.
   */
  if (source.id === "") {
    source.id = generateSourceId(
      source.userId,
      source.columnId,
      source.options.stackoverflow.url,
    );
  }
  source.type = "stackoverflow";
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
      media: undefined,
      description: entry.description?.value
        ? unescape(entry.description.value)
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
  return `stackoverflow-${userId}-${columnId}-${
    new Md5().update(link).toString()
  }`;
};

/**
 * `generateItemId` generates a unique item id based on the source id and the identifier of the item. We use the MD5
 * algorithm for the identifier, which can be the link of the item or the id of the item.
 */
const generateItemId = (sourceId: string, identifier: string): string => {
  return `${sourceId}-${new Md5().update(identifier).toString()}`;
};
