/**
 * Supabase Configuration
 * - FEEDDECK_SUPABASE_SITE_URL is the site url of the Supabase project as it
 *   must be provided in the Authentication -> URL Configuration -> Site URL
 *   section in the Supabase Studio.
 * - FEEDDECK_SUPABASE_URL is the url of the Supabase project as it is shown in
 *   the Project Settings -> API section in the Supabase Studio.
 * - FEEDDECK_SUPABASE_ANON_KEY is the anon key of the Supabase project as it is
 *   shown in the Project Settings -> API section in the Supabase Studio.
 * - FEEDDECK_SUPABASE_SERVICE_ROLE_KEY is the service role key of the Supabase
 *   project as it is shown in the Project Settings -> API section in the
 *   Supabase Studio.
 */
export const FEEDDECK_SUPABASE_SITE_URL = Deno.env.get('SUPABASE_SITE_URL') ??
  Deno.env.get('FEEDDECK_SUPABASE_SITE_URL') ?? '';
export const FEEDDECK_SUPABASE_URL = Deno.env.get('SUPABASE_URL') ??
  Deno.env.get('FEEDDECK_SUPABASE_URL') ?? '';
export const FEEDDECK_SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ??
  Deno.env.get('FEEDDECK_SUPABASE_ANON_KEY') ?? '';
export const FEEDDECK_SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
    Deno.env.get('FEEDDECK_SUPABASE_SERVICE_ROLE_KEY') ?? '';

/**
 * Encryption Configuration for Accounts
 * - FEEDDECK_ENCRYPTION_KEY is the encryption key used to encrypt the accounts
 *   of an user like the personal access token for the GitHub account of the
 *   user.
 * - FEEDDECK_ENCRYPTION_IV is the initialization vector used to encrypt the
 *   accounts of an user.
 *
 * Note: The FEEDDECK_ENCRYPTION_KEY and FEEDDECK_ENCRYPTION_IV can be generated
 * using the following command:
 *   deno run --allow-net --allow-env --import-map=./supabase/functions/import_map.json ./supabase/functions/_cmd/cmd.ts tools generate-key
 */
export const FEEDDECK_ENCRYPTION_KEY =
  Deno.env.get('FEEDDECK_ENCRYPTION_KEY') ?? '';
export const FEEDDECK_ENCRYPTION_IV = Deno.env.get('FEEDDECK_ENCRYPTION_IV') ??
  '';

/**
 * Redis Configuration
 * - FEEDDECK_REDIS_HOSTNAME is the hostname of the Redis instance, used for the
 *   scheduler and worker.
 * - FEEDDECK_REDIS_PORT is the port of the Redis instance, used for the
 *   scheduler and worker.
 * - FEEDDECK_REDIS_USERNAME is the username which is used for the Redis
 *   connection.
 * - FEEDDECK_REDIS_PASSWORD is the password which is used for the Redis
 *   connection.
 */
export const FEEDDECK_REDIS_HOSTNAME =
  Deno.env.get('FEEDDECK_REDIS_HOSTNAME') ?? '127.0.0.1';
export const FEEDDECK_REDIS_PORT = Deno.env.get('FEEDDECK_REDIS_PORT') ?? 6379;
export const FEEDDECK_REDIS_USERNAME =
  Deno.env.get('FEEDDECK_REDIS_USERNAME') ?? undefined;
export const FEEDDECK_REDIS_PASSWORD =
  Deno.env.get('FEEDDECK_REDIS_PASSWORD') ?? undefined;

/**
 * Stripe Configuration
 * - FEEDDECK_STRIPE_API_KEY is the API key to access the Stripe API.
 * - FEEDDECK_STRIPE_PRICE_ID is the id of the price used for the subscription.
 * - FEEDDECK_STRIPE_WEBHOOK_SIGNING_SECRET is the signing secret used to verify
 *   the Stripe webhook calls.
 * - FEEDDECK_REVENUECAT_WEBHOOK_HEADER is the value of the authorization header
 *   send by RevenueCat.
 */
export const FEEDDECK_STRIPE_API_KEY =
  Deno.env.get('FEEDDECK_STRIPE_API_KEY') ?? '';
export const FEEDDECK_STRIPE_PRICE_ID =
  Deno.env.get('FEEDDECK_STRIPE_PRICE_ID') ?? '';
export const FEEDDECK_STRIPE_WEBHOOK_SIGNING_SECRET =
  Deno.env.get('FEEDDECK_STRIPE_WEBHOOK_SIGNING_SECRET') ?? '';
export const FEEDDECK_REVENUECAT_WEBHOOK_HEADER =
  Deno.env.get('FEEDDECK_REVENUECAT_WEBHOOK_HEADER') ?? '';

/**
 * Source Configuration
 * - FEEDDECK_SOURCE_NITTER_INSTANCE is the url of the Nitter instance used by
 *   FeedDeck.
 * - FEEDDECK_SOURCE_NITTER_BASIC_AUTH is the basic auth header used to scrape
 *   the Nitter instance.
 * - FEEDDECK_SOURCE_YOUTUBE_API_KEY is the API key used to access the YouTube
 *   API.
 */
export const FEEDDECK_SOURCE_NITTER_INSTANCE =
  Deno.env.get('FEEDDECK_SOURCE_NITTER_INSTANCE') ?? '';
export const FEEDDECK_SOURCE_NITTER_BASIC_AUTH =
  Deno.env.get('FEEDDECK_SOURCE_NITTER_BASIC_AUTH') ?? '';
export const FEEDDECK_SOURCE_YOUTUBE_API_KEY =
  Deno.env.get('FEEDDECK_SOURCE_YOUTUBE_API_KEY') ?? '';
