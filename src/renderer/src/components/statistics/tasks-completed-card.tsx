import { Card, CardHeader, CardTitle, CardContent } from '@renderer/components/ui/card'
import WeekBarChart from './week-bar-chart'
import { WeekDayData } from '@renderer/stores/use-statistics-store'

interface Props {
  days: WeekDayData[]
}

function TasksCompletedCard({ days }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks completed</CardTitle>
      </CardHeader>
      <CardContent>
        <WeekBarChart days={days} valueExtractor={(day) => day.completedTasks} />
      </CardContent>
    </Card>
  )
}

export default TasksCompletedCard

