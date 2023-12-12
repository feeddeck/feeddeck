import { SupabaseClient } from '@supabase/supabase-js';
import { parseFeed } from 'rss';
import { Md5 } from 'std/md5';
import { FeedEntry } from 'rss/types';
import { unescape } from 'lodash';
import { Redis } from 'redis';

import { ISource } from '../models/source.ts';
import { IItem } from '../models/item.ts';
import { IProfile } from '../models/profile.ts';
import { utils } from '../utils/index.ts';
import { feedutils } from './utils/index.ts';

export const getGooglenewsFeed = async (
  _supabaseClient: SupabaseClient,
  redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  if (!source.options?.googlenews || !source.options?.googlenews?.type) {
    throw new Error('Invalid source options');
  }

  if (
    source.options.googlenews.type === 'url' && source.options.googlenews.url
  ) {
    /**
     * If the user selected type is url, we check if the url already points to
     * the Google News RSS feed, if not we convert the url to the RSS feed url
     * and use it later.
     */
    if (
      source.options.googlenews.url.startsWith('https://news.google.com/rss')
    ) {
      /**
       * Do nothing, since the user already provided an url to the Google News
       * RSS feed.
       */
    } else if (
      source.options.googlenews.url.startsWith('https://news.google.com')
    ) {
      source.options.googlenews.url = `https://news.google.com/rss${
        source.options.googlenews.url.replace('https://news.google.com', '')
      }`;
    }
  } else if (
    source.options.googlenews.type === 'search' &&
    source.options.googlenews.search && source.options.googlenews.ceid &&
    source.options.googlenews.gl && source.options.googlenews.hl
  ) {
    /**
     * If the user selected type is earch we construct the RSS feed url with the
     * search term and the user selected language and region.
     */
    source.options.googlenews.url =
      `https://news.google.com/rss/search?q=${source.options.googlenews.search}&hl=${source.options.googlenews.hl}&gl=${source.options.googlenews.gl}&ceid=${source.options.googlenews.ceid}`;
  } else {
    throw new Error('Invalid source options');
  }

  /**
   * Get the RSS for the provided `googlenews` url and parse it. If a feed
   * doesn't contains an item we return an error.
   */
  const response = await utils.fetchWithTimeout(source.options.googlenews.url, {
    method: 'get',
  }, 5000);
  const xml = await response.text();
  utils.log('debug', 'Add source', {
    sourceType: 'googlenews',
    requestUrl: source.options.googlenews.url,
    responseStatus: response.status,
  });
  const feed = await parseFeed(xml);

  if (!feed.title.value) {
    throw new Error('Invalid feed');
  }

  /**
   * Generate a source id based on the user id, column id and the normalized
   * `stackoverflow` url. Besides that we also set the source type to
   * `stackoverflow` and set the title and link for the source.
   */
  if (source.id === '') {
    source.id = generateSourceId(
      source.userId,
      source.columnId,
      source.options.googlenews.url,
    );
  }
  source.type = 'googlenews';
  source.title = feed.title.value;
  if (feed.links.length > 0) {
    source.link = feed.links[0];
  }
  source.icon = undefined;

  /**
   * Now that the source does contain all the required information we can start
   * to generate the items for the source, by looping over all the feed entries.
   */
  const items: IItem[] = [];

  for (const [index, entry] of feed.entries.entries()) {
    if (skipEntry(index, entry, source.updatedAt || 0)) {
      continue;
    }

    let author = undefined;
    // deno-lint-ignore no-explicit-any
    if (entry.source && (entry.source as any).value) {
      // deno-lint-ignore no-explicit-any
      author = (entry.source as any).value;
    }

    let media = undefined;
    if (redisClient) {
      media = await getMedia(redisClient, entry);
    }

    /**
     * Create the item object and add it to the `items` array.
     */
    items.push({
      id: generateItemId(source.id, entry.id),
      userId: source.userId,
      columnId: source.columnId,
      sourceId: source.id,
      title: entry.title!.value!,
      link: entry.links[0].href!,
      media: media,
      description: entry.description?.value
        ? unescape(entry.description.value)
        : undefined,
      author: author,
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
    (entry.links.length === 0 || !entry.links[0].href) || !entry.published
  ) {
    return true;
  }

  if (Math.floor(entry.published.getTime() / 1000) <= (sourceUpdatedAt - 10)) {
    return true;
  }

  return false;
};

/**
 * `generateSourceId` generates a unique source id based on the user id, column
 * id and the link of the RSS feed. We use the MD5 algorithm for the link to
 * generate the id.
 */
const generateSourceId = (
  userId: string,
  columnId: string,
  link: string,
): string => {
  return `googlenews-${userId}-${columnId}-${
    new Md5().update(link).toString()
  }`;
};

/**
 * `generateItemId` generates a unique item id based on the source id and the
 * identifier of the item. We use the MD5 algorithm for the identifier, which
 * can be the link of the item or the id of the item.
 */
const generateItemId = (sourceId: string, identifier: string): string => {
  return `${sourceId}-${new Md5().update(identifier).toString()}`;
};

/**
 * `getMedia` returns the icon of the source if it exists. The icon can then be
 * used within the `item.media` field. If we are not able to get an icon for the
 * source we return `undefined`.
 *
 * To get the item we have to use the `getFavicon` function against the
 * `source.url` of the `entry`. Since this function is very expensive we cache
 * the result in Redis and check if an icon for the `source.url` is already
 * cached before we call the `getFavicon` function.
 */
const getMedia = async (
  redisClient: Redis,
  entry: FeedEntry,
): Promise<string | undefined> => {
  try {
    if (entry.source?.url) {
      const cacheKey = `scraper-googlenews-${entry.source?.url}`;

      const cachedMediaURL = await redisClient.get(cacheKey);
      if (cachedMediaURL) {
        return cachedMediaURL;
      }

      const favicon = await feedutils.getFavicon(entry.source?.url);
      if (favicon && favicon.url.startsWith('https://')) {
        await redisClient.set(cacheKey, favicon.url);
        return favicon.url;
      }
    }

    return undefined;
  } catch (_) {
    return undefined;
  }
};
