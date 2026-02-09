'use client';

import { useState, useCallback, memo } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';
import RecommendationCard, { BookRecommendation } from './RecommendationCard';

interface AIRecommendationsProps {
  totalBooks: number;
  onAddedToReadList?: () => void;
}

function AIRecommendations({ totalBooks, onAddedToReadList }: AIRecommendationsProps) {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [recommendation, setRecommendation] = useState<BookRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = useCallback(async () => {
    if (!session?.user) {
      setError('Please sign in to get AI recommendations');
      return;
    }
    if (totalBooks === 0) {
      setError('Add some books to your reading journey first.');
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.noHistory) {
          setError('Add some books to your reading journey to get personalized recommendations.');
          return;
        }
        const msg = data.detail || data.error || 'Failed to get recommendation';
        throw new Error(msg);
      }

      const data = await res.json();
      setRecommendation(data);

      try {
        await fetch('/api/opik/engagement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recommendationId: `rec_${Date.now()}`,
            action: 'viewed',
          }),
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Error fetching recommendation:', err);
      setError('Failed to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [session?.user, totalBooks]);

  if (!session?.user) {
    return null;
  }

  // New users: no reading history yet
  if (totalBooks === 0) {
    return (
      <div className="mb-6">
        <h2
          className="text-xl sm:text-2xl font-bold mb-1"
          style={{
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.heading,
          }}
        >
          🤖 AI Reading Coach
        </h2>
        <p
          className="text-sm mb-3"
          style={{ color: theme.colors.textSecondary }}
        >
          Get personalized book recommendations based on your reading journey.
        </p>
        <div
          className="rounded-xl p-6 text-center"
          style={{
            backgroundColor: theme.colors.cardBg,
            border: `1px solid ${theme.colors.cardBorder}`,
          }}
        >
          <p style={{ color: theme.colors.textSecondary }}>
            Add some books to your reading journey first. Once you have at least one book logged, we can recommend your next read from a new country.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h2
          className="text-xl sm:text-2xl font-bold mb-1"
          style={{
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.heading,
          }}
        >
          🤖 AI Reading Coach
        </h2>
        <p
          className="text-sm"
          style={{ color: theme.colors.textSecondary }}
        >
          Get a personalized recommendation when you need your next read.
        </p>
      </div>

      {!recommendation && !loading && !error && (
        <div
          className="rounded-xl p-6 text-center"
          style={{
            backgroundColor: theme.colors.cardBg,
            border: `1px solid ${theme.colors.cardBorder}`,
          }}
        >
          <p style={{ color: theme.colors.textSecondary }} className="mb-4">
            Click below when you want a suggestion for your next book.
          </p>
          <button
            onClick={fetchRecommendation}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.textOnPrimary,
            }}
          >
            Get Recommendation
          </button>
        </div>
      )}

      {loading && (
        <div
          className="rounded-xl p-8 text-center"
          style={{
            backgroundColor: theme.colors.cardBg,
            border: `1px solid ${theme.colors.cardBorder}`,
          }}
        >
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: theme.colors.primary }} />
          <p style={{ color: theme.colors.textSecondary }}>
            Analyzing your reading history and generating recommendations...
          </p>
        </div>
      )}

      {error && !loading && (
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            backgroundColor: `${theme.colors.accent}20`,
            border: `1px solid ${theme.colors.accent}`,
          }}
        >
          <p style={{ color: theme.colors.textPrimary }}>{error}</p>
          <button
            onClick={() => { setError(null); fetchRecommendation(); }}
            className="mt-2 px-4 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.textOnPrimary,
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && recommendation && (
        <>
          <div className="flex justify-end mb-2">
            <button
              onClick={() => { setRecommendation(null); setError(null); }}
              className="text-sm px-3 py-1.5 rounded-lg"
              style={{
                backgroundColor: theme.colors.cardBg,
                border: `1px solid ${theme.colors.cardBorder}`,
                color: theme.colors.textSecondary,
              }}
            >
              Get another
            </button>
          </div>
          <RecommendationCard
            recommendation={recommendation}
            onAddToReadList={onAddedToReadList}
          />
        </>
      )}
    </div>
  );
}

export default memo(AIRecommendations);
