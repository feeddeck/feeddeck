------------------------------------------------------------------------------------------------------------------------
-- The "settings" table is used to store the settings for the Supabase instance, so we can access them within our
-- database queries.
------------------------------------------------------------------------------------------------------------------------
CREATE TABLE "settings" (
  name TEXT PRIMARY KEY,
  value TEXT
);

------------------------------------------------------------------------------------------------------------------------
-- Enable RLS so that users can not access the table.
------------------------------------------------------------------------------------------------------------------------
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------------------------------------------------------------------
-- For the development we create all the settings we need here. In production we have to replace them with the correct
-- values.
------------------------------------------------------------------------------------------------------------------------
INSERT INTO "settings" (name, value) VALUES ('supabase_api_url', '');
INSERT INTO "settings" (name, value) VALUES ('supabase_service_role_key', '');
