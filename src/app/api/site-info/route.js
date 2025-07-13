import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    let siteInfo = await prisma.siteInfo.findUnique({
      where: { id: 'default' }
    });

    if (!siteInfo) {
      // Create default site info if it doesn't exist
      siteInfo = await prisma.siteInfo.create({
        data: {
          id: 'default',
          title: 'SuiReN',
          description: 'SuiReN（スイレン）は、日本語学習者のための速読練習アプリケーションです。',
          developers: [
            {
              name: '開発者名',
              role: '開発責任者',
              description: 'プロジェクトの企画・開発を担当'
            }
          ],
          features: [
            {
              icon: '⏱️',
              title: '読書時間の測定',
              description: '読み始めから読み終わりまでの時間を正確に計測'
            },
            {
              icon: '📊',
              title: '理解度チェック',
              description: '読み物に関する問題で理解度を確認'
            },
            {
              icon: '🎯',
              title: 'レベル別コンテンツ',
              description: '中級前半、中級、上級の3つのレベルに対応'
            },
            {
              icon: '📱',
              title: '結果のQRコード化',
              description: '成績に応じて色分けされたQRコードで結果を共有'
            }
          ],
          usage: [
            {
              step: 1,
              description: 'ホーム画面から読みたい読み物を選択'
            },
            {
              step: 2,
              description: '「読み始める」ボタンをクリックして速読開始'
            },
            {
              step: 3,
              description: '読み終わったら「読み終わった」ボタンをクリック'
            },
            {
              step: 4,
              description: '理解度チェックの問題に回答'
            },
            {
              step: 5,
              description: '結果を確認し、QRコードで記録を保存'
            }
          ]
        }
      });
    }

    return NextResponse.json(siteInfo);
  } catch (error) {
    console.error('Failed to fetch site info:', error);
    return NextResponse.json({ error: 'Failed to fetch site info' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    
    const updatedSiteInfo = await prisma.siteInfo.update({
      where: { id: 'default' },
      data: {
        title: data.title,
        description: data.description,
        developers: data.developers,
        features: data.features,
        usage: data.usage
      }
    });

    return NextResponse.json(updatedSiteInfo);
  } catch (error) {
    console.error('Failed to update site info:', error);
    return NextResponse.json({ error: 'Failed to update site info' }, { status: 500 });
  }
}