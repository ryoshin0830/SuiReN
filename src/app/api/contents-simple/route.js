import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET /api/contents-simple - シンプルなクエリでコンテンツを取得
export async function GET() {
  console.log('Contents-Simple API called');
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  
  try {
    // Step 1: Get contents without relations (like levels API)
    console.log('Fetching contents...');
    const contents = await prisma.content.findMany({
      orderBy: { id: 'asc' }
    });
    console.log(`Found ${contents.length} contents`);

    // Step 2: Get all questions for these contents
    const contentIds = contents.map(c => c.id);
    console.log('Fetching questions...');
    const questions = await prisma.question.findMany({
      where: { contentId: { in: contentIds } },
      orderBy: { orderIndex: 'asc' }
    });
    console.log(`Found ${questions.length} questions`);

    // Step 3: Get all options for these questions
    const questionIds = questions.map(q => q.id);
    console.log('Fetching options...');
    const options = await prisma.questionOption.findMany({
      where: { questionId: { in: questionIds } },
      orderBy: { orderIndex: 'asc' }
    });
    console.log(`Found ${options.length} options`);

    // Step 4: Assemble the data manually
    const formattedContents = contents.map(content => {
      const contentQuestions = questions.filter(q => q.contentId === content.id);
      
      return {
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
        questions: contentQuestions.map(question => {
          const questionOptions = options.filter(o => o.questionId === question.id);
          
          return {
            id: question.orderIndex + 1,
            question: question.question,
            options: questionOptions.map(option => option.optionText),
            correctAnswer: question.correctAnswer,
            explanation: question.explanation || ''
          };
        })
      };
    });

    console.log('Successfully assembled data');
    return NextResponse.json(formattedContents);
    
  } catch (error) {
    console.error('Error in contents-simple:', error);
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