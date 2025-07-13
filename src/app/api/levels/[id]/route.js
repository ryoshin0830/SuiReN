import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// GET: 特定レベルの取得
export async function GET(request, props) {
  const params = await props.params;
  const { id } = params;

  try {
    const level = await prisma.level.findUnique({
      where: { id }
    });

    if (level) {
      // _countを手動で追加
      const count = await prisma.content.count({
        where: { levelCode: id }
      });
      level._count = { contents: count };
    }

    if (!level) {
      return NextResponse.json(
        { error: 'レベルが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(level);
  } catch (error) {
    console.error('Error fetching level:', error);
    return NextResponse.json(
      { error: 'レベルの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: レベルの更新
export async function PUT(request, props) {
  const params = await props.params;
  const { id } = params;

  try {
    const body = await request.json();
    const { displayName, orderIndex } = body;

    // バリデーション
    if (displayName && displayName.length > 20) {
      return NextResponse.json(
        { error: '表示名は20文字以内で入力してください' },
        { status: 400 }
      );
    }

    // 更新データの構築
    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (orderIndex !== undefined) updateData.orderIndex = orderIndex;

    // レベルの更新
    const updatedLevel = await prisma.level.update({
      where: { id },
      data: updateData
    });

    // _countを手動で追加
    const count = await prisma.content.count({
      where: { levelCode: id }
    });
    updatedLevel._count = { contents: count };

    // 関連するコンテンツのlevelフィールドも更新
    if (displayName) {
      await prisma.content.updateMany({
        where: { levelCode: id },
        data: { level: displayName }
      });
    }

    return NextResponse.json(updatedLevel);
  } catch (error) {
    console.error('Error updating level:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'レベルが見つかりません' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'レベルの更新に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: レベルの削除
export async function DELETE(request, props) {
  const params = await props.params;
  const { id } = params;
  
  try {
    // クエリパラメータから移行先レベルIDを取得
    const url = new URL(request.url);
    const targetLevelId = url.searchParams.get('targetLevelId');

    if (!targetLevelId) {
      return NextResponse.json(
        { error: '移行先レベルを指定してください' },
        { status: 400 }
      );
    }

    // デフォルトレベルは削除不可
    const levelToDelete = await prisma.level.findUnique({
      where: { id }
    });

    if (!levelToDelete) {
      return NextResponse.json(
        { error: 'レベルが見つかりません' },
        { status: 404 }
      );
    }

    if (levelToDelete.isDefault) {
      return NextResponse.json(
        { error: 'デフォルトレベルは削除できません' },
        { status: 400 }
      );
    }

    // 移行先レベルの存在確認
    const targetLevel = await prisma.level.findUnique({
      where: { id: targetLevelId }
    });

    if (!targetLevel) {
      return NextResponse.json(
        { error: '移行先レベルが見つかりません' },
        { status: 400 }
      );
    }

    // トランザクション処理
    await prisma.$transaction(async (tx) => {
      // 1. 関連するコンテンツを移行先レベルに変更
      await tx.content.updateMany({
        where: { levelCode: id },
        data: { 
          levelCode: targetLevelId,
          level: targetLevel.displayName
        }
      });

      // 2. レベルを削除
      await tx.level.delete({
        where: { id }
      });
    });

    return NextResponse.json({ 
      message: 'レベルが正常に削除されました',
      movedContentsTo: targetLevelId
    });
  } catch (error) {
    console.error('Error deleting level:', error);
    return NextResponse.json(
      { error: 'レベルの削除に失敗しました' },
      { status: 500 }
    );
  }
}