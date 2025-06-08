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

import { useState, useEffect, useRef } from 'react';
import { ReadingTracker } from '../lib/reading-tracker';
import ResultDisplay from './ResultDisplay';

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
  const trackerRef = useRef(null); // 読書追跡オブジェクトのRef

  // ===== 初期化とクリーンアップ =====
  /**
   * コンポーネントマウント時にReadingTrackerを初期化
   * アンマウント時にトラッキングを停止してリソースをクリーンアップ
   */
  useEffect(() => {
    trackerRef.current = new ReadingTracker();
    return () => {
      if (trackerRef.current) {
        trackerRef.current.stopTracking();
      }
    };
  }, []);

  // ===== イベントハンドラー =====
  /**
   * 読書開始ボタンクリック時の処理
   * 読書フェーズに移行し、読書追跡を開始
   */
  const startReading = () => {
    setPhase('reading');
    trackerRef.current.startTracking();
  };

  /**
   * 読書完了ボタンクリック時の処理
   * 読書追跡を停止し、データを収集して問題フェーズに移行
   */
  const finishReading = () => {
    trackerRef.current.stopTracking();
    const readingTime = trackerRef.current.getReadingTime();
    const scrollData = trackerRef.current.getScrollData();
    
    // 読書データを状態に保存
    setReadingData({
      readingTime,
      scrollData
    });
    
    setPhase('questions');
    // 回答配列を初期化（全てnullで埋める）
    setAnswers(new Array(content.questions.length).fill(null));
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
  };

  // ===== 計算されたプロパティ =====
  /**
   * 全ての問題が回答されているかチェック
   */
  const allQuestionsAnswered = answers.every(answer => answer !== null);

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
          trackerRef.current.reset();
        }}
      />
    );
  }

  // ===== メインUIレンダリング =====
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ===== 説明フェーズ ===== */}
      {phase === 'instructions' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* コンテンツタイトル */}
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {content.title} - {content.level}
          </h1>
          
          {/* 進め方説明ボックス */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              読解練習の進め方
            </h2>
            {/* ステップバイステップの説明 */}
            <ol className="text-blue-700 space-y-2">
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
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              読書開始
            </button>
          </div>
        </div>
      )}

      {/* ===== 読書フェーズ ===== */}
      {phase === 'reading' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* ヘッダー - タイトルと完了ボタン */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {content.title}
            </h1>
            {/* 読書完了ボタン */}
            <button
              onClick={finishReading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              読書完了
            </button>
          </div>
          
          {/* 読書テキスト表示エリア */}
          <div className="prose max-w-none">
            <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-line">
              {content.text}
            </div>
          </div>
        </div>
      )}

      {/* ===== 問題フェーズ ===== */}
      {phase === 'questions' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* ヘッダー - タイトルと読書時間表示 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              理解度確認
            </h1>
            <p className="text-gray-600">
              読書時間: {readingData.readingTime}秒
            </p>
          </div>
          
          {/* 問題一覧表示 */}
          <div className="space-y-8">
            {content.questions.map((question, questionIndex) => (
              <div key={question.id} className="border-b border-gray-200 pb-6">
                {/* 問題文 */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  問題 {questionIndex + 1}: {question.question}
                </h3>
                
                {/* 選択肢一覧 */}
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label 
                      key={optionIndex}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      {/* ラジオボタン */}
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={optionIndex}
                        checked={answers[questionIndex] === optionIndex}
                        onChange={() => handleAnswer(questionIndex, optionIndex)}
                        className="mr-3 text-blue-600"
                      />
                      {/* 選択肢テキスト */}
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* 回答送信ボタン */}
          <div className="mt-8 text-center">
            <button
              onClick={submitAnswers}
              disabled={!allQuestionsAnswered}
              className={`px-8 py-3 rounded-lg text-lg font-semibold transition-colors ${
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

      {/* ===== 戻るボタン ===== */}
      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← 練習選択に戻る
        </button>
      </div>
    </div>
  );
}