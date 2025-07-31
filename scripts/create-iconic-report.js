const fs = require('fs');
const path = require('path');

// 評価結果を読み込み
const evaluationResult = JSON.parse(
  fs.readFileSync(path.join('logos-iconic', 'evaluation-result.json'), 'utf8')
);

// HTMLレポートを生成
const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SuiReN アイコニックロゴデザイン評価レポート</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background-color: #ffffff;
      color: #1d1d1f;
      line-height: 1.4;
    }
    
    .header {
      text-align: center;
      padding: 80px 40px;
      background: linear-gradient(135deg, #f5f5f7 0%, #ffffff 100%);
    }
    
    .header h1 {
      font-size: 56px;
      font-weight: 600;
      letter-spacing: -0.03em;
      margin-bottom: 16px;
      background: linear-gradient(135deg, #1d1d1f 0%, #515154 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .header p {
      font-size: 21px;
      color: #86868b;
      font-weight: 400;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 40px;
    }
    
    .project-info {
      margin: 80px 0;
      text-align: center;
    }
    
    .project-info h2 {
      font-size: 40px;
      font-weight: 600;
      margin-bottom: 40px;
      color: #1d1d1f;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-bottom: 60px;
    }
    
    .info-card {
      background: #f5f5f7;
      padding: 30px;
      border-radius: 18px;
      text-align: left;
    }
    
    .info-card h3 {
      font-size: 17px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 8px;
    }
    
    .info-card p {
      font-size: 15px;
      color: #86868b;
      line-height: 1.6;
    }
    
    .criteria-section {
      margin: 80px 0;
    }
    
    .criteria-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 40px;
    }
    
    .criteria-item {
      background: #f5f5f7;
      padding: 30px 20px;
      border-radius: 12px;
      text-align: center;
      transition: transform 0.3s ease;
    }
    
    .criteria-item:hover {
      transform: translateY(-4px);
    }
    
    .criteria-percentage {
      font-size: 48px;
      font-weight: 600;
      color: #0071e3;
      margin-bottom: 8px;
    }
    
    .criteria-label {
      font-size: 14px;
      color: #1d1d1f;
      font-weight: 500;
    }
    
    .logos-section {
      margin: 100px 0;
    }
    
    .logos-section h2 {
      font-size: 48px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 60px;
      color: #1d1d1f;
    }
    
    .logo-showcase {
      display: grid;
      gap: 60px;
    }
    
    .logo-card {
      background: #ffffff;
      border: 1px solid #d2d2d7;
      border-radius: 18px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    
    .logo-card:hover {
      box-shadow: 0 12px 48px rgba(0,0,0,0.12);
      transform: translateY(-8px);
    }
    
    .logo-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 32px;
      background: #f5f5f7;
    }
    
    .rank-badge {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .rank-number {
      font-size: 32px;
      font-weight: 700;
      color: #0071e3;
    }
    
    .rank-number.first {
      color: #FFD700;
      text-shadow: 0 2px 4px rgba(255,215,0,0.3);
    }
    
    .rank-number.second {
      color: #C0C0C0;
      text-shadow: 0 2px 4px rgba(192,192,192,0.3);
    }
    
    .rank-number.third {
      color: #CD7F32;
      text-shadow: 0 2px 4px rgba(205,127,50,0.3);
    }
    
    .logo-name {
      font-size: 17px;
      font-weight: 600;
      color: #1d1d1f;
    }
    
    .logo-preview {
      padding: 80px;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }
    
    .logo-preview img {
      max-width: 300px;
      height: auto;
      filter: drop-shadow(0 4px 16px rgba(0,0,0,0.1));
    }
    
    .logo-metrics {
      padding: 40px;
      background: #ffffff;
    }
    
    .metric-row {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      gap: 20px;
    }
    
    .metric-label {
      flex: 0 0 160px;
      font-size: 15px;
      font-weight: 500;
      color: #1d1d1f;
    }
    
    .metric-bar-bg {
      flex: 1;
      height: 8px;
      background: #f5f5f7;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .metric-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #0071e3 0%, #40c8ff 100%);
      border-radius: 8px;
      transition: width 0.6s ease;
    }
    
    .metric-score {
      flex: 0 0 60px;
      text-align: right;
      font-size: 17px;
      font-weight: 600;
      color: #1d1d1f;
    }
    
    .total-score-container {
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid #d2d2d7;
      text-align: center;
    }
    
    .total-score-label {
      font-size: 14px;
      color: #86868b;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    
    .total-score {
      font-size: 56px;
      font-weight: 700;
      color: #0071e3;
    }
    
    @media (max-width: 768px) {
      .header h1 {
        font-size: 40px;
      }
      
      .logo-preview {
        padding: 40px;
        min-height: 300px;
      }
      
      .metric-label {
        flex: 0 0 120px;
        font-size: 14px;
      }
    }
    
    @media print {
      .logo-card {
        break-inside: avoid;
        border: 1px solid #d2d2d7;
      }
      
      .logo-card:hover {
        box-shadow: none;
        transform: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>SuiReN</h1>
    <p>アイコニックロゴデザイン評価レポート</p>
  </div>
  
  <div class="container">
    <div class="project-info">
      <h2>プロジェクト概要</h2>
      <div class="info-grid">
        <div class="info-card">
          <h3>デザインコンセプト</h3>
          <p>Appleロゴのようにシンプルでありながら、魚と睡蓮が識別可能なアイコニックデザイン</p>
        </div>
        <div class="info-card">
          <h3>要素</h3>
          <p>魚（スイスイ読む）と睡蓮（SuiReN）の融合</p>
        </div>
        <div class="info-card">
          <h3>評価日時</h3>
          <p>${new Date(evaluationResult.evaluationDate).toLocaleString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </div>
    </div>
    
    <div class="criteria-section">
      <h2 style="text-align: center; font-size: 40px; margin-bottom: 40px;">評価基準</h2>
      <div class="criteria-grid">
        ${Object.entries(evaluationResult.criteria).map(([key, value]) => `
          <div class="criteria-item">
            <div class="criteria-percentage">${(value.weight * 100).toFixed(0)}%</div>
            <div class="criteria-label">${value.description}</div>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="logos-section">
      <h2>トップ10 セレクション</h2>
      
      <div class="logo-showcase">
        ${evaluationResult.top10.map((logo, index) => {
          let rankClass = '';
          if (index === 0) rankClass = 'first';
          else if (index === 1) rankClass = 'second';
          else if (index === 2) rankClass = 'third';
          
          return `
          <div class="logo-card">
            <div class="logo-header">
              <div class="rank-badge">
                <div class="rank-number ${rankClass}">#${index + 1}</div>
                <div class="logo-name">ロゴ ${logo.id}</div>
              </div>
            </div>
            
            <div class="logo-preview">
              <img src="../logos-iconic/png/logo_iconic_${String(logo.id).padStart(2, '0')}.png" alt="Logo ${logo.id}">
            </div>
            
            <div class="logo-metrics">
              ${Object.entries(evaluationResult.criteria).map(([key, value]) => `
                <div class="metric-row">
                  <div class="metric-label">${value.description}</div>
                  <div class="metric-bar-bg">
                    <div class="metric-bar-fill" style="width: ${logo[key] * 10}%"></div>
                  </div>
                  <div class="metric-score">${logo[key]}/10</div>
                </div>
              `).join('')}
              
              <div class="total-score-container">
                <div class="total-score-label">総合評価</div>
                <div class="total-score">${logo.totalScore}</div>
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
fs.writeFileSync(path.join('logos-iconic', 'report.html'), htmlContent);
console.log('Iconic HTML report created successfully!');