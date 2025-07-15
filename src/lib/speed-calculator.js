/**
 * 速度計算モジュール
 * 日本語読み物の読書速度を計算するための関数群
 * 
 * 日本語の特性を考慮した標準文字数カウントと語数カウント方法を実装
 */

/**
 * 日本語読み物の文字数をカウントする
 * 
 * カウント方法：
 * - ひらがな、カタカナ、漢字：1文字としてカウント
 * - 句読点、記号：0.5文字としてカウント
 * - 英数字：0.3文字としてカウント（複数文字で1単語を形成するため）
 * - 空白、改行：カウントしない
 * 
 * @param {string} text - カウント対象のテキスト
 * @returns {object} 文字数の詳細情報
 */
export function countJapaneseCharacters(text) {
  if (!text || typeof text !== 'string') {
    return {
      total: 0,
      standardCount: 0,
      details: {
        kana: 0,
        kanji: 0,
        punctuation: 0,
        alphanumeric: 0,
        other: 0
      }
    };
  }

  const details = {
    kana: 0,        // ひらがな・カタカナ
    kanji: 0,       // 漢字
    punctuation: 0, // 句読点・記号
    alphanumeric: 0,// 英数字
    other: 0        // その他
  };

  // 画像プレースホルダーを除去
  const cleanText = text.replace(/\{\{IMAGE:[^}]+\}\}/g, '');

  // 文字を1つずつ分析
  for (const char of cleanText) {
    // 空白類は無視
    if (/\s/.test(char)) continue;

    // ひらがな
    if (/[\u3040-\u309F]/.test(char)) {
      details.kana++;
    }
    // カタカナ
    else if (/[\u30A0-\u30FF]/.test(char)) {
      details.kana++;
    }
    // 漢字
    else if (/[\u4E00-\u9FAF]/.test(char)) {
      details.kanji++;
    }
    // 句読点・記号
    else if (/[、。！？「」『』（）\[\]【】〈〉《》・…ー～]/.test(char)) {
      details.punctuation++;
    }
    // 英数字
    else if (/[a-zA-Z0-9]/.test(char)) {
      details.alphanumeric++;
    }
    // その他
    else {
      details.other++;
    }
  }

  // 標準文字数の計算
  const standardCount = 
    details.kana * 1.0 +           // かな：1.0
    details.kanji * 1.0 +          // 漢字：1.0
    details.punctuation * 0.5 +    // 句読点：0.5
    details.alphanumeric * 0.3 +   // 英数字：0.3
    details.other * 0.5;           // その他：0.5

  // 実際の文字数（空白を除く）
  const total = details.kana + details.kanji + details.punctuation + 
                details.alphanumeric + details.other;

  return {
    total,
    standardCount: Math.round(standardCount),
    details
  };
}

/**
 * 日本語読み物の語数（単語数）をカウントする
 * 
 * カウント方法：
 * - 形態素単位で分割（簡易的な正規表現ベース）
 * - 漢字・カタカナ・英数字を含む語：1.0としてカウント
 * - ひらがなのみの語（助詞・助動詞など）：0.5としてカウント
 * - 句読点・記号：カウントしない
 * 
 * @param {string} text - カウント対象のテキスト
 * @returns {object} 語数の詳細情報
 */
export function countJapaneseWords(text) {
  if (!text || typeof text !== 'string') {
    return {
      total: 0,
      standardCount: 0,
      details: {
        contentWords: 0,    // 内容語（漢字・カタカナ・英数字を含む）
        functionWords: 0,   // 機能語（ひらがなのみ）
        numbers: 0,         // 数字
        english: 0          // 英単語
      }
    };
  }

  const details = {
    contentWords: 0,
    functionWords: 0,
    numbers: 0,
    english: 0
  };

  // 画像プレースホルダーとルビ記法を除去
  let cleanText = text.replace(/\{\{IMAGE:[^}]+\}\}/g, '');
  cleanText = cleanText.replace(/[｜|]([^《]+)《[^》]+》/g, '$1');
  cleanText = cleanText.replace(/([^《]+)《[^》]+》/g, '$1');
  cleanText = cleanText.replace(/([^(]+)\([^)]+\)/g, '$1');

  // 改行をスペースに変換
  cleanText = cleanText.replace(/\n/g, ' ');

  // 句読点で分割
  const segments = cleanText.split(/[、。！？「」『』（）\[\]【】〈〉《》・…ー～\s]+/);

  for (let segment of segments) {
    if (!segment) continue;

    // 英単語（連続する英字）
    const englishWords = segment.match(/[a-zA-Z]+/g);
    if (englishWords) {
      details.english += englishWords.length;
      // 英単語を除去
      segment = segment.replace(/[a-zA-Z]+/g, ' ');
    }

    // 数字（連続する数字）
    const numbers = segment.match(/[0-9０-９]+/g);
    if (numbers) {
      details.numbers += numbers.length;
      // 数字を除去
      segment = segment.replace(/[0-9０-９]+/g, ' ');
    }

    // 残りのテキストを形態素に分割（簡易版）
    // 漢字・カタカナの連続、ひらがなの連続で分割
    const morphemes = segment.match(/[\u4E00-\u9FAF]+|[\u30A0-\u30FF]+|[\u3040-\u309F]+/g);
    
    if (morphemes) {
      for (const morpheme of morphemes) {
        // ひらがなのみの場合は機能語として扱う
        if (/^[\u3040-\u309F]+$/.test(morpheme)) {
          details.functionWords++;
        } else {
          details.contentWords++;
        }
      }
    }
  }

  // 標準語数の計算
  const standardCount = 
    details.contentWords * 1.0 +    // 内容語：1.0
    details.functionWords * 0.5 +   // 機能語：0.5
    details.numbers * 1.0 +         // 数字：1.0
    details.english * 1.0;          // 英単語：1.0

  // 総語数
  const total = details.contentWords + details.functionWords + 
                details.numbers + details.english;

  return {
    total,
    standardCount: Math.round(standardCount),
    details
  };
}


