'use client';

import { useState, useEffect } from 'react';
import { useLevels } from '../hooks/useLevels';

export default function LevelManager() {
  const { levels, loading, error, refetch } = useLevels();
  const [editingLevel, setEditingLevel] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [targetLevelId, setTargetLevelId] = useState('');
  const [saving, setSaving] = useState(false);

  // 新規レベル用のフォームデータ
  const [newLevel, setNewLevel] = useState({
    id: '',
    displayName: '',
    orderIndex: levels.length + 1
  });

  // レベルを更新した時に順序を再計算
  useEffect(() => {
    if (levels.length > 0) {
      setNewLevel(prev => ({ ...prev, orderIndex: levels.length + 1 }));
    }
  }, [levels]);

  // レベルの表示名を編集
  const handleEditDisplayName = async (levelId, newDisplayName) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/levels/${levelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: newDisplayName })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '更新に失敗しました');
      }

      await refetch();
      setEditingLevel(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // レベルの順序を変更
  const handleOrderChange = async (levelId, direction) => {
    const currentIndex = levels.findIndex(l => l.id === levelId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= levels.length) return;

    setSaving(true);
    try {
      // 2つのレベルの順序を入れ替え
      const currentLevel = levels[currentIndex];
      const targetLevel = levels[targetIndex];

      await Promise.all([
        fetch(`/api/levels/${currentLevel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderIndex: targetLevel.orderIndex })
        }),
        fetch(`/api/levels/${targetLevel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderIndex: currentLevel.orderIndex })
        })
      ]);

      await refetch();
    } catch (error) {
      alert('順序の変更に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // 新規レベルの追加
  const handleAddLevel = async () => {
    if (!newLevel.id || !newLevel.displayName) {
      alert('レベルIDと表示名を入力してください');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLevel)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '作成に失敗しました');
      }

      await refetch();
      setShowAddModal(false);
      setNewLevel({
        id: '',
        displayName: '',
        orderIndex: levels.length + 2
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // レベルの削除
  const handleDeleteLevel = async () => {
    if (!targetLevelId) {
      alert('移行先レベルを選択してください');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/levels/${showDeleteModal.id}?targetLevelId=${targetLevelId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '削除に失敗しました');
      }

      await refetch();
      setShowDeleteModal(null);
      setTargetLevelId('');
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // デフォルトレベルの設定
  const handleSetDefault = async (levelId) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/levels/${levelId}/set-default`, {
        method: 'PUT'
      });

      if (!response.ok) {
        throw new Error('デフォルトレベルの設定に失敗しました');
      }

      await refetch();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">エラー: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">レベル管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          disabled={saving}
        >
          新規レベル追加
        </button>
      </div>

      {/* レベル一覧 */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">順序</th>
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">レベルID</th>
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">表示名</th>
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">コンテンツ数</th>
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">デフォルト</th>
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level, index) => (
              <tr key={level.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOrderChange(level.id, 'up')}
                      disabled={index === 0 || saving}
                      className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleOrderChange(level.id, 'down')}
                      disabled={index === levels.length - 1 || saving}
                      className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <span className="ml-2">{index + 1}</span>
                  </div>
                </td>
                <td className="px-4 py-2 font-mono text-sm text-gray-800">{level.id}</td>
                <td className="px-4 py-2">
                  {editingLevel === level.id ? (
                    <input
                      type="text"
                      defaultValue={level.displayName}
                      onBlur={(e) => handleEditDisplayName(level.id, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEditDisplayName(level.id, e.target.value);
                        }
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-gray-900"
                      autoFocus
                      maxLength={20}
                    />
                  ) : (
                    <span
                      onClick={() => !saving && setEditingLevel(level.id)}
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-gray-800"
                    >
                      {level.displayName}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-800">{level._count.contents}</td>
                <td className="px-4 py-2">
                  {level.isDefault ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(level.id)}
                      className="text-gray-400 hover:text-green-600"
                      disabled={saving}
                    >
                      設定
                    </button>
                  )}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => setShowDeleteModal(level)}
                    disabled={level.isDefault || saving}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新規レベル追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">新規レベル追加</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  レベルID（英数字とハイフンのみ）
                </label>
                <input
                  type="text"
                  value={newLevel.id}
                  onChange={(e) => setNewLevel(prev => ({ ...prev, id: e.target.value.toLowerCase() }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="例: upper-intermediate"
                  pattern="[a-z0-9-]+"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  表示名（20文字以内）
                </label>
                <input
                  type="text"
                  value={newLevel.displayName}
                  onChange={(e) => setNewLevel(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="例: 中上級レベル"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewLevel({ id: '', displayName: '', orderIndex: levels.length + 1 });
                }}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={saving}
              >
                キャンセル
              </button>
              <button
                onClick={handleAddLevel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                disabled={saving}
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* レベル削除確認モーダル */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              「{showDeleteModal.displayName}」を削除しますか？
            </h3>
            
            <p className="text-gray-700 mb-4">
              このレベルには {showDeleteModal._count.contents} 個のコンテンツが存在します。
            </p>
            
            {showDeleteModal._count.contents > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  移行先レベルを選択してください：
                </label>
                <select
                  value={targetLevelId}
                  onChange={(e) => setTargetLevelId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="">選択してください</option>
                  {levels
                    .filter(l => l.id !== showDeleteModal.id)
                    .map(level => (
                      <option key={level.id} value={level.id}>
                        {level.displayName}
                      </option>
                    ))
                  }
                </select>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(null);
                  setTargetLevelId('');
                }}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={saving}
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteLevel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={saving || (showDeleteModal._count.contents > 0 && !targetLevelId)}
              >
                削除して移行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}