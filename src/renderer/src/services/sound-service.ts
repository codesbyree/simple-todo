export type SoundId =
  | 'warm-chime'
  | 'singing-bowl'
  | 'marimba'
  | 'harp'
  | 'bright-bell'
  | 'fanfare'
  | 'crystal-synth'
  | 'vibraphone'

export interface SoundOption {
  id: SoundId
  name: string
  description: string
}

export const WORK_SOUND_OPTIONS: SoundOption[] = [
  { id: 'warm-chime', name: 'Warm Chime', description: 'C-E-G-C gentle arpeggio' },
  { id: 'singing-bowl', name: 'Tibetan Bowl', description: 'Deep calming gong' },
  { id: 'marimba', name: 'Soft Marimba', description: 'Warm wooden plucks' },
  { id: 'harp', name: 'Gentle Harp', description: 'Pentatonic flourish' }
]

export const REST_SOUND_OPTIONS: SoundOption[] = [
  { id: 'bright-bell', name: 'Bright Bell', description: 'Uplifting chime' },
  { id: 'fanfare', name: 'Sunrise Fanfare', description: 'Triumphant rise' },
  { id: 'crystal-synth', name: 'Crystal Pluck', description: 'Modern glassy synth' },
  { id: 'vibraphone', name: 'Vibraphone', description: 'Jazz tremolo shimmer' }
]

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
   * 1. Warm Chime: Gentle ascending arpeggio (C5 -> E5 -> G5 -> C6)
   */
  public playWarmChime(): void {
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
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, time)

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

  /**
   * 2. Tibetan Singing Bowl: Deep calming resonant gong
   */
  public playSingingBowl(): void {
    if (this.isMuted) return
    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    // Fundamental C4 (261.63Hz) + meditative resonant inharmonics
    const harmonics = [
      { freq: 261.63, gainRatio: 0.35, decay: 2.2 },
      { freq: 523.25, gainRatio: 0.15, decay: 1.8 },
      { freq: 788.0, gainRatio: 0.09, decay: 1.4 },
      { freq: 1190.0, gainRatio: 0.04, decay: 0.9 }
    ]

    harmonics.forEach(({ freq, gainRatio, decay }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now)

      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(this.volume * gainRatio, now + 0.06)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + decay)
    })
  }

  /**
   * 3. Soft Marimba: Warm wooden acoustic pluck
   */
  public playMarimba(): void {
    if (this.isMuted) return
    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    const notes = [
      { freq: 349.23, time: now }, // F4
      { freq: 440.0, time: now + 0.09 }, // A4
      { freq: 523.25, time: now + 0.18 }, // C5
      { freq: 698.46, time: now + 0.27 } // F5
    ]

    notes.forEach(({ freq, time }) => {
      // Wood body (sine + triangle)
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, time)

      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.linearRampToValueAtTime(this.volume * 0.32, time + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.45)

      // Initial tactile tap transient
      const tap = ctx.createOscillator()
      const tapGain = ctx.createGain()
      tap.type = 'sine'
      tap.frequency.setValueAtTime(freq * 3, time)
      tapGain.gain.setValueAtTime(this.volume * 0.12, time)
      tapGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)
      tap.connect(tapGain)
      tapGain.connect(ctx.destination)

      osc.start(time)
      osc.stop(time + 0.45)
      tap.start(time)
      tap.stop(time + 0.04)
    })
  }

  /**
   * 4. Gentle Harp: Celestial pentatonic flourish
   */
  public playHarp(): void {
    if (this.isMuted) return
    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    const notes = [
      { freq: 392.0, time: now }, // G4
      { freq: 493.88, time: now + 0.07 }, // B4
      { freq: 587.33, time: now + 0.14 }, // D5
      { freq: 783.99, time: now + 0.21 }, // G5
      { freq: 987.77, time: now + 0.28 } // B5
    ]

    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, time)

      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.linearRampToValueAtTime(this.volume * 0.24, time + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.95)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(time)
      osc.stop(time + 0.95)
    })
  }

  /**
   * 5. Bright Bell: Uplifting rest end melody (E5 -> B5 -> G#5 -> E6)
   */
  public playBrightBell(): void {
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
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, time)

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

  /**
   * 6. Sunrise Fanfare: Triumphant, motivating rise (C5 -> G5 -> C6 -> E6)
   */
  public playFanfare(): void {
    if (this.isMuted) return
    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    const notes = [
      { freq: 523.25, time: now }, // C5
      { freq: 783.99, time: now + 0.12 }, // G5
      { freq: 1046.5, time: now + 0.24 }, // C6
      { freq: 1318.51, time: now + 0.38 } // E6
    ]

    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, time)

      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.linearRampToValueAtTime(this.volume * 0.32, time + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.1)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(time)
      osc.stop(time + 1.1)
    })
  }

  /**
   * 7. Crystal Pluck: Crisp, glassy modern synth chime
   */
  public playCrystalSynth(): void {
    if (this.isMuted) return
    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    const notes = [
      { freq: 880.0, time: now }, // A5
      { freq: 1108.73, time: now + 0.08 }, // C#6
      { freq: 1318.51, time: now + 0.16 }, // E6
      { freq: 1760.0, time: now + 0.24 } // A6
    ]

    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, time)

      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.linearRampToValueAtTime(this.volume * 0.26, time + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.55)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(time)
      osc.stop(time + 0.55)
    })
  }

  /**
   * 8. Vibraphone: Jazz acoustic shimmer with gentle tremolo
   */
  public playVibraphone(): void {
    if (this.isMuted) return
    const ctx = this.getAudioContext()
    const now = ctx.currentTime

    const notes = [
      { freq: 587.33, time: now }, // D5
      { freq: 739.99, time: now + 0.1 }, // F#5
      { freq: 880.0, time: now + 0.2 }, // A5
      { freq: 1174.66, time: now + 0.3 } // D6
    ]

    notes.forEach(({ freq, time }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, time)

      gain.gain.setValueAtTime(0.0001, time)
      gain.gain.linearRampToValueAtTime(this.volume * 0.28, time + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(time)
      osc.stop(time + 1.2)
    })
  }

  /**
   * Play any sound by ID
   */
  public playSound(id: SoundId): void {
    switch (id) {
      case 'warm-chime':
        this.playWarmChime()
        break
      case 'singing-bowl':
        this.playSingingBowl()
        break
      case 'marimba':
        this.playMarimba()
        break
      case 'harp':
        this.playHarp()
        break
      case 'bright-bell':
        this.playBrightBell()
        break
      case 'fanfare':
        this.playFanfare()
        break
      case 'crystal-synth':
        this.playCrystalSynth()
        break
      case 'vibraphone':
        this.playVibraphone()
        break
      default:
        this.playWarmChime()
    }
  }

  // Backwards compatibility helpers
  public playTimerEnd(): void {
    this.playWarmChime()
  }

  public playWorkEnd(): void {
    this.playWarmChime()
  }

  public playRestEnd(): void {
    this.playBrightBell()
  }

  public stopTimerEndSequence(): void {
    if (this.timerEndLoopTimeout) {
      clearTimeout(this.timerEndLoopTimeout)
      this.timerEndLoopTimeout = null
    }
  }

  public playWorkEndSequence(
    times = 3,
    intervalMs = 800,
    onComplete?: () => void,
    soundId: SoundId = 'warm-chime'
  ): void {
    this.playTimerEndSequence(times, intervalMs, onComplete, soundId)
  }

  public playRestEndSequence(
    times = 3,
    intervalMs = 800,
    onComplete?: () => void,
    soundId: SoundId = 'bright-bell'
  ): void {
    this.playTimerEndSequence(times, intervalMs, onComplete, soundId)
  }

  /**
   * Loops the timer end chime sequence for `times` times
   * then calls onComplete
   */
  public playTimerEndSequence(
    times = 3,
    intervalMs = 800,
    onComplete?: () => void,
    soundId: SoundId = 'warm-chime'
  ): void {
    if (this.isMuted) {
      if (onComplete) onComplete()
      return
    }

    this.stopTimerEndSequence()
    let currentIteration = 0

    const playNext = () => {
      this.playSound(soundId)
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
