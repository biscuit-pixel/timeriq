import { useState } from 'react'
import { useTranslation } from '../i18n/useTranslation'

const TARGETS = [
  { id: 'output-timer', path: '/output', role: 'viewer', labelKey: 'session.targetOutputTimer' },
  { id: 'output-debate', path: '/debate/output', role: 'viewer', labelKey: 'session.targetOutputDebate' },
  { id: 'control-timer', path: '/', role: 'control', labelKey: 'session.targetControlTimer' },
  { id: 'control-debate', path: '/debate', role: 'control', labelKey: 'session.targetControlDebate' },
] as const

/** Enter the code shown on the host PC, then open the screen you want on this computer. */
export function JoinPage() {
  const { t } = useTranslation()
  const [code, setCode] = useState('')
  const [targetId, setTargetId] = useState<(typeof TARGETS)[number]['id']>('output-timer')

  const normalized = code.trim().toUpperCase()
  const target = TARGETS.find((x) => x.id === targetId)!

  const join = () => {
    if (!normalized) return
    window.location.href = `${target.path}?s=${encodeURIComponent(normalized)}&role=${target.role}`
  }

  return (
    <div className="app-shell" data-theme="dark">
      <header className="app-header">
        <div className="app-brand">
          <img src="/icon.svg" alt="" className="app-brand-mark" />
          <h1>{t('appName')}</h1>
        </div>
        <a className="ctrl-btn ctrl-btn--ghost ctrl-btn--sm" href="/">
          ← {t('session.backToControl')}
        </a>
      </header>

      <main className="join-main">
        <section className="panel join-panel">
          <div className="panel-header">
            <h2>{t('session.joinTitle')}</h2>
          </div>
          <p className="field-hint">{t('session.joinHint')}</p>

          <div className="field field--wide">
            <label>{t('session.codeLabel')}</label>
            <input
              className="text-input join-code-input"
              value={code}
              placeholder="ABC123"
              maxLength={12}
              autoFocus
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && join()}
            />
          </div>

          <div className="field field--wide">
            <label>{t('session.useThisPcAs')}</label>
            <div className="join-target-grid">
              {TARGETS.map((x) => (
                <button
                  key={x.id}
                  className={`join-target ${targetId === x.id ? 'join-target--active' : ''}`}
                  onClick={() => setTargetId(x.id)}
                >
                  {t(x.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-footer">
            <button className="ctrl-btn ctrl-btn--primary" onClick={join} disabled={!normalized}>
              {t('session.join')}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
