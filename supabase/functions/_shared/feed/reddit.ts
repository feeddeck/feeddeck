import { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { FeedEntry } from "https://deno.land/x/rss@1.0.0/src/types/mod.ts";
import { Redis } from "https://deno.land/x/redis@v0.32.0/mod.ts";
import { unescape } from "https://raw.githubusercontent.com/lodash/lodash/4.17.21-es/lodash.js";

import { IItem } from "../models/item.ts";
import { ISource } from "../models/source.ts";
import { IProfile } from "../models/profile.ts";
import { utils } from "../utils/index.ts";
import { feedutils } from "./utils/index.ts";

/**
 * `isRedditUrl` checks if the provided `url` is a valid Reddit url. A url is
 * considered valid if the hostname starts with `reddit.com`.
 */
export const isRedditUrl = (url: string): boolean => {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname.endsWith("reddit.com");
};

export const getRedditFeed = async (
  _supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
  feedData: string | undefined,
): Promise<{ source: ISource; items: IItem[] }> => {
  if (!source.options?.reddit) {
    throw new feedutils.FeedValidationError("Invalid source options");
  }

  if (
    source.options.reddit.startsWith("/r/") ||
    source.options.reddit.startsWith("/u/")
  ) {
    source.options.reddit = `https://www.reddit.com${source.options.reddit}.rss`;
  } else if (isRedditUrl(source.options.reddit)) {
    if (!source.options.reddit.endsWith(".rss")) {
      source.options.reddit = `${source.options.reddit}.rss`;
    }
  }

  /**
   * Get the RSS for the provided `youtube` url and parse it. If a feed doesn't
   * contains an item we return an error.
   */
  const feed = await feedutils.getAndParseFeed(
    source.options.reddit,
    source,
    feedData,
  );

  if (!feed.title.value) {
    throw new Error("Invalid feed");
  }

  /**
   * Generate a source id based on the user id, column id and the normalized
   * `youtube` url. Besides that we also set the source type to `youtube` and
   * set the title and link for the source.
   */
  if (source.id === "") {
    source.id = await generateSourceId(
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
   * Now that the source does contain all the required information we can start
   * to generate the items for the source, by looping over all the feed entries.
   */
  const items: IItem[] = [];

  for (const [index, entry] of feed.entries.entries()) {
    if (skipEntry(index, entry, source.updatedAt || 0)) {
      continue;
    }

    /**
     * Each item need a unique id which is generated using the `generateItemId`
     * function. The id is a combination of the source id and the id of the
     * entry or if the entry does not have an id we use the link of the first
     * link of the entry.
     */
    let itemId = "";
    if (entry.id != "") {
      itemId = await generateItemId(source.id, entry.id);
    } else if (entry.links.length > 0 && entry.links[0].href) {
      itemId = await generateItemId(source.id, entry.links[0].href);
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
      title: entry.title!.value!,
      link: entry.links[0].href!,
      media: getMedia(entry),
      description: getDescription(entry),
      author: entry.author?.name,
      publishedAt: Math.floor(entry.published!.getTime() / 1000),
    });
  }

  return { source, items };
};

/**
 * `skipEntry` is used to determin if an entry should be skipped or not. When a
 * entry in the RSS feed is skipped it will not be added to the database. An
 * entry will be skipped when
 * - it is not within the first 50 entries of the feed, because we only keep the
 *   last 50 items of each source in our delete logic.
 * - the entry does not contain a title, a link or a published date.
 * - the published date of the entry is older than the last update date of the
 *   source minus 10 seconds.
 */
const skipEntry = (
  index: number,
  entry: FeedEntry,
  sourceUpdatedAt: number,
): boolean => {
  if (index === 50) {
    return true;
  }

  if (
    !entry.title?.value ||
    entry.links.length === 0 ||
    !entry.links[0].href ||
    !entry.published
  ) {
    return true;
  }

  if (Math.floor(entry.published.getTime() / 1000) <= sourceUpdatedAt - 10) {
    return true;
  }

  return false;
};

/**
 * `generateSourceId` generates a unique source id based on the user id, column
 * id and the link of the RSS feed. We use the MD5 algorithm for the link to
 * generate the id.
 */
const generateSourceId = async (
  userId: string,
  columnId: string,
  link: string,
): Promise<string> => {
  return `reddit-${userId}-${columnId}-${await utils.md5(link)}`;
};

/**
 * `generateItemId` generates a unique item id based on the source id and the
 * identifier of the item. We use the MD5 algorithm for the identifier, which
 * can be the link of the item or the id of the item.
 */
const generateItemId = async (
  sourceId: string,
  identifier: string,
): Promise<string> => {
  return `${sourceId}-${await utils.md5(identifier)}`;
};

/**
 * `getDescription` returns the description for a feed entry. If the entry does
 * not contain a description we return `undefined`. Some Reddit feed items are
 * containing a table, which we have to remove from the description, to improve
 * the rendering in the Flutter app.
 */
const getDescription = (entry: FeedEntry): string | undefined => {
  if (entry.content?.value) {
    const content = unescape(entry.content.value);
    return content
      .replaceAll("<table>", "")
      .replaceAll("<tr>", "")
      .replaceAll("<td>", "")
      .replaceAll("</table>", "")
      .replaceAll("</tr>", "")
      .replaceAll("</td>", "");
  }

  return undefined;
};

/**
 * `getMedia` returns the media for a feed entry. If the entry does not contain
 * a media we return `undefined`. Some Reddit feed items are containing a
 * thumbnail, which we can use as media.
 */
const getMedia = (entry: FeedEntry): string | undefined => {
  if (
    // deno-lint-ignore no-explicit-any
    (entry as any)["media:thumbnail"] &&
    // deno-lint-ignore no-explicit-any
    (entry as any)["media:thumbnail"].url
  ) {
    // deno-lint-ignore no-explicit-any
    return (entry as any)["media:thumbnail"].url;
  }

  return undefined;
};
