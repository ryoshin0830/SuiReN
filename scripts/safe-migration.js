const { PrismaClient } = require('@prisma/client');

async function safeMigration() {
  const prisma = new PrismaClient();

  try {
    console.log('Starting safe migration process...');

    // 1. 既存のコンテンツのlevelCodeを確認
    console.log('Checking existing content level codes...');
    const contents = await prisma.$queryRaw`
      SELECT DISTINCT "levelCode" FROM contents
    `;
    console.log('Found level codes:', contents);

    // 2. Levelテーブルが存在するか確認
    try {
      const levelCount = await prisma.$queryRaw`
        SELECT COUNT(*) FROM levels
      `;
      console.log('Level table exists with', levelCount[0].count, 'records');
    } catch (error) {
      console.log('Level table does not exist, creating...');
      
      // Levelテーブルを作成
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS levels (
          id VARCHAR(255) PRIMARY KEY,
          "displayName" VARCHAR(255) NOT NULL,
          "orderIndex" INTEGER NOT NULL,
          "isDefault" BOOLEAN DEFAULT false,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
    }

    // 3. 必要なレベルを追加
    const levels = [
      { id: 'beginner', displayName: '中級前半', orderIndex: 1, isDefault: true },
      { id: 'intermediate', displayName: '中級レベル', orderIndex: 2, isDefault: false },
      { id: 'advanced', displayName: '上級レベル', orderIndex: 3, isDefault: false }
    ];

    for (const level of levels) {
      try {
        await prisma.$executeRaw`
          INSERT INTO levels (id, "displayName", "orderIndex", "isDefault")
          VALUES (${level.id}, ${level.displayName}, ${level.orderIndex}, ${level.isDefault})
          ON CONFLICT (id) DO UPDATE SET
            "displayName" = ${level.displayName},
            "orderIndex" = ${level.orderIndex}
        `;
        console.log(`✓ Level ${level.id} created/updated`);
      } catch (error) {
        console.log(`Level ${level.id} error:`, error.message);
      }
    }

    // 4. 無効なlevelCodeを修正
    console.log('Fixing invalid level codes...');
    
    // NULLまたは空のlevelCodeを修正
    await prisma.$executeRaw`
      UPDATE contents 
      SET "levelCode" = 'beginner'
      WHERE "levelCode" IS NULL OR "levelCode" = ''
    `;

    // 存在しないレベルコードを修正
    await prisma.$executeRaw`
      UPDATE contents 
      SET "levelCode" = 'beginner'
      WHERE "levelCode" NOT IN ('beginner', 'intermediate', 'advanced')
    `;

    console.log('Migration completed successfully!');
    console.log('You can now run "prisma db push" safely.');

  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
safeMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });