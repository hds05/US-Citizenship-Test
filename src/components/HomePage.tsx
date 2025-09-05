'use client';

import { useState } from 'react';
import ConversationBot from './ConversationBot';

export default function HomePage() {
  const [showTest, setShowTest] = useState(false);
  const [testResults, setTestResults] = useState<{ score: number; total: number } | null>(null);

  const handleStartTest = () => {
    setShowTest(true);
    setTestResults(null);
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
          <div className="flex items-center justify-center">
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
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex items-center justify-center p-8 pt-20">
        <div className="relative z-10 max-w-5xl w-full text-center">
        {/* Main Content */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl p-12 border border-white/10 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-full blur-xl"></div>
          {/* Header */}
          <div className="mb-16 relative z-10">
            <div className="inline-block mb-6">
              <span className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-400/30">
                🎯 Interactive Learning Platform
              </span>
            </div>
            <h1 className="text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-8 tracking-tight leading-tight">
              U.S. Citizenship Test
            </h1>
            <p className="text-xl text-blue-100/90 max-w-3xl mx-auto leading-relaxed font-light">
              Master your citizenship test with our cutting-edge, voice-guided experience. 
              Practice with AI-powered speech recognition and authentic questions from the official test bank.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Voice-Guided</h3>
              <p className="text-blue-100/80 leading-relaxed">Questions are spoken aloud for an authentic test experience with speech recognition</p>
            </div>
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Timed Questions</h3>
              <p className="text-blue-100/80 leading-relaxed">15 seconds per question to simulate real test conditions and build confidence</p>
            </div>
            <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl">
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
                Begin Practice Test
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
