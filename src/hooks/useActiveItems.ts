import { useMemo } from 'react'
import { activePlaylist, useTimerStore } from '../store/timerStore'

/** Current and upcoming item for the active run (playlist or single-timer mode). */
export function useActiveItems() {
  const playlist = useTimerStore((s) => s.playlist)
  const settings = useTimerStore((s) => s.settings)
  const currentIndex = useTimerStore((s) => s.run.currentIndex)

  return useMemo(() => {
    const list = activePlaylist({ playlist, settings })
    return { list, item: list[currentIndex] ?? null, nextItem: list[currentIndex + 1] ?? null }
  }, [playlist, settings, currentIndex])
}
