import { useRef } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'
import { formatDuration } from '../utils/time'
import { AddItemForm } from './AddItemForm'
import { PlaylistItemRow } from './PlaylistItemRow'

export function PlaylistEditor() {
  const { t } = useTranslation()
  const playlist = useTimerStore((s) => s.playlist)
  const currentIndex = useTimerStore((s) => s.run.currentIndex)
  const reorderItem = useTimerStore((s) => s.reorderItem)
  const dragFrom = useRef<number | null>(null)
  const dragOverIndex = useRef<number | null>(null)

  const total = playlist.reduce((sum, it) => sum + it.durationMs, 0)

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{t('playlist.title')}</h2>
        <span className="panel-header-total">
          {t('playlist.totalDuration')}: {formatDuration(total)}
        </span>
      </div>

      {playlist.length === 0 && <p className="empty-copy">{t('control.noItems')}</p>}

      <ul className="playlist-list">
        {playlist.map((item, index) => (
          <PlaylistItemRow
            key={item.id}
            item={item}
            index={index}
            isCurrent={index === currentIndex}
            isPast={index < currentIndex}
            onDragStart={(i) => (dragFrom.current = i)}
            onDragOver={(i) => (dragOverIndex.current = i)}
            onDrop={() => {
              if (dragFrom.current !== null && dragOverIndex.current !== null) {
                reorderItem(dragFrom.current, dragOverIndex.current)
              }
              dragFrom.current = null
              dragOverIndex.current = null
            }}
          />
        ))}
      </ul>

      <AddItemForm />
    </section>
  )
}
