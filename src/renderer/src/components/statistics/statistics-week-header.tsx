import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from '@renderer/components/ui/button'
import { useStatisticsStore } from '@renderer/stores/use-statistics-store'

interface Props {
  rangeLabel?: string
  onPrevWeek?: () => void
  onNextWeek?: () => void
}

function StatisticsWeekHeader({ rangeLabel: propRangeLabel, onPrevWeek, onNextWeek }: Props) {
  const selectedWeekOffset = useStatisticsStore((s) => s.selectedWeekOffset)
  const prevWeek = useStatisticsStore((s) => s.prevWeek)
  const nextWeek = useStatisticsStore((s) => s.nextWeek)
  const getWeekSummary = useStatisticsStore((s) => s.getWeekSummary)

  const weekSummary = getWeekSummary(selectedWeekOffset)
  const displayLabel = propRangeLabel ?? weekSummary.rangeLabel

  const handlePrev = onPrevWeek ?? prevWeek
  const handleNext = onNextWeek ?? nextWeek

  return (
    <div className="flex items-center justify-between px-1 py-1">
      <h2 className="text-secondary font-bold text-xl tracking-tight trim-cap select-none">
        {displayLabel}
      </h2>

      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="icon-lg"
          position="first"
          onClick={handlePrev}
          className="border border-white/30"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </Button>
        <Button
          variant="secondary"
          size="icon-lg"
          position="last"
          onClick={handleNext}
          className="border border-white/30"
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </Button>
      </div>
    </div>
  )
}

export default StatisticsWeekHeader
