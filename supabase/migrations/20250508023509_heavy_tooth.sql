/*
  # Create bookmarks table and security policies

  1. New Tables
    - `bookmarks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `url` (text, required)
      - `title` (text, nullable)
      - `favicon` (text, nullable)
      - `summary` (text, nullable)
      - `created_at` (timestamptz, default: now())

  2. Security
    - Enable RLS on bookmarks table
    - Add policies for:
      - Select: Users can read their own bookmarks
      - Insert: Authenticated users can create bookmarks
      - Delete: Users can delete their own bookmarks
*/

CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  url text NOT NULL,
  title text,
  favicon text,
  summary text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_url CHECK (url ~ '^https?://.+')
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks"
  ON bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);