import { useTranslation } from '../i18n/useTranslation'
import { useTimerStore } from '../store/timerStore'
import { useDebateStore, useActiveRound } from '../debate/store'
import { useDebateAutoStop } from '../hooks/useDebateAutoStop'
import { useDebateKeyboardShortcuts } from '../hooks/useDebateKeyboardShortcuts'
import { useLiveRemaining } from '../hooks/useLiveRemaining'
import { DebateControlBar } from '../components/debate/DebateControlBar'
import { DebateOutputLauncher } from '../components/debate/DebateOutputLauncher'
import { DebaterList } from '../components/debate/DebaterList'
import { DebateSettingsPanel } from '../components/debate/DebateSettingsPanel'
import { DebateStage } from '../components/debate/DebateStage'
import { RoundTabs } from '../components/debate/RoundTabs'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { ThemeToggle } from '../components/ThemeToggle'
import { TopNav } from '../components/TopNav'
import { SessionPanel } from '../components/SessionPanel'

export function DebateControlPage() {
  const { t } = useTranslation()
  useDebateAutoStop()
  useDebateKeyboardShortcuts(true)

  const visual = useTimerStore((s) => s.settings.visual)
  const round = useActiveRound()
  const settings = useDebateStore((s) => s.settings)
  const activeRemainingMs = useLiveRemaining(round.run)

  return (
    <div className="app-shell" data-theme={visual.theme}>
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

      <div className="round-tabs-row">
        <RoundTabs />
      </div>

      <main className="app-main">
        <div className="preview-column">
          <div className="preview-frame">
            <DebateStage
              debaters={round.debaters}
              activeIndex={round.run.activeIndex}
              activeRemainingMs={activeRemainingMs}
              phase={round.run.phase}
              roundName={round.name}
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
