import { createClient } from '@supabase/supabase-js';

import { corsHeaders } from '../_shared/utils/cors.ts';
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
Deno.serve(async (req) => {
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
    if (!user || !user.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8',
        },
        status: 401,
      });
    }

    /**
     * Create a new admin client for Supabase, which is used in the following
     * steps to access the database. This client is required to generate a
     * magic link for the user.
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

    const { data: linkData, error: linkError } = await adminSupabaseClient.auth
      .admin.generateLink({
        type: 'magiclink',
        email: user.email,
      });
    if (linkError) {
      log('error', 'Failed to generate magic link', {
        'user': user,
        'error': linkError,
      });
      return new Response(
        JSON.stringify({ error: 'Failed to generate magic link' }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json; charset=utf-8',
          },
          status: 500,
        },
      );
    }

    return new Response(
      JSON.stringify({ url: linkData.properties?.action_link }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8',
        },
        status: 200,
      },
    );
  } catch (err) {
    log('error', 'An unexpected error occured', { 'error': err.toString() });
    return new Response(
      JSON.stringify({ error: 'An unexpected error occured' }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json; charset=utf-8',
        },
        status: 400,
      },
    );
  }
});
