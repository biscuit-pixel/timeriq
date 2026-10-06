import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'
import { useAutoAdvance } from '../hooks/useAutoAdvance'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useLiveRemaining } from '../hooks/useLiveRemaining'
import { useActiveItems } from '../hooks/useActiveItems'
import { SingleTimerPanel } from '../components/SingleTimerPanel'
import { ControlBar } from '../components/ControlBar'
import { OutputLauncher } from '../components/OutputLauncher'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { ThemeToggle } from '../components/ThemeToggle'
import { PlaylistEditor } from '../components/PlaylistEditor'
import { SettingsPanel } from '../components/SettingsPanel'
import { TimerDisplay } from '../components/TimerDisplay'
import { TopNav } from '../components/TopNav'
import { SessionPanel } from '../components/SessionPanel'

export function ControlPage() {
  const { t } = useTranslation()
  useAutoAdvance()
  useKeyboardShortcuts(true)

  const run = useTimerStore((s) => s.run)
  const settings = useTimerStore((s) => s.settings)
  const remainingMs = useLiveRemaining(run)
  const { item, nextItem } = useActiveItems()

  return (
    <div className="app-shell" data-theme={settings.visual.theme}>
      <header className="app-header">
        <div className="app-brand">
          <img src="/icon.svg" alt="" className="app-brand-mark" />
          <h1>{t('appName')}</h1>
        </div>
        <TopNav />
        <div className="app-header-actions">
          <SessionPanel />
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
          {settings.playlistEnabled ? <PlaylistEditor /> : <SingleTimerPanel />}
          <SettingsPanel />
        </div>
      </main>

      <footer className="app-footer">{t('footer.madeBy')}</footer>
    </div>
  )
}
