/*
  # Add tags and order to bookmarks table

  1. Changes
    - Add tags array column to bookmarks table
    - Add order column for drag-and-drop reordering
    - Update existing bookmarks with default values

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns
ALTER TABLE bookmarks
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- Update existing bookmarks with sequential order
DO $$
DECLARE
  bookmark_record RECORD;
  counter INTEGER := 0;
BEGIN
  FOR bookmark_record IN 
    SELECT id FROM bookmarks ORDER BY created_at ASC
  LOOP
    UPDATE bookmarks 
    SET "order" = counter 
    WHERE id = bookmark_record.id;
    counter := counter + 1;
  END LOOP;
END $$;