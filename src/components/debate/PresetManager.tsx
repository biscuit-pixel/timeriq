import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { useDebateStore } from '../../debate/store'
import { deletePreset, listPresets, savePreset } from '../../debate/presets'
import type { DebatePreset } from '../../debate/types'

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M5 4h11l3 3v13H5V4z" />
    <path d="M8 4v5h7V4M8 14h8v6H8z" />
  </svg>
)
const LoadIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 4v10.2l3.6-3.6 1.4 1.4-6 6-6-6 1.4-1.4L10 14.2V4z" /><path d="M5 19h14v2H5z" /></svg>
)
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 7h12l-1 13H7L6 7zm3-3h6l1 2H8l1-2z" /></svg>
)

export function PresetManager() {
  const { t, language } = useTranslation()
  const rounds = useDebateStore((s) => s.rounds)
  const settings = useDebateStore((s) => s.settings)
  const loadPreset = useDebateStore((s) => s.loadPreset)
  const [presets, setPresets] = useState<DebatePreset[]>(() => listPresets())
  const [name, setName] = useState('')

  const refresh = () => setPresets(listPresets())

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    savePreset(trimmed, rounds, settings)
    setName('')
    refresh()
  }

  const handleLoad = (preset: DebatePreset) => {
    if (confirm(t('debate.loadPresetConfirm'))) {
      loadPreset(preset.rounds, preset.settings)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t('debate.deletePresetConfirm'))) {
      deletePreset(id)
      refresh()
    }
  }

  return (
    <div className="preset-manager">
      <p className="field-hint">{t('debate.presetsHint')}</p>

      <div className="preset-save-row">
        <input
          className="text-input"
          placeholder={t('debate.presetNamePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <button className="ctrl-btn ctrl-btn--primary ctrl-btn--sm" onClick={handleSave} disabled={!name.trim()}>
          <SaveIcon />
          {t('debate.savePreset')}
        </button>
      </div>

      {presets.length === 0 ? (
        <p className="empty-copy">{t('debate.noPresets')}</p>
      ) : (
        <ul className="preset-list">
          {presets.map((p) => (
            <li className="preset-row" key={p.id}>
              <div className="preset-row-info">
                <span className="preset-row-name">{p.name}</span>
                <span className="preset-row-meta">
                  {p.rounds.length} {p.rounds.length === 1 ? t('debate.round').toLowerCase() : t('debate.roundsPlural')} ·{' '}
                  {new Date(p.savedAt).toLocaleDateString(language === 'sk' ? 'sk-SK' : 'en-US')}
                </span>
              </div>
              <button className="icon-btn" title={t('debate.loadPreset')} onClick={() => handleLoad(p)}>
                <LoadIcon />
              </button>
              <button className="icon-btn icon-btn--danger" title={t('debate.deletePreset')} onClick={() => handleDelete(p.id)}>
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
