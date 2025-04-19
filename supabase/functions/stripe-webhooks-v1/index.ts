import Stripe from "stripe";

import { log } from "../_shared/utils/log.ts";
import {
  cryptoProvider,
  manageSubscriptionStatusChange,
  stripe,
} from "../_shared/stripe/stripe.ts";
import { FEEDDECK_STRIPE_WEBHOOK_SIGNING_SECRET } from "../_shared/utils/constants.ts";

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.deleted",
]);

/**
 * The `stripe-webhooks-v1` edge function handles all incomming Stripe webhooks.
 * It is used to update the subscription status of a user in the database.
 *
 * To test this function locally, you can use the following commands:
 *   stripe login
 *   stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhooks-v1
 */
Deno.serve(async (req) => {
  try {
    const signature = req.headers.get("Stripe-Signature");
    const body = await req.text();

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      FEEDDECK_STRIPE_WEBHOOK_SIGNING_SECRET,
      undefined,
      cryptoProvider,
    );

    log("debug", "Received event", { event: event.type });

    if (!relevantEvents.has(event.type)) {
      return new Response(JSON.stringify({ received: true }));
    }

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await manageSubscriptionStatusChange(
          subscription.customer as string,
          event.type === "customer.subscription.created",
        );
        return new Response(JSON.stringify({ received: true }));
      }
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        if (checkoutSession.mode === "subscription") {
          await manageSubscriptionStatusChange(
            checkoutSession.customer as string,
            true,
          );
        }
        return new Response(JSON.stringify({ received: true }));
      }
      default:
        throw new Error("Unhandled relevant event");
    }
  } catch (err) {
    log("error", "An unexpected error occured", { error: err });
    return new Response("An unexpected error occured", {
      status: 400,
    });
  }
});
