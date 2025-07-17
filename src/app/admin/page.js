'use client';

import { useState, useEffect } from 'react';
import ContentEditor from '../../components/ContentEditor';
import LevelManager from '../../components/LevelManager';
import AboutPageEditor from '../../components/AboutPageEditor';
import LabelManager from '../../components/LabelManager';
import ContentOrderTable from '../../components/ContentOrderTable';
import { 
  LEVEL_CODES, 
  getLevelDisplayName,
  getLevelStyle 
} from '../../lib/level-constants';
import { useLevels } from '../../hooks/useLevels';

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
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [excelUploadLoading, setExcelUploadLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [activeTab, setActiveTab] = useState('contents'); // 'contents', 'levels', 'labels', or 'about'
  const [contentLevelTab, setContentLevelTab] = useState('all'); // 'all' or level id
  const [orderChanging, setOrderChanging] = useState(false);
  const { levels, loading: levelsLoading } = useLevels();

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
        console.log('Fetched contents:', data); // デバッグ用
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

  // コンテンツの順番を変更
  const handleOrderChange = async (contentId, direction) => {
    setOrderChanging(true);
    try {
      const response = await fetch(`/api/contents/${contentId}/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction, levelCode: contentLevelTab })
      });

      if (response.ok) {
        await fetchContents(); // 一覧を再取得
      } else {
        setError('順番の変更に失敗しました');
      }
    } catch (error) {
      console.error('Error changing order:', error);
      setError('順番の変更に失敗しました');
    } finally {
      setOrderChanging(false);
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
    setExcelData(null);
    fetchContents(); // 一覧を再取得
  };

  // Excelテンプレートをダウンロード
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/excel/template');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'speed_reading_template.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        setError('テンプレートのダウンロードに失敗しました');
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      setError('テンプレートのダウンロードに失敗しました');
    }
  };

  // Excelファイルをアップロード
  const handleExcelUpload = async (file) => {
    console.log('Starting Excel upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    setExcelUploadLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Sending request to /api/excel/upload');
      const response = await fetch('/api/excel/upload', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status, response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Upload result:', result);
        
        if (result.success) {
          // 警告メッセージがある場合は表示
          if (result.warnings && result.warnings.notFoundLabels) {
            alert(`⚠️ 警告\n\n${result.warnings.message}\n\n管理画面の「ラベル管理」タブで事前にラベルを作成してください。`);
          }
          
          // Excelからインポートしたデータをセット
          setExcelData(result.data);
          setEditorMode('create');
          setShowExcelUpload(false);
          setShowEditor(true);
          console.log('Excel data imported successfully');
        } else {
          setError(result.error || 'アップロードに失敗しました');
        }
      } else {
        let errorMessage = 'アップロードに失敗しました';
        try {
          const errorText = await response.text();
          console.error('Excel upload error response:', errorText);
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
            if (errorData.details) {
              errorMessage += ': ' + errorData.details;
            }
          } catch (parseError) {
            console.error('Failed to parse error as JSON:', parseError);
            errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (e) {
          console.error('Failed to read error response:', e);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error uploading Excel:', error);
      setError('ファイルのアップロード中にエラーが発生しました: ' + error.message);
    } finally {
      setExcelUploadLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchContents();
    }
  }, [isAuthenticated]);

  // ContentOrderTableからの編集イベントを受け取る
  useEffect(() => {
    const handleEditContent = (e) => {
      handleEdit(e.detail);
    };
    
    window.addEventListener('editContent', handleEditContent);
    return () => {
      window.removeEventListener('editContent', handleEditContent);
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 sm:py-12 pb-safe-area-inset-bottom pb-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            管理画面ログイン
          </h1>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-800 text-sm font-bold mb-2">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 placeholder-gray-500"
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
        excelData={excelData}
        onClose={handleCloseEditor}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 pb-safe-area-inset-bottom pb-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          管理画面
        </h1>
        <div className="flex flex-wrap gap-4">
          {activeTab === 'contents' && (
            <>
              <button
                onClick={handleCreate}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                新規作成
              </button>
              <button
                onClick={() => setShowExcelUpload(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Excelで作成
              </button>
            </>
          )}
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </div>

      {/* タブ切り替え */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('contents')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            コンテンツ管理
          </button>
          <button
            onClick={() => setActiveTab('levels')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'levels'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            レベル管理
          </button>
          <button
            onClick={() => setActiveTab('labels')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'labels'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ラベル管理
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'about'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            このサイトについて
          </button>
        </nav>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {/* コンテンツ管理タブ */}
      {activeTab === 'contents' && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* レベル別タブ */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200">
            <button
              onClick={() => setContentLevelTab('all')}
              className={`px-4 py-2 font-medium transition-all ${
                contentLevelTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              すべて ({contents.length})
            </button>
            {levels.map((level) => {
              const count = contents.filter(c => c.levelCode === level.id).length;
              return (
                <button
                  key={level.id}
                  onClick={() => setContentLevelTab(level.id)}
                  className={`px-4 py-2 font-medium transition-all ${
                    contentLevelTab === level.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {level.displayName} ({count})
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {contentLevelTab === 'all' ? 'すべてのコンテンツ' : 
             levels.find(l => l.id === contentLevelTab)?.displayName + 'のコンテンツ'}
          </h2>
          <button
            onClick={fetchContents}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
          >
            {loading ? '読み込み中...' : '更新'}
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">読み込み中...</div>
          </div>
        ) : contentLevelTab !== 'all' ? (
          <ContentOrderTable
            contents={contents
              .filter(content => content.levelCode === contentLevelTab)
              .sort((a, b) => (a.orderIndex || 999999) - (b.orderIndex || 999999))}
            levels={levels}
            onReorder={(newContents) => {
              // 並び替え後の新しいコンテンツリストでstateを更新
              const updatedContents = contents.map(c => {
                const newContent = newContents.find(nc => nc.id === c.id);
                if (newContent) {
                  return { ...c, orderIndex: newContent.orderIndex };
                }
                return c;
              });
              setContents(updatedContents);
              console.log('Contents state updated with new order');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-gray-800 font-semibold">ID</th>
                  <th className="px-4 py-2 text-left text-gray-800 font-semibold">タイトル</th>
                  <th className="px-4 py-2 text-left text-gray-800 font-semibold">レベル</th>
                  <th className="px-4 py-2 text-left text-gray-800 font-semibold">ラベル</th>
                  <th className="px-4 py-2 text-left text-gray-800 font-semibold">問題数</th>
                  <th className="px-4 py-2 text-left text-gray-800 font-semibold">語数</th>
                  <th className="px-4 py-2 text-left text-gray-800 font-semibold">文字数</th>
                  <th className="px-4 py-2 text-left text-gray-800 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {contents
                  .sort((a, b) => {
                    // まずレベルでソート、次にorderIndexでソート
                    if (a.levelCode !== b.levelCode) {
                      const levelA = levels.find(l => l.id === a.levelCode);
                      const levelB = levels.find(l => l.id === b.levelCode);
                      return (levelA?.orderIndex || 0) - (levelB?.orderIndex || 0);
                    }
                    return (a.orderIndex || 999999) - (b.orderIndex || 999999);
                  })
                  .map((content) => (
                    <tr key={content.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-sm text-gray-800">
                      {content.id}
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-800">
                      <button
                        onClick={() => window.open(`/content/${content.id}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left"
                        title="読み物ページを開く"
                      >
                        {content.title}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${getLevelStyle(content.levelCode)}`}>
                        {content.level}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {content.labels && content.labels.length > 0 ? (
                          content.labels.map((cl) => {
                            console.log('Label data:', cl); // デバッグ用
                            return (
                              <span
                                key={cl.label?.id || cl.labelId}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: (cl.label?.color || '#6366f1') + '20',
                                  color: cl.label?.color || '#6366f1',
                                  border: `1px solid ${(cl.label?.color || '#6366f1')}40`
                                }}
                              >
                                {cl.label?.name || 'Unknown'}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-800">
                      {content.questions?.length || 0}問
                    </td>
                    <td className="px-4 py-2 text-gray-800">
                      {content.wordCount ? `${content.wordCount}語` : '-'}
                    </td>
                    <td className="px-4 py-2 text-gray-800">
                      {content.characterCount ? `${content.characterCount}文字` : `${content.text?.length || 0}文字`}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(`/content/${content.id}`, '_blank')}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                          title="読み物ページを開く"
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
              <div className="text-center py-8 text-gray-600">
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
                <div className="flex justify-between text-gray-800">
                  <span>{getLevelDisplayName(LEVEL_CODES.BEGINNER)}</span>
                  <span>{contents.filter(c => c.levelCode === LEVEL_CODES.BEGINNER).length}</span>
                </div>
                <div className="flex justify-between text-gray-800">
                  <span>{getLevelDisplayName(LEVEL_CODES.INTERMEDIATE)}</span>
                  <span>{contents.filter(c => c.levelCode === LEVEL_CODES.INTERMEDIATE).length}</span>
                </div>
                <div className="flex justify-between text-gray-800">
                  <span>{getLevelDisplayName(LEVEL_CODES.ADVANCED)}</span>
                  <span>{contents.filter(c => c.levelCode === LEVEL_CODES.ADVANCED).length}</span>
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
              <div className="text-lg font-medium text-gray-800">0.1.2</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">機能</div>
              <ul className="text-sm space-y-1 text-gray-800">
                <li>✅ 読み物の速度測定</li>
                <li>✅ 理解度テスト</li>
                <li>✅ QRコード結果出力</li>
                <li>✅ 3段階レベル対応</li>
                <li>✅ データベース管理</li>
                <li>✅ コンテンツ編集機能</li>
                <li>✅ ルビ（振り仮名）表示機能</li>
              </ul>
            </div>
          </div>
        </div>
          </div>
        </>
      )}

      {/* レベル管理タブ */}
      {activeTab === 'levels' && (
        <LevelManager />
      )}

      {/* ラベル管理タブ */}
      {activeTab === 'labels' && (
        <LabelManager />
      )}

      {/* このサイトについてタブ */}
      {activeTab === 'about' && (
        <AboutPageEditor />
      )}

      {/* Excel Upload Modal */}
      {showExcelUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Excelでコンテンツ作成</h3>
              <button
                onClick={() => setShowExcelUpload(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left column - Template Download */}
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-800 mb-3">📥 1. テンプレートのダウンロード</h4>
                  <p className="text-sm text-green-700 mb-4">
                    まず、コンテンツ作成用のExcelテンプレートをダウンロードしてください。
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    📊 テンプレートダウンロード
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3">📝 2. テンプレートの入力</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 「コンテンツ」シートに基本情報を入力</li>
                    <li>• 「問題」シートに理解度確認問題を入力</li>
                    <li>• 項目列に対応する入力内容列に記入</li>
                    <li>• 詳細は「使用方法」シートを確認</li>
                  </ul>
                </div>
              </div>

              {/* Right column - Upload */}
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-800 mb-3">📤 3. ファイルのアップロード</h4>
                  <p className="text-sm text-purple-700 mb-4">
                    入力済みのExcelファイルをアップロードしてください。
                  </p>
                  
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          console.log('File selected:', {
                            name: e.target.files[0].name,
                            size: e.target.files[0].size,
                            type: e.target.files[0].type
                          });
                          handleExcelUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="excel-upload"
                      disabled={excelUploadLoading}
                    />
                    <label
                      htmlFor="excel-upload"
                      className={`inline-flex flex-col items-center cursor-pointer ${
                        excelUploadLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="text-4xl mb-3">📊</div>
                      <div className="text-sm font-semibold text-purple-700 mb-2">
                        {excelUploadLoading ? 'アップロード中...' : 'Excelファイルを選択'}
                      </div>
                      <div className="text-xs text-purple-500 mb-3">
                        または、ここにファイルをドラッグ＆ドロップ
                      </div>
                      <div className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                        ファイルを選択
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ 注意事項</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• 対応形式: .xlsx, .xls</li>
                    <li>• テンプレート形式に従って入力してください</li>
                    <li>• 画像はアップロード後に編集画面で追加します</li>
                    <li>• ルビ記法: ｜漢字《かんじ》または漢字《かんじ》</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowExcelUpload(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}