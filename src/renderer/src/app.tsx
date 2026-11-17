import { useNavigationStore } from './stores/use-navigation-store'

import Layout from './components/layout/layout'
import ActiveTodoSection from './components/todo/active-todo-section'
import CompletedTodoSection from './components/todo/completed-todo-section'
import PomodoroTimer from './components/pomodoro/pomodoro-timer'
import PomodoroAmbientSounds from './components/pomodoro/pomodoro-ambient-sounds'

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
  return (
    <>
      <p>Hello from Analytics</p>
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
