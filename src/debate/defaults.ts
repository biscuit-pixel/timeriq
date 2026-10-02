import { v4 as uuid } from 'uuid'
import type { DebateSettings, DebateState, Debater } from './types'

export const defaultDebaters: Debater[] = [
  { id: uuid(), name: 'Speaker A', photoDataUrl: null, allottedMs: 5 * 60 * 1000, remainingMs: 5 * 60 * 1000 },
  { id: uuid(), name: 'Speaker B', photoDataUrl: null, allottedMs: 5 * 60 * 1000, remainingMs: 5 * 60 * 1000 },
]

export const defaultDebateSettings: DebateSettings = {
  discussionName: '',
  logoDataUrl: null,
  logoScale: 1,
  logoPosition: 'top-left',
  warningThresholds: [
    { id: uuid(), atMs: 60 * 1000, color: '#f5a623', label: '1 min left', pulse: false },
    { id: uuid(), atMs: 0, color: '#ef4444', label: "Time's up", pulse: true },
  ],
}

export const defaultDebateState: DebateState = {
  debaters: defaultDebaters,
  settings: defaultDebateSettings,
  run: {
    activeIndex: 0,
    phase: 'idle',
    remainingMs: defaultDebaters[0]?.remainingMs ?? 0,
    endTimestamp: null,
  },
}
