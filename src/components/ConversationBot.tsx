'use client';

import { useState, useEffect, useRef } from 'react';
import { speechPlayer } from '@/utils/SpeechPlayer';
import questionsData from '@/data/QuestionList.json';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface Question {
  id: number;
  question: string;
  answer: string;
}

interface ConversationBotProps {
  onTestComplete: (score: number, totalQuestions: number) => void;
  onTestEnd: () => void;
}

export default function ConversationBot({ onTestComplete, onTestEnd }: ConversationBotProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [testStarted, setTestStarted] = useState(false);
  const [testEnded, setTestEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Speech recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionsRef = useRef<Question[]>([]);
  const totalQuestions = 10; // Show 10 questions out of 50
  const questionTimeLimit = 15; // 15 seconds per question

  // Initialize questions on component mount
  useEffect(() => {
    // Properly shuffle and select random questions using Fisher-Yates algorithm
    const shuffled = [...questionsData];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    questionsRef.current = shuffled.slice(0, totalQuestions);
  }, []);

  // Start the test
  const startTest = () => {
    if (testStarted) return; // Prevent multiple starts
    
    setTestStarted(true);
    setQuestionNumber(1);
    setCurrentQuestion(questionsRef.current[0]); // First question is at index 0
    setTimeLeft(questionTimeLimit);
    
    // Small delay to ensure component is fully mounted before speaking
    setTimeout(() => {
      speakQuestion(questionsRef.current[0]);
    }, 500);
  };

  // Speak the current question
  const speakQuestion = async (question: Question) => {
    setIsPlaying(true);
    setUserAnswer('');
    setShowAnswer(false);
    
    try {
      await speechPlayer.speak({
        text: question.question, // Speak only the question, no number
        speed: 0.9,
        volume: 0.8
      });
    } catch (error) {
      // Only log actual errors, not interruptions
      if (error instanceof Error && !error.message.includes('interrupted')) {
        console.error('Speech error:', error);
      }
    } finally {
      setIsPlaying(false);
    }
  };

  // Handle mute toggle - now starts/stops speech recognition
  const toggleMute = () => {
    if (!browserSupportsSpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      // Stop listening and submit the answer
      SpeechRecognition.stopListening();
      setIsListening(false);
      
      // Use the transcript as the answer
      if (transcript.trim()) {
        setUserAnswer(transcript.trim());
        submitAnswer();
      }
    } else {
      // Start listening
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
      setIsListening(true);
    }
  };

  // Handle user answer submission
  const submitAnswer = () => {
    if (!currentQuestion || testEnded) return;

    // Stop listening if active
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    }

    // Check if answer is correct with more accurate matching
    const userAnswerLower = userAnswer.toLowerCase().trim();
    const correctAnswerLower = currentQuestion.answer.toLowerCase().trim();
    
    // Split correct answer by common separators and check if user answer matches any part
    const correctAnswers = correctAnswerLower.split(/[,;|]/).map(a => a.trim());
    
    // More accurate matching - check for exact matches or substantial matches
    const isCorrect = correctAnswers.some(answer => {
      // Remove common words that might interfere with matching
      const cleanUserAnswer = userAnswerLower.replace(/\b(the|a|an|and|or|of|in|on|at|to|for|with|by)\b/g, '').trim();
      const cleanCorrectAnswer = answer.replace(/\b(the|a|an|and|or|of|in|on|at|to|for|with|by)\b/g, '').trim();
      
      // Check for exact match
      if (cleanUserAnswer === cleanCorrectAnswer) return true;
      
      // Check if user answer contains the main part of the correct answer (at least 3 characters)
      if (cleanCorrectAnswer.length >= 3 && cleanUserAnswer.includes(cleanCorrectAnswer)) return true;
      
      // Check if correct answer contains the main part of user answer (at least 3 characters)
      if (cleanUserAnswer.length >= 3 && cleanCorrectAnswer.includes(cleanUserAnswer)) return true;
      
      // For very short answers, require exact match
      if (cleanCorrectAnswer.length < 3 && cleanUserAnswer === cleanCorrectAnswer) return true;
      
      return false;
    });

    // Debug logging
    console.log('Answer Check:', {
      userAnswer: userAnswerLower,
      correctAnswer: correctAnswerLower,
      correctAnswers: correctAnswers,
      isCorrect: isCorrect
    });

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Show the correct answer
    setShowAnswer(true);
    
    // Move to next question after a brief delay
    setTimeout(() => {
      nextQuestion();
    }, 3000);
  };

  // Move to next question
  const nextQuestion = () => {
    if (questionNumber >= totalQuestions) {
      endTest();
      return;
    }

    // Stop listening and reset transcript
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    }
    resetTranscript();

    const nextQ = questionsRef.current[questionNumber - 1]; // questionNumber is 1-based, array is 0-based
    setQuestionNumber(prev => prev + 1);
    setCurrentQuestion(nextQ);
    setTimeLeft(questionTimeLimit);
    setUserAnswer('');
    setShowAnswer(false);
    
    // Speak next question
    setTimeout(() => {
      speakQuestion(nextQ);
    }, 500);
  };

  // End the test
  const endTest = () => {
    setTestEnded(true);
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onTestComplete(score, totalQuestions);
  };

  // Timer effect
  useEffect(() => {
    if (!testStarted || testEnded || isPlaying) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up, move to next question
          nextQuestion();
          return questionTimeLimit;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [testStarted, testEnded, isPlaying, questionNumber]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Stop speech recognition
      if (isListening) {
        SpeechRecognition.stopListening();
      }
      // Stop any ongoing speech before destroying
      speechPlayer.stop();
      speechPlayer.destroy();
    };
  }, [isListening]);

  // Start the test immediately when component mounts
  useEffect(() => {
    if (!testStarted) {
      startTest();
    }
  }, [testStarted]);

  // Show browser compatibility warning
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Browser Not Supported
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for the best experience.
          </p>
          <button
            onClick={onTestEnd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (testEnded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        {/* BB-Global Solutions Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">BB</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">BB-Global Solutions</h1>
                <p className="text-gray-600 text-sm">Innovative Technology Solutions</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center p-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Test Complete!
          </h1>
          <div className="text-6xl font-bold text-blue-600 mb-4">
            {score}/{totalQuestions}
          </div>
          <p className="text-lg text-gray-600 mb-8">
            You scored {score} out of {totalQuestions} questions correctly.
            {score >= totalQuestions * 0.6 ? ' Great job!' : ' Keep studying!'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Take Test Again
            </button>
            <button
              onClick={onTestEnd}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Back to Home
            </button>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* BB-Global Solutions Header */}
      <header className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-xl">BB</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                BB-Global Solutions
              </h1>
              <p className="text-blue-300 text-sm font-medium">Innovative Technology Solutions</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center p-8 pt-20">
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 max-w-5xl w-full border border-white/10 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-xl"></div>
        {/* Header */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">{questionNumber}</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                Question {questionNumber} of {totalQuestions}
              </div>
              <div className="text-blue-200 text-sm">U.S. Citizenship Test</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{score}</div>
              <div className="text-blue-200 text-sm">Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-yellow-400'}`}>
                {timeLeft}s
              </div>
              <div className="text-blue-200 text-sm">Time Left</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-4 mb-8 relative overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000 relative"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {Math.round((questionNumber / totalQuestions) * 100)}% Complete
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8 relative z-10">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-6">
            <h2 className="text-3xl font-bold text-white mb-2 leading-relaxed">
              {currentQuestion?.question}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4"></div>
          </div>
          
          {/* Audio Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => currentQuestion && speakQuestion(currentQuestion)}
              disabled={isPlaying}
              className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none"
            >
              <span className="flex items-center gap-2">
                {isPlaying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Speaking...
                  </>
                ) : (
                  <>
                    <span className="text-lg">🔊</span>
                    Replay Question
                  </>
                )}
              </span>
            </button>
            <button
              onClick={toggleMute}
              disabled={!browserSupportsSpeechRecognition}
              className={`group font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none ${
                isListening
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
              } ${!browserSupportsSpeechRecognition ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{isListening ? '⏹️' : '🎤'}</span>
                {isListening ? 'Stop & Submit' : 'Start Speaking'}
              </span>
            </button>
          </div>

          {/* Speech Recognition Status */}
          {isListening && (
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-lg">🎤 Listening... Speak your answer</span>
              </div>
              {transcript && (
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-blue-200 text-sm mb-1 font-medium">You said:</p>
                  <p className="text-white text-lg font-medium">"{transcript}"</p>
                </div>
              )}
            </div>
          )}

          {/* Answer Input */}
          <div className="mb-8">
            <label className="block text-lg font-bold text-white mb-4">
              Your Answer {isListening && <span className="text-blue-300">(or speak your answer)</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={isListening ? "Speaking... or type here" : "Type your answer here or click 'Start Speaking'"}
                className="w-full p-6 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-xl text-white placeholder-white/50 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/20 transition-all duration-300"
                onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                disabled={isListening}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {isListening ? (
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-2xl">✏️</span>
                )}
              </div>
            </div>
            {isListening && (
              <p className="mt-3 text-blue-300 text-sm font-medium flex items-center gap-2">
                <span>💡</span>
                Speak clearly into your microphone, or type your answer above
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() && !isListening}
              className="group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-12 rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl disabled:transform-none disabled:shadow-none"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">{isListening ? '📤' : '✅'}</span>
                {isListening ? 'Submit Spoken Answer' : 'Submit Answer'}
                <span className="text-2xl">🚀</span>
              </span>
            </button>
          </div>
        </div>

        {/* Show Answer Result */}
        {showAnswer && currentQuestion && (
          <div className={`mt-8 border-2 rounded-2xl p-8 backdrop-blur-sm ${
            userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim() || 
            currentQuestion.answer.toLowerCase().split(/[,;|]/).some(answer => {
              const cleanUserAnswer = userAnswer.toLowerCase().replace(/\b(the|a|an|and|or|of|in|on|at|to|for|with|by)\b/g, '').trim();
              const cleanCorrectAnswer = answer.trim().replace(/\b(the|a|an|and|or|of|in|on|at|to|for|with|by)\b/g, '').trim();
              return cleanUserAnswer === cleanCorrectAnswer || 
                     (cleanCorrectAnswer.length >= 3 && cleanUserAnswer.includes(cleanCorrectAnswer)) ||
                     (cleanUserAnswer.length >= 3 && cleanCorrectAnswer.includes(cleanUserAnswer));
            })
              ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-400/30' 
              : 'bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-400/30'
          }`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim() || 
                currentQuestion.answer.toLowerCase().split(/[,;|]/).some(answer => {
                  const cleanUserAnswer = userAnswer.toLowerCase().replace(/\b(the|a|an|and|or|of|in|on|at|to|for|with|by)\b/g, '').trim();
                  const cleanCorrectAnswer = answer.trim().replace(/\b(the|a|an|and|or|of|in|on|at|to|for|with|by)\b/g, '').trim();
                  return cleanUserAnswer === cleanCorrectAnswer || 
                         (cleanCorrectAnswer.length >= 3 && cleanUserAnswer.includes(cleanCorrectAnswer)) ||
                         (cleanUserAnswer.length >= 3 && cleanCorrectAnswer.includes(cleanUserAnswer));
                })
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-br from-red-400 to-pink-500'
              }`}>
                <span className="text-3xl">
                  {userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim() || 
                   currentQuestion.answer.toLowerCase().split(/[,;|]/).some(answer => {
                     const cleanUserAnswer = userAnswer.toLowerCase().replace(/\b(the|a|an|and|or|of|in|on|at|to|for|with|by)\b/g, '').trim();
                     const cleanCorrectAnswer = answer.trim().replace(/\b(the|a|an|and|or|of|in|on|at|to|for|with|by)\b/g, '').trim();
                     return cleanUserAnswer === cleanCorrectAnswer || 
                            (cleanCorrectAnswer.length >= 3 && cleanUserAnswer.includes(cleanCorrectAnswer)) ||
                            (cleanUserAnswer.length >= 3 && cleanCorrectAnswer.includes(cleanUserAnswer));
                   })
                    ? '✅' 
                    : '❌'}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim() || 
                   currentQuestion.answer.toLowerCase().split(/[,;|]/).some(answer => {
                     const cleanUserAnswer = userAnswer.toLowerCase().replace(/\b(the|a|an|and|or|of|in|on|at|to|for|with|by)\b/g, '').trim();
                     const cleanCorrectAnswer = answer.trim().replace(/\b(the|a|an|and|or|of|in|on|at|to|for|with|by)\b/g, '').trim();
                     return cleanUserAnswer === cleanCorrectAnswer || 
                            (cleanCorrectAnswer.length >= 3 && cleanUserAnswer.includes(cleanCorrectAnswer)) ||
                            (cleanUserAnswer.length >= 3 && cleanCorrectAnswer.includes(cleanUserAnswer));
                   })
                    ? 'Correct! 🎉' 
                    : 'Incorrect 😔'}
                </h3>
                <p className="text-blue-200 text-sm">
                  {userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim() || 
                   currentQuestion.answer.toLowerCase().split(/[,;|]/).some(answer => {
                     const cleanUserAnswer = userAnswer.toLowerCase().replace(/\b(the|a|an|and|or|of|in|on|at|to|for|with|by)\b/g, '').trim();
                     const cleanCorrectAnswer = answer.trim().replace(/\b(the|a|an|and|or|of|in|on|at|to|for|with|by)\b/g, '').trim();
                     return cleanUserAnswer === cleanCorrectAnswer || 
                            (cleanCorrectAnswer.length >= 3 && cleanUserAnswer.includes(cleanCorrectAnswer)) ||
                            (cleanUserAnswer.length >= 3 && cleanCorrectAnswer.includes(cleanUserAnswer));
                   })
                    ? 'Great job! You got it right!' 
                    : 'Keep studying! You\'ll get it next time.'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-blue-200 text-sm mb-2 font-medium">Your answer:</p>
                <p className="text-white text-lg font-medium">"{userAnswer}"</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-blue-200 text-sm mb-2 font-medium">Correct answer:</p>
                <p className="text-white text-lg font-medium">"{currentQuestion.answer}"</p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
