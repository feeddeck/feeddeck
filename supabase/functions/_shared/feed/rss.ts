import { SupabaseClient } from '@supabase/supabase-js';
import { Feed } from 'rss';
import { FeedEntry } from 'rss/types';
import { Redis } from 'redis';
import { unescape } from 'lodash';
import * as cheerio from 'cheerio';

import { IItem } from '../models/item.ts';
import { ISource } from '../models/source.ts';
import { feedutils } from './utils/index.ts';
import { IProfile } from '../models/profile.ts';
import { utils } from '../utils/index.ts';

export const getRSSFeed = async (
  supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  /**
   * To get a RSS feed the `source` must have a `rss` option. This option is
   * then passed to the `parseFeed` function of the `rss` package to get the
   * feed.
   */
  if (!source.options?.rss) {
    throw new feedutils.FeedValidationError('Invalid source options');
  }

  let feed = await getFeed(source);
  if (!feed) {
    utils.log(
      'debug',
      'Failed to get RSS feed, try to get RSS feed from website',
      { requestUrl: source.options.rss },
    );
    feed = await getFeedFromWebsite(source);
    if (!feed) {
      throw new Error('Failed to get RSS feed');
    }
  }

  /**
   * If the feed does not have a title we consider it invalid and throw an
   * error.
   */
  if (!feed.title.value) {
    throw new Error('Invalid feed');
  }

  /**
   * If the provided source does not already have an id we generate one using
   * the `generateSourceId` function. The id of a source is a combination of the
   * user id, the column id and the link of the RSS feed. We also set the type
   * of the source to `rss` and the title to the title of the feed.
   */
  if (source.id === '') {
    source.id = await generateSourceId(
      source.userId,
      source.columnId,
      source.options.rss,
    );
  }
  source.type = 'rss';
  source.title = feed.title.value;

  /**
   * If the feed contains a list of links we are using the first one as the link
   * for our source.
   */
  if (feed.links.length > 0) {
    source.link = feed.links[0];
  }

  /**
   * If the source doesn't already contain an icon, we try to get an icon via
   * the `source.link` via our `getFavicon` function. If that fails we try to
   * use the icon or image of the feed. If we are able to get an icon we upload
   * it to our CDN and set the `source.icon` to the URL of the uploaded icon.
   *
   * Note: We try to use the `getFavicon` function first, because the most RSS
   * feeds do not contain a proper icon so that a favicon looks better than the
   * feed icon / image within the UI.
   */
  if (!source.icon) {
    if (source.link) {
      const favicon = await feedutils.getFavicon(source.link);
      if (favicon && favicon.url.startsWith('https://')) {
        source.icon = favicon.url;
      }
    }

    if (!source.icon) {
      if (feed.icon && feed.icon.startsWith('https://')) {
        source.icon = feed.icon;
      } else if (feed.image?.url && feed.image.url.startsWith('https://')) {
        source.icon = feed.image?.url;
      }
    }

    source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
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
    let itemId = '';
    if (entry.id) {
      itemId = await generateItemId(source.id, entry.id);
    } else {
      itemId = await generateItemId(source.id, entry.links[0].href!);
    }

    /**
     * If the entry contains a video we add it to the item options.
     */
    const video = getVideo(entry);

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
      options: video ? { video: video } : undefined,
      description: getItemDescription(entry),
      author: entry.author?.name,
      publishedAt: entry.published
        ? Math.floor(entry.published.getTime() / 1000)
        : entry.updated
        ? Math.floor(entry.updated.getTime() / 1000)
        : entry['dc:date']
        ? getDCDateTimestamp(entry['dc:date'])
        : Math.floor(new Date().getTime() / 1000),
    });
  }

  return { source, items };
};

/**
 * `getFeed` is a helper function to get a RSS feed for a source. It returns
 * the feed or undefined if the request failed or the returned response could
 * not be parsed as a feed.
 */
const getFeed = async (source: ISource): Promise<Feed | undefined> => {
  try {
    const feed = await feedutils.getAndParseFeed(source.options!.rss!, source);
    return feed;
  } catch (_) {
    return undefined;
  }
};

/**
 * `getFeedFromWebsite` is a helper function to get a RSS feed from a website.
 * This function can be used to get the RSS feed after the call to `getFeed`
 * failed. This could happen when a user provided an url to a website instead of
 * a RSS feed.
 *
 * In the function we are checking if there is a
 * `<link rel="alternate" type="application/rss+xml" href="RSS_FEED_URL">` tag
 * on the website. If this is the case we are using the `href` attribute and try
 * to get the RSS feed from that url via the `getFeed` function.
 *
 * When we construct the RSS feed url we have to ensure, that the url is
 * absolute.
 */
const getFeedFromWebsite = async (
  source: ISource,
): Promise<Feed | undefined> => {
  try {
    const response = await utils.fetchWithTimeout(
      source.options!.rss!,
      { method: 'get' },
      5000,
    );
    const html = await response.text();

    const $ = cheerio.load(html);
    let rssLink = $('link[type="application/rss+xml"]').attr('href');
    if (!rssLink) {
      rssLink = $('link[type="application/atom+xml"]').attr('href');
      if (!rssLink) {
        rssLink = $('link[type="application/rdf+xml"]').attr('href');
        if (!rssLink) {
          return undefined;
        }
      }
    }
    source.options!.rss = new URL(rssLink, source.options!.rss!).href;

    return getFeed(source);
  } catch (_) {
    return undefined;
  }
};

