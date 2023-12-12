import { SupabaseClient } from '@supabase/supabase-js';
import { parseFeed } from 'rss';
import { Md5 } from 'std/md5';
import { FeedEntry } from 'rss/types';
import { Redis } from 'redis';
import { unescape } from 'lodash';

import { ISource } from '../models/source.ts';
import { IItem } from '../models/item.ts';
import { feedutils } from './utils/index.ts';
import { IProfile } from '../models/profile.ts';
import { utils } from '../utils/index.ts';

export const getPodcastFeed = async (
  supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  if (!source.options?.podcast) {
    throw new Error('Invalid source options');
  }

  /**
   * If the `podcast` url is an Apple Podcast url we try to get the RSS feed url
   * from it.
   */
  if (source.options.podcast.startsWith('https://podcasts.apple.com')) {
    const matches = /[^w]+\/id(\d+)/.exec(source.options?.podcast);
    if (matches && matches.length === 2) {
      const feedUrl = await getRSSFeedFromApplePodcast(matches[1]);
      source.options.podcast = feedUrl;
    }
  }

  /**
   * Get the RSS for the provided `podcast` url and parse it. If a feed doesn't
   * contains an item we return an error.
   */
  const response = await utils.fetchWithTimeout(source.options.podcast, {
    method: 'get',
  }, 5000);
  const xml = await response.text();
  utils.log('debug', 'Add source', {
    sourceType: 'podcast',
    requestUrl: source.options.podcast,
    responseStatus: response.status,
  });
  const feed = await parseFeed(xml);

  if (!feed.title.value) {
    throw new Error('Invalid feed');
  }

  /**
   * If the source doesn't have an id yet we generate one using the
   * `generateSourceId` function. We also set the type, title and link of the
   * source. If the feed contains an image we set it as the icon of the source.
   * We also upload the icon to our CDN and set the icon of the source to the
   * CDN url.
   */
  if (!source.id) {
    source.id = generateSourceId(
      source.userId,
      source.columnId,
      source.options.podcast,
    );
  }
  source.type = 'podcast';
  source.title = feed.title.value;
  if (feed.links.length > 0) {
    source.link = feed.links[0];
  }
  if (!source.icon) {
    if (feed.image?.url) {
      source.icon = feed.image.url;
      source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
      // deno-lint-ignore no-explicit-any
    } else if ((feed as any)['itunes:image']?.href) {
      // deno-lint-ignore no-explicit-any
      source.icon = (feed as any)['itunes:image'].href;
      source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
    }
  }

  /**
   * Now that the source does contain all the required information we can start
   * to generate the items for the source, by looping over all the feed entries.
   * We only add the first 50 items from the feed, because we only keep the
   * latest 50 items for each source in our deletion logic.
   */
  const items: IItem[] = [];

  for (const [index, entry] of feed.entries.entries()) {
    if (skipEntry(index, entry, source.updatedAt || 0)) {
      continue;
    }

    const media = getMedia(entry);
    if (!media) {
      continue;
    }

    /**
     * Each item need a unique id which is generated using the `generateItemId`
     * function. The id is a combination of the source id and the id of the
     * entry or if the entry does not have an id we use the link of the first
     * link of the entry.
     */
    let itemId = '';
    if (entry.id != '') {
      itemId = generateItemId(source.id, entry.id);
    } else if (entry.links && entry.links.length > 0 && entry.links[0].href) {
      itemId = generateItemId(source.id, entry.links[0].href);
    } else {
      continue;
    }

    items.push({
      id: itemId,
      userId: source.userId,
      columnId: source.columnId,
      sourceId: source.id,
      title: entry.title!.value!,
      link: entry.links && entry.links.length > 0 && entry.links[0].href
        ? entry.links[0].href
        : media,
      media: media,
      description: entry.description?.value
        ? unescape(entry.description.value)
        : undefined,
      author: entry['dc:creator']?.join(', '),
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
 * - the entry does not contain a title or a published date.
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

  if (!entry.title?.value || !entry.published) {
    return true;
  }

  if (Math.floor(entry.published.getTime() / 1000) <= (sourceUpdatedAt - 10)) {
    return true;
  }

  return false;
};

/**
 * `getRSSFeedFromApplePodcast` returns the RSS feed url for the provided Apple
 * Podcast id.
 */
const getRSSFeedFromApplePodcast = async (id: string): Promise<string> => {
  const resp = await utils.fetchWithTimeout(
    `https://itunes.apple.com/lookup?id=${id}&entity=podcast`,
    { method: 'get' },
    5000,
  );
  const podcast = await resp.json();

  if (
    !podcast || !podcast.results || podcast.results.length !== 1 ||
    !podcast.results[0].feedUrl
  ) {
    throw new Error('Failed to get Apple Podcast');
  }

  return podcast.results[0].feedUrl;
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
  return `podcast-${userId}-${columnId}-${new Md5().update(link).toString()}`;
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
 * `getMedia` returns the mp3 file for the podcast episode. For podcast rss
 * feeds the file should be available in the attachments field.
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
