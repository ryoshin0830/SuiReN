'use client';

import { useState, useEffect } from 'react';
import { renderRubyText } from '@/lib/ruby-utils';

export default function About() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await fetch('/api/about');
      if (!response.ok) {
        throw new Error('データの取得に失敗しました');
      }
      const data = await response.json();
      setAboutData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content) => {
    if (!content) return null;

    // 画像プレースホルダーを実際の画像に置換
    const parts = content.split(/(\{\{IMAGE:\d+\}\})/);
    return parts.map((part, index) => {
      const match = part.match(/\{\{IMAGE:(\d+)\}\}/);
      if (match && aboutData?.images) {
        const imageIndex = parseInt(match[1], 10);
        const imageData = aboutData.images[imageIndex];
        if (imageData) {
          // imageDataがオブジェクトの場合はbase64プロパティを、文字列の場合はそのまま使用
          const imageSrc = typeof imageData === 'object' && imageData.base64 
            ? imageData.base64 
            : imageData;
            
          return (
            <img
              key={index}
              src={imageSrc}
              alt={`画像 ${imageIndex + 1}`}
              className="max-w-full h-auto my-4 rounded-lg shadow-lg"
            />
          );
        }
      }
      // テキスト部分をルビ対応でレンダリング
      return (
        <span key={index}>
          {part.split('\n').map((line, lineIndex) => (
            <span key={lineIndex}>
              {renderRubyText(line)}
              {lineIndex < part.split('\n').length - 1 && <br />}
            </span>
          ))}
        </span>
      );
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          このサイトについて
        </h1>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            エラー: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            {aboutData?.content ? (
              <div className="prose prose-lg max-w-none">
                {renderContent(aboutData.content)}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                まだコンテンツが登録されていません。
              </p>
            )}
          </div>
        )}
    </div>
  );
}