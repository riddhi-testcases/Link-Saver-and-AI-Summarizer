import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Bookmark } from '../../types/types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface BookmarkItemProps {
  bookmark: Bookmark;
  onDelete: (id: string) => Promise<void>;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, onDelete }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!bookmark || !bookmark.url) {
    return null;
  }

  const handleDelete = async () => {
    if (!bookmark.id) return;
    
    try {
      setIsDeleting(true);
      await onDelete(bookmark.id);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format the summary with proper line breaks and section highlighting
  const formatSummary = (text: string | null) => {
    if (!text) return '';
    
    return text.split('\n\n').map((block, i) => {
      // Check if the block is a heading (starts with ##)
      if (block.startsWith('##')) {
        return (
          <h4 key={i} className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
            {block.replace('##', '').trim()}
          </h4>
        );
      }
      
      // Handle regular paragraphs
      return (
        <p key={i} className="mt-2 leading-relaxed">
          {block.split('\n').map((line, j) => (
            <React.Fragment key={j}>
              {line}
              {j < block.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  // Create a preview of the summary
  const createSummaryPreview = (text: string | null) => {
    if (!text) return '';
    
    // Remove heading markers and get first paragraph
    const cleanText = text.replace(/##\s*/g, '');
    const firstParagraph = cleanText.split('\n\n')[0];
    
    if (firstParagraph.length <= 280) return firstParagraph;
    
    // Truncate to nearest sentence within 280 characters
    const sentences = firstParagraph.match(/[^.!?]+[.!?]+/g) || [];
    let preview = '';
    
    for (const sentence of sentences) {
      if ((preview + sentence).length > 280) break;
      preview += sentence;
    }
    
    return preview.trim() + '...';
  };

  const getDisplayTitle = () => {
    try {
      return bookmark.title || new URL(bookmark.url).hostname;
    } catch (error) {
      return bookmark.url;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {bookmark.favicon && (
              <img
                src={bookmark.favicon}
                alt=""
                className="w-6 h-6"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {getDisplayTitle()}
              </h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {decodeURIComponent(bookmark.url)}
              </a>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        {bookmark.summary && (
          <div className="mt-3">
            <div className="text-sm text-gray-600 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none">
              {isExpanded ? (
                formatSummary(bookmark.summary)
              ) : (
                <p>{createSummaryPreview(bookmark.summary)}</p>
              )}
            </div>
            {bookmark.summary.length > 280 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm mt-2 font-medium"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Saved on {bookmark.created_at ? new Date(bookmark.created_at).toLocaleDateString() : 'Unknown date'}
        </div>
      </div>
    </Card>
  );
};

export default BookmarkItem;