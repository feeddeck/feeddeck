------------------------------------------------------------------------------------------------------------------------
-- The "items" table is used to store all items. Each item belongs to a user and source must have a title and link. The
-- media, description and author fields are optional, but should be set whenever possible to provide a better user
-- experience. The isRead and isBookmarked fields are used to track the state of the item, e.g. was is already read by
-- a user or is it bookmarked so the user can read it later. The publishedAt field is used to sort the items by their
-- publication date.
------------------------------------------------------------------------------------------------------------------------
CREATE TABLE "items" (
  "id" VARCHAR(4096) PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "columnId" UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  "sourceId" VARCHAR(4096) NOT NULL REFERENCES sources(id) ON DELETE CASCADE,

  "title" TEXT NOT NULL,
  "link" TEXT NOT NULL,
  "media" TEXT,
  "description" TEXT,
  "author" TEXT,
  "options" JSONB DEFAULT NULL,

  "isRead" BOOLEAN DEFAULT false,
  "isBookmarked" BOOLEAN DEFAULT false,

  "publishedAt" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  "createdAt" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  "updatedAt" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())
);

------------------------------------------------------------------------------------------------------------------------
-- The "items" table also contains a tsvector column named tsv which is used to perform full text search on the "title"
-- and "description" fields.
------------------------------------------------------------------------------------------------------------------------
ALTER TABLE "items" ADD COLUMN tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', "description" || ' ' || "title")) stored;
CREATE INDEX items_tsx ON "items" USING gin(tsv);

------------------------------------------------------------------------------------------------------------------------
-- Enable RLS so that users can only update, delete and select their own items. User should not be able to insert new
-- items, since this is handled by an edge function.
------------------------------------------------------------------------------------------------------------------------
ALTER TABLE "items" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can update own items" ON "items" FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "User can delete own items" ON "items" FOR DELETE USING (auth.uid() = "userId");
CREATE POLICY "User can select own items" ON "items" FOR SELECT USING (auth.uid() = "userId");

------------------------------------------------------------------------------------------------------------------------
-- The "items_update_updated_at" function and trigger is used to automatically update the "updatedAt" field on each
-- operation.
------------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION items_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = EXTRACT(EPOCH FROM NOW());
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE TRIGGER items_update_updated_at BEFORE UPDATE ON "items" FOR EACH ROW EXECUTE PROCEDURE items_update_updated_at();

------------------------------------------------------------------------------------------------------------------------
-- The "items_delete_file" function and trigger is used to automatically delete the media file from Supabase storage
-- when an item is deleted.
------------------------------------------------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION items_delete_file()
RETURNS trigger AS $$
DECLARE
  supabase_api_url TEXT;
  supabase_service_role_key TEXT;
BEGIN
  SELECT value INTO supabase_api_url FROM settings WHERE name = 'supabase_api_url';
  SELECT value INTO supabase_service_role_key FROM settings WHERE name = 'supabase_service_role_key';

  IF (old.media IS NOT NULL AND NOT starts_with(old.media, 'https://')) THEN
    -- raise log 'items_delete_file: %', supabase_api_url||'/storage/v1/object/items/'||file_name;
    PERFORM
      net.http_delete(
        url:=supabase_api_url||'/storage/v1/object/items/'||old.media,
        headers:=('{"Authorization": "Bearer ' || supabase_service_role_key || '"}')::jsonb
      );
  END IF;

  RETURN old;
END;
$$ LANGUAGE 'plpgsql' SECURITY definer SET search_path = extensions, public;

CREATE OR REPLACE TRIGGER items_delete_file AFTER DELETE ON "items" FOR EACH ROW EXECUTE PROCEDURE items_delete_file();

------------------------------------------------------------------------------------------------------------------------
--- The "items_delete_files" function is used to delete all item media files from Supabase storage which are not
--- referenced by any item and which where not updated within the last 30 days. This function is scheduled to run every
--- 10 minutes.
------------------------------------------------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "extensions";

SELECT
  cron.schedule(
    'invoke-items_delete_files',
    '*/10 * * * *',
    $$
      SELECT items_delete_files();
    $$
  );

CREATE OR REPLACE FUNCTION items_delete_files()
RETURNS void AS $$
DECLARE
  supabase_api_url TEXT;
  supabase_service_role_key TEXT;
  file_name TEXT;
BEGIN
  SELECT value INTO supabase_api_url FROM settings WHERE name = 'supabase_api_url';
  SELECT value INTO supabase_service_role_key FROM settings WHERE name = 'supabase_service_role_key';

  raise log 'Start items_delete_files';

  FOR file_name IN
    SELECT name FROM storage.objects WHERE bucket_id = 'items' AND updated_at < NOW() - INTERVAL '30 days' AND name NOT IN (SELECT media FROM public.items)
  LOOP
    -- raise log 'items_delete_files: %', supabase_api_url||'/storage/v1/object/items/'||file_name;
    PERFORM
      net.http_delete(
        url:=supabase_api_url||'/storage/v1/object/items/'||file_name,
        headers:=('{"Authorization": "Bearer ' || supabase_service_role_key || '"}')::jsonb
      );
  END LOOP;

  raise log 'Finished items_delete_files';
END;
$$ LANGUAGE 'plpgsql' SECURITY definer SET search_path = extensions, storage, public;

------------------------------------------------------------------------------------------------------------------------
--- The "items_delete" function is used to delete all items which are older then 30 days and which are not bookmarked,
--- beesides that we also keep the last 100 items per source. For that we are selecting all sources which were updated
--- within the last 30 days first and then loop through the sources to the delete the items. This function is scheduled
--- to run daily at 03:00.
------------------------------------------------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "extensions";

SELECT
  cron.schedule(
    'invoke-items_delete',
    '0 3 * * *',
    $$
      SELECT items_delete();
    $$
  );

CREATE OR REPLACE FUNCTION items_delete()
RETURNS void AS $$
DECLARE
  source_id UUID;
BEGIN
  raise log 'Start items_delete';

  FOR source_id IN
    SELECT id FROM sources WHERE updatedAt > EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 days'))
  LOOP
    DELETE FROM items WHERE sourceId = source_id AND createdAt < EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 days')) AND NOT isBookmarked AND id NOT IN (
      SELECT id FROM items WHERE sourceId = source_id ORDER BY createdAt DESC LIMIT 100
    );
  END LOOP;

  raise log 'Finished items_delete';
END;
$$ LANGUAGE 'plpgsql';
