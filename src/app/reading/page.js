/**
 * Reading Page - 読解練習ライブラリの選択画面
 * 
 * 機能:
 * - 文章の検索・フィルタリング・並び替え
 * - グリッド・リスト表示モードの切り替え
 * - ページネーション（9件ずつ表示）
 * - 統計ダッシュボード
 * - モダンUI/UXデザイン
 * - 研究配慮（文章内容を事前に表示しない）
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import ReadingTest from '../../components/ReadingTest';

/**
 * 読解練習ライブラリページコンポーネント
 * 
 * @returns {JSX.Element} 読解練習ライブラリページ
 */
export default function Reading() {
  // ===== 状態管理 =====
  const [selectedContent, setSelectedContent] = useState(null); // 選択されたコンテンツ
  const [searchTerm, setSearchTerm] = useState(''); // 検索キーワード
  const [levelFilter, setLevelFilter] = useState('all'); // レベルフィルタ（all, beginner, intermediate, advanced）
  const [sortBy, setSortBy] = useState('id'); // 並び替え基準（id, title, level, questions）
  const [viewMode, setViewMode] = useState('grid'); // 表示モード（grid or list）
  const [currentPage, setCurrentPage] = useState(1); // 現在のページ番号
  const itemsPerPage = 9; // 1ページあたりの表示件数
  const [readingContents, setReadingContents] = useState([]); // データベースから取得したコンテンツ
  const [loading, setLoading] = useState(true); // ローディング状態

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

  // ===== コンポーネント表示制御 =====
  /**
   * 読解テストが選択された場合、ReadingTestコンポーネントを表示
   */
  if (selectedContent) {
    return (
      <ReadingTest 
        content={selectedContent} 
        onBack={() => setSelectedContent(null)}
      />
    );
  }

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
    <div className="relative overflow-hidden min-h-screen">
      {/* 背景要素 - グラデーションとアニメーション */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20"></div>
      <div className="absolute inset-0">
        {/* アニメーション背景ボール */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* メインコンテンツエリア */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* ===== ヘッダーセクション ===== */}
        <div className="text-center mb-12">
          {/* ゴリラロゴ - ホバーアニメーション付き */}
          <div className="mb-6 transform hover:scale-105 transition-all duration-500">
            <img 
              src="/logos/gorilla-only-animated.svg" 
              alt="速読ゴリラ" 
              className="h-20 w-auto mx-auto drop-shadow-2xl"
            />
          </div>
          {/* ページタイトル - グラデーションテキスト */}
          <h1 className="text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            読解練習ライブラリ
          </h1>
          {/* サブタイトル */}
          <p className="text-lg text-gray-700 font-medium">
            お好みの<span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">文章</span>を選んでください
          </p>
        </div>

        {/* ===== 統計ダッシュボード ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* 総文章数 */}
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-4 border border-white/30 shadow-lg text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600 font-medium">総文章数</div>
          </div>
          {/* 初級レベル文章数 */}
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-4 border border-white/30 shadow-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.beginner}</div>
            <div className="text-sm text-gray-600 font-medium">初級レベル</div>
          </div>
          {/* 中級レベル文章数 */}
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-4 border border-white/30 shadow-lg text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.intermediate}</div>
            <div className="text-sm text-gray-600 font-medium">中級レベル</div>
          </div>
          {/* 上級レベル文章数 */}
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl p-4 border border-white/30 shadow-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.advanced}</div>
            <div className="text-sm text-gray-600 font-medium">上級レベル</div>
          </div>
        </div>

        {/* ===== コントロールパネル ===== */}
        <div className="backdrop-blur-xl bg-white/80 rounded-3xl p-6 border border-white/30 shadow-2xl mb-8">
          <div className="grid md:grid-cols-4 gap-4 items-end">
            {/* 検索入力欄 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">検索</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="タイトルやIDで検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                {/* 検索アイコン */}
                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* レベルフィルタ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">レベル</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">すべて</option>
                <option value="beginner">初級レベル</option>
                <option value="intermediate">中級レベル</option>
                <option value="advanced">上級レベル</option>
              </select>
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

          {/* 表示モード切り替えと検索結果情報 */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            {/* 検索結果件数表示 */}
            <div className="text-sm text-gray-600 font-medium">
              {filteredContents.length}件の文章が見つかりました
            </div>
            {/* 表示モード切り替えボタン */}
            <div className="flex items-center space-x-2">
              {/* グリッドビューボタン */}
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white shadow-lg' // アクティブ状態
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300' // 非アクティブ状態
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              {/* リストビューボタン */}
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white shadow-lg' // アクティブ状態
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300' // 非アクティブ状態
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* ===== コンテンツ表示エリア ===== */}
        {paginatedContents.length === 0 ? (
          /* 検索結果なしの場合の表示 */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">該当する文章が見つかりません</h3>
            <p className="text-gray-600">検索条件を変更してもう一度お試しください</p>
          </div>
        ) : (
          <>
            {/* ===== グリッドビュー表示 ===== */}
            {viewMode === 'grid' && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                {paginatedContents.map((content) => (
                  /* 個別文章カード - グリッド表示 */
                  <div 
                    key={content.id} 
                    className="group relative backdrop-blur-xl bg-white/80 rounded-3xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:bg-white/90"
                  >
                    {/* ホバー時のグロー効果 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      {/* カードヘッダー - レベルバッジとID */}
                      <div className="flex justify-between items-start mb-4">
                        {/* レベルバッジ - レベル別色分け */}
                        <span className={`inline-flex items-center px-3 py-1 rounded-2xl text-xs font-bold ${
                          content.levelCode === 'beginner' 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' // 初級レベル
                            : content.levelCode === 'intermediate'
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' // 中級レベル
                            : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' // 上級レベル
                        }`}>
                          {content.level}
                        </span>
                        {/* コンテンツID表示 */}
                        <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded-lg">
                          {content.id}
                        </div>
                      </div>

                      {/* 文章タイトル */}
                      <h2 className="text-xl font-bold text-gray-800 mb-4 leading-tight">
                        {content.title}
                      </h2>
                      
                      {/* 問題数表示エリア */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 mb-4">
                        <span className="text-sm font-semibold text-gray-700">問題数</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {content.questions.length}問
                        </span>
                      </div>

                      {/* 練習開始ボタン */}
                      <button
                        onClick={() => setSelectedContent(content)}
                        className="w-full group relative inline-flex items-center justify-center px-6 py-3 text-base font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <span className="relative z-10 flex items-center space-x-2">
                          <span>練習開始</span>
                          {/* 右矢印アイコン - ホバーでアニメーション */}
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== リストビュー表示 ===== */}
            {viewMode === 'list' && (
              <div className="space-y-4 mb-8">
                {paginatedContents.map((content) => (
                  /* 個別文章カード - リスト表示 */
                  <div 
                    key={content.id} 
                    className="group backdrop-blur-xl bg-white/80 rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90"
                  >
                    <div className="flex items-center justify-between">
                      {/* 左側 - 文章情報 */}
                      <div className="flex items-center space-x-6">
                        {/* コンテンツID */}
                        <div className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-lg">
                          {content.id}
                        </div>
                        {/* タイトルとメタ情報 */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{content.title}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            {/* レベルバッジ - リスト表示用（控えめなスタイル） */}
                            <span className={`inline-flex items-center px-2 py-1 rounded-xl text-xs font-bold ${
                              content.levelCode === 'beginner' 
                                ? 'bg-blue-100 text-blue-700' // 初級レベル
                                : content.levelCode === 'intermediate'
                                ? 'bg-emerald-100 text-emerald-700' // 中級レベル
                                : 'bg-purple-100 text-purple-700' // 上級レベル
                            }`}>
                              {content.level}
                            </span>
                            {/* 問題数表示 */}
                            <span className="text-sm text-gray-600">{content.questions.length}問</span>
                          </div>
                        </div>
                      </div>
                      {/* 右側 - 練習開始ボタン */}
                      <button
                        onClick={() => setSelectedContent(content)}
                        className="group relative inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <span className="relative z-10 flex items-center space-x-2">
                          <span>開始</span>
                          {/* 右矢印アイコン - ホバーでアニメーション */}
                          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== ページネーション ===== */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                {/* 前のページボタン */}
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  前へ
                </button>
                
                {/* ページ番号ボタン（最大5ページ表示） */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(1, currentPage - 2);
                  if (page > totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        currentPage === page
                          ? 'bg-blue-500 text-white shadow-lg' // 現在のページ
                          : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50' // その他のページ
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                {/* 次のページボタン */}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  次へ
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}