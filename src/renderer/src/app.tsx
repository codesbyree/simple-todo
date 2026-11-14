import Layout from './components/layout/layout'
import ActiveTodoSection from './components/shared/active-todo-section'
import { useNavigationStore } from './stores/use-navigation-store'

function TodoPage() {
  return (
    <>
      <ActiveTodoSection />
    </>
  )
}

function PomodoroPage() {
  return (
    <>
      <p>Hello from Pomodoro</p>
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