/**
 * `skipEntry` is used to determin if an entry should be skipped or not. When a
 * entry in the RSS feed is skipped it will not be added to the database. An
 * entry will be skipped when
 * - it is not within the first 50 entries of the feed, because we only keep the
 *   last 50 items of each source in our delete logic.
 * - the entry does not contain a title, a link or a published / updated date.
 * - the published / updated date of the entry is older than the last update
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
    (entry.links.length === 0 || !entry.links[0].href) ||
    (!entry.published && !entry.updated && !entry['dc:date'])
  ) {
    return true;
  }

  if (
    entry.published &&
    Math.floor(entry.published.getTime() / 1000) <= (sourceUpdatedAt - 10)
  ) {
    return true;
  } else if (
    entry.updated &&
    Math.floor(entry.updated.getTime() / 1000) <= (sourceUpdatedAt - 10)
  ) {
    return true;
  } else if (
    entry['dc:date'] &&
    getDCDateTimestamp(entry['dc:date']) <= (sourceUpdatedAt - 10)
  ) {
    return true;
  }

  return false;
};

/**
 * `getDCDateTimestamp` is a helper function to get the timestamp of a `dc:date`
 * tag. The `dc:date` tag can either be a `Date` object or an object with a
 * `value` property which is a `Date` object.
 */
const getDCDateTimestamp = (dcdate: Date | { value: Date }): number => {
  if (dcdate instanceof Date) {
    return Math.floor(dcdate.getTime() / 1000);
  } else {
    return Math.floor(dcdate.value.getTime() / 1000);
  }
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
  return `rss-${userId}-${columnId}-${await utils.md5(link)}`;
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
 * description and content. In the first step we try to use the description of
 * the items as our description. If that is not available, we try to use the
 * content. If that is not available, we return undefined. We also remove all
 * HTML tags from the description and content before returning it.
 */
const getItemDescription = (entry: FeedEntry): string | undefined => {
  if (entry.description?.value) {
    return unescape(entry.description?.value.replace(/(<([^>]+)>)/ig, ''));
  }

  if (entry.content?.value) {
    return unescape(entry.content?.value.replace(/(<([^>]+)>)/ig, ''));
  }

  return undefined;
};

/**
 * `getMedia` returns a media url for the provided feed `entry` (item). To get
 * the media we check all the different media tags that are available in the
 * feed. If we find a media tag with a medium of `image` we return the url of
 * that tag. If we don't find any media tags with a medium of `image` we check
 * the attachements of the feed entry. If we do not find an image there we
 * finally check if the description or content contains an `img` tag to use it
 * for the media field.
 */
const getMedia = (entry: FeedEntry): string | undefined => {
  if (entry['media:content'] && entry['media:content'].length > 0) {
    for (const media of entry['media:content']) {
      if (
        media.medium && media.medium === 'image' && media.url &&
        media.url.startsWith('https://') && !media.url.endsWith('.svg')
      ) {
        return media.url;
      }
    }
  }

  if (
    entry['media:thumbnails'] && entry['media:thumbnails'].url &&
    entry['media:thumbnails'].url.startsWith('https://')
  ) {
    return entry['media:thumbnails'].url;
  }

  if (entry['media:group'] && entry['media:group'].length > 0) {
    for (const mediaGroup of entry['media:group']) {
      if (mediaGroup['media:content']) {
        for (const mediaContent of mediaGroup['media:content']) {
          if (
            mediaContent.medium && mediaContent.medium === 'image' &&
            mediaContent.url &&
            mediaContent.url.startsWith('https://') &&
            !mediaContent.url.endsWith('.svg')
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
        attachment.mimeType && attachment.mimeType.startsWith('image/') &&
        attachment.url &&
        attachment.url.startsWith('https://') &&
        !attachment.url.endsWith('.svg')
      ) {
        return attachment.url;
      }
    }
  }

  if (entry.description?.value) {
    const matches = /<img[^>]+\bsrc=["']([^"']+)["']/.exec(
      unescape(entry.description.value),
    );
    if (
      matches && matches.length == 2 && matches[1].startsWith('https://') &&
      !matches[1].endsWith('.svg')
    ) {
      return matches[1];
    }
  }

  if (entry.content?.value) {
    const matches = /<img[^>]+\bsrc=["']([^"']+)["']/.exec(
      unescape(entry.content.value),
    );
    if (
      matches && matches.length == 2 && matches[1].startsWith('https://') &&
      !matches[1].endsWith('.svg')
    ) {
      return matches[1];
    }
  }

  return undefined;
};

/**
 * `getVideo` checks if the attachments of the feed entry contains a video. If
 * that is the case we return the url of the video.
 */
const getVideo = (entry: FeedEntry): string | undefined => {
  if (entry.attachments && entry.attachments.length > 0) {
    for (const attachment of entry.attachments) {
      if (
        attachment.mimeType && attachment.mimeType.startsWith('video/') &&
        attachment.url &&
        attachment.url.startsWith('https://')
      ) {
        return attachment.url;
      }
    }
  }

  return undefined;
};
