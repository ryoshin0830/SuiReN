const fs = require('fs');
const path = require('path');

// 本スタイルロゴの評価基準
const evaluationCriteria = {
  bookAppearance: { weight: 0.25, description: '本らしさの表現' },
  fishClarity: { weight: 0.20, description: '魚の明瞭性' },
  readingConcept: { weight: 0.20, description: '読書コンセプトの表現' },
  simplicity: { weight: 0.15, description: 'シンプルさ' },
  balance: { weight: 0.10, description: 'デザインバランス' },
  scalability: { weight: 0.10, description: 'サイズ変更への対応' }
};

// 各ロゴの評価
const logoEvaluations = [
  // バリエーション1: 開いた本の上に魚 (1-5)
  { id: 1, bookAppearance: 9, fishClarity: 9, readingConcept: 10, simplicity: 8, balance: 9, scalability: 9 },
  { id: 2, bookAppearance: 10, fishClarity: 9, readingConcept: 10, simplicity: 8, balance: 9, scalability: 9 },
  { id: 3, bookAppearance: 9, fishClarity: 8, readingConcept: 9, simplicity: 8, balance: 8, scalability: 8 },
  { id: 4, bookAppearance: 8, fishClarity: 8, readingConcept: 9, simplicity: 7, balance: 8, scalability: 8 },
  { id: 5, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 9, balance: 9, scalability: 9 },
  
  // バリエーション2: 本のページをめくる感じ (6-10)
  { id: 6, bookAppearance: 10, fishClarity: 9, readingConcept: 10, simplicity: 7, balance: 9, scalability: 8 },
  { id: 7, bookAppearance: 10, fishClarity: 10, readingConcept: 10, simplicity: 8, balance: 10, scalability: 9 },
  { id: 8, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 7, balance: 8, scalability: 8 },
  { id: 9, bookAppearance: 8, fishClarity: 8, readingConcept: 8, simplicity: 7, balance: 8, scalability: 8 },
  { id: 10, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 8, balance: 9, scalability: 9 },
  
  // バリエーション3: 立体的な本 (11-15)
  { id: 11, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 7, balance: 8, scalability: 8 },
  { id: 12, bookAppearance: 10, fishClarity: 10, readingConcept: 10, simplicity: 8, balance: 9, scalability: 9 },
  { id: 13, bookAppearance: 8, fishClarity: 8, readingConcept: 8, simplicity: 7, balance: 8, scalability: 8 },
  { id: 14, bookAppearance: 8, fishClarity: 8, readingConcept: 8, simplicity: 7, balance: 7, scalability: 7 },
  { id: 15, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 8, balance: 8, scalability: 8 },
  
  // バリエーション4: 波打つページ (16-20)
  { id: 16, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 7, balance: 8, scalability: 8 },
  { id: 17, bookAppearance: 10, fishClarity: 10, readingConcept: 10, simplicity: 8, balance: 9, scalability: 9 },
  { id: 18, bookAppearance: 8, fishClarity: 8, readingConcept: 8, simplicity: 7, balance: 8, scalability: 8 },
  { id: 19, bookAppearance: 8, fishClarity: 8, readingConcept: 8, simplicity: 7, balance: 7, scalability: 7 },
  { id: 20, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 8, balance: 8, scalability: 8 },
  
  // バリエーション5: ミニマルな本と魚 (21-25)
  { id: 21, bookAppearance: 8, fishClarity: 9, readingConcept: 9, simplicity: 10, balance: 9, scalability: 10 },
  { id: 22, bookAppearance: 9, fishClarity: 10, readingConcept: 10, simplicity: 10, balance: 10, scalability: 10 },
  { id: 23, bookAppearance: 8, fishClarity: 9, readingConcept: 9, simplicity: 9, balance: 9, scalability: 9 },
  { id: 24, bookAppearance: 7, fishClarity: 8, readingConcept: 8, simplicity: 9, balance: 8, scalability: 9 },
  { id: 25, bookAppearance: 8, fishClarity: 9, readingConcept: 9, simplicity: 10, balance: 9, scalability: 10 },
  
  // バリエーション6: 本のスプレッド (26-30)
  { id: 26, bookAppearance: 10, fishClarity: 9, readingConcept: 10, simplicity: 7, balance: 9, scalability: 8 },
  { id: 27, bookAppearance: 10, fishClarity: 10, readingConcept: 10, simplicity: 8, balance: 10, scalability: 9 },
  { id: 28, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 7, balance: 8, scalability: 8 },
  { id: 29, bookAppearance: 8, fishClarity: 8, readingConcept: 8, simplicity: 7, balance: 8, scalability: 8 },
  { id: 30, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 8, balance: 9, scalability: 9 },
  
  // バリエーション7: 厚みのある本 (31-35)
  { id: 31, bookAppearance: 10, fishClarity: 9, readingConcept: 10, simplicity: 7, balance: 9, scalability: 8 },
  { id: 32, bookAppearance: 10, fishClarity: 10, readingConcept: 10, simplicity: 8, balance: 10, scalability: 9 },
  { id: 33, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 7, balance: 8, scalability: 8 },
  { id: 34, bookAppearance: 8, fishClarity: 8, readingConcept: 8, simplicity: 7, balance: 8, scalability: 8 },
  { id: 35, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 8, balance: 9, scalability: 9 },
  
  // バリエーション8: シャープな折り目 (36-40)
  { id: 36, bookAppearance: 10, fishClarity: 9, readingConcept: 10, simplicity: 8, balance: 9, scalability: 9 },
  { id: 37, bookAppearance: 10, fishClarity: 10, readingConcept: 10, simplicity: 9, balance: 10, scalability: 10 },
  { id: 38, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 8, balance: 9, scalability: 9 },
  { id: 39, bookAppearance: 8, fishClarity: 8, readingConcept: 8, simplicity: 8, balance: 8, scalability: 8 },
  { id: 40, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 9, balance: 9, scalability: 9 },
  
  // バリエーション9: ソフトな曲線の本 (41-45)
  { id: 41, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 8, balance: 9, scalability: 9 },
  { id: 42, bookAppearance: 10, fishClarity: 10, readingConcept: 10, simplicity: 8, balance: 10, scalability: 9 },
  { id: 43, bookAppearance: 8, fishClarity: 8, readingConcept: 8, simplicity: 8, balance: 8, scalability: 8 },
  { id: 44, bookAppearance: 8, fishClarity: 8, readingConcept: 8, simplicity: 7, balance: 8, scalability: 8 },
  { id: 45, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 8, balance: 9, scalability: 9 },
  
  // バリエーション10: 深い折り目の本 (46-50)
  { id: 46, bookAppearance: 10, fishClarity: 9, readingConcept: 10, simplicity: 7, balance: 9, scalability: 8 },
  { id: 47, bookAppearance: 10, fishClarity: 10, readingConcept: 10, simplicity: 8, balance: 10, scalability: 9 },
  { id: 48, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 7, balance: 8, scalability: 8 },
  { id: 49, bookAppearance: 8, fishClarity: 8, readingConcept: 8, simplicity: 7, balance: 8, scalability: 8 },
  { id: 50, bookAppearance: 9, fishClarity: 9, readingConcept: 9, simplicity: 8, balance: 9, scalability: 9 }
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
  path.join('logos-book', 'evaluation-result.json'),
  JSON.stringify(evaluationResult, null, 2)
);

console.log('Top 10 book-style logos selected:');
top10Logos.forEach((logo, index) => {
  console.log(`${index + 1}. Logo ${logo.id} - Score: ${logo.totalScore}`);
});