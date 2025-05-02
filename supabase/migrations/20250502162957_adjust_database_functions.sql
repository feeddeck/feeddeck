------------------------------------------------------------------------------------------------------------------------
-- Update all database functions:
-- - Set `search_path` for all database functions, as this is recommended by the Supabase security advisor
-- - Fix `items_delete` functions: The function was never working, which caused that we saved to many items for a
--   source, which slowed down our performance
-- - Revoke execution rights for users for the `sources_delete_files` and `items_delete` functions
------------------------------------------------------------------------------------------------------------------------

-- profiles
CREATE OR REPLACE FUNCTION profiles_update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW."updatedAt" = EXTRACT(EPOCH FROM NOW());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION profiles_create_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- decks
CREATE OR REPLACE FUNCTION decks_update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW."updatedAt" = EXTRACT(EPOCH FROM NOW());
  RETURN NEW;
END;
$$;

-- columns
CREATE OR REPLACE FUNCTION columns_update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW."updatedAt" = EXTRACT(EPOCH FROM NOW());
  RETURN NEW;
END;
$$;

-- sources
CREATE OR REPLACE FUNCTION sources_update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW."updatedAt" = EXTRACT(EPOCH FROM NOW());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION sources_delete_file()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer
SET search_path = ''
AS $$
DECLARE
  supabase_api_url TEXT;
  supabase_service_role_key TEXT;
BEGIN
  SELECT value INTO supabase_api_url FROM public.settings WHERE name = 'supabase_api_url';
  SELECT value INTO supabase_service_role_key FROM public.settings WHERE name = 'supabase_service_role_key';

  IF (old.icon IS NOT NULL AND NOT starts_with(old.icon, 'https://')) THEN
    PERFORM
      net.http_delete(
        url:=supabase_api_url||'/storage/v1/object/sources/'||old.icon,
        headers:=('{"Authorization": "Bearer ' || supabase_service_role_key || '"}')::jsonb
      );
  END IF;

  RETURN old;
END;
$$;

CREATE OR REPLACE FUNCTION sources_delete_files()
RETURNS void
LANGUAGE plpgsql
SECURITY definer
SET search_path = ''
SET statement_timeout TO '300s'
AS $$
DECLARE
  supabase_api_url TEXT;
  supabase_service_role_key TEXT;
  file_name TEXT;
BEGIN
  SELECT value INTO supabase_api_url FROM public.settings WHERE name = 'supabase_api_url';
  SELECT value INTO supabase_service_role_key FROM public.settings WHERE name = 'supabase_service_role_key';

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
$$;

REVOKE EXECUTE ON FUNCTION public.sources_delete_files FROM public;
REVOKE EXECUTE ON FUNCTION public.sources_delete_files FROM anon, authenticated;

-- items
CREATE OR REPLACE FUNCTION items_update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW."updatedAt" = EXTRACT(EPOCH FROM NOW());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION items_delete()
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
SET statement_timeout TO '600s'
AS $$
DECLARE
  source_id VARCHAR(4096);
BEGIN
  raise log 'Start items_delete';

  FOR source_id IN
    SELECT id FROM public.sources WHERE "updatedAt" > EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 days'))
  LOOP
    DELETE FROM public.items WHERE "sourceId" = source_id AND "createdAt" < EXTRACT(EPOCH FROM (NOW() - INTERVAL '30 days')) AND NOT "isBookmarked" AND id NOT IN (
      SELECT id FROM public.items WHERE "sourceId" = source_id ORDER BY "createdAt" DESC LIMIT 100
    );
  END LOOP;

  raise log 'Finished items_delete';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.items_delete FROM public;
REVOKE EXECUTE ON FUNCTION public.items_delete FROM anon, authenticated;
