'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';
import { getCountryCode } from '@/lib/countries';

interface Recommendation {
  title: string;
  author: string;
  country: string;
  reason: string;
  significance?: string;
}

interface RecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: () => void;
}

export default function RecommendationsModal({
  isOpen,
  onClose,
  onBookAdded,
}: RecommendationsModalProps) {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingBookId, setAddingBookId] = useState<string | null>(null);
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set());

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get recommendations');
      }

      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recommendations. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (rec: Recommendation) => {
    const bookKey = `${rec.title}-${rec.author}`;
    if (addedBooks.has(bookKey)) return;
    setAddingBookId(bookKey);
    
    try {
      if (!session?.user) {
        alert('Please sign in to add books');
        return;
      }

      const countryCode = getCountryCode(rec.country);
      const res = await fetch('/api/books/to-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: rec.title.trim(),
          author: rec.author.trim(),
          countryCode: countryCode,
          countryName: rec.country,
          source: 'recommendation',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to add book');
      }

      setAddedBooks(prev => new Set(prev).add(bookKey));
      onBookAdded();
    } catch (err) {
      console.error('Failed to add book:', err);
      alert('Failed to add book to reading list. Please try again.');
    } finally {
      setAddingBookId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4">
      <div 
        className="rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
            🤖 AI Reading Coach
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

        {recommendations.length === 0 && !loading && !error && (
          <div className="text-center py-8">
            <p 
              className="mb-2 text-base sm:text-lg font-semibold"
              style={{ color: theme.colors.textPrimary }}
            >
              🌍 Start Your Literary Journey
            </p>
            <p 
              className="mb-4 text-sm sm:text-base"
              style={{ color: theme.colors.textSecondary }}
            >
              Get personalized book recommendations to explore literature from around the world!
            </p>
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.textOnPrimary,
              }}
            >
              {loading ? 'Loading...' : '✨ Get Recommendations'}
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: theme.colors.primary }}></div>
            <p style={{ color: theme.colors.textSecondary }}>
              {recommendations.length === 0 
                ? 'Discovering great books from around the world...'
                : 'Analyzing your reading history and generating new recommendations...'}
            </p>
          </div>
        )}

        {error && (
          <div 
            className="p-4 rounded-lg mb-4"
            style={{ 
              backgroundColor: theme.colors.cardBg,
              border: `1px solid ${theme.colors.cardBorder}`,
            }}
          >
            <p style={{ color: theme.colors.textPrimary }}>{error}</p>
            <button
              onClick={fetchRecommendations}
              className="mt-3 px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.textOnPrimary,
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p 
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                {recommendations.length} personalized recommendations
              </p>
              <button
                onClick={fetchRecommendations}
                className="text-sm px-3 py-1.5 rounded-lg font-medium"
                style={{
                  backgroundColor: theme.colors.cardBg,
                  border: `1px solid ${theme.colors.cardBorder}`,
                  color: theme.colors.textSecondary,
                }}
              >
                🔄 Get New Recommendations
              </button>
            </div>

            {recommendations.map((rec, index) => (
              <div
                key={`${rec.title}-${index}`}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: theme.colors.cardBg,
                  border: `1px solid ${theme.colors.cardBorder}`,
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <h3 
                      className="font-bold text-base sm:text-lg mb-1"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {rec.title}
                    </h3>
                    <p 
                      className="text-sm mb-2"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      by {rec.author} • {rec.country}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddBook(rec)}
                    disabled={addingBookId === `${rec.title}-${rec.author}` || addedBooks.has(`${rec.title}-${rec.author}`)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 whitespace-nowrap"
                    style={{
                      backgroundColor: addedBooks.has(`${rec.title}-${rec.author}`)
                        ? 'transparent'
                        : addingBookId === `${rec.title}-${rec.author}`
                          ? theme.colors.cardBorder
                          : theme.colors.primary,
                      color: addedBooks.has(`${rec.title}-${rec.author}`)
                        ? theme.colors.primary
                        : theme.colors.textOnPrimary,
                      border: addedBooks.has(`${rec.title}-${rec.author}`)
                        ? `1px solid ${theme.colors.cardBorder}`
                        : 'none',
                    }}
                  >
                    {addedBooks.has(`${rec.title}-${rec.author}`)
                      ? '✓ Added'
                      : addingBookId === `${rec.title}-${rec.author}`
                        ? 'Adding...'
                        : '+ Add to List'}
                  </button>
                </div>
                
                <p 
                  className="text-sm mb-2"
                  style={{ color: theme.colors.textSecondary }}
                >
                  <strong style={{ color: theme.colors.textPrimary }}>Why:</strong> {rec.reason}
                </p>
                
                {rec.significance && (
                  <p 
                    className="text-sm italic"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {rec.significance}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t" style={{ borderColor: theme.colors.cardBorder }}>
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: `1px solid ${theme.colors.cardBorder}`,
              color: theme.colors.textSecondary,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}