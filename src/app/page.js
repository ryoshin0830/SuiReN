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
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          このサイトについて
        </h2>
        <div className="text-gray-700 space-y-4 leading-relaxed">
          <p>
            このサイトは、日本語を読むときの流暢さを育むために、速読の練習ができるサイトです。流暢さは、「<strong>大意を正確に理解しながら、適度な速さで文章を読み進めるスキル</strong>」と理解してください。
          </p>
          <p>
            文章を読むとき、流暢に読めなければ楽しむことができません。また、楽しめなければ多くの文章を読みたいと思えないでしょう。そのため、流暢に読めるということは、大変重要なのです。それは、母語の文章を読むときも、外国語の文章を読むときも同じです。
          </p>
          <p>
            では流暢さを育むためにはどうしたらよいのでしょうか。有効な方法の一つがこのサイトで練習できる<strong>速読</strong>です。簡単に言うと、「知らない単語がほとんどない簡単な文章を、7割以上ぐらいの内容理解を目標にして、なるべく速く読む練習」です。この速読練習によって、文章をプロセスするスキルが高まって、流暢さが育まれます。
          </p>
          <p>
            ただ速く読むことだけを目標とするのではなく、内容が<strong>7割程度は正確に理解できるような速さ</strong>で読むということに注意してください。これが上記の「適度な速さ」だと言えます。たとえるなら、母語で、比較的わかり易い内容の新聞やオンライン記事や雑誌の記事を読むような感じです。
          </p>
          <p>
            このような速読の練習が効果を持つことは、第二言語としての英語の研究分野でその効果が認められてきました。（研究の歴史を知りたい方は、運営者の田畑サンドーム光恵までご連絡ください。）
          </p>
          <p>
            具体的な練習の方法は、「<Link href="/reading" className="text-blue-600 hover:text-blue-800 underline">速読をやってみよう！</Link>」で説明されています。
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
