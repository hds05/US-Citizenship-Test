'use client';

import { useState } from 'react';
import ConversationBot from './ConversationBot';
import Header from './Header';

export default function HomePage() {
  const [showTest, setShowTest] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [testResults, setTestResults] = useState<{ score: number; total: number } | null>(null);

  const handleStartTest = () => {
    setShowInstructions(true);
    setTestResults(null);
  };

  const handleStartActualTest = () => {
    setShowInstructions(false);
    setShowTest(true);
  };

  const handleTestComplete = (score: number, totalQuestions: number) => {
    setTestResults({ score, total: totalQuestions });
  };

  const handleTestEnd = () => {
    setShowTest(false);
    setTestResults(null);
  };

  if (showTest) {
    return (
      <ConversationBot 
        onTestComplete={handleTestComplete}
        onTestEnd={handleTestEnd}
      />
    );
  }

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 left-1/2 w-60 h-60 sm:w-80 sm:h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        </div>

        <Header variant="instructions" backgroundImage="https://img.freepik.com/premium-photo/usa-flag-black-wood-wall-horizontal-panoramic-banner_118047-6332.jpg" />

        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20" style={{backgroundImage: "url('https://png.pngtree.com/background/20250609/original/pngtree-hand-drawn-grunge-american-flag-independence-day-picture-image_15560148.jpg')", backgroundSize: "cover", backgroundPosition: "center"}}>
          <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 max-w-4xl w-full border border-white/10 relative overflow-hidden" style={{backgroundImage: "url('https://images.pexels.com/photos/973049/pexels-photo-973049.jpeg')", backgroundSize: "cover", backgroundPosition: "center"}}>
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-xl"></div>

            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 relative z-10">
              <div className="inline-block mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-400/30">
                  📋 Test Instructions
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-6 tracking-tight">
                Taking the Test
              </h1>
            </div>

            {/* Instructions Content */}
            <div className="space-y-6 sm:space-y-8 relative z-10">
              <div className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/10">
                <div className="space-y-4 sm:space-y-6 text-blue-100/90 leading-relaxed">
                  <p className="text-base sm:text-lg lg:text-xl">
                    During the naturalization interview, a USCIS Officer will ask you up to 10 civics questions from the list of 100. You must correctly answer six (6) questions to pass the civics portion of the naturalization test.
                  </p>
                  <p className="text-base sm:text-lg lg:text-xl">
                    You will need to say the answers aloud. In the official test, the questions are not multiple choice. Here, you can practice taking the test.
                  </p>
                  <p className="text-base text-transparent bg-gradient-to-r from-red-500 via-blue-500 to-purple-500 bg-clip-text sm:text-lg lg:text-xl font-semibold">
                    Good luck!
                  </p>
                </div>
              </div>

              {/* Test Features */}
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🎤</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">Voice Recognition</h3>
                  </div>
                  <p className="text-blue-100/80 text-sm">Speak your answers clearly into your microphone</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">⏱️</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">15 Seconds</h3>
                  </div>
                  <p className="text-blue-100/80 text-sm">You have 15 seconds to answer each question</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📚</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">10 Questions</h3>
                  </div>
                  <p className="text-blue-100/80 text-sm">Randomly selected from 100 official questions</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🎯</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">Pass Score</h3>
                  </div>
                  <p className="text-blue-100/80 text-sm">Answer 6 out of 10 questions correctly to pass</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8 sm:mt-12 relative z-10">
              <button
                onClick={() => setShowInstructions(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 text-sm sm:text-base"
              >
                Back to Home
              </button>
              <button
                onClick={handleStartActualTest}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl text-center"
              >
                <span className="flex justify-center gap-2">
                  <span className="text-xl">🚀</span>
                  Start Test
                  <span className="text-xl">🎯</span>
                </span>
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

      <Header 
        variant="instructions" 
        backgroundImage="https://t4.ftcdn.net/jpg/02/67/27/65/360_F_267276558_EDSjzU1QsYBacVSeVjM7zNxamn3q4HW9.jpg"
      />

      {/* Main Content Area */}
      <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 background" style={{backgroundImage: "url('https://png.pngtree.com/background/20250609/original/pngtree-hand-drawn-grunge-american-flag-independence-day-picture-image_15560148.jpg')", backgroundSize: "cover", backgroundPosition: "center"}}>
        <div className="relative z-10 max-w-5xl w-full text-center">
        {/* Main Content */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 border border-white/10 relative overflow-hidden"  style={{backgroundImage: "url('https://images.pexels.com/photos/973049/pexels-photo-973049.jpeg')", backgroundSize: "cover", backgroundPosition: "center"}}>
          {/* Decorative Elements */}
          {/* <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div> */}
          <div className="absolute top-4 right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-xl"></div>
          {/* Header */}
          <div className="mb-12 sm:mb-16 relative z-10">
            <div className="inline-block mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border border-blue-400/30">
                🎯 Interactive Learning Platform
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-6 sm:mb-8 tracking-tight leading-tight">
              U.S. Citizenship Test
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100/90 max-w-3xl mx-auto leading-relaxed font-light">
              Master your citizenship test with our cutting-edge, voice-guided experience. 
              Practice with AI-powered speech recognition and authentic questions from the official test bank.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group flex flex-col justify-center items-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex justify-center items-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Voice-Guided</h3>
              <p className="text-blue-100/80 leading-relaxed">Questions are spoken aloud for an authentic test experience with speech recognition</p>
            </div>
            <div className="group flex flex-col justify-center items-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Timed Questions</h3>
              <p className="text-blue-100/80 leading-relaxed">15 seconds per question to simulate real test conditions and build confidence</p>
            </div>
            <div className="group flex flex-col justify-center items-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Official Questions</h3>
              <p className="text-blue-100/80 leading-relaxed">50 authentic questions from the official USCIS test bank</p>
            </div>
          </div>

          {/* Test Results Display */}
          {testResults && (
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-2xl p-8 mb-12 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Last Test Results</h3>
              <div className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4 text-center">
                {testResults.score}/{testResults.total}
              </div>
              <p className="text-green-100 text-center text-lg">
                {testResults.score >= testResults.total * 0.6 
                  ? '🎉 Excellent work! You passed!' 
                  : '💪 Keep studying! You can do better next time.'}
              </p>
            </div>
          )}

          {/* Start Button */}
          <div className="relative group">
            {/* <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div> */}
            <button
              onClick={handleStartTest}
              className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold py-6 px-16 rounded-2xl text-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl group-hover:shadow-blue-500/25"
            >
              <span className="flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                Begin Practice 
                <span className="text-3xl">🎯</span>
              </span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-blue-200/80">
            <div className="flex items-center gap-3 justify-center">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-sm">📝</span>
              </div>
              <span className="text-sm font-medium">10 randomly selected questions per test</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-sm">🎧</span>
              </div>
              <span className="text-sm font-medium">Use headphones for best experience</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <span className="text-sm">🎤</span>
              </div>
              <span className="text-sm font-medium">Voice recognition available</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
            {/* <span className="text-2xl">US</span> */}
            <p className="text-blue-200/90 font-medium">
              Practice makes perfect. Good luck with your citizenship journey!
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
