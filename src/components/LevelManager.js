'use client';

import { useState, useEffect } from 'react';
import { useLevels } from '../hooks/useLevels';

export default function LevelManager() {
  const { levels, loading, error, refetch } = useLevels();
  const [localLevels, setLocalLevels] = useState([]);
  const [editingCell, setEditingCell] = useState(null); // {levelId, field}
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [targetLevelId, setTargetLevelId] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedLevel, setDraggedLevel] = useState(null);

  // 新規レベル用のフォームデータ
  const [newLevel, setNewLevel] = useState({
    id: '',
    displayName: '',
    altName: '',
    orderIndex: 1
  });

  // レベル情報を初期化
  useEffect(() => {
    if (levels.length > 0) {
      setLocalLevels(levels.map(level => ({ ...level })));
      setNewLevel(prev => ({ ...prev, orderIndex: levels.length + 1 }));
    }
  }, [levels]);

  // ローカルでセルを編集
  const handleCellEdit = (levelId, field, value) => {
    // レベルIDの変更は既存のコンテンツに影響するため無効化
    if (field === 'id') {
      alert('レベルIDの変更は既存のコンテンツとの関連性に影響するため、変更できません。');
      return;
    }
    
    setLocalLevels(prev => prev.map(level => 
      level.id === levelId ? { ...level, [field]: value } : level
    ));
    setHasChanges(true);
  };

  // ドラッグ開始
  const handleDragStart = (e, level) => {
    setIsDragging(true);
    setDraggedLevel(level);
    e.dataTransfer.effectAllowed = 'move';
  };

  // ドラッグオーバー
  const handleDragOver = (e, targetLevel) => {
    e.preventDefault();
    if (!draggedLevel || draggedLevel.id === targetLevel.id) return;

    const draggedIndex = localLevels.findIndex(l => l.id === draggedLevel.id);
    const targetIndex = localLevels.findIndex(l => l.id === targetLevel.id);

    if (draggedIndex !== targetIndex) {
      const newLevels = [...localLevels];
      newLevels.splice(draggedIndex, 1);
      newLevels.splice(targetIndex, 0, draggedLevel);
      
      // orderIndexを再計算
      newLevels.forEach((level, index) => {
        level.orderIndex = index + 1;
      });
      
      setLocalLevels(newLevels);
      setHasChanges(true);
    }
  };

  // ドラッグ終了
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedLevel(null);
  };

  // 変更を保存
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // デフォルトレベルを先に更新
      const defaultLevel = localLevels.find(l => l.isDefault);
      if (defaultLevel) {
        const response = await fetch(`/api/levels/${defaultLevel.id}/set-default`, {
          method: 'PUT'
        });
        
        if (!response.ok) {
          throw new Error('デフォルトレベルの設定に失敗しました');
        }
      }

      // 各レベルを個別に更新
      for (const level of localLevels) {
        const response = await fetch(`/api/levels/${level.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: level.displayName,
            altName: level.altName,
            orderIndex: level.orderIndex
          })
        });

        if (!response.ok) {
          throw new Error(`レベル ${level.id} の更新に失敗しました`);
        }
      }

      await refetch();
      setHasChanges(false);
      alert('変更を保存しました');
    } catch (error) {
      alert(`保存中にエラーが発生しました: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // 変更をキャンセル
  const handleCancelChanges = () => {
    setLocalLevels(levels.map(level => ({ ...level })));
    setHasChanges(false);
    setEditingCell(null);
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
        altName: '',
        orderIndex: localLevels.length + 2
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // レベルの削除
  const handleDeleteLevel = async () => {
    if (showDeleteModal._count.contents > 0 && !targetLevelId) {
      alert('移行先レベルを選択してください');
      return;
    }

    setSaving(true);
    try {
      const url = showDeleteModal._count.contents > 0 
        ? `/api/levels/${showDeleteModal.id}?targetLevelId=${targetLevelId}`
        : `/api/levels/${showDeleteModal.id}`;
        
      const response = await fetch(url, {
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
  const handleSetDefault = (levelId) => {
    setLocalLevels(prev => prev.map(level => ({
      ...level,
      isDefault: level.id === levelId
    })));
    setHasChanges(true);
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
        <div className="flex gap-3">
          {hasChanges && (
            <>
              <button
                onClick={handleCancelChanges}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={saving}
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors animate-pulse"
                disabled={saving}
              >
                {saving ? '保存中...' : '変更を保存'}
              </button>
            </>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            disabled={saving}
          >
            新規レベル追加
          </button>
        </div>
      </div>

      {/* 変更通知 */}
      {hasChanges && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <strong>⚠️ 未保存の変更があります</strong> - 「変更を保存」ボタンをクリックしてデータベースに反映してください。
        </div>
      )}

      {/* レベル一覧 */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left text-gray-800 font-semibold w-12">順序</th>
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">レベルID</th>
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">別名</th>
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">表示名</th>
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">コンテンツ数</th>
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">デフォルト</th>
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {localLevels.map((level, index) => (
              <tr 
                key={level.id} 
                className={`border-t hover:bg-gray-50 ${isDragging ? 'cursor-move' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, level)}
                onDragOver={(e) => handleDragOver(e, level)}
                onDragEnd={handleDragEnd}
              >
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">⋮⋮</span>
                    <span>{index + 1}</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className="font-mono text-sm text-gray-600" title="レベルIDは変更できません">
                    {level.id}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {editingCell?.levelId === level.id && editingCell?.field === 'altName' ? (
                    <input
                      type="text"
                      value={level.altName || ''}
                      onChange={(e) => handleCellEdit(level.id, 'altName', e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') setEditingCell(null);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-gray-900 w-full"
                      placeholder="かんたん"
                      maxLength={20}
                      autoFocus
                    />
                  ) : (
                    <div
                      onClick={() => setEditingCell({ levelId: level.id, field: 'altName' })}
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                    >
                      {level.altName ? (
                        <span className="text-gray-800 font-medium">{level.altName}</span>
                      ) : (
                        <span className="text-gray-400 italic">未設定</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingCell?.levelId === level.id && editingCell?.field === 'displayName' ? (
                    <input
                      type="text"
                      value={level.displayName}
                      onChange={(e) => handleCellEdit(level.id, 'displayName', e.target.value)}
                      onBlur={() => setEditingCell(null)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') setEditingCell(null);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-gray-900 w-full"
                      maxLength={20}
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => setEditingCell({ levelId: level.id, field: 'displayName' })}
                      className="text-gray-800 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                    >
                      {level.displayName}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-800">{level._count?.contents || 0}</td>
                <td className="px-4 py-2">
                  {level.isDefault ? (
                    <span className="text-green-600 font-bold">✓</span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(level.id)}
                      className="text-gray-600 hover:text-green-600"
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
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    if (/^[a-z0-9-]*$/.test(value)) {
                      setNewLevel(prev => ({ ...prev, id: value }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="例: upper-intermediate"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  別名（20文字以内）
                </label>
                <input
                  type="text"
                  value={newLevel.altName}
                  onChange={(e) => setNewLevel(prev => ({ ...prev, altName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="例: かんたん"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">
                  日本語学習者にわかりやすい表現（かんたん、むずかしい等）
                </p>
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
                <p className="text-xs text-gray-500 mt-1">
                  正式なレベル名（中級前半、中級レベル等）
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewLevel({ id: '', displayName: '', altName: '', orderIndex: localLevels.length + 1 });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
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
            
            {showDeleteModal._count.contents > 0 ? (
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
                  {localLevels
                    .filter(l => l.id !== showDeleteModal.id)
                    .map(level => (
                      <option key={level.id} value={level.id}>
                        {level.displayName}
                      </option>
                    ))
                  }
                </select>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                コンテンツが存在しないため、移行は不要です。
              </p>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(null);
                  setTargetLevelId('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={saving}
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteLevel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={saving || (showDeleteModal._count.contents > 0 && !targetLevelId)}
              >
                {showDeleteModal._count.contents > 0 ? '削除して移行' : '削除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}