/**
 * ruby-utils.js - ルビ（振り仮名）処理ユーティリティ
 * 
 * 小説家になろうのルビ記法に対応：
 * - 基本記法: ｜漢字《ルビ》
 * - 省略記法: 漢字《ルビ》 (漢字+ひらがな/カタカナの場合)
 * - 括弧記法: 漢字(ルビ) (漢字+ひらがな/カタカナの場合)
 * - 回避記法: 漢字｜(括弧内容) (括弧をルビにしたくない場合)
 */

/**
 * ひらがな・カタカナ判定の正規表現
 */
const HIRAGANA_KATAKANA_REGEX = /^[\u3040-\u309F\u30A0-\u30FF]+$/;

/**
 * 漢字判定の正規表現
 */
const KANJI_REGEX = /[\u4E00-\u9FAF]/;

/**
 * ルビの制約チェック
 * @param {string} ruby - チェックするルビ文字列
 * @param {string} baseText - ベースとなる文字列
 * @returns {boolean} - 有効かどうか
 */
export function validateRuby(ruby, baseText) {
  // 文字数制限（ルビは1～10文字、ベースは1～10文字）
  if (!ruby || ruby.length === 0 || ruby.length > 10) return false;
  if (!baseText || baseText.length === 0 || baseText.length > 10) return false;
  
  // 禁止文字チェック（&, ", <, >）
  const forbiddenChars = /[&"<>]/;
  if (forbiddenChars.test(ruby) || forbiddenChars.test(baseText)) return false;
  
  return true;
}

/**
 * テキストを解析してルビ情報を抽出
 * @param {string} text - 解析対象のテキスト
 * @returns {Array} - パース結果の配列 [{type: 'text'|'ruby', content: string, ruby?: string}]
 */
export function parseRubyText(text) {
  if (!text) return [];
  
  const parts = [];
  let currentIndex = 0;
  
  // 各種ルビ記法の正規表現
  const rubyPatterns = [
    // 1. 基本記法: ｜文字《ルビ》
    /[｜|]([^｜|《》()]+)《([^《》]+)》/g,
    // 2. 省略記法: 漢字《ルビ》（漢字かつひらがな・カタカナルビの場合）
    /([\u4E00-\u9FAF]+)《([\u3040-\u309F\u30A0-\u30FF]+)》/g,
    // 3. 括弧記法: 漢字(ルビ)（漢字かつひらがな・カタカナルビ、回避記法でない場合）
    /(?<![｜|])([\u4E00-\u9FAF]+)\(([\u3040-\u309F\u30A0-\u30FF]+)\)/g
  ];
  
  // 回避記法のパターン: 漢字｜(括弧内容)
  const escapePattern = /([\u4E00-\u9FAF]+)[｜|]\(([^)]+)\)/g;
  
  // まず回避記法を処理（プレースホルダーに置換）
  const escapeMatches = [];
  let processedText = text.replace(escapePattern, (match, baseText, content, offset) => {
    const placeholder = `__ESCAPE_${escapeMatches.length}__`;
    escapeMatches.push({ baseText, content, offset: currentIndex + offset });
    return placeholder;
  });
  
  // ルビパターンをすべて検索
  const allMatches = [];
  
  rubyPatterns.forEach((pattern, patternIndex) => {
    pattern.lastIndex = 0; // グローバルフラグのリセット
    let match;
    while ((match = pattern.exec(processedText)) !== null) {
      const [fullMatch, baseText, ruby] = match;
      
      // バリデーション
      if (validateRuby(ruby, baseText)) {
        // パターン2（省略記法）の場合、漢字＋ひらがな・カタカナかチェック
        if (patternIndex === 1) {
          if (!KANJI_REGEX.test(baseText) || !HIRAGANA_KATAKANA_REGEX.test(ruby)) {
            continue;
          }
        }
        // パターン3（括弧記法）の場合も同様
        if (patternIndex === 2) {
          if (!KANJI_REGEX.test(baseText) || !HIRAGANA_KATAKANA_REGEX.test(ruby)) {
            continue;
          }
        }
        
        allMatches.push({
          start: match.index,
          end: match.index + fullMatch.length,
          baseText,
          ruby,
          fullMatch,
          pattern: patternIndex
        });
      }
    }
  });
  
  // マッチした位置でソート
  allMatches.sort((a, b) => a.start - b.start);
  
  // 重複を除去（長いマッチを優先）
  const filteredMatches = [];
  for (let i = 0; i < allMatches.length; i++) {
    const current = allMatches[i];
    let isOverlapped = false;
    
    for (let j = 0; j < filteredMatches.length; j++) {
      const existing = filteredMatches[j];
      if (
        (current.start >= existing.start && current.start < existing.end) ||
        (current.end > existing.start && current.end <= existing.end) ||
        (current.start <= existing.start && current.end >= existing.end)
      ) {
        isOverlapped = true;
        break;
      }
    }
    
    if (!isOverlapped) {
      filteredMatches.push(current);
    }
  }
  
  // テキストを分割してパーツを作成
  let textIndex = 0;
  filteredMatches.forEach(match => {
    // マッチ前のテキスト
    if (match.start > textIndex) {
      const beforeText = processedText.slice(textIndex, match.start);
      if (beforeText.trim()) {
        parts.push({
          type: 'text',
          content: beforeText
        });
      }
    }
    
    // ルビ部分
    parts.push({
      type: 'ruby',
      content: match.baseText,
      ruby: match.ruby
    });
    
    textIndex = match.end;
  });
  
  // 残りのテキスト
  if (textIndex < processedText.length) {
    const remainingText = processedText.slice(textIndex);
    if (remainingText.trim()) {
      parts.push({
        type: 'text',
        content: remainingText
      });
    }
  }
  
  // 回避記法のプレースホルダーを元に戻す
  return parts.map(part => {
    if (part.type === 'text') {
      let content = part.content;
      escapeMatches.forEach((escape, index) => {
        const placeholder = `__ESCAPE_${index}__`;
        content = content.replace(placeholder, `${escape.baseText}(${escape.content})`);
      });
      return { ...part, content };
    }
    return part;
  });
}

