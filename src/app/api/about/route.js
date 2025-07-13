import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET: AboutPageの取得
export async function GET() {
  try {
    if (!prisma) {
      throw new Error('Database connection not available');
    }

    // AboutPageを取得（最初の1件のみ）
    const aboutPage = await prisma.aboutPage.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    // データが存在しない場合はデフォルトのデータを返す
    if (!aboutPage) {
      return NextResponse.json({
        id: null,
        content: '',
        images: null
      });
    }

    return NextResponse.json(aboutPage);
  } catch (error) {
    console.error('AboutPage GET error:', error);
    return NextResponse.json(
      { error: 'このサイトについての情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: AboutPageの更新または作成
export async function PUT(request) {
  try {
    const body = await request.json();
    const { content, images } = body;

    // バリデーション
    if (content === undefined) {
      return NextResponse.json(
        { error: 'コンテンツが必要です' },
        { status: 400 }
      );
    }

    // 既存のAboutPageを取得
    const existingAboutPage = await prisma.aboutPage.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    let aboutPage;
    if (existingAboutPage) {
      // 更新
      aboutPage = await prisma.aboutPage.update({
        where: { id: existingAboutPage.id },
        data: {
          content,
          images: images || null
        }
      });
    } else {
      // 新規作成
      aboutPage = await prisma.aboutPage.create({
        data: {
          content,
          images: images || null
        }
      });
    }

    return NextResponse.json(aboutPage);
  } catch (error) {
    console.error('AboutPage PUT error:', error);
    return NextResponse.json(
      { error: 'このサイトについての情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}