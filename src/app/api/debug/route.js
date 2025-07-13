import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DATABASE_URL_UNPOOLED_EXISTS: !!process.env.DATABASE_URL_UNPOOLED,
    },
    database: {
      connected: false,
      error: null,
      tables: [],
      levelCount: 0,
      contentCount: 0
    }
  };

  try {
    // Test database connection
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    debugInfo.database.tables = tables.map(t => t.table_name);
    debugInfo.database.connected = true;

    // Check if Level table exists
    const hasLevelTable = tables.some(t => t.table_name === 'levels');
    debugInfo.database.hasLevelTable = hasLevelTable;

    if (hasLevelTable) {
      try {
        const levelCount = await prisma.level.count();
        debugInfo.database.levelCount = levelCount;
      } catch (e) {
        debugInfo.database.levelError = e.message;
      }
    }

    // Count contents
    try {
      const contentCount = await prisma.content.count();
      debugInfo.database.contentCount = contentCount;
    } catch (e) {
      debugInfo.database.contentError = e.message;
    }

  } catch (error) {
    debugInfo.database.error = {
      name: error.name,
      message: error.message,
      code: error.code
    };
  }

  return NextResponse.json(debugInfo);
}