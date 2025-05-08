import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookmarkForm from '../components/bookmarks/BookmarkForm';

describe('BookmarkForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<BookmarkForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Bookmark/i })).toBeInTheDocument();
  });

  it('validates required URL field', async () => {
    render(<BookmarkForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /Save Bookmark/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/URL is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates URL format', async () => {
    render(<BookmarkForm onSubmit={mockOnSubmit} />);
    
    const urlInput = screen.getByLabelText(/URL/i);
    await userEvent.type(urlInput, 'invalid-url');
    
    const submitButton = screen.getByRole('button', { name: /Save Bookmark/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Please enter a valid URL/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(<BookmarkForm onSubmit={mockOnSubmit} />);
    
    const urlInput = screen.getByLabelText(/URL/i);
    const tagsInput = screen.getByLabelText(/Tags/i);
    
    await userEvent.type(urlInput, 'https://example.com');
    await userEvent.type(tagsInput, 'tech, news');
    
    const submitButton = screen.getByRole('button', { name: /Save Bookmark/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        url: 'https://example.com',
        tags: 'tech, news'
      });
    });
  });

  it('shows loading state when isLoading prop is true', () => {
    render(<BookmarkForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /Save Bookmark/i });
    expect(submitButton).toBeDisabled();
    expect(document.querySelector('svg')).toBeInTheDocument(); // Loading spinner
  });

  it('resets form after successful submission', async () => {
    render(<BookmarkForm onSubmit={mockOnSubmit} />);
    
    const urlInput = screen.getByLabelText(/URL/i);
    const tagsInput = screen.getByLabelText(/Tags/i);
    
    await userEvent.type(urlInput, 'https://example.com');
    await userEvent.type(tagsInput, 'tech, news');
    
    const submitButton = screen.getByRole('button', { name: /Save Bookmark/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(urlInput).toHaveValue('');
      expect(tagsInput).toHaveValue('');
    });
  });
});