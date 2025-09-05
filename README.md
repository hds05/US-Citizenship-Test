# U.S. Citizenship Test Practice

A minimalist, voice-guided practice application for the U.S. Citizenship Test built with Next.js and Tailwind CSS.

## Features

- 🎤 **Voice-Guided Questions**: Questions are spoken aloud using the Web Speech API
- ⏱️ **Timed Questions**: 15 seconds per question to simulate real test conditions
- 📚 **Official Questions**: 50 authentic questions from the official U.S. Citizenship Test bank
- 🔇 **Mute Controls**: Toggle audio on/off during the test
- 📊 **Score Tracking**: Real-time scoring and results display
- 🎨 **Modern UI**: Clean, minimalist design with gradient backgrounds

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

1. Click "Start Test" to begin
2. Listen to each question (or use mute/unmute controls)
3. Type your answer within the 15-second time limit
4. View your score and results at the end
5. Take the test again to practice with different questions

## Technical Details

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **Speech**: Web Speech API (with fallback for unsupported browsers)
- **Questions**: 50 official U.S. Citizenship Test questions
- **Test Format**: 10 randomly selected questions per session

## Browser Compatibility

- Modern browsers with Web Speech API support
- Graceful fallback for browsers without speech synthesis
- Responsive design for mobile and desktop

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── HomePage.tsx    # Landing page component
│   └── ConversationBot.tsx # Test flow component
├── data/               # Static data
│   └── QuestionList.json # Citizenship test questions
└── utils/              # Utility functions
    └── SpeechPlayer.ts  # Speech synthesis wrapper
```

## License

This project is for educational purposes. The citizenship test questions are based on official U.S. government materials.
