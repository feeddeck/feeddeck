------------------------------------------------------------------------------------------------------------------------
-- The "sources" table is used to store all sources. Each source belongs to a user and column must have a type, title
-- and options for the specified type.The link and icon fields are optional, but should be set whenever possible to
-- provide a better user experience.
------------------------------------------------------------------------------------------------------------------------
CREATE TABLE "sources" (
  "id" VARCHAR(4096) PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "columnId" UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,

  "type" VARCHAR(255) NOT NULL,
  "title" TEXT NOT NULL,
  "options" JSONB,
  "link" TEXT,
  "icon" TEXT,

  "createdAt" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  "updatedAt" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())
);

------------------------------------------------------------------------------------------------------------------------
-- Enable RLS so that users can only update, delete and select their own sources. User should not be able to insert new
-- sources, since this is handled by an edge function, so that we can apply some rate limiting logic before inserting a
-- new source.
------------------------------------------------------------------------------------------------------------------------
ALTER TABLE "sources" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can update own sources" ON "sources" FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "User can delete own sources" ON "sources" FOR DELETE USING (auth.uid() = "userId");
CREATE POLICY "User can select own sources" ON "sources" FOR SELECT USING (auth.uid() = "userId");

------------------------------------------------------------------------------------------------------------------------
-- The "sources_update_updated_at" function and trigger is used to automatically update the "updatedAt" field on each
-- operation.
------------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sources_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = EXTRACT(EPOCH FROM NOW());
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE TRIGGER sources_update_updated_at BEFORE UPDATE ON "sources" FOR EACH ROW EXECUTE PROCEDURE sources_update_updated_at();

------------------------------------------------------------------------------------------------------------------------
-- The "sources_delete_file" function and trigger is used to automatically delete the icon file from Supabase storage
-- when a source is deleted.
------------------------------------------------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION sources_delete_file()
RETURNS trigger AS $$
DECLARE
  supabase_api_url TEXT;
  supabase_service_role_key TEXT;
BEGIN
  SELECT value INTO supabase_api_url FROM settings WHERE name = 'supabase_api_url';
  SELECT value INTO supabase_service_role_key FROM settings WHERE name = 'supabase_service_role_key';

  IF (old.icon IS NOT NULL AND NOT starts_with(old.icon, 'https://')) THEN
    PERFORM
      net.http_delete(
        url:=supabase_api_url||'/storage/v1/object/sources/'||old.icon,
        headers:=('{"Authorization": "Bearer ' || supabase_service_role_key || '"}')::jsonb
      );
  END IF;

  RETURN old;
END;
$$ LANGUAGE 'plpgsql' SECURITY definer SET search_path = extensions, public;

CREATE OR REPLACE TRIGGER sources_delete_file AFTER DELETE ON "sources" FOR EACH ROW EXECUTE PROCEDURE sources_delete_file();


------------------------------------------------------------------------------------------------------------------------
--- The "sources_delete_files" function is used to delete all source icon files from Supabase storage which are not
--- referenced by any source and which where not updated within the last 30 days. This function is scheduled to run
--- every 10 minutes.
------------------------------------------------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "extensions";

SELECT
  cron.schedule(
    'invoke-sources_delete_files',
    '*/10 * * * *',
    $$
      SELECT sources_delete_files();
    $$
  );

CREATE OR REPLACE FUNCTION sources_delete_files()
RETURNS void AS $$
DECLARE
  supabase_api_url TEXT;
  supabase_service_role_key TEXT;
  file_name TEXT;
BEGIN
  SELECT value INTO supabase_api_url FROM settings WHERE name = 'supabase_api_url';
  SELECT value INTO supabase_service_role_key FROM settings WHERE name = 'supabase_service_role_key';

  raise log 'Start sources_delete_files';

  FOR file_name IN
    SELECT name FROM storage.objects WHERE bucket_id = 'sources' AND updated_at < NOW() - INTERVAL '30 days' AND name NOT IN (SELECT icon FROM public.sources)
  LOOP
    -- raise log 'sources_delete_files: %', supabase_api_url||'/storage/v1/object/sources/'||file_name;
    PERFORM
      net.http_delete(
        url:=supabase_api_url||'/storage/v1/object/sources/'||file_name,
        headers:=('{"Authorization": "Bearer ' || supabase_service_role_key || '"}')::jsonb
      );
  END LOOP;

  raise log 'Finished sources_delete_files';
END;
$$ LANGUAGE 'plpgsql' SECURITY definer SET search_path = extensions, storage, public;
