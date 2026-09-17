import { v4 as uuid } from 'uuid'
import type { PlaylistItem, RunState, Settings, TimerIQState, WarningThreshold } from './types'

export const DEFAULT_ACCENT = '#7c5cff'

export const defaultThresholds: WarningThreshold[] = [
  { id: uuid(), atMs: 5 * 60 * 1000, color: '#f5a623', label: '5 min left', pulse: false },
  { id: uuid(), atMs: 60 * 1000, color: '#ef4444', label: '1 min left', pulse: true },
]

export const defaultSettings: Settings = {
  language: 'en',
  visual: {
    theme: 'dark',
    accentColor: DEFAULT_ACCENT,
    fontFamily: 'inter',
    progressStyle: 'bar',
    showClock: true,
    clockFormat: '24h',
    logoDataUrl: null,
    logoPosition: 'top-right',
    backgroundStyle: 'gradient',
  },
  warningThresholds: defaultThresholds,
  breakDefaultMs: 10 * 60 * 1000,
}

export const defaultPlaylist: PlaylistItem[] = [
  { id: uuid(), type: 'timer', label: 'Opening keynote', durationMs: 15 * 60 * 1000 },
  { id: uuid(), type: 'break', label: 'Coffee break', durationMs: 10 * 60 * 1000 },
  { id: uuid(), type: 'timer', label: 'Panel discussion', durationMs: 20 * 60 * 1000 },
]

export const defaultRun: RunState = {
  phase: 'idle',
  currentIndex: 0,
  remainingMs: defaultPlaylist[0]?.durationMs ?? 0,
  endTimestamp: null,
}

export const defaultState: TimerIQState = {
  playlist: defaultPlaylist,
  settings: defaultSettings,
  run: defaultRun,
}
