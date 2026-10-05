import { useRef, useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { useDebateStore, useActiveRound } from '../../debate/store'
import { useLiveRemaining } from '../../hooks/useLiveRemaining'
import { DurationInput } from '../DurationInput'
import { AddDebaterForm } from './AddDebaterForm'
import { DebaterRow } from './DebaterRow'

export function DebaterList() {
  const { t } = useTranslation()
  const round = useActiveRound()
  const { debaters, run } = round
  const reorderDebater = useDebateStore((s) => s.reorderDebater)
  const applyRoundDuration = useDebateStore((s) => s.applyRoundDuration)
  const liveRemainingMs = useLiveRemaining(run)
  const dragFrom = useRef<number | null>(null)
  const dragOverIndex = useRef<number | null>(null)
  const [bulkMs, setBulkMs] = useState(5 * 60 * 1000)

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{t('debate.participants')}</h2>
      </div>

      {debaters.length > 1 && (
        <div className="round-bulk-duration">
          <span>{t('debate.perPerson')}</span>
          <DurationInput valueMs={bulkMs} onChange={setBulkMs} ariaLabel={t('debate.perPerson')} />
          <button className="ctrl-btn ctrl-btn--ghost ctrl-btn--sm" onClick={() => applyRoundDuration(bulkMs)}>
            {t('debate.applyToAll')}
          </button>
        </div>
      )}

      {debaters.length === 0 && <p className="empty-copy">{t('debate.noDebaters')}</p>}

      <ul className="playlist-list">
        {debaters.map((d, index) => (
          <DebaterRow
            key={d.id}
            debater={d}
            index={index}
            isActive={index === run.activeIndex}
            isRunning={index === run.activeIndex && run.phase === 'running'}
            displayMs={index === run.activeIndex ? liveRemainingMs : d.remainingMs}
            onDragStart={(i) => (dragFrom.current = i)}
            onDragOver={(i) => (dragOverIndex.current = i)}
            onDrop={() => {
              if (dragFrom.current !== null && dragOverIndex.current !== null) {
                reorderDebater(dragFrom.current, dragOverIndex.current)
              }
              dragFrom.current = null
              dragOverIndex.current = null
            }}
          />
        ))}
      </ul>

      <AddDebaterForm />
    </section>
  )
}
