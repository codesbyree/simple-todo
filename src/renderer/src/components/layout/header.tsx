import { useNavigationStore } from '@renderer/stores/use-navigation-store'

function Header() {
  const activePage = useNavigationStore((s) => s.activeNavigation)

  return (
    <header className="bg-header-bg p-4 rounded-xl">
      <h1 className="text-xl font-semibold italic text-header-foreground trim-cap tracking-tight">
        {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
      </h1>
    </header>
  )
}

export default Header
