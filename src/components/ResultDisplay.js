'use client';

import { useState, useEffect } from 'react';
import { generateQRCode, createResultData } from '../lib/qr-generator';
import { downloadScoreSheet } from '../lib/pdf-generator';
import { calculateReadingSpeed } from '../lib/speed-calculator';

export default function ResultDisplay({ content, answers, readingData, onBack, onRetry }) {
  const [qrCode, setQrCode] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [speedAnalysis, setSpeedAnalysis] = useState(null);
  const [readingStatistics, setReadingStatistics] = useState(null);

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

  // 段落ごとの表示時間を分析する関数
  const analyzeParagraphViewTime = (scrollData) => {
    // 段落別データがある場合はそれを使用
    if (scrollData.paragraphTimes) {
      const paragraphs = content.text.split('\n').filter(paragraph => paragraph.trim());
      const paragraphAnalysis = [];
      
      // 各段落のデータを処理
      paragraphs.forEach((paragraph, index) => {
        const paragraphData = scrollData.paragraphTimes[index];
        let viewTime = 0;
        
        if (paragraphData !== undefined && paragraphData !== null) {
          // 新しい形式の段落時間データ（既に秒単位）
          viewTime = typeof paragraphData === 'number' 
            ? paragraphData // 単純な数値の場合は既に秒単位
            : paragraphData.totalTime || 0; // オブジェクトの場合
        }
        
        console.log(`段落${index + 1}: 原データ=${paragraphData}, 表示時間=${viewTime.toFixed(2)}秒`);
            
        paragraphAnalysis.push({
          index: index,
          text: paragraph,
          totalViewTime: viewTime,
          firstSeen: typeof paragraphData === 'object' ? paragraphData.firstSeen : null,
          lastSeen: typeof paragraphData === 'object' ? paragraphData.lastSeen : null
        });
      });
      
      // 統計情報を計算
      const viewTimes = paragraphAnalysis.map(p => p.totalViewTime).filter(time => time > 0);
      const avgViewTime = viewTimes.length > 0 ? viewTimes.reduce((a, b) => a + b, 0) / viewTimes.length : 0;
      const maxViewTime = viewTimes.length > 0 ? Math.max(...viewTimes) : 0;
      const minViewTime = viewTimes.length > 0 ? Math.min(...viewTimes) : 0;
      
      return {
        paragraphAnalysis,
        avgViewTime,
        maxViewTime,
        minViewTime,
        totalParagraphs: paragraphs.length,
        analyzedParagraphs: viewTimes.length
      };
    }
    
    // フォールバック: 旧来の行ベース分析
    return analyzeLineViewTime(scrollData);
  };
  
  // 行ごとの表示時間を分析する関数（フォールバック用）
  const analyzeLineViewTime = (scrollData) => {
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

  // 段落ごとの表示時間に基づく読み物セグメントを作成
  const createTimeBasedTextSegments = (text, analysis) => {
    if (!analysis) return [];
    
    // 段落ベースの分析がある場合
    if (analysis.paragraphAnalysis) {
      return analysis.paragraphAnalysis.map((paragraph) => {
        // 平均表示時間に対する比率を計算
        const normalized = analysis.avgViewTime > 0 ? paragraph.totalViewTime / analysis.avgViewTime : 1;
        
        return {
          text: paragraph.text,
          viewTime: paragraph.totalViewTime,
          normalized: normalized,
          isParagraph: true,
          paragraphIndex: paragraph.index
        };
      });
    }
    
    // フォールバック: 行ベース分析
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
        intervals: lineData ? lineData.intervals : [],
        isParagraph: false
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

  // 記録用紙をダウンロードする関数
  const handleDownloadScoreSheet = () => {
    // 文字数を計算（画像行を除外）
    const lines = content.text.split('\n').filter(line => line.trim() && !isImageLine(line));
    const characterCount = lines.join('').length;

    // 時間ベースの読み物セグメントを作成（関数内で作成）
    const currentTextSegments = speedAnalysis ? createTimeBasedTextSegments(content.text, speedAnalysis) : [];

    const pdfData = {
      ...resultData,
      contentTitle: content.title,
      level: content.level,
      questions: content.questions,
      answers: answers,
      characterCount: characterCount,
      speedAnalysis: speedAnalysis,
      textSegments: currentTextSegments
    };

    downloadScoreSheet(pdfData);
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
      
      // 段落ごとの表示時間分析を実行
      const analysis = analyzeParagraphViewTime(readingData.scrollData);
      setSpeedAnalysis(analysis);
      
      // 読書速度を計算（手動入力された語数・文字数を使用）
      if (content.wordCount && content.characterCount) {
        const speedWPM = Math.round((content.wordCount / readingData.readingTime) * 60);
        const speedCPM = Math.round((content.characterCount / readingData.readingTime) * 60);
        
        setReadingStatistics({
          wordCount: content.wordCount,
          characterCount: content.characterCount,
          readingSpeedWPM: speedWPM,
          readingSpeedCPM: speedCPM,
          readingTime: readingData.readingTime
        });
      }
      
      // QRコードは最小限データで生成
      const qrString = await generateQRCode(result.qrData);
      setQrCode(qrString);
    };

    generateResult();
  }, [content, answers, readingData]);

  if (!resultData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gradient-to-r from-blue-400 to-purple-500 border-t-transparent mx-auto mb-6 shadow-lg"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-blue-200 mx-auto animate-pulse"></div>
          </div>
          <p className="text-gray-700 text-xl font-medium animate-pulse">✨ 結果を生成中...</p>
        </div>
      </div>
    );
  }



  // 時間ベースの読み物セグメントを作成
  const textSegments = speedAnalysis ? createTimeBasedTextSegments(content.text, speedAnalysis) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* ヘッダー */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-3xl mb-4 sm:mb-6 shadow-xl animate-bounce-in">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 sm:mb-4">速読練習結果</h1>
          <p className="text-lg sm:text-xl text-gray-600 font-medium">{content.title}</p>
        </div>

        {/* 基本結果 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 group hover:bg-white/80 transition-all duration-300 animate-slide-up">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-600">読書時間</div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-800 to-blue-900 bg-clip-text text-transparent">{resultData.readingTime}秒</div>
          </div>
          
          {resultData.accuracy !== null && (
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 group hover:bg-white/80 transition-all duration-300 animate-slide-up">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-600">正解率</div>
              </div>
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-800 to-emerald-900 bg-clip-text text-transparent mb-1">{resultData.accuracy}%</div>
              <div className="text-sm text-gray-500 font-medium">{resultData.correctAnswers}/{resultData.totalQuestions}問正解</div>
            </div>
          )}
          
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 group hover:bg-white/80 transition-all duration-300 animate-slide-up">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-600">レベル</div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-800">{content.level}</div>
          </div>
        </div>

        {/* 読書速度統計 */}
        {readingStatistics && (
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 mb-8 sm:mb-12 animate-slide-up">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-800 to-indigo-900 bg-clip-text text-transparent">読書速度分析</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 語数ベースの速度 */}
              <div className="bg-white/50 rounded-xl p-4 sm:p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="text-lg">📚</span>
                  <span className="ml-2">語数ベース</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">標準語数:</span>
                    <span className="font-bold text-gray-800">{readingStatistics.wordCount}語</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">読書速度:</span>
                    <span className="font-bold text-2xl text-blue-600">
                      {readingStatistics.readingSpeedWPM}語/分
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    読了時間: {readingStatistics.readingTime}秒
                  </div>
                </div>
              </div>
              
              {/* 文字数ベースの速度 */}
              <div className="bg-white/50 rounded-xl p-4 sm:p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="text-lg">✍️</span>
                  <span className="ml-2">文字数ベース</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">文字数:</span>
                    <span className="font-bold text-gray-800">{readingStatistics.characterCount}文字</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">読書速度:</span>
                    <span className="font-bold text-2xl text-green-600">
                      {readingStatistics.readingSpeedCPM}文字/分
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    読了時間: {readingStatistics.readingTime}秒
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}

        {/* 読み物解説 */}
        {content.explanation && content.explanation.trim() && (
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 mb-8 sm:mb-12 animate-slide-up">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-800 to-indigo-900 bg-clip-text text-transparent">読み物解説</h2>
            </div>
            <div className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
              {content.explanation}
            </div>
          </div>
        )}

        {/* 段落別読書速度分析 */}
        {textSegments.length > 0 && (
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 mb-8 sm:mb-12 animate-slide-up">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-800 to-orange-900 bg-clip-text text-transparent">
                {textSegments[0]?.isParagraph ? '段落別読書速度分析' : '読書速度分析'}
              </h2>
            </div>
            <div className="space-y-3">
              {textSegments.map((segment, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 rounded-xl border transition-all duration-200 hover:scale-[1.01]"
                  style={getViewTimeStyle(segment.normalized, segment.viewTime)}
                >
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        {segment.isParagraph && (
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {segment.paragraphIndex + 1}
                          </div>
                        )}
                        <span className="text-xs font-medium px-2 py-1 bg-black/10 rounded-lg">
                          {segment.isParagraph ? '段落' : '行'} {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-black/10 rounded-lg font-mono font-medium">
                          {segment.viewTime > 0 ? `${segment.viewTime.toFixed(1)}s` : '未表示'}
                        </span>
                        {segment.normalized > 1.5 && (
                          <span className="text-xs px-2 py-1 bg-red-200 text-red-800 rounded-lg font-medium">
                            速度遅い
                          </span>
                        )}
                        {segment.normalized < 0.7 && segment.viewTime > 0 && (
                          <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded-lg font-medium">
                            速度速い
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm sm:text-base leading-relaxed">
                      {segment.text.length > 200 ? segment.text.substring(0, 200) + '...' : segment.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {speedAnalysis?.avgViewTime && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="text-sm font-bold text-blue-900 mb-2">統計情報</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-blue-800">
                  <div>
                    <span className="font-medium">平均時間:</span><br/>
                    {speedAnalysis.avgViewTime.toFixed(1)}s
                  </div>
                  <div>
                    <span className="font-medium">最長時間:</span><br/>
                    {speedAnalysis.maxViewTime.toFixed(1)}s
                  </div>
                  <div>
                    <span className="font-medium">最短時間:</span><br/>
                    {speedAnalysis.minViewTime.toFixed(1)}s
                  </div>
                  <div>
                    <span className="font-medium">分析数:</span><br/>
                    {speedAnalysis.analyzedParagraphs || speedAnalysis.analyzedLines}/{speedAnalysis.totalParagraphs || speedAnalysis.totalLines}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 問題別結果 */}
        <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 mb-8 sm:mb-12 animate-slide-up">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-800 to-pink-900 bg-clip-text text-transparent">問題別結果</h2>
          </div>
          {content.questions && content.questions.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {content.questions.map((question, index) => {
                const isCorrect = answers[index] === question.correctAnswer;
                return (
                  <div key={question.id} className="bg-white/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
                      <h3 className="font-semibold text-gray-900 flex-1 text-base sm:text-lg mb-3 sm:mb-0 leading-relaxed">
                        問題 {index + 1}: {question.question}
                      </h3>
                      <span className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold shadow-md ${
                        isCorrect 
                          ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300' 
                          : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                      }`}>
                        {isCorrect ? '✓ 正解' : '✗ 不正解'}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => {
                        const isSelected = answers[index] === optionIndex;
                        const isCorrectOption = optionIndex === question.correctAnswer;
                        
                        let className = 'p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.01]';
                        if (isCorrectOption) {
                          className += ' bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-300 shadow-md';
                        } else if (isSelected) {
                          className += ' bg-gradient-to-r from-red-50 to-red-100 border-red-300 shadow-md';
                        } else {
                          className += ' bg-white/70 border-gray-200 hover:border-gray-300';
                        }
                        
                        return (
                          <div key={optionIndex} className={className}>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <span className="flex-1 text-sm sm:text-base mb-2 sm:mb-0 font-medium leading-relaxed text-gray-800">{optionIndex + 1}. {renderRubyText(option)}</span>
                              <div className="flex space-x-2">
                                {isSelected && (
                                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm">
                                    回答
                                  </span>
                                )}
                                {isCorrectOption && (
                                  <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm">
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
                      <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-l-4 border-amber-400 shadow-sm">
                        <div className="flex items-center mb-3">
                          <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-amber-800 text-sm sm:text-base">解説</h4>
                        </div>
                        <div className="text-amber-900 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                          {question.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">このコンテンツには問題が設定されていません</p>
            </div>
          )}
        </div>

        {/* QRコード */}
        {qrCode && (
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 text-center mb-8 sm:mb-12 animate-slide-up">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-800 to-cyan-900 bg-clip-text text-transparent">結果QRコード</h2>
            </div>
            <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border border-gray-200 mb-4">
              <img 
                src={qrCode} 
                alt="結果QRコード" 
                className="w-32 h-32 sm:w-48 sm:h-48 rounded-lg"
                style={{ maxWidth: '200px' }}
              />
            </div>
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              📱 スキャンして結果を共有
            </p>
          </div>
        )}

        {/* 記録用紙ダウンロード */}
        <div className="backdrop-blur-xl bg-white/70 rounded-2xl p-6 sm:p-8 shadow-xl border border-white/20 text-center mb-8 sm:mb-12 animate-slide-up">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-800 to-amber-900 bg-clip-text text-transparent">記録用紙</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 font-medium mb-6">
            練習結果を記録・管理するための用紙をダウンロードできます
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDownloadScoreSheet}
              className="inline-flex items-center bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-base font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              今回の結果詳細 (PDF)
            </button>
            <a
              href="http://www17408ui.sakura.ne.jp/tatsum/PersonalWeb-site/%E9%80%9F%E8%AA%AD%E6%8E%88%E6%A5%AD%E7%94%A8%E5%BE%97%E7%82%B9%E3%83%BB%E6%99%82%E9%96%93%E3%82%B7%E3%83%BC%E3%83%88.xlsx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-base font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              得点/時間記録シート (Excel)
            </a>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <button
            onClick={onRetry}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-base sm:text-lg font-semibold w-full sm:w-auto backdrop-blur-sm"
          >
            🔄 もう一度練習
          </button>
          <button
            onClick={onBack}
            className="bg-white/80 backdrop-blur-sm text-gray-700 hover:text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-white/40 hover:bg-white text-base sm:text-lg font-semibold w-full sm:w-auto"
          >
            ← 練習選択に戻る
          </button>
        </div>
      </div>
    </div>
  );
}