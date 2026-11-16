import { useEffect, useRef, useState } from 'react'
import { XIcon } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { REST_PRESETS, WORK_PRESETS, usePomodoroStore } from '@renderer/stores/use-pomodoro-store'
import { cn } from '@renderer/utils/cn'

type PomodoroDurationSelectionProps = {
  handleOnClose: () => void
}

function PomodoroDurationSelection({ handleOnClose }: PomodoroDurationSelectionProps) {
  const currentWorkDuration = usePomodoroStore((s) => s.workDuration)
  const currentRestDuration = usePomodoroStore((s) => s.restDuration)
  const setWorkDuration = usePomodoroStore((s) => s.setWorkDuration)
  const setRestDuration = usePomodoroStore((s) => s.setRestDuration)
  const stop = usePomodoroStore((s) => s.stop)

  const [selectedWork, setSelectedWork] = useState(currentWorkDuration)
  const [selectedRest, setSelectedRest] = useState(currentRestDuration)

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

  const handleSaveAndReset = () => {
    setWorkDuration(selectedWork)
    setRestDuration(selectedRest)
    stop()
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
          <h2 className="text-lg font-semibold tracking-tight">Duration Settings</h2>

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
                Working duration
              </h2>

              <div className="flex gap-1">
                {WORK_PRESETS.map((mins) => {
                  const isActive = selectedWork === mins
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSelectedWork(mins)}
                      className={cn(
                        'py-2 px-1 rounded-xl text-sm font-medium italic tracking-tight cursor-pointer transition-all duration-300 ease-in-out select-none outline-none focus:outline-none grow transform-gpu',
                        isActive
                          ? 'bg-secondary text-secondary-foreground grow-2 rounded-[100px]'
                          : 'bg-primary text-primary-foreground hover:brightness-95'
                      )}
                    >
                      {mins} Mins
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 bg-[#31CD2E] rounded-3xl p-3">
              <h2 className="text-secondary-foreground tracking-tight text-base">Rest duration</h2>

              <div className="flex gap-1">
                {REST_PRESETS.map((mins) => {
                  const isActive = selectedRest === mins
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSelectedRest(mins)}
                      className={cn(
                        'py-2 px-1 rounded-xl text-sm font-medium italic tracking-tight cursor-pointer transition-all duration-300 ease-in-out select-none outline-none focus:outline-none grow transform-gpu',
                        isActive
                          ? 'bg-secondary text-secondary-foreground grow-2 rounded-[100px]'
                          : 'bg-primary text-primary-foreground hover:brightness-95'
                      )}
                    >
                      {mins} Mins
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveAndReset}
            className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-xl px-3 py-1 text-sm font-semibold tracking-tight text-primary-foreground bg-primary h-10 text-center w-full hover:brightness-105 transition-all"
          >
            Save and reset pomodoro
          </button>
        </div>
      </section>
    </div>
  )
}

export default PomodoroDurationSelection
