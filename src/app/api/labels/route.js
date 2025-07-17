import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/labels - 全ラベルを取得
export async function GET() {
  try {
    const labels = await prisma.label.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { contents: true }
        }
      }
    });

    return NextResponse.json(labels);
  } catch (error) {
    console.error('Error fetching labels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch labels' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/labels - 新しいラベルを作成
export async function POST(request) {
  try {
    const { name, color, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Label name is required' },
        { status: 400 }
      );
    }

    const label = await prisma.label.create({
      data: {
        name,
        color: color || '#6366f1',
        description
      }
    });

    return NextResponse.json(label, { status: 201 });
  } catch (error) {
    console.error('Error creating label:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Label with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create label' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}