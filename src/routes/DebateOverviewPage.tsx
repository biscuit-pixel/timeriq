import { useEffect } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'
import { useDebateStore, useActiveRound } from '../debate/store'
import { useLiveRemaining } from '../hooks/useLiveRemaining'
import { formatDuration } from '../utils/time'
import { activeThreshold } from '../utils/warnings'
import { ParticleField } from '../components/ParticleField'
import { DebaterAvatar } from '../components/debate/DebaterAvatar'

/** A scoreboard-style view of every participant's time in the active round, for use between segments or on a second monitor. */
export function DebateOverviewPage() {
  const { t } = useTranslation()

  useEffect(() => {
    useDebateStore.setState({ isControlSource: false })
    useDebateStore.getState().requestSync()
  }, [])

  const visual = useTimerStore((s) => s.settings.visual)
  const round = useActiveRound()
  const settings = useDebateStore((s) => s.settings)
  const activeRemainingMs = useLiveRemaining(round.run)

  const titleParts = [settings.discussionName, round.name].filter(Boolean)

  return (
    <div className="timer-stage debate-overview-root bg-gradient" data-theme={visual.theme} style={{ '--accent': visual.accentColor } as React.CSSProperties}>
      {visual.particles && <ParticleField color={visual.accentColor} density={0.8} />}
      <div className="debate-overview-content">
        {titleParts.length > 0 && <div className="debate-title">{titleParts.join(' · ')}</div>}
        <h1 className="debate-overview-heading">{t('debate.overviewTitle')}</h1>

        {round.debaters.length === 0 ? (
          <p className="empty-copy">{t('debate.noDebaters')}</p>
        ) : (
          <div className="debate-overview-grid">
            {round.debaters.map((d, index) => {
              const isActive = index === round.run.activeIndex
              const remainingMs = isActive ? activeRemainingMs : d.remainingMs
              const threshold = activeThreshold(remainingMs, settings.warningThresholds)
              const accent = threshold?.color ?? visual.accentColor
              return (
                <div
                  key={d.id}
                  className={`debate-overview-card ${isActive ? 'debate-overview-card--active' : ''}`}
                  style={{ '--accent': accent } as React.CSSProperties}
                >
                  {isActive && round.run.phase === 'running' && <span className="debate-overview-live-dot" />}
                  <DebaterAvatar name={d.name} photoDataUrl={d.photoDataUrl} size={64} />
                  {d.kind === 'question' && <span className="debate-kind-badge">{t('debate.kindQuestion')}</span>}
                  <div className="debate-overview-name">{d.name}</div>
                  <div className="debate-overview-time" style={{ color: accent }}>
                    {formatDuration(remainingMs)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
