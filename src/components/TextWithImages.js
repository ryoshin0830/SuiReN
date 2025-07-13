/**
 * TextWithImages.js - 画像プレースホルダー付き読み物レンダリングコンポーネント
 * ルビ（振り仮名）表示機能付き
 */

'use client';

import React from 'react';
import { parseRubyText } from '../lib/ruby-utils';

/**
 * 読み物内の画像プレースホルダーを実際の画像に置換し、ルビを表示してレンダリング
 * @param {Object} props 
 * @param {string} props.text - 画像プレースホルダーとルビ記法を含む読み物
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

  // ルビ付きテキストを解析してReact要素に変換
  const renderRubyText = React.useCallback((textContent) => {
    const parts = parseRubyText(textContent);
    
    return parts.map((part, index) => {
      if (part.type === 'ruby') {
        return (
          <ruby key={index} className="ruby-text">
            {part.content}
            <rt className="ruby-annotation">{part.ruby}</rt>
          </ruby>
        );
      } else {
        return (
          <span key={index} className="whitespace-pre-line">
            {part.content}
          </span>
        );
      }
    });
  }, []);

  // 読み物を画像プレースホルダーで分割し、各部分をレンダリング
  const renderTextWithImages = React.useMemo(() => {
    if (!text) return null;

    // プレースホルダーで分割（単一画像と複数画像の両方に対応）
    const parts = text.split(/(\{\{IMAGES?:[^}]+\}\})/g);
    
    return parts.map((part, index) => {
      // 単一画像プレースホルダーの場合
      const singleImageMatch = part.match(/\{\{IMAGE:([^}]+)\}\}/);
      if (singleImageMatch) {
        const imageId = singleImageMatch[1];
        const image = imageMap[imageId];
        
        if (image && image.base64) {
          return (
            <div key={index} className="my-6 text-center">
              <img
                src={image.base64}
                alt={image.alt || '読み物内の画像'}
                className="max-w-full h-auto max-h-96 mx-auto rounded-lg bg-transparent"
                style={{ 
                  backgroundColor: 'transparent',
                  backgroundImage: 'none',
                  background: 'transparent'
                }}
                onError={(e) => {
                  console.error(`画像の読み込みに失敗しました: ${imageId}`, {
                    imageId,
                    image,
                    base64Length: image?.base64?.length || 0
                  });
                  e.target.style.display = 'none';
                  e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'block');
                }}
                onLoad={(e) => {
                  console.log(`画像読み込み完了: ${imageId}`, {
                    imageId,
                    format: image.format,
                    hasTransparency: image.hasTransparency,
                    dimensions: `${image.width}x${image.height}`
                  });
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
          console.warn(`画像が見つかりません: ${imageId}`, {
            imageId,
            image,
            imageMap,
            allImageIds: Object.keys(imageMap)
          });
          return (
            <div key={index} className="my-6 text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700 text-sm">
                  ⚠️ 画像が見つかりません (ID: {imageId})
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  利用可能な画像ID: {Object.keys(imageMap).join(', ') || 'なし'}
                </p>
              </div>
            </div>
          );
        }
      }

      // 複数画像プレースホルダーの場合
      const multipleImageMatch = part.match(/\{\{IMAGES:([^}]+)\}\}/);
      if (multipleImageMatch) {
        const imageIds = multipleImageMatch[1].split(',').map(id => id.trim());
        const validImages = imageIds
          .map(id => ({ id, image: imageMap[id] }))
          .filter(({ image }) => image && image.base64);
        
        if (validImages.length > 0) {
          return (
            <div key={index} className="my-6">
              <div className="flex flex-wrap justify-center gap-4">
                {validImages.map(({ id, image }, imgIndex) => (
                  <div key={imgIndex} className="flex-shrink-0">
                    <img
                      src={image.base64}
                      alt={image.alt || `読み物内の画像${imgIndex + 1}`}
                      className="max-w-xs h-auto max-h-64 rounded-lg bg-transparent"
                      style={{ 
                        backgroundColor: 'transparent',
                        backgroundImage: 'none',
                        background: 'transparent'
                      }}
                      onError={(e) => {
                        console.error(`画像の読み込みに失敗しました: ${id}`, {
                          imageId: id,
                          image,
                          base64Length: image?.base64?.length || 0
                        });
                        e.target.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        console.log(`複数画像読み込み完了: ${id}`, {
                          imageId: id,
                          format: image.format,
                          hasTransparency: image.hasTransparency,
                          dimensions: `${image.width}x${image.height}`
                        });
                      }}
                    />
                    {image.caption && (
                      <p className="text-xs text-gray-600 mt-1 italic text-center max-w-xs">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {/* 見つからない画像のリスト表示 */}
              {imageIds.length > validImages.length && (
                <div className="text-center mt-2">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 inline-block">
                    <p className="text-yellow-700 text-xs">
                      ⚠️ 一部の画像が見つかりません: {
                        imageIds
                          .filter(id => !imageMap[id] || !imageMap[id].base64)
                          .join(', ')
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        } else {
          // 全ての画像が見つからない場合
          return (
            <div key={index} className="my-6 text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700 text-sm">
                  ⚠️ 指定された画像が見つかりません: {imageIds.join(', ')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  利用可能な画像ID: {Object.keys(imageMap).join(', ') || 'なし'}
                </p>
              </div>
            </div>
          );
        }
      }
      
      // 通常のテキストの場合（ルビ解析を適用）
      if (part.trim()) {
        return (
          <span key={index}>
            {renderRubyText(part)}
          </span>
        );
      }
      
      // 空のテキスト部分
      return (
        <span key={index} className="whitespace-pre-line">
          {part}
        </span>
      );
    });
  }, [text, imageMap, renderRubyText]);

  return (
    <div className={`prose max-w-none ruby-container ${className}`}>      
      <div className="text-lg text-gray-800" style={{ lineHeight: '2.2' }}>
        {renderTextWithImages}
      </div>
    </div>
  );
}

