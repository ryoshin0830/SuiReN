/**
 * 速度計算モジュール
 * 日本語テキストの読書速度を計算するための関数群
 * 
 * 日本語の特性を考慮した標準文字数カウントと語数カウント方法を実装
 */

/**
 * 日本語テキストの文字数をカウントする
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
 * 日本語テキストの語数（単語数）をカウントする
 * 
 * カウント方法：
 * - 形態素解析を簡易的に行い、意味を持つ語彙単位をカウント
 * - ひらがなの連続：助詞や助動詞として1語
 * - カタカナの連続：外来語として1語
 * - 漢字の連続：熟語として1語（ただし4文字以上は複数語として扱う）
 * - 英数字の連続：1語
 * - 句読点：語数にカウントしない
 * 
 * @param {string} text - カウント対象のテキスト
 * @returns {object} 語数の詳細情報
 */
export function countJapaneseWords(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalWords: 0,
      standardWordCount: 0,
      details: {
        hiraganaWords: 0,
        katakanaWords: 0,
        kanjiWords: 0,
        alphanumericWords: 0,
        mixedWords: 0
      }
    };
  }

  // 画像プレースホルダーを除去
  const cleanText = text.replace(/\{\{IMAGE:[^}]+\}\}/g, '');
  
  // 改行を空白に置換して処理しやすくする
  const processedText = cleanText.replace(/\n/g, ' ');
  
  const details = {
    hiraganaWords: 0,
    katakanaWords: 0,
    kanjiWords: 0,
    alphanumericWords: 0,
    mixedWords: 0
  };

  // 語彙パターンの定義
  const patterns = [
    // 漢字の連続（1-4文字を1語として扱う）
    { regex: /[\u4E00-\u9FAF]{1,4}/g, type: 'kanjiWords' },
    // カタカナの連続（外来語）
    { regex: /[\u30A0-\u30FF\u30FC]+/g, type: 'katakanaWords' },
    // ひらがなの連続（2文字以上を1語として扱う）
    { regex: /[\u3040-\u309F]{2,}/g, type: 'hiraganaWords' },
    // 英数字の連続
    { regex: /[a-zA-Z0-9]+/g, type: 'alphanumericWords' },
    // 漢字とひらがなの混合（動詞・形容詞など）
    { regex: /[\u4E00-\u9FAF]+[\u3040-\u309F]+/g, type: 'mixedWords' }
  ];

  // すでにカウントされた位置を記録
  const countedPositions = new Set();

  // 各パターンでマッチング
  patterns.forEach(({ regex, type }) => {
    let match;
    while ((match = regex.exec(processedText)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;
      
      // 重複カウントを避ける
      let isOverlapping = false;
      for (let i = start; i < end; i++) {
        if (countedPositions.has(i)) {
          isOverlapping = true;
          break;
        }
      }
      
      if (!isOverlapping) {
        details[type]++;
        for (let i = start; i < end; i++) {
          countedPositions.add(i);
        }
      }
    }
  });

  // 単独のひらがな1文字（助詞など）もカウント
  const singleHiragana = processedText.match(/(?<![\u3040-\u309F])[\u3040-\u309F](?![\u3040-\u309F])/g);
  if (singleHiragana) {
    details.hiraganaWords += singleHiragana.length;
  }

  // 総語数の計算
  const totalWords = Object.values(details).reduce((sum, count) => sum + count, 0);
  
  // 標準語数の計算（語の種類による重み付け）
  // 実質的な意味を持つ語により高い重みを付ける
  const standardWordCount = 
    details.kanjiWords * 1.0 +           // 漢字語：1.0
    details.katakanaWords * 1.0 +        // カタカナ語：1.0
    details.mixedWords * 1.0 +           // 混合語：1.0
    details.alphanumericWords * 1.0 +    // 英数字：1.0
    details.hiraganaWords * 0.5;         // ひらがな語（助詞等）：0.5

  return {
    totalWords,
    standardWordCount: Math.round(standardWordCount),
    details
  };
}

/**
 * 読書速度を計算する（語/分）
 * 
 * @param {number} wordCount - 語数（標準カウント）
 * @param {number} readingTimeSeconds - 読書時間（秒）
 * @returns {number} 読書速度（語/分）
 */
