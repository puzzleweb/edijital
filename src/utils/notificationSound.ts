// Web Audio API & HTML5 Audio based notification sound synthesizer and Web Notifications manager
// 100% self-contained, 0ms latency, zero external asset dependencies

const SOUND_PREF_KEY = 'edijital_admin_sound_enabled';

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Generates a clean 16-bit PCM WAV audio chime (C5 -> E5 -> G5 -> C6) as a base64 Data URI.
 * Guarantees HTML5 Audio element playback in any browser.
 */
function createChimeWavDataUri(): string {
  try {
    const sampleRate = 22050;
    const duration = 0.95;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM = 1
    view.setUint16(22, 1, true); // Mono = 1
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    const notes = [
      { freq: 523.25, start: 0.00, dur: 0.35, amp: 0.35 }, // C5
      { freq: 659.25, start: 0.10, dur: 0.35, amp: 0.38 }, // E5
      { freq: 783.99, start: 0.20, dur: 0.45, amp: 0.40 }, // G5
      { freq: 1046.50, start: 0.32, dur: 0.60, amp: 0.45 }  // C6 (bright long chime)
    ];

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      for (const n of notes) {
        if (t >= n.start && t < n.start + n.dur) {
          const el = t - n.start;
          const attack = Math.min(1, el / 0.012);
          const decay = Math.exp(-el * 4.2);
          const env = attack * decay;
          const wave = Math.sin(2 * Math.PI * n.freq * el) + 0.25 * Math.sin(4 * Math.PI * n.freq * el);
          sample += wave * n.amp * env;
        }
      }
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }

    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + btoa(binary);
  } catch {
    return '';
  }
}

function createMessageWavDataUri(): string {
  try {
    const sampleRate = 22050;
    const duration = 0.65;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM = 1
    view.setUint16(22, 1, true); // Mono = 1
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    const notes = [
      { freq: 659.25, start: 0.00, dur: 0.20, amp: 0.40 }, // E5
      { freq: 880.00, start: 0.09, dur: 0.22, amp: 0.45 }, // A5
      { freq: 1318.51, start: 0.20, dur: 0.42, amp: 0.50 } // E6
    ];

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      for (const n of notes) {
        if (t >= n.start && t < n.start + n.dur) {
          const el = t - n.start;
          const attack = Math.min(1, el / 0.008);
          const decay = Math.exp(-el * 5.5);
          const env = attack * decay;
          const wave = Math.sin(2 * Math.PI * n.freq * el) + 0.2 * Math.sin(3 * Math.PI * n.freq * el);
          sample += wave * n.amp * env;
        }
      }
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    }

    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + btoa(binary);
  } catch {
    return '';
  }
}

class SoundManager {
  private audioCtx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private orderWavDataUri: string = '';
  private messageWavDataUri: string = '';
  private orderAudioElement: HTMLAudioElement | null = null;
  private messageAudioElement: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.orderWavDataUri = createChimeWavDataUri();
      this.messageWavDataUri = createMessageWavDataUri();
      try {
        if (this.orderWavDataUri) {
          this.orderAudioElement = new Audio(this.orderWavDataUri);
          this.orderAudioElement.preload = 'auto';
        }
        if (this.messageWavDataUri) {
          this.messageAudioElement = new Audio(this.messageWavDataUri);
          this.messageAudioElement.preload = 'auto';
        }
      } catch {
        // ignore
      }

      // Auto-unlock on any user interaction across the entire window
      const handleUserGesture = () => {
        this.unlock().catch(() => {});
      };

