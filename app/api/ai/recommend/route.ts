import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateRecommendation, ReadingHistory } from '@/lib/ai';

// POST /api/ai/recommend - Get AI book recommendation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { preferences } = body;

    // Get user's reading history
    const books = await prisma.book.findMany({
      where: { userId: session.user.id },
      orderBy: { endDate: 'desc' },
    });

    type BookRow = (typeof books)[number];
    const readingHistory: ReadingHistory[] = books.map((book: BookRow) => ({
      title: book.title,
      author: book.author,
      country: book.countryName,
      countryCode: book.countryCode,
      rating: book.rating || undefined,
      endDate: book.endDate || undefined,
    }));

    if (readingHistory.length === 0) {
      return NextResponse.json(
        { noHistory: true, error: 'Add some books to your reading journey to get personalized recommendations.' },
        { status: 400 }
      );
    }

    // Generate recommendation
    const recommendation = await generateRecommendation(
      session.user.id,
      readingHistory,
      preferences
    );

    return NextResponse.json(recommendation);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('Error generating recommendation:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate recommendation',
        detail: process.env.NODE_ENV === 'development' ? message : undefined,
        ...(process.env.NODE_ENV === 'development' && stack ? { stack } : {}),
      },
      { status: 500 }
    );
  }
}
