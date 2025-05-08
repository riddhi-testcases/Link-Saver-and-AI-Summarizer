import React from 'react';
import type { Bookmark } from '../../types/types';
import BookmarkItem from './BookmarkItem';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onDelete: (id: string) => Promise<void>;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onDelete }) => {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No bookmarks saved yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <BookmarkItem
          key={bookmark.id}
          bookmark={bookmark}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BookmarkList;