import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET /api/contents-safe - wordCount/characterCountを除外したセーフ版
export async function GET() {
  console.log('Contents-Safe API called');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  try {
    // Get contents without wordCount and characterCount
    const contents = await prisma.content.findMany({
      select: {
        id: true,
        title: true,
        level: true,
        levelCode: true,
        text: true,
        explanation: true,
        images: true,
        thumbnail: true,
        questions: {
          select: {
            orderIndex: true,
            question: true,
            correctAnswer: true,
            explanation: true,
            options: {
              select: {
                optionText: true
              },
              orderBy: { orderIndex: 'asc' }
            }
          },
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });

    // Format the response
    const formattedContents = contents.map(content => ({
      id: content.id,
      title: content.title,
      level: content.level,
      levelCode: content.levelCode,
      text: content.text,
      wordCount: null, // Set to null for compatibility
      characterCount: content.text.length, // Calculate from text
      explanation: content.explanation || '',
      images: content.images || [],
      thumbnail: content.thumbnail || null,
      questions: content.questions.map(question => ({
        id: question.orderIndex + 1,
        question: question.question,
        options: question.options.map(option => option.optionText),
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || ''
      }))
    }));

    console.log('Successfully fetched safe contents');
    return NextResponse.json(formattedContents);
    
  } catch (error) {
    console.error('Error in contents-safe:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch contents',
        details: {
          message: error.message,
          code: error.code,
          dbUrlExists: !!process.env.DATABASE_URL
        }
      },
      { status: 500 }
    );
  }
}