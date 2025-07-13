import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// Test endpoint with transaction and timeout handling
export async function GET() {
  console.log('Contents Test API called');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  try {
    // Use a transaction with extended timeout
    const contents = await prisma.$transaction(async (tx) => {
      // First test the connection with a simple query
      const testQuery = await tx.$queryRaw`SELECT 1 as test`;
      console.log('Database connection test:', testQuery);
      
      // Try to count contents first
      const contentCount = await tx.content.count();
      console.log('Content count:', contentCount);
      
      // If we have contents, fetch them with includes
      if (contentCount > 0) {
        return await tx.content.findMany({
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
      }
      
      return [];
    }, {
      maxWait: 10000, // 10 seconds max wait time
      timeout: 30000  // 30 seconds timeout
    });

    // Format the data
    const formattedContents = contents.map(content => ({
      id: content.id,
      title: content.title,
      level: content.level,
      levelCode: content.levelCode,
      text: content.text,
      wordCount: content.wordCount,
      characterCount: content.characterCount || content.text.length,
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

    return NextResponse.json({
      success: true,
      count: formattedContents.length,
      data: formattedContents
    });
    
  } catch (error) {
    console.error('Error in test contents API:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    // Try to provide helpful debugging info
    let debugInfo = {
      error: 'Failed to fetch contents',
      errorType: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        dbUrlExists: !!process.env.DATABASE_URL
      }
    };
    
    // Add specific error handling
    if (error.code === 'P1001') {
      debugInfo.suggestion = 'Cannot reach database server';
    } else if (error.code === 'P1002') {
      debugInfo.suggestion = 'Database server reached but timed out';
    } else if (error.code === 'P2021' || error.code === 'P2022') {
      debugInfo.suggestion = 'Table does not exist - run migrations';
    }
    
    return NextResponse.json(debugInfo, { status: 500 });
  }
}