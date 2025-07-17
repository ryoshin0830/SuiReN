import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function PUT(request) {
  try {
    const { updates } = await request.json();
    
    console.log('Batch order update received:', updates);
    
    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Invalid updates format' },
        { status: 400 }
      );
    }

    // トランザクションでバッチ更新
    const results = await prisma.$transaction(
      updates.map(update => 
        prisma.content.update({
          where: { id: update.id },
          data: { orderIndex: update.orderIndex }
        })
      )
    );
    
    console.log(`Successfully updated ${results.length} contents`);

    return NextResponse.json({ success: true, updated: results.length });
  } catch (error) {
    console.error('Error updating content order:', error);
    return NextResponse.json(
      { error: 'Failed to update content order', details: error.message },
      { status: 500 }
    );
  }
}