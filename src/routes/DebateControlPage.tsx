import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'
import { useDebateStore } from '../debate/store'
import { useDebateAutoStop } from '../hooks/useDebateAutoStop'
import { useDebateKeyboardShortcuts } from '../hooks/useDebateKeyboardShortcuts'
import { useLiveRemaining } from '../hooks/useLiveRemaining'
import { DebateControlBar } from '../components/debate/DebateControlBar'
import { DebateOutputLauncher } from '../components/debate/DebateOutputLauncher'
import { DebaterList } from '../components/debate/DebaterList'
import { DebateSettingsPanel } from '../components/debate/DebateSettingsPanel'
import { DebateStage } from '../components/debate/DebateStage'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { ThemeToggle } from '../components/ThemeToggle'
import { TopNav } from '../components/TopNav'

export function DebateControlPage() {
  const { t } = useTranslation()
  useDebateAutoStop()
  useDebateKeyboardShortcuts(true)

  const visual = useTimerStore((s) => s.settings.visual)
  const debaters = useDebateStore((s) => s.debaters)
  const run = useDebateStore((s) => s.run)
  const settings = useDebateStore((s) => s.settings)
  const activeRemainingMs = useLiveRemaining(run)

  return (
    <div className="app-shell" data-theme={visual.theme}>
      <header className="app-header">
        <div className="app-brand">
          <img src="/icon.svg" alt="" className="app-brand-mark" />
          <h1>{t('appName')}</h1>
        </div>
        <TopNav />
        <div className="app-header-actions">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="app-main">
        <div className="preview-column">
          <div className="preview-frame">
            <DebateStage
              debaters={debaters}
              activeIndex={run.activeIndex}
              activeRemainingMs={activeRemainingMs}
              phase={run.phase}
              settings={settings}
              visual={visual}
              variant="preview"
            />
          </div>
          <DebateControlBar />
          <DebateOutputLauncher />
        </div>

        <div className="side-column">
          <DebaterList />
          <DebateSettingsPanel />
        </div>
      </main>

      <footer className="app-footer">{t('footer.madeBy')}</footer>
    </div>
  )
}
