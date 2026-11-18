import { useNavigationStore } from './stores/use-navigation-store'
import { useStatisticsStore } from './stores/use-statistics-store'
import { useTodoStore } from './stores/use-todo-store'

import Layout from './components/layout/layout'
import ActiveTodoSection from './components/todo/active-todo-section'
import CompletedTodoSection from './components/todo/completed-todo-section'
import PomodoroTimer from './components/pomodoro/pomodoro-timer'
import PomodoroAmbientSounds from './components/pomodoro/pomodoro-ambient-sounds'
import StatisticsWeekHeader from './components/statistics/statistics-week-header'
import TasksCompletedCard from './components/statistics/tasks-completed-card'
import FocusTimeCard from './components/statistics/focus-time-card'

function TodoPage() {
  return (
    <>
      <ActiveTodoSection />
      <CompletedTodoSection />
    </>
  )
}

function PomodoroPage() {
  return (
    <>
      <PomodoroTimer />
      <PomodoroAmbientSounds />
    </>
  )
}

function AnalyticsPage() {
  const selectedWeekOffset = useStatisticsStore((s) => s.selectedWeekOffset)
  const getWeekSummary = useStatisticsStore((s) => s.getWeekSummary)
  useStatisticsStore((s) => s.dailyMetrics)
  useTodoStore((s) => s.todos)

  const summary = getWeekSummary(selectedWeekOffset)

  return (
    <>
      <StatisticsWeekHeader rangeLabel={summary.rangeLabel} />
      <TasksCompletedCard days={summary.days} />
      <FocusTimeCard days={summary.days} />
    </>
  )
}

function AppRoutes() {
  const activeNavigation = useNavigationStore((s) => s.activeNavigation)

  switch (activeNavigation) {
    case 'todo':
      return <TodoPage />
    case 'pomodoro':
      return <PomodoroPage />
    case 'statistics':
      return <AnalyticsPage />
    default:
      return <TodoPage />
  }
}

function App() {
  return (
    <Layout>
      <AppRoutes />
    </Layout>
  )
}

export default App
