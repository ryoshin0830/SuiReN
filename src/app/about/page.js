export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 pb-safe-area-inset-bottom pb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Fluency（流暢さ）について
      </h1>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Fluencyとは何か
        </h2>
        <div className="text-gray-700 space-y-4">
          <p>
            <strong>Fluency（流暢さ）</strong>とは、言語を自然でスムーズに使える能力のことです。
            第二言語学習において、fluencyは非常に重要な概念です。
          </p>
          <p>
            読解におけるfluencyは、<strong>正確性</strong>、<strong>自動性</strong>、<strong>速度</strong>の
            3つの要素から構成されます。
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">
            正確性（Accuracy）
          </h3>
          <p className="text-blue-700">
            文字、語彙、文法を正しく理解する能力。
            間違いなく読むことができるかどうかです。
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-green-900 mb-4">
            自動性（Automaticity）
          </h3>
          <p className="text-green-700">
            意識的な努力なしに読める能力。
            考えなくても自然に読めることです。
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-purple-900 mb-4">
            速度（Rate）
          </h3>
          <p className="text-purple-700">
            適切なスピードで読める能力。
            速すぎず遅すぎない自然な速度です。
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          多読と速読の関係
        </h2>
        <div className="text-gray-700 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">多読（Extensive Reading）</h3>
          <p>
            簡単な読み物を大量に読むことで、第二言語読解の総合的な力を伸ばす学習方法です。
            特に流暢さと情意面での効果が期待できます。
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>読み物は既知語率95-96％が適切</li>
            <li>英語読解では98％が望ましい</li>
            <li>楽しみながら読むことが重要</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-6">速読（Speed Reading）</h3>
          <p>
            多読プログラム内で併用することで、読みの流暢さを高める相乗効果を発揮できます。
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>読み物の既知語率は100％であるべき</li>
            <li>文法項目もすべて既習であるべき</li>
            <li>理解度よりも速度に重点を置く</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          SuiReN（睡蓮）の役割
        </h2>
        <div className="text-gray-700 space-y-4">
          <p>
            SuiReN（睡蓮）は、速読練習を通じて日本語学習者の読解fluencyを向上させることを目的としています。
          </p>
          <p>
            レベル別に設計されたコンテンツにより、学習者は自分のレベルに適した速読練習を行うことができます。
            読了時間と理解度の測定により、学習者は自分の進歩を客観的に把握できます。
          </p>
          <p>
            継続的な練習により、日本語を読む際の自動性が向上し、
            より自然で流暢な読解能力の獲得が期待できます。
          </p>
        </div>
      </div>
    </div>
  );
}