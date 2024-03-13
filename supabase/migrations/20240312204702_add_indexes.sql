------------------------------------------------------------------------------------------------------------------------
-- Create indexes for the "userId" column on the "decks", "columns", "sources", and "items" tables. These indexes are
-- used to optimize RLS policies and queries that filter by "userId", see
-- https://supabase.com/docs/guides/database/postgres/row-level-security#add-indexes
--
-- Create indexes for the "deckId", "columnId" and "sourceId" columns to optimize queries that filter by these columns.
------------------------------------------------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "decks_userId_idx" ON "decks" USING btree ("userId");

CREATE INDEX IF NOT EXISTS "columns_userId_idx" ON "columns" USING btree ("userId");
CREATE INDEX IF NOT EXISTS "columns_deckId_idx" ON "columns" USING btree ("deckId");

CREATE INDEX IF NOT EXISTS "sources_userId_idx" ON "sources" USING btree ("userId");
CREATE INDEX IF NOT EXISTS "sources_columnId_idx" ON "sources" USING btree ("columnId");

CREATE INDEX IF NOT EXISTS "items_userId_idx" ON "items" USING btree ("userId");
CREATE INDEX IF NOT EXISTS "items_columnId_idx" ON "items" USING btree ("columnId");
CREATE INDEX IF NOT EXISTS "items_sourceId_idx" ON "items" USING btree ("sourceId");
