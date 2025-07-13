const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#][^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

async function checkDatabase() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('=== データベースの状態を確認 ===\n');

    // 1. テーブルの存在確認
    console.log('1. テーブル一覧:');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log(tables);

    // 2. levelsテーブルの存在確認
    console.log('\n2. levelsテーブルの構造:');
    try {
      const levelColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'levels' AND table_schema = 'public'
      `;
      console.log(levelColumns);
    } catch (error) {
      console.log('levelsテーブルが存在しません');
    }

    // 3. levelsテーブルのデータ確認
    console.log('\n3. levelsテーブルのデータ:');
    try {
      const levels = await prisma.$queryRaw`SELECT * FROM levels`;
      console.log(levels);
    } catch (error) {
      console.log('エラー:', error.message);
    }

    // 4. contentsテーブルのlevelCode値を確認
    console.log('\n4. contentsテーブルのlevelCode値の分布:');
    const levelCodes = await prisma.$queryRaw`
      SELECT "levelCode", COUNT(*) as count 
      FROM contents 
      GROUP BY "levelCode"
    `;
    console.log(levelCodes);

  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();