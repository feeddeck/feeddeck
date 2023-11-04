import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

import { corsHeaders } from '../_shared/utils/cors.ts';
import { getFeed } from '../_shared/feed/feed.ts';
import { ISourceOptions, TSourceType } from '../_shared/models/source.ts';
import { IProfile } from '../_shared/models/profile.ts';
import { log } from '../_shared/utils/log.ts';
import {
  FEEDDECK_SUPABASE_ANON_KEY,
  FEEDDECK_SUPABASE_SERVICE_ROLE_KEY,
  FEEDDECK_SUPABASE_URL,
} from '../_shared/utils/constants.ts';

/**
 * The `add-source-v1` edge function is used to add a new source and it's
 * corresponding items to the database. It expects a POST request with the
 * column id, source type and options. The function will return the source
 * object as it was added to the database.
 */
serve(async (req) => {
  /**
   * We need to handle the preflight request for CORS as it is described in the
   * Supabase documentation: https://supabase.com/docs/guides/functions/cors
   */
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    /**
     * Create a new Supabase client with the anonymous key and the authorization
     * header from the request. This allows us to access the database as the
     * user that is currently signed in.
     */
    const userSupabaseClient = createClient(
      FEEDDECK_SUPABASE_URL,
      FEEDDECK_SUPABASE_ANON_KEY,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    /**
     * Get the user from the request. If there is no user, we return an error.
     */
    const { data: { user } } = await userSupabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    /**
     * Create a new admin client for Supabase, which is used in the following
     * steps to access the database. This client is required because the user
     * client does not have the permissions to access the `profiles` table or to
     * insert new row in the `sources` and `items` table.
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
     * Get the user profile from the database. If there is no profile or more
     * than one profile, we return an error.
     */
    const { data: profile, error: profileError } = await adminSupabaseClient
      .from(
        'profiles',
      )
      .select('*').eq('id', user.id);
    if (profileError || profile?.length !== 1) {
      log('error', 'Failed to get user profile', {
        'user': user,
        'error': profileError,
      });
      return new Response(
        JSON.stringify({ error: 'Failed to get user profile' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }

    /**
     * Get the number of sources the user has created. If there is an error, we
     * return an error.
     *
     * Based on the number of sources and the user `tier` from the profiles
     * table from the former step, we decide if the user can create a new
     * source. If a user is on the free `tier`, they can create up to 10
     * sources. If a user is on the `premium` tier, they can create up to 1000
     * sources.
     */
    const { count: sourcesCount, error: countError } = await adminSupabaseClient
      .from('sources')
      .select(
        '*',
        { count: 'exact' },
      ).eq('userId', user.id);
    if (countError || sourcesCount === null) {
      log('error', 'Failed to get sources', { 'error': countError });
      return new Response(
        JSON.stringify({ error: 'Failed to get sources' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }

    if (profile[0].tier === 'free' && sourcesCount >= 10) {
      log(
        'warning',
        'User is on the free tier and has reached the maximum number of sources',
      );
      return new Response(
        JSON.stringify({
          error:
            'You reached the maximum number of sources you can create, please upgrade your account to the premium tier.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

    if (profile[0].tier === 'premium' && sourcesCount >= 1000) {
      log(
        'warning',
        'User is on the premium tier and has reached the maximum number of sources',
      );
      return new Response(
        JSON.stringify({
          error: 'You reached the maximum number of sources you can create.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

    /**
     * Get the column, source typ and options from the request. Based on this
     * information, we get the source and items from the `getFeed` function.
     */
    const { columnId, type, options }: {
      columnId: string;
      type: TSourceType;
      options: ISourceOptions;
    } = await req.json();

    const { source, items } = await getFeed(
      adminSupabaseClient,
      undefined,
      profile[0] as IProfile,
      {
        id: '',
        userId: user.id,
        columnId: columnId,
        type: type,
        options: options,
        title: '',
      },
    );

    /**
     * Save the `sources` and `items` to our database. The `items` are only save
     * if there is at least one item in the array. If there are no items, we
     * only save the source.
     *
     * If there is an error, we return an error. If the insert succeeds we
     * return the source object.
     */
    const { error: sourceError } = await adminSupabaseClient.from('sources')
      .insert(
        source,
      );
    if (sourceError) {
      log('error', 'Failed to save sources', { 'error': sourceError });
      return new Response(JSON.stringify({ error: 'Failed to save sources' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (items.length > 0) {
      const { error: itemsError } = await adminSupabaseClient.from('items')
        .insert(
          items,
        );
      if (itemsError) {
        log('error', 'Failed to save items', { 'error': itemsError });
        return new Response(JSON.stringify({ error: 'Failed to save items' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
    }

    return new Response(JSON.stringify(source), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    log('error', 'An unexpected error occured', { 'error': err.toString() });
    return new Response(
      JSON.stringify({ error: 'An unexpected error occured' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
