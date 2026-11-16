import { useRef, useState } from 'react'
import {
  CircleStop,
  EighthNoteIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  Settings2Icon
} from 'lucide-react'
import { cn } from '@renderer/utils/cn'

import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { usePomodoroStore } from '@renderer/stores/use-pomodoro-store'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import PomodoroDurationSelection from './pomodoro-duration-selection'
import PomodoroSoundSelection from './pomodoro-sound-selection'

function PomodoroTimer() {
  const [isDurationOpen, setIsDurationOpen] = useState(false)
  const [isSoundOpen, setIsSoundOpen] = useState(false)
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
      <Card>
        <CardHeader>
          <CardTitle ref={textRef}>
            {headerText.split('').map((char, index) => (
              <span
                key={`${headerText}-${index}`}
                className="wave-char trim-cap inline-block will-change-transform"
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </CardTitle>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsSoundOpen(true)}
              className="p-1.5 rounded-full bg-secondary hover:brightness-105 text-secondary-foreground active:brightness-95 transition-all cursor-pointer outline-none focus:outline-none flex items-center justify-center"
              aria-label="Pomodoro sound effects"
            >
              <EighthNoteIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsDurationOpen(true)}
              className="p-1.5 rounded-full bg-secondary hover:brightness-105 text-secondary-foreground active:brightness-95 transition-all cursor-pointer outline-none focus:outline-none flex items-center justify-center"
              aria-label="Pomodoro duration settings"
            >
              <Settings2Icon className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-secondary rounded-xl flex items-center justify-center p-3 min-h-36 select-none">
              <span className="text-5xl font-extrabold tracking-tight text-secondary-foreground tabular-nums">
                {formattedTime}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={isRunning ? pause : start}
                className={cn(
                  'w-full flex-1 bg-secondary flex items-center justify-center text-secondary-foreground cursor-pointer transition-all duration-300 hover:brightness-95 active:scale-95 min-h-18 outline-none focus:outline-none',
                  isRunning ? 'rounded-[100px]' : 'rounded-xl'
                )}
                aria-label={isRunning ? 'Pause timer' : 'Start timer'}
              >
                {isRunning ? (
                  <PauseIcon className="w-9 h-9 fill-current stroke-none" />
                ) : (
                  <PlayIcon className="w-9 h-9 fill-current stroke-none translate-x-0.5" />
                )}
              </button>

              <div className="grid grid-cols-2 gap-1 h-11.5">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-4xl rounded-tr-sm rounded-br-sm bg-secondary flex items-center justify-center text-secondary-foreground cursor-pointer transition-all hover:brightness-95 active:scale-95 outline-none focus:outline-none"
                  aria-label="Reset timer"
                >
                  <RotateCcwIcon className="w-5 h-5 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={stop}
                  className="rounded-4xl rounded-tl-sm rounded-bl-sm bg-secondary flex items-center justify-center text-secondary-foreground cursor-pointer transition-all hover:brightness-95 active:scale-95 outline-none focus:outline-none"
                  aria-label="Stop timer"
                >
                  <CircleStop className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isDurationOpen && (
        <PomodoroDurationSelection handleOnClose={() => setIsDurationOpen(false)} />
      )}

      {isSoundOpen && <PomodoroSoundSelection handleOnClose={() => setIsSoundOpen(false)} />}
    </>
  )
}

export default PomodoroTimer
