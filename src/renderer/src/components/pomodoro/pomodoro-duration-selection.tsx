import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { REST_PRESETS, WORK_PRESETS, usePomodoroStore } from '@renderer/stores/use-pomodoro-store'
import { cn } from '@renderer/utils/cn'

function getButtonRadius(index: number, total: number, isActive: boolean): string {
  if (isActive) return 'rounded-4xl'
  if (index === 0) return 'rounded-4xl rounded-tr-sm rounded-br-sm'
  if (index === total - 1) return 'rounded-4xl rounded-tl-sm rounded-bl-sm'
  return 'rounded-sm'
}

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
        className="relative z-20 w-full bg-form rounded-t-3xl p-5 pb-6 flex flex-col gap-5 shadow-2xl"
      >
        <div className="flex flex-col gap-2">
          <h3 className="text-input-label tracking-tight text-base trim-cap">Working duration</h3>

          <div className="flex gap-1">
            {WORK_PRESETS.map((mins, index) => {
              const isActive = selectedWork === mins
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSelectedWork(mins)}
                  className={cn(
                    'py-2 px-1 text-base font-medium italic tracking-tight cursor-pointer transition-all duration-300 ease-in-out select-none outline-none focus:outline-none grow transform-gpu',
                    getButtonRadius(index, WORK_PRESETS.length, isActive),
                    isActive
                      ? 'bg-pomodoro-button-selected text-pomodoro-button-selected-foreground grow-[1.5]'
                      : 'bg-pomodoro-button-unselected text-pomodoro-button-unselected-foreground hover:brightness-95'
                  )}
                >
                  {mins} Mins
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-input-label tracking-tight text-base trim-cap">Rest duration</h3>

          <div className="flex gap-1">
            {REST_PRESETS.map((mins, index) => {
              const isActive = selectedRest === mins
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setSelectedRest(mins)}
                  className={cn(
                    'py-2 px-1 text-base font-medium italic tracking-tight cursor-pointer transition-all duration-300 ease-in-out select-none outline-none focus:outline-none grow transform-gpu',
                    getButtonRadius(index, REST_PRESETS.length, isActive),
                    isActive
                      ? 'bg-pomodoro-button-selected text-pomodoro-button-selected-foreground grow-[1.5]'
                      : 'bg-pomodoro-button-unselected text-pomodoro-button-unselected-foreground hover:brightness-95'
                  )}
                >
                  {mins} Mins
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveAndReset}
          className="cursor-pointer rounded-xl px-4 py-3 text-base font-semibold tracking-tight text-input-button-foreground bg-input-button hover:bg-input-button-hover transition-colors text-center w-full select-none outline-none focus:outline-none"
        >
          Save and reset pomodoro
        </button>
      </section>
    </div>
  )
}

export default PomodoroDurationSelection
