const fs = require('fs');
const path = require('path');

// 評価結果を読み込み
const evaluationResult = JSON.parse(
  fs.readFileSync(path.join('logos-book', 'evaluation-result.json'), 'utf8')
);

// HTMLレポートを生成
const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SuiReN 本スタイルロゴデザイン評価レポート</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, 'Noto Sans JP', sans-serif;
      background-color: #fafaf8;
      color: #2c2c2c;
      line-height: 1.6;
    }
    
    .hero {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: white;
      padding: 100px 20px;
      text-align: center;
    }
    
    .hero h1 {
      font-size: 3.5rem;
      font-weight: 300;
      letter-spacing: -0.02em;
      margin-bottom: 20px;
    }
    
    .hero .subtitle {
      font-size: 1.25rem;
      opacity: 0.9;
      font-weight: 300;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 80px 20px;
    }
    
    .concept-section {
      text-align: center;
      margin-bottom: 80px;
    }
    
    .concept-section h2 {
      font-size: 2.5rem;
      font-weight: 300;
      margin-bottom: 30px;
      color: #2c3e50;
    }
    
    .concept-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-top: 40px;
    }
    
    .concept-card {
      background: white;
      padding: 40px 30px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .concept-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
    
    .concept-card .icon {
      font-size: 3rem;
      margin-bottom: 20px;
      color: #3498db;
    }
    
    .concept-card h3 {
      font-size: 1.5rem;
      margin-bottom: 15px;
      color: #2c3e50;
    }
    
    .concept-card p {
      color: #7f8c8d;
      line-height: 1.8;
    }
    
    .criteria-section {
      background: white;
      padding: 60px;
      border-radius: 20px;
      margin-bottom: 80px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    
    .criteria-section h2 {
      font-size: 2rem;
      margin-bottom: 40px;
      text-align: center;
      color: #2c3e50;
    }
    
    .criteria-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 30px;
    }
    
    .criteria-item {
      text-align: center;
      padding: 20px;
    }
    
    .criteria-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3498db 0%, #2ecc71 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 15px;
      font-size: 2rem;
      font-weight: 700;
      color: white;
      box-shadow: 0 4px 15px rgba(52,152,219,0.3);
    }
    
    .criteria-name {
      font-size: 0.9rem;
      color: #7f8c8d;
      font-weight: 500;
    }
    
    .logos-showcase {
      margin-top: 80px;
    }
    
    .logos-showcase h2 {
      font-size: 3rem;
      text-align: center;
      margin-bottom: 60px;
      font-weight: 300;
      color: #2c3e50;
    }
    
    .logo-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      margin-bottom: 40px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
    }
    
    .logo-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    
    .logo-header {
      background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
      padding: 30px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: white;
    }
    
    .logo-rank {
      font-size: 3rem;
      font-weight: 700;
      opacity: 0.9;
    }
    
    .logo-rank.first {
      color: #f1c40f;
    }
    
    .logo-rank.second {
      color: #ecf0f1;
    }
    
    .logo-rank.third {
      color: #e67e22;
    }
    
    .logo-info h3 {
      font-size: 1.5rem;
      font-weight: 400;
      margin-bottom: 5px;
    }
    
    .logo-info .score {
      font-size: 2rem;
      font-weight: 700;
      color: #f1c40f;
    }
    
    .logo-body {
      display: flex;
      height: 400px;
    }
    
    .logo-display {
      flex: 1;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    
    .logo-display img {
      max-width: 100%;
      max-height: 100%;
      filter: drop-shadow(0 8px 24px rgba(0,0,0,0.12));
    }
    
    .logo-metrics {
      flex: 1;
      padding: 40px;
      background: white;
    }
    
    .metric {
      margin-bottom: 25px;
    }
    
    .metric-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    
    .metric-name {
      font-size: 0.95rem;
      color: #7f8c8d;
      font-weight: 500;
    }
    
    .metric-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: #2c3e50;
    }
    
    .metric-bar {
      height: 8px;
      background: #ecf0f1;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .metric-fill {
      height: 100%;
      background: linear-gradient(90deg, #3498db 0%, #2ecc71 100%);
      transition: width 0.8s ease;
      border-radius: 4px;
    }
    
    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2.5rem;
      }
      
      .logo-body {
        flex-direction: column;
        height: auto;
      }
      
      .logo-display {
        min-height: 300px;
      }
    }
    
    @media print {
      .logo-card {
        break-inside: avoid;
        box-shadow: none;
        border: 1px solid #e0e0e0;
      }
    }
  </style>
</head>
<body>
  <div class="hero">
    <h1>SuiReN ロゴデザイン</h1>
    <p class="subtitle">本スタイル バリエーション評価レポート</p>
  </div>
  
  <div class="container">
    <div class="concept-section">
      <h2>デザインコンセプト</h2>
      <div class="concept-cards">
        <div class="concept-card">
          <div class="icon">📖</div>
          <h3>本のメタファー</h3>
          <p>開いた本をモチーフに、読書と学習のイメージを表現</p>
        </div>
        <div class="concept-card">
          <div class="icon">🐟</div>
          <h3>魚のシンボル</h3>
          <p>スイスイ読むという軽快さを魚の動きで表現</p>
        </div>
        <div class="concept-card">
          <div class="icon">✨</div>
          <h3>シンプルな構成</h3>
          <p>認識しやすく、記憶に残るミニマルデザイン</p>
        </div>
      </div>
    </div>
    
    <div class="criteria-section">
      <h2>評価基準</h2>
      <div class="criteria-grid">
        ${Object.entries(evaluationResult.criteria).map(([key, value]) => `
          <div class="criteria-item">
            <div class="criteria-circle">${(value.weight * 100).toFixed(0)}%</div>
            <div class="criteria-name">${value.description}</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="logos-showcase">
      <h2>Top 10 Selection</h2>
      
      ${evaluationResult.top10.map((logo, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'first';
        else if (index === 1) rankClass = 'second';
        else if (index === 2) rankClass = 'third';
        
        return `
        <div class="logo-card">
          <div class="logo-header">
            <div class="logo-rank ${rankClass}">#${index + 1}</div>
            <div class="logo-info">
              <h3>Logo ${logo.id}</h3>
              <div class="score">${logo.totalScore} / 10</div>
            </div>
          </div>
          
          <div class="logo-body">
            <div class="logo-display">
              <img src="../logos-book/png/logo_book_${String(logo.id).padStart(2, '0')}.png" alt="Logo ${logo.id}">
            </div>
            
            <div class="logo-metrics">
              ${Object.entries(evaluationResult.criteria).map(([key, value]) => `
                <div class="metric">
                  <div class="metric-header">
                    <span class="metric-name">${value.description}</span>
                    <span class="metric-value">${logo[key]}/10</span>
                  </div>
                  <div class="metric-bar">
                    <div class="metric-fill" style="width: ${logo[key] * 10}%"></div>
                  </div>
                </div>
              `).join('')}
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
fs.writeFileSync(path.join('logos-book', 'report.html'), htmlContent);
console.log('Book-style HTML report created successfully!');