'use client';

import { useState, useEffect } from 'react';

export default function LabelManager() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingLabel, setEditingLabel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
    description: ''
  });

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/labels');
      if (response.ok) {
        const data = await response.json();
        setLabels(data);
      } else {
        setError('ラベルの取得に失敗しました');
      }
    } catch (error) {
      console.error('Error fetching labels:', error);
      setError('ラベルの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingLabel ? `/api/labels/${editingLabel.id}` : '/api/labels';
      const method = editingLabel ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchLabels();
        resetForm();
      } else {
        const data = await response.json();
        setError(data.error || 'ラベルの保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving label:', error);
      setError('ラベルの保存に失敗しました');
    }
  };

  const handleEdit = (label) => {
    console.log('Editing label:', label);
    setError(''); // エラーをクリア
    setEditingLabel(label);
    setFormData({
      name: label.name,
      color: label.color,
      description: label.description || ''
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('このラベルを削除しますか？関連付けられたコンテンツからも削除されます。')) return;

    try {
      const response = await fetch(`/api/labels/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchLabels();
      } else {
        setError('ラベルの削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting label:', error);
      setError('ラベルの削除に失敗しました');
    }
  };

  const resetForm = () => {
    setEditingLabel(null);
    setFormData({
      name: '',
      color: '#6366f1',
      description: ''
    });
  };

  return (
    <div className="space-y-8">
      {/* ラベル作成・編集フォーム */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {editingLabel ? 'ラベルを編集' : '新しいラベルを作成'}
        </h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-600">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ラベル名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カラー
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">{formData.color}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="2"
            />
          </div>

          <div className="flex justify-end space-x-2">
            {editingLabel && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingLabel ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>

      {/* ラベル一覧 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            ラベル一覧
          </h2>
          <button
            onClick={fetchLabels}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-70"
          >
            {loading ? '読み込み中...' : '更新'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-600">読み込み中...</div>
          </div>
        ) : labels.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            ラベルがありません
          </div>
        ) : (
          <div className="space-y-2">
            {labels.map((label) => (
              <div key={label.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: label.color }}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{label.name}</div>
                    {label.description && (
                      <div className="text-sm text-gray-600">{label.description}</div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({label._count?.contents || 0} コンテンツ)
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(label)}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(label.id)}
                    className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}