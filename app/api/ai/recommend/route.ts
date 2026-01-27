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

    const readingHistory: ReadingHistory[] = books.map(book => ({
      title: book.title,
      author: book.author,
      country: book.countryName,
      countryCode: book.countryCode,
      rating: book.rating || undefined,
      endDate: book.endDate || undefined,
    }));

    // Generate recommendation
    const recommendation = await generateRecommendation(
      session.user.id,
      readingHistory,
      preferences
    );

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('Error generating recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}
