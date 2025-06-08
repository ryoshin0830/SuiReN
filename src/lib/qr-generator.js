import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    // まず元のデータでQRコード生成を試行
    const qrString = await QRCode.toDataURL(JSON.stringify(data));
    return qrString;
  } catch (error) {
    console.error('QRコード生成エラー:', error);
    
    // データサイズエラーの場合、最小限のデータで再試行
    if (error.message.includes('too big')) {
      console.log('データサイズが大きすぎます。最小限のデータでQRコードを生成します...');
      try {
        const minimalData = {
          contentId: data.contentId,
          accuracy: data.accuracy,
          readingTime: data.readingTime,
          timestamp: data.timestamp
        };
        const fallbackQR = await QRCode.toDataURL(JSON.stringify(minimalData));
        return fallbackQR;
      } catch (fallbackError) {
        console.error('フォールバックQRコード生成も失敗:', fallbackError);
        return null;
      }
    }
    
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
  const correctAnswers = answers.filter((answer, index) => 
    answer === questions[index].correctAnswer
  ).length;
  
  const accuracy = Math.round((correctAnswers / questions.length) * 100);
  
  // QRコード用に軽量化されたデータ（scrollPatternを除外）
  const lightScrollData = {
    totalScrollEvents: scrollData.totalScrollEvents
    // scrollPatternは重すぎるため除外
  };
  
  return {
    contentId,
    contentTitle,
    accuracy,
    correctAnswers,
    totalQuestions: questions.length,
    readingTime,
    scrollData: lightScrollData, // 軽量化されたデータを使用
    timestamp: new Date().toISOString(),
    color: getQRColor(accuracy)
  };
};