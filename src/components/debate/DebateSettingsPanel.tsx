import { useRef } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { useDebateStore } from '../../debate/store'
import { fileToResizedDataUrl } from '../../utils/logo'
import { ThresholdEditor } from '../ThresholdEditor'
import type { DebateSettings } from '../../debate/types'

export function DebateSettingsPanel() {
  const { t } = useTranslation()
  const settings = useDebateStore((s) => s.settings)
  const updateSettings = useDebateStore((s) => s.updateSettings)
  const addThreshold = useDebateStore((s) => s.addThreshold)
  const updateThreshold = useDebateStore((s) => s.updateThreshold)
  const removeThreshold = useDebateStore((s) => s.removeThreshold)
  const fileInput = useRef<HTMLInputElement>(null)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToResizedDataUrl(file)
    updateSettings({ logoDataUrl: dataUrl })
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{t('settings.title')}</h2>
      </div>

      <div className="settings-grid">
        <div className="field field--wide">
          <label>{t('debate.discussionName')}</label>
          <input
            className="text-input"
            placeholder={t('debate.discussionNamePlaceholder')}
            value={settings.discussionName}
            onChange={(e) => updateSettings({ discussionName: e.target.value })}
          />
        </div>

        <div className="field field--wide">
          <label>{t('settings.logo')}</label>
          <div className="logo-field">
            {settings.logoDataUrl && <img src={settings.logoDataUrl} alt="logo preview" className="logo-preview" />}
            <input ref={fileInput} type="file" accept="image/*" onChange={handleLogoUpload} className="file-input" />
            {settings.logoDataUrl && (
              <button className="ctrl-btn ctrl-btn--ghost ctrl-btn--sm" onClick={() => updateSettings({ logoDataUrl: null })}>
                {t('settings.removeLogo')}
              </button>
            )}
          </div>
          {settings.logoDataUrl && (
            <label className="slider-field">
              <span>{t('settings.logoScale')}</span>
              <input
                type="range"
                min="0.4"
                max="3"
                step="0.05"
                value={settings.logoScale}
                onChange={(e) => updateSettings({ logoScale: Number(e.target.value) })}
              />
              <span className="slider-value">{Math.round(settings.logoScale * 100)}%</span>
            </label>
          )}
          {settings.logoDataUrl && (
            <div className="segmented segmented--wrap">
              {(['top-left', 'top-right', 'center'] as const).map((pos) => (
                <button
                  key={pos}
                  className={`segmented-opt ${settings.logoPosition === pos ? 'segmented-opt--active' : ''}`}
                  onClick={() => updateSettings({ logoPosition: pos as DebateSettings['logoPosition'] })}
                >
                  {t(`settings.position${pos.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('')}` as never)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel-subheader">
        <h3>{t('settings.warnings')}</h3>
      </div>
      <ThresholdEditor
        thresholds={settings.warningThresholds}
        onAdd={addThreshold}
        onUpdate={updateThreshold}
        onRemove={removeThreshold}
      />
    </section>
  )
}
