/**
 * AI Service for Book Recommendations
 * 
 * Uses OpenAI (or compatible API) to generate personalized book recommendations
 * based on user reading history and preferences.
 */

import OpenAI from 'openai';
import { trackRecommendation, evaluateRecommendation } from './opik';
import { getContinent } from './continents';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

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

  // Build prompt
  const prompt = buildRecommendationPrompt(readingHistory, countriesRead, continentsRead, preferences);

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert literary advisor helping readers explore diverse global literature. 
          Your recommendations should be thoughtful, culturally rich, and help readers discover new perspectives.
          Always provide specific book titles and authors, and explain why each recommendation is valuable.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || '';
    const recommendation = parseRecommendationResponse(response, countriesRead);

    const responseTime = Date.now() - startTime;

    // Track with Opik
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
        model: completion.model,
        promptVersion: '1.0',
      },
      metadata: {
        responseTime,
        tokenCount: completion.usage?.total_tokens,
      },
    });

    // Evaluate the recommendation
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
    
    // Fallback recommendation
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
      
      // Get country code (we'll need to look it up)
      const { getCountryCode } = require('./countries');
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
 * Generate reflection prompts after finishing a book
 */
export async function generateReflectionPrompts(
  book: { title: string; author: string; country: string },
  readingHistory: ReadingHistory[]
): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a thoughtful reading coach who helps readers reflect on their literary experiences.',
        },
        {
          role: 'user',
          content: `I just finished reading "${book.title}" by ${book.author} from ${book.country}.

Generate 3-5 thoughtful reflection prompts or discussion questions that will help me:
1. Understand the cultural context and themes
2. Connect this book to my broader reading journey
3. Reflect on what I learned

Format as a JSON array of strings: ["prompt 1", "prompt 2", ...]`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content || '';
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
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
