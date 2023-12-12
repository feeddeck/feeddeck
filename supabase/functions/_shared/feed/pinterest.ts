import { SupabaseClient } from '@supabase/supabase-js';
import { parseFeed } from 'rss';
import { FeedEntry } from 'rss/types';
import { Redis } from 'redis';
import { unescape } from 'lodash';

import { IItem } from '../models/item.ts';
import { ISource } from '../models/source.ts';
import { IProfile } from '../models/profile.ts';
import { utils } from '../utils/index.ts';

const pinterestUrls = [
  'pinterest.at',
  'pinterest.ca',
  'pinterest.ch',
  'pinterest.cl',
  'pinterest.co.kr',
  'pinterest.com',
  'pinterest.com.au',
  'pinterest.com.mx',
  'pinterest.co.uk',
  'pinterest.de',
  'pinterest.dk',
  'pinterest.es',
  'pinterest.fr',
  'pinterest.ie',
  'pinterest.info',
  'pinterest.it',
  'pinterest.jp',
  'pinterest.net',
  'pinterest.nz',
  'pinterest.ph',
  'pinterest.pt',
  'pinterest.ru',
  'pinterest.se',
];

/**
 * `isPinterestUrl` checks if the provided `url` is a valid Pinterest url.
 */
export const isPinterestUrl = (url: string): boolean => {
  if (!url.startsWith('https://www.')) {
    return false;
  }

  const parsedUrl = new URL(url);

  for (const pinterestUrl of pinterestUrls) {
    if (parsedUrl.hostname.endsWith(pinterestUrl)) {
      return true;
    }
  }
  return false;
};

/**
 * `parsePinterestOption` parses the provided `input` and returns a valid
 * Pinterest RSS feed url.
 */
export const parsePinterestOption = (input?: string): string => {
  if (input) {
    /**
     * If the input starts with `@` we assume that a username or board was
     * provided in the form of `@username` or `@username/board`. We then use
     * the provided username or board to generate a valid Pinterest feed url.
     */
    if (input.length > 1 && input[0] === '@') {
      if (input.includes('/')) {
        return `https://www.pinterest.com/${input.substring(1)}.rss`;
      } else {
        return `https://www.pinterest.com/${input.substring(1)}/feed.rss`;
      }
    } else {
      /**
       * If the input does not start with `@` we assume that a valid Pinterest
       * url was provided and replace the domain with `pinterest.com`.
       *
       * If the url ends with `.rss` or `/feed.rss` we consider that already a
       * Pinterest RSS feed url was provided and use it as is.
       *
       * If the url does not end with `.rss` or `/feed.rss` we have to generate
       * the feed url, by appending `.rss` or `/feed.rss` to the url, depending
       * on if the url contains a `/` or not.
       */
      if (isPinterestUrl(input)) {
        const pinterestDotComUrl = replaceDomain(input);
        if (
          pinterestDotComUrl.endsWith('.rss') ||
          pinterestDotComUrl.endsWith('/feed.rss')
        ) {
          return pinterestDotComUrl;
        } else {
          const urlParameters = pinterestDotComUrl.replace(
            'https://www.pinterest.com/',
            '',
          ).replace(/\/$/, '');
          if (urlParameters.includes('/')) {
            return `https://www.pinterest.com/${urlParameters}.rss`;
          } else {
            return `https://www.pinterest.com/${urlParameters}/feed.rss`;
          }
        }
      } else {
        throw new Error('Invalid source options');
      }
    }
  } else {
    throw new Error('Invalid source options');
  }
};

export const getPinterestFeed = async (
  _supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  const parsedPinterestOption = parsePinterestOption(source.options?.pinterest);

  /**
   * Get the RSS for the provided `pinterest` url and parse it. If a feed
   * doesn't contains an item we return an error.
   */
  const response = await utils.fetchWithTimeout(parsedPinterestOption, {
    method: 'get',
  }, 5000);
  const xml = await response.text();
  utils.log('debug', 'Add source', {
    sourceType: 'pinterest',
    requestUrl: parsedPinterestOption,
    responseStatus: response.status,
  });
  const feed = await parseFeed(xml);

  if (!feed.title.value) {
    throw new Error('Invalid feed');
  }

  /**
   * Generate a source id based on the user id, column id and the normalized
   * `pinterest` url. Besides that we also set the source type to `pinterest`and
   * set the title and link for the source.
   */
  if (source.id === '') {
    source.id = await generateSourceId(
      source.userId,
      source.columnId,
      parsedPinterestOption,
    );
  }
  source.type = 'pinterest';
  source.title = feed.title.value;
  source.options = { pinterest: parsedPinterestOption };
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
      title: entry.title?.value ?? '',
      link: entry.links[0].href!,
      media: getMedia(entry),
      description: getItemDescription(entry),
      author: `@${
        parsedPinterestOption.replace('https://www.pinterest.com/', '')
          .replace('.rss', '').replace('/feed.rss', '').split('/')[0]
      }`,
      publishedAt: Math.floor(entry.published!.getTime() / 1000),
    });
  }

  return { source, items };
};

/**
 * `replaceDomain` replaces the domain of the Pinterest url with
 * `pinterest.com`.
 */
const replaceDomain = (url: string): string => {
  let finalUrl = url;

  for (const pinterestUrl of pinterestUrls) {
    if (pinterestUrl !== 'pinterest.com') {
      finalUrl = finalUrl.replace(pinterestUrl, 'pinterest.com');
    }
  }
  return finalUrl;
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

  if ((entry.links.length === 0 || !entry.links[0].href) || !entry.published) {
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
const generateSourceId = async (
  userId: string,
  columnId: string,
  link: string,
): Promise<string> => {
  return `pinterest-${userId}-${columnId}-${await utils.md5(link)}`;
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
