/*
  # Add UPDATE policy for bookmarks

  1. Changes
    - Add policy to allow users to update their own bookmarks
    
  2. Security
    - Maintain existing RLS policies
    - Add new policy for UPDATE operations
*/

-- Add policy for updating bookmarks
CREATE POLICY "Users can update their own bookmarks"
  ON bookmarks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);