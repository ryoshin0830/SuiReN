/**
 * Layout.js - 速読ゴリラアプリケーションのメインレイアウトコンポーネント
 * 
 * 機能:
 * - 全ページ共通のナビゲーションバーを提供
 * - レスポンシブデザインとモダンUI/UX
 * - ガラスモーフィズムエフェクトとアニメーション
 * - アクティブページの視覚的表示
 * - ゴリラロゴとブランディング要素
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * メインレイアウトコンポーネント
 * 
 * @param {Object} props - コンポーネントのプロパティ
 * @param {React.ReactNode} props.children - 子コンポーネント（ページコンテンツ）
 * @returns {JSX.Element} レイアウト要素
 */
export default function Layout({ children }) {
  // 現在のパスを取得してアクティブな Navigation リンクを判定
  const pathname = usePathname();

  return (
    // メインコンテナ - グラデーション背景とフルハイト設定
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      
      {/* ナビゲーションバー - スティッキー配置とガラスモーフィズム効果 */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* ロゴ・ブランド部分 */}
            <div className="flex items-center">
              <Link href="/" className="group flex items-center space-x-3 transition-all duration-300 hover:scale-105">
                
                {/* ゴリラロゴ - ホバーエフェクト付き */}
                <div className="relative">
                  <img 
                    src="/logos/gorilla-only-friendly.svg" 
                    alt="速読ゴリラ" 
                    className="h-12 w-auto transition-all duration-300 group-hover:drop-shadow-lg"
                  />
                  {/* ホバー時のグロー効果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* サイト名 - グラデーションテキスト */}
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  速読ゴリラ
                </span>
              </Link>
            </div>
            
            {/* ナビゲーションメニュー */}
            <div className="flex items-center space-x-2">
              
              {/* ホームページリンク */}
              <Link 
                href="/" 
                className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  pathname === '/' 
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25' // アクティブ状態
                    : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25' // 非アクティブ状態
                }`}
              >
                <span className="relative z-10">ホーム</span>
              </Link>
              
              {/* Fluency説明ページリンク */}
              <Link 
                href="/about" 
                className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  pathname === '/about' 
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25' // アクティブ状態
                    : 'text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25' // 非アクティブ状態
                }`}
              >
                <span className="relative z-10">Fluencyについて</span>
              </Link>
              
              {/* 読解練習ページリンク - メインCTA */}
              <Link 
                href="/reading" 
                className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  pathname === '/reading' 
                    ? 'text-white bg-gradient-to-r from-emerald-600 to-blue-600 shadow-lg shadow-emerald-500/25 transform scale-105' // アクティブ状態
                    : 'text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105' // 非アクティブ状態
                }`}
              >
                <span className="relative z-10">読解練習</span>
              </Link>
              
              {/* 管理画面リンク - 控えめなスタイル */}
              <Link 
                href="/admin" 
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  pathname === '/admin' 
                    ? 'text-purple-600 bg-purple-50' // アクティブ状態
                    : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50' // 非アクティブ状態
                }`}
              >
                <span className="relative z-10">管理</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* メインコンテンツエリア - 各ページのコンテンツが表示される */}
      <main className="relative">{children}</main>
    </div>
  );
}