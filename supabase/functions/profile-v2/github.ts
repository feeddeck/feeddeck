import { SupabaseClient, User } from "jsr:@supabase/supabase-js@2";

import { corsHeaders } from "../_shared/utils/cors.ts";
import { log } from "../_shared/utils/log.ts";
import { encrypt } from "../_shared/utils/encrypt.ts";

/**
 * `githubAddAccount` adds a new GitHub account to the users profile. A user
 * must only provide a private access token to connect his GitHub account. We
 * encrypt the token before we store it in the database.
 */
export const githubAddAccount = async (
  supabaseClient: SupabaseClient,
  user: User,
  data: { token?: string } | null,
): Promise<Response> => {
  if (!data || !data.token) {
    return new Response(JSON.stringify({ error: "Bad Request" }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
      },
      status: 400,
    });
  }

  const { error: updateError } = await supabaseClient
    .from("profiles")
    .update({
      accountGithub: { token: await encrypt(data.token) },
    })
    .eq("id", user.id);
  if (updateError) {
    log("error", "Failed to update user profile", {
      user: user,
      error: updateError,
    });
    return new Response(JSON.stringify({ error: "Failed to update profile" }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
      },
      status: 500,
    });
  }
  return new Response(undefined, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
    status: 200,
  });
};

/**
 * `githubDeleteAccount` deletes the users GitHub account from his profile by
 * setting the value of the `accountGithub` column to `null`.
 */
export const githubDeleteAccount = async (
  supabaseClient: SupabaseClient,
  user: User,
): Promise<Response> => {
  const { error: updateError } = await supabaseClient
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
    return new Response(JSON.stringify({ error: "Failed to update profile" }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
      },
      status: 500,
    });
  }
  return new Response(undefined, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
    status: 200,
  });
};
