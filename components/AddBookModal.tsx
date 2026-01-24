'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Book } from '@/types';
import { addBook as addLocalBook } from '@/lib/storage';
import { COUNTRIES, getCountryCode } from '@/lib/countries';
import { useTheme } from '@/context/ThemeContext';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: () => void;
  defaultCountry?: string;
}

export default function AddBookModal({
  isOpen,
  onClose,
  onBookAdded,
  defaultCountry = '',
}: AddBookModalProps) {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [country, setCountry] = useState(defaultCountry);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultCountry) {
      setCountry(defaultCountry);
    }
  }, [defaultCountry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !author || !country) {
      alert('Please fill in title, author, and country');
      return;
    }

    setLoading(true);

    try {
      if (session?.user) {
        // User is authenticated - use API
        const res = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            author: author.trim(),
            countryCode: getCountryCode(country),
            countryName: country,
            startDate: startDate || null,
            endDate: endDate || null,
            rating: rating > 0 ? rating : null,
            notes: notes.trim() || null,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to add book');
        }
      } else {
        // Guest user - use localStorage
        const book: Book = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          title: title.trim(),
          author: author.trim(),
          country: country,
          countryCode: getCountryCode(country),
          countryName: country,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          rating: rating > 0 ? rating : undefined,
          notes: notes.trim() || undefined,
        };
        addLocalBook(book);
      }

      onBookAdded();
      
      // Reset form
      setTitle('');
      setAuthor('');
      setCountry(defaultCountry);
      setStartDate('');
      setEndDate('');
      setRating(0);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Failed to add book:', error);
      alert('Failed to add book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4">
      <div 
        className="rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{ 
          backgroundColor: theme.colors.modalBg,
          boxShadow: theme.effects.shadowLg,
        }}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 
            className="text-xl sm:text-2xl font-bold"
            style={{ 
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.heading,
            }}
          >
            Add New Book
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: theme.colors.textMuted }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-1.5"
              style={{ color: theme.colors.textSecondary }}
            >
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
              style={{
                backgroundColor: theme.colors.inputBg,
                border: `1px solid ${theme.colors.inputBorder}`,
                color: theme.colors.textPrimary,
              }}
              required
              placeholder="Enter book title"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1.5"
              style={{ color: theme.colors.textSecondary }}
            >
              Author *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
              style={{
                backgroundColor: theme.colors.inputBg,
                border: `1px solid ${theme.colors.inputBorder}`,
                color: theme.colors.textPrimary,
              }}
              required
              placeholder="Enter author name"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1.5"
              style={{ color: theme.colors.textSecondary }}
            >
              Country *
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
              style={{
                backgroundColor: theme.colors.inputBg,
                border: `1px solid ${theme.colors.inputBorder}`,
                color: theme.colors.textPrimary,
              }}
              required
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label 
                className="block text-sm font-medium mb-1.5"
                style={{ color: theme.colors.textSecondary }}
              >
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
                style={{
                  backgroundColor: theme.colors.inputBg,
                  border: `1px solid ${theme.colors.inputBorder}`,
                  color: theme.colors.textPrimary,
                }}
              />
            </div>
            <div>
              <label 
                className="block text-sm font-medium mb-1.5"
                style={{ color: theme.colors.textSecondary }}
              >
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm sm:text-base"
                style={{
                  backgroundColor: theme.colors.inputBg,
                  border: `1px solid ${theme.colors.inputBorder}`,
                  color: theme.colors.textPrimary,
                }}
              />
            </div>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1.5"
              style={{ color: theme.colors.textSecondary }}
            >
              Rating
            </label>
            <div className="flex gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star === rating ? 0 : star)}
                  className="text-2xl sm:text-3xl transition-transform hover:scale-110"
                  style={{
                    color: star <= rating ? theme.colors.accent : theme.colors.inputBorder,
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1.5"
              style={{ color: theme.colors.textSecondary }}
            >
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm sm:text-base resize-none"
              style={{
                backgroundColor: theme.colors.inputBg,
                border: `1px solid ${theme.colors.inputBorder}`,
                color: theme.colors.textPrimary,
              }}
              placeholder="Any thoughts about the book..."
            />
          </div>

          <div className="flex gap-3 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base disabled:opacity-50"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${theme.colors.cardBorder}`,
                color: theme.colors.textSecondary,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-all hover:shadow-lg text-sm sm:text-base disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.textOnPrimary,
              }}
            >
              {loading ? 'Adding...' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