/**
 * 読書速度を計算する（文字/分）
 * 
 * @param {number} characterCount - 文字数（標準カウント）
 * @param {number} readingTimeSeconds - 読書時間（秒）
 * @returns {number} 読書速度（文字/分）
 */
export function calculateReadingSpeed(characterCount, readingTimeSeconds) {
  if (!characterCount || !readingTimeSeconds || readingTimeSeconds <= 0) {
    return 0;
  }

  // 秒を分に変換して速度を計算
  const readingTimeMinutes = readingTimeSeconds / 60;
  const speed = characterCount / readingTimeMinutes;

  return Math.round(speed);
}


/**
 * 読書速度レベルを判定する（文字数ベース - 従来の関数）
 * 
 * 日本語ネイティブスピーカーの平均読書速度：
 * - 小学生：200-400文字/分
 * - 中学生：400-600文字/分
 * - 高校生：600-800文字/分
 * - 大学生・成人：800-1200文字/分
 * 
 * 日本語学習者の目標速度：
 * - 初級：100-200文字/分
 * - 中級：200-400文字/分
 * - 上級：400-600文字/分
 * 
 * @param {number} speed - 読書速度（文字/分）
 * @param {string} contentLevel - コンテンツレベル（初級/中級/上級）
 * @returns {object} 速度レベル判定結果
 */
export function evaluateReadingSpeed(speed, contentLevel = '中級') {
  // レベル別の基準速度
  const speedCriteria = {
    '初級': {
      slow: 100,
      normal: 150,
      fast: 200,
      veryFast: 250
    },
    '中級': {
      slow: 200,
      normal: 300,
      fast: 400,
      veryFast: 500
    },
    '上級': {
      slow: 400,
      normal: 500,
      fast: 600,
      veryFast: 700
    }
  };

  const criteria = speedCriteria[contentLevel] || speedCriteria['中級'];
  
  let level, message, color;

  if (speed < criteria.slow) {
    level = 'slow';
    message = 'ゆっくり';
    color = '#ef4444'; // red
  } else if (speed < criteria.normal) {
    level = 'belowNormal';
    message = 'やや遅い';
    color = '#f97316'; // orange
  } else if (speed < criteria.fast) {
    level = 'normal';
    message = '標準的';
    color = '#10b981'; // green
  } else if (speed < criteria.veryFast) {
    level = 'fast';
    message = '速い';
    color = '#3b82f6'; // blue
  } else {
    level = 'veryFast';
    message = 'とても速い';
    color = '#8b5cf6'; // purple
  }

  return {
    level,
    message,
    color,
    speed,
    criteria,
    unit: '文字/分'
  };
}


/**
 * ネイティブスピーカーとの比較情報を生成（文字数ベース - 従来の関数）
 * 
 * @param {number} speed - 読書速度（文字/分）
 * @returns {object} 比較情報
 */
export function compareWithNativeSpeakers(speed) {
  const nativeAverages = {
    elementary: { min: 200, max: 400, label: '小学生' },
    junior: { min: 400, max: 600, label: '中学生' },
    high: { min: 600, max: 800, label: '高校生' },
    adult: { min: 800, max: 1200, label: '大学生・成人' }
  };

  let comparison = null;
  
  if (speed < nativeAverages.elementary.min) {
    comparison = {
      level: 'below_elementary',
      message: '小学生レベル未満',
      percentage: Math.round((speed / nativeAverages.elementary.min) * 100)
    };
  } else if (speed <= nativeAverages.elementary.max) {
    comparison = {
      level: 'elementary',
      message: '小学生レベル',
      percentage: 100
    };
  } else if (speed <= nativeAverages.junior.max) {
    comparison = {
      level: 'junior',
      message: '中学生レベル',
      percentage: 100
    };
  } else if (speed <= nativeAverages.high.max) {
    comparison = {
      level: 'high',
      message: '高校生レベル',
      percentage: 100
    };
  } else {
    comparison = {
      level: 'adult',
      message: '大学生・成人レベル',
      percentage: Math.min(100, Math.round((speed / nativeAverages.adult.max) * 100))
    };
  }

  return {
    comparison,
    nativeAverages,
    speed,
    unit: '文字/分'
  };
}

