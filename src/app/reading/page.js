/**
 * Reading Page - 読解練習ライブラリの選択画面
 * 
 * 機能:
 * - 読み物の検索・フィルタリング・並び替え
 * - グリッド・リスト表示モードの切り替え
 * - ページネーション（9件ずつ表示）
 * - 統計ダッシュボード
 * - モダンUI/UXデザイン（2カラムレイアウト）
 * - 研究配慮（読み物内容を事前に表示しない）
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLevels } from '../../hooks/useLevels';

/**
 * 読解練習ライブラリページコンポーネント
 * 
 * @returns {JSX.Element} 読解練習ライブラリページ
 */
export default function Reading() {
  // ===== 状態管理 =====
  const router = useRouter();
  const { levels, loading: levelsLoading, getLevelDisplayName, getLevelStyle } = useLevels();
  const [searchTerm, setSearchTerm] = useState(''); // 検索キーワード
  const [levelFilter, setLevelFilter] = useState('all'); // レベルフィルタ（all, beginner, intermediate, advanced）
  const [labelFilter, setLabelFilter] = useState('all'); // ラベルフィルタ
  const [sortBy, setSortBy] = useState('order'); // 並び替え基準（order, createdAt, title, level, questions, characters）
  const [viewMode, setViewMode] = useState('grid'); // 表示モード（grid or list）
  const [currentPage, setCurrentPage] = useState(1); // 現在のページ番号
  const itemsPerPage = 9; // 1ページあたりの表示件数
  const [readingContents, setReadingContents] = useState([]); // データベースから取得したコンテンツ
  const [labels, setLabels] = useState([]); // ラベル一覧
  const [loading, setLoading] = useState(true); // ローディング状態
  const [sidebarOpen, setSidebarOpen] = useState(false); // モバイル用サイドバー開閉状態

  // ===== データベースからコンテンツとラベルを取得 =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        // コンテンツとラベルを並列で取得
        const [contentsResponse, labelsResponse] = await Promise.all([
          fetch('/api/contents'),
          fetch('/api/labels')
        ]);
        
        if (contentsResponse.ok) {
          const contents = await contentsResponse.json();
          setReadingContents(contents);
        } else {
          console.error('Failed to fetch contents from API');
          setReadingContents([]);
        }
        
        if (labelsResponse.ok) {
          const labelsData = await labelsResponse.json();
          setLabels(labelsData);
        } else {
          console.error('Failed to fetch labels from API');
          setLabels([]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setReadingContents([]);
        setLabels([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // ===== 統計データの計算 =====
  /**
   * 読み物数の統計を計算（総数・レベル別）
   * useMemoを使用してパフォーマンス最適化
   */
  const stats = useMemo(() => {
    const total = readingContents.length;
    
    // 各レベルのコンテンツ数を計算
    const levelCounts = {};
    levels.forEach(level => {
      levelCounts[level.id] = readingContents.filter(c => c.levelCode === level.id).length;
    });
    
    return { total, levelCounts };
  }, [readingContents, levels]);

  // レベルコードから別名または表示名を取得する関数
  const getLevelAltName = (levelCode) => {
    const level = levels.find(l => l.id === levelCode);
    return level ? (level.altName || level.displayName) : '';
  };

  // レベルコードからレベル情報を取得する関数
  const getLevelInfo = (levelCode) => {
    const level = levels.find(l => l.id === levelCode);
    return level || { altName: '', displayName: '' };
  };

  // ===== フィルタリング・ソート処理 =====
  /**
   * 検索・フィルタ・ソート条件に基づいてコンテンツをフィルタリング
   * useMemoを使用してパフォーマンス最適化
   */
  const filteredContents = useMemo(() => {
    let filtered = readingContents;

    // 検索フィルタ（タイトルとIDで検索）
    if (searchTerm) {
      filtered = filtered.filter(content =>
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // レベルフィルタ
    if (levelFilter !== 'all') {
      filtered = filtered.filter(content => content.levelCode === levelFilter);
    }

    // ラベルフィルタ
    if (labelFilter !== 'all') {
      filtered = filtered.filter(content => 
        content.labels && content.labels.some(cl => cl.label.id === labelFilter)
      );
    }

    // ソート処理
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'order':
          // まずレベルでソート、次にorderIndexでソート（管理画面で設定した順番）
          if (a.levelCode !== b.levelCode) {
            const levelA = levels.find(l => l.id === a.levelCode);
            const levelB = levels.find(l => l.id === b.levelCode);
            return (levelA?.orderIndex || 0) - (levelB?.orderIndex || 0);
          }
          return (a.orderIndex || 999999) - (b.orderIndex || 999999);
        case 'title':
          return a.title.localeCompare(b.title); // タイトル順（あいうえお順）
        case 'level':
          const levelA = levels.find(l => l.id === a.levelCode);
          const levelB = levels.find(l => l.id === b.levelCode);
          return (levelA?.orderIndex || 999) - (levelB?.orderIndex || 999); // レベル順
        case 'questions':
          return b.questions.length - a.questions.length; // 問題数順（多い順）
        case 'characters':
          return (b.characterCount || 0) - (a.characterCount || 0); // 文字数順（多い順）
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt); // 追加日時順（新しい順）
        default:
          return 0;
      }
    });

    return filtered;
  }, [readingContents, searchTerm, levelFilter, labelFilter, sortBy]);

  // ===== ページネーション処理 =====
  /**
   * 総ページ数の計算
   */
  const totalPages = Math.ceil(filteredContents.length / itemsPerPage);
  
  /**
   * 現在のページに表示するコンテンツを抽出
   */
  const paginatedContents = filteredContents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /**
   * フィルタ条件が変更された時に1ページ目にリセット
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, levelFilter, labelFilter, sortBy]);

  /**
   * フィルターをクリアする関数
   */
  const clearFilters = () => {
    setSearchTerm('');
    setLevelFilter('all');
    setLabelFilter('all');
    setSortBy('order');
  };

  /**
   * アクティブなフィルターがあるかチェック
   */
  const hasActiveFilters = searchTerm || levelFilter !== 'all' || labelFilter !== 'all' || sortBy !== 'order';

  // ===== コンテンツ選択処理 =====
  /**
   * コンテンツが選択された時の処理
   * 個別コンテンツページに遷移
   */
  const handleContentSelect = (content) => {
    router.push(`/content/${content.id}`);
  };

  // ローディング中の表示
  if (loading) {
    return (
      <div className="relative overflow-hidden min-h-[calc(100vh-6rem)] pb-safe-area-inset-bottom pb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20"></div>
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-6rem)]">
          <div className="text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">コンテンツを読み込み中...</h2>
            <p className="text-gray-600">少々お待ちください</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== メインUIレンダリング =====
  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-6rem)] bg-gray-50 pb-safe-area-inset-bottom pb-6">
      {/* 背景要素 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10"></div>
      
      {/* ===== レベルタブセクション ===== */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-2 py-2">
              <button
                onClick={() => setLevelFilter('all')}
                className={`px-6 py-3 font-medium transition-all whitespace-nowrap flex items-center gap-3 rounded-lg ${
                  levelFilter === 'all'
                    ? 'bg-blue-50 text-blue-700 border-b-3 border-blue-600 shadow-sm'
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="text-base">すべて</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  levelFilter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {stats.total}
                </span>
              </button>
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setLevelFilter(level.id)}
                  className={`px-6 py-3 font-medium transition-all whitespace-nowrap rounded-lg ${
                    levelFilter === level.id
                      ? 'bg-blue-50 text-blue-700 border-b-3 border-blue-600 shadow-sm'
                      : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-start">
                      {level.altName && (
                        <span className="text-base font-semibold leading-tight">{level.altName}</span>
                      )}
                      <span className={`text-xs leading-tight ${
                        levelFilter === level.id ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {level.displayName}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      levelFilter === level.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {stats.levelCounts[level.id] || 0}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

      {/* ===== モバイル用上部フィルターバー ===== */}
      <div className="lg:hidden relative z-10 max-w-7xl mx-auto px-4 pt-4">
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
          {/* 簡易フィルター行 */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* 検索 */}
            <div className="flex-1 min-w-48">
              <input
                type="text"
                placeholder="タイトルやIDで検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500 bg-white"
              />
            </div>
            {/* ラベルフィルター */}
            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-800 bg-white font-medium"
            >
              <option value="all">全ラベル</option>
              {labels.map(label => (
                <option key={label.id} value={label.id}>
                  {label.name}
                </option>
              ))}
            </select>
            {/* ソート */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-800 bg-white font-medium"
            >
              <option value="order">標準</option>
              <option value="createdAt">追加日時順</option>
              <option value="title">タイトル順</option>
              <option value="level">レベル順</option>
              <option value="questions">問題数順</option>
              <option value="characters">文字数順</option>
            </select>
          </div>
          
          {/* 統計・表示モード行 */}
          <div className="flex items-center justify-between">
            {/* 簡易統計 */}
            <div className="flex items-center space-x-4 text-sm">
              <span className="font-bold text-gray-800">総数: {stats.total}</span>
              {levels.map(level => (
                <div key={level.id} className="flex items-center gap-2">
                  <span className={`font-medium ${getLevelStyle(level.id, 'textBold')}`}>
                    {level.altName || level.displayName}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {stats.levelCounts[level.id] || 0}
                  </span>
                </div>
              ))}
            </div>
            
            {/* 表示モード切り替え */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded text-xs ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-800 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded text-xs ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-800 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* フィルタークリアボタン */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors duration-200"
              >
                フィルターをクリア
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== メインコンテンツエリア（レスポンシブレイアウト） ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-4 lg:py-6">
        <div className="lg:flex lg:gap-8">
          
          {/* ===== 左サイドバー - デスクトップ専用フィルター&設定 ===== */}
          <div className="hidden lg:block lg:w-96 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              
              {/* 統計カード */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                  読み物統計
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">総読み物数</span>
                    <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stats.total}
                    </span>
                  </div>
                  {levels.map(level => (
                    <div key={level.id} className="flex justify-between items-center">
                      <div className="flex flex-col items-start">
                        {level.altName && (
                          <span className="text-gray-700 font-medium text-sm">{level.altName}</span>
                        )}
                        <span className="text-gray-500 text-xs">{level.displayName}</span>
                      </div>
                      <span className={`font-bold ${getLevelStyle(level.id, 'text')}`}>
                        {stats.levelCounts[level.id] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* フィルターカード */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                    フィルター
                  </h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors duration-200"
                    >
                      クリア
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {/* 検索入力 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">検索</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="タイトルやIDで検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                      <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>


                  {/* ラベルフィルタ */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ラベル</label>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                        <div className="flex items-center min-w-0">
                          <input
                            type="radio"
                            name="label"
                            value="all"
                            checked={labelFilter === 'all'}
                            onChange={(e) => setLabelFilter(e.target.value)}
                            className="mr-3 text-blue-500 focus:ring-blue-500 flex-shrink-0"
                          />
                          <span className="text-gray-700 font-medium whitespace-nowrap">すべて</span>
                        </div>
                        <span className="text-sm font-bold flex-shrink-0 ml-2 text-gray-600">
                          {stats.total}
                        </span>
                      </label>
                      {labels.map((label) => (
                        <label key={label.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                          <div className="flex items-center min-w-0">
                            <input
                              type="radio"
                              name="label"
                              value={label.id}
                              checked={labelFilter === label.id}
                              onChange={(e) => setLabelFilter(e.target.value)}
                              className="mr-3 text-blue-500 focus:ring-blue-500 flex-shrink-0"
                            />
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: label.color }}
                              />
                              <span className="text-gray-700 font-medium whitespace-nowrap">{label.name}</span>
                            </div>
                          </div>
                          <span className="text-sm font-bold flex-shrink-0 ml-2 text-gray-600">
                            {label._count?.contents || 0}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* ソート選択 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">並び替え</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="order">標準</option>
                      <option value="createdAt">追加日時順</option>
                      <option value="title">タイトル順</option>
                      <option value="level">レベル順</option>
                      <option value="questions">問題数順</option>
                      <option value="characters">文字数順</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ===== 右メインエリア - コンテンツ ===== */}
          <div className="flex-1 min-w-0">
            
            {/* 結果ヘッダー */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6 mt-4 lg:mt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold text-gray-800">
                    {filteredContents.length}件の読み物
                  </span>
                  {hasActiveFilters && (
                    <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                      フィルター適用中
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {/* 表示モード切り替え */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded text-xs ${
                        viewMode === 'grid'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-gray-800 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded text-xs ${
                        viewMode === 'list'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-gray-800 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {currentPage} / {totalPages} ページ
                  </div>
                </div>
              </div>
            </div>

            {/* コンテンツエリア */}
            {paginatedContents.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 shadow-lg border border-gray-100 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">該当する読み物が見つかりません</h3>
                <p className="text-gray-600 mb-4">検索条件を変更してもう一度お試しください</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 font-medium"
                  >
                    フィルターをクリア
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* グリッドビュー */}
                {viewMode === 'grid' && (
                  <div className="grid gap-3 sm:gap-6 grid-cols-2 md:grid-cols-2 xl:grid-cols-3 mb-8">
                    {paginatedContents.map((content) => (
                      <div 
                        key={content.id} 
                        className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        {/* サムネイル背景エリア */}
                        <div 
                          className="relative h-24 sm:h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
                          style={{
                            backgroundImage: content.thumbnail 
                              ? `linear-gradient(to bottom right, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${content.thumbnail.base64})`
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                          }}
                        >
                          {/* グラデーションオーバーレイ */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                          
                          {/* レベルバッジ */}
                          <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                            <div className={`inline-flex flex-col items-start px-2 sm:px-3 py-1 rounded-lg backdrop-blur-sm ${getLevelStyle(content.levelCode, 'badgeHover')}`}>
                              {getLevelInfo(content.levelCode).altName && (
                                <span className="text-xs font-bold">
                                  {getLevelInfo(content.levelCode).altName}
                                </span>
                              )}
                              <span className="text-xs opacity-90">
                                {getLevelInfo(content.levelCode).displayName}
                              </span>
                            </div>
                          </div>

                          {/* サムネイルがない場合のアイコン */}
                          {!content.thumbnail && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-3xl sm:text-6xl text-white/60">📚</div>
                            </div>
                          )}
                        </div>

                        {/* コンテンツ情報エリア */}
                        <div className="p-3 sm:p-6">
                          <h2 className="text-sm sm:text-xl font-bold text-gray-800 mb-2 sm:mb-4 leading-tight line-clamp-2">
                            {content.title}
                          </h2>
                          
                          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">文字数</span>
                              <span className="text-sm sm:text-lg font-bold text-orange-600">
                                {(content.characterCount || 0).toLocaleString()}字
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">問題数</span>
                              <span className="text-sm sm:text-lg font-bold text-blue-600">
                                {content.questions.length}問
                              </span>
                            </div>
                          </div>

                          {/* ラベル表示 */}
                          {content.labels && content.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-3">
                              {content.labels.map((cl) => (
                                <span
                                  key={cl.label.id}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: cl.label.color + '20',
                                    color: cl.label.color,
                                    border: `1px solid ${cl.label.color}40`
                                  }}
                                >
                                  {cl.label.name}
                                </span>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => handleContentSelect(content)}
                            className="w-full group relative px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            <span className="flex items-center justify-center space-x-1 sm:space-x-2">
                              <span>練習開始</span>
                              <svg className="w-3 sm:w-4 h-3 sm:h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* リストビュー */}
                {viewMode === 'list' && (
                  <div className="space-y-4 mb-8">
                    {paginatedContents.map((content) => (
                      <div 
                        key={content.id} 
                        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center">
                          {/* サムネイル */}
                          <div 
                            className="w-20 sm:w-24 h-12 sm:h-16 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden"
                            style={{
                              backgroundImage: content.thumbnail 
                                ? `linear-gradient(to bottom right, rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url(${content.thumbnail.base64})`
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}
                          >
                            {!content.thumbnail && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-lg sm:text-2xl text-white/60">📚</div>
                              </div>
                            )}
                          </div>

                          {/* コンテンツ情報 */}
                          <div className="flex-1 py-1 px-2 sm:py-2 sm:px-3 flex items-center justify-between min-w-0">
                            <div className="flex-1 min-w-0 mr-2 sm:mr-3">
                              <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-0.5 line-clamp-1">{content.title}</h3>
                              <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
                                <div className={`inline-flex flex-col items-start px-2 py-1 rounded-md ${getLevelStyle(content.levelCode, 'badge')}`}>
                                  {getLevelInfo(content.levelCode).altName && (
                                    <span className="text-xs font-bold leading-none">
                                      {getLevelInfo(content.levelCode).altName}
                                    </span>
                                  )}
                                  <span className="text-xs opacity-80 leading-none">
                                    {getLevelInfo(content.levelCode).displayName}
                                  </span>
                                </div>
                                <span className="text-xs text-orange-600 font-medium">{(content.characterCount || 0).toLocaleString()}字</span>
                                <span className="text-xs text-gray-600 font-medium">{content.questions.length}問</span>
                              </div>
                              {/* ラベル表示 */}
                              {content.labels && content.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {content.labels.map((cl) => (
                                    <span
                                      key={cl.label.id}
                                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium"
                                      style={{
                                        backgroundColor: cl.label.color + '20',
                                        color: cl.label.color,
                                        border: `1px solid ${cl.label.color}40`
                                      }}
                                    >
                                      {cl.label.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0">
                              <button
                                onClick={() => handleContentSelect(content)}
                                className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                              >
                                開始
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ページネーション */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        前へ
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + Math.max(1, currentPage - 2);
                        if (page > totalPages) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                              currentPage === page
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        次へ
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}