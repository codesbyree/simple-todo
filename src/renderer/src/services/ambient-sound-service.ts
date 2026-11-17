class AmbientSoundService {
  private audio: HTMLAudioElement | null = null
  private volume: number = 0.8
  private isDucked: boolean = false
  private duckInterval: number | null = null
  private onEndedCallback: (() => void) | null = null
  private currentSrc: string | null = null

  constructor() {
    // Lazy initialized on first user interaction
  }

  private getAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio()
      this.audio.volume = this.volume
      this.audio.preload = 'auto'

      this.audio.addEventListener('ended', () => {
        if (this.onEndedCallback) {
          this.onEndedCallback()
        }
      })

      this.audio.addEventListener('error', (e) => {
        console.error('Ambient sound playback error:', e)
      })
    }
    return this.audio
  }

  public setOnEnded(callback: () => void): void {
    this.onEndedCallback = callback
  }

  public play(src: string): void {
    const audio = this.getAudio()

    if (this.currentSrc !== src) {
      audio.src = src
      this.currentSrc = src
      audio.currentTime = 0
    }

    audio.play().catch((err) => {
      console.warn('Ambient playback could not start automatically:', err)
    })
  }

  public pause(): void {
    if (this.audio) {
      this.audio.pause()
    }
  }

  public resume(): void {
    if (this.audio && this.currentSrc) {
      this.audio.play().catch((err) => {
        console.warn('Ambient playback resume error:', err)
      })
    }
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
  }

  /**
   * Smoothly ducks (lowers) ambient music volume to allow timer chimes to be heard clearly
   */
  public duck(targetRatio = 0.15, durationMs = 250): void {
    if (!this.audio) return
    this.isDucked = true

    if (this.duckInterval) {
      clearInterval(this.duckInterval)
      this.duckInterval = null
    }

    const startVol = this.audio.volume
    const targetVol = this.volume * targetRatio
    const steps = 15
    const stepTime = durationMs / steps
    let currentStep = 0

    this.duckInterval = window.setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      if (this.audio) {
        this.audio.volume = Math.max(0, startVol + (targetVol - startVol) * progress)
      }

      if (currentStep >= steps) {
        clearInterval(this.duckInterval!)
        this.duckInterval = null
      }
    }, stepTime)
  }

  /**
   * Smoothly restores ambient music volume back to its normal level
   */
  public unduck(durationMs = 450): void {
    if (!this.audio) return
    this.isDucked = false

    if (this.duckInterval) {
      clearInterval(this.duckInterval)
      this.duckInterval = null
    }

    const startVol = this.audio.volume
    const targetVol = this.volume
    const steps = 15
    const stepTime = durationMs / steps
    let currentStep = 0

    this.duckInterval = window.setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      if (this.audio) {
        this.audio.volume = Math.min(1, startVol + (targetVol - startVol) * progress)
      }

      if (currentStep >= steps) {
        clearInterval(this.duckInterval!)
        this.duckInterval = null
      }
    }, stepTime)
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol))
    if (this.audio) {
      this.audio.volume = this.isDucked ? this.volume * 0.15 : this.volume
    }
  }

  public getVolume(): number {
    return this.volume
  }

  public getCurrentTime(): number {
    return this.audio ? this.audio.currentTime : 0
  }

  public isPlaying(): boolean {
    return this.audio ? !this.audio.paused && !this.audio.ended : false
  }
}

export const ambientSoundEngine = new AmbientSoundService()
