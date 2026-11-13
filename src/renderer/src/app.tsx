import Layout from './components/layout/layout'
import { useNavigationStore } from './stores/use-navigation-store'

function AppRoutes() {
  const activeNavigation = useNavigationStore((s) => s.activeNavigation)

  switch (activeNavigation) {
    case 'todo':
      return <p>Todo</p>
    case 'pomodoro':
      return <p>Pomodoro</p>
    case 'analytics':
      return <p>Analytics</p>
    default:
      return <p>Todo</p>
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