/**
 * プレビューモード用のコンポーネント（編集時のプレビュー表示用）
 */
export function TextWithImagesPreview({ text, images = [], className = "" }) {
  // デバッグ情報を表示
  console.log('TextWithImagesPreview render:', {
    textLength: text?.length || 0,
    imagesCount: images.length,
    imageIds: images.map(img => img.id),
    imagePlaceholders: text ? text.match(/\{\{IMAGES?:[^}]+\}\}/g) || [] : [],
    text: text ? text.substring(0, 200) + '...' : 'empty'
  });

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-gray-50 ${className}`}>
      <div className="text-sm text-gray-600 mb-2 font-semibold">📖 プレビュー</div>
      <div className="text-xs text-gray-500 mb-2">
        画像数: {images.length}個 | 
        画像ID: {images.map(img => img.id).join(', ') || 'なし'}
      </div>
      <TextWithImages text={text} images={images} />
    </div>
  );
}

/**
 * 読み物統計情報を表示するコンポーネント（ルビ情報も含む）
 */
export function TextStatistics({ text, images = [] }) {
  const stats = React.useMemo(() => {
    const characterCount = text ? text.length : 0;
    const lineCount = text ? text.split('\n').length : 0;
    const imageCount = images.length;
    
    // 単一画像と複数画像の両方のプレースホルダーをカウント
    const singleImageMatches = text ? (text.match(/\{\{IMAGE:[^}]+\}\}/g) || []) : [];
    const multipleImageMatches = text ? (text.match(/\{\{IMAGES:[^}]+\}\}/g) || []) : [];
    const placeholderCount = singleImageMatches.length + multipleImageMatches.length;
    
    // ルビ統計の追加
    const rubyParts = text ? parseRubyText(text) : [];
    const rubyCount = rubyParts.filter(part => part.type === 'ruby').length;
    
    return {
      characterCount,
      lineCount,
      imageCount,
      placeholderCount,
      rubyCount
    };
  }, [text, images]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-blue-50 rounded-lg">
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
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">{stats.rubyCount}</div>
        <div className="text-xs text-gray-600">ルビ数</div>
      </div>
    </div>
  );
}