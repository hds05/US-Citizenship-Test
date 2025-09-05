export interface SpeechPlayerOptions {
  text: string;
  voice?: string;
  speed?: number;
  volume?: number;
}

export class SpeechPlayer {
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onEndCallback?: () => void;
  private onErrorCallback?: (error: Error) => void;

  constructor() {
    // Initialize speech synthesis if available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Browser supports speech synthesis
    }
  }

  /**
   * Speak the given text using the Web Speech API (mock ElevenLabs)
   */
  async speak(options: SpeechPlayerOptions): Promise<void> {
    if (this.isMuted) {
      console.log('Speech is muted, skipping audio playback');
      return;
    }

    // Stop any ongoing speech before starting new speech
    if (this.isPlaying) {
      this.stop();
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.log('Speech synthesis not supported, using mock audio');
      // Mock implementation for environments without speech synthesis
      this.simulateSpeech(options.text);
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        // Cancel any ongoing speech
        this.stop();

        const utterance = new SpeechSynthesisUtterance(options.text);
        
        // Configure voice options
        utterance.rate = options.speed || 1.0;
        utterance.volume = options.volume || 1.0;
        utterance.pitch = 1.0;

        // Try to set a more natural voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Natural'))
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // Set up event handlers
        utterance.onend = () => {
          this.isPlaying = false;
          this.currentUtterance = null;
          this.onEndCallback?.();
          resolve();
        };

        utterance.onerror = (event) => {
          this.isPlaying = false;
          this.currentUtterance = null;
          
          // Don't treat interruption as an error - it's expected behavior
          if (event.error === 'interrupted') {
            console.log('Speech synthesis interrupted (expected behavior)');
            resolve(); // Resolve instead of reject for interruptions
            return;
          }
          
          const error = new Error(`Speech synthesis error: ${event.error}`);
          this.onErrorCallback?.(error);
          reject(error);
        };

        utterance.onstart = () => {
          this.isPlaying = true;
        };

        this.currentUtterance = utterance;
        speechSynthesis.speak(utterance);
      } catch (error) {
        reject(new Error(`Failed to initialize speech: ${error}`));
      }
    });
  }

  /**
   * Mock speech implementation for testing
   */
  private simulateSpeech(text: string): void {
    console.log(`🔊 Speaking: "${text}"`);
    
    // Simulate speech duration based on text length
    const duration = Math.max(2000, text.length * 50);
    
    setTimeout(() => {
      this.isPlaying = false;
      this.onEndCallback?.();
    }, duration);
    
    this.isPlaying = true;
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    this.isPlaying = false;
    this.currentUtterance = null;
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.resume();
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isPlaying) {
      this.pause();
    } else if (!this.isMuted && this.isPlaying) {
      this.resume();
    }
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.isPlaying) {
      this.pause();
    } else if (!muted && this.isPlaying) {
      this.resume();
    }
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Check if muted
   */
  getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Set callback for when speech ends
   */
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  /**
   * Set callback for when speech errors
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.onEndCallback = undefined;
    this.onErrorCallback = undefined;
  }
}

// Create a singleton instance
export const speechPlayer = new SpeechPlayer();
