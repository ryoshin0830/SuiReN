// Canvas APIを使用してPDFを生成する簡易的な方法
export const downloadScoreSheet = (resultData) => {
  console.log('PDF生成開始:', resultData);
  
  // データの検証
  if (!resultData) {
    console.error('結果データがありません');
    alert('エラー: 結果データが見つかりません');
    return;
  }
  
  // HTMLコンテンツを作成
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: "ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", "メイリオ", Meiryo, "ＭＳ Ｐゴシック", sans-serif;
          padding: 40px;
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 30px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          padding-bottom: 5px;
          border-bottom: 2px solid #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .result-table th {
          width: 30%;
        }
        .correct {
          color: #10b981;
          font-weight: bold;
          font-size: 18px;
        }
        .incorrect {
          color: #ef4444;
          font-weight: bold;
          font-size: 18px;
        }
        .memo-section {
          margin-top: 30px;
        }
        .memo-line {
          border-bottom: 1px solid #ddd;
          height: 30px;
          margin-bottom: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          color: #666;
          font-size: 12px;
        }
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">速読練習記録シート</div>
      
      <div class="info-row">
        <div>日付: ${new Date().getFullYear()}年${(new Date().getMonth() + 1)}月${new Date().getDate()}日</div>
        <div>名前: ＿＿＿＿＿＿＿＿＿＿＿＿＿＿</div>
      </div>
      
      <div class="section">
        <div class="section-title">読み物情報</div>
        <table class="result-table">
          <tr>
            <th>タイトル</th>
            <td>${resultData.contentTitle || '未設定'}</td>
          </tr>
          <tr>
            <th>レベル</th>
            <td>${resultData.level || '未設定'}</td>
          </tr>
          <tr>
            <th>文字数</th>
            <td>${resultData.characterCount ? resultData.characterCount + ' 文字' : '未計測'}</td>
          </tr>
        </table>
      </div>
      
      <div class="section">
        <div class="section-title">読書結果</div>
        <table class="result-table">
          <tr>
            <th>読書時間</th>
            <td>${resultData.readingTime} 秒</td>
          </tr>
          <tr>
            <th>読書速度</th>
            <td>${resultData.characterCount && resultData.readingTime ? 
              Math.round((resultData.characterCount / resultData.readingTime) * 60) + ' 文字/分' : 
              '未計測'}</td>
          </tr>
          ${resultData.accuracy !== null ? `
          <tr>
            <th>正解率</th>
            <td>${resultData.accuracy}% (${resultData.correctAnswers}/${resultData.totalQuestions}問正解)</td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      ${resultData.questions && resultData.questions.length > 0 ? `
      <div class="section">
        <div class="section-title">問題別結果</div>
        ${resultData.questions.map((question, index) => {
          const isCorrect = resultData.answers[index] === question.correctAnswer;
          const userAnswer = resultData.answers[index];
          return `
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: ${isCorrect ? '#f0fdf4' : '#fef2f2'};">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4 style="margin: 0; font-size: 16px;">問題${index + 1}</h4>
              <span class="${isCorrect ? 'correct' : 'incorrect'}" style="font-size: 20px;">
                ${isCorrect ? '○ 正解' : '× 不正解'}
              </span>
            </div>
            <p style="margin-bottom: 10px; font-weight: bold;">${question.question}</p>
            <div style="margin-left: 20px;">
              ${question.options.map((option, optionIndex) => {
                const isUserAnswer = userAnswer === optionIndex;
                const isCorrectOption = optionIndex === question.correctAnswer;
                let style = 'padding: 5px 10px; margin: 3px 0; border-radius: 4px;';
                
                if (isCorrectOption) {
                  style += ' background-color: #d1fae5; border: 2px solid #10b981;';
                } else if (isUserAnswer && !isCorrect) {
                  style += ' background-color: #fee2e2; border: 2px solid #ef4444;';
                } else {
                  style += ' background-color: #f9fafb; border: 1px solid #e5e7eb;';
                }
                
                return `
                <div style="${style}">
                  ${optionIndex + 1}. ${option}
                  ${isCorrectOption ? ' <span style="color: #10b981; font-weight: bold;">← 正解</span>' : ''}
                  ${isUserAnswer && !isCorrectOption ? ' <span style="color: #ef4444; font-weight: bold;">← あなたの回答</span>' : ''}
                </div>
                `;
              }).join('')}
            </div>
            ${question.explanation ? `
            <div style="margin-top: 10px; padding: 10px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
              <strong>解説:</strong> ${question.explanation}
            </div>
            ` : ''}
          </div>
          `;
        }).join('')}
      </div>
      ` : ''}
      
      ${resultData.textSegments && resultData.textSegments.length > 0 ? `
      <div class="section" style="page-break-before: always;">
        <div class="section-title">段落別読書時間分析</div>
        <table>
          <tr>
            <th style="width: 10%; text-align: center;">段落番号</th>
            <th style="width: 15%; text-align: center;">読書時間</th>
            <th style="width: 15%; text-align: center;">速度評価</th>
            <th style="width: 60%;">段落内容（冒頭）</th>
          </tr>
          ${resultData.textSegments.map((segment, index) => {
            let speedLabel = '通常';
            let speedColor = '#374151';
            
            // セグメントデータの検証
            const viewTime = segment.viewTime || 0;
            const normalized = segment.normalized || 1;
            const text = segment.text || '';
            
            if (viewTime === 0) {
              speedLabel = '未表示';
              speedColor = '#64748b';
            } else if (normalized > 1.5) {
              speedLabel = '遅い';
              speedColor = '#ef4444';
            } else if (normalized < 0.7) {
              speedLabel = '速い';
              speedColor = '#10b981';
            }
            
            const textPreview = text.length > 50 ? 
              text.substring(0, 50) + '...' : 
              text;
            
            return `
            <tr>
              <td style="text-align: center;">${segment.isParagraph ? `段落${segment.paragraphIndex + 1}` : `${index + 1}`}</td>
              <td style="text-align: center;">${segment.viewTime > 0 ? segment.viewTime.toFixed(1) + '秒' : '未表示'}</td>
              <td style="text-align: center; color: ${speedColor}; font-weight: bold;">${speedLabel}</td>
              <td style="font-size: 11px;">${textPreview}</td>
            </tr>
            `;
          }).join('')}
        </table>
        ${resultData.speedAnalysis ? `
        <div style="margin-top: 15px; padding: 10px; background-color: #e0f2fe; border-radius: 8px;">
          <h4 style="margin-bottom: 5px;">統計情報</h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 12px;">
            <div><strong>平均時間:</strong> ${resultData.speedAnalysis.avgViewTime.toFixed(1)}秒</div>
            <div><strong>最長時間:</strong> ${resultData.speedAnalysis.maxViewTime.toFixed(1)}秒</div>
            <div><strong>最短時間:</strong> ${resultData.speedAnalysis.minViewTime.toFixed(1)}秒</div>
            <div><strong>分析数:</strong> ${resultData.speedAnalysis.analyzedParagraphs || resultData.speedAnalysis.analyzedLines}/${resultData.speedAnalysis.totalParagraphs || resultData.speedAnalysis.totalLines}</div>
          </div>
        </div>
        ` : ''}
      </div>
      ` : ''}
      
      <div class="memo-section">
        <div class="section-title">メモ</div>
        ${Array(5).fill(null).map(() => '<div class="memo-line"></div>').join('')}
      </div>
      
      <div class="footer">
        Generated by SuiReN - Japanese Speed Reading
      </div>
    </body>
    </html>
  `;

  // 新しいウィンドウを開いて印刷
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // コンテンツが読み込まれるのを待ってから印刷
    printWindow.onload = () => {
      console.log('印刷ウィンドウが読み込まれました');
      printWindow.print();
    };
  } else {
    console.error('新しいウィンドウを開けませんでした');
    alert('ポップアップがブロックされています。ブラウザの設定でポップアップを許可してください。');
  }
};