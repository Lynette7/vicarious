import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { trackRecommendation, evaluateRecommendation, trackEngagement, getAllTraces } from '@/lib/opik';

// GET /api/opik/test - Test Opik integration
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Test 1: Track a sample recommendation
    const testTraceId = await trackRecommendation({
      userId: session.user.id,
      input: {
        readingHistory: [
          { title: 'Test Book 1', author: 'Test Author', country: 'Nigeria', rating: 4 },
          { title: 'Test Book 2', author: 'Test Author 2', country: 'India', rating: 5 },
        ],
        preferences: 'Fiction, diverse perspectives',
      },
      output: {
        recommendedBook: {
          title: 'Things Fall Apart',
          author: 'Chinua Achebe',
          country: 'Nigeria',
          reason: 'A classic work of African literature that explores cultural themes.',
        },
        model: 'gpt-4o-mini',
        promptVersion: '1.0',
      },
      metadata: {
        responseTime: 1250,
        tokenCount: 450,
      },
    });

    // Test 2: Evaluate the recommendation
    await evaluateRecommendation(
      testTraceId,
      {
        title: 'Things Fall Apart',
        author: 'Chinua Achebe',
        country: 'Nigeria',
        reason: 'A classic work of African literature that explores cultural themes.',
      },
      [
        { title: 'Test Book 1', author: 'Test Author', country: 'Nigeria', rating: 4 },
        { title: 'Test Book 2', author: 'Test Author 2', country: 'India', rating: 5 },
      ]
    );

    // Test 3: Track engagement
    await trackEngagement(testTraceId, 'viewed', { test: true });
    await trackEngagement(testTraceId, 'clicked_finder', { test: true });

    // Get all local traces (for debugging)
    const localTraces = getAllTraces();

    return NextResponse.json({
      success: true,
      message: 'Opik test traces sent successfully!',
      testTraceId,
      localTracesCount: localTraces.length,
      hasApiKey: !!process.env.OPIK_API_KEY,
      apiKeyPrefix: process.env.OPIK_API_KEY ? process.env.OPIK_API_KEY.substring(0, 10) + '...' : 'Not set',
      instructions: {
        viewInOpik: 'Go to your Opik dashboard at https://www.comet.com/opik to see the traces',
        checkConsole: 'Check your server console for [Opik] log messages',
        nextSteps: 'If OPIK_API_KEY is set, traces should appear in your Opik dashboard within a few seconds',
      },
    });
  } catch (error) {
    console.error('Error testing Opik:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test Opik integration',
        details: error instanceof Error ? error.message : 'Unknown error',
        hasApiKey: !!process.env.OPIK_API_KEY,
      },
      { status: 500 }
    );
  }
}
