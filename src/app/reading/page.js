/**
 * Reading Page - 読解練習ライブラリの選択画面
 * 
 * 機能:
 * - 文章の検索・フィルタリング・並び替え
 * - グリッド・リスト表示モードの切り替え
 * - ページネーション（9件ずつ表示）
 * - 統計ダッシュボード
 * - モダンUI/UXデザイン（2カラムレイアウト）
 * - 研究配慮（文章内容を事前に表示しない）
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 読解練習ライブラリページコンポーネント
 * 
 * @returns {JSX.Element} 読解練習ライブラリページ
 */
export default function Reading() {
  // ===== 状態管理 =====
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(''); // 検索キーワード
  const [levelFilter, setLevelFilter] = useState('all'); // レベルフィルタ（all, beginner, intermediate, advanced）
  const [sortBy, setSortBy] = useState('id'); // 並び替え基準（id, title, level, questions）
  const [viewMode, setViewMode] = useState('grid'); // 表示モード（grid or list）
  const [currentPage, setCurrentPage] = useState(1); // 現在のページ番号
  const itemsPerPage = 9; // 1ページあたりの表示件数
  const [readingContents, setReadingContents] = useState([]); // データベースから取得したコンテンツ
  const [loading, setLoading] = useState(true); // ローディング状態
  const [sidebarOpen, setSidebarOpen] = useState(false); // モバイル用サイドバー開閉状態

  // ===== データベースからコンテンツを取得 =====
  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await fetch('/api/contents');
        if (response.ok) {
          const contents = await response.json();
          setReadingContents(contents);
        } else {
          console.error('Failed to fetch contents from API');
          setReadingContents([]);
        }
      } catch (error) {
        console.error('Failed to fetch contents:', error);
        setReadingContents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContents();
  }, []);

  // ===== 統計データの計算 =====
  /**
   * 文章数の統計を計算（総数・レベル別）
   * useMemoを使用してパフォーマンス最適化
   */
  const stats = useMemo(() => {
    const total = readingContents.length;
    const beginner = readingContents.filter(c => c.levelCode === 'beginner').length;
    const intermediate = readingContents.filter(c => c.levelCode === 'intermediate').length;
    const advanced = readingContents.filter(c => c.levelCode === 'advanced').length;
    return { total, beginner, intermediate, advanced };
  }, [readingContents]);

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

    // ソート処理
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title); // タイトル順（あいうえお順）
        case 'level':
          const levelOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return levelOrder[a.levelCode] - levelOrder[b.levelCode]; // レベル順
        case 'questions':
          return b.questions.length - a.questions.length; // 問題数順（多い順）
        default: // id
          return a.id.localeCompare(b.id); // ID順
      }
    });

    return filtered;
  }, [readingContents, searchTerm, levelFilter, sortBy]);

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
  }, [searchTerm, levelFilter, sortBy]);

  /**
   * フィルターをクリアする関数
   */
  const clearFilters = () => {
    setSearchTerm('');
    setLevelFilter('all');
    setSortBy('id');
  };

  /**
   * アクティブなフィルターがあるかチェック
   */
  const hasActiveFilters = searchTerm || levelFilter !== 'all' || sortBy !== 'id';

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
      <div className="relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20"></div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
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
    <div className="relative overflow-hidden min-h-screen bg-gray-50">
      {/* 背景要素 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10"></div>
      
      {/* ===== ヘッダーセクション ===== */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* ロゴとタイトル */}
            <div className="flex items-center space-x-4">
              <img 
                src="/logos/gorilla-only-animated.svg" 
                alt="速読ゴリラ" 
                className="h-12 w-auto drop-shadow-lg"
              />
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  読解練習ライブラリ
                </h1>
                <p className="text-sm text-gray-600">お好みの文章を選んでください</p>
              </div>
            </div>
            
            {/* モバイル用メニューボタン */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ===== メインコンテンツエリア（2カラムレイアウト） ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          
          {/* ===== 左サイドバー - フィルター&設定 ===== */}
          <div className={`lg:w-96 flex-shrink-0 transition-all duration-300 ${
            sidebarOpen ? 'block' : 'hidden lg:block'
          }`}>
            <div className="sticky top-24 space-y-6">
              
              {/* 統計カード */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                  </svg>
                  文章統計
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">総文章数</span>
                    <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stats.total}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">初級レベル</span>
                    <span className="font-bold text-blue-600">{stats.beginner}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">中級レベル</span>
                    <span className="font-bold text-emerald-600">{stats.intermediate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">上級レベル</span>
                    <span className="font-bold text-purple-600">{stats.advanced}</span>
                  </div>
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
                      <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* レベルフィルタ */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">レベル</label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'すべて', count: stats.total },
                        { value: 'beginner', label: '初級レベル', count: stats.beginner, color: 'blue' },
                        { value: 'intermediate', label: '中級レベル', count: stats.intermediate, color: 'emerald' },
                        { value: 'advanced', label: '上級レベル', count: stats.advanced, color: 'purple' }
                                             ].map((option) => (
                         <label key={option.value} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                           <div className="flex items-center min-w-0">
                             <input
                               type="radio"
                               name="level"
                               value={option.value}
                               checked={levelFilter === option.value}
                               onChange={(e) => setLevelFilter(e.target.value)}
                               className="mr-3 text-blue-500 focus:ring-blue-500 flex-shrink-0"
                             />
                             <span className="text-gray-700 font-medium whitespace-nowrap">{option.label}</span>
                           </div>
                           <span className={`text-sm font-bold flex-shrink-0 ml-2 ${
                             option.color === 'blue' ? 'text-blue-600' :
                             option.color === 'emerald' ? 'text-emerald-600' :
                             option.color === 'purple' ? 'text-purple-600' :
                             'text-gray-600'
                           }`}>
                             {option.count}
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
                      <option value="id">ID順</option>
                      <option value="title">タイトル順</option>
                      <option value="level">レベル順</option>
                      <option value="questions">問題数順</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 表示モード */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  表示モード
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-3 rounded-xl transition-all duration-300 ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="text-sm font-medium">グリッド</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-3 rounded-xl transition-all duration-300 ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">リスト</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===== 右メインエリア - コンテンツ ===== */}
          <div className="flex-1 min-w-0">
            
            {/* 結果ヘッダー */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-bold text-gray-800">
                    {filteredContents.length}件の文章
                  </span>
                  {hasActiveFilters && (
                    <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                      フィルター適用中
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {currentPage} / {totalPages} ページ
                </div>
              </div>
            </div>

            {/* コンテンツエリア */}
            {paginatedContents.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 shadow-lg border border-gray-100 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">該当する文章が見つかりません</h3>
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
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mb-8">
                    {paginatedContents.map((content) => (
                      <div 
                        key={content.id} 
                        className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                                                 <div className="flex justify-start items-start mb-4">
                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                             content.levelCode === 'beginner' 
                               ? 'bg-blue-100 text-blue-700'
                               : content.levelCode === 'intermediate'
                               ? 'bg-emerald-100 text-emerald-700'
                               : 'bg-purple-100 text-purple-700'
                           }`}>
                             {content.level}
                           </span>
                         </div>

                        <h2 className="text-xl font-bold text-gray-800 mb-4 leading-tight">
                          {content.title}
                        </h2>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-4">
                          <span className="text-sm font-medium text-gray-700">問題数</span>
                          <span className="text-lg font-bold text-blue-600">
                            {content.questions.length}問
                          </span>
                        </div>

                        <button
                          onClick={() => handleContentSelect(content)}
                          className="w-full group relative px-6 py-3 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                          <span className="flex items-center justify-center space-x-2">
                            <span>練習開始</span>
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </span>
                        </button>
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
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                      >
                                                 <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-6">
                             <div>
                               <h3 className="text-lg font-bold text-gray-800">{content.title}</h3>
                               <div className="flex items-center space-x-4 mt-1">
                                 <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                                   content.levelCode === 'beginner' 
                                     ? 'bg-blue-100 text-blue-700'
                                     : content.levelCode === 'intermediate'
                                     ? 'bg-emerald-100 text-emerald-700'
                                     : 'bg-purple-100 text-purple-700'
                                 }`}>
                                   {content.level}
                                 </span>
                                 <span className="text-sm text-gray-600">{content.questions.length}問</span>
                               </div>
                             </div>
                           </div>
                          <button
                            onClick={() => handleContentSelect(content)}
                            className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                          >
                            <span className="flex items-center space-x-2">
                              <span>開始</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </span>
                          </button>
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
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
                                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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