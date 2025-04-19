------------------------------------------------------------------------------------------------------------------------
-- Add a new "postion" column to the "sources" table, which is used to store the position of a source within a column.
-- This is required, so that users are able to sort the sources within a column.
------------------------------------------------------------------------------------------------------------------------
ALTER TABLE "sources"
ADD COLUMN "position" SMALLINT DEFAULT NULL;
