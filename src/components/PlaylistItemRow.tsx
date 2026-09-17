import { useState } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'
import type { PlaylistItem } from '../store/types'
import { clockInputToMs, formatDuration, msToClockInput } from '../utils/time'

interface Props {
  item: PlaylistItem
  index: number
  isCurrent: boolean
  isPast: boolean
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDrop: () => void
}

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M6 7h12l-1 13H7L6 7zm3-3h6l1 2H8l1-2zM9 9v9m3-9v9m3-9v9" stroke="currentColor" strokeWidth="1.4" fill="none" /></svg>
)
const DuplicateIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="8" y="8" width="12" height="12" rx="2" /><rect x="4" y="4" width="12" height="12" rx="2" /></svg>
)
const DragIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="8" cy="6" r="1.4" /><circle cx="8" cy="12" r="1.4" /><circle cx="8" cy="18" r="1.4" /><circle cx="16" cy="6" r="1.4" /><circle cx="16" cy="12" r="1.4" /><circle cx="16" cy="18" r="1.4" /></svg>
)

export function PlaylistItemRow({ item, index, isCurrent, isPast, onDragStart, onDragOver, onDrop }: Props) {
  const { t } = useTranslation()
  const updateItem = useTimerStore((s) => s.updateItem)
  const removeItem = useTimerStore((s) => s.removeItem)
  const duplicateItem = useTimerStore((s) => s.duplicateItem)
  const goTo = useTimerStore((s) => s.goTo)
  const [editingDuration, setEditingDuration] = useState(false)
  const [durationDraft, setDurationDraft] = useState(() => msToClockInput(item.durationMs))

  const commitDuration = () => {
    const ms = clockInputToMs(durationDraft)
    if (ms > 0) updateItem(item.id, { durationMs: ms })
    else setDurationDraft(msToClockInput(item.durationMs))
    setEditingDuration(false)
  }

  return (
    <li
      className={['playlist-row', item.type === 'break' ? 'playlist-row--break' : '', isCurrent ? 'playlist-row--current' : '', isPast ? 'playlist-row--past' : ''].join(' ')}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver(index)
      }}
      onDrop={onDrop}
    >
      <span className="drag-handle"><DragIcon /></span>
      <button className="playlist-row-jump" onClick={() => goTo(index)} title={t('playlist.current')}>
        {isCurrent ? '▶' : index + 1}
      </button>
      <span className={`type-chip ${item.type === 'break' ? 'type-chip--break' : ''}`}>
        {item.type === 'break' ? t('playlist.break') : t('playlist.timer')}
      </span>
      <input
        className="text-input playlist-row-label"
        value={item.label}
        onChange={(e) => updateItem(item.id, { label: e.target.value })}
      />
      {editingDuration ? (
        <input
          autoFocus
          className="text-input text-input--duration"
          value={durationDraft}
          onChange={(e) => setDurationDraft(e.target.value)}
          onBlur={commitDuration}
          onKeyDown={(e) => e.key === 'Enter' && commitDuration()}
        />
      ) : (
        <button className="duration-chip" onClick={() => setEditingDuration(true)}>
          {formatDuration(item.durationMs)}
        </button>
      )}
      <button className="icon-btn" onClick={() => duplicateItem(item.id)} title={t('playlist.duplicate')}>
        <DuplicateIcon />
      </button>
      <button className="icon-btn icon-btn--danger" onClick={() => removeItem(item.id)} title={t('playlist.remove')}>
        <TrashIcon />
      </button>
    </li>
  )
}
