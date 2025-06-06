'use client';

import { useState, useEffect, useRef } from 'react';
import { ReadingTracker } from '../lib/reading-tracker';
import ResultDisplay from './ResultDisplay';

export default function ReadingTest({ content, onBack }) {
  const [phase, setPhase] = useState('instructions'); // instructions, reading, questions, results
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [readingData, setReadingData] = useState(null);
  const trackerRef = useRef(null);

  useEffect(() => {
    trackerRef.current = new ReadingTracker();
    return () => {
      if (trackerRef.current) {
        trackerRef.current.stopTracking();
      }
    };
  }, []);

  const startReading = () => {
    setPhase('reading');
    trackerRef.current.startTracking();
  };

  const finishReading = () => {
    trackerRef.current.stopTracking();
    const readingTime = trackerRef.current.getReadingTime();
    const scrollData = trackerRef.current.getScrollData();
    
    setReadingData({
      readingTime,
      scrollData
    });
    
    setPhase('questions');
    setAnswers(new Array(content.questions.length).fill(null));
  };

  const handleAnswer = (questionIndex, answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const submitAnswers = () => {
    setPhase('results');
  };

  const allQuestionsAnswered = answers.every(answer => answer !== null);

  if (phase === 'results') {
    return (
      <ResultDisplay
        content={content}
        answers={answers}
        readingData={readingData}
        onBack={onBack}
        onRetry={() => {
          setPhase('instructions');
          setAnswers([]);
          setCurrentQuestionIndex(0);
          setReadingData(null);
          trackerRef.current.reset();
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {phase === 'instructions' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {content.title} - {content.level}
          </h1>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              読解練習の進め方
            </h2>
            <ol className="text-blue-700 space-y-2">
              <li>1. 「読書開始」ボタンを押して文章を読んでください</li>
              <li>2. 読み終わったら「読書完了」ボタンを押してください</li>
              <li>3. 理解度確認の質問に答えてください</li>
              <li>4. 結果が表示されます</li>
            </ol>
          </div>
          
          <div className="text-center">
            <button
              onClick={startReading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              読書開始
            </button>
          </div>
        </div>
      )}

      {phase === 'reading' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {content.title}
            </h1>
            <button
              onClick={finishReading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              読書完了
            </button>
          </div>
          
          <div className="prose max-w-none">
            <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-line">
              {content.text}
            </div>
          </div>
        </div>
      )}

      {phase === 'questions' && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              理解度確認
            </h1>
            <p className="text-gray-600">
              読書時間: {readingData.readingTime}秒
            </p>
          </div>
          
          <div className="space-y-8">
            {content.questions.map((question, questionIndex) => (
              <div key={question.id} className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  問題 {questionIndex + 1}: {question.question}
                </h3>
                
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label 
                      key={optionIndex}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={optionIndex}
                        checked={answers[questionIndex] === optionIndex}
                        onChange={() => handleAnswer(questionIndex, optionIndex)}
                        className="mr-3 text-blue-600"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={submitAnswers}
              disabled={!allQuestionsAnswered}
              className={`px-8 py-3 rounded-lg text-lg font-semibold transition-colors ${
                allQuestionsAnswered
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              回答を送信
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← 練習選択に戻る
        </button>
      </div>
    </div>
  );
}