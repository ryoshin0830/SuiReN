const { PrismaClient } = require('@prisma/client');

async function forceCreateLevels() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('=== Force Create Levels Table ===');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

    // 1. まずLevelテーブルを削除して再作成
    console.log('\n1. Dropping and recreating levels table...');
    try {
      // 外部キー制約を削除
      await prisma.$executeRaw`ALTER TABLE IF EXISTS contents DROP CONSTRAINT IF EXISTS "contents_levelCode_fkey"`;
      console.log('✓ Dropped foreign key constraint');
      
      // Levelテーブルを削除
      await prisma.$executeRaw`DROP TABLE IF EXISTS levels CASCADE`;
      console.log('✓ Dropped existing levels table');
    } catch (error) {
      console.log('Note:', error.message);
    }

    // 2. Levelテーブルを作成
    console.log('\n2. Creating levels table...');
    await prisma.$executeRaw`
      CREATE TABLE levels (
        id VARCHAR(255) PRIMARY KEY,
        "displayName" VARCHAR(255) NOT NULL,
        "orderIndex" INTEGER NOT NULL,
        "isDefault" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✓ Created levels table');

    // 3. 初期データを挿入
    console.log('\n3. Inserting initial level data...');
    const now = new Date().toISOString();
    await prisma.$executeRaw`
      INSERT INTO levels (id, "displayName", "orderIndex", "isDefault", "createdAt", "updatedAt")
      VALUES 
        ('beginner', '中級前半', 1, true, ${now}::timestamp, ${now}::timestamp),
        ('intermediate', '中級レベル', 2, false, ${now}::timestamp, ${now}::timestamp),
        ('advanced', '上級レベル', 3, false, ${now}::timestamp, ${now}::timestamp)
    `;
    console.log('✓ Inserted initial levels');

    // 4. 既存コンテンツのlevelCodeを修正
    console.log('\n4. Fixing content level codes...');
    const updateResult = await prisma.$executeRaw`
      UPDATE contents 
      SET "levelCode" = 'beginner'
      WHERE "levelCode" IS NULL 
         OR "levelCode" = ''
         OR "levelCode" NOT IN ('beginner', 'intermediate', 'advanced')
    `;
    console.log(`✓ Updated ${updateResult} content records`);

    // 5. 外部キー制約を追加
    console.log('\n5. Adding foreign key constraint...');
    await prisma.$executeRaw`
      ALTER TABLE contents 
      ADD CONSTRAINT "contents_levelCode_fkey" 
      FOREIGN KEY ("levelCode") 
      REFERENCES levels(id) 
      ON DELETE RESTRICT 
      ON UPDATE CASCADE
    `;
    console.log('✓ Added foreign key constraint');

    // 6. 検証
    console.log('\n6. Verifying setup...');
    const levels = await prisma.level.findMany({
      include: {
        _count: {
          select: { contents: true }
        }
      }
    });
    console.log('✓ Level table is working!');
    console.log('Levels:', levels);

    console.log('\n=== Success! Level table is ready ===');
  } catch (error) {
    console.error('\n=== Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    if (error.meta) {
      console.error('Error meta:', error.meta);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 実行
forceCreateLevels()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error.message);
    process.exit(1);
  });