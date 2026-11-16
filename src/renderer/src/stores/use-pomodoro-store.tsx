import { useEffect } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { soundService } from '@renderer/services/sound-service'

export type PomodoroMode = 'work' | 'rest'
export type PomodoroStatus = 'idle' | 'running' | 'paused' | 'transitioning'

export const WORK_PRESETS = [1, 30, 45, 60] as const
export const REST_PRESETS = [1, 10, 15] as const

type PomodoroStore = {
  mode: PomodoroMode
  status: PomodoroStatus
  workDuration: number // in minutes
  restDuration: number // in minutes
  timeLeft: number // in seconds
  cycleCount: number

  start: () => void
  pause: () => void
  reset: () => void
  stop: () => void
  setWorkDuration: (minutes: number) => void
  setRestDuration: (minutes: number) => void
  tick: () => void
}

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      mode: 'work',
      status: 'idle',
      workDuration: 45,
      restDuration: 10,
      timeLeft: 45 * 60,
      cycleCount: 1,

      start: () => {
        const { status, timeLeft, mode, workDuration, restDuration } = get()
        if (status === 'transitioning') return

        // If time is 0, reset to full duration before starting
        if (timeLeft <= 0) {
          const duration = mode === 'work' ? workDuration : restDuration
          set({ timeLeft: duration * 60, status: 'running' })
        } else {
          set({ status: 'running' })
        }
      },

      pause: () => {
        const { status } = get()
        if (status === 'transitioning') return
        set({ status: 'paused' })
      },

      reset: () => {
        soundService.stopTimerEndSequence()
        const { mode, workDuration, restDuration } = get()
        const duration = mode === 'work' ? workDuration : restDuration
        set({
          status: 'idle',
          timeLeft: duration * 60
        })
      },

      stop: () => {
        soundService.stopTimerEndSequence()
        const { workDuration } = get()
        set({
          mode: 'work',
          status: 'idle',
          timeLeft: workDuration * 60
        })
      },

      setWorkDuration: (minutes: number) => {
        const { mode, status } = get()
        set({ workDuration: minutes })
        if (mode === 'work' && status !== 'running') {
          set({ timeLeft: minutes * 60, status: 'idle' })
        }
      },

      setRestDuration: (minutes: number) => {
        const { mode, status } = get()
        set({ restDuration: minutes })
        if (mode === 'rest' && status !== 'running') {
          set({ timeLeft: minutes * 60, status: 'idle' })
        }
      },

      tick: () => {
        const { status, timeLeft, mode, cycleCount } = get()
        if (status !== 'running') return

        if (timeLeft > 1) {
          set({ timeLeft: timeLeft - 1 })
          return
        }

        // Timer reached 0!
        if (mode === 'work') {
          // 1. Increment cycle count for completed work session
          set({
            timeLeft: 0,
            status: 'transitioning',
            cycleCount: cycleCount + 1
          })

          // 2. Loop work end sound 5 times, then transition to Rest mode and start
          soundService.playWorkEndSequence(5, 1400, () => {
            const currentRest = get().restDuration
            set({
              mode: 'rest',
              timeLeft: currentRest * 60,
              status: 'running'
            })
          })
        } else {
          // Rest completed!
          set({
            timeLeft: 0,
            status: 'transitioning'
          })

          // Loop rest end sound 5 times, then transition back to Work mode and start
          soundService.playRestEndSequence(5, 1400, () => {
            const currentWork = get().workDuration
            set({
              mode: 'work',
              timeLeft: currentWork * 60,
              status: 'running'
            })
          })
        }
      }
    }),
    {
      name: 'pomodoro-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        workDuration: state.workDuration,
        restDuration: state.restDuration,
        cycleCount: state.cycleCount
      })
    }
  )
)

export function usePomodoroTicker() {
  const tick = usePomodoroStore((s) => s.tick)
  const status = usePomodoroStore((s) => s.status)

  useEffect(() => {
    if (status !== 'running') return

    const interval = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(interval)
  }, [status, tick])
}
