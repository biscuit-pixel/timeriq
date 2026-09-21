import { useEffect } from 'react'
import { useTimerStore } from '../store/timerStore'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useLiveRemaining } from '../hooks/useLiveRemaining'
import { useActiveItems } from '../hooks/useActiveItems'
import { TimerDisplay } from '../components/TimerDisplay'

export function OutputPage() {
  useKeyboardShortcuts(false)

  useEffect(() => {
    useTimerStore.setState({ isControlSource: false })
    useTimerStore.getState().requestSync()
  }, [])

  const run = useTimerStore((s) => s.run)
  const settings = useTimerStore((s) => s.settings)
  const remainingMs = useLiveRemaining(run)
  const { item, nextItem } = useActiveItems()

  return (
    <div className="output-root" data-theme={settings.visual.theme}>
      <TimerDisplay item={item} nextItem={nextItem} remainingMs={remainingMs} phase={run.phase} settings={settings} variant="output" />
    </div>
  )
}
