import { createClient } from "@supabase/supabase-js";

import { corsHeaders } from "../_shared/utils/cors.ts";
import { log } from "../_shared/utils/log.ts";
import { IProfile } from "../_shared/models/profile.ts";
import { TSourceType } from "../_shared/models/source.ts";
import { encrypt } from "../_shared/utils/encrypt.ts";
import {
  FEEDDECK_SUPABASE_ANON_KEY,
  FEEDDECK_SUPABASE_SERVICE_ROLE_KEY,
  FEEDDECK_SUPABASE_URL,
} from "../_shared/utils/constants.ts";

/**
 * DEPRECATED: This function is deprecated and will be removed in the future.
 * Please use the new `profile-v2` function.
 */
Deno.serve(async (req) => {
  /**
   * We need to handle the preflight request for CORS as it is described in the
   * Supabase documentation: https://supabase.com/docs/guides/functions/cors
   */
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
          headers: { Authorization: req.headers.get("Authorization")! },
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
    const {
      data: { user },
    } = await userSupabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json; charset=utf-8",
        },
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
     * When the request method is GET, we return the user profile. The profile
     * contains the users tier ("free" or "premium") and the users connected
     * accounts. We do not return the users account values directly instead we
     * convert them to `true` or `false`, which indicates if the account is
     * connected or not.
     */
    if (req.method === "GET") {
      const { data: profile, error: profileError } = await adminSupabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id);
      if (profileError || profile?.length !== 1) {
        log("error", "Failed to get user profile", {
          user: user,
          error: profileError,
        });
        return new Response(
          JSON.stringify({ error: "Failed to get delete user" }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json; charset=utf-8",
            },
            status: 500,
          },
        );
      }

      return new Response(
        JSON.stringify({
          id: (profile[0] as IProfile).id,
          tier: (profile[0] as IProfile).tier,
          subscriptionProvider: (profile[0] as IProfile).subscriptionProvider,
          accountGithub: (profile[0] as IProfile).accountGithub?.token
            ? true
            : false,
          createdAt: (profile[0] as IProfile).createdAt,
          updatedAt: (profile[0] as IProfile).updatedAt,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json; charset=utf-8",
          },
          status: 200,
        },
      );
    }

    /**
     * When the request method is POST, we try to connected a users Social Media
     * account with the users profile. The account type is defined in the
     * request body via the `sourceType` property. Depending on the `action`
     * property we either add a new account or initialize the connection
     * process, e.g. setting a verify token and returning an url for
     * authentication.
     */
    if (req.method === "POST") {
      const data: {
        action?: string;
        sourceType?: TSourceType;
        options?: {
          token: string;
        };
      } = await req.json();

      /**
       * If the request data contains the `action` property with the value
       * `add-account` and the `sourceType` property with the value `github` and
       * the `options` property with the `token` property, we add the GitHub
       * account to the users profile.
       */
      if (
        data.action === "add-account" &&
        data.sourceType === "github" &&
        data.options?.token
      ) {
        const { error: updateError } = await adminSupabaseClient
          .from("profiles")
          .update({
            accountGithub: { token: await encrypt(data.options.token) },
          })
          .eq("id", user.id);
        if (updateError) {
          log("error", "Failed to update user profile", {
            user: user,
            error: updateError,
          });
          return new Response(
            JSON.stringify({ error: "Failed to update profile" }),
            {
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json; charset=utf-8",
              },
              status: 500,
            },
          );
        }
        return new Response(undefined, {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json; charset=utf-8",
          },
          status: 200,
        });
      }

      /**
       * If the request data contains the `action` property with the value
       * `delete-account` and the `sourceType` property is `github`, we delete
       * the users GitHub account from his profile by setting the value of the
       * `accountGithub` column to `null`.
       */
      if (data.action === "delete-account" && data.sourceType === "github") {
        const { error: updateError } = await adminSupabaseClient
          .from("profiles")
          .update({
            accountGithub: null,
          })
          .eq("id", user.id);
        if (updateError) {
          log("error", "Failed to update user profile", {
            user: user,
            error: updateError,
          });
          return new Response(
            JSON.stringify({ error: "Failed to update profile" }),
            {
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json; charset=utf-8",
              },
              status: 500,
            },
          );
        }
        return new Response(undefined, {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json; charset=utf-8",
          },
          status: 200,
        });
      }

      /**
       * If the request data doesn't match any of the above conditions, we
       * return an error.
       */
      log("error", "Invalid request data", {
        user: user,
        request: data,
      });
      return new Response(JSON.stringify({ error: "Invalid request data" }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json; charset=utf-8",
        },
        status: 400,
      });
    }

    /**
     * If the request method is not GET, POST or DELETE, we return an error.
     */
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
      },
      status: 405,
    });
  } catch (err) {
    log("error", "An unexpected error occured", { error: err });
    return new Response(
      JSON.stringify({ error: "An unexpected error occured" }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json; charset=utf-8",
        },
        status: 400,
      },
    );
  }
});
