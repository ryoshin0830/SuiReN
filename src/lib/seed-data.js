import { prisma } from './prisma.js';
import { readingContents } from '../data/contents.js';

export async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Clear existing data
    await prisma.questionOption.deleteMany();
    await prisma.question.deleteMany();
    await prisma.content.deleteMany();
    
    console.log('Cleared existing data');
    
    // Seed data from contents.js
    for (const contentData of readingContents) {
      console.log(`Seeding content: ${contentData.title}`);
      
      const content = await prisma.content.create({
        data: {
          id: contentData.id,
          title: contentData.title,
          level: contentData.level,
          levelCode: contentData.levelCode,
          text: contentData.text,
        },
      });
      
      // Create questions for this content
      for (let i = 0; i < contentData.questions.length; i++) {
        const questionData = contentData.questions[i];
        
        const question = await prisma.question.create({
          data: {
            contentId: content.id,
            question: questionData.question,
            correctAnswer: questionData.correctAnswer,
            orderIndex: i,
          },
        });
        
        // Create options for this question
        for (let j = 0; j < questionData.options.length; j++) {
          await prisma.questionOption.create({
            data: {
              questionId: question.id,
              optionText: questionData.options[j],
              orderIndex: j,
            },
          });
        }
      }
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}