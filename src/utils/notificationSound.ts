// Web Audio API based notification sound synthesizer and Web Notifications manager
// 100% self-contained, 0ms latency, zero external asset dependencies

const SOUND_PREF_KEY = 'edijital_admin_sound_enabled';

class SoundManager {
  private audioCtx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Auto-unlock AudioContext on first user interaction (browser autoplay policy requirement)
      const unlockAudio = () => {
        this.getAudioContext();
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().then(() => {
            this.isUnlocked = true;
          }).catch(() => {});
        } else {
          this.isUnlocked = true;
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };

      window.addEventListener('click', unlockAudio, { once: true, passive: true });
      window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
      window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
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
   * Plays a crisp, cheerful, modern order arrival chime (C5 -> E5 -> G5 -> C6).
   * Rich harmonics and smooth decay ensure high aesthetic appeal and immediate recognition.
   */
  public playOrderChime(): void {
    if (!this.isSoundEnabled()) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      // Arpeggiated upbeat chime notes (C5, E5, G5, C6)
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.35, gain: 0.30 }, // C5
        { freq: 659.25, time: 0.10, dur: 0.35, gain: 0.32 }, // E5
        { freq: 783.99, time: 0.20, dur: 0.45, gain: 0.35 }, // G5
        { freq: 1046.50, time: 0.32, dur: 0.85, gain: 0.40 } // C6 (long ring)
      ];

      notes.forEach(({ freq, time, dur, gain: noteGain }) => {
        const startTime = now + time;

        // Primary fundamental oscillator (sine wave for clarity)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        // Harmonic overtone oscillator (triangle wave for warmth)
        const harmOsc = ctx.createOscillator();
        harmOsc.type = 'triangle';
        harmOsc.frequency.setValueAtTime(freq * 2, startTime);

        // Gain envelope
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.exponentialRampToValueAtTime(noteGain, startTime + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        // Secondary subtle harmonic gain
        const harmGain = ctx.createGain();
        harmGain.gain.setValueAtTime(0.0001, startTime);
        harmGain.gain.exponentialRampToValueAtTime(noteGain * 0.18, startTime + 0.01);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur * 0.7);

        // Connect nodes
        osc.connect(gainNode);
        harmOsc.connect(harmGain);
        gainNode.connect(ctx.destination);
        harmGain.connect(ctx.destination);

        // Start & stop
        osc.start(startTime);
        harmOsc.start(startTime);
        osc.stop(startTime + dur + 0.05);
        harmOsc.stop(startTime + dur + 0.05);
      });
    } catch (err) {
      console.warn('AudioContext playback error:', err);
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
