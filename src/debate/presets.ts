import { v4 as uuid } from 'uuid'
import { makeRunState } from './defaults'
import type { DebatePreset, DebateSettings, Round } from './types'

const PRESETS_KEY = 'timeriq-debate-presets-v1'

export function listPresets(): DebatePreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.savedAt - a.savedAt) : []
  } catch {
    return []
  }
}

function saveAll(presets: DebatePreset[]) {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
  } catch {
    // ignore — non-fatal, localStorage may be full or unavailable
  }
}

/** Presets are reusable templates: every debater's clock is reset to idle/full so loading one never resumes a stale countdown. */
function freshenRound(round: Round): Round {
  const debaters = round.debaters.map((d) => ({ ...d, remainingMs: d.allottedMs }))
  return { ...round, debaters, run: makeRunState(debaters) }
}

export function savePreset(name: string, rounds: Round[], settings: DebateSettings): DebatePreset {
  const preset: DebatePreset = {
    id: uuid(),
    name,
    savedAt: Date.now(),
    rounds: rounds.map(freshenRound),
    settings,
  }
  saveAll([...listPresets(), preset])
  return preset
}

export function deletePreset(id: string) {
  saveAll(listPresets().filter((p) => p.id !== id))
}
