import type { WarningThreshold } from '../store/types'

export interface Debater {
  id: string
  name: string
  photoDataUrl: string | null
  allottedMs: number
  /** Banked remaining time. Authoritative except while this debater is active and running. */
  remainingMs: number
}

export type DebateRunPhase = 'idle' | 'running' | 'paused'

export interface DebateRunState {
  activeIndex: number
  phase: DebateRunPhase
  remainingMs: number
  endTimestamp: number | null
}

export interface DebateSettings {
  discussionName: string
  logoDataUrl: string | null
  logoScale: number
  logoPosition: 'top-left' | 'top-right' | 'center'
  warningThresholds: WarningThreshold[]
}

export interface DebateState {
  debaters: Debater[]
  run: DebateRunState
  settings: DebateSettings
}

export type DebateSyncMessage =
  | { kind: 'state'; state: DebateState; senderId: string }
  | { kind: 'request-state'; senderId: string }
  | { kind: 'action'; action: DebateRemoteAction; senderId: string }

export type DebateRemoteAction =
  | { type: 'toggle' }
  | { type: 'reset' }
  | { type: 'next' }
  | { type: 'prev' }
