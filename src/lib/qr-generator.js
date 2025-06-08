import QRCode from 'qrcode';

// UTF-8文字列をURLサフェなBase64エンコードする関数
const encodeBase64UTF8 = (str) => {
  // TextEncoderを使用してUTF-8バイト配列に変換
  const bytes = new TextEncoder().encode(str);
  // バイト配列をバイナリ文字列に変換
  const binary = String.fromCharCode(...bytes);
  // Base64エンコードしてURLサフェに変換
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

export const generateQRCode = async (qrData) => {
  try {
    // 最小限のデータでQRコード生成
    const encoded = encodeBase64UTF8(JSON.stringify(qrData));
    const resultUrl = `${window.location.origin}/result/${encoded}`;
    
    console.log('QRコード用最小データ:', qrData);
    console.log('データサイズ:', JSON.stringify(qrData).length, 'bytes');
    console.log('QRコード用URL:', resultUrl);
    
    const qrString = await QRCode.toDataURL(resultUrl);
    return qrString;
  } catch (error) {
    console.error('QRコード生成エラー:', error);
    return null;
  }
};

export const getQRColor = (accuracy) => {
  if (accuracy < 70) return '#ef4444'; // red
  if (accuracy < 80) return '#3b82f6'; // blue
  return '#10b981'; // green
};

export const createResultData = ({
  contentId,
  contentTitle,
  answers,
  questions,
  readingTime,
  scrollData
}) => {
  // QRコード用の最小限データ（表示用データは別途作成）
  const minimalQRData = {
    contentId,
    answers, // 選択した回答のインデックス配列
    timestamp: new Date().toISOString()
  };

  // 表示用の詳細データ
  const displayData = createDisplayData({
    contentId,
    contentTitle,
    answers,
    questions,
    readingTime,
    scrollData
  });

  // QRコード用とローカル表示用を分離
  return {
    qrData: minimalQRData,
    displayData: displayData
  };
};

// 表示用の詳細データを作成
const createDisplayData = ({
  contentId,
  contentTitle,
  answers,
  questions,
  readingTime,
  scrollData
}) => {
  if (!questions || questions.length === 0) {
    return {
      contentId,
      contentTitle,
      accuracy: null,
      correctAnswers: 0,
      totalQuestions: 0,
      readingTime,
      scrollData: {
        totalScrollEvents: scrollData.totalScrollEvents || 0,
        maxScrollPosition: scrollData.maxScrollPosition || 0
      },
      answers: [],
      questionResults: [],
      timestamp: new Date().toISOString(),
      color: '#6b7280'
    };
  }

  const correctAnswers = answers.filter((answer, index) => 
    answer === questions[index].correctAnswer
  ).length;
  
  const accuracy = Math.round((correctAnswers / questions.length) * 100);
  
  const questionResults = questions.map((question, index) => ({
    questionId: question.id,
    question: question.question,
    options: question.options,
    userAnswerIndex: answers[index],
    correctAnswerIndex: question.correctAnswer,
    userAnswer: question.options[answers[index]] || '未回答',
    correctAnswer: question.options[question.correctAnswer],
    isCorrect: answers[index] === question.correctAnswer,
    explanation: question.explanation || null
  }));
  
  return {
    contentId,
    contentTitle,
    accuracy,
    correctAnswers,
    totalQuestions: questions.length,
    answers,
    questionResults,
    readingTime,
    scrollData: {
      totalScrollEvents: scrollData.totalScrollEvents || 0,
      maxScrollPosition: scrollData.maxScrollPosition || 0
    },
    timestamp: new Date().toISOString(),
    color: getQRColor(accuracy)
  };
};

