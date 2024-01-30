import { SupabaseClient } from '@supabase/supabase-js';
import { Redis } from 'redis';
import { unescape } from 'lodash';

import { IItem } from '../models/item.ts';
import { ISource } from '../models/source.ts';
import { feedutils } from './utils/index.ts';
import { IProfile } from '../models/profile.ts';
import { utils } from '../utils/index.ts';

export const getXFeed = async (
  supabaseClient: SupabaseClient,
  _redisClient: Redis | undefined,
  _profile: IProfile,
  source: ISource,
  _feedData: string | undefined,
): Promise<{ source: ISource; items: IItem[] }> => {
  if (!source.options?.x || source.options.x.length === 0) {
    throw new feedutils.FeedValidationError('Invalid source options');
  }

  if (source.options.x[0] !== '@') {
    throw new feedutils.FeedValidationError('Invalid source options');
  }

  /**
   * Get the feed for the provided X username, based on the content of the HTML
   * returned for the syndication.twitter.com url.
   */
  const response = await utils.fetchWithTimeout(
    generateFeedUrl(source.options.x),
    { method: 'get' },
    5000,
  );
  const html = await response.text();

  const matches = html.match(
    /script id="__NEXT_DATA__" type="application\/json">([^>]*)<\/script>/,
  );
  if (!matches || matches.length !== 2) {
    throw new Error('Invalid feed');
  }
  const feed = JSON.parse(matches[1]) as Feed;

  /**
   * Generate a source id based on the user id, column id and the normalized
   * `twitter` options. Besides that we also set the source type to `twitter`
   * and the link for the source. In opposite to the other sources we do not use
   * the title of the feed as the title for the source, instead we are using the
   * user input as title.
   */
  if (source.id === '') {
    source.id = await generateSourceId(
      source.userId,
      source.columnId,
      source.options.x,
    );
  }
  source.type = 'x';
  source.title = source.options.x;
  source.link = `https://twitter.com/${source.options.x.slice(1)}`;

  /**
   * When the source doesn't has an icon yet and the user requested the feed of
   * a user (string starts with `@`) we try to get an icon for the source from
   * the first item in the returned feed.
   */
  if (
    !source.icon && source.options.x[0] === '@' &&
    feed.props.pageProps.timeline.entries.length > 0 &&
    feed.props.pageProps.timeline.entries[0].content.tweet.user
      .profile_image_url_https
  ) {
    source.icon = feed.props.pageProps.timeline.entries[0].content.tweet.user
      .profile_image_url_https;
    source.icon = await feedutils.uploadSourceIcon(supabaseClient, source);
  }

  /**
   * Now that the source does contain all the required information we can start
   * to generate the items for the source, by looping over all the feed entries.
   * We only add the first 50 items from the feed, because we only keep the
   * latest 50 items for each source in our deletion logic.
   */
  const items: IItem[] = [];

  for (
    const [index, entry] of feed.props.pageProps.timeline.entries.entries()
  ) {
    if (index === 50) {
      break;
    }

    const media = getMedia(entry);

    items.push({
      id: await generateItemId(source.id, entry.content.tweet.id_str),
      userId: source.userId,
      columnId: source.columnId,
      sourceId: source.id,
      title: '',
      link: `https://twitter.com${entry.content.tweet.permalink}`,
      description: unescape(entry.content.tweet.full_text),
      author: entry.content.tweet.user.screen_name,
      options: media && media.length > 0 ? { media: media } : undefined,
      publishedAt: Math.floor(
        new Date(entry.content.tweet.created_at).getTime() / 1000,
      ),
    });
  }

  return { source, items };
};

/**
 * `generateFeedUrl` returns the url to get the Tweets of the provided username.
 * Since we check before that the input must start with an `@` we do not need to
 * check if the input is a valid username.
 */
const generateFeedUrl = (input: string): string => {
  return `https://syndication.twitter.com/srv/timeline-profile/screen-name/${
    input.slice(1)
  }?showReplies=true`;
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
  return `x-${userId}-${columnId}-${await utils.md5(link)}`;
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
 * `getMedia` returns an image for the provided feed entry. To get the images we
 * have to check the `entities.media`, `retweeted_status.media` and
 * `extended_entities.media` properties of the feed entry.
 */
const getMedia = (entry: Entry): string[] | undefined => {
  if (
    entry.content.tweet.retweeted_status?.extended_entities?.media &&
    entry.content.tweet.retweeted_status.extended_entities.media.length > 0
  ) {
    const images = [];

    for (
      const media of entry.content.tweet.retweeted_status.extended_entities
        .media
    ) {
      if (media.type === 'photo') {
        images.push(media.media_url_https);
      }
    }

    return images;
  }

  if (
    entry.content.tweet.retweeted_status?.entities?.media &&
    entry.content.tweet.retweeted_status?.entities.media.length > 0
  ) {
    const images = [];

    for (const media of entry.content.tweet.retweeted_status.entities.media) {
      if (media.type === 'photo') {
        images.push(media.media_url_https);
      }
    }

    return images;
  }

  if (
    entry.content.tweet.retweeted_status?.media &&
    entry.content.tweet.retweeted_status.media.length > 0
  ) {
    const images = [];

    for (const media of entry.content.tweet.retweeted_status.media) {
      if (media.type === 'photo') {
        images.push(media.media_url_https);
      }
    }

    return images;
  }

  if (
    entry.content.tweet.extended_entities?.media &&
    entry.content.tweet.extended_entities.media.length > 0
  ) {
    const images = [];

    for (const media of entry.content.tweet.extended_entities.media) {
      if (media.type === 'photo') {
        images.push(media.media_url_https);
      }
    }

    return images;
  }

  if (
    entry.content.tweet.entities.media &&
    entry.content.tweet.entities.media.length > 0
  ) {
    const images = [];

    for (const media of entry.content.tweet.entities.media) {
      if (media.type === 'photo') {
        images.push(media.media_url_https);
      }
    }

    return images;
  }

  return undefined;
};

/**
 * `Feed` is the interface for the returned data from Twitter for a users
 * timeline.
 */
export interface Feed {
  props: {
    pageProps: {
      timeline: {
        entries: Entry[];
      };
    };
  };
}

export interface Entry {
  content: {
    tweet: {
      created_at: string;
      entities: {
        media?: {
          media_url_https: string;
          type: string;
        }[];
      };
      full_text: string;
      id_str: string;
      permalink: string;
      user: {
        screen_name: string;
        profile_image_url_https: string;
      };
      retweeted_status?: {
        entities?: {
          media?: {
            media_url_https: string;
            type: string;
          }[];
        };
        extended_entities?: {
          media?: {
            media_url_https: string;
            type: string;
          }[];
        };
        media?: {
          media_url_https: string;
          type: string;
        }[];
      };
      extended_entities?: {
        media?: {
          media_url_https: string;
          type: string;
        }[];
      };
    };
  };
}
