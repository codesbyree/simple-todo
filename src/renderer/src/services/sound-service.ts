class SoundService {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false
  private volume: number = 0.5 // 0.0 to 1.0

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new AudioCtx()
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume()
    }

    return this.ctx
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted
  }

  public getMuted(): boolean {
    return this.isMuted
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol))
  }

  public getVolume(): number {
    return this.volume
  }

  /**
   * Crisp, satisfying pop & dual-tone chime for task completion
   */
  public playTaskComplete(): void {
    if (this.isMuted) return

    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    // 1. Subtle tactile 'pop' click (15ms transient)
    const clickOsc = ctx.createOscillator()
    const clickGain = ctx.createGain()
    clickOsc.type = 'triangle'
    clickOsc.frequency.setValueAtTime(1200, now)
    clickOsc.frequency.exponentialRampToValueAtTime(200, now + 0.02)
    clickGain.gain.setValueAtTime(this.volume * 0.15, now)
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02)
    clickOsc.connect(clickGain)
    clickGain.connect(ctx.destination)
    clickOsc.start(now)
    clickOsc.stop(now + 0.02)

    // 2. Harmonious ascending chime: E5 (659.25Hz) -> B5 (987.77Hz)
    const notes = [
      { freq: 659.25, time: now + 0.02, duration: 0.28 },
      { freq: 987.77, time: now + 0.1, duration: 0.35 }
    ]

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, time)

      // Envelope: quick attack, smooth exponential decay
      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, time + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(time)
      osc.stop(time + duration)
    })
  }

  /**
   * Warm, gentle triple chime for Pomodoro timer end
   */
  public playTimerEnd(): void {
    if (this.isMuted) return

    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    // Gentle arpeggio bell tones: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.5)
    const bellNotes = [
      { freq: 523.25, time: now },
      { freq: 659.25, time: now + 0.16 },
      { freq: 783.99, time: now + 0.32 },
      { freq: 1046.5, time: now + 0.48 }
    ]

    bellNotes.forEach(({ freq, time }) => {
      // Fundamental tone (warm sine)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, time)

      // Soft harmonic overtone
      const overtone = ctx.createOscillator()
      const overtoneGain = ctx.createGain()
      overtone.type = 'triangle'
      overtone.frequency.setValueAtTime(freq * 2, time)

      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, time + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2)

      overtoneGain.gain.setValueAtTime(0.0001, time)
      overtoneGain.gain.linearRampToValueAtTime(this.volume * 0.08, time + 0.02)
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.8)

      osc.connect(gain)
      gain.connect(ctx.destination)

      overtone.connect(overtoneGain)
      overtoneGain.connect(ctx.destination)

      osc.start(time)
      osc.stop(time + 1.2)

      overtone.start(time)
      overtone.stop(time + 0.8)
    })
  }
}

export const soundService = new SoundService()

