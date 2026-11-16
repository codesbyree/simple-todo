import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type NavigationStore = {
  activeNavigation: 'todo' | 'pomodoro' | 'statistics'
  setActiveNavigation: (navigation: NavigationStore['activeNavigation']) => void
}

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set) => ({
      activeNavigation: 'todo',
      setActiveNavigation: (navigation) => set({ activeNavigation: navigation })
    }),
    { name: 'navigation-store', storage: createJSONStorage(() => localStorage) }
  )
)
