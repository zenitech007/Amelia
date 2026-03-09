import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// 1. Create the pg Pool instance
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Initialize the adapter with the pool
const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 3. Create the client
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ 
    adapter,
    // Optional: useful for debugging 500 errors in development
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
