'use client';

import { useState, useEffect } from 'react';
import ContentEditor from '../../components/ContentEditor';

const ADMIN_PASSWORD = 'gorira';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState('create'); // 'create' or 'edit'

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('パスワードが正しくありません');
    }
  };

  // コンテンツ一覧を取得
  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contents');
      if (response.ok) {
        const data = await response.json();
        setContents(data);
      } else {
        setError('コンテンツの取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching contents:', error);
      setError('コンテンツの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // コンテンツを削除
  const deleteContent = async (id) => {
    if (!confirm('このコンテンツを削除しますか？')) return;
    
    try {
      const response = await fetch(`/api/contents/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchContents(); // 一覧を再取得
      } else {
        setError('削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      setError('削除に失敗しました');
    }
  };

  // 新規作成ボタンクリック
  const handleCreate = () => {
    setEditorMode('create');
    setSelectedContent(null);
    setShowEditor(true);
  };

  // 編集ボタンクリック
  const handleEdit = (content) => {
    setEditorMode('edit');
    setSelectedContent(content);
    setShowEditor(true);
  };

  // エディタを閉じる
  const handleCloseEditor = () => {
    setShowEditor(false);
    setSelectedContent(null);
    fetchContents(); // 一覧を再取得
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchContents();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 sm:py-12 pb-safe-area-inset-bottom pb-6">
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

  if (showEditor) {
    return (
      <ContentEditor
        mode={editorMode}
        content={selectedContent}
        onClose={handleCloseEditor}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 pb-safe-area-inset-bottom pb-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          コンテンツ管理画面
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={handleCreate}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            新規作成
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            コンテンツ一覧
          </h2>
          <button
            onClick={fetchContents}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? '読み込み中...' : '更新'}
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">読み込み中...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">タイトル</th>
                  <th className="px-4 py-2 text-left">レベル</th>
                  <th className="px-4 py-2 text-left">問題数</th>
                  <th className="px-4 py-2 text-left">文字数</th>
                  <th className="px-4 py-2 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((content) => (
                  <tr key={content.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-mono text-sm">
                      {content.id}
                    </td>
                    <td className="px-4 py-2 font-medium">
                      <button
                        onClick={() => window.open(`/content/${content.id}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left"
                        title="速読ページを開く"
                      >
                        {content.title}
                      </button>
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
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/content/${content.id}`, '_blank')}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                          title="速読ページを開く"
                        >
                          プレビュー
                        </button>
                        <button
                          onClick={() => handleEdit(content)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => deleteContent(content.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {contents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                コンテンツがありません
              </div>
            )}
          </div>
        )}
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
                {contents.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">レベル別内訳</div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>初級レベル</span>
                  <span>{contents.filter(c => c.levelCode === 'beginner').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>中級レベル</span>
                  <span>{contents.filter(c => c.levelCode === 'intermediate').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>上級レベル</span>
                  <span>{contents.filter(c => c.levelCode === 'advanced').length}</span>
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
              <div className="text-lg font-medium">0.1.0</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">機能</div>
              <ul className="text-sm space-y-1">
                <li>✅ 読解速度測定</li>
                <li>✅ 理解度テスト</li>
                <li>✅ QRコード結果出力</li>
                <li>✅ 3段階レベル対応</li>
                <li>✅ データベース管理</li>
                <li>✅ コンテンツ編集機能</li>
                <li>✅ ルビ（振り仮名）表示機能</li>
              </ul>
              <div className="mt-4">
                <button
                  onClick={() => window.open('/reading', '_blank')}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  🚀 速読練習ページへ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}