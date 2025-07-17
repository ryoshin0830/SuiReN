const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setInitialOrder() {
  try {
    // レベルごとにコンテンツを取得して順番を設定
    const levels = await prisma.level.findMany({
      orderBy: { orderIndex: 'asc' }
    });

    for (const level of levels) {
      console.log(`Setting order for level: ${level.displayName} (${level.id})`);
      
      // このレベルのコンテンツを取得
      const contents = await prisma.content.findMany({
        where: { levelCode: level.id },
        orderBy: { createdAt: 'asc' }
      });

      // 順番を設定
      for (let i = 0; i < contents.length; i++) {
        await prisma.content.update({
          where: { id: contents[i].id },
          data: { orderIndex: (i + 1) * 10 }
        });
        console.log(`  - ${contents[i].title}: orderIndex = ${(i + 1) * 10}`);
      }
    }

    console.log('Initial order set successfully!');
  } catch (error) {
    console.error('Error setting initial order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setInitialOrder();