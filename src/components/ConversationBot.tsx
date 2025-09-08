'use client';

import { useState, useEffect, useRef } from 'react';
import { speechPlayer } from '@/utils/SpeechPlayer';
import questionsData from '@/data/QuestionList.json';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Header from './Header';

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
  const [questionNumber, setQuestionNumber] = useState(1);
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
  const testStartedRef = useRef<boolean>(false);
  const totalQuestions = 10; // Show 10 questions out of 50
  const questionTimeLimit = 15; // 15 seconds per question

  // Initialize questions on component mount
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Properly shuffle and select random questions using Fisher-Yates algorithm
    const shuffled = [...questionsData];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    questionsRef.current = shuffled.slice(0, totalQuestions);
    
    // Start the test after questions are loaded
    if (!testStartedRef.current) {
      startTest();
    }
  }, []);

  // Start the test
  const startTest = () => {
    if (testStartedRef.current || testStarted) return; // Prevent multiple starts
    
    testStartedRef.current = true;
    setTestStarted(true);
    setQuestionNumber(1);
    setCurrentQuestion(questionsRef.current[0]); // First question is at index 0
    setTimeLeft(questionTimeLimit);
    
    // Debug logging for first question
    console.log('Starting Test - First Question:', {
      questionNumber: 1,
      arrayIndex: 0,
      questionText: questionsRef.current[0]?.question,
      totalQuestions
    });
    
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

  // Clear the current answer and transcript
  const clearAnswer = () => {
    setUserAnswer('');
    resetTranscript();
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
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
    const nextQuestionIndex = questionNumber; // Current questionNumber (1-based) is the index for the next question
    
    if (nextQuestionIndex > totalQuestions) {
      endTest();
      return;
    }

    // Stop listening and reset transcript
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    }
    resetTranscript();

    const nextQ = questionsRef.current[nextQuestionIndex - 1]; // Convert 1-based to 0-based index
    
    // Debug logging
    console.log('Next Question Debug:', {
      questionNumber,
      nextQuestionIndex,
      arrayIndex: nextQuestionIndex - 1,
      questionText: nextQ?.question,
      totalQuestions
    });
    
    setQuestionNumber(prev => prev + 1); // Increment for the next iteration
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
    
    // Stop microphone and speech recognition
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    }
    
    // Stop any ongoing speech
    speechPlayer.stop();
    
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

  // Cleanup on unmount and when test ends
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

  // Additional cleanup when test ends
  useEffect(() => {
    if (testEnded) {
      // Ensure microphone is turned off when test ends
      if (isListening) {
        SpeechRecognition.stopListening();
        setIsListening(false);
      }
      // Stop any ongoing speech
      speechPlayer.stop();
    }
  }, [testEnded, isListening]);


  // Show browser compatibility warning
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4 sm:p-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full text-center">
          <div className="text-4xl sm:text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
            Browser Not Supported
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6">
            Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for the best experience.
          </p>
          <button
            onClick={onTestEnd}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 text-sm sm:text-base"
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
        <Header variant="test-complete" />

        <div className="flex flex-col items-center justify-center p-4 sm:p-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl w-full text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
            Test Complete!
          </h1>
          <div className="text-4xl sm:text-6xl font-bold text-blue-600 mb-4">
            {score}/{totalQuestions}
          </div>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
            You scored {score} out of {totalQuestions} questions correctly.
            {score >= totalQuestions * 0.6 ? ' Great job!' : ' Keep studying!'}
          </p>
          
          {/* Microphone Status
          <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-gray-100 rounded-lg">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600 font-medium">Microphone turned off</span>
          </div> */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 text-sm sm:text-base"
            >
              Take Test Again
            </button>
            <button
              onClick={onTestEnd}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 text-sm sm:text-base"
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
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 w-60 h-60 sm:w-80 sm:h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <Header variant="default" />

      <div className="flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20">
        <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 max-w-5xl w-full border border-white/10 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-xl"></div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 relative z-10 gap-4 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-base sm:text-lg">{questionNumber}</span>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-white">
                Question {questionNumber} of {totalQuestions}
              </div>
              <div className="text-blue-200 text-xs sm:text-sm">U.S. Citizenship Test</div>
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-white">{score}</div>
              <div className="text-blue-200 text-xs sm:text-sm">Score</div>
            </div>
            <div className="text-center">
              <div className={`text-xl sm:text-2xl font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-yellow-400'}`}>
                {timeLeft}s
              </div>
              <div className="text-blue-200 text-xs sm:text-sm">Time Left</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-3 sm:h-4 mb-6 sm:mb-8 relative overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-3 sm:h-4 rounded-full transition-all duration-1000 relative"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs sm:text-sm font-medium">
              {Math.round((questionNumber / totalQuestions) * 100)}% Complete
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6 sm:mb-8 relative z-10">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/10 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-relaxed">
              {currentQuestion?.question}
            </h2>
            <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-3 sm:mt-4"></div>
          </div>
          
          {/* Audio Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => currentQuestion && speakQuestion(currentQuestion)}
              disabled={isPlaying}
              className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none text-sm sm:text-base"
            >
              <span className="flex items-center justify-center gap-2">
                {isPlaying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Speaking...</span>
                    <span className="sm:hidden">Speaking</span>
                  </>
                ) : (
                  <>
                    <span className="text-base sm:text-lg">🔊</span>
                    <span className="hidden sm:inline">Replay Question</span>
                    <span className="sm:hidden">Replay</span>
                  </>
                )}
              </span>
            </button>
            <button
              onClick={toggleMute}
              disabled={!browserSupportsSpeechRecognition}
              className={`group font-semibold py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:transform-none text-sm sm:text-base ${
                isListening
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
              } ${!browserSupportsSpeechRecognition ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-base sm:text-lg">{isListening ? '⏹️' : '🎤'}</span>
                <span className="hidden sm:inline">{isListening ? 'Stop & Submit' : 'Start Speaking'}</span>
                <span className="sm:hidden">{isListening ? 'Stop' : 'Speak'}</span>
              </span>
            </button>
            <button
              onClick={onTestEnd}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 sm:px-6 rounded-xl transition-colors duration-200 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </button>
          </div>

          {/* Speech Recognition Status */}
          {isListening && (
            <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-xl sm:rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white font-bold text-base sm:text-lg">🎤 Listening... Speak your answer</span>
              </div>
              {/* button to clear response */}
              <button onClick={clearAnswer} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base mb-3">
                Clear Response
              </button>
              {transcript && (
                <div className="bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-blue-200 text-xs sm:text-sm mb-1 font-medium">You said:</p>
                  <p className="text-white text-sm sm:text-lg font-medium">"{transcript}"</p>
                </div>
              )}
            </div>
          )}

          {/* Answer Input */}
          <div className="mb-6 sm:mb-8">
            <label className="block text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
              Your Answer {isListening && <span className="text-blue-300 text-sm sm:text-base">(or speak your answer)</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder={isListening ? "Speaking... or type here" : "Type your answer here or click 'Start Speaking'"}
                className="w-full p-4 sm:p-6 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl sm:rounded-2xl text-lg sm:text-xl text-white placeholder-white/50 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/20 transition-all duration-300"
                onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                disabled={isListening}
              />
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                {isListening ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-lg sm:text-2xl">✏️</span>
                )}
              </div>
            </div>
            {isListening && (
              <p className="mt-3 text-blue-300 text-xs sm:text-sm font-medium flex items-center gap-2">
                <span>💡</span>
                Speak clearly into your microphone, or type your answer above
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            {(userAnswer.trim() || transcript.trim()) && !isListening && (
              <button
                onClick={clearAnswer}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Clear Answer</span>
                <span className="sm:hidden">Clear</span>
              </button>
            )}
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() && !isListening}
              className="group bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-12 rounded-xl sm:rounded-2xl text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl disabled:transform-none disabled:shadow-none"
            >
              <span className="flex items-center gap-2 sm:gap-3">
                <span className="text-lg sm:text-2xl">{isListening ? '📤' : '✅'}</span>
                <span className="hidden sm:inline">{isListening ? 'Submit Spoken Answer' : 'Submit Answer'}</span>
                <span className="sm:hidden">{isListening ? 'Submit Speech' : 'Submit'}</span>
                <span className="text-lg sm:text-2xl">🚀</span>
              </span>
            </button>
          </div>
        </div>

        {/* Show Answer Result */}
        {showAnswer && currentQuestion && (
          <div className={`mt-6 sm:mt-8 border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 backdrop-blur-sm ${
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
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center ${
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
                <span className="text-2xl sm:text-3xl">
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
                <h3 className="text-lg sm:text-2xl font-bold text-white mb-1">
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
                <p className="text-blue-200 text-xs sm:text-sm">
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
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-blue-200 text-xs sm:text-sm mb-2 font-medium">Your answer:</p>
                <p className="text-white text-sm sm:text-lg font-medium">"{userAnswer}"</p>
              </div>
              <div className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-blue-200 text-xs sm:text-sm mb-2 font-medium">Correct answer:</p>
                <p className="text-white text-sm sm:text-lg font-medium">"{currentQuestion.answer}"</p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
