/**
 * 画像圧縮・変換ユーティリティ
 * Base64形式での画像保存に最適化
 */

/**
 * 画像ファイルを圧縮してBase64に変換
 * @param {File} file - 画像ファイル
 * @param {Object} options - 圧縮オプション
 * @returns {Promise<Object>} 変換結果
 */
export const compressImageToBase64 = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 600,        // より小さなサイズ
      maxHeight = 450,       // より小さなサイズ
      quality = 0.7,         // より低い品質
      format = null          // 自動判定に変更
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // アスペクト比を保持しながらリサイズ
      const { width, height } = calculateDimensions(
        img.width, 
        img.height, 
        maxWidth, 
        maxHeight
      );

      canvas.width = width;
      canvas.height = height;

      // 透明度チェック用の一時キャンバス
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      tempCtx.drawImage(img, 0, 0);

      // 透明度があるかチェック
      const hasTransparency = checkImageTransparency(tempCtx, img.width, img.height) || 
                            file.type === 'image/png' || 
                            file.type === 'image/webp' || 
                            file.type === 'image/gif';

      // フォーマットを自動決定
      const outputFormat = format || (hasTransparency ? 'png' : 'jpeg');

      // 透明背景を保持するために背景をクリア
      if (hasTransparency) {
        ctx.clearRect(0, 0, width, height);
      }

      // 画像を描画
      ctx.drawImage(img, 0, 0, width, height);

      // Base64に変換
      const mimeType = `image/${outputFormat}`;
      const base64 = canvas.toDataURL(mimeType, outputFormat === 'jpeg' ? quality : undefined);
      
      // データサイズを計算
      const originalSize = file.size;
      const compressedSize = Math.round((base64.length * 3) / 4);
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

      resolve({
        base64,
        originalSize,
        compressedSize,
        compressionRatio,
        width,
        height,
        format: outputFormat,
        hasTransparency
      });
    };

    img.onerror = () => {
      reject(new Error('画像の読み込みに失敗しました'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * 画像に透明度があるかチェック
 * @param {CanvasRenderingContext2D} ctx - キャンバスコンテキスト
 * @param {number} width - 画像幅
 * @param {number} height - 画像高さ
 * @returns {boolean} 透明度の有無
 */
const checkImageTransparency = (ctx, width, height) => {
  try {
    // サンプルポイントで透明度をチェック（パフォーマンス向上のため全ピクセルは調べない）
    const samplePoints = [
      [0, 0], // 左上
      [width - 1, 0], // 右上  
      [0, height - 1], // 左下
      [width - 1, height - 1], // 右下
      [Math.floor(width / 2), Math.floor(height / 2)] // 中央
    ];

    for (const [x, y] of samplePoints) {
      const imageData = ctx.getImageData(x, y, 1, 1);
      const alpha = imageData.data[3]; // アルファチャンネル
      if (alpha < 255) {
        return true; // 透明度あり
      }
    }

    // エッジ部分もチェック（透明背景の画像は周辺が透明なことが多い）
    for (let i = 0; i < Math.min(width, 20); i++) {
      const imageData = ctx.getImageData(i, 0, 1, 1);
      if (imageData.data[3] < 255) return true;
    }

    return false; // 透明度なし
  } catch (error) {
    console.warn('透明度チェック中にエラーが発生:', error);
    return false;
  }
};

/**
 * 最適なサイズを計算（アスペクト比保持）
 * @param {number} originalWidth 
 * @param {number} originalHeight 
 * @param {number} maxWidth 
 * @param {number} maxHeight 
 * @returns {Object} 新しいサイズ
 */
const calculateDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  let width = originalWidth;
  let height = originalHeight;

  // 最大幅を超える場合
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  // 最大高さを超える場合
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  return { width: Math.round(width), height: Math.round(height) };
};

/**
 * ファイルサイズを人間が読みやすい形式に変換
 * @param {number} bytes 
 * @returns {string} フォーマット済みサイズ
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 画像形式を検証
 * @param {File} file 
 * @returns {boolean} 有効な画像形式かどうか
 */
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    throw new Error('サポートされていない画像形式です。JPEG、PNG、WebP、GIFのみ対応しています。');
  }

  if (file.size > maxSize) {
    throw new Error('ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。');
  }

  return true;
};

/**
 * 複数画像データの管理
 */
export class ImageManager {
  constructor(images = []) {
    this.images = images;
  }

  /**
   * 画像を追加
   * @param {Object} imageData 
   */
  addImage(imageData) {
    const newImage = {
      id: this.generateImageId(),
      ...imageData,
      createdAt: new Date().toISOString()
    };
    this.images.push(newImage);
    return newImage;
  }

  /**
   * 画像を更新
   * @param {string} id 
   * @param {Object} updates 
   */
  updateImage(id, updates) {
    const index = this.images.findIndex(img => img.id === id);
    if (index !== -1) {
      this.images[index] = { ...this.images[index], ...updates };
      return this.images[index];
    }
    return null;
  }

  /**
   * 画像を削除
   * @param {string} id 
   */
  removeImage(id) {
    this.images = this.images.filter(img => img.id !== id);
  }

  /**
   * 画像を取得
   * @param {string} id 
   */
  getImage(id) {
    return this.images.find(img => img.id === id);
  }

  /**
   * 全画像を取得
   */
  getAllImages() {
    return this.images;
  }

  /**
   * ユニークな画像IDを生成
   */
  generateImageId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `img_${timestamp}_${random}`;
  }

  /**
   * 総データサイズを計算
   */
  getTotalSize() {
    return this.images.reduce((total, img) => {
      return total + (img.base64 ? Math.round((img.base64.length * 3) / 4) : 0);
    }, 0);
  }
}

/**
 * 読み物内の画像プレースホルダーを検証
 * @param {string} text 
 * @param {Array} images 
 * @returns {Object} 検証結果
 */
export const validateImagePlaceholders = (text, images) => {
  const singleImageRegex = /\{\{IMAGE:([^}]+)\}\}/g;
  const multipleImageRegex = /\{\{IMAGES:([^}]+)\}\}/g;
  const placeholders = [];
  const imageIds = images.map(img => img.id);
  const errors = [];

  // 単一画像プレースホルダーをチェック
  let match;
  while ((match = singleImageRegex.exec(text)) !== null) {
    const imageId = match[1];
    placeholders.push(imageId);
    
    if (!imageIds.includes(imageId)) {
      errors.push(`画像ID "${imageId}" が見つかりません`);
    }
  }

  // 複数画像プレースホルダーをチェック
  while ((match = multipleImageRegex.exec(text)) !== null) {
    const imageIdString = match[1];
    const imageIdList = imageIdString.split(',').map(id => id.trim());
    
    imageIdList.forEach(imageId => {
      placeholders.push(imageId);
      
      if (!imageIds.includes(imageId)) {
        errors.push(`画像ID "${imageId}" が見つかりません`);
      }
    });
  }

  // 未使用の画像をチェック
  const unusedImages = imageIds.filter(id => !placeholders.includes(id));
  if (unusedImages.length > 0) {
    errors.push(`未使用の画像があります: ${unusedImages.join(', ')}`);
  }

  return {
    placeholders,
    unusedImages,
    errors,
    isValid: errors.length === 0
  };
};