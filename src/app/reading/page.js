'use client';

import { useState } from 'react';
import { readingContents } from '../../data/contents';
import ReadingTest from '../../components/ReadingTest';

export default function Reading() {
  const [selectedContent, setSelectedContent] = useState(null);

  if (selectedContent) {
    return (
      <ReadingTest 
        content={selectedContent} 
        onBack={() => setSelectedContent(null)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        読解練習を選択してください
      </h1>
      
      <div className="space-y-6">
        {readingContents.map((content) => (
          <div 
            key={content.id} 
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {content.title}
                </h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  content.levelCode === 'beginner' 
                    ? 'bg-blue-100 text-blue-800'
                    : content.levelCode === 'intermediate'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {content.level}
                </span>
              </div>
              <button
                onClick={() => setSelectedContent(content)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                開始
              </button>
            </div>
            
            <div className="text-gray-600 mb-4">
              <p className="line-clamp-3">
                {content.text.substring(0, 100)}...
              </p>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>問題数: {content.questions.length}問</span>
              <span>ID: {content.id}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            読解練習の流れ
          </h3>
          <ol className="text-gray-700 space-y-2">
            <li>1. 文章を読みます（時間を測定します）</li>
            <li>2. 理解度確認の質問に答えます</li>
            <li>3. 結果をQRコードで保存できます</li>
          </ol>
        </div>
      </div>
    </div>
  );
}