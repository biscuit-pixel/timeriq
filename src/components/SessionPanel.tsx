import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import { useSessionStore, startHosting, leaveSession } from '../session/session'

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
)

export function SessionPanel() {
  const { t } = useTranslation()
  const { code, role, status } = useSessionStore()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const active = status === 'connected' || status === 'connecting'

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const copyCode = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — the code is still visible to type manually
    }
  }

  const statusLabel = {
    idle: t('session.statusIdle'),
    connecting: t('session.statusConnecting'),
    connected: t('session.statusConnected'),
    disconnected: t('session.statusDisconnected'),
    rejected: t('session.statusRejected'),
  }[status]

  const roleLabel = role === 'host' ? t('session.roleHost') : role === 'control' ? t('session.roleControl') : role === 'viewer' ? t('session.roleViewer') : ''

  return (
    <div className="session-root" ref={rootRef}>
      <button className={`ctrl-btn ctrl-btn--ghost ctrl-btn--sm session-trigger ${active ? 'session-trigger--live' : ''}`} onClick={() => setOpen((o) => !o)}>
        <LinkIcon />
        <span>{active && code ? code : t('session.button')}</span>
      </button>

      {open && (
        <div className="session-popover">
          <div className="session-popover-header">
            <h3>{t('session.title')}</h3>
            <span className={`session-status session-status--${status}`}>{statusLabel}</span>
          </div>

          {active && code ? (
            <>
              <p className="field-hint">{roleLabel}</p>
              <button className="session-code" onClick={copyCode} title={t('session.copyCode')}>
                {code}
                <span className="session-code-hint">{copied ? t('session.copied') : t('session.copyCode')}</span>
              </button>
              {role === 'host' && <p className="field-hint">{t('session.hostHint')}</p>}
              <button className="ctrl-btn ctrl-btn--danger ctrl-btn--sm" onClick={leaveSession}>
                {role === 'host' ? t('session.stop') : t('session.leave')}
              </button>
            </>
          ) : (
            <>
              <p className="field-hint">{t('session.intro')}</p>
              <button className="ctrl-btn ctrl-btn--primary ctrl-btn--sm" onClick={startHosting}>
                {t('session.start')}
              </button>
              <a className="session-join-link" href="/join">
                {t('session.joinLink')} →
              </a>
            </>
          )}
        </div>
      )}
    </div>
  )
}
