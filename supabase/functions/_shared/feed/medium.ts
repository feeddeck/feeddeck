import { SupabaseClient } from '@supabase/supabase-js';
import { FeedEntry } from 'rss/types';
import { Redis } from 'redis';
import { unescape } from 'lodash';

import { IItem } from '../models/item.ts';
import { ISource } from '../models/source.ts';
import { Favicon, feedutils } from './utils/index.ts';
import { IProfile } from '../models/profile.ts';
import { utils } from '../utils/index.ts';

/**
 * `faviconFilter` is a filter function for the favicons. It filters out all the
 * favicons which are not hosted on the Medium CDN.
 */
export const faviconFilter = (favicons: Favicon[]): Favicon[] => {
  return favicons.filter((favicon) => {
    return favicon.url.startsWith('https://cdn-images');
  });
};

/**
 * `parseMediumOption` parses the provided `medium` option and returns a valid
 * Medium feed url. The `medium` option can be a Medium url, a Medium tag or a
 * Medium username. If the provided option is not valid we throw an error.
 */
export const parseMediumOption = (input?: string): string => {
  if (input) {
    if (input.length > 1 && input[0] === '#') {
      return `https://medium.com/feed/tag/${input.slice(1)}`;
    } else if (input.length > 1 && input[0] === '@') {
      return `https://medium.com/feed/${input}`;
    } else {
      const parsedUrl = new URL(input);
      const parsedHostname = parsedUrl.hostname.split('.');
      if (
        parsedHostname.length === 2 && parsedHostname[0] === 'medium' &&
        parsedHostname[1] === 'com'
      ) {
        return `https://medium.com/feed/${
          input.replace('https://medium.com/', '').replace('feed/', '')
        }`;
      } else if (
        parsedHostname.length === 3 && parsedHostname[1] === 'medium' &&
        parsedHostname[2] === 'com'
      ) {
        return `https://${parsedHostname[0]}.medium.com/feed`;
      } else {
        throw new feedutils.FeedValidationError('Invalid source options');
      }
    }
  } else {
    throw new feedutils.FeedValidationError('Invalid source options');
  }
};

/**
 * `isMediumUrl` checks if the provided `url` is a valid Medium url. A url is
 * considered valid if the hostname starts with `medium.com`.
 */
export const isMediumUrl = (url: string): boolean => {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname.endsWith('medium.com');
};

export const getMediumFeed = async (
  supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  const parsedMediumOption = parseMediumOption(source.options?.medium);

  /**
   * Get the RSS for the provided `medium` url and parse it. If a feed doesn't
   * contains a title we return an error.
   */
  const feed = await feedutils.getAndParseFeed(parsedMediumOption, source);

  if (!feed.title.value) {
    throw new Error('Invalid feed');
  }

  /**
   * When the source doesn't has an id yet we try to get an favicon from the
   * feed for the source. We check if the source has an id because we only want
   * to try to get the favicon when the source is created the first time.
   */
  if (source.id === '' && feed.links.length > 0) {
    const favicon = await feedutils.getFavicon(feed.links[0], faviconFilter);

    if (favicon && favicon.url.startsWith('https://')) {
      source.icon = favicon.url;
      source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
    }
  }

  /**
   * Generate a source id based on the user id, column id and the normalized
   * `medium` url. Besides that we also set the source type to `medium` and set
   * the title and link for the source.
   */
  if (source.id === '') {
    source.id = await generateSourceId(
      source.userId,
      source.columnId,
      parsedMediumOption,
    );
  }
  source.type = 'medium';
  source.title = feed.title.value;
  source.options = { medium: parsedMediumOption };
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
    let itemId = '';
    if (entry.id != '') {
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
      description: getItemDescription(entry),
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
 *   last 50 items of each source in our
 *   delete logic.
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

  /**
   * Skip entries which might be spam. To detect possible spam, we check the
   * title of the entry against a list of words, when the title contains 3 or
   * more of these words we consider the entry as spam.
   */
  const filterWords = [
    'cash',
    'loan',
    'customer',
    'care',
    'helpline',
    'number',
    'patti',
    'toll',
    'free',
    'paisa',
    'call',
    'kup',
    'niewykrywalnych',
    'fałszywych',
    'pieniędzy',
    'whatsapp',
    'money',
  ];
  const title = entry.title.value.toLowerCase();
  let score = 0;

  for (const word of filterWords) {
    if (title.includes(word)) {
      score += 1;
    }
  }
  if (score >= 3) {
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
  return `medium-${userId}-${columnId}-${await utils.md5(link)}`;
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
 * `getItemDescription` returns the description of the item. If the item has a
 * `content` property we use that as our description, otherwise we use the
 * `description` property.
 */
const getItemDescription = (entry: FeedEntry): string | undefined => {
  if (entry.content?.value) {
    return unescape(entry.content.value);
  }

  if (entry.description?.value) {
    return unescape(entry.description.value);
  }

  return undefined;
};

/**
 * `getMedia` returns an image for the provided feed entry from it's content or
 * description. If we could not get an image from the content or description we
 * return `undefined`.
 */
const getMedia = (entry: FeedEntry): string | undefined => {
  if (entry.content?.value) {
    const matches = /<img[^>]+\bsrc=["']([^"']+)["']/.exec(
      unescape(entry.content.value),
    );
    if (matches && matches.length == 2 && matches[1].startsWith('https://')) {
      return matches[1];
    }
  }

  if (entry.description?.value) {
    const matches = /<img[^>]+\bsrc=["']([^"']+)["']/.exec(
      unescape(entry.description.value),
    );
    if (matches && matches.length == 2 && matches[1].startsWith('https://')) {
      return matches[1];
    }
  }

  return undefined;
};
