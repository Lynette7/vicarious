/**
 * AI Service for Book Recommendations
 *
 * Uses Google Gemini (@google/genai SDK) to generate personalized book recommendations
 * based on user reading history and preferences (same SDK as navbar AI Coach).
 */

import { GoogleGenAI } from '@google/genai';
import { trackRecommendation, evaluateRecommendation } from './opik';
import { getContinent } from './continents';
import { getCountryCode } from './countries';

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GOOGLE_GEMINI_API_KEY;
  return key ? new GoogleGenAI({ apiKey: key }) : null;
}

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

export interface ReadingHistory {
  title: string;
  author: string;
  country: string;
  countryCode: string;
  rating?: number;
  endDate?: Date;
}

/**
 * Generate a personalized book recommendation
 */
export async function generateRecommendation(
  userId: string,
  readingHistory: ReadingHistory[],
  preferences?: {
    preferredGenres?: string[];
    readingPace?: 'slow' | 'medium' | 'fast';
    goal?: string;
  }
): Promise<BookRecommendation> {
  const startTime = Date.now();

  // Analyze reading history
  const countriesRead = new Set(readingHistory.map(b => b.countryCode));
  const continentsRead = new Set(
    readingHistory.map(b => getContinent(b.countryCode))
  );
  const averageRating = readingHistory.length > 0
    ? readingHistory.reduce((sum, b) => sum + (b.rating || 3), 0) / readingHistory.length
    : 3;

  // Build prompt (system instruction + user prompt for Gemini)
  const userPrompt = buildRecommendationPrompt(readingHistory, countriesRead, continentsRead, preferences);
  const fullPrompt = `You are an expert literary advisor helping readers explore diverse global literature.
Your recommendations should be thoughtful, culturally rich, and help readers discover new perspectives.
Always provide specific book titles and authors, and explain why each recommendation is valuable.

${userPrompt}`;

  const genAI = getGeminiClient();
  if (!genAI) {
    console.error('GOOGLE_GEMINI_API_KEY is not configured');
    return getFallbackRecommendation(readingHistory, countriesRead);
  }

  try {
    // Discover available models first (same approach as navbar AI Coach)
    let discoveredModels: string[] = [];
    try {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY!;
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      if (listRes.ok) {
        const listData = await listRes.json();
        discoveredModels = (listData.models || [])
          .filter((m: any) => (m.supportedGenerationMethods || []).includes('generateContent'))
          .map((m: any) => m.name?.replace('models/', '') || '')
          .filter((name: string) => name && name.includes('gemini'));
        console.log('[Sidebar AI] Discovered models:', discoveredModels.slice(0, 5));
      }
    } catch (listErr) {
      console.warn('[Sidebar AI] Could not list models:', listErr);
    }

    // Build model candidates: user-specified, then discovered, then current defaults
    const modelCandidates = [
      process.env.GEMINI_MODEL,
      ...discoveredModels.slice(0, 3),
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash-lite',
    ].filter(Boolean) as string[];

    // De-duplicate
    const uniqueModels = Array.from(new Set(modelCandidates));

    let response = '';
    let usedModel = 'gemini';

    // Try each model using the @google/genai SDK (same as navbar coach)
    for (const model of uniqueModels) {
      try {
        console.log(`[Sidebar AI] Trying Gemini model: ${model}`);
        const result = await genAI.models.generateContent({
          model,
          contents: fullPrompt,
        });
        response = result.text?.trim() || '';
        usedModel = model;
        if (response.length > 0) {
          console.log(`[Sidebar AI] Successfully used model: ${model}, response length: ${response.length}`);
          break;
        }
      } catch (modelErr: any) {
        console.warn(`[Sidebar AI] Gemini model ${model} failed:`, modelErr?.message || modelErr);
      }
    }

    // Fallback: try v1beta REST API directly
    if (!response) {
      console.log('[Sidebar AI] SDK models failed, trying REST API directly...');
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY!;
      const restModels = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.0-flash-lite'];
      for (const model of restModels) {
        try {
          console.log(`[Sidebar AI] Trying REST API with model: ${model}`);
          const v1Res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }],
              }),
            }
          );
          if (v1Res.ok) {
            const data = await v1Res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              response = text.trim();
              usedModel = model;
              console.log(`[Sidebar AI] Successfully used REST API with model: ${model}`);
              break;
            }
          }
        } catch {
          // try next model
        }
      }
    }

    if (!response) {
      throw new Error('All Gemini models and API versions failed');
    }

    const recommendation = parseRecommendationResponse(response, countriesRead);
    const responseTime = Date.now() - startTime;

    const traceId = await trackRecommendation({
      userId,
      input: {
        readingHistory: readingHistory.map(b => ({
          title: b.title,
          author: b.author,
          country: b.country,
          rating: b.rating,
        })),
        preferences: JSON.stringify(preferences),
      },
      output: {
        recommendedBook: {
          title: recommendation.title,
          author: recommendation.author,
          country: recommendation.country,
          reason: recommendation.reason,
        },
        model: usedModel,
        promptVersion: '1.0',
      },
      metadata: {
        responseTime,
      },
    });

    await evaluateRecommendation(
      traceId,
      {
        title: recommendation.title,
        author: recommendation.author,
        country: recommendation.country,
        reason: recommendation.reason,
      },
      readingHistory.map(b => ({
        title: b.title,
        author: b.author,
        country: b.country,
        rating: b.rating,
      }))
    );

    return recommendation;
  } catch (error) {
    console.error('Error generating recommendation:', error);
    return getFallbackRecommendation(readingHistory, countriesRead);
  }
}

