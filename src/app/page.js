import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <svg width="300" height="100" viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" className="h-20">
            {/* Book pages */}
            <rect x="15" y="25" width="18" height="22" fill="#F1F5F9" stroke="#64748B" strokeWidth="1" rx="1"/>
            <rect x="18" y="22" width="18" height="22" fill="#F8FAFC" stroke="#3B82F6" strokeWidth="1" rx="1"/>
            <rect x="21" y="19" width="18" height="22" fill="white" stroke="#06B6D4" strokeWidth="1" rx="1"/>
            {/* Page lines */}
            <line x1="23" y1="23" x2="37" y2="23" stroke="#CBD5E1" strokeWidth="0.5"/>
            <line x1="23" y1="26" x2="35" y2="26" stroke="#CBD5E1" strokeWidth="0.5"/>
            <line x1="23" y1="29" x2="37" y2="29" stroke="#CBD5E1" strokeWidth="0.5"/>
            <line x1="23" y1="32" x2="32" y2="32" stroke="#CBD5E1" strokeWidth="0.5"/>
            <line x1="23" y1="35" x2="36" y2="35" stroke="#CBD5E1" strokeWidth="0.5"/>
            <line x1="23" y1="38" x2="34" y2="38" stroke="#CBD5E1" strokeWidth="0.5"/>
            
            {/* Flowing letters */}
            <text x="50" y="35" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#3B82F6" transform="rotate(-3 50 35)">す</text>
            <text x="65" y="30" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#06B6D4" transform="rotate(-1 65 30)">い</text>
            <text x="80" y="32" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#0EA5E9" transform="rotate(2 80 32)">す</text>
            <text x="95" y="28" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#3B82F6" transform="rotate(1 95 28)">い</text>
            
            {/* Regular text */}
            <text x="115" y="30" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#1E40AF">リーダー</text>
            <text x="115" y="45" fontFamily="Arial, sans-serif" fontSize="10" fill="#64748B">SuiSui Reader</text>
          </svg>
        </div>
        <p className="text-xl text-gray-600 mb-8">
          日本語学習者のための速読練習サイト
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          このサイトについて
        </h2>
        <div className="text-gray-700 space-y-4 leading-relaxed text-lg">
          <p>
            このウェブサイトでは、日本語を<strong>「速く読む練習」</strong>ができます。
          </p>
          
          <p className="text-blue-700 font-medium">
            「どうして速く読んだ方がいいの？」
          </p>
          
          <p>
            文章を読むとき、すごくおそく読むと、わからなくなります。わからなくなると、楽しくありません。また、すごくおそく読むと、たくさん読めませんから、読むことが上手になりません。そうすると、日本語を読むことが好きになれません。
          </p>
          
          <p>
            私たちは、「文章をよくわかりながら速く読むこと」を、<strong>「すいすいリーダー」</strong>と言うことにしました。海や川で、すいすいと楽しく泳いでいるように、皆さんに日本語の文章を、よくわかって、楽しく速く読んでほしいと思います。
          </p>
          
          <p>
            「すいすいリーダー」の練習では、とても簡単な文章を、なるべく速く読みます。でも、早すぎてはだめです。<strong>大体の意味がわかるように</strong>、そして、速く読んでください。何回もこの練習をしていると、楽しく速く読めるようになりますよ。
          </p>
          
          <p className="text-center text-blue-600 font-medium text-xl">
            みなさん、がんばって！
          </p>
          
          <p className="text-right text-gray-600 text-base">
            すいすいリーダー・チーム
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            初級修了レベル
          </h3>
          <p className="text-blue-700 mb-4">
            やさしい日本語の文章で練習できます
          </p>
          <div className="text-sm text-blue-600">
            例：ももたろう
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            中級レベル
          </h3>
          <p className="text-green-700 mb-4">
            少し難しい文章で練習できます
          </p>
          <div className="text-sm text-green-600">
            例：仏教について
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            上級レベル
          </h3>
          <p className="text-purple-700 mb-4">
            難しい文章で練習できます
          </p>
          <div className="text-sm text-purple-600">
            例：エチオピアのコーヒー
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link 
          href="/reading"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          速読をやってみよう！
        </Link>
      </div>

      <div className="mt-12 text-center text-sm text-gray-500">
        <p>読み終わったら、結果をQRコードで保存できます</p>
      </div>
    </div>
  );
}
