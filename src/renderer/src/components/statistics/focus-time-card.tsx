import { Card, CardHeader, CardTitle, CardContent } from '@renderer/components/ui/card'
import WeekBarChart from './week-bar-chart'
import { WeekDayData } from '@renderer/stores/use-statistics-store'

interface Props {
  days: WeekDayData[]
}

function FocusTimeCard({ days }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Focus time</CardTitle>

        <span className="bg-secondary text-secondary-foreground block text-sm p-1 px-2 rounded-full select-none tracking-tight">
          Hours
        </span>
      </CardHeader>
      <CardContent>
        <WeekBarChart days={days} valueExtractor={(day) => day.focusHours} />
      </CardContent>
    </Card>
  )
}

export default FocusTimeCard
