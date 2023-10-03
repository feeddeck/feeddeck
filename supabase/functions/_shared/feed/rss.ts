import { SupabaseClient } from "@supabase/supabase-js";
import { parseFeed } from "rss";
import { Md5 } from "std/md5";
import { FeedEntry } from "rss/types";
import { Redis } from "redis";
import { unescape } from "lodash";

import { IItem } from "../models/item.ts";
import { ISource } from "../models/source.ts";
import { getFavicon } from "./utils/getFavicon.ts";
import { uploadSourceIcon } from "./utils/uploadFile.ts";
import { IProfile } from "../models/profile.ts";
import { fetchWithTimeout } from "../utils/fetchWithTimeout.ts";
import { log } from "../utils/log.ts";

export const getRSSFeed = async (
  supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  /**
   * To get a RSS feed the `source` must have a `rss` option. This option is then passed to the `parseFeed` function of
   * the `rss` package to get the feed.
   */
  if (!source.options?.rss) {
    throw new Error("Invalid source options");
  }

  const response = await fetchWithTimeout(
    source.options.rss,
    { method: "get" },
    5000,
  );
  const xml = await response.text();
  log("debug", "Add source", {
    sourceType: "rss",
    requestUrl: source.options.rss,
    responseStatus: response.status,
  });
  const feed = await parseFeed(xml);

  /**
   * If the feed does not have a title we consider it invalid and throw an error.
   */
  if (!feed.title.value) {
    throw new Error("Invalid feed");
  }

  /**
   * If the provided source does not already have an id we generate one using the `generateSourceId` function. The id of
   * a source is a combination of the user id, the column id and the link of the RSS feed. We also set the type of the
   * source to `rss` and the title to the title of the feed.
   */
  if (source.id === "") {
    source.id = generateSourceId(
      source.userId,
      source.columnId,
      source.options.rss,
    );
  }
  source.type = "rss";
  source.title = feed.title.value;

  /**
   * If the feed contains a list of links we are using the first one as the link for our source.
   */
  if (feed.links.length > 0) {
    source.link = feed.links[0];
  }

  /**
   * If the source doesn't already contain an icon, we try to get an icon via the `source.link` via our `getFavicon`
   * function. If that fails we try to use the icon or image of the feed. If we are able to get an icon we upload it to
   * our CDN and set the `source.icon` to the URL of the uploaded icon.
   *
   * Note: We try to use the `getFavicon` function first, because the most RSS feeds do not contain a proper icon so
   * that a favicon looks better than the feed icon / image within the UI.
   */
  if (!source.icon) {
    if (source.link) {
      const favicon = await getFavicon(source.link);
      if (favicon && favicon.url.startsWith("https://")) {
        source.icon = favicon.url;
      }
    }

    if (!source.icon) {
      if (feed.icon && feed.icon.startsWith("https://")) {
        source.icon = feed.icon;
      } else if (feed.image?.url && feed.image.url.startsWith("https://")) {
        source.icon = feed.image?.url;
      }
    }

    source.icon = await uploadSourceIcon(supabaseClient, source);
  }

  /**
   * Now that the source contains all the required fields we can loop through all the items and add them for the source.
   * We only add the first 50 items from the feed, because we only keep the latest 50 items for each source in our
   * deletion logic.
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
      (entry.links.length === 0 || !entry.links[0].href) ||
      (!entry.published && !entry.updated)
    ) {
      continue;
    }

    /**
     * Each item need a unique id which is generated using the `generateItemId` function. The id is a combination of the
     * source id and the id of the entry or if the entry does not have an id we use the link of the first link of the
     * entry.
     */
    let itemId = "";
    if (entry.id) {
      itemId = generateItemId(source.id, entry.id);
    } else {
      itemId = generateItemId(source.id, entry.links[0].href);
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
      author: entry.author?.name,
      publishedAt: entry.published
        ? Math.floor(entry.published.getTime() / 1000)
        : entry.updated
        ? Math.floor(entry.updated.getTime() / 1000)
        : Math.floor(new Date().getTime() / 1000),
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
  return `rss-${userId}-${columnId}-${new Md5().update(link).toString()}`;
};

/**
 * `generateItemId` generates a unique item id based on the source id and the identifier of the item. We use the MD5
 * algorithm for the identifier, which can be the link of the item or the id of the item.
 */
const generateItemId = (sourceId: string, identifier: string): string => {
  return `${sourceId}-${new Md5().update(identifier).toString()}`;
};

/**
 * `getItemDescription` returns the description of an item based on the provided description and content. In the first
 * step we try to use the description of the items as our description. If that is not available, we try to use the
 * content. If that is not available, we return undefined. We also remove all HTML tags from the description and content
 * before returning it.
 */
const getItemDescription = (entry: FeedEntry): string | undefined => {
  if (entry.description?.value) {
    return unescape(entry.description?.value.replace(/(<([^>]+)>)/ig, ""));
  }

  if (entry.content?.value) {
    return unescape(entry.content?.value.replace(/(<([^>]+)>)/ig, ""));
  }

  return undefined;
};

/**
 * `getMedia` returns a media url for the provided feed `entry` (item). To get the media we check all the different
 * media tags that are available in the feed. If we find a media tag with a medium of `image` we return the url of that
 * tag. If we don't find any media tags with a medium of `image` we check the attachements of the feed entry. If we do
 * not find an image there we finally check if the description or content contains an `img` tag to use it for the media
 * field.
 */
const getMedia = (entry: FeedEntry): string | undefined => {
  if (entry["media:content"] && entry["media:content"].length > 0) {
    for (const media of entry["media:content"]) {
      if (
        media.medium && media.medium === "image" && media.url &&
        media.url.startsWith("https://")
      ) {
        return media.url;
      }
    }
  }

  if (
    entry["media:thumbnails"] && entry["media:thumbnails"].url &&
    entry["media:thumbnails"].url.startsWith("https://")
  ) {
    return entry["media:thumbnails"].url;
  }

  if (entry["media:group"] && entry["media:group"].length > 0) {
    for (const mediaGroup of entry["media:group"]) {
      if (mediaGroup["media:content"]) {
        for (const mediaContent of mediaGroup["media:content"]) {
          if (
            mediaContent.medium && mediaContent.medium === "image" &&
            mediaContent.url &&
            mediaContent.url.startsWith("https://")
          ) {
            return mediaContent.url;
          }
        }
      }
    }
  }

  if (entry.attachments && entry.attachments.length > 0) {
    for (const attachment of entry.attachments) {
      if (
        attachment.mimeType && attachment.mimeType.startsWith("image/") &&
        attachment.url &&
        attachment.url.startsWith("https://")
      ) {
        return attachment.url;
      }
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

  if (entry.content?.value) {
    const matches = /<img[^>]+\bsrc=["']([^"']+)["']/.exec(
      entry.content?.value,
    );
    if (matches && matches.length == 2 && matches[1].startsWith("https://")) {
      return matches[1];
    }
  }

  return undefined;
};
