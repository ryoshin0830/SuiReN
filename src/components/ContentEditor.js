'use client';

import { useState, useEffect } from 'react';
import { 
  compressImageToBase64, 
  formatFileSize, 
  validateImageFile, 
  ImageManager,
  validateImagePlaceholders 
} from '../lib/image-utils';
import { TextWithImagesPreview, TextStatistics } from './TextWithImages';
import { formatRubyText, getRubyExamples, validateRuby } from '../lib/ruby-utils';

export default function ContentEditor({ mode, content, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    level: '初級修了レベル',
    levelCode: 'beginner',
    text: '',
    images: [],
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageManager] = useState(new ImageManager());
  const [imageManagerVersion, setImageManagerVersion] = useState(0); // 再レンダリング用
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [showRubyModal, setShowRubyModal] = useState(false);
  const [rubyFormData, setRubyFormData] = useState({
    baseText: '',
    ruby: '',
    format: 'basic'
  });

  // 編集モードの場合、既存データで初期化
  useEffect(() => {
    if (mode === 'edit' && content) {
      const images = content.images || [];
      imageManager.images = images;
      
      setFormData({
        title: content.title,
        level: content.level,
        levelCode: content.levelCode,
        text: content.text,
        images: images,
        questions: content.questions.map(q => ({
          question: q.question,
          options: [...q.options],
          correctAnswer: q.correctAnswer
        }))
      });
      setImageManagerVersion(prev => prev + 1); // 再レンダリングを強制
    }
  }, [mode, content, imageManager]);

  // レベル変更時にlevelCodeも更新
  const handleLevelChange = (level) => {
    let levelCode;
    switch (level) {
      case '初級修了レベル':
        levelCode = 'beginner';
        break;
      case '中級レベル':
        levelCode = 'intermediate';
        break;
      case '上級レベル':
        levelCode = 'advanced';
        break;
      default:
        levelCode = 'beginner';
    }
    setFormData(prev => ({ ...prev, level, levelCode }));
  };

  // 画像アップロード処理
  const handleImageUpload = async (file) => {
    try {
      validateImageFile(file);
      setImageUploadProgress({ stage: 'processing', progress: 0 });

      const result = await compressImageToBase64(file, {
        maxWidth: 600,
        maxHeight: 450,
        quality: 0.7,
        format: 'jpeg'
      });

      setImageUploadProgress({ stage: 'processing', progress: 100 });

      const imageData = {
        base64: result.base64,
        alt: '',
        caption: '',
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
        width: result.width,
        height: result.height,
        format: result.format
      };

      const newImage = imageManager.addImage(imageData);
      setFormData(prev => ({ ...prev, images: imageManager.getAllImages() }));
      setImageManagerVersion(prev => prev + 1); // 再レンダリングを強制
      setSelectedImageId(newImage.id);
      setShowImageModal(true);
      setImageUploadProgress(null);

    } catch (error) {
      setError(error.message);
      setImageUploadProgress(null);
    }
  };

  // 画像更新
  const updateImage = (id, updates) => {
    imageManager.updateImage(id, updates);
    setFormData(prev => ({ ...prev, images: imageManager.getAllImages() }));
    setImageManagerVersion(prev => prev + 1); // 再レンダリングを強制
  };

  // 画像削除
  const removeImage = (id) => {
    imageManager.removeImage(id);
    setFormData(prev => ({ ...prev, images: imageManager.getAllImages() }));
    setImageManagerVersion(prev => prev + 1); // 再レンダリングを強制
  };

  // テキストに画像プレースホルダーを挿入
  const insertImagePlaceholder = (imageId) => {
    const placeholder = `{{IMAGE:${imageId}}}`;
    const textarea = document.querySelector('textarea[name="text"]');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.text;
      const newText = text.substring(0, start) + '\n\n' + placeholder + '\n\n' + text.substring(end);
      setFormData(prev => ({ ...prev, text: newText }));
      
      // カーソル位置を調整
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length + 4, start + placeholder.length + 4);
      }, 0);
    }
  };

  // 質問を追加
  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0
        }
      ]
    }));
  };

  // 質問を削除
  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      alert('少なくとも1つの質問が必要です');
      return;
    }
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  // 質問内容を更新
  const updateQuestion = (questionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  // 選択肢を更新
  const updateOption = (questionIndex, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? {
              ...q,
              options: q.options.map((opt, j) => j === optionIndex ? value : opt)
            }
          : q
      )
    }));
  };

  // ルビを挿入する関数
  const insertRuby = (baseText, ruby, format) => {
    try {
      const rubyText = formatRubyText(baseText, ruby, format);
      const textarea = document.querySelector('textarea[name="text"]');
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = formData.text;
        const newText = text.substring(0, start) + rubyText + text.substring(end);
        setFormData(prev => ({ ...prev, text: newText }));
        
        // カーソル位置を調整
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + rubyText.length, start + rubyText.length);
        }, 0);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // ルビモーダルを開く
  const openRubyModal = () => {
    const textarea = document.querySelector('textarea[name="text"]');
    if (textarea) {
      const selectedText = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
      );
      if (selectedText.trim()) {
        setRubyFormData(prev => ({ ...prev, baseText: selectedText.trim() }));
      }
    }
    setShowRubyModal(true);
  };

  // ルビを追加
  const handleRubySubmit = () => {
    if (!rubyFormData.baseText.trim() || !rubyFormData.ruby.trim()) {
      alert('文字とルビの両方を入力してください');
      return;
    }
    
    if (!validateRuby(rubyFormData.ruby, rubyFormData.baseText)) {
      alert('無効なルビです。文字数制限（1-10文字）や禁止文字（&, ", <, >）をご確認ください。');
      return;
    }
    
    insertRuby(rubyFormData.baseText, rubyFormData.ruby, rubyFormData.format);
    setShowRubyModal(false);
    setRubyFormData({ baseText: '', ruby: '', format: 'basic' });
  };

  // フォーム送信
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // バリデーション
      if (!formData.title.trim()) {
        throw new Error('タイトルを入力してください');
      }
      if (!formData.text.trim()) {
        throw new Error('本文を入力してください');
      }

      // 画像プレースホルダーの検証
      const imageValidation = validateImagePlaceholders(formData.text, formData.images);
      if (!imageValidation.isValid) {
        throw new Error('画像設定にエラーがあります: ' + imageValidation.errors.join(', '));
      }

      // データサイズの警告（4MB制限）
      const dataSize = JSON.stringify(formData).length;
      if (dataSize > 4 * 1024 * 1024) {
        throw new Error(`データサイズが大きすぎます (${(dataSize / 1024 / 1024).toFixed(1)}MB)。画像を減らすか、画質を下げてください。`);
      }
      
      for (let i = 0; i < formData.questions.length; i++) {
        const question = formData.questions[i];
        if (!question.question.trim()) {
          throw new Error(`質問${i + 1}の問題文を入力してください`);
        }
        if (question.options.some(opt => !opt.trim())) {
          throw new Error(`質問${i + 1}の選択肢をすべて入力してください`);
        }
      }

      const url = mode === 'create' 
        ? '/api/contents'
        : `/api/contents/${content.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      console.log('Sending data to API:', {
        url,
        method,
        dataSize: JSON.stringify(formData).length,
        imageCount: formData.images.length
      });
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onClose(); // 管理画面に戻る
      } else {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        let errorMessage = '保存に失敗しました';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${errorText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? '新規コンテンツ作成' : 'コンテンツ編集'}
          </h1>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            戻る
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-600">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本情報 */}
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">基本情報</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  タイトル *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例：ももたろう"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  レベル *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => handleLevelChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="初級修了レベル">初級修了レベル</option>
                  <option value="中級レベル">中級レベル</option>
                  <option value="上級レベル">上級レベル</option>
                </select>
              </div>
            </div>
          </div>

          {/* 画像管理セクション */}
          <div className="border-b border-gray-200 pb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">画像管理</h2>
              <div className="flex space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  📷 画像をアップロード
                </label>
              </div>
            </div>

            {/* アップロード進行状況 */}
            {imageUploadProgress && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-700">
                  {imageUploadProgress.stage === 'processing' && '画像を圧縮中...'}
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${imageUploadProgress.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* 画像一覧 */}
            {formData.images.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  総画像数: {formData.images.length}個 | 
                  総データサイズ: {formatFileSize(imageManager.getTotalSize())}
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.images.map((image) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                      <img
                        src={image.base64}
                        alt={image.alt}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          ID: {image.id}
                        </div>
                        <div className="text-xs text-gray-500">
                          {image.width}×{image.height} | {formatFileSize(image.compressedSize)}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => insertImagePlaceholder(image.id)}
                            className="flex-1 bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                          >
                            テキストに挿入
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImageId(image.id);
                              setShowImageModal(true);
                            }}
                            className="flex-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                          >
                            編集
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 使用方法説明 */}
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">📝 画像の使用方法</h3>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. 「画像をアップロード」で画像を追加</li>
                <li>2. 「テキストに挿入」で文章の任意の位置に挿入</li>
                <li>3. プレースホルダー形式: <code className="bg-gray-200 px-1 rounded">{`{{IMAGE:画像ID}}`}</code></li>
                <li>4. 画像は自動的に圧縮・最適化されます</li>
              </ol>
            </div>
          </div>

          {/* 本文入力 */}
          <div className="border-b border-gray-200 pb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">本文</h2>
              <button
                type="button"
                onClick={openRubyModal}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <span>ルビを挿入</span>
                <span className="text-sm">㋡</span>
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                本文 *
              </label>
              <textarea
                name="text"
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="読解練習用の文章を入力してください...&#10;&#10;ルビ記法:&#10;• 基本: ｜漢字《かんじ》&#10;• 省略: 漢字《かんじ》&#10;• 括弧: 漢字(かんじ)"
                required
              />
              
              <div className="mt-2 text-xs text-gray-500">
                <strong>ルビの使い方:</strong> 
                文字を選択してから「ルビを挿入」ボタンを押すか、直接記法を入力してください
              </div>
              
              <div className="mt-4">
                <TextStatistics text={formData.text} images={imageManager.getAllImages()} />
              </div>
            </div>

            {/* テキストプレビュー */}
            {formData.text && (
              <div className="mt-6">
                <TextWithImagesPreview 
                  text={formData.text} 
                  images={imageManager.getAllImages()} 
                />
              </div>
            )}
          </div>

          {/* 質問設定 */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">理解度確認問題</h2>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                質問を追加
              </button>
            </div>
            
            {formData.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    質問 {questionIndex + 1}
                  </h3>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      削除
                    </button>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    問題文 *
                  </label>
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例：おじいさんは何をしに山に行きましたか。"
                    required
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        選択肢 {optionIndex + 1} *
                        {question.correctAnswer === optionIndex && (
                          <span className="ml-2 text-green-600 font-bold">（正解）</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`選択肢${optionIndex + 1}を入力`}
                        required
                      />
                    </div>
                  ))}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    正解の選択肢
                  </label>
                  <select
                    value={question.correctAnswer}
                    onChange={(e) => updateQuestion(questionIndex, 'correctAnswer', parseInt(e.target.value))}
                    className="w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {question.options.map((_, optionIndex) => (
                      <option key={optionIndex} value={optionIndex}>
                        選択肢 {optionIndex + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          

          {/* 保存ボタン */}
          <div className="flex justify-center pt-8 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (mode === 'create' ? '作成中...' : '更新中...')
                : (mode === 'create' ? '作成する' : '更新する')
              }
            </button>
          </div>
        </form>
      </div>

      {/* 画像編集モーダル */}
      {showImageModal && selectedImageId && (
        <ImageEditModal
          image={imageManager.getImage(selectedImageId)}
          onSave={(updates) => {
            updateImage(selectedImageId, updates);
            setShowImageModal(false);
          }}
          onClose={() => setShowImageModal(false)}
        />
      )}

             {/* ルビモーダル */}
       {showRubyModal && (
         <RubyModal
           formData={rubyFormData}
           onChange={setRubyFormData}
           onSave={handleRubySubmit}
           onClose={() => setShowRubyModal(false)}
         />
       )}
    </div>
  );
}

// 画像編集モーダルコンポーネント
function ImageEditModal({ image, onSave, onClose }) {
  const [formData, setFormData] = useState({
    alt: image.alt || '',
    caption: image.caption || ''
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">画像設定編集</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4">
          <img
            src={image.base64}
            alt={image.alt}
            className="w-full max-h-64 object-contain rounded-lg"
          />
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              代替テキスト（必須）
            </label>
            <input
              type="text"
              value={formData.alt}
              onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="画像の内容を説明してください"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              キャプション（オプション）
            </label>
            <input
              type="text"
              value={formData.caption}
              onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="画像の説明文（表示されます）"
            />
          </div>
          
          <div className="text-sm text-gray-500">
            <p>画像ID: {image.id}</p>
            <p>サイズ: {image.width}×{image.height}</p>
            <p>圧縮率: {image.compressionRatio}%</p>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            保存
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}

// ルビモーダルコンポーネント
function RubyModal({ formData, onChange, onSave, onClose }) {
  const examples = getRubyExamples();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">ルビ入力</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* 入力フォーム */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                基本テキスト *
              </label>
              <input
                type="text"
                value={formData.baseText}
                onChange={(e) => onChange({ ...formData, baseText: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ルビを振る文字を入力"
                maxLength={10}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ルビ *
              </label>
              <input
                type="text"
                value={formData.ruby}
                onChange={(e) => onChange({ ...formData, ruby: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ルビを入力"
                maxLength={10}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                出力形式
              </label>
              <select
                value={formData.format}
                onChange={(e) => onChange({ ...formData, format: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="basic">基本記法（｜文字《ルビ》）</option>
                <option value="short">省略記法（文字《ルビ》）</option>
                <option value="paren">括弧記法（文字(ルビ)）</option>
              </select>
            </div>
            
            {/* プレビュー */}
            {formData.baseText && formData.ruby && validateRuby(formData.ruby, formData.baseText) && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600 mb-1">プレビュー:</div>
                <div className="ruby-container text-lg">
                  <ruby>
                    {formData.baseText}
                    <rt>{formData.ruby}</rt>
                  </ruby>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  記法: {formatRubyText(formData.baseText, formData.ruby, formData.format)}
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={onSave}
                disabled={!formData.baseText.trim() || !formData.ruby.trim()}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                挿入
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                キャンセル
              </button>
            </div>
          </div>
          
          {/* ヘルプ */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3">ルビ記法について</h4>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-semibold text-gray-700">{example.description}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    記法: <code className="bg-gray-200 px-1 rounded">{example.format}</code>
                  </div>
                  <div className="text-xs text-gray-600">
                    例: <code className="bg-gray-200 px-1 rounded">{example.example}</code>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{example.usage}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm font-semibold text-yellow-800">制約事項</div>
              <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                <li>• 文字とルビはそれぞれ1～10文字まで</li>
                <li>• 禁止文字: & " &lt; &gt;</li>
                <li>• 省略記法・括弧記法は漢字+ひらがな・カタカナのみ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}