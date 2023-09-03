------------------------------------------------------------------------------------------------------------------------
-- The "columns" table is used to store all columns. Each column belongs to a user and deck and must have a name and
-- position. The position identifies the position of a column in a deck, this means that each position value should be
-- unique for columns that belong to the same deck.
------------------------------------------------------------------------------------------------------------------------
CREATE TABLE "columns" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  "deckId" UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,

  "name" VARCHAR(255) NOT NULL,
  "position" SMALLINT NOT NULL CHECK (position >= 0),

  "createdAt" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  "updatedAt" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())
);

------------------------------------------------------------------------------------------------------------------------
-- Enable RLS so that users can only insert, update, delete and select their own columns.
------------------------------------------------------------------------------------------------------------------------
ALTER TABLE "columns" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can insert own columns" ON "columns" FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "User can update own columns" ON "columns" FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "User can delete own columns" ON "columns" FOR DELETE USING (auth.uid() = "userId");
CREATE POLICY "User can select own columns" ON "columns" FOR SELECT USING (auth.uid() = "userId");

------------------------------------------------------------------------------------------------------------------------
-- The "columns_update_updated_at" function and trigger is used to automatically update the "updatedAt" field on each
-- operation.
------------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION columns_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = EXTRACT(EPOCH FROM NOW());
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE TRIGGER columns_update_updated_at BEFORE UPDATE ON "columns" FOR EACH ROW EXECUTE PROCEDURE columns_update_updated_at();
