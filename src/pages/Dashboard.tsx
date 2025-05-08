import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import BookmarkForm from '../components/bookmarks/BookmarkForm';
import BookmarkList from '../components/bookmarks/BookmarkList';
import TagFilter from '../components/bookmarks/TagFilter';
import type { Bookmark, BookmarkFormData } from '../types/types';
import { addBookmark, deleteBookmark, fetchBookmarks } from '../services/bookmark.service';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadBookmarks();
    }
  }, [user]);

  const loadBookmarks = async () => {
    try {
      const data = await fetchBookmarks(user!.id);
      setBookmarks(data);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      setError('Failed to load bookmarks. Please try again.');
    }
  };

  const handleAddBookmark = async (data: BookmarkFormData) => {
    setError(null);
    try {
      setIsLoading(true);
      const tags = data.tags
        ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [];
      
      const newBookmark = await addBookmark({ ...data, tags }, user!.id);
      setBookmarks([newBookmark, ...bookmarks]);
      
      if (newBookmark.summary === null) {
        setError('Bookmark saved, but summary generation failed. You can try updating the bookmark later.');
      }
    } catch (error: any) {
      console.error('Error adding bookmark:', error);
      // Extract the detailed error message if available
      const errorDetails = error.response?.data?.details || error.message;
      setError(`Failed to save bookmark: ${errorDetails}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      await deleteBookmark(id);
      setBookmarks(bookmarks.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      setError('Failed to delete bookmark. Please try again.');
    }
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const allTags = Array.from(
    new Set(bookmarks.flatMap(b => b.tags || []))
  ).sort();

  const filteredBookmarks = selectedTags.length > 0
    ? bookmarks.filter(b => 
        selectedTags.every(tag => b.tags?.includes(tag))
      )
    : bookmarks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Add New Bookmark
          </h2>
          {error && (
            <div className="mb-4 p-4 text-amber-800 bg-amber-50 dark:bg-amber-900 dark:text-amber-100 rounded-md">
              {error}
            </div>
          )}
          <BookmarkForm
            onSubmit={handleAddBookmark}
            isLoading={isLoading}
          />
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Your Bookmarks
          </h2>
          <div className="mb-6">
            <TagFilter
              tags={allTags}
              selectedTags={selectedTags}
              onTagSelect={handleTagSelect}
            />
          </div>
          <BookmarkList
            bookmarks={filteredBookmarks}
            onDelete={handleDeleteBookmark}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;