import { useState } from 'react'
import { useTranslation } from '../i18n/useTranslation'

const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-6v2h3v2H7v-2h3v-2H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v9h14V6H5z" />
  </svg>
)

// Chromium-only experimental API; feature-detected, never required.
interface ScreenDetailed {
  availLeft: number
  availTop: number
  availWidth: number
  availHeight: number
  isPrimary: boolean
}
interface ScreenDetails {
  screens: ScreenDetailed[]
}
declare global {
  interface Window {
    getScreenDetails?: () => Promise<ScreenDetails>
  }
}

export function OutputLauncher() {
  const { t } = useTranslation()
  const [multiScreenSupported] = useState(() => typeof window.getScreenDetails === 'function')

  const openPlain = () => {
    window.open('/output', 'timeriq-output', 'width=1280,height=720,menubar=no,toolbar=no,location=no')
  }

  const openOnSecondScreen = async () => {
    if (!window.getScreenDetails) return openPlain()
    try {
      const details = await window.getScreenDetails()
      const secondary = details.screens.find((s) => !s.isPrimary) ?? details.screens[0]
      const win = window.open(
        '/output',
        'timeriq-output',
        `left=${secondary.availLeft},top=${secondary.availTop},width=${secondary.availWidth},height=${secondary.availHeight},menubar=no,toolbar=no,location=no`,
      )
      win?.addEventListener('load', () => {
        win.document.documentElement.requestFullscreen?.().catch(() => {})
      })
    } catch {
      openPlain()
    }
  }

  return (
    <div className="output-launcher">
      <button className="ctrl-btn ctrl-btn--ghost" onClick={openPlain}>
        <MonitorIcon />
        <span>{t('control.openOutput')}</span>
      </button>
      {multiScreenSupported && (
        <button className="ctrl-btn ctrl-btn--ghost" onClick={openOnSecondScreen}>
          <MonitorIcon />
          <span>{t('control.openOutputSecondScreen')}</span>
        </button>
      )}
    </div>
  )
}
