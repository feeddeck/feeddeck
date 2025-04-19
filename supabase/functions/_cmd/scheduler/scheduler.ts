import { connect, Redis } from "redis";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { log } from "../../_shared/utils/log.ts";
import {
  FEEDDECK_REDIS_HOSTNAME,
  FEEDDECK_REDIS_PASSWORD,
  FEEDDECK_REDIS_PORT,
  FEEDDECK_REDIS_USERNAME,
  FEEDDECK_SUPABASE_SERVICE_ROLE_KEY,
  FEEDDECK_SUPABASE_URL,
} from "../../_shared/utils/constants.ts";

/**
 * `runScheduler` starts the scheduler which is responsible for fetching all
 * sources from the Supabase database and schedule them for the worker.
 */
export const runScheduler = async () => {
  /**
   * Create a new Supabase client which is used to fetch all user profiles and
   * sources from the Supabase database.
   */
  const adminSupabaseClient = createClient(
    FEEDDECK_SUPABASE_URL,
    FEEDDECK_SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  /**
   * Create a new Redis client which is used to schedule all sources for the
   * worker and for caching data when needed, e.g. the media urls for the Google
   * News provider.
   */
  const redisClient = await connect({
    hostname: FEEDDECK_REDIS_HOSTNAME,
    port: FEEDDECK_REDIS_PORT,
    username: FEEDDECK_REDIS_USERNAME,
    password: FEEDDECK_REDIS_PASSWORD,
  });

  /**
   * Run the `scheduleSources` function in an endless loop and wait 15 minutes
   * between each run.
   */
  while (true) {
    await scheduleSources(adminSupabaseClient, redisClient);
    await sleep(1000 * 60 * 15);
  }
};

/**
 * `sleep` is a helper function which can be used to wait for a specific amount
 * of time.
 */
const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * `scheduleSources` fetches all users and their sources from the Supabase
 * database and schedules them for the worker.
 */
const scheduleSources = async (
  supabaseClient: SupabaseClient,
  redisClient: Redis,
) => {
  try {
    /**
     * The `profileCreatedAt` is used to fetch all user profiles which are newer
     * than 7 days. This is used to only fetch users which are having an active
     * subscription or which are new to FeedDeck.
     *
     * The `sourcesUpdatedAt` is used to fetch all sources which where not
     * updated in the last hour.
     */
    const profileCreatedAt =
      Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24 * 7;
    const sourcesUpdatedAt = Math.floor(new Date().getTime() / 1000) - 60 * 60;
    log("info", "Schedule sources", {
      sourcesUpdatedAt: sourcesUpdatedAt,
      profileCreatedAt: profileCreatedAt,
    });

    /**
     * Fetch all user profiles which are newer than 7 days and which are having
     * an active subscription. We fetch the profiles in batches of 1000 to avoid
     * fetching all profiles at once.
     */
    // deno-lint-ignore no-explicit-any
    const profiles: any[] = [];
    const batchSize = 1000;
    let offset = 0;

    while (true) {
      log("debug", "Fetching profiles", { offset: offset });

      const { data: tmpProfiles, error: profilesError } = await supabaseClient
        .from("profiles")
        .select("*")
        .or(`tier.eq.premium,createdAt.gt.${profileCreatedAt}`)
        .order("createdAt")
        .range(offset, offset + batchSize);
      if (profilesError) {
        log("error", "Failed to get user profiles", {
          error: profilesError,
        });
      } else {
        profiles.push(...tmpProfiles);

        if (tmpProfiles.length < batchSize) {
          break;
        } else {
          offset += batchSize;
        }
      }
    }

    log("info", "Fetched profiles", { profilesCount: profiles.length });
    for (const profile of profiles) {
      /**
       * Fetch all sources for the current user profile which where not updated
       * in the last hour.
       */
      const { data: sources, error: sourcesError } = await supabaseClient
        .from("sources")
        .select("*")
        .eq("userId", profile.id)
        .lt("updatedAt", sourcesUpdatedAt);
      if (sourcesError) {
        log("error", "Failed to get user sources", {
          profile: profile.id,
          error: sourcesError,
        });
      } else {
        log("info", "Fetched sources", {
          profile: profile.id,
          sourcesCount: sources.length,
        });
        for (const source of sources) {
          /**
           * The "nitter" source type is deprecated and should not be scheduled
           * for updates anymore.
           * See https://github.com/zedeus/nitter/issues/1155#issuecomment-1913361757
           */
          if (source.type === "nitter") {
            continue;
          }

          /**
           * Skip "reddit" sources for users on the free tier, when the source
           * was already updated in the last 24 hours. This is done to avoid
           * hitting the rate limits of the Reddit API.
           */
          if (profile.tier === "free" && source.type === "reddit") {
            if (
              source.updatedAt >
              Math.floor(new Date().getTime() / 1000) - 60 * 60 * 24
            ) {
              log("debug", "Skip source", {
                source: source.id,
                profile: profile.id,
              });
              continue;
            }
          }

          /**
           * Schedule the current source for the worker. The scheduled "job"
           * contains the source and the users profile since it is possible that
           * we need the users account information to fetch the sources data,
           * e.g. the users GitHub token.
           */
          log("info", "Scheduling source", {
            source: source.id,
            profile: profile.id,
          });
          await redisClient.rpush(
            "sources",
            JSON.stringify({
              source: source,
              profile: profile,
            }),
          );
        }
      }
    }
  } catch (err) {
    log("error", "Failed to schedule sources...", { error: err });
  }
};
