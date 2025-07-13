import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET /api/contents-optimized - 最適化されたクエリでコンテンツを取得
export async function GET() {
  console.log('Contents-Optimized API called');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  try {
    // Use transaction for better connection handling
    const result = await prisma.$transaction(async (tx) => {
      // Get only essential fields first
      const contents = await tx.content.findMany({
        orderBy: { id: 'asc' }
      });

      // Get questions with options in a single query using raw SQL
      const questionsWithOptions = await tx.$queryRaw`
        SELECT 
          q.id as question_id,
          q."contentId" as content_id,
          q.question,
          q."correctAnswer",
          q.explanation as question_explanation,
          q."orderIndex" as question_order,
          o.id as option_id,
          o."optionText",
          o."orderIndex" as option_order
        FROM questions q
        LEFT JOIN question_options o ON q.id = o."questionId"
        WHERE q."contentId" = ANY(${contents.map(c => c.id)})
        ORDER BY q."orderIndex", o."orderIndex"
      `;

      // Group the results
      const questionsByContent = {};
      questionsWithOptions.forEach(row => {
        const contentId = row.content_id;
        if (!questionsByContent[contentId]) {
          questionsByContent[contentId] = {};
        }
        
        const questionId = row.question_id;
        if (!questionsByContent[contentId][questionId]) {
          questionsByContent[contentId][questionId] = {
            id: row.question_order + 1,
            question: row.question,
            correctAnswer: row.correctAnswer,
            explanation: row.question_explanation || '',
            options: []
          };
        }
        
        if (row.option_id) {
          questionsByContent[contentId][questionId].options.push(row.optionText);
        }
      });

      // Format the final response
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
        questions: Object.values(questionsByContent[content.id] || {})
      }));

      return formattedContents;
    }, {
      maxWait: 5000, // 5 seconds max wait
      timeout: 10000 // 10 seconds timeout
    });

    console.log('Successfully fetched optimized contents');
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in contents-optimized:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    // Special handling for Prisma errors
    if (error.code === 'P2024') {
      return NextResponse.json(
        { 
          error: 'Database connection timeout',
          details: {
            message: 'The database took too long to respond. This might be a Vercel connection limit issue.',
            code: error.code,
            suggestion: 'Try using the simple endpoint instead'
          }
        },
        { status: 503 }
      );
    }
    
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