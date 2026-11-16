import { getCompletedTodos } from '@renderer/stores/use-todo-store'

import Empty from '../ui/empty'
import TodoItem from '../ui/todo-item'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

function CompletedTodoSection() {
  const todos = getCompletedTodos()

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

    return <Empty message="No completed tasks yet" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle> Completed tasks</CardTitle>
      </CardHeader>

      <CardContent>{renderTodoList()}</CardContent>
    </Card>
  )
}

export default CompletedTodoSection
