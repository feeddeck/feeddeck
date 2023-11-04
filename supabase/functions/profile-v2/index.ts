import { serve } from 'std/server';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

import { corsHeaders } from '../_shared/utils/cors.ts';
import { log } from '../_shared/utils/log.ts';
import { IProfile } from '../_shared/models/profile.ts';
import {
  FEEDDECK_SUPABASE_ANON_KEY,
  FEEDDECK_SUPABASE_SERVICE_ROLE_KEY,
  FEEDDECK_SUPABASE_URL,
} from '../_shared/utils/constants.ts';
import { githubAddAccount, githubDeleteAccount } from './github.ts';

/**
 * `getProfile` returns the users profile. The user profile contains information
 * about the users subscription and the connected accounts.
 *
 * ATTENTION: We should never return the users account token. Instead we should
 * return a boolean if the user has connected an account or not.
 */
const getProfile = async (
  supabaseClient: SupabaseClient,
  user: User,
): Promise<Response> => {
  const { data: profile, error: profileError } = await supabaseClient
    .from(
      'profiles',
    )
    .select('*').eq(
      'id',
      user.id,
    );
  if (profileError || profile?.length !== 1) {
    log('error', 'Failed to get user profile', {
      'user': user,
      'error': profileError,
    });
    return new Response(
      JSON.stringify({ error: 'Failed to get delete user' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }

  return new Response(
    JSON.stringify({
      'id': (profile[0] as IProfile).id,
      'tier': (profile[0] as IProfile).tier,
      'subscriptionProvider': (profile[0] as IProfile).subscriptionProvider,
      'accountGithub': (profile[0] as IProfile).accountGithub?.token
        ? true
        : false,
      'createdAt': (profile[0] as IProfile).createdAt,
      'updatedAt': (profile[0] as IProfile).updatedAt,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    },
  );
};

/**
 * The `profile-v2` function is the entry point for all requests which are
 * related to the users profile. This means that the function can be used to get
 * the users profile and to handle the users connected accounts.
 */
serve(async (req) => {
  const { url, method } = req;

  /**
   * We need to handle the preflight request for CORS as it is described in the
   * Supabase documentation: https://supabase.com/docs/guides/functions/cors
   */
  if (method === 'OPTIONS') {
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
     * client does not have the permissions to get a users profile.
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
     * We use the `URLPattern` library to match the request url to the different
     * endpoints of the function. This allows us to use a single function for
     * multiple endpoints. If the request method is `POST` we also parse the
     * request body.
     */
    const urlPattern = new URLPattern({ pathname: '/profile-v2/:id' });
    const matchingPath = urlPattern.exec(url);
    const id = matchingPath ? matchingPath.pathname.groups.id : null;

    let data = null;
    if (method === 'POST') {
      data = await req.json();
    }

    log('debug', 'Request data', {
      user: user,
      method: method,
      id: id,
      data: data ? true : false,
    });

    /**
     * Now we can check the request method and the request id to determine which
     * action we need to execute.
     */
    switch (true) {
      case method === 'GET' && id === 'getProfile':
        return await getProfile(adminSupabaseClient, user);
      case method === 'POST' && id === 'githubAddAccount':
        return await githubAddAccount(adminSupabaseClient, user, data);
      case method === 'DELETE' && id === 'githubDeleteAccount':
        return await githubDeleteAccount(adminSupabaseClient, user);
      default:
        /**
         * If the request doesn't match any of the above conditions, because it
         * doesn't match the request method and id we return a `400 Bad Request`
         * error.
         */
        return new Response(JSON.stringify({ error: 'Bad Request' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
    }
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
