import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

import { log } from "../utils/log.ts";
import {
  FEEDDECK_STRIPE_API_KEY,
  FEEDDECK_STRIPE_PRICE_ID,
  FEEDDECK_SUPABASE_SERVICE_ROLE_KEY,
  FEEDDECK_SUPABASE_SITE_URL,
  FEEDDECK_SUPABASE_URL,
} from "../utils/constants.ts";

/**
 * Create a new Stripe client, based on the `FEEDDECK_STRIPE_API_KEY` environment variable.
 */
export const stripe = new Stripe(
  FEEDDECK_STRIPE_API_KEY,
  {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
  },
);

export const cryptoProvider = Stripe.createSubtleCryptoProvider();

/**
 * `createOrRetrieveCustomer` returns the Stripe customer id for the provided `userId`. If the user doesn't have a
 * Stripe customer id yet, a new customer is created for the user and the customer id is stored in the database before
 * it is returned.
 */
export const createOrRetrieveCustomer = async (
  userId: string,
  userEmail?: string,
): Promise<string> => {
  /**
   * Create a new admin client for Supabase, which is used in the following steps to access the database. This client
   * is required because the user client does not have the permissions to access the `profiles` table.
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
   * Get the user profile from the database. If there is no profile or more than one profile, we return an error.
   */
  const { data: profile, error: profileError } = await adminSupabaseClient
    .from(
      "profiles",
    )
    .select("*").eq("id", userId);
  if (profileError || profile?.length !== 1) {
    log("error", "Failed to get user profile", {
      "user": userId,
      "error": profileError,
    });
    throw new Error("Failed to get user profile");
  }

  if (profile[0].stripeCustomerId) {
    return profile[0].stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: userEmail,
    metadata: {
      userId: userId,
    },
  });

  const { error: updateError } = await adminSupabaseClient.from("profiles")
    .update({
      stripeCustomerId: customer.id,
    }).eq("id", userId);
  if (updateError) {
    log("error", "Failed to update user profile with Stripe customer id", {
      "stripeCustomerId": customer.id,
      "user": userId,
      "error": updateError,
    });
    throw new Error("Failed to update user profile with Stripe customer id");
  }

  return customer.id;
};

/**
 * `createBillingPortalSession` creates a new session for the billing portal for the provided `stripeCustomerId`. The
 * url which can be used by the user to open the billing portal is returned.
 */
export const createBillingPortalSession = async (
  stripeCustomerId: string,
): Promise<string> => {
  const { url } = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: FEEDDECK_SUPABASE_SITE_URL,
  });

  return url;
};

/**
 * `createCheckoutSession` creates a new checkout session for the provided `stripeCustomerId`. The url which can be
 * used by the user to open the checkout page is returned.
 */
export const createCheckoutSession = async (stripeCustomerId: string) => {
  const { url } = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    customer_update: {
      address: "auto",
    },
    line_items: [
      {
        price: FEEDDECK_STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    mode: "subscription",
    allow_promotion_codes: true,
    success_url: FEEDDECK_SUPABASE_SITE_URL,
    cancel_url: FEEDDECK_SUPABASE_SITE_URL,
  });

  return url;
};

export const manageSubscriptionStatusChange = async (
  stripeCustomerId: string,
  isCreated = false,
) => {
  /**
   * Create a new admin client for Supabase, which is used in the following steps to access the database. This client
   * is required because the user client does not have the permissions to access the `profiles` table.
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
   * Get the user profile from the database. If there is no profile or more than one profile, we return an error.
   */
  const { data: profile, error: profileError } = await adminSupabaseClient
    .from(
      "profiles",
    )
    .select("*").eq("stripeCustomerId", stripeCustomerId);
  if (profileError || profile?.length !== 1) {
    log("error", "Failed to get user profile", {
      "stripeCustomerId": stripeCustomerId,
      "error": profileError,
    });
    throw new Error("Failed to get user profile");
  }

  const { error: updateError } = await adminSupabaseClient.from("profiles")
    .update({
      tier: isCreated ? "premium" : "free",
      subscriptionProvider: "stripe",
    }).eq("id", profile[0].id);
  if (updateError) {
    log("error", "Failed to update user profile with new tier value", {
      "stripeCustomerId": stripeCustomerId,
      "user": profile[0].id,
      "error": updateError,
    });
    throw new Error("Failed to update user profile with new tier value");
  }
};
