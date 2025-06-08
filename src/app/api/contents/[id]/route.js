import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/contents/[id] - 特定のコンテンツを取得
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // データ形式を既存の構造に変換
    const formattedContent = {
      id: content.id,
      title: content.title,
      level: content.level,
      levelCode: content.levelCode,
      text: content.text,
      images: content.images || [],
      questions: content.questions.map(question => ({
        id: question.orderIndex + 1,
        question: question.question,
        options: question.options.map(option => option.optionText),
        correctAnswer: question.correctAnswer
      }))
    };

    return NextResponse.json(formattedContent);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// PUT /api/contents/[id] - コンテンツを更新
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, level, levelCode, text, questions, images } = body;

    // トランザクション内で更新処理
    const updatedContent = await prisma.$transaction(async (tx) => {
      // 既存の質問と選択肢を削除
      await tx.questionOption.deleteMany({
        where: {
          question: {
            contentId: id
          }
        }
      });
      await tx.question.deleteMany({
        where: { contentId: id }
      });

      // コンテンツを更新
      const content = await tx.content.update({
        where: { id },
        data: {
          title,
          level,
          levelCode,
          text,
          images: images || [],
          questions: {
            create: questions.map((question, questionIndex) => ({
              question: question.question,
              correctAnswer: question.correctAnswer,
              orderIndex: questionIndex,
              options: {
                create: question.options.map((optionText, optionIndex) => ({
                  optionText,
                  orderIndex: optionIndex
                }))
              }
            }))
          }
        },
        include: {
          questions: {
            include: {
              options: {
                orderBy: { orderIndex: 'asc' }
              }
            },
            orderBy: { orderIndex: 'asc' }
          }
        }
      });

      return content;
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

// DELETE /api/contents/[id] - コンテンツを削除
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.content.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}