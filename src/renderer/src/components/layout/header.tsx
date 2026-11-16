import { useNavigationStore } from '@renderer/stores/use-navigation-store'

function Header() {
  const activePage = useNavigationStore((s) => s.activeNavigation)

  return (
    <header className="bg-primary p-4 py-3 rounded-[20px]">
      <h1 className="text-2xl font-extrabold italic text-header-foreground tracking-tight trim-cap text-primary-foreground">
        {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
      </h1>
    </header>
  )
}

export default Header
