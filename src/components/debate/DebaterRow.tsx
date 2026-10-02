import { useRef } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { useDebateStore } from '../../debate/store'
import type { Debater } from '../../debate/types'
import { fileToResizedDataUrl } from '../../utils/logo'
import { formatDuration } from '../../utils/time'
import { DurationInput } from '../DurationInput'
import { DebaterAvatar } from './DebaterAvatar'

interface Props {
  debater: Debater
  index: number
  isActive: boolean
  isRunning: boolean
  displayMs: number
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDrop: () => void
}

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M6 7h12l-1 13H7L6 7zm3-3h6l1 2H8l1-2zM9 9v9m3-9v9m3-9v9" />
  </svg>
)
const DragIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <circle cx="8" cy="6" r="1.4" />
    <circle cx="8" cy="12" r="1.4" />
    <circle cx="8" cy="18" r="1.4" />
    <circle cx="16" cy="6" r="1.4" />
    <circle cx="16" cy="12" r="1.4" />
    <circle cx="16" cy="18" r="1.4" />
  </svg>
)
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
)
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
)

export function DebaterRow({ debater, index, isActive, isRunning, displayMs, onDragStart, onDragOver, onDrop }: Props) {
  const { t } = useTranslation()
  const updateDebater = useDebateStore((s) => s.updateDebater)
  const removeDebater = useDebateStore((s) => s.removeDebater)
  const selectIndex = useDebateStore((s) => s.selectIndex)
  const toggle = useDebateStore((s) => s.toggle)
  const photoInput = useRef<HTMLInputElement>(null)

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToResizedDataUrl(file)
    updateDebater(debater.id, { photoDataUrl: dataUrl })
    if (photoInput.current) photoInput.current.value = ''
  }

  const handleSpotlight = () => {
    if (isActive) toggle()
    else selectIndex(index)
  }

  return (
    <li
      className={`debater-row ${isActive ? 'debater-row--active' : ''}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver(index)
      }}
      onDrop={onDrop}
    >
      <span className="drag-handle"><DragIcon /></span>

      <button className="debater-photo-btn" onClick={() => photoInput.current?.click()} title={t('debate.uploadPhoto')}>
        <DebaterAvatar name={debater.name} photoDataUrl={debater.photoDataUrl} size={40} />
      </button>
      <input ref={photoInput} type="file" accept="image/*" onChange={handlePhoto} className="file-input-hidden" />

      <input
        className="text-input debater-row-name"
        value={debater.name}
        onChange={(e) => updateDebater(debater.id, { name: e.target.value })}
      />

      <DurationInput
        valueMs={debater.allottedMs}
        ariaLabel={t('debate.allotted')}
        onChange={(ms) => updateDebater(debater.id, { allottedMs: ms })}
      />

      <span className={`debater-row-remaining ${isActive ? 'debater-row-remaining--live' : ''}`}>
        {formatDuration(displayMs)}
      </span>

      <button className={`ctrl-btn ctrl-btn--sm ${isActive ? 'ctrl-btn--primary' : 'ctrl-btn--ghost'}`} onClick={handleSpotlight}>
        {isActive && isRunning ? <PauseIcon /> : <PlayIcon />}
        {isActive ? (isRunning ? t('control.pause') : t('control.play')) : t('debate.spotlight')}
      </button>

      <button className="icon-btn icon-btn--danger" onClick={() => removeDebater(debater.id)} title={t('playlist.remove')}>
        <TrashIcon />
      </button>
    </li>
  )
}
