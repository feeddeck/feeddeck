import { SupabaseClient } from '@supabase/supabase-js';
import { Redis } from 'redis';

import { IItem } from '../models/item.ts';
import { ISource } from '../models/source.ts';
import { getMediumFeed, isMediumUrl } from './medium.ts';
import { getRSSFeed } from './rss.ts';
import { getPodcastFeed } from './podcast.ts';
import { getTumblrFeed, isTumblrUrl } from './tumblr.ts';
import { getStackoverflowFeed } from './stackoverflow.ts';
import { getGooglenewsFeed } from './googlenews.ts';
import { getYoutubeFeed, isYoutubeUrl } from './youtube.ts';
import { getRedditFeed, isRedditUrl } from './reddit.ts';
import { getGithubFeed } from './github.ts';
import { IProfile } from '../models/profile.ts';
import { getNitterFeed } from './nitter.ts';
import { getMastodonFeed } from './mastodon.ts';
// import { getXFeed } from './x.ts';

/**
 * `getFeed` returns a feed which consist of a source and a list of items for
 * the provided `source`. Based on the `type` of the provided source it will use
 * the appropriate function to get the feed.
 */
export const getFeed = async (
  supabaseClient: SupabaseClient,
  redisClient: Redis | undefined,
  profile: IProfile,
  source: ISource,
): Promise<{ source: ISource; items: IItem[] }> => {
  switch (source.type) {
    case 'github':
      return await getGithubFeed(supabaseClient, redisClient, profile, source);
    case 'googlenews':
      return await getGooglenewsFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
      );
    case 'mastodon':
      return await getMastodonFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
      );
    case 'medium':
      return await getMediumFeed(supabaseClient, redisClient, profile, source);
    case 'nitter':
      return await getNitterFeed(supabaseClient, redisClient, profile, source);
    case 'podcast':
      return await getPodcastFeed(supabaseClient, redisClient, profile, source);
    case 'reddit':
      return await getRedditFeed(supabaseClient, redisClient, profile, source);
    case 'rss':
      try {
        if (source.options?.rss && isMediumUrl(source.options.rss)) {
          return await getMediumFeed(supabaseClient, redisClient, profile, {
            ...source,
            options: { medium: source.options.rss },
          });
        }

        if (source.options?.rss && isRedditUrl(source.options.rss)) {
          return await getTumblrFeed(supabaseClient, redisClient, profile, {
            ...source,
            options: { reddit: source.options.reddit },
          });
        }

        if (source.options?.rss && isTumblrUrl(source.options.rss)) {
          return await getTumblrFeed(supabaseClient, redisClient, profile, {
            ...source,
            options: { tumblr: source.options.rss },
          });
        }

        if (source.options?.rss && isYoutubeUrl(source.options.rss)) {
          return await getYoutubeFeed(supabaseClient, redisClient, profile, {
            ...source,
            options: { youtube: source.options.rss },
          });
        }
      } catch (_) {
        /**
         * We ignore any errors at this point and try to use the general
         * `getRSSFeed` function instead.
         */
      }

      return await getRSSFeed(supabaseClient, redisClient, profile, source);
    case 'stackoverflow':
      return await getStackoverflowFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
      );
    case 'tumblr':
      return await getTumblrFeed(supabaseClient, redisClient, profile, source);
    // case "x":
    //   return await getXFeed(supabaseClient, redisClient, profile, source);
    case 'youtube':
      return await getYoutubeFeed(supabaseClient, redisClient, profile, source);
    default:
      throw new Error('Invalid source type');
  }
};
