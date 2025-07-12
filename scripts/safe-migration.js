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
          "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
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
        const now = new Date();
        await prisma.$executeRaw`
          INSERT INTO levels (id, "displayName", "orderIndex", "isDefault", "createdAt", "updatedAt")
          VALUES (${level.id}, ${level.displayName}, ${level.orderIndex}, ${level.isDefault}, ${now}, ${now})
          ON CONFLICT (id) DO UPDATE SET
            "displayName" = ${level.displayName},
            "orderIndex" = ${level.orderIndex},
            "updatedAt" = ${now}
        `;
        console.log(`✓ Level ${level.id} created/updated`);
      } catch (error) {
        console.log(`Level ${level.id} error:`, error.message);
        console.log('Full error:', error);
      }
    }

    // 4. 既存の外部キー制約を削除（存在する場合）
    console.log('Removing existing foreign key constraint if exists...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE contents DROP CONSTRAINT IF EXISTS "contents_levelCode_fkey"
      `;
      console.log('✓ Existing foreign key constraint removed');
    } catch (error) {
      console.log('No existing foreign key constraint to remove');
    }

    // 5. 無効なlevelCodeを修正
    console.log('Fixing invalid level codes...');
    
    // NULLまたは空のlevelCodeを修正
    const nullFixed = await prisma.$executeRaw`
      UPDATE contents 
      SET "levelCode" = 'beginner'
      WHERE "levelCode" IS NULL OR "levelCode" = ''
    `;
    console.log(`✓ Fixed ${nullFixed} NULL or empty levelCodes`);

    // 存在しないレベルコードを修正
    const invalidFixed = await prisma.$executeRaw`
      UPDATE contents 
      SET "levelCode" = 'beginner'
      WHERE "levelCode" NOT IN ('beginner', 'intermediate', 'advanced')
    `;
    console.log(`✓ Fixed ${invalidFixed} invalid levelCodes`);

    // 6. レベルコードの統計を表示
    const stats = await prisma.$queryRaw`
      SELECT "levelCode", COUNT(*) as count 
      FROM contents 
      GROUP BY "levelCode"
    `;
    console.log('Content level distribution:', stats);

    console.log('\nMigration completed successfully!');
    console.log('Database is now ready for prisma db push.');

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