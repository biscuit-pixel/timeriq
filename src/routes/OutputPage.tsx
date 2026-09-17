import { useEffect } from 'react'
import { useTimerStore } from '../store/timerStore'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useLiveRemaining } from '../hooks/useLiveRemaining'
import { TimerDisplay } from '../components/TimerDisplay'

export function OutputPage() {
  useKeyboardShortcuts(false)

  useEffect(() => {
    useTimerStore.setState({ isControlSource: false })
    useTimerStore.getState().requestSync()
  }, [])

  const playlist = useTimerStore((s) => s.playlist)
  const run = useTimerStore((s) => s.run)
  const settings = useTimerStore((s) => s.settings)
  const remainingMs = useLiveRemaining(run)

  const item = playlist[run.currentIndex] ?? null
  const nextItem = playlist[run.currentIndex + 1] ?? null

  return (
    <div className="output-root" data-theme={settings.visual.theme}>
      <TimerDisplay item={item} nextItem={nextItem} remainingMs={remainingMs} phase={run.phase} settings={settings} variant="output" />
    </div>
  )
}
