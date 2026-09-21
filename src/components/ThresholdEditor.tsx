import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'
import { DurationInput } from './DurationInput'

export function ThresholdEditor() {
  const { t } = useTranslation()
  const thresholds = useTimerStore((s) => s.settings.warningThresholds)
  const addThreshold = useTimerStore((s) => s.addThreshold)
  const updateThreshold = useTimerStore((s) => s.updateThreshold)
  const removeThreshold = useTimerStore((s) => s.removeThreshold)

  return (
    <div className="threshold-editor">
      <p className="field-hint">{t('settings.warningsHint')}</p>
      {thresholds.map((th) => (
        <div className="threshold-row" key={th.id}>
          <DurationInput
            valueMs={th.atMs}
            minMs={1000}
            ariaLabel={t('settings.thresholdAt')}
            onChange={(ms) => updateThreshold(th.id, { atMs: ms })}
          />
          <input
            type="color"
            className="color-input"
            value={th.color}
            title={t('settings.thresholdColor')}
            onChange={(e) => updateThreshold(th.id, { color: e.target.value })}
          />
          <input
            className="text-input"
            value={th.label}
            title={t('settings.thresholdLabel')}
            onChange={(e) => updateThreshold(th.id, { label: e.target.value })}
          />
          <label className="checkbox-field checkbox-field--compact">
            <input
              type="checkbox"
              checked={th.pulse}
              onChange={(e) => updateThreshold(th.id, { pulse: e.target.checked })}
            />
            {t('settings.thresholdPulse')}
          </label>
          <button className="icon-btn icon-btn--danger" onClick={() => removeThreshold(th.id)}>
            ×
          </button>
        </div>
      ))}
      <button
        className="ctrl-btn ctrl-btn--ghost ctrl-btn--sm"
        onClick={() => addThreshold({ atMs: 2 * 60 * 1000, color: '#f5a623', label: 'Warning', pulse: false })}
      >
        + {t('settings.addThreshold')}
      </button>
    </div>
  )
}