      window.addEventListener('click', handleUserGesture, { passive: true });
      window.addEventListener('touchstart', handleUserGesture, { passive: true });
      window.addEventListener('keydown', handleUserGesture, { passive: true });
      window.addEventListener('pointerdown', handleUserGesture, { passive: true });
    }
  }

  private getAudioContext(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    return this.audioCtx;
  }

  /**
   * Fully unlock both Web Audio Context and HTML5 Audio pipeline
   */
  public async unlock(): Promise<boolean> {
    try {
      const ctx = this.getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        // Play an imperceptible micro-buffer to prime the audio engine
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      }

      if (this.orderAudioElement) {
        this.orderAudioElement.load();
      }
      if (this.messageAudioElement) {
        this.messageAudioElement.load();
      }

      this.isUnlocked = true;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('edijital_audio_unlocked', { detail: { unlocked: true } }));
      }
      return true;
    } catch {
      return false;
    }
  }

  public getIsUnlocked(): boolean {
    if (!this.audioCtx) return false;
    return this.audioCtx.state === 'running' || this.isUnlocked;
  }

  public isSoundEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    const pref = localStorage.getItem(SOUND_PREF_KEY);
    return pref === null ? true : pref === 'true';
  }

  public setSoundEnabled(enabled: boolean): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOUND_PREF_KEY, String(enabled));
      window.dispatchEvent(new CustomEvent('edijital_sound_pref_changed', { detail: { enabled } }));
    }
  }

  /**
   * Plays the order chime sound IMMEDIATELY.
   * Dual-channel (preloaded HTML5 Audio + Web Audio API synthesis) for 100% reliability.
   */
  public playOrderChime(): void {
    if (!this.isSoundEnabled()) return;

    // 1. Preloaded HTML5 Audio element (instant playback)
    try {
      if (this.orderAudioElement) {
        this.orderAudioElement.currentTime = 0;
        this.orderAudioElement.volume = 1.0;
        this.orderAudioElement.play().catch(() => {
          if (this.orderWavDataUri) {
            const fallback = new Audio(this.orderWavDataUri);
            fallback.volume = 1.0;
            fallback.play().catch(() => {});
          }
        });
      } else if (this.orderWavDataUri) {
        const fallback = new Audio(this.orderWavDataUri);
        fallback.volume = 1.0;
        fallback.play().catch(() => {});
      }
    } catch {
      // fallback to Web Audio
    }

    // 2. Synthesize via Web Audio API (Crystal clear real-time harmonics)
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.35, gain: 0.38 }, // C5
        { freq: 659.25, time: 0.10, dur: 0.35, gain: 0.40 }, // E5
        { freq: 783.99, time: 0.20, dur: 0.45, gain: 0.44 }, // G5
        { freq: 1046.50, time: 0.32, dur: 0.85, gain: 0.48 }  // C6
      ];

      notes.forEach(({ freq, time, dur, gain: noteGain }) => {
        const startTime = now + time;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        const harmOsc = ctx.createOscillator();
        harmOsc.type = 'triangle';
        harmOsc.frequency.setValueAtTime(freq * 2, startTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.exponentialRampToValueAtTime(noteGain, startTime + 0.012);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        const harmGain = ctx.createGain();
        harmGain.gain.setValueAtTime(0.0001, startTime);
        harmGain.gain.exponentialRampToValueAtTime(noteGain * 0.2, startTime + 0.01);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur * 0.7);

        osc.connect(gainNode);
        harmOsc.connect(harmGain);
        gainNode.connect(ctx.destination);
        harmGain.connect(ctx.destination);

        osc.start(startTime);
        harmOsc.start(startTime);
        osc.stop(startTime + dur + 0.05);
        harmOsc.stop(startTime + dur + 0.05);
      });
    } catch (err) {
      console.warn('playOrderChime error:', err);
    }
  }

  /**
   * Plays a crisp, distinct chime for incoming contact messages.
   * Dual-channel (preloaded dedicated WAV + Web Audio API synthesis) for 100% reliability.
   */
  public playMessageChime(): void {
    if (!this.isSoundEnabled()) return;

    // 1. Preloaded dedicated HTML5 Audio element (instant playback)
    try {
      if (this.messageAudioElement) {
        this.messageAudioElement.currentTime = 0;
        this.messageAudioElement.volume = 1.0;
        this.messageAudioElement.play().catch(() => {
          if (this.messageWavDataUri) {
            const fallback = new Audio(this.messageWavDataUri);
            fallback.volume = 1.0;
            fallback.play().catch(() => {});
          }
        });
      } else if (this.messageWavDataUri) {
        const fallback = new Audio(this.messageWavDataUri);
        fallback.volume = 1.0;
        fallback.play().catch(() => {});
      }
    } catch {
      // fallback to Web Audio
    }

    // 2. Synthesize via Web Audio API with unique message chime melody (E5 -> A5 -> E6)
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const msgNotes = [
        { freq: 659.25, time: 0.00, dur: 0.25, gain: 0.38 }, // E5
        { freq: 880.00, time: 0.09, dur: 0.30, gain: 0.42 }, // A5
        { freq: 1318.51, time: 0.20, dur: 0.60, gain: 0.46 } // E6
      ];

      msgNotes.forEach(({ freq, time, dur, gain: noteGain }) => {
        const startTime = now + time;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        const harmOsc = ctx.createOscillator();
        harmOsc.type = 'triangle';
        harmOsc.frequency.setValueAtTime(freq * 1.5, startTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.exponentialRampToValueAtTime(noteGain, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        const harmGain = ctx.createGain();
        harmGain.gain.setValueAtTime(0.0001, startTime);
        harmGain.gain.exponentialRampToValueAtTime(noteGain * 0.18, startTime + 0.01);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur * 0.6);

        osc.connect(gainNode);
        harmOsc.connect(harmGain);
        gainNode.connect(ctx.destination);
        harmGain.connect(ctx.destination);

        osc.start(startTime);
        harmOsc.start(startTime);
        osc.stop(startTime + dur + 0.05);
        harmOsc.stop(startTime + dur + 0.05);
      });
    } catch (err) {
      console.warn('playMessageChime error:', err);
    }
  }

  /**
   * Browser Desktop Web Notification helper
   */
  public isDesktopNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getDesktopNotificationPermission(): NotificationPermission | 'unsupported' {
    if (!this.isDesktopNotificationSupported()) return 'unsupported';
    return Notification.permission;
  }

  public async requestDesktopNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isDesktopNotificationSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return Notification.permission;
    }
  }

  public sendDesktopNotification(title: string, options?: NotificationOptions): Notification | null {
    if (!this.isDesktopNotificationSupported()) return null;
    if (Notification.permission !== 'granted') return null;

    try {
      const notif = new Notification(title, {
        icon: '/real_images/logo.png',
        badge: '/real_images/logo.png',
        ...options
      });
      return notif;
    } catch (err) {
      console.warn('Desktop notification error:', err);
      return null;
    }
  }
}

export const NotificationSoundService = new SoundManager();
