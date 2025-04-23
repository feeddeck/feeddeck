import { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { FeedEntry } from "https://deno.land/x/rss@1.0.0/src/types/mod.ts";
import { Redis } from "https://deno.land/x/redis@v0.32.0/mod.ts";
import { unescape } from "https://raw.githubusercontent.com/lodash/lodash/4.17.21-es/lodash.js";

import { IItem } from "../models/item.ts";
import { ISource } from "../models/source.ts";
import { feedutils } from "./utils/index.ts";
import { IProfile } from "../models/profile.ts";
import { FEEDDECK_SOURCE_YOUTUBE_API_KEY } from "../utils/constants.ts";
import { utils } from "../utils/index.ts";

/**
 * `isYoutubeUrl` checks if the provided `url` is a valid Youtube url. A url is
 * considered valid if it starts with `https://www.youtube.com/` or
 * `https://m.youtube.com/`.
 */
export const isYoutubeUrl = (url: string): boolean => {
  return (
    url.startsWith("https://www.youtube.com/") ||
    url.startsWith("https://m.youtube.com/") ||
    url.startsWith("https://youtube.com/")
  );
};

export const getYoutubeFeed = async (
  supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
  feedData: string | undefined,
): Promise<{ source: ISource; items: IItem[] }> => {
  if (!source.options?.youtube) {
    throw new feedutils.FeedValidationError("Invalid source options");
  }

  if (source.options.youtube.startsWith("https://www.youtube.com/channel/")) {
    source.options.youtube = `https://www.youtube.com/feeds/videos.xml?channel_id=${source.options.youtube
      .split("?")[0]
      .replace("https://www.youtube.com/channel/", "")}`;
  } else if (
    source.options.youtube.startsWith("https://m.youtube.com/channel/")
  ) {
    source.options.youtube = `https://m.youtube.com/feeds/videos.xml?channel_id=${source.options.youtube
      .split("?")[0]
      .replace("https://m.youtube.com/channel/", "")}`;
  } else if (
    source.options.youtube.startsWith(
      "https://www.youtube.com/feeds/videos.xml?channel_id=",
    )
  ) {
    /**
     * Do nothing, since the url is already in the correct format.
     */
  } else if (isYoutubeUrl(source.options.youtube)) {
    const channelId = await getChannelId(source.options.youtube);
    if (channelId) {
      source.options.youtube = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    } else {
      throw new feedutils.FeedValidationError("Invalid source options");
    }
  } else {
    throw new feedutils.FeedValidationError("Invalid source options");
  }

  /**
   * Get the RSS for the provided `youtube` url and parse it. If a feed doesn't
   * contains a title we return an error.
   */
  const feed = await feedutils.getAndParseFeed(
    source.options.youtube,
    source,
    feedData,
  );

  if (!feed.title.value) {
    throw new Error("Invalid feed");
  }

  /**
   * When the source doesn't has an id yet we try to get an favicon from the
   * feed for the source. We check if the source has an id because we only want
   * to try to get the favicon when the source is created the first time.
   */
  if (!source.id && !source.icon) {
    source.icon = await getChannelIcon(
      source.options.youtube.replace(
        "https://www.youtube.com/feeds/videos.xml?channel_id=",
        "",
      ),
    );
    source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
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
      source.options.youtube,
    );
  }
  source.type = "youtube";
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
     * Create the item object and add it to the `items` array. Before the item
     * is added we also try to upload the media of the item to our CDN and set
     * the `item.media` to the URL of the uploaded media.
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
      author: feed.author?.name,
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
  return `youtube-${userId}-${columnId}-${await utils.md5(link)}`;
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
 * not contain a description we return `undefined`.
 */
const getDescription = (entry: FeedEntry): string | undefined => {
  if (entry["media:group"] && entry["media:group"]["media:description"]) {
    return unescape(entry["media:group"]["media:description"].value);
  }

  return undefined;
};

/**
 * `getMedia` returns the media for a feed entry. If the entry does not contain
 * a media we return `undefined`. The media is the thumbnail of the video and
 * not the video itself, because the video can be get using the entry link.
 */
const getMedia = (entry: FeedEntry): string | undefined => {
  if (
    entry["media:group"] &&
    // deno-lint-ignore no-explicit-any
    (entry["media:group"] as any)["media:thumbnail"]
  ) {
    // deno-lint-ignore no-explicit-any
    return (entry["media:group"] as any)["media:thumbnail"].url;
  }

  return undefined;
};

/**
 * `getChannelId` returns the channel id based on the given url. For some
 * YouTube urls we have to get the complete HTML content of the site and grep
 * for the RSS feed link. Based on the RSS link we can then get the channel id.
 */
const getChannelId = async (url: string): Promise<string | undefined> => {
  try {
    const response = await utils.fetchWithTimeout(url, { method: "get" }, 5000);
    const html = await response.text();
    const match = html.match(
      /"https:\/\/www.youtube.com\/feeds\/videos.xml\?channel_id\=(.*?)"/,
    );
    if (match && match.length === 2) {
      return match[1];
    }
    return undefined;
  } catch (_) {
    return undefined;
  }
};

/**
 * `getChannelIcon` returns the icon for a channel with the provided
 * `channelId`.
 *
 * This function only works when a valid API key for the YouTube API was
 * provided. If no API key was provided this function will return `undefined`
 * and the source will not have an proper icon.
 */
const getChannelIcon = async (
  channelId: string,
): Promise<string | undefined> => {
  try {
    const response = await utils.fetchWithTimeout(
      `https://www.googleapis.com/youtube/v3/channels?id=${channelId}&part=id%2Csnippet&maxResults=1&key=${FEEDDECK_SOURCE_YOUTUBE_API_KEY}`,
      { method: "get" },
      5000,
    );
    const json = await response.json();

    if (
      json.items &&
      json.items.length === 1 &&
      json.items[0].snippet &&
      json.items[0].snippet.thumbnails &&
      json.items[0].snippet.thumbnails.default &&
      json.items[0].snippet.thumbnails.default.url
    ) {
      return json.items[0].snippet.thumbnails.default.url;
    }
  } catch (_) {
    return undefined;
  }
};
