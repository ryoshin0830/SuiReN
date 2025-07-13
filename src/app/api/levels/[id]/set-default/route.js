import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

// PUT: デフォルトレベルの設定
export async function PUT(request, props) {
  const params = await props.params;
  const { id } = params;
  
  console.log('Setting default level:', id);
  console.log('Request URL:', request.url);

  try {
    // レベルの存在確認
    const level = await prisma.level.findUnique({
      where: { id }
    });

    if (!level) {
      return NextResponse.json(
        { error: 'レベルが見つかりません' },
        { status: 404 }
      );
    }

    // 既にデフォルトの場合は何もしない
    if (level.isDefault) {
      return NextResponse.json(level);
    }

    // トランザクション処理
    const updatedLevel = await prisma.$transaction(async (tx) => {
      // 1. 現在のデフォルトレベルを解除
      await tx.level.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });

      // 2. 指定されたレベルをデフォルトに設定
      const updated = await tx.level.update({
        where: { id },
        data: { isDefault: true }
      });
      
      // _countを手動で追加
      const count = await tx.content.count({
        where: { levelCode: id }
      });
      
      return {
        ...updated,
        _count: { contents: count }
      };
    });

    return NextResponse.json(updatedLevel);
  } catch (error) {
    console.error('Error setting default level:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'デフォルトレベルの設定に失敗しました' },
      { status: 500 }
    );
  }
}