/**
 * ルビ付きテキストをHTMLとしてレンダリング
 * @param {string} text - ルビ記法を含むテキスト
 * @returns {Array} - React要素の配列
 */
export function renderRubyText(text) {
  const parts = parseRubyText(text);
  
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
}

/**
 * ルビ入力のヘルパー関数
 * @param {string} baseText - ベースとなる文字列
 * @param {string} ruby - ルビ文字列
 * @param {string} format - 出力形式 ('basic' | 'short' | 'paren')
 * @returns {string} - フォーマット済みのルビ記法
 */
export function formatRubyText(baseText, ruby, format = 'basic') {
  if (!validateRuby(ruby, baseText)) {
    throw new Error('無効なルビです');
  }
  
  switch (format) {
    case 'basic':
      return `｜${baseText}《${ruby}》`;
    case 'short':
      if (KANJI_REGEX.test(baseText) && HIRAGANA_KATAKANA_REGEX.test(ruby)) {
        return `${baseText}《${ruby}》`;
      }
      return `｜${baseText}《${ruby}》`;
    case 'paren':
      if (KANJI_REGEX.test(baseText) && HIRAGANA_KATAKANA_REGEX.test(ruby)) {
        return `${baseText}(${ruby})`;
      }
      return `｜${baseText}《${ruby}》`;
    default:
      return `｜${baseText}《${ruby}》`;
  }
}

/**
 * ルビ記法の例を取得
 * @returns {Array} - 例の配列
 */
export function getRubyExamples() {
  return [
    {
      description: '基本記法（すべての場合に使用可能）',
      format: '｜文字《ルビ》',
      example: '｜漢字《かんじ》',
      usage: '確実にルビを設定したい場合'
    },
    {
      description: '省略記法（漢字＋ひらがな・カタカナのみ）',
      format: '漢字《ルビ》',
      example: '漢字《かんじ》',
      usage: '漢字にひらがな・カタカナのルビを振る場合'
    },
    {
      description: '括弧記法（漢字＋ひらがな・カタカナのみ）',
      format: '漢字(ルビ)',
      example: '漢字(かんじ)',
      usage: '簡単にルビを入力したい場合'
    },
    {
      description: '回避記法（括弧をルビにしたくない場合）',
      format: '漢字｜(内容)',
      example: '漢字｜(注釈)',
      usage: '括弧内をルビとして表示したくない場合'
    }
  ];
} 