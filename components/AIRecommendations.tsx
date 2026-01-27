'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';
import RecommendationCard, { BookRecommendation } from './RecommendationCard';
// Engagement tracking via API

interface AIRecommendationsProps {
  onAddBook?: (recommendation: BookRecommendation) => void;
}

export default function AIRecommendations({ onAddBook }: AIRecommendationsProps) {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [recommendation, setRecommendation] = useState<BookRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = async () => {
    if (!session?.user) {
      setError('Please sign in to get AI recommendations');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        throw new Error('Failed to get recommendation');
      }

      const data = await res.json();
      setRecommendation(data);
      
      // Track engagement
      const recommendationId = `rec_${Date.now()}`;
      try {
        await fetch('/api/opik/engagement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recommendationId,
            action: 'viewed',
          }),
        });
      } catch (error) {
        console.error('Error tracking engagement:', error);
      }
    } catch (err) {
      console.error('Error fetching recommendation:', err);
      setError('Failed to get recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchRecommendation();
    }
  }, [session]);

  const handleAddBook = () => {
    if (recommendation && onAddBook) {
      onAddBook(recommendation);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
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
            Get personalized book recommendations based on your reading journey
          </p>
        </div>
        <button
          onClick={fetchRecommendation}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.textOnPrimary,
          }}
        >
          {loading ? '...' : '🔄'}
        </button>
      </div>

      {loading && (
        <div
          className="rounded-xl p-8 text-center"
          style={{
            backgroundColor: theme.colors.cardBg,
            border: `1px solid ${theme.colors.cardBorder}`,
          }}
        >
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4" style={{ borderColor: theme.colors.primary }}></div>
          <p style={{ color: theme.colors.textSecondary }}>
            Analyzing your reading history and generating recommendations...
          </p>
        </div>
      )}

      {error && (
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            backgroundColor: `${theme.colors.accent}20`,
            border: `1px solid ${theme.colors.accent}`,
          }}
        >
          <p style={{ color: theme.colors.textPrimary }}>{error}</p>
          <button
            onClick={fetchRecommendation}
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
        <RecommendationCard
          recommendation={recommendation}
          onAddBook={handleAddBook}
        />
      )}

      {!loading && !error && !recommendation && (
        <div
          className="rounded-xl p-6 text-center"
          style={{
            backgroundColor: theme.colors.cardBg,
            border: `1px solid ${theme.colors.cardBorder}`,
          }}
        >
          <p style={{ color: theme.colors.textSecondary }} className="mb-4">
            Click the refresh button to get your first AI recommendation!
          </p>
          <button
            onClick={fetchRecommendation}
            className="px-6 py-2.5 rounded-lg font-medium"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.textOnPrimary,
            }}
          >
            Get Recommendation
          </button>
        </div>
      )}
    </div>
  );
}
