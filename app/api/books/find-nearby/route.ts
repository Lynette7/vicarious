import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getBookAvailability } from '@/lib/location';

// POST /api/books/find-nearby - Find nearby bookshops and libraries for a book
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, author, lat, lng } = await request.json();

    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    // Get user location (from request or saved in profile)
    let userLat = lat;
    let userLng = lng;

    if (!userLat || !userLng) {
      // Try to get from user profile
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { locationLat: true, locationLng: true },
      });

      if (user?.locationLat && user?.locationLng) {
        userLat = user.locationLat;
        userLng = user.locationLng;
      }
    }

    if (!userLat || !userLng) {
      return NextResponse.json(
        { error: 'Location is required. Please provide lat/lng or set your location in profile.' },
        { status: 400 }
      );
    }

    // Get book availability
    const availability = await getBookAvailability(title, author, userLat, userLng);

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error finding nearby locations:', error);
    return NextResponse.json(
      { error: 'Failed to find nearby locations' },
      { status: 500 }
    );
  }
}
