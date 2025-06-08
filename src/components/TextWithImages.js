/**
 * TextWithImages.js - 画像プレースホルダー付きテキストレンダリングコンポーネント
 */

'use client';

import React from 'react';

/**
 * 文章内の画像プレースホルダーを実際の画像に置換してレンダリング
 * @param {Object} props 
 * @param {string} props.text - 画像プレースホルダーを含む文章
 * @param {Array} props.images - 画像データ配列
 * @param {string} props.className - 追加CSSクラス
 * @returns {JSX.Element}
 */
export default function TextWithImages({ text, images = [], className = "" }) {
  // 画像をIDでマップ化
  const imageMap = React.useMemo(() => {
    return images.reduce((map, img) => {
      map[img.id] = img;
      return map;
    }, {});
  }, [images]);

  // 文章を画像プレースホルダーで分割し、各部分をレンダリング
  const renderTextWithImages = React.useMemo(() => {
    if (!text) return null;

    // プレースホルダーで分割（プレースホルダー自体も保持）
    const parts = text.split(/(\{\{IMAGE:[^}]+\}\})/g);
    
    return parts.map((part, index) => {
      // プレースホルダーの場合
      const imageMatch = part.match(/\{\{IMAGE:([^}]+)\}\}/);
      if (imageMatch) {
        const imageId = imageMatch[1];
        const image = imageMap[imageId];
        
        if (image && image.base64) {
          return (
            <div key={index} className="my-6 text-center">
              <img
                src={image.base64}
                alt={image.alt || '文章内の画像'}
                className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-lg"
                onError={(e) => {
                  console.error(`画像の読み込みに失敗しました: ${imageId}`);
                  e.target.style.display = 'none';
                  e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'block');
                }}
              />
              {image.caption && (
                <p className="text-sm text-gray-600 mt-2 italic">
                  {image.caption}
                </p>
              )}
              {/* エラー表示用（通常は非表示） */}
              <div className="text-center text-red-500 mt-2 hidden">
                画像の読み込みに失敗しました (ID: {imageId})
              </div>
            </div>
          );
        } else {
          // 画像が見つからない場合の警告表示
          console.warn(`画像が見つかりません: ${imageId}`);
          return (
            <div key={index} className="my-6 text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700 text-sm">
                  ⚠️ 画像が見つかりません (ID: {imageId})
                </p>
              </div>
            </div>
          );
        }
      }
      
      // 通常のテキストの場合
      return (
        <span key={index} className="whitespace-pre-line">
          {part}
        </span>
      );
    });
  }, [text, imageMap]);

  return (
    <div className={`prose max-w-none ${className}`}>
      <div className="text-lg leading-relaxed text-gray-800">
        {renderTextWithImages}
      </div>
    </div>
  );
}

/**
 * プレビューモード用のコンポーネント（編集時のプレビュー表示用）
 */
export function TextWithImagesPreview({ text, images = [], className = "" }) {
  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-gray-50 ${className}`}>
      <div className="text-sm text-gray-600 mb-2 font-semibold">📖 プレビュー</div>
      <TextWithImages text={text} images={images} />
    </div>
  );
}

/**
 * 文章統計情報を表示するコンポーネント
 */
export function TextStatistics({ text, images = [] }) {
  const stats = React.useMemo(() => {
    const characterCount = text ? text.length : 0;
    const lineCount = text ? text.split('\n').length : 0;
    const imageCount = images.length;
    const placeholderCount = text ? (text.match(/\{\{IMAGE:[^}]+\}\}/g) || []).length : 0;
    
    return {
      characterCount,
      lineCount,
      imageCount,
      placeholderCount
    };
  }, [text, images]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{stats.characterCount}</div>
        <div className="text-xs text-gray-600">文字数</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{stats.lineCount}</div>
        <div className="text-xs text-gray-600">行数</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">{stats.imageCount}</div>
        <div className="text-xs text-gray-600">画像数</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{stats.placeholderCount}</div>
        <div className="text-xs text-gray-600">配置済み</div>
      </div>
    </div>
  );
}