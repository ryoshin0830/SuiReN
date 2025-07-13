import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET: 全レベルの取得
export async function GET() {
  try {
    // Prismaクライアントが利用可能か確認
    if (!prisma) {
      console.error('Prisma client not initialized');
      throw new Error('Database connection not available');
    }

    const levels = await prisma.level.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: { contents: true }
        }
      }
    });

    return NextResponse.json(levels);
  } catch (error) {
    console.error('Level GET error:', error);
    return NextResponse.json(
      { error: 'レベルの取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 新規レベルの作成
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, displayName, orderIndex } = body;

    // バリデーション
    if (!id || !displayName || orderIndex === undefined) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    // IDの形式チェック（英数字とハイフンのみ）
    if (!/^[a-z0-9-]+$/.test(id)) {
      return NextResponse.json(
        { error: 'レベルIDは英小文字、数字、ハイフンのみ使用可能です' },
        { status: 400 }
      );
    }

    // 表示名の長さチェック
    if (displayName.length > 20) {
      return NextResponse.json(
        { error: '表示名は20文字以内で入力してください' },
        { status: 400 }
      );
    }

    // 既存のIDチェック
    const existingLevel = await prisma.level.findUnique({
      where: { id }
    });

    if (existingLevel) {
      return NextResponse.json(
        { error: 'このレベルIDは既に使用されています' },
        { status: 400 }
      );
    }

    // レベルの作成
    const newLevel = await prisma.level.create({
      data: {
        id,
        displayName,
        orderIndex,
        isDefault: false
      },
      include: {
        _count: {
          select: { contents: true }
        }
      }
    });

    return NextResponse.json(newLevel, { status: 201 });
  } catch (error) {
    console.error('Error creating level:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '同じIDのレベルが既に存在します' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'レベルの作成に失敗しました' },
      { status: 500 }
    );
  }
}