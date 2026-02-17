-- CreateTable
CREATE TABLE "app_stats" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_stats_pkey" PRIMARY KEY ("id")
);
