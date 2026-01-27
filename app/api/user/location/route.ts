import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/user/location - Get user location
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        locationCity: true,
        locationLat: true,
        locationLng: true,
      },
    });

    return NextResponse.json(user || {});
  } catch (error) {
    console.error('Error fetching user location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}

// PUT /api/user/location - Update user location
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { city, lat, lng } = await request.json();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(city !== undefined && { locationCity: city }),
        ...(lat !== undefined && { locationLat: lat }),
        ...(lng !== undefined && { locationLng: lng }),
      },
      select: {
        locationCity: true,
        locationLat: true,
        locationLng: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user location:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}
