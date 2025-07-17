import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT /api/labels/[id] - ラベルを更新
export async function PUT(request, props) {
  const params = await props.params;
  const { id } = params;

  try {
    const { name, color, description } = await request.json();

    const label = await prisma.label.update({
      where: { id },
      data: {
        name,
        color,
        description
      }
    });

    return NextResponse.json(label);
  } catch (error) {
    console.error('Error updating label:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Label not found' },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Label with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update label' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/labels/[id] - ラベルを削除
export async function DELETE(request, props) {
  const params = await props.params;
  const { id } = params;

  try {
    await prisma.label.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting label:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Label not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete label' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}