import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Debug: Log API key status (first 10 chars only for security)
    const apiKeyPrefix = process.env.OPENAI_API_KEY.substring(0, 10);
    console.log('OpenAI API Key configured:', apiKeyPrefix + '...');
    console.log('API Key length:', process.env.OPENAI_API_KEY.length);

    // Get user's reading history
    const books = await prisma.book.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    type BookRow = (typeof books)[number];

    // Get countries already read
    const countriesRead = Array.from(new Set(books.map((b: BookRow) => b.countryName).filter(Boolean)));
    const totalBooks = books.length;
    const totalCountries = countriesRead.length;

    // Build reading history summary
    const readingHistory = books.slice(0, 10).map((book: BookRow) => ({
      title: book.title,
      author: book.author,
      country: book.countryName || 'Unknown',
      rating: book.rating,
    }));
    type ReadingHistoryItem = (typeof readingHistory)[number];

    // Create the prompt for AI recommendations
    const isFirstTime = totalBooks === 0;
    
    const prompt = isFirstTime 
      ? `You are an expert literary advisor helping someone start their journey into diverse world literature. 

This is a NEW USER who hasn't added any books yet. They're just beginning their reading journey and want to explore literature from around the world.

Please recommend 5 excellent, diverse books that will give them a wonderful introduction to world literature. These should be:
- Highly accessible and engaging for someone new to international literature
- From different countries and cultures
- A mix of contemporary and classic works
- Books that are well-known and beloved, making them great starting points
- Representing different genres and perspectives

For each book, provide:
1. Title
2. Author name
3. Country of origin (use the full country name)
4. A brief reason why this book is perfect for someone starting their reading journey (1-2 sentences)
5. What makes it culturally significant or unique

Format your response as a JSON array with this structure:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "country": "Full Country Name",
    "reason": "Why this book is recommended",
    "significance": "Cultural or literary significance"
  }
]

Return ONLY the JSON array, no additional text.`
      : `You are an expert literary advisor helping someone diversify their reading. 

The user has read ${totalBooks} book${totalBooks !== 1 ? 's' : ''} from ${totalCountries} countr${totalCountries !== 1 ? 'ies' : 'y'}.

Recent books read:
${readingHistory.map((b: ReadingHistoryItem) => `- "${b.title}" by ${b.author} (${b.country})${b.rating ? ` - Rated ${b.rating}/5` : ''}`).join('\n')}

Countries already explored: ${countriesRead.length > 0 ? countriesRead.join(', ') : 'None yet'}

Please recommend 5 diverse books that will help expand their literary horizons. For each book, provide:
1. Title
2. Author name
3. Country of origin (use the full country name)
4. A brief reason why this book is recommended (1-2 sentences)
5. What makes it culturally significant or unique

Focus on:
- Countries they haven't explored yet
- Diverse genres and perspectives
- Books that are accessible and engaging
- Mix of contemporary and classic literature

Format your response as a JSON array with this structure:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "country": "Full Country Name",
    "reason": "Why this book is recommended",
    "significance": "Cultural or literary significance"
  }
]

Return ONLY the JSON array, no additional text.`;

    // Generate recommendations using OpenAI
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let text: string;
    try {
      console.log('Calling OpenAI with model:', model);
      const completion = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });
      text = completion.choices[0]?.message?.content?.trim() ?? '';

      if (!text || text.length === 0) {
        console.error('OpenAI returned empty response');
        return NextResponse.json(
          { error: 'AI service returned an empty response. Please try again.' },
          { status: 500 }
        );
      }

      console.log('OpenAI response received, length:', text.length);
    } catch (aiError: any) {
      console.error('OpenAI API error:', aiError);
      
      // Extract the actual error from RetryError if present
      const actualError = aiError?.lastError || aiError?.errors?.[0] || aiError;
      const statusCode = actualError?.statusCode || actualError?.status;
      const errorCode = actualError?.data?.error?.code || actualError?.error?.code;
      const errorMessage = actualError?.data?.error?.message || actualError?.error?.message || actualError?.message || '';
      
      // Check for quota exceeded error
      if (
        statusCode === 429 || 
        errorCode === 'insufficient_quota' ||
        errorMessage.includes('exceeded your current quota') ||
        errorMessage.includes('insufficient_quota')
      ) {
        return NextResponse.json(
          { error: 'OpenAI API quota has been exceeded. Please check your OpenAI account billing and add credits to continue using AI recommendations.' },
          { status: 503 }
        );
      }
      
      // Check for authentication errors
      if (
        statusCode === 401 || 
        errorMessage.includes('API key') || 
        errorMessage.includes('authentication') ||
        errorCode === 'invalid_api_key'
      ) {
        return NextResponse.json(
          { error: 'AI service authentication failed. Please check your API key configuration.' },
          { status: 500 }
        );
      }
      
      // Check for rate limiting (different from quota)
      if (statusCode === 429 && errorCode !== 'insufficient_quota') {
        return NextResponse.json(
          { error: 'AI service is temporarily rate-limited. Please try again in a moment.' },
          { status: 503 }
        );
      }
      
      // Check for server errors
      if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
        return NextResponse.json(
          { error: 'AI service encountered an error. Please try again later.' },
          { status: 503 }
        );
      }
      
      // Generic error for other cases
      return NextResponse.json(
        { 
          error: 'Failed to generate recommendations. Please try again.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let recommendations;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        recommendations = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response');
      console.error('Response text (first 500 chars):', text.substring(0, 500));
      console.error('Parse error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse recommendations. Please try again.' },
        { status: 500 }
      );
    }

    // Validate recommendations structure
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      console.error('Invalid recommendations format:', recommendations);
      return NextResponse.json(
        { error: 'Invalid recommendations format' },
        { status: 500 }
      );
    }

    // Validate each recommendation has required fields
    const validRecommendations = recommendations.filter((rec: any) => 
      rec.title && rec.author && rec.country && rec.reason
    );

    if (validRecommendations.length === 0) {
      console.error('No valid recommendations found after validation');
      return NextResponse.json(
        { error: 'No valid recommendations could be generated. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      recommendations: validRecommendations.slice(0, 5), // Ensure max 5
      readingStats: {
        totalBooks,
        totalCountries,
        countriesRead,
      },
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
    });
    
    // Check if it's a database error
    if (error instanceof Error && error.message.includes('prisma')) {
      return NextResponse.json(
        { error: 'Database error. Please try again.' },
        { status: 500 }
      );
    }
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('session')) {
      return NextResponse.json(
        { error: 'Authentication error. Please sign in again.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations. Please try again.',
        details: process.env.NODE_ENV === 'development' && error instanceof Error 
          ? error.message 
          : undefined
      },
      { status: 500 }
    );
  }
}
