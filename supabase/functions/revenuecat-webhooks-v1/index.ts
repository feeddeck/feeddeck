import { createClient } from "jsr:@supabase/supabase-js@2";

import { log } from "../_shared/utils/log.ts";
import {
  FEEDDECK_REVENUECAT_WEBHOOK_HEADER,
  FEEDDECK_SUPABASE_SERVICE_ROLE_KEY,
  FEEDDECK_SUPABASE_URL,
} from "../_shared/utils/constants.ts";

/**
 * The `IEventPayload` interface represents the payload of a RevenueCat webhook
 *  call.
 */
interface IEventPayload {
  api_version: string;
  event: IEvent;
}

interface IEvent {
  app_id: string;
  app_user_id: string;
  environment: string;
  type: string;
}

/**
 * `isAuthorized` checks if the request is authorized. This is done by checking
 * the authorization header of the request, which must match the configured
 * header in RevenueCat.
 */
const isAuthorized = (req: Request): boolean => {
  const authorizationHeader = req.headers.get("Authorization");

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return false;
  }

  const authToken = authorizationHeader.split("Bearer ")[1];
  if (authToken !== FEEDDECK_REVENUECAT_WEBHOOK_HEADER) {
    return false;
  }

  return true;
};

/**
 * `manageSubscriptionStatusChange` changes the subscription status of a user in
 * the database.
 */
export const manageSubscriptionStatusChange = async (
  userId: string,
  isCreated = false,
) => {
  /**
   * Create a new admin client for Supabase, which is used in the following
   * steps to access the database. This client is required because the user
   * client does not have the permissions to access the `profiles` table.
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
   * Get the user profile from the database. If there is no profile or more than
   * one profile, we return an error.
   */
  const { data: profile, error: profileError } = await adminSupabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userId);
  if (profileError || profile?.length !== 1) {
    log("error", "Failed to get user profile", {
      userId: userId,
      error: profileError,
    });
    throw new Error("Failed to get user profile");
  }

  /**
   * If the user is already on the correct tier, we return early.
   */
  if (
    (profile[0].tier === "free" && !isCreated) ||
    (profile[0].tier === "premium" && isCreated)
  ) {
    return;
  }

  const { error: updateError } = await adminSupabaseClient
    .from("profiles")
    .update({
      tier: isCreated ? "premium" : "free",
      subscriptionProvider: "revenuecat",
    })
    .eq("id", profile[0].id);
  if (updateError) {
    log("error", "Failed to update user profile with new tier value", {
      userId: userId,
      error: updateError,
    });
    throw new Error("Failed to update user profile with new tier value");
  }
};

/**
 * The `revenuecat-webhooks-v1` edge function handles all incomming RevenueCat
 * webhooks. When we a receive a new event, we have to change the users account
 * tier to `premium` or to `free`, depending on the received event.
 */
Deno.serve(async (req) => {
  try {
    /**
     * If the request method is not POST, we return a 403 Forbidden error. This
     * is done because we only want to accept POST requests. If the request is
     * not authorized, we return a 401 Unauthorized error.
     */
    if (req.method !== "POST") {
      return new Response("Forbidden", {
        status: 403,
      });
    }

    if (!isAuthorized(req)) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    /**
     * Get the payload of the received webhook event.
     */
    const payload = (await req.json()) as IEventPayload;
    log("debug", "Received event", { event: payload.event });

    /**
     * If the event type is `INITIAL_PURCHASE`, `RENEWAL` or `UNCANCELLATION`,
     * we change the subscription status of the user to `premium`. If the event
     * type is `EXPIRATION`, we change the subscription status of the user to
     * `free`. All other event types are ignored.
     */
    if (
      payload.event.type === "INITIAL_PURCHASE" ||
      payload.event.type === "RENEWAL" ||
      payload.event.type === "UNCANCELLATION"
    ) {
      await manageSubscriptionStatusChange(payload.event.app_user_id, true);
      return new Response("ok", {
        status: 200,
      });
    } else if (payload.event.type === "EXPIRATION") {
      await manageSubscriptionStatusChange(payload.event.app_user_id, false);
      return new Response("ok", {
        status: 200,
      });
    } else {
      return new Response("ok", {
        status: 200,
      });
    }
  } catch (err) {
    log("error", "An unexpected error occured", { error: err });
    return new Response("An unexpected error occured", {
      status: 500,
    });
  }
});
