// src/services/textToSpeech.js

class TextToSpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.loadVoices();
  }

  loadVoices() {
    this.voices = this.synth.getVoices();
    
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  getAvailableVoices() {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  async generateSpeech(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice options
      utterance.rate = options.speed || 1.0;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;
      
      // Find and set voice
      if (options.voiceName) {
        const voice = this.voices.find(v => 
          v.name.includes(options.voiceName) || 
          v.voiceURI.includes(options.voiceName)
        );
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.onend = () => {
        resolve('Speech generation completed');
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synth.speak(utterance);
    });
  }

  async generateAudioBlob(text, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Create audio context for recording
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const mediaStreamDestination = audioContext.createMediaStreamDestination();
        
        // Create media recorder
        const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        const chunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          resolve(audioBlob);
        };

        // Start recording
        mediaRecorder.start();

        // Generate speech
        this.generateSpeech(text, options)
          .then(() => {
            // Stop recording after a short delay
            setTimeout(() => {
              mediaRecorder.stop();
            }, 1000);
          })
          .catch(reject);
          
      } catch (error) {
        reject(error);
      }
    });
  }

  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
  }

  pause() {
    if (this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }
}

// Alternative implementation using Web Audio API for better control
class AdvancedTextToSpeechService {
  constructor() {
    this.audioContext = null;
    this.audioBuffer = null;
  }

  async initializeAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  async generateAudioFromText(text, voiceSettings = {}) {
    await this.initializeAudioContext();
    
    // This would integrate with services like:
    // - Azure Cognitive Services Speech SDK
    // - Google Cloud Text-to-Speech
    // - Amazon Polly
    // - ElevenLabs API
    
    const {
      voice = 'en-US-AriaNeural',
      speed = 1.0,
      pitch = 1.0,
      volume = 1.0
    } = voiceSettings;

    // For production, you would make an API call to a TTS service
    // Example with Azure Speech Services:
    /*
    const response = await fetch('https://your-region.tts.speech.microsoft.com/cognitiveservices/v1', {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': 'YOUR_API_KEY',
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
      },
      body: `
        <speak version='1.0' xml:lang='en-US'>
          <voice xml:lang='en-US' xml:gender='Female' name='${voice}'>
            <prosody rate='${speed}' pitch='${pitch}'>
              ${text}
            </prosody>
          </voice>
        </speak>
      `
    });
    
    if (response.ok) {
      const audioArrayBuffer = await response.arrayBuffer();
      return new Blob([audioArrayBuffer], { type: 'audio/mpeg' });
    }
    */

    // For demo purposes, return a promise that resolves to a dummy audio blob
    return new Promise((resolve) => {
      setTimeout(() => {
        const dummyAudioBlob = new Blob(['dummy audio data'], { type: 'audio/wav' });
        resolve(dummyAudioBlob);
      }, 2000); // Simulate API delay
    });
  }

  async playAudioBlob(audioBlob) {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play();
    });
  }

  async combineAudioWithVideo(audioBlob, videoElement) {
    // This would require more advanced audio processing
    // For now, we'll just sync playback
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    // Sync audio with video
    videoElement.addEventListener('play', () => audio.play());
    videoElement.addEventListener('pause', () => audio.pause());
    videoElement.addEventListener('seeked', () => {
      audio.currentTime = videoElement.currentTime;
    });
    
    return audio;
  }
}

// Export both services
export const basicTTSService = new TextToSpeechService();
export const advancedTTSService = new AdvancedTextToSpeechService();

// Utility functions for audio processing
export const audioUtils = {
  // Convert audio blob to different formats
  async convertAudioFormat(audioBlob, targetFormat = 'wav') {
    // This would require additional libraries like ffmpeg.js
    // For now, return the original blob
    return audioBlob;
  },

  // Adjust audio speed/pitch
  async adjustAudioSettings(audioBlob, settings = {}) {
    const { speed = 1.0, pitch = 1.0 } = settings;
    
    // This would require Web Audio API processing
    // For demo, return original blob
    return audioBlob;
  },

  // Generate silence for padding
  generateSilence(duration = 1.0, sampleRate = 44100) {
    const length = sampleRate * duration;
    const buffer = new AudioBuffer({
      numberOfChannels: 1,
      length: length,
      sampleRate: sampleRate
    });
    
    // Fill with zeros (silence)
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = 0;
    }
    
    return buffer;
  }
};