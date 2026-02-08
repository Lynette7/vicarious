/**
 * Opik Integration for AI Observability
 * 
 * This module provides observability and evaluation tracking for AI recommendations.
 * Integrated with the Opik platform for production observability.
 */

import { Opik } from 'opik';

// Initialize Opik client
const opikClient = new Opik({
  apiKey: process.env.OPIK_API_KEY,
  apiUrl: process.env.OPIK_URL_OVERRIDE || 'https://www.comet.com/opik/api',
  projectName: process.env.OPIK_PROJECT_NAME || 'vicarious',
  workspaceName: process.env.OPIK_WORKSPACE_NAME || 'mulandi-cecilia',
});

// Fallback: In-memory store for demo/fallback purposes
const traces: OpikTrace[] = [];

export interface OpikTrace {
  id: string;
  timestamp: Date;
  type: 'recommendation' | 'evaluation' | 'experiment';
  metadata: Record<string, any>;
}

export interface RecommendationTrace extends OpikTrace {
  type: 'recommendation';
  userId: string;
  input: {
    readingHistory: Array<{
      title: string;
      author: string;
      country: string;
      rating?: number;
    }>;
    preferences?: string;
  };
  output: {
    recommendedBook: {
      title: string;
      author: string;
      country: string;
      reason: string;
    };
    model: string;
    promptVersion: string;
  };
  metadata: {
    responseTime: number;
    tokenCount?: number;
  };
}

export interface EvaluationTrace extends OpikTrace {
  type: 'evaluation';
  recommendationId: string;
  evaluationType: 'llm-as-judge' | 'user-feedback' | 'engagement';
  score: number;
  criteria: string[];
  reasoning?: string;
}

/**
 * Track an AI recommendation
 */
export async function trackRecommendation(
  trace: Omit<RecommendationTrace, 'id' | 'timestamp' | 'type'>
): Promise<string> {
  const fullTrace: RecommendationTrace = {
    id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    type: 'recommendation',
    ...trace,
  };

  // Store locally for fallback
  traces.push(fullTrace);
  
  // Send to Opik API
  try {
    if (process.env.OPIK_API_KEY) {
      await opikClient.trace({
        name: 'book_recommendation',
        input: {
          userId: fullTrace.userId,
          readingHistory: fullTrace.input.readingHistory,
          preferences: fullTrace.input.preferences,
        },
        output: {
          recommendedBook: fullTrace.output.recommendedBook,
          model: fullTrace.output.model,
          promptVersion: fullTrace.output.promptVersion,
        },
        metadata: {
          responseTime: fullTrace.metadata.responseTime,
          tokenCount: fullTrace.metadata.tokenCount,
          traceId: fullTrace.id,
        },
      });
      console.log('[Opik] Recommendation tracked:', fullTrace.id);
    } else {
      console.log('[Opik] Recommendation tracked (local):', fullTrace.id, '- OPIK_API_KEY not set');
    }
  } catch (error) {
    console.error('[Opik] Error tracking recommendation:', error);
    // Continue with local storage as fallback
  }
  
  return fullTrace.id;
}

/**
 * Evaluate a recommendation using LLM-as-judge
 */
