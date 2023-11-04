import { connect, Redis } from 'redis';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { log } from '../../_shared/utils/log.ts';
import { getFeed } from '../../_shared/feed/feed.ts';
import {
  FEEDDECK_REDIS_HOSTNAME,
  FEEDDECK_REDIS_PASSWORD,
  FEEDDECK_REDIS_PORT,
  FEEDDECK_REDIS_USERNAME,
  FEEDDECK_SUPABASE_URL,
} from '../../_shared/utils/constants.ts';
import { FEEDDECK_SUPABASE_SERVICE_ROLE_KEY } from '../../_shared/utils/constants.ts';

/**
 * `runWorker` starts the worker which is responsible for fetching the feeds for
 * all scheduled sources. For this a worker will listen for new "jobs" in the
 * Redis queue and fetch the feed for the source and updates the database
 * entries.
 */
export const runWorker = async () => {
  /**
   * Create a new Supabase client which is used to update all sources and items
   * in the Supabase database.
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
   * Create a new Redis client which is used to listen for new sources which
   * should be fetched and for caching data when needed, e.g. the media urls for
   * the Google News provider.
   */
  const redisClient = await connect({
    hostname: FEEDDECK_REDIS_HOSTNAME,
    port: FEEDDECK_REDIS_PORT,
    username: FEEDDECK_REDIS_USERNAME,
    password: FEEDDECK_REDIS_PASSWORD,
  });

  /**
   * Run the `listenForSources` function in an endless loop.
   */
  while (true) {
    await listenForSources(adminSupabaseClient, redisClient);
  }
};

const listenForSources = async (
  supabaseClient: SupabaseClient,
  redisClient: Redis,
) => {
  try {
    /**
     * Listen for new sources in the Redis queue. Once a valid source is
     * received we get the source and profile from the Redis data.
     */
    const data = await redisClient.blpop(1000 * 60, 'sources');
    if (data && data[0] === 'sources') {
      const { source: redisSource, profile: redisProfile } = JSON.parse(
        data[1],
      );
      log('info', 'Received source', {
        'source': redisSource.id,
        'profile': redisProfile.id,
      });

      /**
       * Fetch the feed for the source using the created Supabase client, Redis
       * client and the source and profile data from Redis.
       */
      const { source, items } = await getFeed(
        supabaseClient,
        redisClient,
        redisProfile,
        redisSource,
      );

      /**
       * Update the source and items in the Supabase database, when the
       * returned list of items contains at least one item. We have to use
       * `upsert` instead of `update` to update do bulk "updates" for all
       * sources and items.
       */
      if (items.length > 0) {
        const { error: sourceError } = await supabaseClient.from('sources')
          .upsert(
            source,
          );
        if (sourceError) {
          log('error', 'Failed to save sources', { 'error': sourceError });
        }

        const { error: itemsError } = await supabaseClient.from('items')
          .upsert(
            items,
          );
        if (itemsError) {
          log('error', 'Failed to save items', { 'error': itemsError });
        }

        log('info', 'Updated source', {
          'source': redisSource.id,
          'profile': redisProfile.id,
        });
      }
    }
  } catch (err) {
    log('error', 'Failed to listen for sources', { 'error': err.toString() });
  }
};
