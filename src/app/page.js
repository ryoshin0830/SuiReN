/**
 * Homepage - 速読ゴリラアプリケーションのトップページ
 * 
 * 機能:
 * - ヒーローセクションでサイトの紹介（ツーカラムレイアウト）
 * - モダンなUI/UXデザイン（ガラスモーフィズム・グラデーション）
 * - 読解練習への導線（CTA）
 * - サイト説明と使い方の詳細（ツーカラムレイアウト）
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
      {/* ===== ヒーローセクション（ツーカラム） ===== */}
      <div className="relative min-h-screen flex items-center">
        {/* 背景グラデーション */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20"></div>
        {/* アニメーション背景要素 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        {/* ツーカラムコンテンツ */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左カラム - メインコンテンツ */}
            <div className="text-center lg:text-left">
              {/* サイトタイトル - グラデーションテキスト */}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black mb-6 bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                速読ゴリラ
              </h1>
              
              {/* サブタイトル */}
              <p className="text-xl lg:text-2xl xl:text-3xl font-light text-gray-700 mb-8 leading-relaxed">
                日本語学習者のための
                <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block lg:inline">
                  速読練習サイト
                </span>
              </p>
              
              {/* 説明文 */}
              <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                文章を楽しく、速く、正確に読む力を身につけましょう。簡単な練習から始めて、ゴリラのように力強い読解力を育てます。
              </p>
              
              {/* CTA（Call To Action）ボタンエリア */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {/* メインCTAボタン - 読解練習開始 */}
                <Link 
                  href="/reading"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  <span className="relative z-10">速読をはじめる</span>
                  {/* ホバー時のグロー効果 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                {/* セカンダリボタン - 詳細説明ページ */}
                <Link 
                  href="/about"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white/80 backdrop-blur-sm rounded-2xl hover:bg-white hover:text-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/40"
                >
                  詳しく知る
                </Link>
              </div>
            </div>

            {/* 右カラム - ゴリラロゴ */}
            <div className="flex justify-center lg:justify-end">
              <div className="transform hover:scale-105 transition-all duration-500">
                <img 
                  src="/logos/gorilla-only-animated.svg" 
                  alt="速読ゴリラ" 
                  className="h-64 lg:h-80 xl:h-96 w-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== サイト説明セクション（ツーカラム） ===== */}
      <div className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* セクションタイトル */}
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-16 text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            このサイトについて
          </h2>

          {/* ツーカラム説明エリア */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            
            {/* 左カラム - サイトの目的 */}
            <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/20">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                速読ゴリラとは？
              </h3>
              
              <div className="text-gray-700 space-y-6 leading-relaxed text-base lg:text-lg">
                <p className="font-medium">
                  このウェブサイトでは、日本語を<span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">「速く読む練習」</span>ができます。
                </p>
                
                <div className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 rounded-2xl border border-purple-200/50">
                  <p className="text-center font-semibold">
                    私たちは、「文章をよくわかりながら速く読むこと」を、<span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">「速読ゴリラ」</span>と言うことにしました。
                  </p>
                </div>

                <p>
                  ゴリラのように、力強く、そして速く文章を読んでほしいと思います。楽しく読解力を向上させましょう。
                </p>
              </div>
            </div>

            {/* 右カラム - 速読の重要性と練習方法 */}
            <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/20">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                なぜ速読が大切？
              </h3>
              
              <div className="text-gray-700 space-y-6 leading-relaxed text-base lg:text-lg">
                {/* 質問ボックス */}
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-l-4 border-blue-500">
                  <p className="text-blue-800 font-semibold">
                    「どうして速く読んだ方がいいの？」
                  </p>
                </div>
                
                <p>
                  文章を読むとき、すごくおそく読むと、わからなくなります。わからなくなると、楽しくありません。また、すごくおそく読むと、たくさん読めませんから、読むことが上手になりません。
                </p>
                
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200">
                  <h4 className="font-bold text-emerald-700 mb-2">練習方法</h4>
                  <p className="text-sm">
                    とても簡単な文章を、なるべく速く読みます。でも、早すぎてはだめです。<span className="font-bold text-blue-600">大体の意味がわかるように</span>、そして、速く読んでください。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 応援メッセージエリア */}
          <div className="backdrop-blur-xl bg-white/60 rounded-3xl p-8 lg:p-12 border border-white/30 shadow-xl text-center mb-12">
            <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              みなさん、がんばって！
            </p>
            <p className="text-gray-600 text-lg font-medium">
              速読ゴリラ・チーム
            </p>
          </div>

          {/* ===== 最終CTAセクション ===== */}
          <div className="text-center">
            {/* CTAカード */}
            <div className="backdrop-blur-xl bg-white/60 rounded-3xl p-8 lg:p-12 border border-white/30 shadow-xl">
              {/* CTA見出し */}
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
                日本語を速く、正確に読む練習をしてみませんか？
              </h3>
              {/* 最終CTAボタン - 目立つデザイン */}
              <Link 
                href="/reading"
                className="group relative inline-flex items-center justify-center px-12 lg:px-16 py-5 lg:py-6 text-xl lg:text-2xl font-bold text-white bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 rounded-2xl hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-3xl"
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
