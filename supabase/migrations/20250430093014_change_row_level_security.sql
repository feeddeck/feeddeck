------------------------------------------------------------------------------------------------------------------------
-- Update all RLSs, to apply the new performance recommendations from Supabase.
------------------------------------------------------------------------------------------------------------------------
ALTER POLICY "User can insert own decks" ON "decks" TO authenticated WITH CHECK ((SELECT auth.uid()) = "userId");
ALTER POLICY "User can update own decks" ON "decks" TO authenticated USING ((SELECT auth.uid()) = "userId") WITH CHECK ((SELECT auth.uid()) = "userId");
ALTER POLICY "User can delete own decks" ON "decks" TO authenticated USING ((SELECT auth.uid()) = "userId");
ALTER POLICY "User can select own decks" ON "decks" TO authenticated USING ((SELECT auth.uid()) = "userId");

ALTER POLICY "User can insert own columns" ON "columns" TO authenticated WITH CHECK ((SELECT auth.uid()) = "userId");
ALTER POLICY "User can update own columns" ON "columns" TO authenticated USING ((SELECT auth.uid()) = "userId") WITH CHECK ((SELECT auth.uid()) = "userId");
ALTER POLICY "User can delete own columns" ON "columns" TO authenticated USING ((SELECT auth.uid()) = "userId");
ALTER POLICY "User can select own columns" ON "columns" TO authenticated USING ((SELECT auth.uid()) = "userId");

ALTER POLICY "User can update own sources" ON "sources" TO authenticated USING ((SELECT auth.uid()) = "userId") WITH CHECK ((SELECT auth.uid()) = "userId");
ALTER POLICY "User can delete own sources" ON "sources" TO authenticated USING ((SELECT auth.uid()) = "userId");
ALTER POLICY "User can select own sources" ON "sources" TO authenticated USING ((SELECT auth.uid()) = "userId");

ALTER POLICY "User can update own items" ON "items" TO authenticated USING ((SELECT auth.uid()) = "userId") WITH CHECK ((SELECT auth.uid()) = "userId");
ALTER POLICY "User can delete own items" ON "items" TO authenticated USING ((SELECT auth.uid()) = "userId");
ALTER POLICY "User can select own items" ON "items" TO authenticated USING ((SELECT auth.uid()) = "userId");
