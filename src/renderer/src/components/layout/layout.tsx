import { usePomodoroTicker } from '@renderer/stores/use-pomodoro-store'

import Header from './header'
import Navigation from './navigation'
import AddTodoModal from '../todo/add-todo-modal'

type Props = {
  children: React.ReactNode
}

function Layout(props: Props) {
  const { children } = props
  usePomodoroTicker()

  return (
    <div className="bg-background w-full min-h-screen p-3">
      <Header />

      <div className="flex flex-col gap-2 pb-24 pt-2">{children}</div>

      <Navigation />
      <AddTodoModal />
    </div>
  )
}

export default Layout
