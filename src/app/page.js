import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <img 
            src="/logos/gorilla-complete-balanced.svg" 
            alt="速読ゴリラ" 
            className="h-32 w-auto"
          />
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
私たちは、「文章をよくわかりながら速く読むこと」を、<strong>「速読ゴリラ」</strong>と言うことにしました。ゴリラのように、力強く、そして速く文章を読んでほしいと思います。皆さんに日本語の文章を、よくわかって、楽しく速く読んでほしいと思います。
          </p>
          
          <p>
「速読ゴリラ」の練習では、とても簡単な文章を、なるべく速く読みます。でも、早すぎてはだめです。<strong>大体の意味がわかるように</strong>、そして、速く読んでください。何回もこの練習をしていると、楽しく速く読めるようになりますよ。
          </p>
          
          <p className="text-center text-blue-600 font-medium text-xl">
            みなさん、がんばって！
          </p>
          
          <p className="text-right text-gray-600 text-base">
速読ゴリラ・チーム
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
