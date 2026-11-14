import AddTodoModal from '../shared/add-todo-modal'
import Header from './header'
import Navigation from './navigation'

type Props = {
  children: React.ReactNode
}

function Layout(props: Props) {
  const { children } = props

  return (
    <div className="bg-background w-full min-h-screen p-2">
      <Header />

      <div className="flex flex-col gap-1.5 pb-12 pt-1.5">{children}</div>

      <Navigation />
      <AddTodoModal />
    </div>
  )
}

export default Layout
