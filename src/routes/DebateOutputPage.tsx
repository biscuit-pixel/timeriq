import { useEffect } from 'react'
import { useTimerStore } from '../store/timerStore'
import { useDebateStore } from '../debate/store'
import { useDebateKeyboardShortcuts } from '../hooks/useDebateKeyboardShortcuts'
import { useLiveRemaining } from '../hooks/useLiveRemaining'
import { DebateStage } from '../components/debate/DebateStage'

export function DebateOutputPage() {
  useDebateKeyboardShortcuts(false)

  useEffect(() => {
    useDebateStore.setState({ isControlSource: false })
    useDebateStore.getState().requestSync()
  }, [])

  const visual = useTimerStore((s) => s.settings.visual)
  const debaters = useDebateStore((s) => s.debaters)
  const run = useDebateStore((s) => s.run)
  const settings = useDebateStore((s) => s.settings)
  const activeRemainingMs = useLiveRemaining(run)

  return (
    <div className="output-root" data-theme={visual.theme}>
      <DebateStage
        debaters={debaters}
        activeIndex={run.activeIndex}
        activeRemainingMs={activeRemainingMs}
        phase={run.phase}
        settings={settings}
        visual={visual}
        variant="output"
      />
    </div>
  )
}
