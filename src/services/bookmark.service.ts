import { supabase } from '../lib/supabase';
import type { Bookmark, BookmarkFormData } from '../types/types';

export const fetchBookmarks = async (userId: string): Promise<Bookmark[]> => {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarks:', error);
    throw error;
  }

  return data || [];
};

export const addBookmark = async (bookmarkData: BookmarkFormData & { tags: string[] }, userId: string): Promise<Bookmark> => {
  try {
    // First, extract title and favicon from the URL
    const metadataResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-metadata`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: bookmarkData.url }),
    });

    if (!metadataResponse.ok) {
      throw new Error('Failed to fetch metadata');
    }

    const metadata = await metadataResponse.json();

    // Generate summary using Jina AI
    const summaryResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-summary`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: bookmarkData.url }),
    });

    if (!summaryResponse.ok) {
      throw new Error('Failed to generate summary');
    }

    const { summary } = await summaryResponse.json();

    // Save all data to Supabase
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        url: bookmarkData.url,
        title: metadata.title,
        favicon: metadata.favicon,
        summary,
        user_id: userId,
        tags: bookmarkData.tags
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addBookmark:', error);
    throw error;
  }
};

export const deleteBookmark = async (bookmarkId: string): Promise<void> => {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId);

  if (error) {
    console.error('Error deleting bookmark:', error);
    throw error;
  }
};