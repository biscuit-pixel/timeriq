import { useTranslation } from '../i18n/useTranslation'
import type { WarningThreshold } from '../store/types'
import { DurationInput } from './DurationInput'

interface Props {
  thresholds: WarningThreshold[]
  onAdd: (t: Omit<WarningThreshold, 'id'>) => void
  onUpdate: (id: string, patch: Partial<WarningThreshold>) => void
  onRemove: (id: string) => void
}

export function ThresholdEditor({ thresholds, onAdd, onUpdate, onRemove }: Props) {
  const { t } = useTranslation()

  return (
    <div className="threshold-editor">
      <p className="field-hint">{t('settings.warningsHint')}</p>
      {thresholds.map((th) => (
        <div className="threshold-row" key={th.id}>
          <DurationInput
            valueMs={th.atMs}
            minMs={0}
            ariaLabel={t('settings.thresholdAt')}
            onChange={(ms) => onUpdate(th.id, { atMs: ms })}
          />
          <input
            type="color"
            className="color-input"
            value={th.color}
            title={t('settings.thresholdColor')}
            onChange={(e) => onUpdate(th.id, { color: e.target.value })}
          />
          <input
            className="text-input"
            value={th.label}
            title={t('settings.thresholdLabel')}
            onChange={(e) => onUpdate(th.id, { label: e.target.value })}
          />
          <label className="checkbox-field checkbox-field--compact">
            <input
              type="checkbox"
              checked={th.pulse}
              onChange={(e) => onUpdate(th.id, { pulse: e.target.checked })}
            />
            {t('settings.thresholdPulse')}
          </label>
          <button className="icon-btn icon-btn--danger" onClick={() => onRemove(th.id)}>
            ×
          </button>
        </div>
      ))}
      <button
        className="ctrl-btn ctrl-btn--ghost ctrl-btn--sm"
        onClick={() => onAdd({ atMs: 2 * 60 * 1000, color: '#f5a623', label: 'Warning', pulse: false })}
      >
        + {t('settings.addThreshold')}
      </button>
    </div>
  )
}
