import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import type { VisualSettings, WarningThreshold } from '../../store/types'
import type { DebateRunPhase, DebateSettings, Debater } from '../../debate/types'
import { formatDuration } from '../../utils/time'
import { activeThreshold } from '../../utils/warnings'
import { ParticleField } from '../ParticleField'
import { DebaterAvatar } from './DebaterAvatar'

interface Props {
  debaters: Debater[]
  activeIndex: number
  activeRemainingMs: number
  phase: DebateRunPhase
  settings: DebateSettings
  visual: VisualSettings
  variant?: 'output' | 'preview'
}

const logoPositionClass: Record<DebateSettings['logoPosition'], string> = {
  'top-left': 'logo-top-left',
  'top-right': 'logo-top-right',
  center: 'logo-center',
}

const EXIT_MS = 700

function thresholdFor(remainingMs: number, thresholds: WarningThreshold[]) {
  return activeThreshold(remainingMs, thresholds)
}

interface CardProps {
  debater: Debater
  remainingMs: number
  accent: string
  phase?: DebateRunPhase
  size: number
  layer: 'in' | 'out'
}

function DebateCenterCard({ debater, remainingMs, accent, phase, size, layer }: CardProps) {
  const { t } = useTranslation()
  return (
    <div className={`debate-center debate-center--${layer}`}>
      <DebaterAvatar name={debater.name} photoDataUrl={debater.photoDataUrl} size={size} className="debate-center-avatar" />
      <div className="debate-center-name">{debater.name}</div>
      <div className="debate-center-time" style={{ color: accent }}>
        {formatDuration(remainingMs)}
      </div>
      {phase && <div className="debate-center-status">{phase === 'running' ? t('control.running') : t('control.paused')}</div>}
    </div>
  )
}

export function DebateStage({ debaters, activeIndex, activeRemainingMs, phase, settings, visual, variant = 'output' }: Props) {
  const { t } = useTranslation()
  const active = debaters[activeIndex] ?? null
  const others = active ? debaters.filter((d) => d.id !== active.id) : []
  const threshold = active ? thresholdFor(activeRemainingMs, settings.warningThresholds) : null
  const accent = threshold?.color ?? visual.accentColor

  const [outgoing, setOutgoing] = useState<Debater | null>(null)
  const prevActiveId = useRef<string | null>(active?.id ?? null)

  useEffect(() => {
    const prevId = prevActiveId.current
    if (active && prevId && active.id !== prevId) {
      const leaving = debaters.find((d) => d.id === prevId) ?? null
      setOutgoing(leaving)
      const timer = window.setTimeout(() => setOutgoing(null), EXIT_MS)
      prevActiveId.current = active.id
      return () => window.clearTimeout(timer)
    }
    prevActiveId.current = active?.id ?? null
  }, [active, debaters])

  if (!active) {
    return (
      <div className={`timer-stage debate-stage timer-stage--${variant} timer-stage--empty`} data-theme={visual.theme}>
        <p className="empty-copy">{t('debate.noDebaters')}</p>
      </div>
    )
  }

  const avatarSize = variant === 'output' ? 160 : 84

  return (
    <div
      className={[
        'timer-stage',
        'debate-stage',
        `timer-stage--${variant}`,
        `bg-${visual.backgroundStyle}`,
        threshold?.pulse ? 'timer-stage--pulse' : '',
      ].join(' ')}
      data-theme={visual.theme}
      style={{ '--accent': accent, '--stage-font': visual.fontFamily === 'mono' ? 'var(--font-mono)' : 'var(--font-ui)', '--logo-scale': settings.logoScale } as React.CSSProperties}
    >
      {visual.particles && <ParticleField color={accent} density={variant === 'output' ? 1 : 0.7} />}

      {settings.logoDataUrl && (
        <img src={settings.logoDataUrl} alt="logo" className={`stage-logo ${logoPositionClass[settings.logoPosition]}`} />
      )}

      <div className="debate-content">
        {settings.discussionName && <div className="debate-title">{settings.discussionName}</div>}

        <div className="debate-center-stack">
          {outgoing && (
            <DebateCenterCard
              key={outgoing.id}
              debater={outgoing}
              remainingMs={outgoing.remainingMs}
              accent={accent}
              size={avatarSize}
              layer="out"
            />
          )}
          <DebateCenterCard
            key={active.id}
            debater={active}
            remainingMs={activeRemainingMs}
            accent={accent}
            phase={phase}
            size={avatarSize}
            layer="in"
          />
        </div>

        {others.length > 0 && (
          <div className="debate-bottom-row">
            {others.map((d) => (
              <div className="debate-chip" key={d.id}>
                <DebaterAvatar name={d.name} photoDataUrl={d.photoDataUrl} size={variant === 'output' ? 56 : 34} />
                <div className="debate-chip-info">
                  <span className="debate-chip-name">{d.name}</span>
                  <span className="debate-chip-time">{formatDuration(d.remainingMs)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
