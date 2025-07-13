import { PrismaClient } from '@prisma/client';

// Vercel-optimized Prisma client with connection pooling considerations
const globalForPrisma = globalThis;

// Configure Prisma client with specific settings for Vercel
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    // Add connection pool settings for Vercel
    datasourceUrl: process.env.DATABASE_URL,
    // Optimize for serverless
    errorFormat: 'minimal'
  });
};

// Ensure single instance in production
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = globalForPrisma.prisma || prismaClientSingleton();
}

export const prisma = globalForPrisma.prisma || prismaClientSingleton();

// Ensure we don't create multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;