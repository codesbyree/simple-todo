import { useEffect } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { soundService, SoundId } from '@renderer/services/sound-service'

export type PomodoroMode = 'work' | 'rest'
export type PomodoroStatus = 'idle' | 'running' | 'paused' | 'transitioning'

export const WORK_PRESETS = [25, 30, 45, 60] as const
export const REST_PRESETS = [5, 10, 15, 20] as const

function sendNotification(title: string, body: string): void {
  if (typeof Notification === 'undefined') return

  if (Notification.permission === 'granted') {
    new Notification(title, { body, silent: true })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, { body, silent: true })
      }
    })
  }
}

const getInitialDuration = () => {
  try {
    const raw = localStorage.getItem('pomodoro-storage')
    if (raw) {
      const parsed = JSON.parse(raw)
      const workDuration = parsed.state?.workDuration
      const restDuration = parsed.state?.restDuration
      const cycleCount = parsed.state?.cycleCount
      const workSound = parsed.state?.workSound
      const restSound = parsed.state?.restSound
      return {
        workDuration: typeof workDuration === 'number' ? workDuration : 25,
        restDuration: typeof restDuration === 'number' ? restDuration : 5,
        cycleCount: typeof cycleCount === 'number' ? cycleCount : 1,
        workSound: (workSound as SoundId) || 'warm-chime',
        restSound: (restSound as SoundId) || 'bright-bell'
      }
    }
  } catch {
    // Ignore localStorage parse errors
  }
  return {
    workDuration: 25,
    restDuration: 5,
    cycleCount: 1,
    workSound: 'warm-chime' as SoundId,
    restSound: 'bright-bell' as SoundId
  }
}

type PomodoroStore = {
  mode: PomodoroMode
  status: PomodoroStatus
  workDuration: number // in minutes
  restDuration: number // in minutes
  timeLeft: number // in seconds
  cycleCount: number
  workSound: SoundId
  restSound: SoundId

  start: () => void
  pause: () => void
  reset: () => void
  stop: () => void
  setWorkDuration: (minutes: number) => void
  setRestDuration: (minutes: number) => void
  setWorkSound: (sound: SoundId) => void
  setRestSound: (sound: SoundId) => void
  tick: () => void
}

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => {
      const initial = getInitialDuration()
      return {
        mode: 'work',
        status: 'idle',
        workDuration: initial.workDuration,
        restDuration: initial.restDuration,
        timeLeft: initial.workDuration * 60,
        cycleCount: initial.cycleCount,
        workSound: initial.workSound,
        restSound: initial.restSound,

        start: () => {
          if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission()
          }

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

        setWorkSound: (sound: SoundId) => {
          set({ workSound: sound })
        },

        setRestSound: (sound: SoundId) => {
          set({ restSound: sound })
        },

        tick: () => {
          const { status, timeLeft, mode, cycleCount, workSound, restSound } = get()
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

            sendNotification('Work Session Complete!', 'Great focus! Time to take a break.')

            // 2. Loop work end sound 5 times, then transition to Rest mode and start
            soundService.playWorkEndSequence(
              3,
              1400,
              () => {
                const currentRest = get().restDuration
                set({
                  mode: 'rest',
                  timeLeft: currentRest * 60,
                  status: 'running'
                })
              },
              workSound
            )
          } else {
            // Rest completed!
            set({
              timeLeft: 0,
              status: 'transitioning'
            })

            sendNotification('Break Finished!', 'Ready to focus again? Starting work session.')

            // Loop rest end sound 5 times, then transition back to Work mode and start
            soundService.playRestEndSequence(
              3,
              1400,
              () => {
                const currentWork = get().workDuration
                set({
                  mode: 'work',
                  timeLeft: currentWork * 60,
                  status: 'running'
                })
              },
              restSound
            )
          }
        }
      }
    },
    {
      name: 'pomodoro-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        workDuration: state.workDuration,
        restDuration: state.restDuration,
        cycleCount: state.cycleCount,
        workSound: state.workSound,
        restSound: state.restSound
      }),
      merge: (persistedState, currentState) => {
        const merged = {
          ...currentState,
          ...((persistedState as Partial<PomodoroStore>) || {})
        }
        // Always reset active running state back to idle on app load/rehydrate
        if (merged.status === 'running' || merged.status === 'transitioning') {
          merged.status = 'idle'
          merged.mode = 'work'
          merged.timeLeft = (merged.workDuration || 25) * 60
        }
        return merged
      },
      onRehydrateStorage: () => (state) => {
        if (state && state.status === 'idle') {
          state.reset()
        }
      }
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
