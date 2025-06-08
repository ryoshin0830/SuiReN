'use client';

import { useState, useEffect } from 'react';
import { generateQRCode, createResultData, getQRColor } from '../lib/qr-generator';

export default function ResultDisplay({ content, answers, readingData, onBack, onRetry }) {
  const [qrCode, setQrCode] = useState(null);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    const generateResult = async () => {
      const data = createResultData({
        contentId: content.id,
        contentTitle: content.title,
        answers,
        questions: content.questions,
        readingTime: readingData.readingTime,
        scrollData: readingData.scrollData
      });
      
      setResultData(data);
      
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          読解練習結果
        </h1>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
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
          </div>

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