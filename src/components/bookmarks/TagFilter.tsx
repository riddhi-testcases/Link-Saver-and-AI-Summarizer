import React from 'react';
import { Tag } from 'lucide-react';
import Button from '../ui/Button';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ 
  tags = [], 
  selectedTags = [], 
  onTagSelect 
}) => {
  if (!Array.isArray(tags) || tags.length === 0) return null;
  if (!Array.isArray(selectedTags)) return null;
  if (typeof onTagSelect !== 'function') return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Tag className="h-4 w-4" />
        <span>Filter by tags:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Button
            key={tag}
            variant={selectedTags.includes(tag) ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onTagSelect(tag)}
            className="text-sm"
          >
            {tag}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;