// Web Audio API Synthesizer for subtle transfer chimes

class SoundEffects {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    const saved = localStorage.getItem('beamdrop_sound_enabled');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    localStorage.setItem('beamdrop_sound_enabled', val ? 'true' : 'false');
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    const next = !this.enabled;
    this.setEnabled(next);
    return next;
  }

  // Play pleasant paired success chime (2 rising tones)
  public playConnectChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12); // A5
      gain2.gain.setValueAtTime(0.09, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.38);
    } catch {
      // Audio might be blocked by autoplay policies
    }
  }

  // Play subtle sent chime (WhatsApp style whoosh / pop)
  public playSentChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(1050, now + 0.09);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Audio error ignored
    }
  }

  // Play incoming file received chime (warm pleasant marimba chime)
  public playReceivedChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // 3 subtle harmonic notes
      const notes = [659.25, 830.61, 987.77]; // E5, G#5, B5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const time = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.26);
      });
    } catch {
      // Audio error ignored
    }
  }
}

export const sounds = new SoundEffects();
