'use client';

import { useState, useEffect } from 'react';

export default function SiteInfoEditor() {
  const [siteInfo, setSiteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSiteInfo();
  }, []);

  const fetchSiteInfo = async () => {
    try {
      const response = await fetch('/api/site-info');
      const data = await response.json();
      setSiteInfo(data);
    } catch (error) {
      console.error('Failed to fetch site info:', error);
      setMessage('サイト情報の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/site-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteInfo),
      });

      if (response.ok) {
        setMessage('保存しました');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save site info:', error);
      setMessage('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDeveloper = () => {
    setSiteInfo({
      ...siteInfo,
      developers: [...(siteInfo.developers || []), {
        name: '',
        role: '',
        description: ''
      }]
    });
  };

  const handleRemoveDeveloper = (index) => {
    setSiteInfo({
      ...siteInfo,
      developers: siteInfo.developers.filter((_, i) => i !== index)
    });
  };

  const handleDeveloperChange = (index, field, value) => {
    const updatedDevelopers = [...siteInfo.developers];
    updatedDevelopers[index][field] = value;
    setSiteInfo({
      ...siteInfo,
      developers: updatedDevelopers
    });
  };

  const handleAddFeature = () => {
    setSiteInfo({
      ...siteInfo,
      features: [...(siteInfo.features || []), {
        icon: '',
        title: '',
        description: ''
      }]
    });
  };

  const handleRemoveFeature = (index) => {
    setSiteInfo({
      ...siteInfo,
      features: siteInfo.features.filter((_, i) => i !== index)
    });
  };

  const handleFeatureChange = (index, field, value) => {
    const updatedFeatures = [...siteInfo.features];
    updatedFeatures[index][field] = value;
    setSiteInfo({
      ...siteInfo,
      features: updatedFeatures
    });
  };

  const handleAddUsageStep = () => {
    setSiteInfo({
      ...siteInfo,
      usage: [...(siteInfo.usage || []), {
        step: (siteInfo.usage?.length || 0) + 1,
        description: ''
      }]
    });
  };

  const handleRemoveUsageStep = (index) => {
    const updatedUsage = siteInfo.usage
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, step: i + 1 }));
    setSiteInfo({
      ...siteInfo,
      usage: updatedUsage
    });
  };

  const handleUsageChange = (index, value) => {
    const updatedUsage = [...siteInfo.usage];
    updatedUsage[index].description = value;
    setSiteInfo({
      ...siteInfo,
      usage: updatedUsage
    });
  };

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  if (!siteInfo) {
    return <div className="text-center py-8 text-red-600">エラーが発生しました</div>;
  }

  return (
    <div className="space-y-8">
      {/* 基本情報 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">基本情報</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              サイト名
            </label>
            <input
              type="text"
              value={siteInfo.title || ''}
              onChange={(e) => setSiteInfo({ ...siteInfo, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明文
            </label>
            <textarea
              value={siteInfo.description || ''}
              onChange={(e) => setSiteInfo({ ...siteInfo, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 開発者情報 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">開発者情報</h2>
          <button
            onClick={handleAddDeveloper}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            + 開発者を追加
          </button>
        </div>
        <div className="space-y-4">
          {siteInfo.developers?.map((developer, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => handleRemoveDeveloper(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  削除
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名前
                  </label>
                  <input
                    type="text"
                    value={developer.name || ''}
                    onChange={(e) => handleDeveloperChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    役割
                  </label>
                  <input
                    type="text"
                    value={developer.role || ''}
                    onChange={(e) => handleDeveloperChange(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <input
                  type="text"
                  value={developer.description || ''}
                  onChange={(e) => handleDeveloperChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 機能一覧 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">機能一覧</h2>
          <button
            onClick={handleAddFeature}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            + 機能を追加
          </button>
        </div>
        <div className="space-y-4">
          {siteInfo.features?.map((feature, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => handleRemoveFeature(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  削除
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    アイコン（絵文字）
                  </label>
                  <input
                    type="text"
                    value={feature.icon || ''}
                    onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="例: 📊"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    機能名
                  </label>
                  <input
                    type="text"
                    value={feature.title || ''}
                    onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <input
                  type="text"
                  value={feature.description || ''}
                  onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 使い方 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">使い方</h2>
          <button
            onClick={handleAddUsageStep}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            + ステップを追加
          </button>
        </div>
        <div className="space-y-3">
          {siteInfo.usage?.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="bg-blue-100 text-blue-700 rounded-full w-8 h-8 flex items-center justify-center font-medium">
                {step.step}
              </span>
              <input
                type="text"
                value={step.description || ''}
                onChange={(e) => handleUsageChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => handleRemoveUsageStep(index)}
                className="text-red-600 hover:text-red-700"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-between items-center">
        <div>
          {message && (
            <p className={`font-medium ${message.includes('失敗') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}