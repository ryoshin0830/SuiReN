const { PrismaClient } = require('@prisma/client');

async function debugVercelError() {
  // Vercelと同じ環境変数を使用
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_47zjrBksytRL@ep-bitter-cake-a4rqbp7v-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn', 'info'],
  });

  console.log('=== Vercelエラーのデバッグ ===\n');

  try {
    // 1. Prismaが生成したクライアントを確認
    console.log('1. Prismaクライアントのモデル:');
    console.log('利用可能なモデル:', Object.keys(prisma));
    console.log('');

    // 2. 直接SQLでlevelsテーブルを確認
    console.log('2. 直接SQLでlevelsテーブルを確認:');
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_name = 'levels' 
        ORDER BY ordinal_position
      `;
      console.log('levelsテーブルの構造:', tables);
    } catch (error) {
      console.log('エラー:', error.message);
    }

    // 3. Vercelと同じコードを実行
    console.log('\n3. Vercel APIと同じコードを実行:');
    try {
      console.log('prisma.level.findMany()を実行...');
      const levels = await prisma.level.findMany({
        orderBy: { orderIndex: 'asc' }
      });
      console.log('成功! レベル数:', levels.length);
      console.log('データ:', levels);
    } catch (error) {
      console.error('エラー発生！');
      console.error('エラータイプ:', error.constructor.name);
      console.error('エラーコード:', error.code);
      console.error('エラーメッセージ:', error.message);
      if (error.clientVersion) {
        console.error('Prismaクライアントバージョン:', error.clientVersion);
      }
    }

    // 4. Prismaが認識しているモデルを確認
    console.log('\n4. Prismaのモデル情報:');
    try {
      // _prismaMetaテーブルの確認
      const migrations = await prisma.$queryRaw`
        SELECT * FROM _prisma_migrations 
        ORDER BY finished_at DESC 
        LIMIT 5
      `;
      console.log('マイグレーション履歴:', migrations);
    } catch (error) {
      console.log('_prisma_migrationsテーブルが存在しません');
    }

    // 5. schema.prismaの内容を確認
    console.log('\n5. 現在のPrismaスキーマの状態を確認してください:');
    console.log('- Levelモデルが定義されているか');
    console.log('- generator clientが正しく設定されているか');
    console.log('- datasource dbが正しく設定されているか');

  } catch (error) {
    console.error('予期しないエラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugVercelError();