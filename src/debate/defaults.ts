import { v4 as uuid } from 'uuid'
import type { DebateSettings, Debater, DebateRunState, Round } from './types'

export const defaultQuestionDurationMs = 2 * 60 * 1000

export function makeDebater(name: string, allottedMs: number, kind: Debater['kind'] = 'speaker'): Debater {
  return { id: uuid(), name, photoDataUrl: null, allottedMs, remainingMs: allottedMs, kind }
}

export function makeRunState(debaters: Debater[]): DebateRunState {
  return { activeIndex: 0, phase: 'idle', remainingMs: debaters[0]?.remainingMs ?? 0, endTimestamp: null }
}

export function makeRound(name: string, debaters: Debater[] = []): Round {
  return { id: uuid(), name, debaters, run: makeRunState(debaters) }
}

export function defaultRounds(): Round[] {
  const debaters = [makeDebater('Speaker A', 5 * 60 * 1000), makeDebater('Speaker B', 5 * 60 * 1000)]
  return [makeRound('Round 1', debaters)]
}

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
