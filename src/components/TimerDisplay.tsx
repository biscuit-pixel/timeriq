import { useTranslation } from '../i18n/useTranslation'
import type { PlaylistItem, RunPhase, Settings } from '../store/types'
import { formatDuration } from '../utils/time'
import { activeThreshold } from '../utils/warnings'
import { ProgressBar } from './ProgressBar'
import { ProgressRing } from './ProgressRing'
import { ClockWidget } from './ClockWidget'

interface Props {
  item: PlaylistItem | null
  nextItem: PlaylistItem | null
  remainingMs: number
  phase: RunPhase
  settings: Settings
  variant?: 'output' | 'preview'
}

const logoPositionClass: Record<Settings['visual']['logoPosition'], string> = {
  'top-left': 'logo-top-left',
  'top-right': 'logo-top-right',
  'bottom-left': 'logo-bottom-left',
  'bottom-right': 'logo-bottom-right',
  center: 'logo-center',
}

export function TimerDisplay({ item, nextItem, remainingMs, phase, settings, variant = 'output' }: Props) {
  const { t } = useTranslation()
  const { visual, warningThresholds } = settings

  if (!item) {
    return (
      <div className={`timer-stage timer-stage--${variant} timer-stage--empty`} data-theme={visual.theme}>
        <p className="empty-copy">{t('control.noItems')}</p>
      </div>
    )
  }

  const threshold = activeThreshold(remainingMs, warningThresholds)
  const accent = threshold?.color ?? visual.accentColor
  const fraction = item.durationMs > 0 ? remainingMs / item.durationMs : 0
  const isBreak = item.type === 'break'
  const statusKey = phase === 'finished' ? 'control.finished' : phase === 'running' ? 'control.running' : phase === 'paused' ? 'control.paused' : 'control.idle'

  return (
    <div
      className={[
        'timer-stage',
        `timer-stage--${variant}`,
        `bg-${visual.backgroundStyle}`,
        threshold?.pulse ? 'timer-stage--pulse' : '',
        isBreak ? 'timer-stage--break' : '',
      ].join(' ')}
      data-theme={visual.theme}
      style={{ '--accent': accent, '--stage-font': visual.fontFamily === 'mono' ? 'var(--font-mono)' : 'var(--font-ui)' } as React.CSSProperties}
    >
      {visual.logoDataUrl && (
        <img src={visual.logoDataUrl} alt="logo" className={`stage-logo ${logoPositionClass[visual.logoPosition]}`} />
      )}
      {visual.showClock && (
        <div className="stage-clock">
          <ClockWidget format={visual.clockFormat} />
        </div>
      )}

      <div className="stage-content">
        <div className="stage-status">
          <span className="stage-badge">{isBreak ? t('playlist.break') : t('playlist.timer')}</span>
          <span className="stage-status-text">{t(statusKey as never)}</span>
        </div>
        <h1 className="stage-label">{item.label}</h1>

        {visual.progressStyle !== 'bar' && (
          <div className="stage-ring">
            <ProgressRing fraction={fraction} color={accent} size={variant === 'output' ? 420 : 220} />
            <div className="stage-ring-time">{formatDuration(remainingMs)}</div>
          </div>
        )}

        {visual.progressStyle === 'bar' && <div className="stage-time" style={{ color: accent }}>{formatDuration(remainingMs)}</div>}

        {(visual.progressStyle === 'bar' || visual.progressStyle === 'both') && (
          <div className="stage-bar">
            <ProgressBar fraction={fraction} color={accent} />
          </div>
        )}

        {nextItem && (
          <div className="stage-next">
            <span>{t('control.upNext')}:</span> {nextItem.label} · {formatDuration(nextItem.durationMs)}
          </div>
        )}
      </div>
    </div>
  )
}
