// lib/user-stats.ts
import prisma from './prisma';

/**
 * Get total user count (fast, cached in database)
 */
export async function getUserCount(): Promise<number> {
  const stats = await prisma.appStats.findUnique({
    where: { id: 'singleton' },
    select: { totalUsers: true },
  });
  
  // Fallback to actual count if stats don't exist (first run)
  if (!stats) {
    const actualCount = await prisma.user.count();
    // Initialize stats
    await prisma.appStats.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', totalUsers: actualCount },
      update: { totalUsers: actualCount },
    });
    return actualCount;
  }
  
  return stats.totalUsers;
}

/**
 * Increment user count (call when user is created)
 */
export async function incrementUserCount(): Promise<void> {
  await prisma.appStats.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', totalUsers: 1 },
    update: { totalUsers: { increment: 1 } },
  });
}

/**
 * Decrement user count (call when user is deleted)
 */
export async function decrementUserCount(): Promise<void> {
  await prisma.appStats.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', totalUsers: 0 },
    update: { totalUsers: { decrement: 1 } },
  });
}