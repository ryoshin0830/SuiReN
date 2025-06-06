import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    const qrString = await QRCode.toDataURL(JSON.stringify(data));
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
  const correctAnswers = answers.filter((answer, index) => 
    answer === questions[index].correctAnswer
  ).length;
  
  const accuracy = Math.round((correctAnswers / questions.length) * 100);
  
  return {
    contentId,
    contentTitle,
    accuracy,
    correctAnswers,
    totalQuestions: questions.length,
    readingTime,
    scrollData,
    timestamp: new Date().toISOString(),
    color: getQRColor(accuracy)
  };
};