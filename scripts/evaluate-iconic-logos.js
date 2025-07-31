const fs = require('fs');
const path = require('path');

// アイコニックロゴの評価基準
const evaluationCriteria = {
  iconicity: { weight: 0.25, description: 'アイコンとしての認識性' },
  fishRecognition: { weight: 0.20, description: '魚の識別可能性' },
  lotusRecognition: { weight: 0.20, description: '睡蓮の識別可能性' },
  simplicity: { weight: 0.15, description: 'シンプルさ' },
  memorability: { weight: 0.10, description: '記憶に残りやすさ' },
  scalability: { weight: 0.10, description: 'サイズ展開性' }
};

// 各ロゴの評価
const logoEvaluations = [
  // バリエーション1: シンプルな魚のシルエット (1-5)
  { id: 1, iconicity: 8, fishRecognition: 9, lotusRecognition: 7, simplicity: 9, memorability: 8, scalability: 10 },
  { id: 2, iconicity: 9, fishRecognition: 8, lotusRecognition: 8, simplicity: 9, memorability: 9, scalability: 10 },
  { id: 3, iconicity: 8, fishRecognition: 9, lotusRecognition: 7, simplicity: 8, memorability: 8, scalability: 9 },
  { id: 4, iconicity: 7, fishRecognition: 8, lotusRecognition: 6, simplicity: 9, memorability: 7, scalability: 10 },
  { id: 5, iconicity: 9, fishRecognition: 10, lotusRecognition: 5, simplicity: 10, memorability: 9, scalability: 10 },
  
  // バリエーション2: 魚と睡蓮の融合 (6-10)
  { id: 6, iconicity: 8, fishRecognition: 8, lotusRecognition: 8, simplicity: 8, memorability: 8, scalability: 9 },
  { id: 7, iconicity: 9, fishRecognition: 9, lotusRecognition: 9, simplicity: 8, memorability: 10, scalability: 9 },
  { id: 8, iconicity: 8, fishRecognition: 8, lotusRecognition: 8, simplicity: 7, memorability: 8, scalability: 8 },
  { id: 9, iconicity: 7, fishRecognition: 7, lotusRecognition: 7, simplicity: 8, memorability: 7, scalability: 9 },
  { id: 10, iconicity: 8, fishRecognition: 8, lotusRecognition: 7, simplicity: 9, memorability: 8, scalability: 10 },
  
  // バリエーション3: 抽象的な魚の形 (11-15)
  { id: 11, iconicity: 9, fishRecognition: 9, lotusRecognition: 8, simplicity: 8, memorability: 9, scalability: 9 },
  { id: 12, iconicity: 10, fishRecognition: 10, lotusRecognition: 9, simplicity: 9, memorability: 10, scalability: 10 },
  { id: 13, iconicity: 8, fishRecognition: 9, lotusRecognition: 7, simplicity: 8, memorability: 8, scalability: 9 },
  { id: 14, iconicity: 7, fishRecognition: 8, lotusRecognition: 6, simplicity: 8, memorability: 7, scalability: 9 },
  { id: 15, iconicity: 8, fishRecognition: 9, lotusRecognition: 6, simplicity: 9, memorability: 8, scalability: 10 },
  
  // バリエーション4: ミニマル魚アイコン (16-20)
  { id: 16, iconicity: 8, fishRecognition: 9, lotusRecognition: 7, simplicity: 9, memorability: 8, scalability: 10 },
  { id: 17, iconicity: 9, fishRecognition: 10, lotusRecognition: 8, simplicity: 9, memorability: 9, scalability: 10 },
  { id: 18, iconicity: 8, fishRecognition: 9, lotusRecognition: 7, simplicity: 8, memorability: 8, scalability: 9 },
  { id: 19, iconicity: 7, fishRecognition: 8, lotusRecognition: 6, simplicity: 8, memorability: 7, scalability: 9 },
  { id: 20, iconicity: 8, fishRecognition: 9, lotusRecognition: 6, simplicity: 9, memorability: 8, scalability: 10 },
  
  // バリエーション5: Apple風シンプルさ (21-25)
  { id: 21, iconicity: 10, fishRecognition: 10, lotusRecognition: 5, simplicity: 10, memorability: 10, scalability: 10 },
  { id: 22, iconicity: 10, fishRecognition: 10, lotusRecognition: 6, simplicity: 10, memorability: 10, scalability: 10 },
  { id: 23, iconicity: 9, fishRecognition: 9, lotusRecognition: 5, simplicity: 10, memorability: 9, scalability: 10 },
  { id: 24, iconicity: 8, fishRecognition: 8, lotusRecognition: 4, simplicity: 10, memorability: 8, scalability: 10 },
  { id: 25, iconicity: 9, fishRecognition: 9, lotusRecognition: 4, simplicity: 10, memorability: 9, scalability: 10 },
  
  // バリエーション6: 水面と魚 (26-30)
  { id: 26, iconicity: 8, fishRecognition: 9, lotusRecognition: 7, simplicity: 8, memorability: 8, scalability: 9 },
  { id: 27, iconicity: 9, fishRecognition: 10, lotusRecognition: 8, simplicity: 8, memorability: 9, scalability: 9 },
  { id: 28, iconicity: 8, fishRecognition: 9, lotusRecognition: 7, simplicity: 7, memorability: 8, scalability: 8 },
  { id: 29, iconicity: 7, fishRecognition: 8, lotusRecognition: 6, simplicity: 7, memorability: 7, scalability: 8 },
  { id: 30, iconicity: 8, fishRecognition: 9, lotusRecognition: 6, simplicity: 8, memorability: 8, scalability: 9 },
  
  // バリエーション7: 鯉のシルエット (31-35)
  { id: 31, iconicity: 9, fishRecognition: 10, lotusRecognition: 5, simplicity: 8, memorability: 9, scalability: 9 },
  { id: 32, iconicity: 10, fishRecognition: 10, lotusRecognition: 6, simplicity: 9, memorability: 10, scalability: 10 },
  { id: 33, iconicity: 8, fishRecognition: 9, lotusRecognition: 5, simplicity: 8, memorability: 8, scalability: 9 },
  { id: 34, iconicity: 7, fishRecognition: 8, lotusRecognition: 4, simplicity: 8, memorability: 7, scalability: 9 },
  { id: 35, iconicity: 8, fishRecognition: 9, lotusRecognition: 4, simplicity: 9, memorability: 8, scalability: 10 },
  
  // バリエーション8: 睡蓮を背負う魚 (36-40)
  { id: 36, iconicity: 9, fishRecognition: 9, lotusRecognition: 9, simplicity: 7, memorability: 9, scalability: 8 },
  { id: 37, iconicity: 10, fishRecognition: 10, lotusRecognition: 10, simplicity: 8, memorability: 10, scalability: 9 },
  { id: 38, iconicity: 8, fishRecognition: 9, lotusRecognition: 8, simplicity: 7, memorability: 8, scalability: 8 },
  { id: 39, iconicity: 7, fishRecognition: 8, lotusRecognition: 7, simplicity: 7, memorability: 7, scalability: 8 },
  { id: 40, iconicity: 8, fishRecognition: 9, lotusRecognition: 7, simplicity: 8, memorability: 8, scalability: 9 },
  
  // バリエーション9: 曲線的な魚 (41-45)
  { id: 41, iconicity: 9, fishRecognition: 10, lotusRecognition: 5, simplicity: 9, memorability: 9, scalability: 10 },
  { id: 42, iconicity: 10, fishRecognition: 10, lotusRecognition: 6, simplicity: 9, memorability: 10, scalability: 10 },
  { id: 43, iconicity: 8, fishRecognition: 9, lotusRecognition: 5, simplicity: 8, memorability: 8, scalability: 9 },
  { id: 44, iconicity: 7, fishRecognition: 8, lotusRecognition: 4, simplicity: 8, memorability: 7, scalability: 9 },
  { id: 45, iconicity: 8, fishRecognition: 9, lotusRecognition: 4, simplicity: 9, memorability: 8, scalability: 10 },
  
  // バリエーション10: 幾何学的魚と睡蓮 (46-50)
  { id: 46, iconicity: 8, fishRecognition: 8, lotusRecognition: 8, simplicity: 7, memorability: 8, scalability: 8 },
  { id: 47, iconicity: 9, fishRecognition: 9, lotusRecognition: 9, simplicity: 8, memorability: 9, scalability: 9 },
  { id: 48, iconicity: 8, fishRecognition: 8, lotusRecognition: 8, simplicity: 7, memorability: 8, scalability: 8 },
  { id: 49, iconicity: 7, fishRecognition: 7, lotusRecognition: 7, simplicity: 7, memorability: 7, scalability: 8 },
  { id: 50, iconicity: 8, fishRecognition: 8, lotusRecognition: 7, simplicity: 8, memorability: 8, scalability: 9 }
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
  path.join('logos-iconic', 'evaluation-result.json'),
  JSON.stringify(evaluationResult, null, 2)
);

console.log('Top 10 iconic logos selected:');
top10Logos.forEach((logo, index) => {
  console.log(`${index + 1}. Logo ${logo.id} - Score: ${logo.totalScore}`);
});