export function calculateReadingSpeedInWPM(wordCount, readingTimeSeconds) {
  if (!wordCount || !readingTimeSeconds || readingTimeSeconds <= 0) {
    return 0;
  }

  // 秒を分に変換して速度を計算
  const readingTimeMinutes = readingTimeSeconds / 60;
  const speed = wordCount / readingTimeMinutes;

  return Math.round(speed);
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
 * 読書速度レベルを判定する（語数ベース）
 * 
 * 日本語ネイティブスピーカーの平均読書速度（語/分）：
 * - 小学生：100-200語/分
 * - 中学生：200-300語/分
 * - 高校生：300-400語/分
 * - 大学生・成人：400-600語/分
 * 
 * 日本語学習者の目標速度（語/分）：
 * - 初級：50-100語/分
 * - 中級：100-200語/分
 * - 上級：200-300語/分
 * 
 * @param {number} speed - 読書速度（語/分）
 * @param {string} contentLevel - コンテンツレベル（初級/中級/上級）
 * @param {string} unit - 速度の単位（'wpm'または'cpm'）
 * @returns {object} 速度レベル判定結果
 */
export function evaluateReadingSpeedWPM(speed, contentLevel = '中級', unit = 'wpm') {
  // レベル別の基準速度（語/分）
  const speedCriteriaWPM = {
    '初級': {
      slow: 50,
      normal: 75,
      fast: 100,
      veryFast: 125
    },
    '中級': {
      slow: 100,
      normal: 150,
      fast: 200,
      veryFast: 250
    },
    '上級': {
      slow: 200,
      normal: 250,
      fast: 300,
      veryFast: 350
    }
  };

  const criteria = speedCriteriaWPM[contentLevel] || speedCriteriaWPM['中級'];
  
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
    unit: '語/分'
  };
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
 * ネイティブスピーカーとの比較情報を生成（語数ベース）
 * 
 * @param {number} speed - 読書速度（語/分）
 * @param {string} unit - 速度の単位（'wpm'または'cpm'）
 * @returns {object} 比較情報
 */
export function compareWithNativeSpeakersWPM(speed, unit = 'wpm') {
  const nativeAveragesWPM = {
    elementary: { min: 100, max: 200, label: '小学生' },
    junior: { min: 200, max: 300, label: '中学生' },
    high: { min: 300, max: 400, label: '高校生' },
    adult: { min: 400, max: 600, label: '大学生・成人' }
  };

  const nativeAverages = nativeAveragesWPM;
  
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
    unit: '語/分'
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

/**
 * 文章全体の読書統計を計算（文字数と語数の両方）
 * 
 * @param {string} text - 文章全体
 * @param {number} readingTimeSeconds - 読書時間（秒）
 * @param {string} contentLevel - コンテンツレベル
 * @returns {object} 読書統計情報
 */
export function calculateReadingStatistics(text, readingTimeSeconds, contentLevel = '中級') {
  // 文字数カウント
  const characterAnalysis = countJapaneseCharacters(text);
  
  // 語数カウント
  const wordAnalysis = countJapaneseWords(text);
  
  // 読書速度計算（文字/分）
  const speedCPM = calculateReadingSpeed(characterAnalysis.standardCount, readingTimeSeconds);
  
  // 読書速度計算（語/分）
  const speedWPM = calculateReadingSpeedInWPM(wordAnalysis.standardWordCount, readingTimeSeconds);
  
  // 速度評価（文字ベース）
  const speedEvaluationCPM = evaluateReadingSpeed(speedCPM, contentLevel);
  
  // 速度評価（語数ベース）
  const speedEvaluationWPM = evaluateReadingSpeedWPM(speedWPM, contentLevel);
  
  // ネイティブスピーカーとの比較（文字ベース）
  const nativeComparisonCPM = compareWithNativeSpeakers(speedCPM);
  
  // ネイティブスピーカーとの比較（語数ベース）
  const nativeComparisonWPM = compareWithNativeSpeakersWPM(speedWPM);

  return {
    // 文字数関連
    characterCount: characterAnalysis.standardCount,
    actualCharacterCount: characterAnalysis.total,
    characterDetails: characterAnalysis.details,
    // 語数関連
    wordCount: wordAnalysis.standardWordCount,
    actualWordCount: wordAnalysis.totalWords,
    wordDetails: wordAnalysis.details,
    // 時間
    readingTime: readingTimeSeconds,
    // 速度（両方の単位）
    readingSpeed: speedCPM,  // 後方互換性のため
    readingSpeedCPM: speedCPM,
    readingSpeedWPM: speedWPM,
    // 評価（両方の単位）
    speedEvaluation: speedEvaluationCPM,  // 後方互換性のため
    speedEvaluationCPM,
    speedEvaluationWPM,
    // ネイティブ比較（両方の単位）
    nativeComparison: nativeComparisonCPM,  // 後方互換性のため
    nativeComparisonCPM,
    nativeComparisonWPM,
    contentLevel
  };
}

/**
 * 標準語数についての説明文を取得
 * 
 * @returns {object} 標準語数の説明
 */
export function getStandardWordCountExplanation() {
  return {
    title: '標準語数とは',
    description: '標準語数は、日本語テキストの実質的な情報量を測るための指標です。',
    details: [
      '漢字・カタカナ・英数字の語：1.0として計算',
      'ひらがなのみの語（助詞など）：0.5として計算',
      '形態素解析に基づいた語彙単位でカウント',
      '読書速度は「標準語数÷読書時間（分）」で算出'
    ],
    example: {
      text: '私は日本語を勉強しています。',
      breakdown: [
        { word: '私', type: '漢字語', weight: 1.0 },
        { word: 'は', type: 'ひらがな語（助詞）', weight: 0.5 },
        { word: '日本語', type: '漢字語', weight: 1.0 },
        { word: 'を', type: 'ひらがな語（助詞）', weight: 0.5 },
        { word: '勉強', type: '漢字語', weight: 1.0 },
        { word: 'しています', type: '混合語（動詞）', weight: 1.0 }
      ],
      totalWords: 6,
      standardWordCount: 5
    }
  };
}