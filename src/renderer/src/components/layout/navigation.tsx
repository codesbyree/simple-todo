import { ReactNode, useRef } from 'react'
import { ListCheckIcon, TimerIcon } from 'lucide-react'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

import { NavigationStore, useNavigationStore } from '@renderer/stores/use-navigation-store'
import { cn } from '@renderer/utils/cn'

const NAV_ITEMS: { label: NavigationStore['activeNavigation']; icon: ReactNode }[] = [
  { label: 'todo', icon: <ListCheckIcon /> },
  { label: 'pomodoro', icon: <TimerIcon /> }
  // { label: 'statistics', icon: <TrendingUpIcon /> }
]

function Navigation() {
  const activeNavigation = useNavigationStore((s) => s.activeNavigation)
  const setActiveNavigation = useNavigationStore((s) => s.setActiveNavigation)

  const containerRef = useRef<HTMLDivElement>(null)
  const navActiveIndicatorRef = useRef<HTMLSpanElement>(null)

  const itemsRef = useRef<Record<NavigationStore['activeNavigation'], HTMLLIElement | null>>({
    todo: null,
    pomodoro: null,
    statistics: null
  })

  useGSAP(
    () => {
      const indicator = navActiveIndicatorRef.current
      const activeItem = itemsRef.current[activeNavigation]

      if (!indicator || !activeItem) return

      const tl = gsap.timeline()
      tl.to(indicator, {
        x: activeItem.offsetLeft - 4,
        width: activeItem.offsetWidth,
        duration: 0.4,
        ease: 'power3.out'
      })
    },
    { scope: containerRef, dependencies: [activeNavigation] }
  )

  return (
    <nav
      ref={containerRef}
      className="flex justify-center items-center gap-4 fixed bottom-0 left-0 w-full z-100 bg-linear-to-b from-transparent via-nav-gradient/30 to-nav-gradient pt-2.5 pb-5"
    >
      <ul className="flex items-center bg-nav-background rounded-full p-1 backdrop-blur-xl relative border border-white/25">
        {NAV_ITEMS.map((item) => {
          const isActive = activeNavigation === item.label

          return (
            <li
              key={item.label}
              ref={(el) => {
                itemsRef.current[item.label] = el
              }}
              onClick={() => setActiveNavigation(item.label)}
              className={cn(
                'rounded-full py-2.5 px-5 flex items-center justify-center text-nav-icon/60 relative z-10 cursor-pointer transition-colors hover:bg-white/30',
                isActive && 'hover:bg-transparent text-nav-icon'
              )}
            >
              {item.icon}
            </li>
          )
        })}

        <span
          ref={navActiveIndicatorRef}
          className={cn(
            'bg-nav-active-indicator rounded-full h-11 w-16 absolute top-1 left-1 shadow-nav-item border border-white/30'
          )}
        />
      </ul>
    </nav>
  )
}

export default Navigation
