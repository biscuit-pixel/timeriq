import { useEffect } from 'react'
import { useTimerStore } from '../store/timerStore'
import { useDebateStore } from '../debate/store'
import { useLiveRemaining } from '../hooks/useLiveRemaining'
import { formatDuration } from '../utils/time'
import { activeThreshold } from '../utils/warnings'
import { DebaterAvatar } from '../components/debate/DebaterAvatar'

/** Transparent overlay window meant for OBS/streaming software as a browser source. */
export function DebateLowerThirdPage() {
  useEffect(() => {
    useDebateStore.setState({ isControlSource: false })
    useDebateStore.getState().requestSync()
    const prev = document.body.style.background
    document.body.style.background = 'transparent'
    document.documentElement.style.background = 'transparent'
    return () => {
      document.body.style.background = prev
      document.documentElement.style.background = ''
    }
  }, [])

  const visual = useTimerStore((s) => s.settings.visual)
  const debaters = useDebateStore((s) => s.debaters)
  const run = useDebateStore((s) => s.run)
  const settings = useDebateStore((s) => s.settings)
  const remainingMs = useLiveRemaining(run)
  const active = debaters[run.activeIndex] ?? null

  const threshold = active ? activeThreshold(remainingMs, settings.warningThresholds) : null
  const accent = threshold?.color ?? visual.accentColor

  if (!active) return <div className="lower-third-root" />

  return (
    <div className="lower-third-root" data-theme={visual.theme}>
      <div className="lower-third-bar" style={{ '--accent': accent } as React.CSSProperties} key={active.id}>
        <DebaterAvatar name={active.name} photoDataUrl={active.photoDataUrl} size={64} className="lower-third-avatar" />
        <div className="lower-third-text">
          {settings.discussionName && <div className="lower-third-discussion">{settings.discussionName}</div>}
          <div className="lower-third-name">{active.name}</div>
        </div>
        <div className="lower-third-time" style={{ color: accent }}>
          {formatDuration(remainingMs)}
        </div>
      </div>
    </div>
  )
}
