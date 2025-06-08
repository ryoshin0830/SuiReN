/**
 * Homepage - 速読ゴリラアプリケーションのトップページ
 * 
 * 機能:
 * - ヒーローセクションでサイトの紹介
 * - モダンなUI/UXデザイン（ガラスモーフィズム・グラデーション）
 * - 読解練習への導線（CTA）
 * - サイト説明と使い方の詳細
 * - レスポンシブデザイン
 */

import Link from 'next/link';

/**
 * ホームページコンポーネント
 * 
 * @returns {JSX.Element} ホームページ要素
 */
export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* ===== ヒーローセクション ===== */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20"></div>
        {/* アニメーション背景要素 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        {/* メインコンテンツエリア */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
          {/* ゴリラロゴ - ホバーアニメーション付き */}
          <div className="mb-12 transform hover:scale-105 transition-all duration-500">
            <img 
              src="/logos/gorilla-only-animated.svg" 
              alt="速読ゴリラ" 
              className="h-48 w-auto mx-auto drop-shadow-2xl"
            />
          </div>
          
          {/* サイトタイトル - グラデーションテキスト */}
          <h1 className="text-6xl lg:text-7xl font-black mb-8 bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
            速読ゴリラ
          </h1>
          
          {/* サブタイトル */}
          <p className="text-2xl lg:text-3xl font-light text-gray-700 mb-12 leading-relaxed">
            日本語学習者のための
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              速読練習サイト
            </span>
          </p>
          
          {/* CTA（Call To Action）ボタンエリア */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {/* メインCTAボタン - 読解練習開始 */}
            <Link 
              href="/reading"
              className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <span className="relative z-10">速読をはじめる</span>
              {/* ホバー時のグロー効果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            {/* セカンダリボタン - 詳細説明ページ */}
            <Link 
              href="/about"
              className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-semibold text-gray-700 bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-white hover:text-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/40"
            >
              詳しく知る
            </Link>
          </div>
        </div>
      </div>

      {/* ===== サイト説明セクション ===== */}
      <div className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* メインの説明カード - ガラスモーフィズム効果 */}
          <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-12 shadow-2xl border border-white/20 mb-16">
            {/* セクションタイトル */}
            <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              このサイトについて
            </h2>
            {/* 説明文章エリア */}
            <div className="text-gray-700 space-y-6 leading-relaxed text-lg lg:text-xl max-w-4xl mx-auto">
              {/* 導入文 */}
              <p className="text-xl font-medium">
                このウェブサイトでは、日本語を<span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">「速く読む練習」</span>ができます。
              </p>
              
              {/* 質問ボックス - 注意を引くデザイン */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-l-4 border-blue-500">
                <p className="text-blue-800 font-semibold text-xl">
                  「どうして速く読んだ方がいいの？」
                </p>
              </div>
              
              {/* 速読の重要性説明 */}
              <p>
                文章を読むとき、すごくおそく読むと、わからなくなります。わからなくなると、楽しくありません。また、すごくおそく読むと、たくさん読めませんから、読むことが上手になりません。そうすると、日本語を読むことが好きになれません。
              </p>
              
              {/* 「速読ゴリラ」コンセプト説明ボックス */}
              <div className="p-8 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 rounded-2xl border border-purple-200/50">
                <p className="text-center text-xl font-semibold">
                  私たちは、「文章をよくわかりながら速く読むこと」を、<span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">「速読ゴリラ」</span>と言うことにしました。ゴリラのように、力強く、そして速く文章を読んでほしいと思います。
                </p>
              </div>
              
              {/* 練習方法の説明 */}
              <p>
                「速読ゴリラ」の練習では、とても簡単な文章を、なるべく速く読みます。でも、早すぎてはだめです。<span className="font-bold text-blue-600">大体の意味がわかるように</span>、そして、速く読んでください。何回もこの練習をしていると、楽しく速く読めるようになりますよ。
              </p>
              
              {/* 応援メッセージエリア */}
              <div className="text-center py-8">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  みなさん、がんばって！
                </p>
                <p className="text-gray-600 text-lg mt-4 font-medium">
                  速読ゴリラ・チーム
                </p>
              </div>
            </div>
          </div>


          {/* ===== 最終CTAセクション ===== */}
          <div className="text-center">
            {/* CTAカード */}
            <div className="backdrop-blur-xl bg-white/60 rounded-3xl p-12 border border-white/30 shadow-xl">
              {/* CTA見出し */}
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
              日本語を速く、正確に読む練習をしてみませんか？
              </h3>
              {/* 最終CTAボタン - 目立つデザイン */}
              <Link 
                href="/reading"
                className="group relative inline-flex items-center justify-center px-16 py-6 text-2xl font-bold text-white bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-2xl hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl"
              >
                <span className="relative z-10">速読をやってみよう！</span>
                {/* ホバー時のグロー効果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/50 to-purple-400/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
