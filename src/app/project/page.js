'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function ProjectPage() {
  const [siteInfo, setSiteInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteInfo();
  }, []);

  const fetchSiteInfo = async () => {
    try {
      const response = await fetch('/api/site-info');
      const data = await response.json();
      setSiteInfo(data);
    } catch (error) {
      console.error('Failed to fetch site info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-8 px-4 flex items-center justify-center">
          <div className="text-white text-xl">読み込み中...</div>
        </div>
      </Layout>
    );
  }

  if (!siteInfo) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-8 px-4 flex items-center justify-center">
          <div className="text-white text-xl">サイト情報を読み込めませんでした</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl">
            <h1 className="text-4xl font-bold text-white mb-8 text-center">
              {siteInfo.title}について
            </h1>
            
            <div className="space-y-8 text-white">
              <section>
                <h2 className="text-2xl font-semibold mb-4">{siteInfo.title}とは</h2>
                <p className="leading-relaxed">
                  {siteInfo.description}
                </p>
              </section>

              {siteInfo.developers && siteInfo.developers.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-4">開発者</h2>
                  <div className="space-y-4">
                    {siteInfo.developers.map((developer, index) => (
                      <div key={index} className="bg-white/10 rounded-lg p-4">
                        <h3 className="font-semibold text-lg">{developer.name}</h3>
                        <p className="text-white/80">{developer.role}</p>
                        {developer.description && (
                          <p className="mt-2 text-white/70">{developer.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {siteInfo.features && siteInfo.features.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-4">主な機能</h2>
                  <ul className="space-y-3">
                    {siteInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-2xl mr-3">{feature.icon}</span>
                        <div>
                          <h3 className="font-semibold">{feature.title}</h3>
                          <p className="text-white/80">{feature.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {siteInfo.usage && siteInfo.usage.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-4">使い方</h2>
                  <ol className="space-y-3">
                    {siteInfo.usage.map((step, index) => (
                      <li key={index} className="flex">
                        <span className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                          {step.step}
                        </span>
                        <p>{step.description}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              <section>
                <h2 className="text-2xl font-semibold mb-4">成績の見方</h2>
                <div className="bg-white/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded mr-3"></div>
                    <p>緑色のQRコード：80%以上の正答率（優秀）</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-500 rounded mr-3"></div>
                    <p>青色のQRコード：70-80%の正答率（良好）</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-500 rounded mr-3"></div>
                    <p>赤色のQRコード：70%未満の正答率（要復習）</p>
                  </div>
                </div>
              </section>

              <section className="text-center pt-8 border-t border-white/20">
                <p className="text-white/80">
                  効果的な日本語学習のために、定期的な速読練習を心がけましょう
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}