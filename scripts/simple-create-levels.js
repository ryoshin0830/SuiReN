const { PrismaClient } = require('@prisma/client');

async function simpleCreateLevels() {
  console.log('=== Simple Create Levels Script Started ===');
  console.log('Environment:', process.env.VERCEL ? 'Vercel' : 'Local');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  // Vercel environment or local development
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set');
    console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES')));
    process.exit(1);
  }
  
  const prisma = new PrismaClient();

  try {
    console.log('Connecting to database...');
    
    // Test connection first
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Database connection successful');
    
    console.log('Creating Level table without constraints...');

    // 1. Levelテーブルを作成（存在しない場合）
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS levels (
        id VARCHAR(255) PRIMARY KEY,
        "displayName" VARCHAR(255) NOT NULL,
        "orderIndex" INTEGER NOT NULL,
        "isDefault" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Level table created/verified');

    // 2. 初期データを挿入（存在しない場合）
    const now = new Date();
    await prisma.$executeRaw`
      INSERT INTO levels (id, "displayName", "orderIndex", "isDefault", "createdAt", "updatedAt")
      VALUES 
        ('beginner', '中級前半', 1, true, ${now}, ${now}),
        ('intermediate', '中級レベル', 2, false, ${now}, ${now}),
        ('advanced', '上級レベル', 3, false, ${now}, ${now})
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✓ Initial levels inserted');

    console.log('✓ Level table setup completed!');
  } catch (error) {
    console.error('Error:', error.message);
    // エラーでも続行
  } finally {
    await prisma.$disconnect();
  }
}

simpleCreateLevels()
  .then(() => process.exit(0))
  .catch(() => process.exit(0)); // エラーでも0で終了