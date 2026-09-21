import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'
import { DurationInput } from './DurationInput'
import { ModeToggle } from './ModeToggle'

export function SingleTimerPanel() {
  const { t } = useTranslation()
  const single = useTimerStore((s) => s.settings.single)
  const updateSingle = useTimerStore((s) => s.updateSingle)

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{t('playlist.modeSingle')}</h2>
        <ModeToggle />
      </div>
      <div className="single-timer-fields">
        <input
          className="text-input"
          placeholder={t('playlist.label')}
          value={single.label}
          onChange={(e) => updateSingle({ label: e.target.value })}
        />
        <DurationInput
          valueMs={single.durationMs}
          onChange={(ms) => updateSingle({ durationMs: ms })}
          ariaLabel={t('playlist.duration')}
        />
      </div>
    </section>
  )
}
