import { useRef } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'
import { fileToResizedDataUrl } from '../utils/logo'
import { DurationInput } from './DurationInput'
import { ThresholdEditor } from './ThresholdEditor'
import type { Settings } from '../store/types'

export function SettingsPanel() {
  const { t } = useTranslation()
  const visual = useTimerStore((s) => s.settings.visual)
  const breakDefaultMs = useTimerStore((s) => s.settings.breakDefaultMs)
  const updateVisual = useTimerStore((s) => s.updateVisual)
  const updateSettings = useTimerStore((s) => s.updateSettings)
  const warningThresholds = useTimerStore((s) => s.settings.warningThresholds)
  const addThreshold = useTimerStore((s) => s.addThreshold)
  const updateThreshold = useTimerStore((s) => s.updateThreshold)
  const removeThreshold = useTimerStore((s) => s.removeThreshold)
  const fileInput = useRef<HTMLInputElement>(null)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToResizedDataUrl(file)
    updateVisual({ logoDataUrl: dataUrl })
    if (fileInput.current) fileInput.current.value = ''
  }

  const resetAll = () => {
    if (confirm(t('settings.resetConfirm'))) {
      localStorage.removeItem('timeriq-store-v1')
      window.location.reload()
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{t('settings.title')}</h2>
      </div>

      <div className="settings-grid">
        <div className="field">
          <label>{t('settings.theme')}</label>
          <div className="segmented">
            {(['dark', 'light'] as const).map((theme) => (
              <button
                key={theme}
                className={`segmented-opt ${visual.theme === theme ? 'segmented-opt--active' : ''}`}
                onClick={() => updateVisual({ theme })}
              >
                {t(theme === 'dark' ? 'settings.dark' : 'settings.light')}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>{t('settings.accentColor')}</label>
          <input
            type="color"
            className="color-input"
            value={visual.accentColor}
            onChange={(e) => updateVisual({ accentColor: e.target.value })}
          />
        </div>

        <div className="field">
          <label>{t('settings.font')}</label>
          <div className="segmented">
            {(['inter', 'mono'] as const).map((font) => (
              <button
                key={font}
                className={`segmented-opt ${visual.fontFamily === font ? 'segmented-opt--active' : ''}`}
                onClick={() => updateVisual({ fontFamily: font })}
              >
                {t(font === 'inter' ? 'settings.fontInter' : 'settings.fontMono')}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>{t('settings.progressStyle')}</label>
          <div className="segmented">
            {(['bar', 'ring', 'both'] as const).map((style) => (
              <button
                key={style}
                className={`segmented-opt ${visual.progressStyle === style ? 'segmented-opt--active' : ''}`}
                onClick={() => updateVisual({ progressStyle: style })}
              >
                {t(`settings.progress${style === 'bar' ? 'Bar' : style === 'ring' ? 'Ring' : 'Both'}` as never)}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>{t('settings.background')}</label>
          <div className="segmented">
            {(['gradient', 'solid'] as const).map((bg) => (
              <button
                key={bg}
                className={`segmented-opt ${visual.backgroundStyle === bg ? 'segmented-opt--active' : ''}`}
                onClick={() => updateVisual({ backgroundStyle: bg })}
              >
                {t(bg === 'gradient' ? 'settings.backgroundGradient' : 'settings.backgroundSolid')}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="checkbox-field">
            <input type="checkbox" checked={visual.particles} onChange={(e) => updateVisual({ particles: e.target.checked })} />
            {t('settings.particles')}
          </label>
        </div>

        <div className="field">
          <label>{t('settings.breakDefault')}</label>
          <DurationInput
            valueMs={breakDefaultMs}
            ariaLabel={t('settings.breakDefault')}
            onChange={(ms) => updateSettings({ breakDefaultMs: ms })}
          />
        </div>

        <div className="field">
          <label className="checkbox-field">
            <input type="checkbox" checked={visual.showClock} onChange={(e) => updateVisual({ showClock: e.target.checked })} />
            {t('settings.clock')}
          </label>
          {visual.showClock && (
            <div className="segmented">
              {(['24h', '12h'] as const).map((fmt) => (
                <button
                  key={fmt}
                  className={`segmented-opt ${visual.clockFormat === fmt ? 'segmented-opt--active' : ''}`}
                  onClick={() => updateVisual({ clockFormat: fmt })}
                >
                  {fmt}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="field field--wide">
          <label>{t('settings.logo')}</label>
          <div className="logo-field">
            {visual.logoDataUrl && <img src={visual.logoDataUrl} alt="logo preview" className="logo-preview" />}
            <input ref={fileInput} type="file" accept="image/*" onChange={handleLogoUpload} className="file-input" />
            {visual.logoDataUrl && (
              <button className="ctrl-btn ctrl-btn--ghost ctrl-btn--sm" onClick={() => updateVisual({ logoDataUrl: null })}>
                {t('settings.removeLogo')}
              </button>
            )}
          </div>
          {visual.logoDataUrl && (
            <label className="slider-field">
              <span>{t('settings.logoScale')}</span>
              <input
                type="range"
                min="0.4"
                max="3"
                step="0.05"
                value={visual.logoScale}
                onChange={(e) => updateVisual({ logoScale: Number(e.target.value) })}
              />
              <span className="slider-value">{Math.round(visual.logoScale * 100)}%</span>
            </label>
          )}
          {visual.logoDataUrl && (
            <div className="segmented segmented--wrap">
              {(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] as const).map((pos) => (
                <button
                  key={pos}
                  className={`segmented-opt ${visual.logoPosition === pos ? 'segmented-opt--active' : ''}`}
                  onClick={() => updateVisual({ logoPosition: pos as Settings['visual']['logoPosition'] })}
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
        thresholds={warningThresholds}
        onAdd={addThreshold}
        onUpdate={updateThreshold}
        onRemove={removeThreshold}
      />

      <div className="panel-footer">
        <button className="ctrl-btn ctrl-btn--danger ctrl-btn--sm" onClick={resetAll}>
          {t('settings.reset')}
        </button>
      </div>
    </section>
  )
}
