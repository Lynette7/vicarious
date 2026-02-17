import {  NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserCount } from '@/lib/user-stats';

export async function GET() {
    try {
        const totalUsers = await getUserCount();
        return NextResponse.json({
            totalUsers, 
            timestamp: new Date().toISOString()
        })
        
    }catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
    }
}