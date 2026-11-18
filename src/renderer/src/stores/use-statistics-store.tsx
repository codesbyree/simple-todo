import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import moment from 'moment'
import { useTodoStore } from './use-todo-store'

export type DayMetric = {
  completedTasks: number
  focusSeconds: number
}

export type WeekDayData = {
  date: string // 'YYYY-MM-DD'
  dayLabel: string // 'M' | 'T' | 'W' | 'T' | 'F' | 'S' | 'S'
  fullDayName: string // 'Monday', 'Tuesday', ...
  formattedDate: string // 'Nov 16'
  completedTasks: number
  focusHours: number
  focusSeconds: number
  isToday: boolean
}

export type WeekSummary = {
  rangeLabel: string // 'Nov 16 – Nov 22'
  days: WeekDayData[]
  totalCompletedTasks: number
  totalFocusHours: number
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Clean out any previously saved mock/fake seed data from localStorage
function getInitialCleanMetrics(): Record<string, DayMetric> {
  try {
    const raw = localStorage.getItem('statistics-storage')
    if (raw) {
      const parsed = JSON.parse(raw)
      const metrics = parsed.state?.dailyMetrics
      if (metrics) {
        // Detect if the store was infected by the previous fake mockup numbers [9, 8, 5, 7, 6, 5, 3]
        const values = Object.values(metrics) as any[]
        const hasFakeData = values.some(
          (m) => m?.completedTasks === 9 && (m?.focusMinutes === 420 || m?.focusSeconds === 25200)
        )
        if (hasFakeData) {
          localStorage.removeItem('statistics-storage')
          return {}
        }
        return metrics
      }
    }
  } catch {
    // Ignore parse error
  }
  return {}
}

type StatisticsStore = {
  dailyMetrics: Record<string, DayMetric>
  selectedWeekOffset: number

  prevWeek: () => void
  nextWeek: () => void
  resetToCurrentWeek: () => void

  recordTaskCompletion: (delta: number, dateStr?: string) => void
  recordFocusSeconds: (seconds: number, dateStr?: string) => void

  getWeekSummary: (weekOffset?: number) => WeekSummary
}

export const useStatisticsStore = create<StatisticsStore>()(
  persist(
    (set, get) => ({
      dailyMetrics: getInitialCleanMetrics(),
      selectedWeekOffset: 0,

      prevWeek: () => {
        set((state) => ({ selectedWeekOffset: state.selectedWeekOffset - 1 }))
      },

      nextWeek: () => {
        set((state) => ({ selectedWeekOffset: state.selectedWeekOffset + 1 }))
      },

      resetToCurrentWeek: () => {
        set({ selectedWeekOffset: 0 })
      },

      recordTaskCompletion: (delta: number, dateStr?: string) => {
        const targetDate = dateStr || moment().format('YYYY-MM-DD')
        set((state) => {
          const current = state.dailyMetrics[targetDate] || { completedTasks: 0, focusSeconds: 0 }
          const nextCompleted = Math.max(0, current.completedTasks + delta)
          return {
            dailyMetrics: {
              ...state.dailyMetrics,
              [targetDate]: {
                ...current,
                completedTasks: nextCompleted
              }
            }
          }
        })
      },

      recordFocusSeconds: (seconds: number, dateStr?: string) => {
        const targetDate = dateStr || moment().format('YYYY-MM-DD')
        set((state) => {
          const current = state.dailyMetrics[targetDate] || { completedTasks: 0, focusSeconds: 0 }
          return {
            dailyMetrics: {
              ...state.dailyMetrics,
              [targetDate]: {
                ...current,
                focusSeconds: current.focusSeconds + seconds
              }
            }
          }
        })
      },

      getWeekSummary: (customOffset?: number): WeekSummary => {
        const offset = customOffset !== undefined ? customOffset : get().selectedWeekOffset
        const baseMonday = moment().add(offset, 'weeks').startOf('isoWeek')
        const sunday = moment(baseMonday).add(6, 'days')
        const todayStr = moment().format('YYYY-MM-DD')

        const rangeLabel = `${baseMonday.format('MMM D')} – ${sunday.format('MMM D')}`
        const days: WeekDayData[] = []
        let totalCompletedTasks = 0
        let totalFocusSeconds = 0

        const metrics = get().dailyMetrics
        const allTodos = useTodoStore.getState().todos

        for (let i = 0; i < 7; i++) {
          const currentDay = moment(baseMonday).add(i, 'days')
          const dateStr = currentDay.format('YYYY-MM-DD')
          const metric = metrics[dateStr] || { completedTasks: 0, focusSeconds: 0 }

          // Count real completed todos matching this date from actual user todos
          const realCompletedCount = allTodos.filter((t) => {
            if (!t.checked) return false
            const completedDate = (t as any).completedAt
              ? moment((t as any).completedAt).format('YYYY-MM-DD')
              : moment(t.createdAt).format('YYYY-MM-DD')
            return completedDate === dateStr
          }).length

          const taskCount = Math.max(metric.completedTasks || 0, realCompletedCount)
          const focusSec = metric.focusSeconds || 0
          const hoursRaw = focusSec / 3600
          const focusHours = hoursRaw === 0 ? 0 : Number(hoursRaw.toFixed(1))

          totalCompletedTasks += taskCount
          totalFocusSeconds += focusSec

          days.push({
            date: dateStr,
            dayLabel: DAY_LABELS[i],
            fullDayName: currentDay.format('dddd'),
            formattedDate: currentDay.format('MMM D'),
            completedTasks: taskCount,
            focusHours,
            focusSeconds: focusSec,
            isToday: dateStr === todayStr
          })
        }

        const totalHoursRaw = totalFocusSeconds / 3600
        const totalFocusHours = totalHoursRaw === 0 ? 0 : Number(totalHoursRaw.toFixed(1))

        return {
          rangeLabel,
          days,
          totalCompletedTasks,
          totalFocusHours
        }
      }
    }),
    {
      name: 'simple-todo-statistics-real',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
