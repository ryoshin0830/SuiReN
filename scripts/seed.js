import { seedDatabase } from '../src/lib/seed-data.js';
import { prisma } from '../src/lib/prisma.js';

async function main() {
  try {
    await seedDatabase();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();