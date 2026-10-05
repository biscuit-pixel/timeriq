import type { WarningThreshold } from '../store/types'

export type DebaterKind = 'speaker' | 'question'

export interface Debater {
  id: string
  name: string
  photoDataUrl: string | null
  allottedMs: number
  /** Banked remaining time. Authoritative except while this debater is active and running. */
  remainingMs: number
  /** 'question' marks a reusable host Q&A slot, shown with its own badge and a one-click reset. */
  kind: DebaterKind
}

export type DebateRunPhase = 'idle' | 'running' | 'paused'

export interface DebateRunState {
  activeIndex: number
  phase: DebateRunPhase
  remainingMs: number
  endTimestamp: number | null
}

/**
 * A self-contained segment of the debate (e.g. "Opening statements", "Rapid fire") with its own
 * roster, per-person time budgets, and running state. Switching the active round never touches
 * another round's data — a round picks up exactly where it was left.
 */
export interface Round {
  id: string
  name: string
  debaters: Debater[]
  run: DebateRunState
}

export interface DebateSettings {
  discussionName: string
  logoDataUrl: string | null
  logoScale: number
  logoPosition: 'top-left' | 'top-right' | 'center'
  warningThresholds: WarningThreshold[]
}

export interface DebateState {
  rounds: Round[]
  activeRoundId: string
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
