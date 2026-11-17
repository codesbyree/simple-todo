import { create } from 'zustand'
import { useEffect } from 'react'
import { ambientSoundEngine } from '@renderer/services/ambient-sound-service'

import track1 from '@renderer/assets/sounds/ES_4 Malcolm - Sarah, the Illstrumentalist.wav'
import track2 from '@renderer/assets/sounds/ES_Good Intentions - Sarah, the Illstrumentalist.wav'
import track3 from '@renderer/assets/sounds/ES_Pay Day - Sarah, the Illstrumentalist.wav'
import track4 from '@renderer/assets/sounds/ES_This Makes Everything Better - Sarah, the Illstrumentalist.wav'

export interface AmbientTrack {
  id: string
  title: string
  artist: string
  duration: string
  durationSeconds: number
  src: string
}

function parseDurationToSeconds(duration: string): number {
  const parts = duration.split(':').map(Number)
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0)
  }
  return 0
}

export const AMBIENT_PLAYLIST: AmbientTrack[] = [
  {
    id: 'track1',
    title: '4 Malcolm',
    artist: 'Sarah, the illstrumentalist',
    duration: '2:09',
    durationSeconds: parseDurationToSeconds('2:09'), // 129s
    src: track1
  },
  {
    id: 'track2',
    title: 'Good Intentions',
    artist: 'Sarah, the illstrumentalist',
    duration: '2:31',
    durationSeconds: parseDurationToSeconds('2:31'), // 151s
    src: track2
  },
  {
    id: 'track3',
    title: 'Pay Day',
    artist: 'Sarah, the illstrumentalist',
    duration: '2:32',
    durationSeconds: parseDurationToSeconds('2:32'), // 152s
    src: track3
  },
  {
    id: 'track4',
    title: 'This Makes Everything Better',
    artist: 'Sarah, the illstrumentalist',
    duration: '2:05',
    durationSeconds: parseDurationToSeconds('2:05'), // 125s
    src: track4
  }
]

interface AmbientSoundStore {
  playlist: AmbientTrack[]
  currentTrackIndex: number
  isPlaying: boolean
  elapsedSeconds: number

  playTrack: (index: number) => void
  togglePlay: () => void
  nextTrack: () => void
  prevTrack: () => void
  tick: () => void
}

export const useAmbientSoundStore = create<AmbientSoundStore>((set, get) => {
  // Automatically advance and loop infinitely when a track finishes
  ambientSoundEngine.setOnEnded(() => {
    get().nextTrack()
  })

  return {
    playlist: AMBIENT_PLAYLIST,
    currentTrackIndex: 0,
    isPlaying: false,
    elapsedSeconds: 0,

    playTrack: (index: number) => {
      const { playlist, currentTrackIndex, isPlaying } = get()
      const validIndex = (index + playlist.length) % playlist.length

      // If clicking the current track, toggle play/pause
      if (validIndex === currentTrackIndex) {
        if (isPlaying) {
          ambientSoundEngine.pause()
          set({ isPlaying: false })
        } else {
          ambientSoundEngine.resume()
          set({ isPlaying: true })
        }
        return
      }

      // Switch to new track
      const track = playlist[validIndex]
      ambientSoundEngine.play(track.src)
      set({
        currentTrackIndex: validIndex,
        isPlaying: true,
        elapsedSeconds: 0
      })
    },

    togglePlay: () => {
      const { isPlaying, playlist, currentTrackIndex } = get()
      const track = playlist[currentTrackIndex]

      if (isPlaying) {
        ambientSoundEngine.pause()
        set({ isPlaying: false })
      } else {
        ambientSoundEngine.play(track.src)
        set({ isPlaying: true })
      }
    },

    nextTrack: () => {
      const { playlist, currentTrackIndex, isPlaying } = get()
      // Loops through the playlist infinitely
      const nextIndex = (currentTrackIndex + 1) % playlist.length
      const nextTrack = playlist[nextIndex]

      if (isPlaying) {
        ambientSoundEngine.play(nextTrack.src)
      }

      set({
        currentTrackIndex: nextIndex,
        elapsedSeconds: 0
      })
    },

    prevTrack: () => {
      const { playlist, currentTrackIndex, isPlaying } = get()
      // Loops backwards through the playlist
      const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length
      const prevTrack = playlist[prevIndex]

      if (isPlaying) {
        ambientSoundEngine.play(prevTrack.src)
      }

      set({
        currentTrackIndex: prevIndex,
        elapsedSeconds: 0
      })
    },

    tick: () => {
      const { isPlaying } = get()
      if (!isPlaying) return
      set({ elapsedSeconds: Math.floor(ambientSoundEngine.getCurrentTime()) })
    }
  }
})

/**
 * Hook to automatically progress the ambient playlist ticker every second
 */
export function useAmbientPlaylistTicker() {
  const tick = useAmbientSoundStore((s) => s.tick)
  const isPlaying = useAmbientSoundStore((s) => s.isPlaying)

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, tick])
}
