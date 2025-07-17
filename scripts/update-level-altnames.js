#!/usr/bin/env node

/**
 * 既存のレベルに別名（altName）を設定するスクリプト
 * 
 * 実行方法:
 * node scripts/update-level-altnames.js
 */

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 初期の別名設定
const LEVEL_ALT_NAMES = {
  'beginner': 'かんたん',
  'intermediate': 'むずかしい',
  'advanced': 'とてもむずかしい'
};

async function updateLevelAltNames() {
  console.log('🔄 レベルの別名を更新中...');

  try {
    // 各レベルの別名を更新
    for (const [levelId, altName] of Object.entries(LEVEL_ALT_NAMES)) {
      const level = await prisma.level.findUnique({
        where: { id: levelId }
      });

      if (level) {
        const updated = await prisma.level.update({
          where: { id: levelId },
          data: { altName }
        });
        console.log(`✅ ${levelId}: ${updated.displayName} → 別名: ${altName}`);
      } else {
        console.log(`⚠️  レベル ${levelId} が見つかりません`);
      }
    }

    // 更新後のレベル一覧を表示
    console.log('\n📊 更新後のレベル一覧:');
    const levels = await prisma.level.findMany({
      orderBy: { orderIndex: 'asc' }
    });

    console.table(levels.map(level => ({
      ID: level.id,
      別名: level.altName || '(未設定)',
      表示名: level.displayName,
      順序: level.orderIndex,
      デフォルト: level.isDefault ? '✓' : ''
    })));

    console.log('\n✨ レベルの別名更新が完了しました！');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトを実行
updateLevelAltNames();