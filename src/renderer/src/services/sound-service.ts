class SoundService {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false
  private volume: number = 1 // 0.0 to 1.0
  private timerEndLoopTimeout: ReturnType<typeof setTimeout> | null = null

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
   * Warm, gentle ascending arpeggio for Work timer end (relaxation/break start)
   * Notes: C5 (523.25) -> E5 (659.25) -> G5 (783.99) -> C6 (1046.50)
   */
  public playTimerEnd(): void {
    if (this.isMuted) return

    const ctx = this.getAudioContext()
    const now = ctx.currentTime

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

  public playWorkEnd(): void {
    this.playTimerEnd()
  }

  /**
   * Bright, uplifting melody for Rest end (time to focus / back to work)
   * Melodic contour: E5 (659.25) -> B5 (987.77) -> G#5 (830.61) -> E6 (1318.51)
   */
  public playRestEnd(): void {
    if (this.isMuted) return

    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    const bellNotes = [
      { freq: 659.25, time: now }, // E5
      { freq: 987.77, time: now + 0.14 }, // B5
      { freq: 830.61, time: now + 0.28 }, // G#5
      { freq: 1318.51, time: now + 0.42 } // E6
    ]

    bellNotes.forEach(({ freq, time }) => {
      // Fundamental tone (bright sine)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, time)

      // Crystalline overtone
      const overtone = ctx.createOscillator()
      const overtoneGain = ctx.createGain()
      overtone.type = 'triangle'
      overtone.frequency.setValueAtTime(freq * 2, time)

      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.linearRampToValueAtTime(this.volume * 0.3, time + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.1)

      overtoneGain.gain.setValueAtTime(0.0001, time)
      overtoneGain.gain.linearRampToValueAtTime(this.volume * 0.08, time + 0.015)
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.75)

      osc.connect(gain)
      gain.connect(ctx.destination)

      overtone.connect(overtoneGain)
      overtoneGain.connect(ctx.destination)

      osc.start(time)
      osc.stop(time + 1.1)

      overtone.start(time)
      overtone.stop(time + 0.75)
    })
  }

  public stopTimerEndSequence(): void {
    if (this.timerEndLoopTimeout) {
      clearTimeout(this.timerEndLoopTimeout)
      this.timerEndLoopTimeout = null
    }
  }

  public playWorkEndSequence(times = 5, intervalMs = 1400, onComplete?: () => void): void {
    this.playTimerEndSequence(times, intervalMs, onComplete, 'work')
  }

  public playRestEndSequence(times = 5, intervalMs = 1400, onComplete?: () => void): void {
    this.playTimerEndSequence(times, intervalMs, onComplete, 'rest')
  }

  /**
   * Loops the timer end chime sequence for `times` times (e.g. 5)
   * then calls onComplete
   */
  public playTimerEndSequence(
    times = 5,
    intervalMs = 1400,
    onComplete?: () => void,
    type: 'work' | 'rest' = 'work'
  ): void {
    if (this.isMuted) {
      if (onComplete) onComplete()
      return
    }

    this.stopTimerEndSequence()
    let currentIteration = 0

    const playNext = () => {
      if (type === 'rest') {
        this.playRestEnd()
      } else {
        this.playTimerEnd()
      }
      currentIteration++

      if (currentIteration < times) {
        this.timerEndLoopTimeout = setTimeout(playNext, intervalMs)
      } else {
        this.timerEndLoopTimeout = null
        if (onComplete) {
          // Give final chime a moment to ring before invoking callback
          setTimeout(onComplete, 1200)
        }
      }
    }

    playNext()
  }
}

export const soundService = new SoundService()
