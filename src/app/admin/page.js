'use client';

import { useState } from 'react';
import { readingContents } from '../../data/contents';

const ADMIN_PASSWORD = 'suisui2025';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('パスワードが正しくありません');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            管理画面ログイン
          </h1>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="パスワードを入力してください"
              />
            </div>
            
            {error && (
              <div className="mb-4 text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ログイン
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          コンテンツ管理画面
        </h1>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          ログアウト
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          現在のコンテンツ一覧
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">タイトル</th>
                <th className="px-4 py-2 text-left">レベル</th>
                <th className="px-4 py-2 text-left">問題数</th>
                <th className="px-4 py-2 text-left">文字数</th>
              </tr>
            </thead>
            <tbody>
              {readingContents.map((content) => (
                <tr key={content.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-sm">
                    {content.id}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    {content.title}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      content.levelCode === 'beginner' 
                        ? 'bg-blue-100 text-blue-800'
                        : content.levelCode === 'intermediate'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {content.level}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {content.questions.length}問
                  </td>
                  <td className="px-4 py-2">
                    {content.text.length}文字
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            統計情報
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">総コンテンツ数</div>
              <div className="text-2xl font-bold text-blue-600">
                {readingContents.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">レベル別内訳</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>初級修了レベル</span>
                  <span>{readingContents.filter(c => c.levelCode === 'beginner').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>中級レベル</span>
                  <span>{readingContents.filter(c => c.levelCode === 'intermediate').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>上級レベル</span>
                  <span>{readingContents.filter(c => c.levelCode === 'advanced').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            システム情報
          </h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">バージョン</div>
              <div className="text-lg font-medium">すいすいリーダー v1.0</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">機能</div>
              <ul className="text-sm space-y-1">
                <li>✅ 読解速度測定</li>
                <li>✅ 理解度テスト</li>
                <li>✅ QRコード結果出力</li>
                <li>✅ 3段階レベル対応</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          今後の機能追加予定
        </h3>
        <ul className="text-yellow-700 space-y-1">
          <li>• 新しいコンテンツの追加機能</li>
          <li>• 既存コンテンツの編集機能</li>
          <li>• 学習データの分析機能</li>
          <li>• 多言語対応（英語・中国語）</li>
        </ul>
      </div>
    </div>
  );
}