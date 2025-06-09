'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReadingTest from '../../../components/ReadingTest';
import Link from 'next/link';

export default function ContentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/contents/${id}`);
        
        if (response.ok) {
          const contentData = await response.json();
          setContent(contentData);
        } else if (response.status === 404) {
          setError('コンテンツが見つかりません');
        } else {
          setError('コンテンツの読み込みに失敗しました');
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('コンテンツの読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  // ローディング中
  if (loading) {
    return (
      <div className="relative overflow-hidden min-h-[calc(100vh-6rem)] pb-safe-area-inset-bottom pb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20"></div>
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-6rem)]">
          <div className="text-center">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">コンテンツを読み込み中...</h2>
            <p className="text-gray-600">少々お待ちください</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー時
  if (error) {
    return (
      <div className="relative overflow-hidden min-h-[calc(100vh-6rem)] pb-safe-area-inset-bottom pb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 via-orange-400/20 to-pink-400/20"></div>
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-lg mx-auto px-4">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">{error}</h2>
            <p className="text-gray-600 mb-8">
              指定されたコンテンツは存在しないか、アクセスできません。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/reading"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📚 ライブラリに戻る
              </Link>
              <Link
                href="/"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                🏠 ホームに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 読解練習ライブラリに戻る関数
  const handleBack = () => {
    router.push('/reading');
  };

  // コンテンツが読み込まれた場合、ReadingTestコンポーネントを表示
  if (content) {
    return (
      <ReadingTest 
        content={content} 
        onBack={handleBack}
      />
    );
  }

  return null;
} 