function buildRecommendationPrompt(
  history: ReadingHistory[],
  countriesRead: Set<string>,
  continentsRead: Set<string>,
  preferences?: {
    preferredGenres?: string[];
    readingPace?: 'slow' | 'medium' | 'fast';
    goal?: string;
  }
): string {
  let prompt = `I'm participating in a reading challenge to read books from different countries around the world.

My reading history so far:
${history.length === 0 
  ? 'I haven\'t read any books yet. Suggest a great starting point!'
  : history.map((b, i) => 
      `${i + 1}. "${b.title}" by ${b.author} (${b.country})${b.rating ? ` - Rated ${b.rating}/5` : ''}`
    ).join('\n')
}

Countries I've already read from: ${Array.from(countriesRead).join(', ') || 'None'}
Continents I've explored: ${Array.from(continentsRead).join(', ') || 'None'}

${preferences?.goal ? `My goal: ${preferences.goal}\n` : ''}
${preferences?.preferredGenres ? `Preferred genres: ${preferences.preferredGenres.join(', ')}\n` : ''}
${preferences?.readingPace ? `Reading pace: ${preferences.readingPace}\n` : ''}

Please recommend a book from a country I haven't read from yet. Format your response as JSON with this structure:
{
  "title": "Book Title",
  "author": "Author Name",
  "country": "Country Name",
  "reason": "A detailed explanation (2-3 sentences) of why this book is a great choice for me",
  "culturalContext": "Brief cultural context about the author/country (optional)",
  "difficulty": "easy|medium|challenging",
  "estimatedPages": 300
}

Make sure the country is one I haven't read from yet, and explain why this book would be meaningful for my journey.`;

  return prompt;
}

function parseRecommendationResponse(
  response: string,
  countriesRead: Set<string>
): BookRecommendation {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const countryCode = getCountryCode(parsed.country) || parsed.countryCode || '';

      return {
        title: parsed.title || 'Unknown',
        author: parsed.author || 'Unknown',
        country: parsed.country || 'Unknown',
        countryCode,
        reason: parsed.reason || 'A great addition to your reading journey',
        culturalContext: parsed.culturalContext,
        difficulty: parsed.difficulty || 'medium',
        estimatedPages: parsed.estimatedPages,
      };
    }
  } catch (error) {
    console.error('Error parsing recommendation response:', error);
  }

  // Fallback parsing (extract from text)
  const lines = response.split('\n');
  const titleMatch = response.match(/"([^"]+)"/);
  const authorMatch = response.match(/by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i);

  return {
    title: titleMatch?.[1] || 'A recommended book',
    author: authorMatch?.[1] || 'An author',
    country: 'Unknown',
    countryCode: '',
    reason: response.substring(0, 200) || 'A great addition to your reading journey',
  };
}

function getFallbackRecommendation(
  history: ReadingHistory[],
  countriesRead: Set<string>
): BookRecommendation {
  // Popular diverse books as fallback
  const fallbacks = [
    { title: 'Things Fall Apart', author: 'Chinua Achebe', country: 'Nigeria', countryCode: 'NG' },
    { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', country: 'Colombia', countryCode: 'CO' },
    { title: 'The Kite Runner', author: 'Khaled Hosseini', country: 'Afghanistan', countryCode: 'AF' },
    { title: 'Pachinko', author: 'Min Jin Lee', country: 'South Korea', countryCode: 'KR' },
    { title: 'The God of Small Things', author: 'Arundhati Roy', country: 'India', countryCode: 'IN' },
  ];

  const available = fallbacks.filter(f => !countriesRead.has(f.countryCode));
  const selected = available.length > 0 
    ? available[Math.floor(Math.random() * available.length)]
    : fallbacks[0];

  return {
    title: selected.title,
    author: selected.author,
    country: selected.country,
    countryCode: selected.countryCode,
    reason: `A classic work from ${selected.country} that offers deep cultural insights and beautiful storytelling.`,
    difficulty: 'medium',
  };
}

/**
 * Generate reflection prompts after finishing a book (uses Gemini)
 */
export async function generateReflectionPrompts(
  book: { title: string; author: string; country: string },
  _readingHistory: ReadingHistory[]
): Promise<string[]> {
  const genAI = getGeminiClient();
  if (!genAI) {
    return [
      `What cultural insights did you gain from reading about ${book.country}?`,
      `How does this book compare to others you've read from different countries?`,
      `What themes or ideas from this book will stay with you?`,
    ];
  }

  try {
    const prompt = `You are a thoughtful reading coach who helps readers reflect on their literary experiences.

I just finished reading "${book.title}" by ${book.author} from ${book.country}.

Generate 3-5 thoughtful reflection prompts or discussion questions that will help me:
1. Understand the cultural context and themes
2. Connect this book to my broader reading journey
3. Reflect on what I learned

Format as a JSON array of strings only: ["prompt 1", "prompt 2", ...]`;

    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const result = await genAI.models.generateContent({
      model,
      contents: prompt,
    });
    const response = result.text?.trim() || '';
    const jsonMatch = response.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [
      `What cultural insights did you gain from reading about ${book.country}?`,
      `How does this book compare to others you've read from different countries?`,
      `What themes or ideas from this book will stay with you?`,
    ];
  } catch (error) {
    console.error('Error generating reflection prompts:', error);
    return [
      `What did you learn about ${book.country} from this book?`,
      `How does this book compare to your other reads?`,
      `What will you remember most about this reading experience?`,
    ];
  }
}
