'use client';

import { Book } from '@/types';
import { deleteBook } from '@/lib/storage';
import { useTheme } from '@/context/ThemeContext';

interface BookListProps {
  books: Book[];
  onBookDeleted: () => void;
}

export default function BookList({ books, onBookDeleted }: BookListProps) {
  const { theme } = useTheme();
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      deleteBook(id);
      onBookDeleted();
    }
  };

  if (books.length === 0) {
    return (
      <div 
        className="text-center py-8 sm:py-12"
        style={{ color: theme.colors.textMuted }}
      >
        <p className="text-base sm:text-lg">No books added yet for this country.</p>
        <p className="text-xs sm:text-sm mt-2">Click "Add Book" to start tracking!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {books.map((book) => (
        <div
          key={book.id}
          className="rounded-lg p-3 sm:p-4 transition-all hover:scale-[1.01]"
          style={{
            backgroundColor: theme.colors.cardBg,
            boxShadow: theme.effects.shadow,
            border: `1px solid ${theme.colors.cardBorder}`,
          }}
        >
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 
                className="text-base sm:text-xl font-bold truncate"
                style={{ 
                  color: theme.colors.textPrimary,
                  fontFamily: theme.fonts.heading,
                }}
              >
                {book.title}
              </h3>
              <p 
                className="text-sm sm:text-base mt-0.5 sm:mt-1 truncate"
                style={{ color: theme.colors.textSecondary }}
              >
                by {book.author}
              </p>
              {(book.startDate || book.endDate) && (
                <p 
                  className="text-xs sm:text-sm mt-1 sm:mt-2"
                  style={{ color: theme.colors.textMuted }}
                >
                  📅 {book.startDate ? new Date(book.startDate).toLocaleDateString() : '—'} 
                  {' → '}
                  {book.endDate ? new Date(book.endDate).toLocaleDateString() : 'In Progress'}
                </p>
              )}
              {book.rating && (
                <div className="mt-1 sm:mt-2">
                  <span style={{ color: theme.colors.accent }}>
                    {'★'.repeat(book.rating)}
                  </span>
                  <span style={{ color: theme.colors.textMuted }}>
                    {'☆'.repeat(5 - book.rating)}
                  </span>
                </div>
              )}
              {book.notes && (
                <p 
                  className="mt-2 text-xs sm:text-sm line-clamp-2"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {book.notes}
                </p>
              )}
            </div>
            <button
              onClick={() => handleDelete(book.id)}
              className="p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0"
              style={{ color: theme.colors.textMuted }}
              aria-label="Delete book"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
