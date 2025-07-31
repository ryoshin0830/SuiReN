const fs = require('fs');
const path = require('path');

// 評価結果を読み込み
const evaluationResult = JSON.parse(
  fs.readFileSync(path.join('logos', 'evaluation-result.json'), 'utf8')
);

// HTMLレポートを生成
const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SuiReN ロゴデザイン評価レポート</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 30px;
      font-size: 2.5em;
    }
    h2 {
      color: #34495e;
      margin-top: 40px;
      margin-bottom: 20px;
      font-size: 1.8em;
    }
    .project-info {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 40px;
    }
    .project-info h3 {
      margin-top: 0;
      color: #4FC3F7;
    }
    .logo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 30px;
      margin-top: 30px;
    }
    .logo-item {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .logo-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    }
    .rank {
      display: inline-block;
      background-color: #4FC3F7;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .rank.gold {
      background-color: #FFD700;
      color: #333;
    }
    .rank.silver {
      background-color: #C0C0C0;
      color: #333;
    }
    .rank.bronze {
      background-color: #CD7F32;
      color: white;
    }
    .logo-container {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
      min-height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-container img {
      max-width: 100%;
      height: auto;
    }
    .scores {
      background-color: white;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
    }
    .score-bar {
      display: flex;
      align-items: center;
      margin: 8px 0;
      font-size: 14px;
    }
    .score-label {
      width: 140px;
      font-weight: 500;
    }
    .score-value {
      width: 40px;
      text-align: right;
      margin-right: 10px;
    }
    .score-bar-bg {
      flex: 1;
      height: 20px;
      background-color: #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
    }
    .score-bar-fill {
      height: 100%;
      background: linear-gradient(to right, #4FC3F7, #66BB6A);
      transition: width 0.5s ease;
    }
    .total-score {
      font-size: 24px;
      font-weight: bold;
      color: #4FC3F7;
      text-align: center;
      margin-top: 20px;
    }
    .criteria-info {
      background-color: #e3f2fd;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .criteria-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .criteria-item {
      background-color: white;
      padding: 15px;
      border-radius: 5px;
    }
    .weight {
      color: #666;
      font-size: 14px;
    }
    @media print {
      body {
        background-color: white;
      }
      .container {
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>SuiReN ロゴデザイン評価レポート</h1>
    
    <div class="project-info">
      <h3>プロジェクト概要</h3>
      <p><strong>プロジェクト名：</strong>SuiReN（Sui Sui Reading Nihongo）</p>
      <p><strong>コンセプト：</strong>日本語学習者向けの速読練習アプリケーション</p>
      <p><strong>デザイン要素：</strong>魚（スイスイ泳ぐ）、睡蓮（SuiReN）、読書のイメージ</p>
      <p><strong>評価日時：</strong>${new Date(evaluationResult.evaluationDate).toLocaleString('ja-JP')}</p>
    </div>

    <div class="criteria-info">
      <h3>評価基準</h3>
      <div class="criteria-list">
        ${Object.entries(evaluationResult.criteria).map(([key, value]) => `
          <div class="criteria-item">
            <strong>${value.description}</strong>
            <div class="weight">重み: ${(value.weight * 100).toFixed(0)}%</div>
          </div>
        `).join('')}
      </div>
    </div>

    <h2>トップ10 ロゴデザイン</h2>
    
    <div class="logo-grid">
      ${evaluationResult.top10.map((logo, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'gold';
        else if (index === 1) rankClass = 'silver';
        else if (index === 2) rankClass = 'bronze';
        
        return `
        <div class="logo-item">
          <div class="rank ${rankClass}">第${index + 1}位</div>
          <h3>ロゴ #${logo.id}</h3>
          
          <div class="logo-container">
            <img src="../logos/png/logo_${String(logo.id).padStart(2, '0')}.png" alt="Logo ${logo.id}">
          </div>
          
          <div class="scores">
            ${Object.entries(evaluationResult.criteria).map(([key, value]) => `
              <div class="score-bar">
                <div class="score-label">${value.description}</div>
                <div class="score-value">${logo[key]}/10</div>
                <div class="score-bar-bg">
                  <div class="score-bar-fill" style="width: ${logo[key] * 10}%"></div>
                </div>
              </div>
            `).join('')}
            
            <div class="total-score">
              総合スコア: ${logo.totalScore}/10
            </div>
          </div>
        </div>
        `;
      }).join('')}
    </div>
  </div>
</body>
</html>`;

// HTMLファイルを保存
fs.writeFileSync(path.join('logos', 'report.html'), htmlContent);
console.log('HTML report created successfully!');