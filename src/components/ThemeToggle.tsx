import { useTimerStore } from '../store/timerStore'

const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 4V2m0 20v-2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4M5.6 18.4 4.2 19.8M18.4 5.6l1.4-1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" /></svg>
)
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20.7 15.2A8.5 8.5 0 1 1 8.8 3.3a7 7 0 0 0 11.9 11.9z" /></svg>
)

export function ThemeToggle() {
  const theme = useTimerStore((s) => s.settings.visual.theme)
  const updateVisual = useTimerStore((s) => s.updateVisual)
  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button className="icon-toggle" onClick={() => updateVisual({ theme: next })} title="Toggle theme" aria-label="Toggle theme">
      {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}
