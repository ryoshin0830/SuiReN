const { PrismaClient } = require('@prisma/client');

async function testDefaultUpdate() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('=== デフォルトレベル更新のテスト ===\n');

    // 1. 現在の状態を確認
    console.log('1. 現在のレベル:');
    const currentLevels = await prisma.level.findMany({
      orderBy: { orderIndex: 'asc' }
    });
    console.log(currentLevels);

    // 2. トランザクションで更新を試みる
    console.log('\n2. intermediateをデフォルトに設定:');
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 現在のデフォルトを解除
        await tx.level.updateMany({
          where: { isDefault: true },
          data: { isDefault: false }
        });

        // 新しいデフォルトを設定
        const updated = await tx.level.update({
          where: { id: 'intermediate' },
          data: { isDefault: true }
        });

        // カウントを取得
        const count = await tx.content.count({
          where: { levelCode: 'intermediate' }
        });

        return {
          ...updated,
          _count: { contents: count }
        };
      });
      
      console.log('成功:', result);
    } catch (error) {
      console.error('エラー:', error);
      console.error('エラー詳細:', {
        name: error.name,
        message: error.message,
        code: error.code,
        meta: error.meta
      });
    }

    // 3. 更新後の状態を確認
    console.log('\n3. 更新後のレベル:');
    const updatedLevels = await prisma.level.findMany({
      orderBy: { orderIndex: 'asc' }
    });
    console.log(updatedLevels);

  } catch (error) {
    console.error('予期しないエラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDefaultUpdate();