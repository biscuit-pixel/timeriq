import { useState } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'
import { clockInputToMs } from '../utils/time'

export function AddItemForm() {
  const { t } = useTranslation()
  const addItem = useTimerStore((s) => s.addItem)
  const breakDefaultMs = useTimerStore((s) => s.settings.breakDefaultMs)
  const [label, setLabel] = useState('')
  const [duration, setDuration] = useState('5:00')

  const submit = (type: 'timer' | 'break') => {
    const ms = type === 'break' && !label ? breakDefaultMs : clockInputToMs(duration)
    const fallbackLabel = type === 'timer' ? 'New segment' : 'Break'
    addItem(type, label.trim() || fallbackLabel, ms || 5 * 60 * 1000)
    setLabel('')
    setDuration('5:00')
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
      <input
        className="text-input text-input--duration"
        placeholder="mm:ss"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        inputMode="numeric"
      />
      <button type="submit" className="ctrl-btn ctrl-btn--primary ctrl-btn--sm">
        {t('playlist.addTimer')}
      </button>
      <button type="button" className="ctrl-btn ctrl-btn--ghost ctrl-btn--sm" onClick={() => submit('break')}>
        {t('playlist.addBreak')}
      </button>
    </form>
  )
}
