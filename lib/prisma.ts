import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Initialize the PostgreSQL adapter using your Supabase URL
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 2. Pass the adapter directly into Prisma
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;