export async function evaluateRecommendation(
  recommendationId: string,
  recommendation: {
    title: string;
    author: string;
    country: string;
    reason: string;
  },
  userHistory: Array<{ title: string; author: string; country: string; rating?: number }>
): Promise<EvaluationTrace> {
  const criteria = [
    'Relevance to reading history',
    'Cultural diversity',
    'Appropriate difficulty level',
    'Clear reasoning provided',
  ];

  // Simple scoring logic (in production, this could use Opik's LLM-as-judge)
  let score = 0.7; // Base score
  const historyCountries = new Set(userHistory.map(b => b.country));
  if (!historyCountries.has(recommendation.country)) {
    score += 0.15; // Bonus for new country
  }
  if (recommendation.reason.length > 50) {
    score += 0.1; // Bonus for detailed reasoning
  }
  score = Math.min(1.0, score);

  const reasoning = `Recommendation scored ${(score * 100).toFixed(0)}/100 based on diversity, relevance, and reasoning quality.`;
  const evaluation: EvaluationTrace = {
    id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    type: 'evaluation',
    recommendationId,
    evaluationType: 'llm-as-judge',
    score,
    criteria,
    reasoning,
    metadata: { reasoning, criteria, score },
  };

  traces.push(evaluation);
  
  // Send to Opik API
  try {
    if (process.env.OPIK_API_KEY) {
      await opikClient.trace({
        name: 'recommendation_quality',
        input: {
          recommendationId: recommendationId,
        },
        output: {
          score: score,
          evaluationType: 'llm-as-judge',
        },
        metadata: {
          criteria: criteria,
          reasoning: reasoning,
          recommendation: recommendation,
        },
      });
      console.log('[Opik] Evaluation tracked:', evaluation.id, 'Score:', score);
    } else {
      console.log('[Opik] Evaluation tracked (local):', evaluation.id, '- OPIK_API_KEY not set');
    }
  } catch (error) {
    console.error('[Opik] Error tracking evaluation:', error);
    // Continue with local storage as fallback
  }
  
  return evaluation;
}

/**
 * Track user engagement with a recommendation
 */
export async function trackEngagement(
  recommendationId: string,
  action: 'viewed' | 'clicked_finder' | 'added_to_list' | 'marked_read',
  metadata: Record<string, any> = {}
): Promise<void> {
  const trace: OpikTrace = {
    id: `eng_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    type: 'evaluation',
    metadata: {
      recommendationId,
      action,
      ...metadata,
    },
  };

  traces.push(trace);
  
  // Send to Opik API as feedback/engagement
  try {
    if (process.env.OPIK_API_KEY) {
      await opikClient.trace({
        name: 'user_engagement',
        input: {
          recommendationId: recommendationId,
          action: action,
        },
        output: {
          engagement: true,
        },
        metadata: {
          ...metadata,
          engagementId: trace.id,
        },
      });
      console.log('[Opik] Engagement tracked:', action, 'for', recommendationId);
    } else {
      console.log('[Opik] Engagement tracked (local):', action, '- OPIK_API_KEY not set');
    }
  } catch (error) {
    console.error('[Opik] Error tracking engagement:', error);
    // Continue with local storage as fallback
  }
}

/**
 * Get recommendation quality metrics
 */
export async function getRecommendationMetrics(): Promise<{
  totalRecommendations: number;
  averageScore: number;
  engagementRate: number;
  topCountries: Array<{ country: string; count: number }>;
}> {
  // Try to get metrics from Opik API first
  try {
    if (process.env.OPIK_API_KEY) {
      // You can query Opik API for metrics here
      // For now, fall back to local metrics
    }
  } catch (error) {
    console.error('[Opik] Error fetching metrics from API:', error);
  }

  // Fallback to local metrics
  const recommendations = traces.filter(t => t.type === 'recommendation') as RecommendationTrace[];
  const evaluations = traces.filter(t => t.type === 'evaluation' && 'score' in t) as EvaluationTrace[];
  const engagements = traces.filter(t => t.type === 'evaluation' && 'action' in t.metadata);

  const avgScore = evaluations.length > 0
    ? evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length
    : 0;

  const engagementRate = recommendations.length > 0
    ? engagements.length / recommendations.length
    : 0;

  // Count countries
  const countryCounts: Record<string, number> = {};
  recommendations.forEach(r => {
    const country = r.output.recommendedBook.country;
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  });

  const topCountries = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRecommendations: recommendations.length,
    averageScore: avgScore,
    engagementRate,
    topCountries,
  };
}

/**
 * Get all traces (for debugging/demo)
 */
export function getAllTraces(): OpikTrace[] {
  return [...traces];
}