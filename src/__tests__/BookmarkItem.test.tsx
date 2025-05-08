import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BookmarkItem from '../components/bookmarks/BookmarkItem';
import type { Bookmark } from '../types/types';

const mockBookmark: Bookmark = {
  id: '1',
  url: 'https://example.com',
  title: 'Example Website',
  favicon: 'https://example.com/favicon.ico',
  summary: 'This is a test summary',
  created_at: '2025-03-15T12:00:00Z'
};

describe('BookmarkItem', () => {
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders bookmark information correctly', () => {
    render(<BookmarkItem bookmark={mockBookmark} onDelete={mockOnDelete} />);

    expect(screen.getByText('Example Website')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('This is a test summary')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockBookmark.favicon);
  });

  it('calls onDelete when delete button is clicked', async () => {
    render(<BookmarkItem bookmark={mockBookmark} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockBookmark.id);
    });
  });

  it('handles missing favicon gracefully', () => {
    const bookmarkWithoutFavicon = { ...mockBookmark, favicon: null };
    render(<BookmarkItem bookmark={bookmarkWithoutFavicon} onDelete={mockOnDelete} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('handles missing title by showing domain', () => {
    const bookmarkWithoutTitle = { ...mockBookmark, title: null };
    render(<BookmarkItem bookmark={bookmarkWithoutTitle} onDelete={mockOnDelete} />);

    expect(screen.getByText('example.com')).toBeInTheDocument();
  });
});