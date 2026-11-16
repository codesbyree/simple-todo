import { useEffect, useRef, useState } from 'react'
import { Volume2, XIcon } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { usePomodoroStore } from '@renderer/stores/use-pomodoro-store'
import {
  WORK_SOUND_OPTIONS,
  REST_SOUND_OPTIONS,
  soundService,
  SoundId
} from '@renderer/services/sound-service'
import { cn } from '@renderer/utils/cn'

type PomodoroSoundSelectionProps = {
  handleOnClose: () => void
}

function PomodoroSoundSelection({ handleOnClose }: PomodoroSoundSelectionProps) {
  const currentWorkSound = usePomodoroStore((s) => s.workSound)
  const currentRestSound = usePomodoroStore((s) => s.restSound)
  const setWorkSound = usePomodoroStore((s) => s.setWorkSound)
  const setRestSound = usePomodoroStore((s) => s.setRestSound)

  const [selectedWorkSound, setSelectedWorkSound] = useState<SoundId>(currentWorkSound)
  const [selectedRestSound, setSelectedRestSound] = useState<SoundId>(currentRestSound)

  const containerRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLElement>(null)
  const backdropRef = useRef<HTMLSpanElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  const { contextSafe } = useGSAP(
    () => {
      tl.current = gsap
        .timeline()
        .fromTo(
          backdropRef.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.25, ease: 'power2.out' }
        )
        .fromTo(
          sheetRef.current,
          { y: '100%' },
          {
            y: '0%',
            duration: 0.35,
            ease: 'power3.out'
          },
          '<'
        )
    },
    {
      scope: containerRef
    }
  )

  const animateAndClose = contextSafe(() => {
    if (tl.current) {
      tl.current.reverse().eventCallback('onReverseComplete', () => {
        handleOnClose()
      })
    } else {
      handleOnClose()
    }
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') animateAndClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [animateAndClose])

  const handleSave = () => {
    setWorkSound(selectedWorkSound)
    setRestSound(selectedRestSound)
    animateAndClose()
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-110 flex flex-col justify-end">
      <span
        ref={backdropRef}
        onClick={animateAndClose}
        className="absolute inset-0 bg-neutral-950/50 backdrop-blur-lg"
      />

      <section
        ref={sheetRef}
        className="relative z-20 w-full max-h-[88vh] overflow-y-auto bg-card rounded-t-3xl p-4 flex flex-col gap-6"
      >
        <header className="flex justify-between items-center text-card-foreground">
          <h2 className="text-lg font-semibold tracking-tight">Sound Effects</h2>

          <button
            type="button"
            onClick={animateAndClose}
            className="cursor-pointer border-none focus:outline-0"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 bg-[#31CD2E] rounded-3xl p-3">
              <h2 className="text-secondary-foreground tracking-tight text-base">
                Working end sound
              </h2>

              <div className="grid grid-cols-2 gap-1">
                {WORK_SOUND_OPTIONS.map((sound) => {
                  const isActive = selectedWorkSound === sound.id
                  return (
                    <button
                      key={sound.id}
                      type="button"
                      onClick={() => {
                        setSelectedWorkSound(sound.id)
                        soundService.playSound(sound.id)
                      }}
                      className={cn(
                        'py-2 px-2.5 rounded-xl text-sm font-medium italic tracking-tight cursor-pointer transition-all duration-300 ease-in-out select-none outline-none focus:outline-none flex items-center justify-between transform-gpu',
                        isActive
                          ? 'bg-secondary text-secondary-foreground rounded-[100px]'
                          : 'bg-primary text-primary-foreground hover:brightness-95'
                      )}
                    >
                      <span className="truncate pr-2">{sound.name}</span>
                      <Volume2
                        className={cn('w-3.5 h-3.5 shrink-0 opacity-50', isActive && 'opacity-100')}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 bg-[#31CD2E] rounded-3xl p-3">
              <h2 className="text-secondary-foreground tracking-tight text-base">Rest end sound</h2>

              <div className="grid grid-cols-2 gap-1">
                {REST_SOUND_OPTIONS.map((sound) => {
                  const isActive = selectedRestSound === sound.id
                  return (
                    <button
                      key={sound.id}
                      type="button"
                      onClick={() => {
                        setSelectedRestSound(sound.id)
                        soundService.playSound(sound.id)
                      }}
                      className={cn(
                        'py-2 px-2.5 rounded-xl text-sm font-medium italic tracking-tight cursor-pointer transition-all duration-300 ease-in-out select-none outline-none focus:outline-none flex items-center justify-between transform-gpu',
                        isActive
                          ? 'bg-secondary text-secondary-foreground rounded-[100px]'
                          : 'bg-primary text-primary-foreground hover:brightness-95'
                      )}
                    >
                      <span className="truncate pr-2">{sound.name}</span>
                      <Volume2
                        className={cn('w-3.5 h-3.5 shrink-0 opacity-50', isActive && 'opacity-100')}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-xl px-3 py-1 text-sm font-semibold tracking-tight text-primary-foreground bg-primary h-10 text-center w-full hover:brightness-105 transition-all"
          >
            Save sound settings
          </button>
        </div>
      </section>
    </div>
  )
}

export default PomodoroSoundSelection
