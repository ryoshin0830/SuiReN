'use client';

import { useState, useCallback, useEffect } from 'react';
import { getLevelStyle } from '../lib/level-constants';

export default function ContentOrderTable({ contents, levels, onReorder }) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('順番を更新中...');
  const [localContents, setLocalContents] = useState(contents);
  const [hasChanges, setHasChanges] = useState(false);

  const handleDragStart = useCallback((e, content, index) => {
    setDraggedItem({ content, index });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverIndex(null);
  }, []);

  // propsのcontentsが変更されたらlocalContentsを更新
  useEffect(() => {
    setLocalContents(contents);
    setHasChanges(false);
  }, [contents]);

  // ページ離脱時の警告
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges]);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.index === dropIndex) {
      handleDragEnd();
      return;
    }

    const newContents = [...localContents];
    const [removed] = newContents.splice(draggedItem.index, 1);
    newContents.splice(dropIndex, 0, removed);

    // 新しい順番でorderIndexを更新（ローカルのみ）
    const updatedContents = newContents.map((content, index) => {
      const newOrderIndex = (index + 1) * 10;
      return { ...content, orderIndex: newOrderIndex };
    });

    setLocalContents(updatedContents);
    setHasChanges(true);
    handleDragEnd();
  }, [draggedItem, localContents, handleDragEnd]);

  // 変更を保存
  const handleSaveChanges = async () => {
    if (!hasChanges) return;

    const updates = localContents.map((content, index) => ({
      id: content.id,
      orderIndex: (index + 1) * 10
    }));

    // 更新開始
    setIsUpdating(true);
    setUpdateMessage('順番を保存中...');
    
    try {
      console.log('Sending order updates:', updates);
      
      // バッチ更新APIを呼び出す
      const response = await fetch('/api/contents/batch-order', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates })
      });

      if (response.ok) {
        console.log('Order updated successfully');
        onReorder(localContents);
        setHasChanges(false);
      } else {
        const error = await response.text();
        console.error('Failed to update order:', response.status, error);
        alert('順番の更新に失敗しました。');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('エラーが発生しました。');
    } finally {
      setIsUpdating(false);
    }
  };

  // 変更をキャンセル
  const handleCancelChanges = () => {
    setLocalContents(contents);
    setHasChanges(false);
  };

  return (
    <>
      {/* ローディングオーバーレイ */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <p className="text-lg font-semibold text-gray-900">{updateMessage}</p>
                <p className="text-sm text-gray-600">しばらくお待ちください</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 変更がある場合の保存/キャンセルボタン */}
      {hasChanges && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-yellow-800 font-medium">順番が変更されています</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCancelChanges}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSaveChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              変更を保存
            </button>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto relative">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-center text-gray-800 font-semibold w-16">順番</th>
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
          {localContents.map((content, index) => (
            <tr
              key={content.id}
              className={`border-t hover:bg-gray-50 transition-colors ${
                draggedItem?.index === index ? 'opacity-50' : ''
              } ${
                dragOverIndex === index ? 'border-t-4 border-blue-500' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, content, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, index)}
            >
              <td className="px-4 py-2 text-center">
                <span className="cursor-move text-gray-600 hover:text-gray-800 inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  {index + 1}
                </span>
              </td>
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
                    content.labels.map((cl) => (
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
                    ))
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
                    onClick={(e) => {
                      e.preventDefault();
                      // 親コンポーネントの編集ハンドラーを呼び出す
                      const editEvent = new CustomEvent('editContent', { detail: content });
                      window.dispatchEvent(editEvent);
                    }}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('このコンテンツを削除しますか？')) {
                        setIsUpdating(true);
                        setUpdateMessage('コンテンツを削除中...');
                        try {
                          const response = await fetch(`/api/contents/${content.id}`, {
                            method: 'DELETE'
                          });
                          if (response.ok) {
                            window.location.reload();
                          } else {
                            alert('削除に失敗しました');
                            setIsUpdating(false);
                          }
                        } catch (error) {
                          alert('削除中にエラーが発生しました');
                          setIsUpdating(false);
                        }
                      }
                    }}
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
      
      {localContents.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          コンテンツがありません
        </div>
      )}
    </div>
    </>
  );
}