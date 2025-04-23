import { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { FeedEntry } from "https://deno.land/x/rss@1.0.0/src/types/mod.ts";
import { Redis } from "https://deno.land/x/redis@v0.32.0/mod.ts";
import { unescape } from "https://raw.githubusercontent.com/lodash/lodash/4.17.21-es/lodash.js";

import { IItem } from "../models/item.ts";
import { ISource } from "../models/source.ts";
import { feedutils } from "./utils/index.ts";
import { IProfile } from "../models/profile.ts";
import { utils } from "../utils/index.ts";

/**
 * `isBoard` checks if the provided `board` is a valid 4chan board.
 * The list of boards must be synced with the list of boards in the
 * `add_source_fourchan.dart` file in the Flutter app.
 */
const isBoard = (board: string): boolean => {
  const boards = [
    "a",
    "c",
    "w",
    "m",
    "cgl",
    "cm",
    "f",
    "n",
    "jp",
    "vt",
    "v",
    "vg",
    "vm",
    "vmg",
    "vp",
    "vr",
    "vrpg",
    "vst",
    "co",
    "g",
    "tv",
    "k",
    "o",
    "an",
    "tg",
    "sp",
    "xs",
    "pw",
    "sci",
    "his",
    "int",
    "out",
    "toy",
    "i",
    "po",
    "p",
    "ck",
    "ic",
    "wg",
    "lit",
    "mu",
    "fa",
    "3",
    "gd",
    "diy",
    "wsg",
    "qst",
    "biz",
    "trv",
    "fit",
    "x",
    "adv",
    "lgbt",
    "mlp",
    "news",
    "wsr",
    "vip",
    "b",
    "r9k",
    "pol",
    "bant",
    "soc",
    "s4s",
    "s",
    "hc",
    "hm",
    "h",
    "e",
    "u",
    "d",
    "y",
    "t",
    "hr",
    "gif",
    "aco",
    "r",
  ];

  return boards.includes(board);
};

/**
 * `isFourChan` checks if the provided `url` is a valid 4chan url. A url is
 * considered valid if it starts with `https://boards.4chan.org/`.
 */
export const isFourChanUrl = (url: string): boolean => {
  return url.startsWith("https://boards.4chan.org/");
};

export const getFourChanFeed = async (
  _supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
  feedData: string | undefined,
): Promise<{ source: ISource; items: IItem[] }> => {
  /**
   * To get a RSS feed the `source` must have a `4chan` option. This option is
   * then passed to the `getAndParseFeed` function of the `feedutils` package to
   * get the feed.
   */
  if (!source.options?.fourchan) {
    throw new feedutils.FeedValidationError("Invalid source options");
  }

  if (
    source.options.fourchan.startsWith("https://boards.4chan.org/") &&
    source.options.fourchan.endsWith("/index.rss")
  ) {
    /**
     * Do nothing since the provided options are already an 4chan RSS feed.
     */
  } else if (source.options.fourchan.startsWith("https://boards.4chan.org/")) {
    source.options.fourchan = `${source.options.fourchan}index.rss`;
  } else if (isBoard(source.options.fourchan)) {
    source.options.fourchan = `https://boards.4chan.org/${source.options.fourchan}/index.rss`;
  } else {
    throw new feedutils.FeedValidationError("Invalid source options");
  }

  const feed = await feedutils.getAndParseFeed(
    source.options.fourchan,
    source,
    feedData,
  );

  /**
   * If the feed does not have a title we consider it invalid and throw an
   * error.
   */
  if (!feed.title.value) {
    throw new Error("Invalid feed");
  }

  /**
   * If the provided source does not already have an id we generate one using
   * the `generateSourceId` function. The id of a source is a combination of the
   * user id, the column id and the link of the RSS feed. We also set the type
   * of the source to `rss` and the title to the title of the feed.
   */
  if (source.id === "") {
    source.id = await generateSourceId(
      source.userId,
      source.columnId,
      source.options.fourchan,
    );
  }
  source.type = "fourchan";
  source.title = feed.title.value;

  /**
   * If the feed contains a list of links we are using the first one as the link
   * for our source.
   */
  if (feed.links.length > 0) {
    source.link = feed.links[0];
  }

  /**
   * Now that the source contains all the required fields we can loop through
   * all the items and add them for the source.
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
    if (entry.id) {
      itemId = await generateItemId(source.id, entry.id);
    } else {
      itemId = await generateItemId(source.id, entry.links[0].href!);
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
      description: getItemDescription(entry),
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
 * - the entry does not contain a title, a link or a published / updated date.
 * - the published date of the entry is older than the last update
 *   date of the source minus 10 seconds.
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

  if (
    entry.published &&
    Math.floor(entry.published.getTime() / 1000) <= sourceUpdatedAt - 10
  ) {
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
  return `fourchan-${userId}-${columnId}-${await utils.md5(link)}`;
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
 * `getItemDescription` returns the description of an item based on the provided
 * description.
 */
const getItemDescription = (entry: FeedEntry): string | undefined => {
  if (entry.description?.value) {
    return unescape(entry.description?.value);
  }

  return undefined;
};

/**
 * `getMedia` returns a media url for the provided feed `entry` (item). To get
 * the media we check if the description of the entry contains an image.
 */
const getMedia = (entry: FeedEntry): string | undefined => {
  if (entry.description?.value) {
    const matches = /<img[^>]+\bsrc=["']([^"']+)["']/.exec(
      unescape(entry.description.value),
    );
    if (
      matches &&
      matches.length == 2 &&
      (matches[1].startsWith("https://") || matches[1].startsWith("http://")) &&
      !matches[1].endsWith(".svg")
    ) {
      return matches[1];
    }
  }

  return undefined;
};
