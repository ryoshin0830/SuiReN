const fs = require('fs');
const path = require('path');

// モダンロゴの評価基準
const evaluationCriteria = {
  simplicity: { weight: 0.25, description: 'シンプルさ・ミニマリズム' },
  modernity: { weight: 0.20, description: 'モダン・現代的な印象' },
  memorability: { weight: 0.20, description: '記憶に残りやすさ' },
  scalability: { weight: 0.15, description: 'サイズ変更への対応力' },
  concept: { weight: 0.10, description: 'コンセプトの表現' },
  typography: { weight: 0.10, description: 'タイポグラフィの質' }
};

// 各ロゴの評価
const logoEvaluations = [
  // バリエーション1: 極限までシンプルな文字のみ (1-5)
  { id: 1, simplicity: 10, modernity: 8, memorability: 7, scalability: 10, concept: 5, typography: 9 },
  { id: 2, simplicity: 9, modernity: 9, memorability: 8, scalability: 10, concept: 7, typography: 9 },
  { id: 3, simplicity: 8, modernity: 9, memorability: 8, scalability: 10, concept: 7, typography: 8 },
  { id: 4, simplicity: 9, modernity: 8, memorability: 7, scalability: 10, concept: 6, typography: 8 },
  { id: 5, simplicity: 10, modernity: 7, memorability: 6, scalability: 10, concept: 5, typography: 8 },
  
  // バリエーション2: 細い線の波 (6-10)
  { id: 6, simplicity: 9, modernity: 9, memorability: 8, scalability: 9, concept: 8, typography: 8 },
  { id: 7, simplicity: 9, modernity: 10, memorability: 9, scalability: 9, concept: 9, typography: 9 },
  { id: 8, simplicity: 8, modernity: 9, memorability: 8, scalability: 9, concept: 8, typography: 8 },
  { id: 9, simplicity: 8, modernity: 8, memorability: 7, scalability: 9, concept: 7, typography: 8 },
  { id: 10, simplicity: 9, modernity: 8, memorability: 7, scalability: 9, concept: 7, typography: 8 },
  
  // バリエーション3: 抽象的な点 (11-15)
  { id: 11, simplicity: 9, modernity: 9, memorability: 8, scalability: 10, concept: 7, typography: 9 },
  { id: 12, simplicity: 9, modernity: 10, memorability: 9, scalability: 10, concept: 8, typography: 9 },
  { id: 13, simplicity: 8, modernity: 9, memorability: 8, scalability: 10, concept: 7, typography: 8 },
  { id: 14, simplicity: 8, modernity: 8, memorability: 7, scalability: 10, concept: 6, typography: 8 },
  { id: 15, simplicity: 9, modernity: 8, memorability: 7, scalability: 10, concept: 6, typography: 8 },
  
  // バリエーション4: 幾何学的な形状 (16-20)
  { id: 16, simplicity: 8, modernity: 9, memorability: 9, scalability: 9, concept: 8, typography: 8 },
  { id: 17, simplicity: 8, modernity: 10, memorability: 10, scalability: 9, concept: 9, typography: 9 },
  { id: 18, simplicity: 7, modernity: 9, memorability: 9, scalability: 9, concept: 8, typography: 8 },
  { id: 19, simplicity: 7, modernity: 8, memorability: 8, scalability: 9, concept: 7, typography: 8 },
  { id: 20, simplicity: 8, modernity: 8, memorability: 8, scalability: 9, concept: 7, typography: 8 },
  
  // バリエーション5: タイポグラフィフォーカス (21-25)
  { id: 21, simplicity: 8, modernity: 9, memorability: 9, scalability: 10, concept: 7, typography: 10 },
  { id: 22, simplicity: 8, modernity: 10, memorability: 10, scalability: 10, concept: 8, typography: 10 },
  { id: 23, simplicity: 7, modernity: 9, memorability: 9, scalability: 10, concept: 7, typography: 9 },
  { id: 24, simplicity: 7, modernity: 8, memorability: 8, scalability: 10, concept: 6, typography: 9 },
  { id: 25, simplicity: 8, modernity: 8, memorability: 8, scalability: 10, concept: 6, typography: 9 },
  
  // バリエーション6: 最小限の線画 (26-30)
  { id: 26, simplicity: 9, modernity: 9, memorability: 8, scalability: 8, concept: 8, typography: 8 },
  { id: 27, simplicity: 9, modernity: 10, memorability: 9, scalability: 8, concept: 9, typography: 9 },
  { id: 28, simplicity: 8, modernity: 9, memorability: 8, scalability: 8, concept: 8, typography: 8 },
  { id: 29, simplicity: 8, modernity: 8, memorability: 7, scalability: 8, concept: 7, typography: 8 },
  { id: 30, simplicity: 9, modernity: 8, memorability: 7, scalability: 8, concept: 7, typography: 8 },
  
  // バリエーション7: 頭文字のみ (31-35)
  { id: 31, simplicity: 10, modernity: 9, memorability: 9, scalability: 10, concept: 6, typography: 9 },
  { id: 32, simplicity: 10, modernity: 10, memorability: 10, scalability: 10, concept: 7, typography: 10 },
  { id: 33, simplicity: 9, modernity: 9, memorability: 9, scalability: 10, concept: 6, typography: 9 },
  { id: 34, simplicity: 9, modernity: 8, memorability: 8, scalability: 10, concept: 5, typography: 9 },
  { id: 35, simplicity: 10, modernity: 8, memorability: 8, scalability: 10, concept: 5, typography: 9 },
  
  // バリエーション8: ネガティブスペース (36-40)
  { id: 36, simplicity: 8, modernity: 9, memorability: 9, scalability: 10, concept: 7, typography: 9 },
  { id: 37, simplicity: 8, modernity: 10, memorability: 10, scalability: 10, concept: 8, typography: 9 },
  { id: 38, simplicity: 7, modernity: 9, memorability: 9, scalability: 10, concept: 7, typography: 8 },
  { id: 39, simplicity: 7, modernity: 8, memorability: 8, scalability: 10, concept: 6, typography: 8 },
  { id: 40, simplicity: 8, modernity: 8, memorability: 8, scalability: 10, concept: 6, typography: 8 },
  
  // バリエーション9: 流れるような曲線 (41-45)
  { id: 41, simplicity: 8, modernity: 9, memorability: 9, scalability: 9, concept: 9, typography: 9 },
  { id: 42, simplicity: 8, modernity: 10, memorability: 10, scalability: 9, concept: 10, typography: 9 },
  { id: 43, simplicity: 7, modernity: 9, memorability: 9, scalability: 9, concept: 9, typography: 8 },
  { id: 44, simplicity: 7, modernity: 8, memorability: 8, scalability: 9, concept: 8, typography: 8 },
  { id: 45, simplicity: 8, modernity: 8, memorability: 8, scalability: 9, concept: 8, typography: 8 },
  
  // バリエーション10: グリッドベース (46-50)
  { id: 46, simplicity: 8, modernity: 9, memorability: 8, scalability: 10, concept: 6, typography: 9 },
  { id: 47, simplicity: 8, modernity: 10, memorability: 9, scalability: 10, concept: 7, typography: 10 },
  { id: 48, simplicity: 7, modernity: 9, memorability: 8, scalability: 10, concept: 6, typography: 9 },
  { id: 49, simplicity: 7, modernity: 8, memorability: 7, scalability: 10, concept: 5, typography: 9 },
  { id: 50, simplicity: 8, modernity: 8, memorability: 7, scalability: 10, concept: 5, typography: 9 }
];

// 総合スコアを計算
function calculateTotalScore(evaluation) {
  let totalScore = 0;
  for (const [criterion, details] of Object.entries(evaluationCriteria)) {
    totalScore += evaluation[criterion] * details.weight;
  }
  return Math.round(totalScore * 10) / 10;
}

// 全ロゴのスコアを計算してソート
const scoredLogos = logoEvaluations.map(logo => ({
  ...logo,
  totalScore: calculateTotalScore(logo)
})).sort((a, b) => b.totalScore - a.totalScore);

// トップ10を選出
const top10Logos = scoredLogos.slice(0, 10);

// 結果を保存
const evaluationResult = {
  evaluationDate: new Date().toISOString(),
  criteria: evaluationCriteria,
  top10: top10Logos,
  allScores: scoredLogos
};

fs.writeFileSync(
  path.join('logos-modern', 'evaluation-result.json'),
  JSON.stringify(evaluationResult, null, 2)
);

console.log('Top 10 modern logos selected:');
top10Logos.forEach((logo, index) => {
  console.log(`${index + 1}. Logo ${logo.id} - Score: ${logo.totalScore}`);
});