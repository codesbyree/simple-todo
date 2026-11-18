import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import { useStatisticsStore } from './use-statistics-store'

export type TodoType = {
  id: string
  title: string
  checked: boolean
  createdAt: Date
  completedAt?: string
}

export type TodoStore = {
  todos: TodoType[]
  addTodo: (todo: string) => void
  completeTodo: (id: string) => void
  removeTodo: (id: string) => void
  clearTodo: () => void
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (title: string) =>
        set((state) => ({
          todos: [...state.todos, { id: uuid(), title, checked: false, createdAt: new Date() }]
        })),
      removeTodo: (id: string) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id)
        })),
      clearTodo: () =>
        set(() => ({
          todos: []
        })),
      completeTodo: (id: string) =>
        set((state) => {
          const target = state.todos.find((t) => t.id === id)
          if (target) {
            const nextChecked = !target.checked
            useStatisticsStore.getState().recordTaskCompletion(nextChecked ? 1 : -1)
          }
          return {
            todos: state.todos.map((todo) =>
              todo.id === id
                ? {
                    ...todo,
                    checked: !todo.checked,
                    completedAt: !todo.checked ? new Date().toISOString() : undefined
                  }
                : todo
            )
          }
        })
    }),
    {
      name: 'todo',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

export const getActiveTodos = () => {
  const todos = useTodoStore((state) => state.todos)
  return todos.filter((todo) => !todo.checked)
}

export const getCompletedTodos = () => {
  const todos = useTodoStore((state) => state.todos)
  return todos.filter((todo) => todo.checked)
}
