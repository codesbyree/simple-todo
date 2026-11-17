import { useRef, useState } from 'react'
import {
  CircleStop,
  EighthNoteIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  Settings2Icon,
  SkipForwardIcon
} from 'lucide-react'

import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { usePomodoroStore } from '@renderer/stores/use-pomodoro-store'

import Button from '../ui/button'
import PomodoroSoundSelection from './pomodoro-sound-selection'
import PomodoroDurationSelection from './pomodoro-duration-selection'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'

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
  const skipRest = usePomodoroStore((s) => s.skipRest)

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
            <Button
              variant="secondary"
              size="icon"
              aria-label="Pomodoro sound effects"
              onClick={() => setIsSoundOpen(true)}
            >
              <EighthNoteIcon className="w-4 h-4" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              aria-label="Pomodoro duration settings"
              onClick={() => setIsDurationOpen(true)}
            >
              <Settings2Icon className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-2">
          <div className="bg-secondary rounded-xl flex items-center justify-center p-3 min-h-36 select-none">
            <span className="text-5xl font-extrabold tracking-tight text-secondary-foreground tabular-nums">
              {formattedTime}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={isRunning ? pause : start}
              variant="secondary"
              position={isRunning ? 'single-full' : 'single'}
              className="w-full flex-1 grid place-items-center"
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? (
                <PauseIcon className="w-9 h-9 fill-current stroke-none" />
              ) : (
                <PlayIcon className="w-9 h-9 fill-current stroke-none translate-x-0.5" />
              )}
            </Button>

            <div className="grid grid-cols-2 gap-1 h-11.5">
              <Button
                variant="secondary"
                position="first"
                onClick={reset}
                aria-label="Reset timer"
                className="h-full w-full"
              >
                <RotateCcwIcon className="w-5 h-5 stroke-[2.5]" />
              </Button>

              <Button
                variant="secondary"
                position="last"
                onClick={stop}
                aria-label="Stop timer"
                className="h-full w-full"
              >
                <CircleStop className="w-5 h-5 stroke-[2.5]" />
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end empty:hidden">
          {mode === 'rest' && (
            <Button
              variant="accent"
              onClick={skipRest}
              position="single"
              aria-label="Skip rest"
              className="w-max"
            >
              Skip rest
              <SkipForwardIcon className="w-4 h-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {isDurationOpen && (
        <PomodoroDurationSelection handleOnClose={() => setIsDurationOpen(false)} />
      )}

      {isSoundOpen && <PomodoroSoundSelection handleOnClose={() => setIsSoundOpen(false)} />}
    </>
  )
}

export default PomodoroTimer
