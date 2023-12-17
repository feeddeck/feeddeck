import { SupabaseClient } from '@supabase/supabase-js';
import { FeedEntry } from 'rss/types';
import { Redis } from 'redis';
import { unescape } from 'lodash';

import { IItem } from '../models/item.ts';
import { ISource } from '../models/source.ts';
import { feedutils } from './utils/index.ts';
import { IProfile } from '../models/profile.ts';
import { utils } from '../utils/index.ts';

export const getMastodonFeed = async (
  supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  if (!source.options?.mastodon || source.options.mastodon.length === 0) {
    throw new feedutils.FeedValidationError('Invalid source options');
  }

  if (source.options.mastodon[0] === '@') {
    const lastIndex = source.options.mastodon.lastIndexOf('@');
    const username = source.options.mastodon.slice(0, lastIndex);
    const instance = source.options.mastodon.slice(lastIndex + 1);
    source.options.mastodon = `https://${instance}/${username}.rss`;
  } else if (source.options.mastodon[0] === '#') {
    source.options.mastodon = `https://${getInstance()}/tags/${
      source.options.mastodon.slice(1)
    }.rss`;
  } else if (
    source.options.mastodon.startsWith('https://') &&
    !source.options.mastodon.endsWith('.rss')
  ) {
    source.options.mastodon = `${source.options.mastodon}.rss`;
  } else {
    throw new feedutils.FeedValidationError('Invalid source options');
  }

  /**
   * Get the RSS for the provided Mastodon username, hashtag or url.
   */
  const feed = await feedutils.getAndParseFeed(source.options.mastodon, source);

  if (!feed.title.value) {
    throw new Error('Invalid feed');
  }

  /**
   * Generate a source id based on the user id, column id and the normalized
   * `mastodon` options. Besides that we also set the source type to `mastodon`
   * and the link for the source. In opposite to the other sources we do not use
   * the title of the feed as the title for the source, instead we are using the
   * user input as title.
   */
  if (source.id === '') {
    source.id = await generateSourceId(
      source.userId,
      source.columnId,
      source.options.mastodon,
    );
  }
  source.type = 'mastodon';
  source.title = feed.title.value;
  if (feed.links.length > 0) {
    source.link = feed.links[0];
  }

  /**
   * When the source doesn't has an icon yet and the feed contains an image we
   * add an image to the source. We also
   * upload the image to our CDN and set the `source.icon` to the path of the
   * uploaded image.
   */
  if (!source.icon && feed.image?.url) {
    source.icon = feed.image.url;
    source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
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
     * Create the item object and add it to the `items` array. Before the item
     * is created we also try to get a list of media fils (images) and videos
     * which will then be added to the `options`. Since there could be multiple
     * media files we add it to the options and not to the media field.
     *
     * The implementation to generate the options field is not ideal, but is
     * required to be compatible with older clients, where we just check if the
     * options are defined and if it contains a media field, but we do not check
     * if the media field is null.
     */
    const options: { media?: string[]; videos?: string[] } = {};
    const media = getMedia(entry);
    if (media && media.length > 0) {
      options['media'] = media;
    }
    const videos = getVideos(entry);
    if (videos && videos.length > 0) {
      options['videos'] = videos;
    }

    items.push({
      id: itemId,
      userId: source.userId,
      columnId: source.columnId,
      sourceId: source.id,
      title: '',
      link: entry.links[0].href!,
      options: Object.keys(options).length === 0 ? undefined : options,
      description: entry.description?.value
        ? unescape(entry.description.value)
        : undefined,
      author: getAuthor(entry),
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
 * - the entry does not contain a link or a published date.
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
  return `mastodon-${userId}-${columnId}-${await utils.md5(link)}`;
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
 * `getMedia` returns all images for the provided feed entry from it's
 * `media:content` field. If we could not get an image we return `undefined`.
 */
const getMedia = (entry: FeedEntry): string[] | undefined => {
  if (entry['media:content']) {
    const images = [];
    for (const media of entry['media:content']) {
      if (media.medium === 'image' && media.url) {
        images.push(media.url);
      }
    }

    return images;
  }

  return undefined;
};

/**
 * `getVideos` returns all videos for the provided feed entry from it's
 * `media:content` field. If we could not get a video we return `undefined`.
 */
const getVideos = (entry: FeedEntry): string[] | undefined => {
  if (entry['media:content']) {
    const videos = [];
    for (const media of entry['media:content']) {
      if (media.medium === 'video' && media.url) {
        videos.push(media.url);
      }
    }

    return videos;
  }

  return undefined;
};

/**
 * `getAuthor` returns the author for the provided feed entry based on the link
 * to the entry.
 */
const getAuthor = (entry: FeedEntry): string | undefined => {
  if (entry.links.length > 0 && entry.links[0].href) {
    const urlParts = entry.links[0].href.replace('https://', '').split('/');
    if (urlParts.length === 3) {
      return `${urlParts[1]}@${urlParts[0]}`;
    }
  }

  return undefined;
};

const getInstance = (): string => {
  const instances = [
    'mastodon.social',
    'fediscience.org',
    'fosstodon.org',
    'hachyderm.io',
    'hci.social',
    'indieweb.social',
    'ioc.exchange',
    'mindly.social',
    'techhub.social',
    'universeodon.com',
  ];

  return instances[Math.floor(Math.random() * instances.length)];
};
