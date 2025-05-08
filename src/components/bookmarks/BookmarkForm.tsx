import React from 'react';
import { useForm } from 'react-hook-form';
import { BookmarkFormData } from '../../types/types';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface BookmarkFormProps {
  onSubmit: (data: BookmarkFormData) => Promise<void>;
  isLoading?: boolean;
}

const BookmarkForm: React.FC<BookmarkFormProps> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BookmarkFormData>();

  const handleFormSubmit = async (data: BookmarkFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Error submitting bookmark:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="URL"
        type="url"
        placeholder="https://example.com"
        {...register('url', {
          required: 'URL is required',
          pattern: {
            value: /^https?:\/\/.+/,
            message: 'Please enter a valid URL starting with http:// or https://'
          }
        })}
        error={errors.url?.message}
      />
      <Input
        label="Tags (comma-separated)"
        type="text"
        placeholder="tech, article, tutorial"
        {...register('tags')}
      />
      <Button
        type="submit"
        isLoading={isLoading}
        fullWidth
      >
        Save Bookmark
      </Button>
    </form>
  );
};

export default BookmarkForm;