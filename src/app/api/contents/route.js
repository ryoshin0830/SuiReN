import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/contents - 全コンテンツを取得
export async function GET() {
  try {
    const contents = await prisma.content.findMany({
      include: {
        questions: {
          include: {
            options: {
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });

    // データ形式を既存の構造に変換
    const formattedContents = contents.map(content => ({
      id: content.id,
      title: content.title,
      level: content.level,
      levelCode: content.levelCode,
      text: content.text,
      explanation: content.explanation || '', // 文章の解説
      characterCount: content.text.length, // 文字数を追加
      images: content.images || [],
      thumbnail: content.thumbnail || null,
      questions: content.questions.map(question => ({
        id: question.orderIndex + 1, // 1から始まる連番
        question: question.question,
        options: question.options.map(option => option.optionText),
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || '' // 問題の解説
      }))
    }));

    return NextResponse.json(formattedContents);
  } catch (error) {
    console.error('Error fetching contents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contents' },
      { status: 500 }
    );
  }
}

// POST /api/contents - 新しいコンテンツを作成
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('API POST received data:', {
      title: body.title,
      textLength: body.text?.length,
      questionsCount: body.questions?.length,
      imagesCount: body.images?.length,
      totalSize: JSON.stringify(body).length
    });
    
    const { title, level, levelCode, text, explanation, questions, images, thumbnail } = body;

    const content = await prisma.content.create({
      data: {
        title,
        level,
        levelCode,
        text,
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

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    
    // より詳細なエラー情報を返す
    let errorMessage = 'Failed to create content';
    if (error.code === 'P2002') {
      errorMessage = 'Content with this ID already exists';
    } else if (error.code === 'P2025') {
      errorMessage = 'Referenced record not found';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.code || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}