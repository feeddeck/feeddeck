import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

import { corsHeaders } from "../_shared/utils/cors.ts";
import { log } from "../_shared/utils/log.ts";
import {
  createCheckoutSession,
  createOrRetrieveCustomer,
} from "../_shared/stripe/stripe.ts";
import {
  FEEDDECK_SUPABASE_ANON_KEY,
  FEEDDECK_SUPABASE_URL,
} from "../_shared/utils/constants.ts";

/**
 * The `stripe-create-checkout-session-v1` edge function is used to create a new Stripe checkout session for the current
 * user. The function returns the URL of the checkout session.
 */
serve(async (req) => {
  /**
   * We need to handle the preflight request for CORS as it is described in the Supabase documentation:
   * https://supabase.com/docs/guides/functions/cors
   */
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
    const { data: { user } } = await userSupabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const stripeCustomerId = await createOrRetrieveCustomer(
      user.id,
      user.email,
    );
    const url = await createCheckoutSession(stripeCustomerId);

    return new Response(JSON.stringify({ url: url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    log("error", "An unexpected error occured", { "error": err.toString() });
    return new Response(
      JSON.stringify({ error: "An unexpected error occured" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
