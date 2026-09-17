import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'
import type { RunPhase } from '../store/types'

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
)
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
)
const ResetIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 5V1L7 6l5 5V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" /></svg>
)
const PrevIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" /></svg>
)
const NextIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16 6h2v12h-2zM6 6l8.5 6L6 18z" /></svg>
)

export function ControlBar() {
  const { t } = useTranslation()
  const phase: RunPhase = useTimerStore((s) => s.run.phase)
  const canPrev = useTimerStore((s) => s.run.currentIndex > 0)
  const canNext = useTimerStore((s) => s.run.currentIndex < s.playlist.length - 1)
  const { toggle, reset, skipNext, skipPrev } = useTimerStore()

  return (
    <div className="control-bar">
      <button className="ctrl-btn ctrl-btn--ghost" onClick={skipPrev} disabled={!canPrev} title={t('control.prev')}>
        <PrevIcon />
      </button>
      <button className="ctrl-btn ctrl-btn--primary" onClick={toggle}>
        {phase === 'running' ? <PauseIcon /> : <PlayIcon />}
        <span>{phase === 'running' ? t('control.pause') : t('control.play')}</span>
      </button>
      <button className="ctrl-btn ctrl-btn--ghost" onClick={reset} title={t('control.reset')}>
        <ResetIcon />
      </button>
      <button className="ctrl-btn ctrl-btn--ghost" onClick={skipNext} disabled={!canNext} title={t('control.next')}>
        <NextIcon />
      </button>
      <div className="control-hint">{t('control.shortcuts')}</div>
    </div>
  )
}
