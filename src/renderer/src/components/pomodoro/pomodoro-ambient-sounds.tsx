import { cn } from '@renderer/utils/cn'
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from 'lucide-react'

import {
  useAmbientPlaylistTicker,
  useAmbientSoundStore
} from '@renderer/stores/use-ambient-sound-store'

import Button from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

function getCardPositionInList(
  index: number,
  totalItem: number
): 'single' | 'top' | 'middle' | 'bottom' {
  if (totalItem === 1) return 'single'
  if (index === 0) return 'top'
  if (index === totalItem - 1) return 'bottom'
  return 'middle'
}

function PomodoroAmbientSounds() {
  useAmbientPlaylistTicker()

  const playlist = useAmbientSoundStore((s) => s.playlist)
  const currentTrackIndex = useAmbientSoundStore((s) => s.currentTrackIndex)
  const isPlaying = useAmbientSoundStore((s) => s.isPlaying)

  const togglePlay = useAmbientSoundStore((s) => s.togglePlay)
  const playTrack = useAmbientSoundStore((s) => s.playTrack)
  const nextTrack = useAmbientSoundStore((s) => s.nextTrack)
  const prevTrack = useAmbientSoundStore((s) => s.prevTrack)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ambient music</CardTitle>

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="icon-lg"
            position="first"
            onClick={prevTrack}
            aria-label="Previous ambient track"
          >
            <ChevronLeftIcon className="w-5 h-5 stroke-[2.5]" />
          </Button>

          <Button
            variant="secondary"
            size="icon-lg"
            position="single-full"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause ambient music' : 'Play ambient music'}
          >
            {isPlaying ? (
              <PauseIcon className="fill-current w-4 h-4 stroke-none" />
            ) : (
              <PlayIcon className="fill-current w-4 h-4 mr-1 stroke-none translate-x-0.5" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="icon-lg"
            position="last"
            onClick={nextTrack}
            aria-label="Next ambient track"
          >
            <ChevronRightIcon className="w-5 h-5 stroke-[2.5]" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-0.5">
        {playlist.map((track, index) => {
          const cardPos = getCardPositionInList(index, playlist.length)
          const isCurrent = currentTrackIndex === index
          const isCurrentPlaying = isCurrent && isPlaying

          return (
            <article
              key={track.id}
              onClick={() => playTrack(index)}
              className={cn(
                'relative border border-white/30 z-10 min-h-12.5 p-3 bg-secondary rounded-sm flex items-center justify-between gap-3 cursor-pointer hover:brightness-102 active:scale-[0.99] transition-all select-none',
                cardPos === 'single' && 'rounded-xl',
                cardPos === 'top' && 'rounded-tl-xl rounded-tr-xl',
                cardPos === 'bottom' && 'rounded-bl-xl rounded-br-xl',
                isCurrent && 'border-white/60 brightness-120'
              )}
            >
              <div className="flex flex-col gap-1.5 select-none">
                <h4 className="text-secondary-foreground text-sm trim-cap">{track.title}</h4>

                <p className="text-secondary-foreground/70 text-xs flex items-center gap-3.5">
                  <span>{track.artist}</span>
                  <span className="w-1 h-1 rounded-full bg-secondary-foreground/50 inline-block" />
                  <span>{track.duration}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  playTrack(index)
                }}
                className={cn(
                  'w-9 h-9 rounded-full bg-tertiary flex items-center justify-center text-tertiary-foreground transition-all hover:scale-105 active:scale-95 cursor-pointer outline-none border-none',
                  isCurrentPlaying ? 'bg-primary text-primary-foreground' : 'hover:brightness-105'
                )}
                aria-label={isCurrentPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
              >
                {isCurrentPlaying ? (
                  <PauseIcon className="fill-current w-4 h-4 stroke-none" />
                ) : (
                  <PlayIcon className="fill-current w-4 h-4 mr-1 stroke-none translate-x-0.5" />
                )}
              </button>
            </article>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default PomodoroAmbientSounds
