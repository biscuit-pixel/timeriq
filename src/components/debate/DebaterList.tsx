import { useRef } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { useDebateStore } from '../../debate/store'
import { useLiveRemaining } from '../../hooks/useLiveRemaining'
import { AddDebaterForm } from './AddDebaterForm'
import { DebaterRow } from './DebaterRow'

export function DebaterList() {
  const { t } = useTranslation()
  const debaters = useDebateStore((s) => s.debaters)
  const run = useDebateStore((s) => s.run)
  const reorderDebater = useDebateStore((s) => s.reorderDebater)
  const liveRemainingMs = useLiveRemaining(run)
  const dragFrom = useRef<number | null>(null)
  const dragOverIndex = useRef<number | null>(null)

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{t('debate.participants')}</h2>
      </div>

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
