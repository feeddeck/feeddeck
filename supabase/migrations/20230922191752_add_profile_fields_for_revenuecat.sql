------------------------------------------------------------------------------------------------------------------------
-- Add a new "subscriptionProvider" column to the "profiles" table, which is used to store the provider for a users
-- subscription. When a user is on the "free" tier, this column will be NULL. If the user is on the "premium" tier, this
-- column can be "stripe" or "revenuecat".
------------------------------------------------------------------------------------------------------------------------
ALTER TABLE "profiles"
ADD COLUMN "subscriptionProvider" VARCHAR(255) DEFAULT NULL;
