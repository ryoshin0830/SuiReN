import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/contents/[id]/labels - コンテンツのラベルを取得
export async function GET(request, props) {
  const params = await props.params;
  const { id } = params;

  try {
    const contentLabels = await prisma.contentLabel.findMany({
      where: { contentId: id },
      include: {
        label: true
      }
    });

    const labels = contentLabels.map(cl => cl.label);
    return NextResponse.json(labels);
  } catch (error) {
    console.error('Error fetching content labels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content labels' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/contents/[id]/labels - コンテンツのラベルを更新
export async function PUT(request, props) {
  const params = await props.params;
  const { id } = params;

  try {
    const { labelIds } = await request.json();

    // トランザクションで既存のラベルを削除して新しいラベルを追加
    await prisma.$transaction(async (tx) => {
      // 既存のラベル関連を削除
      await tx.contentLabel.deleteMany({
        where: { contentId: id }
      });

      // 新しいラベル関連を追加
      if (labelIds && labelIds.length > 0) {
        await tx.contentLabel.createMany({
          data: labelIds.map(labelId => ({
            contentId: id,
            labelId
          }))
        });
      }
    });

    // 更新されたラベルを取得して返す
    const contentLabels = await prisma.contentLabel.findMany({
      where: { contentId: id },
      include: {
        label: true
      }
    });

    const labels = contentLabels.map(cl => cl.label);
    return NextResponse.json(labels);
  } catch (error) {
    console.error('Error updating content labels:', error);
    return NextResponse.json(
      { error: 'Failed to update content labels' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}