import { useRef, useState } from 'react'
import { CircleStop, CogIcon, Pause, Play, RotateCcw } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { usePomodoroStore } from '@renderer/stores/use-pomodoro-store'
import PomodoroDurationSelection from './pomodoro-duration-selection'
import { cn } from '@renderer/utils/cn'

function PomodoroTimer() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const mode = usePomodoroStore((s) => s.mode)
  const status = usePomodoroStore((s) => s.status)
  const timeLeft = usePomodoroStore((s) => s.timeLeft)

  const start = usePomodoroStore((s) => s.start)
  const pause = usePomodoroStore((s) => s.pause)
  const reset = usePomodoroStore((s) => s.reset)
  const stop = usePomodoroStore((s) => s.stop)

  const textRef = useRef<HTMLHeadingElement>(null)

  const getHeaderText = () => {
    if (status === 'paused') {
      return 'Paused'
    }
    if (status === 'idle') {
      return mode === 'work' ? 'Work' : 'Rest'
    }
    return mode === 'work' ? 'Working...' : 'Resting...'
  }

  const headerText = getHeaderText()

  useGSAP(
    () => {
      if (!textRef.current) return
      const chars = textRef.current.querySelectorAll('.wave-char')
      if (!chars.length) return

      if (status !== 'running') {
        gsap.set(chars, { y: 0 })
        return
      }

      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 })

      chars.forEach((char, i) => {
        tl.to(
          char,
          {
            y: -4,
            duration: 0.25,
            repeat: 1,
            yoyo: true,
            ease: 'sine.inOut'
          },
          i * 0.08
        )
      })

      return () => {
        tl.kill()
        gsap.set(chars, { y: 0 })
      }
    },
    { dependencies: [headerText, status], scope: textRef }
  )

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const isRunning = status === 'running'

  return (
    <>
      <section className="bg-card p-3 rounded-2xl flex flex-col gap-4">
        <header className="flex items-center gap-4 justify-between">
          <h2
            ref={textRef}
            className="text-lg italic tracking-tight text-card-foreground trim-cap select-none"
          >
            {headerText.split('').map((char, index) => (
              <span
                key={`${headerText}-${index}`}
                className="wave-char inline-block will-change-transform"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-full bg-[#27C324] hover:bg-[#1e9b1c] text-pomodoro-button-foreground transition-colors cursor-pointer outline-none focus:outline-none flex items-center justify-center"
              aria-label="Pomodoro settings"
            >
              <CogIcon className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-todo-card rounded-[10px] flex items-center justify-center p-3 min-h-36 select-none">
            <span className="text-6xl font-extrabold tracking-tight text-pomodoro-button-foreground tabular-nums">
              {formattedTime}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={isRunning ? pause : start}
              className={cn(
                'w-full flex-1 bg-todo-card flex items-center justify-center text-pomodoro-button-foreground cursor-pointer transition-all duration-300 hover:brightness-95 active:scale-95 min-h-18 outline-none focus:outline-none',
                isRunning ? 'rounded-[100px]' : 'rounded-[10px]'
              )}
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? (
                <Pause className="w-7 h-7 fill-current stroke-none" />
              ) : (
                <Play className="w-7 h-7 fill-current stroke-none translate-x-0.5" />
              )}
            </button>

            <div className="grid grid-cols-2 gap-1 h-11.5">
              <button
                type="button"
                onClick={reset}
                className="rounded-4xl rounded-tr-sm rounded-br-sm bg-todo-card flex items-center justify-center text-pomodoro-button-foreground cursor-pointer transition-all hover:brightness-95 active:scale-95 outline-none focus:outline-none"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={stop}
                className="rounded-4xl rounded-tl-sm rounded-bl-sm bg-todo-card flex items-center justify-center text-pomodoro-button-foreground cursor-pointer transition-all hover:brightness-95 active:scale-95 outline-none focus:outline-none"
                aria-label="Stop timer"
              >
                <CircleStop className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {isSettingsOpen && (
        <PomodoroDurationSelection handleOnClose={() => setIsSettingsOpen(false)} />
      )}
    </>
  )
}

export default PomodoroTimer
