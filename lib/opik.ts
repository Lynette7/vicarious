/**
 * Opik Integration for AI Observability
 * 
 * This module provides observability and evaluation tracking for AI recommendations.
 * In a production environment, this would integrate with the Opik platform.
 * For the hackathon, we'll implement a local tracking system that can be
 * easily migrated to Opik's API.
 */

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

// In-memory store for demo purposes
// In production, this would be Opik's API
const traces: OpikTrace[] = [];

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

  traces.push(fullTrace);
  
  // In production, send to Opik API
  // await fetch('https://api.opik.ai/traces', { ... });
  
  console.log('[Opik] Recommendation tracked:', fullTrace.id);
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
  // Simulate LLM-as-judge evaluation
  // In production, this would call Opik's evaluation API
  
  const criteria = [
    'Relevance to reading history',
    'Cultural diversity',
    'Appropriate difficulty level',
    'Clear reasoning provided',
  ];

  // Simple scoring logic (in production, this would be an actual LLM call)
  let score = 0.7; // Base score
  const historyCountries = new Set(userHistory.map(b => b.country));
  if (!historyCountries.has(recommendation.country)) {
    score += 0.15; // Bonus for new country
  }
  if (recommendation.reason.length > 50) {
    score += 0.1; // Bonus for detailed reasoning
  }
  score = Math.min(1.0, score);

  const evaluation: EvaluationTrace = {
    id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    type: 'evaluation',
    recommendationId,
    evaluationType: 'llm-as-judge',
    score,
    criteria,
    reasoning: `Recommendation scored ${(score * 100).toFixed(0)}/100 based on diversity, relevance, and reasoning quality.`,
  };

  traces.push(evaluation);
  
  // In production, send to Opik API
  // await fetch('https://api.opik.ai/evaluations', { ... });
  
  console.log('[Opik] Evaluation tracked:', evaluation.id, 'Score:', score);
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
  
  // In production, send to Opik API
  console.log('[Opik] Engagement tracked:', action, 'for', recommendationId);
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
