import Header from './header'
import Navigation from './navigation'

type Props = {
  children: React.ReactNode
}

function Layout(props: Props) {
  const { children } = props

  return (
    <div className="bg-background w-full min-h-150">
      <Header />
      {children}
      <Navigation />
    </div>
  )
}

export default Layout
