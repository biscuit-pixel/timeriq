import { useState } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'
import { DurationInput } from './DurationInput'

export function AddItemForm() {
  const { t } = useTranslation()
  const addItem = useTimerStore((s) => s.addItem)
  const breakDefaultMs = useTimerStore((s) => s.settings.breakDefaultMs)
  const [label, setLabel] = useState('')
  const [durationMs, setDurationMs] = useState(5 * 60 * 1000)

  const submit = (type: 'timer' | 'break') => {
    const ms = type === 'break' && !label ? breakDefaultMs : durationMs
    const fallbackLabel = type === 'timer' ? 'New segment' : 'Break'
    addItem(type, label.trim() || fallbackLabel, ms)
    setLabel('')
    setDurationMs(5 * 60 * 1000)
  }

  return (
    <form
      className="add-item-form"
      onSubmit={(e) => {
        e.preventDefault()
        submit('timer')
      }}
    >
      <input
        className="text-input"
        placeholder={t('playlist.label')}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <DurationInput valueMs={durationMs} onChange={setDurationMs} ariaLabel={t('playlist.duration')} />
      <button type="submit" className="ctrl-btn ctrl-btn--primary ctrl-btn--sm">
        {t('playlist.addTimer')}
      </button>
      <button type="button" className="ctrl-btn ctrl-btn--ghost ctrl-btn--sm" onClick={() => submit('break')}>
        {t('playlist.addBreak')}
      </button>
    </form>
  )
}
