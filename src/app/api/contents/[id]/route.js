import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/contents/[id] - 特定のコンテンツを取得
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
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
      wordCount: content.wordCount,    // 語数
      characterCount: content.characterCount || content.text.length, // 文字数（保存された値または自動計算）
      explanation: content.explanation || '', // 文章の解説
      images: content.images || [],
      thumbnail: content.thumbnail || null,
      questions: content.questions.map(question => ({
        id: question.orderIndex + 1,
        question: question.question,
        options: question.options.map(option => option.optionText),
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || '' // 問題の解説
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
    const { id } = await params;
    const body = await request.json();
    const { title, level, levelCode, text, wordCount, characterCount, explanation, questions, images, thumbnail } = body;
    
    console.log('PUT /api/contents/[id] received:', {
      id,
      wordCount: { value: wordCount, type: typeof wordCount },
      characterCount: { value: characterCount, type: typeof characterCount }
    });

    // トランザクション内で更新処理（タイムアウトを延長）
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
          wordCount: wordCount ? parseInt(wordCount) : null,      // 語数
          characterCount: characterCount ? parseInt(characterCount) : null, // 文字数
          explanation: explanation || null, // 文章の解説
          images: images || [],
          thumbnail: thumbnail || null,
          questions: {
            create: questions.map((question, questionIndex) => ({
              question: question.question,
              correctAnswer: question.correctAnswer,
              explanation: question.explanation || null, // 問題の解説
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
    }, {
      timeout: 30000 // タイムアウトを30秒に延長
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
    const { id } = await params;

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