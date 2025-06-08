'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function ResultPage({ params }) {
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadResult = async () => {
      try {
        // URLパラメータからBase64エンコードされた結果データを取得
        let encoded = params.id;
        console.log('受信したパラメータ:', encoded);
        
        // URLサフェなBase64を標準Base64に戻す
        encoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
        while (encoded.length % 4) {
          encoded += '=';
        }
        
        const binary = atob(encoded);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const decoded = new TextDecoder().decode(bytes);
        const minimalData = JSON.parse(decoded);
        
        console.log('QRコードから取得した最小データ:', minimalData);
        
        // 最小データから詳細データを復元
        await reconstructDetailedData(minimalData);
        
      } catch (error) {
        console.error('結果データの読み込みに失敗:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    const reconstructDetailedData = async (minimalData) => {
      try {
        // コンテンツ情報をAPIから取得
        const response = await fetch(`/api/contents/${minimalData.contentId}`);
        if (!response.ok) throw new Error('コンテンツ取得失敗');
        
        const content = await response.json();
        console.log('取得したコンテンツ:', content);
        
        // 詳細データを復元
        const detailedData = reconstructFromMinimal(minimalData, content);
        setResultData(detailedData);
        
      } catch (error) {
        console.error('詳細データの復元に失敗:', error);
        // フォールバック：最小データのみで表示
        setResultData({
          contentId: minimalData.contentId,
          contentTitle: '取得できませんでした',
          answers: minimalData.answers,
          timestamp: minimalData.timestamp,
          accuracy: null,
          questionResults: []
        });
      }
    };

    const reconstructFromMinimal = (minimalData, content) => {
      if (!content.questions || content.questions.length === 0) {
        return {
          contentId: minimalData.contentId,
          contentTitle: content.title,
          accuracy: null,
          correctAnswers: 0,
          totalQuestions: 0,
          answers: [],
          questionResults: [],
          timestamp: minimalData.timestamp
        };
      }

      const answers = minimalData.answers;
      const correctAnswers = answers.filter((answer, index) => 
        answer === content.questions[index].correctAnswer
      ).length;
      
      const accuracy = Math.round((correctAnswers / content.questions.length) * 100);
      
      const questionResults = content.questions.map((question, index) => ({
        questionId: question.id,
        question: question.question,
        options: question.options,
        userAnswerIndex: answers[index],
        correctAnswerIndex: question.correctAnswer,
        userAnswer: question.options[answers[index]] || '未回答',
        correctAnswer: question.options[question.correctAnswer],
        isCorrect: answers[index] === question.correctAnswer,
        explanation: question.explanation || null
      }));
      
      return {
        contentId: minimalData.contentId,
        contentTitle: content.title,
        accuracy,
        correctAnswers,
        totalQuestions: content.questions.length,
        answers,
        questionResults,
        timestamp: minimalData.timestamp
      };
    };

    loadResult();
  }, [params.id]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(resultData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('コピーに失敗:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-gray-50 pb-safe-area-inset-bottom pb-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">結果を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!resultData) {
    notFound();
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-white pb-safe-area-inset-bottom pb-6">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        
        {/* ヘッダー */}
        <div className="border-b pb-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">読解練習結果</h1>
          <p className="text-gray-600">{resultData.contentTitle}</p>
        </div>

        {/* 基本結果 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {resultData.accuracy !== null && (
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">正解率</div>
              <div className="text-2xl font-bold text-green-600">{resultData.accuracy}%</div>
              <div className="text-xs text-gray-500">{resultData.correctAnswers}/{resultData.totalQuestions}問正解</div>
            </div>
          )}
          
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">実施日時</div>
            <div className="text-lg font-medium text-gray-900">
              {new Date(resultData.timestamp).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* 問題別結果 */}
        {resultData.questionResults && resultData.questionResults.length > 0 && (
          <div className="border rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">問題別結果</h2>
            <div className="space-y-6">
              {resultData.questionResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-gray-900 flex-1">
                      問題 {index + 1}: {result.question}
                    </h3>
                    <span className={`px-3 py-1 rounded text-sm ${
                      result.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.isCorrect ? '正解' : '不正解'}
                    </span>
                  </div>
                  
                  {/* 選択肢を表示 */}
                  {result.options && (
                    <div className="space-y-2 mb-4">
                      {result.options.map((option, optionIndex) => {
                        const isUserAnswer = result.userAnswerIndex === optionIndex;
                        const isCorrectAnswer = result.correctAnswerIndex === optionIndex;
                        
                        let className = 'p-3 rounded border';
                        if (isCorrectAnswer) {
                          className += ' bg-green-50 border-green-200';
                        } else if (isUserAnswer && !isCorrectAnswer) {
                          className += ' bg-red-50 border-red-200';
                        } else {
                          className += ' bg-gray-50 border-gray-200';
                        }
                        
                        return (
                          <div key={optionIndex} className={className}>
                            <div className="flex items-center justify-between">
                              <span className="flex-1">{optionIndex + 1}. {option}</span>
                              <div className="flex space-x-2">
                                {isUserAnswer && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    あなたの回答
                                  </span>
                                )}
                                {isCorrectAnswer && (
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
                  )}

                  {/* 解説があれば表示 */}
                  {result.explanation && result.explanation.trim() && (
                    <div className="p-4 bg-yellow-50 rounded border-l-4 border-yellow-400">
                      <h4 className="font-medium text-gray-900 mb-2">解説</h4>
                      <div className="text-gray-700 whitespace-pre-wrap text-sm">
                        {result.explanation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}


        {/* JSONデータ */}
        <div className="border rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">データ（JSON形式）</h2>
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                copied 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              {copied ? 'コピー済み' : 'JSONをコピー'}
            </button>
          </div>
          <pre className="bg-gray-50 border rounded p-4 text-sm overflow-x-auto text-gray-800">
            {JSON.stringify(resultData, null, 2)}
          </pre>
        </div>

        {/* フッター */}
        <div className="text-center">
          <Link 
            href="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors inline-block"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}