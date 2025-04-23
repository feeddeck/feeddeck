import { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { Redis } from "https://deno.land/x/redis@v0.32.0/mod.ts";

import { IItem } from "../models/item.ts";
import { ISource } from "../models/source.ts";
import { feedutils } from "./utils/index.ts";
import { getLemmyFeed, isLemmyUrl } from "./lemmy.ts";
import { getMediumFeed, isMediumUrl } from "./medium.ts";
import { getPinterestFeed, isPinterestUrl } from "./pinterest.ts";
import { getRSSFeed } from "./rss.ts";
import { getPodcastFeed } from "./podcast.ts";
import { getTumblrFeed, isTumblrUrl } from "./tumblr.ts";
import { getStackoverflowFeed } from "./stackoverflow.ts";
import { getGooglenewsFeed } from "./googlenews.ts";
import { getYoutubeFeed, isYoutubeUrl } from "./youtube.ts";
import { getRedditFeed, isRedditUrl } from "./reddit.ts";
import { getGithubFeed } from "./github.ts";
import { IProfile } from "../models/profile.ts";
import { getNitterFeed } from "./nitter.ts";
import { getMastodonFeed } from "./mastodon.ts";
import { getFourChanFeed, isFourChanUrl } from "./fourchan.ts";

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
  feedData: string | undefined,
): Promise<{ source: ISource; items: IItem[] }> => {
  switch (source.type) {
    case "fourchan":
      return await getFourChanFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    case "github":
      return await getGithubFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    case "googlenews":
      return await getGooglenewsFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    case "lemmy":
      return await getLemmyFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    case "mastodon":
      return await getMastodonFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    case "medium":
      return await getMediumFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    case "nitter":
      return await getNitterFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    case "pinterest":
      return await getPinterestFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    case "podcast":
      return await getPodcastFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    case "reddit":
      return await getRedditFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    case "rss":
      try {
        if (source.options?.rss && isFourChanUrl(source.options.rss)) {
          return await getFourChanFeed(
            supabaseClient,
            redisClient,
            profile,
            {
              ...source,
              options: { fourchan: source.options.rss },
            },
            feedData,
          );
        }

        if (source.options?.rss && isLemmyUrl(source.options.rss)) {
          return await getLemmyFeed(
            supabaseClient,
            redisClient,
            profile,
            {
              ...source,
              options: { lemmy: source.options.rss },
            },
            feedData,
          );
        }

        if (source.options?.rss && isMediumUrl(source.options.rss)) {
          return await getMediumFeed(
            supabaseClient,
            redisClient,
            profile,
            {
              ...source,
              options: { medium: source.options.rss },
            },
            feedData,
          );
        }

        if (source.options?.rss && isPinterestUrl(source.options.rss)) {
          return await getPinterestFeed(
            supabaseClient,
            redisClient,
            profile,
            {
              ...source,
              options: { pinterest: source.options.rss },
            },
            feedData,
          );
        }

        if (source.options?.rss && isRedditUrl(source.options.rss)) {
          return await getTumblrFeed(
            supabaseClient,
            redisClient,
            profile,
            {
              ...source,
              options: { reddit: source.options.reddit },
            },
            feedData,
          );
        }

        if (source.options?.rss && isTumblrUrl(source.options.rss)) {
          return await getTumblrFeed(
            supabaseClient,
            redisClient,
            profile,
            {
              ...source,
              options: { tumblr: source.options.rss },
            },
            feedData,
          );
        }

        if (source.options?.rss && isYoutubeUrl(source.options.rss)) {
          return await getYoutubeFeed(
            supabaseClient,
            redisClient,
            profile,
            {
              ...source,
              options: { youtube: source.options.rss },
            },
            feedData,
          );
        }
      } catch (_) {
        /**
         * We ignore any errors at this point and try to use the general
         * `getRSSFeed` function instead.
         */
      }

      return await getRSSFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    case "stackoverflow":
      return await getStackoverflowFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    case "tumblr":
      return await getTumblrFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    case "youtube":
      return await getYoutubeFeed(
        supabaseClient,
        redisClient,
        profile,
        source,
        feedData,
      );
    default:
      throw new feedutils.FeedValidationError("Invalid source options");
  }
};
