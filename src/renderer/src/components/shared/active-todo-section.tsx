import { getActiveTodos } from '@renderer/stores/use-todo-store'

import Empty from '../ui/empty'
import TodoItem from '../ui/todo-item'

function ActiveTodoSection() {
  const todos = getActiveTodos()

  const renderTodoList = () => {
    const hasTodos = Boolean(todos.length > 0)

    if (hasTodos)
      return (
        <ul className="space-y-0.5">
          {todos.map((item, index) => (
            <li key={item.id}>
              <TodoItem todo={item} index={index} totalItem={todos.length} />
            </li>
          ))}
        </ul>
      )

    return <Empty />
  }

  return (
    <section className="bg-card p-3 rounded-xl flex flex-col gap-4">
      <header className="flex items-center gap-4 justify-between">
        <h2 className="text-lg italic tracking-tight text-card-foreground trim-cap">Ongoing</h2>
      </header>

      {renderTodoList()}
    </section>
  )
}

export default ActiveTodoSection
