import { cn } from '@renderer/utils/cn'
import { WeekDayData } from '@renderer/stores/use-statistics-store'

import shapeStar from '@renderer/assets/shapes/shape-star.svg'
import shapePentagram from '@renderer/assets/shapes/shape-pentagram.svg'
import shapeOctagon from '@renderer/assets/shapes/shape-ocatagon.svg'
import shapeTriangle from '@renderer/assets/shapes/shape-triangle.svg'

// Symmetrical 7-day mapping from assets/shapes:
// M -> Star, T -> Pentagon, W -> Octagon, T -> Triangle, F -> Octagon, S -> Pentagon, S -> Star
const SHAPES_BY_DAY = [
  shapeStar,
  shapePentagram,
  shapeOctagon,
  shapeTriangle,
  shapeOctagon,
  shapePentagram,
  shapeStar
]

interface Props {
  days: WeekDayData[]
  valueExtractor: (day: WeekDayData) => number
  className?: string
}

const MIN_BAR_HEIGHT = 70
const MAX_BAR_HEIGHT = 150

function WeekBarChart({ days, valueExtractor, className }: Props) {
  const values = days.map(valueExtractor)
  const maxValue = Math.max(...values, 1)

  return (
    <div className={cn('flex items-end justify-between gap-2 h-50 w-full', className)}>
      {days.map((day, index) => {
        const val = valueExtractor(day)
        const ratio = maxValue > 0 ? Math.min(1, Math.max(0, val / maxValue)) : 0
        const heightPx = Math.round(MIN_BAR_HEIGHT + ratio * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT))
        const shapeSrc = SHAPES_BY_DAY[index % 7]

        return (
          <div
            key={day.date || index}
            className="flex flex-col items-center justify-end h-full flex-1 gap-3"
          >
            <div
              style={{ height: `${heightPx}px` }}
              className="w-full p-1 pb-2 bg-secondary rounded-full flex flex-col items-center justify-between transition-[height] duration-300 ease-out select-none"
            >
              <div className="flex items-center justify-center">
                <img
                  src={shapeSrc}
                  alt=""
                  className="w-full h-auto object-contain pointer-events-none select-none"
                />
              </div>

              <span className="text-secondary-foreground text-xs tracking-tight trim-cap pb-0.5">
                {val}
              </span>
            </div>

            <span className="text-secondary-foreground text-sm select-none tracking-tight trim-cap">
              {day.dayLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default WeekBarChart
