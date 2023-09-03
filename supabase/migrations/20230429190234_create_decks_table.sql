------------------------------------------------------------------------------------------------------------------------
-- The "decks" table is used to store all decks. Each deck belongs to a user and must have a name.
------------------------------------------------------------------------------------------------------------------------
CREATE TABLE "decks" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  "name" VARCHAR(255) NOT NULL,

  "createdAt" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()),
  "updatedAt" BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())
);

------------------------------------------------------------------------------------------------------------------------
-- Enable RLS so that users can only insert, update, delete and select their own decks.
------------------------------------------------------------------------------------------------------------------------
ALTER TABLE "decks" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can insert own decks" ON "decks" FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "User can update own decks" ON "decks" FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "User can delete own decks" ON "decks" FOR DELETE USING (auth.uid() = "userId");
CREATE POLICY "User can select own decks" ON "decks" FOR SELECT USING (auth.uid() = "userId");

------------------------------------------------------------------------------------------------------------------------
-- The "decks_update_updated_at" function and trigger is used to automatically update the "updatedAt" field on each
-- operation.
------------------------------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION decks_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = EXTRACT(EPOCH FROM NOW());
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE OR REPLACE TRIGGER decks_update_updated_at BEFORE UPDATE ON "decks" FOR EACH ROW EXECUTE PROCEDURE decks_update_updated_at();
