import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TagFilter from '../components/bookmarks/TagFilter';

describe('TagFilter', () => {
  const mockTags = ['tech', 'news', 'tutorial'];
  const mockOnTagSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when tags array is empty', () => {
    const { container } = render(
      <TagFilter tags={[]} selectedTags={[]} onTagSelect={mockOnTagSelect} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders all tags as buttons', () => {
    render(
      <TagFilter 
        tags={mockTags} 
        selectedTags={[]} 
        onTagSelect={mockOnTagSelect} 
      />
    );

    mockTags.forEach(tag => {
      expect(screen.getByRole('button', { name: tag })).toBeInTheDocument();
    });
  });

  it('shows selected tags with primary variant', () => {
    const selectedTags = ['tech'];
    render(
      <TagFilter 
        tags={mockTags} 
        selectedTags={selectedTags} 
        onTagSelect={mockOnTagSelect} 
      />
    );

    const techButton = screen.getByRole('button', { name: 'tech' });
    const newsButton = screen.getByRole('button', { name: 'news' });

    expect(techButton).toHaveClass('bg-blue-600');
    expect(newsButton).not.toHaveClass('bg-blue-600');
  });

  it('calls onTagSelect when a tag is clicked', () => {
    render(
      <TagFilter 
        tags={mockTags} 
        selectedTags={[]} 
        onTagSelect={mockOnTagSelect} 
      />
    );

    const techButton = screen.getByRole('button', { name: 'tech' });
    fireEvent.click(techButton);

    expect(mockOnTagSelect).toHaveBeenCalledWith('tech');
  });

  it('renders filter label with icon', () => {
    render(
      <TagFilter 
        tags={mockTags} 
        selectedTags={[]} 
        onTagSelect={mockOnTagSelect} 
      />
    );

    expect(screen.getByText(/Filter by tags:/i)).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument(); // Tag icon
  });

  it('handles multiple tag selections', () => {
    const selectedTags = ['tech', 'news'];
    render(
      <TagFilter 
        tags={mockTags} 
        selectedTags={selectedTags} 
        onTagSelect={mockOnTagSelect} 
      />
    );

    const techButton = screen.getByRole('button', { name: 'tech' });
    const newsButton = screen.getByRole('button', { name: 'news' });
    const tutorialButton = screen.getByRole('button', { name: 'tutorial' });

    expect(techButton).toHaveClass('bg-blue-600');
    expect(newsButton).toHaveClass('bg-blue-600');
    expect(tutorialButton).not.toHaveClass('bg-blue-600');
  });
});