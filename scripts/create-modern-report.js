const fs = require('fs');
const path = require('path');

// 評価結果を読み込み
const evaluationResult = JSON.parse(
  fs.readFileSync(path.join('logos-modern', 'evaluation-result.json'), 'utf8')
);

// HTMLレポートを生成
const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SuiReN モダンロゴデザイン評価レポート</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #fafafa;
      color: #1a1a1a;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 60px 40px;
    }
    
    h1 {
      font-size: 3rem;
      font-weight: 200;
      letter-spacing: -0.02em;
      margin-bottom: 60px;
      text-align: center;
    }
    
    .intro {
      background: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 60px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    
    .intro h2 {
      font-size: 1.5rem;
      font-weight: 500;
      margin-bottom: 20px;
      color: #0066FF;
    }
    
    .intro p {
      color: #666;
      margin-bottom: 12px;
    }
    
    .criteria-section {
      margin-bottom: 60px;
    }
    
    .criteria-section h2 {
      font-size: 1.5rem;
      font-weight: 500;
      margin-bottom: 30px;
    }
    
    .criteria-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    
    .criteria-card {
      background: white;
      padding: 24px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    
    .criteria-weight {
      font-size: 2rem;
      font-weight: 200;
      color: #0066FF;
      margin-bottom: 8px;
    }
    
    .criteria-name {
      font-size: 0.875rem;
      color: #666;
    }
    
    .logos-section h2 {
      font-size: 2rem;
      font-weight: 300;
      margin-bottom: 40px;
      text-align: center;
    }
    
    .logo-grid {
      display: grid;
      gap: 40px;
    }
    
    .logo-item {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 16px rgba(0,0,0,0.06);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .logo-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
    }
    
    .logo-rank {
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #f0f0f0;
    }
    
    .rank-number {
      font-size: 3rem;
      font-weight: 100;
      color: #0066FF;
    }
    
    .rank-number.gold {
      color: #FFB800;
    }
    
    .rank-number.silver {
      color: #A8A8A8;
    }
    
    .rank-number.bronze {
      color: #CD7F32;
    }
    
    .logo-id {
      font-size: 1rem;
      color: #666;
    }
    
    .logo-display {
      padding: 60px 40px;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
    }
    
    .logo-display img {
      max-width: 100%;
      height: auto;
    }
    
    .logo-scores {
      padding: 30px;
    }
    
    .score-item {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .score-label {
      flex: 0 0 140px;
      font-size: 0.875rem;
      color: #666;
    }
    
    .score-bar-container {
      flex: 1;
      height: 4px;
      background: #f0f0f0;
      border-radius: 2px;
      margin: 0 16px;
      position: relative;
      overflow: hidden;
    }
    
    .score-bar-fill {
      height: 100%;
      background: #0066FF;
      border-radius: 2px;
      transition: width 0.6s ease;
    }
    
    .score-value {
      flex: 0 0 40px;
      text-align: right;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .total-score {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
      text-align: center;
      font-size: 2rem;
      font-weight: 200;
      color: #0066FF;
    }
    
    @media (max-width: 768px) {
      .container {
        padding: 40px 20px;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      .logo-display {
        padding: 40px 20px;
      }
    }
    
    @media print {
      body {
        background: white;
      }
      
      .logo-item {
        break-inside: avoid;
        box-shadow: none;
        border: 1px solid #e0e0e0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>SuiReN モダンロゴデザイン</h1>
    
    <div class="intro">
      <h2>プロジェクト概要</h2>
      <p><strong>プロジェクト名:</strong> SuiReN（Sui Sui Reading Nihongo）</p>
      <p><strong>デザインアプローチ:</strong> ミニマリズム、モダン、シンプル</p>
      <p><strong>評価日時:</strong> ${new Date(evaluationResult.evaluationDate).toLocaleString('ja-JP')}</p>
    </div>
    
    <div class="criteria-section">
      <h2>評価基準</h2>
      <div class="criteria-grid">
        ${Object.entries(evaluationResult.criteria).map(([key, value]) => `
          <div class="criteria-card">
            <div class="criteria-weight">${(value.weight * 100).toFixed(0)}%</div>
            <div class="criteria-name">${value.description}</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="logos-section">
      <h2>トップ10 セレクション</h2>
      
      <div class="logo-grid">
        ${evaluationResult.top10.map((logo, index) => {
          let rankClass = '';
          if (index === 0) rankClass = 'gold';
          else if (index === 1) rankClass = 'silver';
          else if (index === 2) rankClass = 'bronze';
          
          return `
          <div class="logo-item">
            <div class="logo-rank">
              <div class="rank-number ${rankClass}">${index + 1}</div>
              <div class="logo-id">ロゴ #${logo.id}</div>
            </div>
            
            <div class="logo-display">
              <img src="../logos-modern/png/logo_modern_${String(logo.id).padStart(2, '0')}.png" alt="Logo ${logo.id}">
            </div>
            
            <div class="logo-scores">
              ${Object.entries(evaluationResult.criteria).map(([key, value]) => `
                <div class="score-item">
                  <div class="score-label">${value.description}</div>
                  <div class="score-bar-container">
                    <div class="score-bar-fill" style="width: ${logo[key] * 10}%"></div>
                  </div>
                  <div class="score-value">${logo[key]}</div>
                </div>
              `).join('')}
              
              <div class="total-score">
                ${logo.totalScore} / 10
              </div>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
  </div>
</body>
</html>`;

// HTMLファイルを保存
fs.writeFileSync(path.join('logos-modern', 'report.html'), htmlContent);
console.log('Modern HTML report created successfully!');