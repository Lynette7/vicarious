import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GoogleGenAI } from '@google/genai';
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

    // Validate Gemini API key
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('GOOGLE_GEMINI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Debug: Log API key status (first 10 chars only for security)
    const apiKeyPrefix = process.env.GOOGLE_GEMINI_API_KEY.substring(0, 10);
    console.log('Google Gemini API Key configured:', apiKeyPrefix + '...');
    console.log('API Key length:', process.env.GOOGLE_GEMINI_API_KEY.length);

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

    // Initialize Opik client for tracing (lazy, only if API key is set)
    let opikClient: any = null;
    let trackedGenAI: GoogleGenAI;

    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

    if (process.env.OPIK_API_KEY) {
      try {
        const { Opik } = require('opik');
        const { trackGemini } = require('opik-gemini');
        opikClient = new Opik({
          apiKey: process.env.OPIK_API_KEY,
          projectName: process.env.OPIK_PROJECT_NAME || 'vicarious',
          workspaceName: process.env.OPIK_WORKSPACE_NAME || 'mulandi-cecilia',
        });
        trackedGenAI = trackGemini(genAI, {
          client: opikClient,
          traceMetadata: {
            tags: ['recommendations', 'book-suggestions'],
            userId: session.user.id,
            totalBooks: totalBooks,
            totalCountries: totalCountries,
            isFirstTime: isFirstTime,
          },
        });
      } catch (err) {
        console.warn('[Opik] Failed to initialize:', err);
        trackedGenAI = genAI;
      }
    } else {
      trackedGenAI = genAI;
    }
    
    // First, try to list available models using the REST API
    let availableModels: string[] = [];
    try {
      const listResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GEMINI_API_KEY}`
      );
      if (listResponse.ok) {
        const listData = await listResponse.json();
        availableModels = (listData.models || [])
          .map((m: any) => m.name?.replace('models/', '') || '')
          .filter((name: string) => name && name.includes('gemini'));
        console.log('Available Gemini models:', availableModels);
      }
    } catch (listError) {
      console.warn('Could not list available models:', listError);
    }
    
    // Try different model names in order of preference
    // Start with user-specified, then available models, then fallbacks
    const modelCandidates = [
      process.env.GEMINI_MODEL, // User-specified model
      ...availableModels.slice(0, 3), // Top 3 available models
      'gemini-2.0-flash',        // Fast, commonly available
      'gemini-2.5-flash',        // Latest version
      'gemini-2.0-flash-lite',   // Lightweight fallback
    ].filter(Boolean) as string[];
    
    let text: string = '';
    let lastError: any = null;
    let usedModel = '';
    
    try {
      // Try each model candidate until one works
      // Opik tracing is handled automatically by trackGemini wrapper
      for (const model of modelCandidates) {
        try {
          console.log('Trying Gemini model:', model);

          // Use the tracked client - Opik will automatically trace this call
          const response = await trackedGenAI.models.generateContent({
            model: model,
            contents: prompt,
          });
          
          text = response.text?.trim() || '';
          usedModel = model;
          
          if (text && text.length > 0) {
            console.log(`Successfully used model: ${model}, response length: ${text.length}`);
            // Flush Opik traces to ensure they're sent
            if (opikClient && 'flush' in trackedGenAI) {
              await (trackedGenAI as any).flush();
            }
            break; // Success, exit the loop
          }
        } catch (modelError: any) {
          // Opik automatically tracks errors, but we'll still log them
          console.warn(`Model ${model} failed:`, modelError?.message || modelError);
          lastError = modelError;
          // Continue to next model
        }
      }
      
      // If all SDK models failed, try using the v1 REST API directly
      if (!text || text.length === 0) {
        console.log('SDK models failed, trying REST API directly...');
        const restApiStartTime = Date.now();
        const v1Models = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-lite'];
        
        for (const model of v1Models) {
          try {
            console.log(`Trying REST API with model: ${model}`);
            const v1Response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  contents: [{
                    parts: [{ text: prompt }]
                  }]
                }),
              }
            );
            
            if (v1Response.ok) {
              const v1Data = await v1Response.json();
              if (v1Data.candidates?.[0]?.content?.parts?.[0]?.text) {
                text = v1Data.candidates[0].content.parts[0].text.trim();
                usedModel = model;
                
                // Track REST API fallback call with Opik
                if (opikClient) {
                  try {
                    await opikClient.trace({
                      name: 'gemini_generate_content_rest',
                      input: {
                        model: model,
                        prompt: prompt.substring(0, 1000),
                        userId: session.user.id,
                        apiType: 'rest',
                      },
                      output: {
                        text: text.substring(0, 1000),
                        textLength: text.length,
                        model: usedModel,
                      },
                      metadata: {
                        isFirstTime: isFirstTime,
                        responseTime: Date.now() - restApiStartTime,
                      },
                    });
                    console.log('[Opik] Gemini REST API call tracked');
                  } catch (opikError) {
                    console.warn('[Opik] Error tracking REST API call:', opikError);
                  }
                }
                
                console.log(`Successfully used v1 API with model: ${model}, response length: ${text.length}`);
                break;
              }
            } else {
              const errorData = await v1Response.text();
              console.warn(`v1 API model ${model} failed:`, v1Response.status, errorData);
            }
          } catch (v1Error: any) {
            console.warn(`v1 API model ${model} error:`, v1Error?.message || v1Error);
          }
        }
      }
      
      // If still no text, throw the last error
      if (!text || text.length === 0) {
        throw lastError || new Error('All model candidates and API versions failed');
      }

      console.log(`Gemini response received using model ${usedModel}, length: ${text.length}`);
    } catch (aiError: any) {
      console.error('Gemini API error:', aiError);
      
      // Extract error details
      const statusCode = aiError?.status || aiError?.statusCode || aiError?.code;
      const errorMessage = aiError?.message || aiError?.error?.message || '';
      
      // Check for model not found errors (404)
      if (statusCode === 404 || errorMessage.includes('not found') || errorMessage.includes('is not found')) {
        return NextResponse.json(
          { 
            error: 'The selected AI model is not available. This may be due to API key restrictions or the model not being available in your region. Please check your Google Cloud API key settings and ensure the Generative Language API is enabled.',
            details: process.env.NODE_ENV === 'development' 
              ? `Tried models: ${modelCandidates.join(', ')}, Error: ${errorMessage}` 
              : undefined
          },
          { status: 500 }
        );
      }
      
      // Check for quota/rate limit errors
      if (statusCode === 429 || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service is temporarily rate-limited. Please try again in a moment.' },
          { status: 503 }
        );
      }
      
      // Check for authentication errors
      if (statusCode === 401 || statusCode === 403 || errorMessage.includes('API key') || errorMessage.includes('authentication') || errorMessage.includes('permission')) {
        return NextResponse.json(
          { error: 'AI service authentication failed. Please check your API key configuration and ensure the Generative Language API is enabled in Google Cloud Console.' },
          { status: 500 }
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