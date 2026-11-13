import { ReactNode, useRef } from 'react'
import { ChartNoAxesColumnIcon, ListCheckIcon, TimerIcon } from 'lucide-react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

import { NavigationStore, useNavigationStore } from '@renderer/stores/use-navigation-store'
import { cn } from '@renderer/utils/cn'

const NAV_ITEMS: { label: NavigationStore['activeNavigation']; icon: ReactNode }[] = [
  { label: 'todo', icon: <ListCheckIcon className="nav-icon" /> },
  { label: 'pomodoro', icon: <TimerIcon className="nav-icon" /> },
  { label: 'analytics', icon: <ChartNoAxesColumnIcon className="nav-icon" /> }
]

function Navigation() {
  const activeNavigation = useNavigationStore((s) => s.activeNavigation)
  const setActiveNavigation = useNavigationStore((s) => s.setActiveNavigation)

  const containerRef = useRef<HTMLDivElement>(null)
  const navActiveIndicatorRef = useRef<HTMLSpanElement>(null)

  const itemsRef = useRef<Record<NavigationStore['activeNavigation'], HTMLLIElement | null>>({
    todo: null,
    pomodoro: null,
    analytics: null
  })

  useGSAP(
    () => {
      const indicator = navActiveIndicatorRef.current
      const activeItem = itemsRef.current[activeNavigation]

      if (!indicator || !activeItem) return
      const activeIcon = itemsRef.current[activeNavigation]

      const tl = gsap.timeline()
      tl.to(indicator, {
        x: activeItem.offsetLeft - 4,
        width: activeItem.offsetWidth,
        duration: 0.4,
        ease: 'power3.out'
      })

      if (activeIcon) {
        tl.to(
          activeIcon,
          {
            keyframes: { rotate: [0, -12, 12, -8, 8, 0] },
            duration: 0.4
          },
          '<'
        )
      }
    },
    { scope: containerRef, dependencies: [activeNavigation] }
  )

  return (
    <nav
      ref={containerRef}
      className="flex justify-center items-center gap-4 fixed bottom-0 left-0 w-full z-100 bg-linear-to-b from-transparent via-nav-gradient/30 to-nav-gradient pt-2.5 pb-5"
    >
      <ul className="flex items-center bg-nav-background rounded-full p-1 shadow-md backdrop-blur-lg relative border border-nav-border">
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
                'rounded-full py-2.5 px-5 flex items-center justify-center text-nav-icon relative z-10 cursor-pointer transition-colors',
                isActive && 'text-nav-icon-active'
              )}
            >
              {item.icon}
            </li>
          )
        })}

        <span
          ref={navActiveIndicatorRef}
          className={cn(
            'bg-nav-item rounded-full h-11 w-16 absolute top-1 left-1 shadow-nav-item-inner'
          )}
        />
      </ul>
    </nav>
  )
}

export default Navigation
