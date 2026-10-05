import { useEffect } from 'react'
import { useTimerStore } from '../store/timerStore'
import { useDebateStore, useActiveRound } from '../debate/store'
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
  const round = useActiveRound()
  const settings = useDebateStore((s) => s.settings)
  const activeRemainingMs = useLiveRemaining(round.run)

  return (
    <div className="output-root" data-theme={visual.theme}>
      <DebateStage
        debaters={round.debaters}
        activeIndex={round.run.activeIndex}
        activeRemainingMs={activeRemainingMs}
        phase={round.run.phase}
        roundName={round.name}
        settings={settings}
        visual={visual}
        variant="output"
      />
    </div>
  )
}
