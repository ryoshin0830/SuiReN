/**
 * Homepage - SuiReNアプリケーションのトップページ
 * 
 * 機能:
 * - ヒーローセクションでサイトの紹介（インパクトのあるデザイン）
 * - 3ステップの練習方法を視覚的に表示
 * - 速読効果の簡潔な説明
 * - /aboutページへの誘導
 * - モダンでレスポンシブなデザイン
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
      <div className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-[60vh] lg:min-h-[50vh] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100 rounded-full blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-100 rounded-full blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 min-h-[60vh] lg:min-h-[50vh] flex items-center py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
            {/* 左側：テキストコンテンツ */}
            <div className="text-center lg:text-left lg:pl-8 xl:pl-16 relative z-30">
              {/* タイトル */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-2">
                SuiReN
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 mb-6">
                Sui Sui Reading Nihongo
              </p>

              {/* メインタイトル */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                日本語学習者のための
                <span className="text-blue-600 block mt-2">インタラクティブ速読練習</span>
              </h2>

              {/* 説明文 */}
              <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
                速く、正確に、楽しく。<br />
                日本語の読み物を読む力を身につけよう
              </p>

              {/* CTAボタン */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/reading"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-200"
                >
                  練習を始める
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                <Link 
                  href="#how-to"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
                >
                  練習方法を見る
                </Link>
              </div>
            </div>

            {/* 右側：超ダイナミックアニメーションロゴ - デスクトップでは右にオーバーフロー */}
            <div className="relative order-first lg:order-last">
              <div className="relative flex items-center justify-center">
                <div className="relative">
                  {/* 多層背景エフェクト */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full blur-3xl opacity-30 scale-150 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-blue-400 rounded-full blur-2xl opacity-20 scale-125 animate-pulse animation-delay-2000"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full blur-3xl opacity-15 scale-110 animate-pulse animation-delay-4000"></div>
                  
                  {/* 回転する装飾リング */}
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200 opacity-20 scale-110 animate-spin-slow"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-purple-200 opacity-20 scale-125 animate-spin-reverse"></div>
                  
                  {/* 超巨大アニメーションロゴ */}
                  <div className="relative animate-float">
                    <div className="animate-logo-3d">
                      <img 
                        src="/logos/logo-only-animated.svg" 
                        alt="SuiReN Logo" 
                        className="relative z-10 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] xl:w-[600px] xl:h-[600px] 2xl:w-[700px] 2xl:h-[700px] object-contain animate-logo-pulse-scale"
                      />
                    </div>
                  </div>
                  
                  {/* パーティクルエフェクト */}
                  <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400 rounded-full animate-float-delay-1 opacity-50"></div>
                  <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400 rounded-full animate-float-delay-2 opacity-50"></div>
                  <div className="absolute bottom-20 left-20 w-5 h-5 bg-cyan-400 rounded-full animate-float-delay-3 opacity-50"></div>
                  <div className="absolute bottom-40 right-10 w-4 h-4 bg-pink-400 rounded-full animate-float-delay-4 opacity-50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== このサイトについてセクション ===== */}
      <div className="relative py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
            <h2 className="text-4xl lg:text-5xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                このサイトについて
              </span>
            </h2>
            
            <div className="text-gray-700 space-y-6 leading-relaxed">
              <p className="text-lg">
                このウェブサイトでは、日本語を「速く読む練習」ができます。
              </p>
              
              <p className="text-lg">
                私たちは、みなさんに日本語の読み物を、楽しくスラスラと読んでほしいと思います。
              </p>
              
              <p className="text-lg">
                「<span className="font-bold text-blue-600">SuiReN</span>」の練習では、簡単な読み物を、なるべく速く読みます。でも、速すぎてはだめです。だいたいの意味がわかるように、そして、速く読んでください。何回もこの練習をしていると、楽しくスラスラ読めるようになりますよ。
              </p>
              
              <div className="text-center mt-8">
                <p className="text-xl font-semibold text-gray-800 mb-2">
                  みなさん、がんばって！
                </p>
                <p className="text-lg text-gray-600">
                  SuiReN・チーム
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 3ステップ練習方法セクション ===== */}
      <div id="how-to" className="relative py-20 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          {/* セクションタイトル */}
          <div className="text-center mb-16">
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                3ステップで簡単
              </span>
            </h2>
            <p className="text-2xl text-gray-600">SuiReNの練習方法</p>
          </div>

          {/* 3ステップカード */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* ステップ1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                <div className="text-6xl font-black text-blue-500 mb-4">01</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">レベルを選ぶ</h3>
                <p className="text-gray-600 leading-relaxed">
                  自分のレベルに合った読み物を選びます。簡単すぎず、難しすぎない、ちょうどいいレベルから始めましょう。
                </p>
              </div>
            </div>

            {/* ステップ2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 rounded-3xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-300"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                <div className="text-6xl font-black text-purple-500 mb-4">02</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">速く読む</h3>
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-bold text-purple-600">大体の意味がわかる速さ</span>で読みます。完璧に理解しようとせず、全体の流れをつかみましょう。
                </p>
              </div>
            </div>

            {/* ステップ3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-pink-600 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                <div className="text-6xl font-black text-pink-500 mb-4">03</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">結果を確認</h3>
                <p className="text-gray-600 leading-relaxed">
                  読み終わったら、理解度クイズに答えて、速度と理解度のバランスをチェックします。
                </p>
              </div>
            </div>
          </div>

          {/* 重要ポイント */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-8 border-2 border-orange-200 shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <span className="text-4xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-center text-orange-800 mb-4">
                速さと理解のバランスが大切！
              </h3>
              <p className="text-lg text-center text-orange-700 leading-relaxed">
                速すぎて何もわからないのはダメ。<br />
                遅すぎて全部理解しようとするのもダメ。<br />
                <span className="font-bold text-xl">ちょうどいい速さ</span>を見つけることが、<ruby>速読<rt>そくどく</rt></ruby><ruby>上達<rt>じょうたつ</rt></ruby>の<ruby>秘訣<rt>ひけつ</rt></ruby>です。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 効果と特徴セクション ===== */}
      <div className="relative py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              なぜSuiReN？
            </h2>
            <p className="text-xl text-gray-600"><ruby>科学的<rt>かがくてき</rt></ruby>に<ruby>設計<rt>せっけい</rt></ruby>された<ruby>速読<rt>そくどく</rt></ruby><ruby>練習<rt>れんしゅう</rt></ruby>システム</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左側：特徴リスト */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">レベル別コンテンツ</h3>
                  <p className="text-gray-600">中級前半から上級まで、段階的に速読力を向上</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">リアルタイム測定</h3>
                  <p className="text-gray-600">読書速度（WPM）と理解度を即座に計測</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">インタラクティブ学習</h3>
                  <p className="text-gray-600">クイズ形式で楽しく理解度をチェック</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">進歩の可視化</h3>
                  <p className="text-gray-600">練習の成果が数値で確認できる</p>
                </div>
              </div>
            </div>

            {/* 右側：効果説明 */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-10 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">速読で得られる効果</h3>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  読み物を<span className="font-bold text-blue-600">速く読む</span>ことで、全体の意味を効率的に把握できるようになります。
                </p>
                <p className="leading-relaxed">
                  継続的な練習により、日本語の<span className="font-bold text-purple-600">読解の自動性</span>が向上し、母語話者に近い流暢な読みが可能になります。
                </p>
                <p className="leading-relaxed">
                  速読スキルは、<span className="font-bold text-pink-600">学習効率の向上</span>にもつながり、より多くの日本語に触れることができます。
                </p>
              </div>
              <div className="mt-8">
                <Link 
                  href="/about"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold group"
                >
                  理論的背景について詳しく見る
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FAQセクション ===== */}
      <div className="relative py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              よくある質問
            </h2>
            <p className="text-xl text-gray-600">SuiReNについての疑問にお答えします</p>
          </div>
          
          <div className="space-y-6">
            {/* FAQ 1 */}
            {/* FAQ 2 */}
            <details className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <summary className="cursor-pointer font-semibold text-lg text-gray-800 flex items-center justify-between">
                <span className="flex items-center">
                  <span className="text-2xl mr-3">🎯</span>
                  目標とする読書速度はどのくらいですか？
                </span>
                <svg className="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 text-gray-700">
                <p className="font-semibold mb-2">日本語学習者の目標速度：</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
                  <li>初級：50-100語/分</li>
                  <li>中級：100-200語/分</li>
                  <li>上級：200-300語/分</li>
                </ul>
                <p className="font-semibold mb-2">参考：日本語ネイティブスピーカー：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>小学生：100-200語/分</li>
                  <li>中学生：200-300語/分</li>
                  <li>高校生：300-400語/分</li>
                  <li>大学生・成人：400-600語/分</li>
                </ul>
              </div>
            </details>
            
            {/* FAQ 3 */}
            <details className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <summary className="cursor-pointer font-semibold text-lg text-gray-800 flex items-center justify-between">
                <span className="flex items-center">
                  <span className="text-2xl mr-3">📈</span>
                  速読練習で本当に効果がありますか？
                </span>
                <svg className="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 text-gray-700 space-y-3">
                <p>
                  はい、研究により速読練習の効果が確認されています。
                  特に、多読プログラムの中で速読を併用することで、
                  読解の流暇さ（fluency）を高める相乗効果が期待できます。
                </p>
                <p>
                  継続的な練習により、以下の効果が期待できます：
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>読解の自動性の向上</li>
                  <li>語彙認識の高速化</li>
                  <li>文法処理の自動化</li>
                  <li>全体的な読解力の向上</li>
                </ul>
              </div>
            </details>
            
            {/* FAQ 4 */}
            <details className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <summary className="cursor-pointer font-semibold text-lg text-gray-800 flex items-center justify-between">
                <span className="flex items-center">
                  <span className="text-2xl mr-3">❓</span>
                  速読と精読の違いは何ですか？
                </span>
                <svg className="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-4 text-gray-700 space-y-3">
                <p>
                  <strong>速読</strong>は、全体的な意味を素早くつかむことを目的とし、
                  細部にこだわらずに読み進めます。
                </p>
                <p>
                  <strong>精読</strong>は、一字一句まで正確に理解することを目的とし、
                  時間をかけて丁寧に読みます。
                </p>
                <p>
                  SuiReNでは速読スキルの向上に焦点を当てていますが、
                  両方のスキルがバランス良く身に付くことが理想的です。
                </p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* ===== 最終CTA ===== */}
      <div className="relative py-20 px-6 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            準備はできましたか？
          </h2>
          <p className="text-xl lg:text-2xl text-white/90 mb-12 leading-relaxed">
            今日から<br />
            日本語の読み物をスイスイ読めるようになりましょう！
          </p>
          
          <Link 
            href="/reading"
            className="group relative inline-flex items-center justify-center px-10 sm:px-14 py-5 sm:py-7 text-2xl sm:text-3xl font-black text-gray-800 bg-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 animate-pulse-glow"
          >
            <div className="absolute inset-0 rounded-full animate-shine"></div>
            <span className="relative z-10 flex items-center gap-3 sm:gap-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="animate-text-pulse">START</span>
            </span>
          </Link>

          <div className="mt-8">
            <p className="text-white/70 text-lg">
              SuiReN・チーム
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}