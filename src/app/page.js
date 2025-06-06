import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          すいすいリーダー
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          日本語学習者のための速読練習サイト
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          このサイトについて
        </h2>
        <div className="text-gray-700 space-y-4">
          <p>
            すいすいリーダーは、日本語を学ぶ皆さんの<strong>読むスピード</strong>を上げるためのサイトです。
          </p>
          <p>
            短い文章を読んで、質問に答えてください。
            読む時間や正解の数がわかります。
          </p>
          <p>
            練習を続けると、日本語がもっと<strong>スムーズ</strong>に読めるようになります。
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
          読解練習を始める
        </Link>
      </div>

      <div className="mt-12 text-center text-sm text-gray-500">
        <p>読み終わったら、結果をQRコードで保存できます</p>
      </div>
    </div>
  );
}
