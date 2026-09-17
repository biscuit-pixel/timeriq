export type Language = 'en' | 'sk'
export type Theme = 'dark' | 'light'
export type ClockFormat = '24h' | '12h'
export type ProgressStyle = 'bar' | 'ring' | 'both'
export type ItemType = 'timer' | 'break'

export interface PlaylistItem {
  id: string
  type: ItemType
  label: string
  durationMs: number
}

/** A moment before the end of an item at which the display should change color / warn the speaker. */
export interface WarningThreshold {
  id: string
  /** Remaining time (ms) at which this threshold becomes active. */
  atMs: number
  color: string
  label: string
  /** Whether the output screen should pulse/flash when this threshold first triggers. */
  pulse: boolean
}

export interface VisualSettings {
  theme: Theme
  accentColor: string
  fontFamily: 'inter' | 'mono'
  progressStyle: ProgressStyle
  showClock: boolean
  clockFormat: ClockFormat
  logoDataUrl: string | null
  logoPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  backgroundStyle: 'solid' | 'gradient'
}

export interface Settings {
  language: Language
  visual: VisualSettings
  warningThresholds: WarningThreshold[]
  breakDefaultMs: number
}

export type RunPhase = 'idle' | 'running' | 'paused' | 'finished'

export interface RunState {
  phase: RunPhase
  currentIndex: number
  /** ms remaining, authoritative whenever phase !== 'running' */
  remainingMs: number
  /** wall-clock timestamp (ms) at which the timer will hit 0, set only while running */
  endTimestamp: number | null
}

export interface TimerIQState {
  playlist: PlaylistItem[]
  settings: Settings
  run: RunState
}

export type SyncMessage =
  | { kind: 'state'; state: TimerIQState; senderId: string }
  | { kind: 'request-state'; senderId: string }
  | { kind: 'action'; action: RemoteAction; senderId: string }

export type RemoteAction =
  | { type: 'toggle' }
  | { type: 'reset' }
  | { type: 'next' }
  | { type: 'prev' }
