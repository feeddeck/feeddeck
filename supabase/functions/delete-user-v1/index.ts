import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

import { corsHeaders } from '../_shared/utils/cors.ts';
import { log } from '../_shared/utils/log.ts';
import {
  FEEDDECK_SUPABASE_ANON_KEY,
  FEEDDECK_SUPABASE_SERVICE_ROLE_KEY,
  FEEDDECK_SUPABASE_URL,
} from '../_shared/utils/constants.ts';

/**
 * The `delete-user-v1` edge function is used to delete the current user. When
 *  the user is deleted all the corresponding user data is also removed, so that
 * we should warn a user about this action.
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
     * client does not have the permissions to delete a user.
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
     * Before the user can be deleted we have to get the users profile from the
     * database to check if the user has an
     * active Stripe subscription. If this is the case we return an error, so
     * that we do not charge a user for his active subscription while the
     * account is already deleted.
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
    if (profile[0].tier !== 'free') {
      return new Response(
        JSON.stringify({
          error:
            'User can not be deleted, because of an active subscription, please cancel your subscription first',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

    /**
     * Delete the current user via the admin client. If there is an error, we
     * return an error. If the user was deleted successfully we return a 204
     * response.
     */
    const { error: deleteError } = await adminSupabaseClient.auth.admin
      .deleteUser(user.id);
    if (deleteError) {
      log('error', 'Failed to get delete user', {
        'user': user,
        'error': deleteError,
      });
      return new Response(
        JSON.stringify({ error: 'Failed to get delete user' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }

    return new Response(undefined, {
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
