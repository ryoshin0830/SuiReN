const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleLabels() {
  try {
    const labels = [
      { name: '重要', color: '#ef4444', description: '重要なコンテンツ' },
      { name: '練習用', color: '#3b82f6', description: '練習に適したコンテンツ' },
      { name: '文法', color: '#10b981', description: '文法に関するコンテンツ' },
      { name: '語彙', color: '#f59e0b', description: '語彙に関するコンテンツ' },
      { name: '日常会話', color: '#8b5cf6', description: '日常会話のコンテンツ' }
    ];

    for (const label of labels) {
      try {
        const created = await prisma.label.create({
          data: label
        });
        console.log(`Created label: ${created.name}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`Label "${label.name}" already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    console.log('Sample labels created successfully!');
  } catch (error) {
    console.error('Error creating sample labels:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleLabels();