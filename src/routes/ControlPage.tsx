import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'
import { useAutoAdvance } from '../hooks/useAutoAdvance'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useLiveRemaining } from '../hooks/useLiveRemaining'
import { ControlBar } from '../components/ControlBar'
import { OutputLauncher } from '../components/OutputLauncher'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { ThemeToggle } from '../components/ThemeToggle'
import { PlaylistEditor } from '../components/PlaylistEditor'
import { SettingsPanel } from '../components/SettingsPanel'
import { TimerDisplay } from '../components/TimerDisplay'

export function ControlPage() {
  const { t } = useTranslation()
  useAutoAdvance()
  useKeyboardShortcuts(true)

  const playlist = useTimerStore((s) => s.playlist)
  const run = useTimerStore((s) => s.run)
  const settings = useTimerStore((s) => s.settings)
  const remainingMs = useLiveRemaining(run)

  const item = playlist[run.currentIndex] ?? null
  const nextItem = playlist[run.currentIndex + 1] ?? null

  return (
    <div className="app-shell" data-theme={settings.visual.theme}>
      <header className="app-header">
        <div className="app-brand">
          <img src="/icon.svg" alt="" className="app-brand-mark" />
          <div>
            <h1>{t('appName')}</h1>
            <p>{t('tagline')}</p>
          </div>
        </div>
        <div className="app-header-actions">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="app-main">
        <div className="preview-column">
          <div className="preview-frame">
            <TimerDisplay item={item} nextItem={nextItem} remainingMs={remainingMs} phase={run.phase} settings={settings} variant="preview" />
          </div>
          <ControlBar />
          <OutputLauncher />
        </div>

        <div className="side-column">
          <PlaylistEditor />
          <SettingsPanel />
        </div>
      </main>

      <footer className="app-footer">{t('footer.madeBy')}</footer>
    </div>
  )
}
