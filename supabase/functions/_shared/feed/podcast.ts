import { SupabaseClient } from "@supabase/supabase-js";
import { parseFeed } from "rss";
import { Md5 } from "std/md5";
import { FeedEntry } from "rss/types";
import { Redis } from "redis";
import { unescape } from "lodash";

import { ISource } from "../models/source.ts";
import { IItem } from "../models/item.ts";
import { uploadSourceIcon } from "./utils/uploadFile.ts";
import { IProfile } from "../models/profile.ts";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.ts";
import { log } from "../utils/log.ts";

export const getPodcastFeed = async (
  supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  if (!source.options?.podcast) {
    throw new Error("Invalid source options");
  }

  /**
   * If the `podcast` url is an Apple Podcast url we try to get the RSS feed url from it.
   */
  if (source.options.podcast.startsWith("https://podcasts.apple.com")) {
    const matches = /[^w]+\/id(\d+)/.exec(source.options?.podcast);
    if (matches && matches.length === 2) {
      const feedUrl = await getRSSFeedFromApplePodcast(matches[1]);
      source.options.podcast = feedUrl;
    }
  }

  /**
   * Get the RSS for the provided `podcast` url and parse it. If a feed doesn't contains an item we return an error.
   */
  const response = await fetchWithTimeout(source.options.podcast, {
    method: "get",
  }, 5000);
  const xml = await response.text();
  log("debug", "Podcast Response", { status: response.status, xml: xml });
  const feed = await parseFeed(xml);

  if (!feed.title.value) {
    throw new Error("Invalid feed");
  }

  /**
   * If the source doesn't have an id yet we generate one using the `generateSourceId` function. We also set the type,
   * title and link of the source. If the feed contains an image we set it as the icon of the source. We also upload the
   * icon to our CDN and set the icon of the source to the CDN url.
   */
  if (!source.id) {
    source.id = generateSourceId(
      source.userId,
      source.columnId,
      source.options.podcast,
    );
  }
  source.type = "podcast";
  source.title = feed.title.value;
  if (feed.links.length > 0) {
    source.link = feed.links[0];
  }
  if (feed.image?.url) {
    source.icon = feed.image?.url;
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

    items.push({
      id: itemId,
      userId: source.userId,
      columnId: source.columnId,
      sourceId: source.id,
      title: entry.title.value,
      link: entry.links[0].href,
      media: getMedia(entry),
      description: entry.description?.value
        ? unescape(entry.description.value)
        : undefined,
      author: entry["dc:creator"]?.join(", "),
      publishedAt: Math.floor(entry.published.getTime() / 1000),
    });
  }

  return { source, items };
};

/**
 * `getRSSFeedFromApplePodcast` returns the RSS feed url for the provided Apple Podcast id.
 */
const getRSSFeedFromApplePodcast = async (id: string): Promise<string> => {
  const resp = await fetchWithTimeout(
    `https://itunes.apple.com/lookup?id=${id}&entity=podcast`,
    { method: "get" },
    5000,
  );
  const podcast = await resp.json();

  if (
    !podcast || !podcast.results || podcast.results.length !== 1 ||
    !podcast.results[0].feedUrl
  ) {
    throw new Error("Failed to get Apple Podcast");
  }

  return podcast.results[0].feedUrl;
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
  return `podcast-${userId}-${columnId}-${new Md5().update(link).toString()}`;
};

/**
 * `generateItemId` generates a unique item id based on the source id and the identifier of the item. We use the MD5
 * algorithm for the identifier, which can be the link of the item or the id of the item.
 */
const generateItemId = (sourceId: string, identifier: string): string => {
  return `${sourceId}-${new Md5().update(identifier).toString()}`;
};

/**
 * `getMedia` returns the mp3 file for the podcast episode. For podcast rss feeds the file should be available in the
 * attachments field.
 */
const getMedia = (entry: FeedEntry): string | undefined => {
  if (entry.attachments && entry.attachments.length > 0) {
    for (const attachment of entry.attachments) {
      if (attachment.url) {
        return attachment.url;
      }
    }
  }

  return undefined;
};
