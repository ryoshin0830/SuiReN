'use client';

import { useState, useEffect } from 'react';
import { generateQRCode, createResultData, getQRColor } from '../lib/qr-generator';

export default function ResultDisplay({ content, answers, readingData, onBack, onRetry }) {
  const [qrCode, setQrCode] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [speedAnalysis, setSpeedAnalysis] = useState(null);

  // 画像に関する行を判定する関数
  const isImageLine = (line) => {
    const trimmed = line.trim();
    // アプリケーション固有の画像プレースホルダー
    if (trimmed.match(/\{\{IMAGE:[^}]+\}\}/)) return true;
    if (trimmed.match(/\{\{IMAGES:[^}]+\}\}/)) return true;
    // Markdown形式の画像
    if (trimmed.match(/!\[.*?\]\(.*?\)/)) return true;
    // HTML形式の画像
    if (trimmed.match(/<img[^>]*>/i)) return true;
    // [画像]や（画像）のような表記
    if (trimmed.match(/[【\[（(].*?画像.*?[】\]）)]/)) return true;
    // 画像URLを含む行
    if (trimmed.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) return true;
    // その他の画像関連キーワード
    if (trimmed.match(/^(図|画像|写真|イラスト)\s*[:：]?/)) return true;
    return false;
  };

  // 行ごとの表示時間を分析する関数
  const analyzeLineViewTime = (scrollData, totalTime) => {
    if (!scrollData.scrollPattern || scrollData.scrollPattern.length < 2) {
      return null;
    }

    const events = scrollData.scrollPattern;
    const lines = content.text.split('\n').filter(line => line.trim() && !isImageLine(line));
    
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

    const lines = text.split('\n').filter(line => line.trim() && !isImageLine(line));
    
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
        backgroundColor: '#f8fafc',
        color: '#64748b',
        borderLeft: '3px solid #e2e8f0'
      };
    } else if (normalized > 1.5) {
      // 長時間表示=読むのが遅い：赤色
      return {
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        borderLeft: '3px solid #ef4444'
      };
    } else if (normalized < 0.7) {
      // 短時間表示=読むのが速い：緑色
      return {
        backgroundColor: '#f0fdf4',
        color: '#16a34a',
        borderLeft: '3px solid #22c55e'
      };
    } else {
      // 通常の表示時間：ニュートラル
      return {
        backgroundColor: '#ffffff',
        color: '#374151',
        borderLeft: '3px solid #d1d5db'
      };
    }
  };


  useEffect(() => {
    const generateResult = async () => {
      const result = createResultData({
        contentId: content.id,
        contentTitle: content.title,
        answers,
        questions: content.questions,
        readingTime: readingData.readingTime,
        scrollData: readingData.scrollData
      });
      
      // 表示用データを設定
      setResultData(result.displayData);
      
      // 行ごとの表示時間分析を実行
      const analysis = analyzeLineViewTime(readingData.scrollData, readingData.readingTime);
      setSpeedAnalysis(analysis);
      
      // QRコードは最小限データで生成
      const qrString = await generateQRCode(result.qrData);
      setQrCode(qrString);
    };

    generateResult();
  }, [content, answers, readingData]);

  if (!resultData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">結果を生成中...</p>
        </div>
      </div>
    );
  }



  // 時間ベースの文章セグメントを作成
  const textSegments = speedAnalysis ? createTimeBasedTextSegments(content.text, speedAnalysis) : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        
        {/* ヘッダー */}
        <div className="border-b pb-4 sm:pb-6 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">読解練習結果</h1>
          <p className="text-sm sm:text-base text-gray-600">{content.title}</p>
        </div>

        {/* 基本結果 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="border rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">読書時間</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{resultData.readingTime}秒</div>
          </div>
          
          {resultData.accuracy !== null && (
            <div className="border rounded-lg p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">正解率</div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{resultData.accuracy}%</div>
              <div className="text-xs text-gray-500">{resultData.correctAnswers}/{resultData.totalQuestions}問正解</div>
            </div>
          )}
          
          <div className="border rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">レベル</div>
            <div className="text-base sm:text-lg font-medium text-gray-900">{content.level}</div>
          </div>
        </div>

        {/* 文章解説 */}
        {content.explanation && content.explanation.trim() && (
          <div className="border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">文章解説</h2>
            <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
              {content.explanation}
            </div>
          </div>
        )}

        {/* 読書速度分析 */}
        {textSegments.length > 0 && (
          <div className="border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">読書速度分析</h2>
            <div className="space-y-1">
              {textSegments.map((segment, index) => (
                <div
                  key={index}
                  className="p-2 sm:p-3 rounded flex flex-col sm:flex-row sm:justify-between sm:items-center"
                  style={getViewTimeStyle(segment.normalized, segment.viewTime)}
                >
                  <span className="flex-1 text-sm sm:text-base">{segment.text}</span>
                  <span className="text-xs ml-0 sm:ml-3 mt-1 sm:mt-0 opacity-70 font-mono">
                    {segment.viewTime > 0 ? `${segment.viewTime.toFixed(1)}s` : '未表示'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 問題別結果 */}
        <div className="border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">問題別結果</h2>
          {content.questions && content.questions.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {content.questions.map((question, index) => {
                const isCorrect = answers[index] === question.correctAnswer;
                return (
                  <div key={question.id} className="border rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4">
                      <h3 className="font-medium text-gray-900 flex-1 text-sm sm:text-base mb-2 sm:mb-0">
                        問題 {index + 1}: {question.question}
                      </h3>
                      <span className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                        isCorrect 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? '正解' : '不正解'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = answers[index] === optionIndex;
                        const isCorrectOption = optionIndex === question.correctAnswer;
                        
                        let className = 'p-3 rounded border';
                        if (isCorrectOption) {
                          className += ' bg-green-50 border-green-200';
                        } else if (isSelected) {
                          className += ' bg-red-50 border-red-200';
                        } else {
                          className += ' bg-gray-50 border-gray-200';
                        }
                        
                        return (
                          <div key={optionIndex} className={className}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="flex-1 text-sm sm:text-base mb-2 sm:mb-0">{optionIndex + 1}. {option}</span>
                              <div className="flex space-x-2">
                                {isSelected && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    回答
                                  </span>
                                )}
                                {isCorrectOption && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                    正解
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && question.explanation.trim() && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-yellow-50 rounded border-l-4 border-yellow-400">
                        <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">解説</h4>
                        <div className="text-gray-700 whitespace-pre-wrap text-xs sm:text-sm">
                          {question.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              このコンテンツには問題が設定されていません
            </div>
          )}
        </div>

        {/* QRコード */}
        {qrCode && (
          <div className="border rounded-lg p-4 sm:p-6 text-center mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">結果QRコード</h2>
            <img 
              src={qrCode} 
              alt="結果QRコード" 
              className="mx-auto border rounded w-32 h-32 sm:w-48 sm:h-48"
              style={{ maxWidth: '200px' }}
            />
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              スキャンして結果を共有
            </p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            もう一度練習
          </button>
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            練習選択に戻る
          </button>
        </div>
      </div>
    </div>
  );
}