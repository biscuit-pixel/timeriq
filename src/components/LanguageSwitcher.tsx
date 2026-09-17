import { useTimerStore } from '../store/timerStore'
import type { Language } from '../store/types'

const options: { value: Language; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'sk', label: 'SK' },
]

export function LanguageSwitcher() {
  const language = useTimerStore((s) => s.settings.language)
  const updateSettings = useTimerStore((s) => s.updateSettings)

  return (
    <div className="segmented">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`segmented-opt ${language === opt.value ? 'segmented-opt--active' : ''}`}
          onClick={() => updateSettings({ language: opt.value })}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
