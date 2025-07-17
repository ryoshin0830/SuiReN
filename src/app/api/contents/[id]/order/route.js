import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function PUT(request, props) {
  const params = await props.params;
  const { id } = params;

  try {
    const { direction, levelCode } = await request.json();
    
    // 現在のコンテンツを取得
    const currentContent = await prisma.content.findUnique({
      where: { id }
    });

    if (!currentContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // 同じレベルのコンテンツを取得（orderIndexでソート）
    const contents = await prisma.content.findMany({
      where: { levelCode: levelCode },
      orderBy: { orderIndex: 'asc' }
    });

    // 現在のインデックスを見つける
    const currentIndex = contents.findIndex(c => c.id === id);
    if (currentIndex === -1) {
      return NextResponse.json(
        { error: 'Content not found in level' },
        { status: 404 }
      );
    }

    // 新しいインデックスを計算
    let newIndex = currentIndex;
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < contents.length - 1) {
      newIndex = currentIndex + 1;
    }

    // インデックスが変わった場合のみ更新
    if (newIndex !== currentIndex) {
      // トランザクションで順番を更新
      await prisma.$transaction(async (tx) => {
        // すべてのコンテンツにorderIndexを設定（既存の順番を保持）
        for (let i = 0; i < contents.length; i++) {
          if (!contents[i].orderIndex) {
            await tx.content.update({
              where: { id: contents[i].id },
              data: { orderIndex: i * 10 }
            });
          }
        }

        // 順番を入れ替える
        const targetContent = contents[newIndex];
        const currentOrderIndex = currentContent.orderIndex || currentIndex * 10;
        const targetOrderIndex = targetContent.orderIndex || newIndex * 10;

        // 対象のコンテンツと現在のコンテンツの順番を入れ替え
        await tx.content.update({
          where: { id: currentContent.id },
          data: { orderIndex: targetOrderIndex }
        });

        await tx.content.update({
          where: { id: targetContent.id },
          data: { orderIndex: currentOrderIndex }
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating content order:', error);
    return NextResponse.json(
      { error: 'Failed to update content order' },
      { status: 500 }
    );
  }
}