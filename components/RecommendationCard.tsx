'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';
import BookFinder from './BookFinder';
// Engagement tracking via API

export interface BookRecommendation {
  title: string;
  author: string;
  country: string;
  countryCode: string;
  reason: string;
  culturalContext?: string;
  difficulty?: 'easy' | 'medium' | 'challenging';
  estimatedPages?: number;
}

interface RecommendationCardProps {
  recommendation: BookRecommendation;
  onAddBook?: () => void;
}

export default function RecommendationCard({ recommendation, onAddBook }: RecommendationCardProps) {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [showFinder, setShowFinder] = useState(false);
  const [recommendationId] = useState(() => `rec_${Date.now()}`);

  const handleViewFinder = async () => {
    setShowFinder(true);
    if (session?.user?.id) {
      try {
        await fetch('/api/opik/engagement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recommendationId,
            action: 'clicked_finder',
          }),
        });
      } catch (error) {
        console.error('Error tracking engagement:', error);
      }
    }
  };

  const difficultyColors = {
    easy: '#22c55e',
    medium: '#f59e0b',
    challenging: '#ef4444',
  };

  return (
    <>
      <div
        className="rounded-xl p-4 sm:p-6 mb-4"
        style={{
          backgroundColor: theme.colors.cardBg,
          border: `1px solid ${theme.colors.cardBorder}`,
          boxShadow: theme.effects.shadow,
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3
              className="text-lg sm:text-xl font-bold mb-1"
              style={{
                color: theme.colors.textPrimary,
                fontFamily: theme.fonts.heading,
              }}
            >
              📚 Your Next Read
            </h3>
            <p
              className="text-xs sm:text-sm"
              style={{ color: theme.colors.textMuted }}
            >
              AI Recommendation
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h4
            className="text-base sm:text-lg font-semibold mb-1"
            style={{ color: theme.colors.textPrimary }}
          >
            {recommendation.title}
          </h4>
          <p
            className="text-sm sm:text-base mb-2"
            style={{ color: theme.colors.textSecondary }}
          >
            by {recommendation.author}
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs sm:text-sm px-2 py-1 rounded"
              style={{
                backgroundColor: theme.colors.primaryLight,
                color: theme.colors.primary,
              }}
            >
              📍 {recommendation.country}
            </span>
            {recommendation.difficulty && (
              <span
                className="text-xs sm:text-sm px-2 py-1 rounded"
                style={{
                  backgroundColor: `${difficultyColors[recommendation.difficulty]}20`,
                  color: difficultyColors[recommendation.difficulty],
                }}
              >
                {recommendation.difficulty === 'easy' ? '📖 Easy' :
                 recommendation.difficulty === 'medium' ? '📚 Medium' :
                 '📕 Challenging'}
              </span>
            )}
            {recommendation.estimatedPages && (
              <span
                className="text-xs sm:text-sm"
                style={{ color: theme.colors.textMuted }}
              >
                ~{recommendation.estimatedPages} pages
              </span>
            )}
          </div>
        </div>

        <div
          className="mb-4 p-3 rounded-lg"
          style={{
            backgroundColor: theme.colors.inputBg,
            border: `1px solid ${theme.colors.cardBorder}`,
          }}
        >
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ color: theme.colors.textSecondary }}
          >
            {recommendation.reason}
          </p>
          {recommendation.culturalContext && (
            <p
              className="text-xs sm:text-sm mt-2 italic"
              style={{ color: theme.colors.textMuted }}
            >
              {recommendation.culturalContext}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleViewFinder}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg text-sm sm:text-base"
            style={{
              backgroundColor: theme.colors.accent,
              color: theme.colors.textOnPrimary,
            }}
          >
            🏪 Find Near Me
          </button>
          {onAddBook && (
            <button
              onClick={async () => {
                onAddBook();
                if (session?.user?.id) {
                  try {
                    await fetch('/api/opik/engagement', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        recommendationId,
                        action: 'added_to_list',
                      }),
                    });
                  } catch (error) {
                    console.error('Error tracking engagement:', error);
                  }
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all text-sm sm:text-base"
              style={{
                backgroundColor: 'transparent',
                border: `1px solid ${theme.colors.cardBorder}`,
                color: theme.colors.textSecondary,
              }}
            >
              + Add to List
            </button>
          )}
        </div>
      </div>

      {showFinder && (
        <BookFinder
          bookTitle={recommendation.title}
          author={recommendation.author}
          country={recommendation.country}
          onClose={() => setShowFinder(false)}
        />
      )}
    </>
  );
}
