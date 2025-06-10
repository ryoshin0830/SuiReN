/**
 * ReadingTest.js - 読解テスト実行コンポーネント
 * 
 * 機能:
 * - 読解テストの4段階フロー管理（説明→読書→問題→結果）
 * - 読書時間とスクロール行動の追跡
 * - 複数選択問題の表示と回答管理
 * - リアルタイムの読書データ収集
 * - 結果表示への遷移制御
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReadingTracker } from '../lib/reading-tracker';
import ResultDisplay from './ResultDisplay';
import TextWithImages from './TextWithImages';

/**
 * 読解テストコンポーネント
 * 
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Object} props.content - 読解テストのコンテンツデータ
 * @param {Function} props.onBack - ライブラリ選択画面に戻るコールバック関数
 * @returns {JSX.Element} 読解テスト要素
 */
export default function ReadingTest({ content, onBack }) {
  // ===== 状態管理 =====
  const [phase, setPhase] = useState('instructions'); // テストの進行段階（instructions, reading, questions, results）
  const [answers, setAnswers] = useState([]); // ユーザーの回答配列
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // 現在の問題インデックス（未使用だが将来の機能拡張用）
  const [readingData, setReadingData] = useState(null); // 読書データ（時間・スクロール情報）
  const [scrollProgress, setScrollProgress] = useState(0); // スクロール進捗（0-100%）
  const [focusedParagraph, setFocusedParagraph] = useState(null); // 現在フォーカス中の段落（nullはフォーカスなし）
  const [paragraphTimes, setParagraphTimes] = useState({}); // 段落別累積読書時間（秒）
  const currentFocusStartTime = useRef(null); // 現在フォーカス中の段落の開始時刻
  const trackerRef = useRef(null); // 読書追跡オブジェクトのRef
  const contentRef = useRef(null); // 読書コンテンツのRef
  const paragraphRefs = useRef([]); // 各段落のRef配列
  const scrollTimeoutRef = useRef(null); // スクロール処理のスロットリング用
  const focusedParagraphRef = useRef(null); // 現在フォーカス中の段落のRef（stale closure回避用）
  const timeIntervalRef = useRef(null); // 時間計測用のinterval ID

  // ===== 初期化とクリーンアップ =====
  /**
   * コンポーネントマウント時にReadingTrackerを初期化
   * アンマウント時にトラッキングを停止してリソースをクリーンアップ
   */
  useEffect(() => {
    trackerRef.current = new ReadingTracker();
    
    // 段落数だけRef配列を初期化
    const paragraphCount = content.text.split('\n').filter(p => p.trim()).length;
    paragraphRefs.current = Array(paragraphCount).fill(null).map(() => React.createRef());
    
    return () => {
      if (trackerRef.current) {
        trackerRef.current.stopTracking();
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, [content]);

  // ===== 同期処理 =====
  /**
   * focusedParagraphの変更をrefに同期
   */
  useEffect(() => {
    focusedParagraphRef.current = focusedParagraph;
  }, [focusedParagraph]);

  // ===== 時間計測処理 =====
  /**
   * フォーカス中の段落の時間を追跡
   */
  useEffect(() => {
    if (phase !== 'reading') return;
    
    // 0.1秒ごとに時間を更新
    timeIntervalRef.current = setInterval(() => {
      if (focusedParagraphRef.current !== null) {
        const currentParagraph = focusedParagraphRef.current;
        setParagraphTimes(prev => {
          const newTimes = {
            ...prev,
            [currentParagraph]: (prev[currentParagraph] || 0) + 0.1
          };
          return newTimes;
        });
      }
    }, 100); // 100ms = 0.1秒
    
    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }
    };
  }, [phase]);

  // ===== メインページスクロール制御 =====
  /**
   * 読書フェーズでメインページのスクロールを無効化
   */
  useEffect(() => {
    if (phase === 'reading') {
      // 読書フェーズではメインページのスクロールを無効化
      document.body.style.overflow = 'hidden';
    } else {
      // その他のフェーズではスクロールを有効化
      document.body.style.overflow = 'auto';
    }

    // クリーンアップ
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [phase]);

  // ===== 中央フォーカスシステム =====
  /**
   * Intersection Observerで中央に最も近い段落を追跡
   */
  useEffect(() => {
    if (phase !== 'reading' || !contentRef.current || paragraphRefs.current.length === 0) return;

    // スクロール進捗計算
    const handleScroll = () => {
      const element = contentRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 100));
    };


    const handleScrollChange = () => {
      const container = contentRef.current;
      const containerRect = container.getBoundingClientRect();
      const viewportCenterY = containerRect.top + containerRect.height / 2;
      
      // フォーカスエリアを画面中央の±96px（h-48の半分）に設定
      const focusAreaHeight = 192; // h-48 = 12rem = 192px
      const focusAreaTop = viewportCenterY - focusAreaHeight / 2;
      const focusAreaBottom = viewportCenterY + focusAreaHeight / 2;
      
      let newFocusedParagraph = null; // フォーカスなしの状態も許可
      
      // フォーカスエリアと重なっている段落を見つける
      for (let i = 0; i < paragraphRefs.current.length; i++) {
        const ref = paragraphRefs.current[i];
        if (ref && ref.current) {
          const rect = ref.current.getBoundingClientRect();
          
          // 段落がフォーカスエリアと重なっているかチェック
          const isInFocusArea = rect.bottom > focusAreaTop && rect.top < focusAreaBottom;
          
          if (isInFocusArea) {
            newFocusedParagraph = i;
            console.log(`段落${i + 1}がフォーカスエリアと重複`);
            break; // 最初に見つかった段落をフォーカス
          }
        }
      }
      
      // デバッグ情報
      console.log(`フォーカスエリア: ${Math.round(focusAreaTop)}px - ${Math.round(focusAreaBottom)}px, フォーカス段落: ${newFocusedParagraph !== null ? newFocusedParagraph + 1 : 'なし'}`);
      
      // フォーカスが変わった場合の処理
      if (newFocusedParagraph !== focusedParagraph) {
        // ログ出力
        if (focusedParagraph !== null && paragraphTimes[focusedParagraph]) {
          console.log(`段落${focusedParagraph + 1}フォーカスアウト: 累積${paragraphTimes[focusedParagraph].toFixed(2)}秒`);
        }
        
        // 新しい段落にフォーカス
        if (newFocusedParagraph !== null) {
          console.log(`フォーカス変更: 段落${focusedParagraph !== null ? focusedParagraph + 1 : 'なし'} → 段落${newFocusedParagraph + 1}`);
          setFocusedParagraph(newFocusedParagraph);
          console.log(`段落${newFocusedParagraph + 1}フォーカスイン開始`);
        } else {
          console.log(`フォーカス変更: 段落${focusedParagraph !== null ? focusedParagraph + 1 : 'なし'} → フォーカスなし`);
          setFocusedParagraph(null);
          console.log(`フォーカスアウト（フォーカスエリア外）`);
        }
      }
    };

    // スクロールイベントとフォーカス処理を統合（スロットリング付き）
    let scrollTimeout = null;
    const combinedScrollHandler = () => {
      handleScroll(); // 進捗は即座に更新
      
      // フォーカス処理はスロットリング
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        handleScrollChange();
      }, 50); // 50ms間隔でフォーカス判定
    };

    // スクロールイベントリスナー追加
    const element = contentRef.current;
    element.addEventListener('scroll', combinedScrollHandler);
    
    // 初期フォーカス設定（読書開始時のみ時刻を記録）
    if (phase === 'reading') {
      handleScrollChange();
      // フォーカス時刻は読書開始時にstartReading()で設定される
    }
    
    return () => {
      element.removeEventListener('scroll', combinedScrollHandler);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [phase]);

  // ===== イベントハンドラー =====
  /**
   * 読書開始ボタンクリック時の処理
   * 読書フェーズに移行し、読書追跡を開始
   */
  const startReading = () => {
    setPhase('reading');
    setScrollProgress(0);
    setFocusedParagraph(null); // 最初はフォーカスなし
    setParagraphTimes({});
    
    // 次のフレームでスクロール要素が利用可能になってからトラッキングを開始
    setTimeout(() => {
      if (contentRef.current) {
        trackerRef.current.startTracking(contentRef.current);
        currentFocusStartTime.current = null;
        console.log('読書開始：フォーカスなし状態でスタート');
      }
    }, 100);
  };

  /**
   * 読書完了ボタンクリック時の処理
   * 読書追跡を停止し、データを収集して問題フェーズに移行
   * 問題がない場合は直接結果フェーズに移行
   */
  const finishReading = () => {
    // 時間計測を停止
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }
    
    // 最終的な段落別時間をログ出力
    console.log('=== 最終段落別読書時間 ===');
    const paragraphCount = content.text.split('\n').filter(p => p.trim()).length;
    for (let i = 0; i < paragraphCount; i++) {
      const time = paragraphTimes[i] || 0;
      console.log(`段落${i + 1}: ${time.toFixed(2)}秒 ${time === 0 ? '(未表示)' : ''}`);
    }
    
    trackerRef.current.stopTracking();
    const readingTime = trackerRef.current.getReadingTime();
    const scrollData = trackerRef.current.getScrollData();
    
    // 読書データを状態に保存（段落別時間を含む）
    setReadingData({
      readingTime,
      scrollData: {
        ...scrollData,
        paragraphTimes: paragraphTimes
      }
    });
    
    // 問題がない場合は直接結果フェーズに移行
    if (!content.questions || content.questions.length === 0) {
      setAnswers([]); // 空の回答配列
      setPhase('results');
      // 結果表示に移行する際はページの上部にスクロール
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    } else {
      setPhase('questions');
      // 回答配列を初期化（全てnullで埋める）
      setAnswers(new Array(content.questions.length).fill(null));
      // 問題フェーズに移行する際もページの上部にスクロール
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    }
  };

  /**
   * 問題の回答選択時の処理
   * 
   * @param {number} questionIndex - 問題のインデックス
   * @param {number} answerIndex - 選択された回答のインデックス
   */
  const handleAnswer = (questionIndex, answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  /**
   * 回答送信ボタンクリック時の処理
   * 結果表示フェーズに移行
   */
  const submitAnswers = () => {
    setPhase('results');
    // 結果表示に移行する際はページの上部にスクロール
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);
  };

  // ===== 計算されたプロパティ =====
  /**
   * 全ての問題が回答されているかチェック
   * 問題がない場合は常にtrue
   */
  const allQuestionsAnswered = !content.questions || content.questions.length === 0 || answers.every(answer => answer !== null);

  // ===== 条件付きレンダリング =====
  /**
   * 結果表示フェーズの場合、ResultDisplayコンポーネントを表示
   */
  if (phase === 'results') {
    return (
      <ResultDisplay
        content={content}
        answers={answers}
        readingData={readingData}
        onBack={onBack}
        onRetry={() => {
          // テストをリセットして最初からやり直し
          setPhase('instructions');
          setAnswers([]);
          setCurrentQuestionIndex(0);
          setReadingData(null);
          setScrollProgress(0);
          setFocusedParagraph(null);
          setParagraphTimes({});
          currentFocusStartTime.current = null;
          if (timeIntervalRef.current) {
            clearInterval(timeIntervalRef.current);
            timeIntervalRef.current = null;
          }
          trackerRef.current.reset();
          // やり直し時もページの上部にスクロール
          setTimeout(() => {
            window.scrollTo(0, 0);
          }, 0);
        }}
      />
    );
  }

  // ===== メインUIレンダリング =====
  return (
    <div className={phase === 'reading' ? '' : 'max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-safe-area-inset-bottom pb-6'}>
      {/* ===== 説明フェーズ ===== */}
      {phase === 'instructions' && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8">
          {/* 戻るボタン（上部配置） */}
          <div className="mb-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center"
            >
              ← 練習選択に戻る
            </button>
          </div>
          
          {/* コンテンツタイトル */}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            {content.title} - {content.level}
          </h1>
          
          {/* 進め方説明ボックス */}
          <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4">
              読解練習の進め方
            </h2>
            {/* ステップバイステップの説明 */}
            <ol className="text-blue-700 space-y-1 sm:space-y-2 text-sm sm:text-base">
              <li>1. 「読書開始」ボタンを押して文章を読んでください</li>
              <li>2. 読み終わったら「読書完了」ボタンを押してください</li>
              <li>3. 理解度確認の質問に答えてください</li>
              <li>4. 結果が表示されます</li>
            </ol>
          </div>
          
          {/* 読書開始ボタン */}
          <div className="text-center">
            <button
              onClick={startReading}
              className="bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              読書開始
            </button>
          </div>
        </div>
      )}

      {/* ===== 読書フェーズ ===== */}
      {phase === 'reading' && (
        <div className="h-[100dvh] flex flex-col">
          {/* 上部ヘッダー（画面上部に完全固定） */}
          <div className="bg-white shadow-md p-2 sm:p-4 border-b flex-shrink-0 pt-safe-area-inset-top">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              {/* 戻るボタン */}
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center text-sm sm:text-base"
              >
                ← 練習選択に戻る
              </button>
              
              {/* タイトル */}
              <h1 className="text-sm sm:text-lg font-bold text-gray-900 text-center">
                {content.title}
              </h1>
              
              {/* フォーカス情報と進捗表示 */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${focusedParagraph !== null ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className={`text-xs sm:text-sm font-medium ${focusedParagraph !== null ? 'text-blue-600' : 'text-gray-500'}`}>
                    {focusedParagraph !== null ? `段落 ${focusedParagraph + 1}` : 'フォーカスなし'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs sm:text-sm text-gray-600">進捗:</span>
                  <div className="w-16 sm:w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${scrollProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600 w-8 sm:w-12">
                    {Math.round(scrollProgress)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          
          {/* 読書コンテンツエリア（フルスクリーン） */}
          <div 
            ref={contentRef}
            className="flex-1 overflow-y-auto bg-white px-4 sm:px-8 py-4 sm:py-6 pb-safe-area-inset-bottom relative"
          >
            
            <div className="max-w-4xl mx-auto relative">
              {/* 段落分割されたテキスト表示 */}
              <div className="space-y-8">
                {/* 段落1の前の大きな空白エリア（段落1を画面中央に持ってくるため） */}
                <div className="h-96 flex items-center justify-center">
                  <div className="text-gray-300 text-sm">
                    ↓ スクロールして読書を開始してください ↓
                  </div>
                </div>
                {content.text.split('\n').filter(paragraph => paragraph.trim()).map((paragraph, index) => {
                  const isFocused = focusedParagraph !== null && index === focusedParagraph;
                  const totalParagraphs = content.text.split('\n').filter(p => p.trim()).length;
                  const isFirst = index === 0;
                  const isLast = index === totalParagraphs - 1;
                  
                  // フォーカス状態に応じたスタイル計算
                  let blurClass = '';
                  let opacityClass = '';
                  let scaleClass = '';
                  
                  if (isFocused) {
                    blurClass = '';
                    opacityClass = 'opacity-100';
                    scaleClass = 'scale-100';
                  } else {
                    blurClass = 'blur-[4px]';
                    opacityClass = 'opacity-30';
                    scaleClass = 'scale-95';
                  }
                  
                  return (
                    <div 
                      key={index}
                      ref={paragraphRefs.current[index]}
                      className={`paragraph-block p-6 rounded-lg transition-all duration-700 ease-in-out transform relative ${opacityClass} ${blurClass} ${scaleClass}`}
                      data-paragraph-index={index}
                      style={{
                        backgroundColor: isFocused ? '#f0f9ff' : 'transparent',
                        border: isFocused ? '3px solid #3b82f6' : '1px solid transparent',
                        boxShadow: isFocused ? '0 20px 40px rgba(59, 130, 246, 0.2)' : 'none',
                        filter: !isFocused ? 'blur(4px) grayscale(30%)' : 'none'
                      }}
                    >
                      <TextWithImages 
                        text={paragraph} 
                        images={content.images || []} 
                      />
                      
                      {/* フォーカスインジケーター */}
                      {isFocused && (
                        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-r-full animate-pulse shadow-lg"></div>
                        </div>
                      )}
                      
                      {/* 段落番号表示 */}
                      <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                        isFocused 
                          ? 'bg-blue-500 text-white shadow-lg scale-110' 
                          : 'bg-gray-400 text-white scale-90'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                  );
                })}
                
                {/* 最後の段落の後の大きな空白エリア（最後の段落を画面中央に持ってくるため） */}
                <div className="h-96 flex items-center justify-center">
                  <div className="text-gray-300 text-sm">
                    ↓ 下にスクロールして読書完了ボタンへ ↓
                  </div>
                </div>
              </div>
              
              {/* 読書完了ボタン（文章の最後に配置） */}
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t-2 border-gray-300 bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="text-center">
                  <p className="text-gray-700 mb-3 sm:mb-4 text-base sm:text-lg">📖 文章を読み終わりましたか？</p>
                  <p className="text-gray-500 mb-4 sm:mb-6 text-xs sm:text-sm">下のボタンを押して問題に進んでください</p>
                  <button
                    onClick={finishReading}
                    className="bg-green-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg text-lg sm:text-xl font-bold hover:bg-green-700 transition-colors shadow-xl border-2 border-green-700 w-full sm:w-auto"
                  >
                    ✅ 読書完了
                  </button>
                </div>
              </div>
              
              {/* 追加の余白（スクロール確認用） */}
              <div className="h-20"></div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 問題フェーズ ===== */}
      {phase === 'questions' && content.questions && content.questions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8">
          {/* 戻るボタン（上部配置） */}
          <div className="mb-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center"
            >
              ← 練習選択に戻る
            </button>
          </div>
          
          {/* ヘッダー - タイトルと読書時間表示 */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              理解度確認
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              読書時間: {readingData.readingTime}秒
            </p>
          </div>
          
          {/* 問題一覧表示 */}
          <div className="space-y-6 sm:space-y-8">
            {content.questions.map((question, questionIndex) => (
              <div key={question.id} className="border-b border-gray-200 pb-4 sm:pb-6">
                {/* 問題文 */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  問題 {questionIndex + 1}: {question.question}
                </h3>
                
                {/* 選択肢一覧 */}
                <div className="space-y-1">
                  {question.options.map((option, optionIndex) => (
                    <label 
                      key={optionIndex}
                      className="flex items-start p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      {/* ラジオボタン */}
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={optionIndex}
                        checked={answers[questionIndex] === optionIndex}
                        onChange={() => handleAnswer(questionIndex, optionIndex)}
                        className="mr-3 mt-1 text-blue-600 flex-shrink-0"
                      />
                      {/* 選択肢テキスト */}
                      <span className="text-sm sm:text-base text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* 回答送信ボタン */}
          <div className="mt-6 sm:mt-8 text-center">
            <button
              onClick={submitAnswers}
              disabled={!allQuestionsAnswered}
              className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold transition-colors w-full sm:w-auto ${
                allQuestionsAnswered
                  ? 'bg-blue-600 text-white hover:bg-blue-700' // 全問回答済み
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed' // 未回答あり
              }`}
            >
              回答を送信
            </button>
          </div>
        </div>
      )}
    </div>
  );
}