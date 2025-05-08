/*
  # Fix RLS policy for bookmark order updates

  1. Changes
    - Drop existing update policy
    - Create new update policy that explicitly allows order updates
    
  2. Security
    - Maintain existing RLS policies for other operations
    - Ensure users can only update their own bookmarks
    - Explicitly allow order updates for owned bookmarks
*/

-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON bookmarks;

-- Create new update policy that explicitly handles order updates
CREATE POLICY "Users can update their own bookmarks"
  ON bookmarks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);