'use client';

import { useState, useEffect } from 'react';
import { generateQRCode, createResultData, getQRColor } from '../lib/qr-generator';

export default function ResultDisplay({ content, answers, readingData, onBack, onRetry }) {
  const [qrCode, setQrCode] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [speedAnalysis, setSpeedAnalysis] = useState(null);

  // 行ごとの表示時間を分析する関数
  const analyzeLineViewTime = (scrollData, totalTime) => {
    if (!scrollData.scrollPattern || scrollData.scrollPattern.length < 2) {
      return null;
    }

    const events = scrollData.scrollPattern;
    const lines = content.text.split('\n').filter(line => line.trim());
    
    // 仮想的な行の高さとビューポートの高さを設定（実際の値は動的に取得すべきですが、概算として）
    const lineHeight = 40; // 1行の高さ（ピクセル）
    const viewportHeight = 600; // ビューポートの高さ（ピクセル）
    const visibleLines = Math.floor(viewportHeight / lineHeight); // 同時に表示される行数
    
    // 各行の表示時間を追跡
    const lineViewTimes = lines.map(() => ({
      totalViewTime: 0,
      intervals: []
    }));

    // スクロールイベントを時系列で処理
    for (let i = 0; i < events.length - 1; i++) {
      const currentEvent = events[i];
      const nextEvent = events[i + 1];
      
      const startTime = currentEvent.timestamp / 1000; // 秒に変換
      const endTime = nextEvent.timestamp / 1000;
      const duration = endTime - startTime;
      const scrollPosition = currentEvent.scrollPosition;
      
      // この期間中に表示されていた行を計算
      const firstVisibleLine = Math.floor(scrollPosition / lineHeight);
      const lastVisibleLine = Math.min(
        firstVisibleLine + visibleLines - 1,
        lines.length - 1
      );
      
      // 表示されていた各行に時間を加算
      for (let lineIndex = firstVisibleLine; lineIndex <= lastVisibleLine; lineIndex++) {
        if (lineIndex >= 0 && lineIndex < lines.length) {
          lineViewTimes[lineIndex].totalViewTime += duration;
          lineViewTimes[lineIndex].intervals.push({
            start: startTime,
            end: endTime,
            duration: duration
          });
        }
      }
    }

    // 統計情報を計算
    const viewTimes = lineViewTimes.map(line => line.totalViewTime).filter(time => time > 0);
    const avgViewTime = viewTimes.length > 0 ? viewTimes.reduce((a, b) => a + b, 0) / viewTimes.length : 0;
    const maxViewTime = viewTimes.length > 0 ? Math.max(...viewTimes) : 0;
    const minViewTime = viewTimes.length > 0 ? Math.min(...viewTimes) : 0;

    // 進捗と速度のデータポイントを作成（グラフ用）
    const progressPoints = [];
    let cumulativeTime = 0;
    
    lineViewTimes.forEach((lineData, index) => {
      if (lineData.totalViewTime > 0) {
        cumulativeTime += lineData.totalViewTime;
        progressPoints.push({
          progress: ((index + 1) / lines.length) * 100,
          viewTime: lineData.totalViewTime,
          speed: avgViewTime > 0 ? avgViewTime / lineData.totalViewTime : 1, // 相対速度
          lineIndex: index
        });
      }
    });

    return {
      lineViewTimes,
      avgViewTime,
      maxViewTime,
      minViewTime,
      progressPoints,
      totalLines: lines.length,
      analyzedLines: viewTimes.length
    };
  };

  // 行ごとの表示時間に基づく文章セグメントを作成
  const createTimeBasedTextSegments = (text, analysis) => {
    if (!analysis) return [];

    const lines = text.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      const lineData = analysis.lineViewTimes[index];
      const viewTime = lineData ? lineData.totalViewTime : 0;
      
      // 平均表示時間に対する比率を計算
      const normalized = analysis.avgViewTime > 0 ? viewTime / analysis.avgViewTime : 1;
      
      return {
        text: line,
        viewTime: viewTime,
        normalized: normalized,
        intervals: lineData ? lineData.intervals : []
      };
    });
  };

  // 表示時間に基づく色とスタイルを取得
  const getViewTimeStyle = (normalized, viewTime) => {
    if (viewTime === 0) {
      // 表示されなかった行：グレーアウト
      return {
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        color: 'rgb(156, 163, 175)',
        borderLeft: '4px solid rgb(156, 163, 175)',
        opacity: 0.5
      };
    } else if (normalized > 1.5) {
      // 長時間表示=読むのが遅い：赤色
      const intensity = Math.min(1, (normalized - 1) / 2);
      return {
        backgroundColor: `rgba(239, 68, 68, ${0.2 + intensity * 0.3})`,
        color: `rgb(185, 28, 28)`,
        borderLeft: '4px solid rgb(239, 68, 68)'
      };
    } else if (normalized < 0.7) {
      // 短時間表示=読むのが速い：緑色
      const intensity = Math.min(1, (0.7 - normalized) / 0.7);
      return {
        backgroundColor: `rgba(34, 197, 94, ${0.2 + intensity * 0.3})`,
        color: `rgb(21, 128, 61)`,
        borderLeft: '4px solid rgb(34, 197, 94)'
      };
    } else {
      // 通常の表示時間：ニュートラル
      return {
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        color: 'rgb(75, 85, 99)',
        borderLeft: '4px solid rgb(156, 163, 175)'
      };
    }
  };

  // 折れ線グラフコンポーネント（表示時間ベース）
  const ViewTimeChart = ({ analysis }) => {
    if (!analysis || analysis.progressPoints.length === 0) return null;

    const width = 800;
    const height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxViewTime = analysis.maxViewTime;
    const minViewTime = 0; // 最小は0秒
    const timeRange = maxViewTime - minViewTime;

    const points = analysis.progressPoints.map(point => {
      const x = padding + (point.progress / 100) * chartWidth;
      const y = padding + chartHeight - ((point.viewTime - minViewTime) / timeRange) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="bg-white rounded-lg p-6 shadow-md border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          行ごとの表示時間推移
        </h3>
        <svg width={width} height={height} className="border rounded">
          {/* グリッドライン */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />
          
          {/* 軸 */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2"/>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="2"/>
          
          {/* Y軸ラベル */}
          <text x="15" y={padding + 5} textAnchor="middle" className="text-xs fill-gray-600">
            {maxViewTime.toFixed(1)}s
          </text>
          <text x="15" y={height - padding + 5} textAnchor="middle" className="text-xs fill-gray-600">
            0s
          </text>
          
          {/* X軸ラベル */}
          <text x={padding} y={height - 10} textAnchor="middle" className="text-xs fill-gray-600">
            開始
          </text>
          <text x={width - padding} y={height - 10} textAnchor="middle" className="text-xs fill-gray-600">
            終了
          </text>
          <text x={width / 2} y={height - 10} textAnchor="middle" className="text-xs fill-gray-600">
            文章の進捗
          </text>
          
          {/* 平均表示時間ライン */}
          <line 
            x1={padding} 
            y1={padding + chartHeight - ((analysis.avgViewTime - minViewTime) / timeRange) * chartHeight}
            x2={width - padding} 
            y2={padding + chartHeight - ((analysis.avgViewTime - minViewTime) / timeRange) * chartHeight}
            stroke="#6b7280" 
            strokeWidth="1" 
            strokeDasharray="5,5"
          />
          
          {/* 表示時間曲線 */}
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* データポイント */}
          {analysis.progressPoints.map((point, index) => {
            const x = padding + (point.progress / 100) * chartWidth;
            const y = padding + chartHeight - ((point.viewTime - minViewTime) / timeRange) * chartHeight;
            const color = point.viewTime > analysis.avgViewTime * 1.5 ? '#ef4444' : 
                         point.viewTime < analysis.avgViewTime * 0.7 ? '#22c55e' : '#6b7280';
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        <div className="mt-4 flex justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>読むのが遅い行</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            <span>通常の読書速度</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>読むのが速い行</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-0.5 bg-gray-500 mr-2" style={{borderTop: '1px dashed #6b7280'}}></div>
            <span>平均表示時間</span>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const generateResult = async () => {
      // デバッグ：読書データの内容を確認
      console.log('ReadingData:', readingData);
      console.log('ScrollData:', readingData?.scrollData);
      console.log('ScrollPattern:', readingData?.scrollData?.scrollPattern);
      
      const data = createResultData({
        contentId: content.id,
        contentTitle: content.title,
        answers,
        questions: content.questions,
        readingTime: readingData.readingTime,
        scrollData: readingData.scrollData
      });
      
      setResultData(data);
      
      // 行ごとの表示時間分析を実行
      const analysis = analyzeLineViewTime(readingData.scrollData, readingData.readingTime);
      console.log('Line View Time Analysis:', analysis); // デバッグ
      setSpeedAnalysis(analysis);
      
      const qrString = await generateQRCode(data);
      setQrCode(qrString);
    };

    generateResult();
  }, [content, answers, readingData]);

  if (!resultData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">結果を生成中...</p>
        </div>
      </div>
    );
  }

  const getAccuracyColor = (accuracy) => {
    if (accuracy < 70) return 'text-red-600 bg-red-50';
    if (accuracy < 80) return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  const getAccuracyMessage = (accuracy) => {
    if (accuracy < 70) return 'もう一度挑戦してみましょう';
    if (accuracy < 80) return 'よくできました！';
    return 'すばらしい結果です！';
  };

  // 時間ベースの文章セグメントを作成
  const textSegments = speedAnalysis ? createTimeBasedTextSegments(content.text, speedAnalysis) : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          読解練習結果
        </h1>

        {/* 表示時間グラフ */}
        {speedAnalysis && (
          <div className="mb-8">
            <ViewTimeChart analysis={speedAnalysis} />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* 左カラム：基本結果 */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                練習内容
              </h2>
              <p className="text-gray-700">{content.title} ({content.level})</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                読書時間
              </h2>
              <p className="text-2xl font-bold text-blue-600">
                {resultData.readingTime}秒
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                正解率
              </h2>
              <div className={`inline-block px-4 py-2 rounded-lg ${getAccuracyColor(resultData.accuracy)}`}>
                <span className="text-2xl font-bold">
                  {resultData.accuracy}%
                </span>
                <span className="text-sm ml-2">
                  ({resultData.correctAnswers}/{resultData.totalQuestions}問正解)
                </span>
              </div>
              <p className="mt-2 text-gray-600">
                {getAccuracyMessage(resultData.accuracy)}
              </p>
            </div>

            {/* 表示時間統計 */}
            {speedAnalysis && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  読書速度統計
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均表示時間:</span>
                    <span className="font-semibold">{speedAnalysis.avgViewTime.toFixed(2)}秒/行</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">最長表示時間:</span>
                    <span className="font-semibold text-red-600">{speedAnalysis.maxViewTime.toFixed(2)}秒/行</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">最短表示時間:</span>
                    <span className="font-semibold text-green-600">{speedAnalysis.minViewTime.toFixed(2)}秒/行</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">分析対象行数:</span>
                    <span className="font-semibold">{speedAnalysis.analyzedLines}/{speedAnalysis.totalLines}行</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右カラム：QRコード */}
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              結果QRコード
            </h2>
            {qrCode ? (
              <div>
                <img 
                  src={qrCode} 
                  alt="結果QRコード" 
                  className="mx-auto border-4 rounded-lg"
                  style={{ borderColor: resultData.color }}
                />
                <p className="mt-2 text-sm text-gray-600">
                  QRコードの色: {
                    resultData.accuracy < 70 ? '赤（70%未満）' :
                    resultData.accuracy < 80 ? '青（70-80%）' :
                    '緑（80%以上）'
                  }
                </p>
              </div>
            ) : qrCode === null ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-red-500 text-4xl mb-2">⚠️</div>
                  <p className="text-gray-500 text-sm">QRコード生成に失敗しました</p>
                  <p className="text-gray-400 text-xs mt-1">データサイズが大きすぎる可能性があります</p>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">QRコード生成中...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 表示時間別文章表示 */}
        {textSegments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              読書速度分析 - 文章内容
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="mb-4 text-sm text-gray-600">
                <p className="mb-2">
                  <span className="inline-block w-4 h-4 bg-red-200 border-l-4 border-red-500 mr-2"></span>
                  赤色の背景: 長時間表示された行（読むのが遅い）
                </p>
                <p className="mb-2">
                  <span className="inline-block w-4 h-4 bg-green-200 border-l-4 border-green-500 mr-2"></span>
                  緑色の背景: 短時間表示された行（読むのが速い）
                </p>
                <p className="mb-2">
                  <span className="inline-block w-4 h-4 bg-gray-100 border-l-4 border-gray-400 mr-2"></span>
                  グレーの背景: 通常の表示時間
                </p>
                <p>
                  <span className="inline-block w-4 h-4 bg-gray-100 border-l-4 border-gray-400 mr-2 opacity-50"></span>
                  薄いグレー: 画面に表示されなかった行
                </p>
              </div>
              
              <div className="space-y-3 text-base leading-relaxed">
                {textSegments.map((segment, index) => (
                  <div
                    key={index}
                    className="p-3 rounded transition-all duration-200 flex justify-between items-center"
                    style={getViewTimeStyle(segment.normalized, segment.viewTime)}
                  >
                    <span className="flex-1">{segment.text}</span>
                    <span className="text-xs ml-4 opacity-75">
                      {segment.viewTime > 0 ? `${segment.viewTime.toFixed(2)}s` : '未表示'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 問題別結果 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            問題別結果
          </h2>
          <div className="space-y-4">
            {content.questions.map((question, index) => {
              const isCorrect = answers[index] === question.correctAnswer;
              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      問題 {index + 1}: {question.question}
                    </h3>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isCorrect ? '正解' : '不正解'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>あなたの回答: {question.options[answers[index]]}</p>
                    {!isCorrect && (
                      <p>正解: {question.options[question.correctAnswer]}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center space-x-4">
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            もう一度練習
          </button>
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            練習選択に戻る
          </button>
        </div>
      </div>
    </div>
  );
}