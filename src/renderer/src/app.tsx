import { useNavigationStore } from './stores/use-navigation-store'

import Layout from './components/layout/layout'
import ActiveTodoSection from './components/shared/active-todo-section'
import CompletedTodoSection from './components/shared/completed-todo-section'
import PomodoroTimer from './components/pomodoro/pomodoro-timer'

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
    <div className="flex flex-col gap-4">
      <PomodoroTimer />
    </div>
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
    case 'analytics':
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
