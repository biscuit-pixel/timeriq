import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { defaultRounds, defaultDebateSettings, makeDebater, makeRound } from './defaults'
import { debateSyncChannel, DEBATE_SESSION_ID } from './channel'
import type { DebateRemoteAction, DebaterKind, DebateSettings, DebateState, Debater, DebateRunState, Round } from './types'
import type { WarningThreshold } from '../store/types'

const STORAGE_KEY = 'timeriq-debate-store-v2'
const LEGACY_STORAGE_KEY = 'timeriq-debate-store-v1'

interface Persisted {
  rounds: Round[]
  activeRoundId: string
  settings: DebateSettings
}

function withKindFallback(d: Omit<Debater, 'kind'> & { kind?: DebaterKind }): Debater {
  return { ...d, kind: d.kind ?? 'speaker' }
}

function migrateLegacy(): Persisted | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed.debaters?.length) return null
    const debaters: Debater[] = parsed.debaters.map(withKindFallback)
    const round = makeRound('Round 1', debaters)
    return {
      rounds: [round],
      activeRoundId: round.id,
      settings: { ...defaultDebateSettings, ...parsed.settings },
    }
  } catch {
    return null
  }
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.rounds?.length) {
        const rounds: Round[] = parsed.rounds.map((r: Round) => ({ ...r, debaters: r.debaters.map(withKindFallback) }))
        const activeRoundId = rounds.some((r) => r.id === parsed.activeRoundId) ? parsed.activeRoundId : rounds[0].id
        return { rounds, activeRoundId, settings: { ...defaultDebateSettings, ...parsed.settings } }
      }
    }
    const legacy = migrateLegacy()
    if (legacy) return legacy
  } catch {
    // fall through to defaults
  }
  const rounds = defaultRounds()
  return { rounds, activeRoundId: rounds[0].id, settings: defaultDebateSettings }
}

function savePersisted(state: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore — non-fatal, app still works in-memory
  }
}

const initial = loadPersisted()

interface DebateStore extends DebateState {
  isControlSource: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  reset: () => void
  selectIndex: (index: number) => void
  selectNext: () => void
  selectPrev: () => void
  tickCheck: () => void
  addDebater: (name: string, allottedMs: number, kind?: DebaterKind) => void
  updateDebater: (id: string, patch: Partial<Omit<Debater, 'id'>>) => void
  removeDebater: (id: string) => void
  resetDebater: (id: string) => void
  reorderDebater: (fromIndex: number, toIndex: number) => void
  applyRoundDuration: (allottedMs: number) => void
  addRound: (name: string) => void
  duplicateRound: (id: string) => void
  renameRound: (id: string, name: string) => void
  removeRound: (id: string) => void
  selectRound: (id: string) => void
  updateSettings: (patch: Partial<DebateSettings>) => void
  addThreshold: (t: Omit<WarningThreshold, 'id'>) => void
  updateThreshold: (id: string, patch: Partial<WarningThreshold>) => void
  removeThreshold: (id: string) => void
  applyRemoteState: (state: DebateState) => void
  requestSync: () => void
}

function broadcastState(get: () => DebateStore) {
  const s = get()
  debateSyncChannel.send({
    kind: 'state',
    senderId: DEBATE_SESSION_ID,
    state: { rounds: s.rounds, activeRoundId: s.activeRoundId, settings: s.settings },
  })
}

function persist(get: () => DebateStore) {
  const s = get()
  savePersisted({ rounds: s.rounds, activeRoundId: s.activeRoundId, settings: s.settings })
}

function activeRoundOf(s: Pick<DebateState, 'rounds' | 'activeRoundId'>): Round {
  return s.rounds.find((r) => r.id === s.activeRoundId) ?? s.rounds[0]
}

/** Replace the active round's data, leaving every other round untouched. */
function withActiveRound(s: DebateState, patch: Partial<Omit<Round, 'id'>>): Round[] {
  const activeId = activeRoundOf(s).id
  return s.rounds.map((r) => (r.id === activeId ? { ...r, ...patch } : r))
}

/** Bank a round's live countdown back into its active debater's `remainingMs`, and pause it. */
function bankRound(round: Round): Round {
  const active = round.debaters[round.run.activeIndex]
  if (!active) return round
  const liveMs =
    round.run.phase === 'running' && round.run.endTimestamp !== null
      ? Math.max(0, round.run.endTimestamp - Date.now())
      : round.run.remainingMs
  const debaters = round.debaters.map((d, i) => (i === round.run.activeIndex ? { ...d, remainingMs: liveMs } : d))
  return { ...round, debaters, run: { ...round.run, phase: round.run.phase === 'running' ? 'paused' : round.run.phase, endTimestamp: null, remainingMs: liveMs } }
}

/** Bank the active debater's live countdown back into their `remainingMs` before switching or mutating the list. */
function bankActive(debaters: Debater[], run: DebateRunState): Debater[] {
  const active = debaters[run.activeIndex]
  if (!active) return debaters
  const liveMs = run.phase === 'running' && run.endTimestamp !== null ? Math.max(0, run.endTimestamp - Date.now()) : run.remainingMs
  return debaters.map((d, i) => (i === run.activeIndex ? { ...d, remainingMs: liveMs } : d))
}

export const useDebateStore = create<DebateStore>((set, get) => ({
  rounds: initial.rounds,
  activeRoundId: initial.activeRoundId,
  settings: initial.settings,
  isControlSource: true,

  play: () => {
    const s = get()
    const round = activeRoundOf(s)
    const active = round.debaters[round.run.activeIndex]
    if (!active) return
    const run: DebateRunState = { ...round.run, phase: 'running', endTimestamp: Date.now() + round.run.remainingMs }
    set({ rounds: withActiveRound(s, { run }) })
    broadcastState(get)
  },

  pause: () => {
    const s = get()
    const round = activeRoundOf(s)
    if (round.run.phase !== 'running' || round.run.endTimestamp === null) return
    const remainingMs = Math.max(0, round.run.endTimestamp - Date.now())
    const run: DebateRunState = { ...round.run, phase: 'paused', endTimestamp: null, remainingMs }
    set({ rounds: withActiveRound(s, { run }) })
    persist(get)
    broadcastState(get)
  },

  toggle: () => {
    const round = activeRoundOf(get())
    if (round.run.phase === 'running') get().pause()
    else get().play()
  },

  reset: () => {
    const s = get()
    const round = activeRoundOf(s)
    const active = round.debaters[round.run.activeIndex]
    if (!active) return
    const run: DebateRunState = { ...round.run, phase: 'idle', endTimestamp: null, remainingMs: active.allottedMs }
    set({ rounds: withActiveRound(s, { run }) })
    persist(get)
    broadcastState(get)
  },

  selectIndex: (index) => {
    const s = get()
    const round = activeRoundOf(s)
    const target = round.debaters[index]
    if (!target || index === round.run.activeIndex) return
    const debaters = bankActive(round.debaters, round.run)
    const bankedTarget = debaters[index]
    const run: DebateRunState = { activeIndex: index, phase: 'idle', endTimestamp: null, remainingMs: bankedTarget.remainingMs }
    set({ rounds: withActiveRound(s, { debaters, run }) })
    persist(get)
    broadcastState(get)
  },

  selectNext: () => {
    const round = activeRoundOf(get())
    get().selectIndex((round.run.activeIndex + 1) % round.debaters.length)
  },

  selectPrev: () => {
    const round = activeRoundOf(get())
    get().selectIndex((round.run.activeIndex - 1 + round.debaters.length) % round.debaters.length)
  },

  tickCheck: () => {
    const s = get()
    const round = activeRoundOf(s)
    if (round.run.phase !== 'running' || round.run.endTimestamp === null) return
    if (Date.now() < round.run.endTimestamp) return
    const debaters = bankActive(round.debaters, { ...round.run, remainingMs: 0 })
    const run: DebateRunState = { ...round.run, phase: 'paused', endTimestamp: null, remainingMs: 0 }
    set({ rounds: withActiveRound(s, { debaters, run }) })
    persist(get)
    broadcastState(get)
  },

  addDebater: (name, allottedMs, kind = 'speaker') => {
    const s = get()
    const round = activeRoundOf(s)
    const debater = makeDebater(name, allottedMs, kind)
    const wasEmpty = round.debaters.length === 0
    const run = wasEmpty ? { ...round.run, activeIndex: 0, remainingMs: debater.remainingMs } : round.run
    set({ rounds: withActiveRound(s, { debaters: [...round.debaters, debater], run }) })
    persist(get)
    broadcastState(get)
  },

  updateDebater: (id, patch) => {
    const s = get()
    const round = activeRoundOf(s)
    const activeId = round.debaters[round.run.activeIndex]?.id
    const debaters = round.debaters.map((d) => (d.id === id ? { ...d, ...patch } : d))
    let run = round.run
    if (activeId === id && round.run.phase === 'idle' && patch.allottedMs !== undefined) {
      run = { ...round.run, remainingMs: patch.allottedMs }
    }
    set({ rounds: withActiveRound(s, { debaters, run }) })
    persist(get)
    broadcastState(get)
  },

  removeDebater: (id) => {
    const s = get()
    const round = activeRoundOf(s)
    const removedIndex = round.debaters.findIndex((d) => d.id === id)
    if (removedIndex === -1) return
    const debaters = round.debaters.filter((d) => d.id !== id)
    let { activeIndex } = round.run
    if (removedIndex <= activeIndex) activeIndex = Math.max(0, activeIndex - (removedIndex === activeIndex ? 0 : 1))
    activeIndex = Math.min(activeIndex, Math.max(0, debaters.length - 1))
    const active = debaters[activeIndex]
    const run: DebateRunState = { activeIndex, phase: 'idle', endTimestamp: null, remainingMs: active?.remainingMs ?? 0 }
    set({ rounds: withActiveRound(s, { debaters, run }) })
    persist(get)
    broadcastState(get)
  },

  resetDebater: (id) => {
    const s = get()
    const round = activeRoundOf(s)
    const index = round.debaters.findIndex((d) => d.id === id)
    if (index === -1) return
    if (index === round.run.activeIndex) {
      get().reset()
      return
    }
    const debaters = round.debaters.map((d) => (d.id === id ? { ...d, remainingMs: d.allottedMs } : d))
    set({ rounds: withActiveRound(s, { debaters }) })
    persist(get)
    broadcastState(get)
  },

  reorderDebater: (fromIndex, toIndex) => {
    const s = get()
    const round = activeRoundOf(s)
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= round.debaters.length) return
    const debaters = [...round.debaters]
    const [moved] = debaters.splice(fromIndex, 1)
    debaters.splice(toIndex, 0, moved)
    let { activeIndex } = round.run
    if (activeIndex === fromIndex) activeIndex = toIndex
    else if (fromIndex < activeIndex && toIndex >= activeIndex) activeIndex -= 1
    else if (fromIndex > activeIndex && toIndex <= activeIndex) activeIndex += 1
    set({ rounds: withActiveRound(s, { debaters, run: { ...round.run, activeIndex } }) })
    persist(get)
    broadcastState(get)
  },

  /** Sets every participant's allotted time in the active round at once (e.g. "10 min per person"). */
  applyRoundDuration: (allottedMs) => {
    const s = get()
    const round = activeRoundOf(s)
    const debaters = round.debaters.map((d) => ({ ...d, allottedMs, remainingMs: d.allottedMs === d.remainingMs ? allottedMs : d.remainingMs }))
    const active = debaters[round.run.activeIndex]
    const run: DebateRunState =
      round.run.phase === 'idle' && active ? { ...round.run, remainingMs: active.remainingMs } : round.run
    set({ rounds: withActiveRound(s, { debaters, run }) })
    persist(get)
    broadcastState(get)
  },

  addRound: (name) => {
    const s = get()
    const banked = bankRound(activeRoundOf(s))
    const rounds = s.rounds.map((r) => (r.id === banked.id ? banked : r))
    const round = makeRound(name)
    set({ rounds: [...rounds, round], activeRoundId: round.id })
    persist(get)
    broadcastState(get)
  },

  duplicateRound: (id) => {
    const s = get()
    const source = s.rounds.find((r) => r.id === id)
    if (!source) return
    const banked = bankRound(activeRoundOf(s))
    const rounds = s.rounds.map((r) => (r.id === banked.id ? banked : r))
    const debaters = source.debaters.map((d) => ({ ...d, id: uuid(), remainingMs: d.allottedMs }))
    const round = makeRound(`${source.name} (copy)`, debaters)
    set({ rounds: [...rounds, round], activeRoundId: round.id })
    persist(get)
    broadcastState(get)
  },

  renameRound: (id, name) => {
    const s = get()
    set({ rounds: s.rounds.map((r) => (r.id === id ? { ...r, name } : r)) })
    persist(get)
    broadcastState(get)
  },

  removeRound: (id) => {
    const s = get()
    if (s.rounds.length <= 1) return
    const rounds = s.rounds.filter((r) => r.id !== id)
    const activeRoundId = s.activeRoundId === id ? rounds[0].id : s.activeRoundId
    set({ rounds, activeRoundId })
    persist(get)
    broadcastState(get)
  },

  selectRound: (id) => {
    const s = get()
    if (id === s.activeRoundId) return
    if (!s.rounds.some((r) => r.id === id)) return
    const banked = bankRound(activeRoundOf(s))
    const rounds = s.rounds.map((r) => (r.id === banked.id ? banked : r))
    set({ rounds, activeRoundId: id })
    persist(get)
    broadcastState(get)
  },

  updateSettings: (patch) => {
    set({ settings: { ...get().settings, ...patch } })
    persist(get)
    broadcastState(get)
  },

  addThreshold: (t) => {
    const s = get()
    const thresholds = [...s.settings.warningThresholds, { ...t, id: uuid() }].sort((a, b) => a.atMs - b.atMs)
    set({ settings: { ...s.settings, warningThresholds: thresholds } })
    persist(get)
    broadcastState(get)
  },

  updateThreshold: (id, patch) => {
    const s = get()
    const thresholds = s.settings.warningThresholds
      .map((th) => (th.id === id ? { ...th, ...patch } : th))
      .sort((a, b) => a.atMs - b.atMs)
    set({ settings: { ...s.settings, warningThresholds: thresholds } })
    persist(get)
    broadcastState(get)
  },

  removeThreshold: (id) => {
    const s = get()
    const thresholds = s.settings.warningThresholds.filter((th) => th.id !== id)
    set({ settings: { ...s.settings, warningThresholds: thresholds } })
    persist(get)
    broadcastState(get)
  },

  applyRemoteState: (state) => {
    set({ ...state, isControlSource: false })
  },

  requestSync: () => {
    debateSyncChannel.send({ kind: 'request-state', senderId: DEBATE_SESSION_ID })
  },
}))

export function useActiveRound(): Round {
  return useDebateStore((s) => s.rounds.find((r) => r.id === s.activeRoundId) ?? s.rounds[0])
}

debateSyncChannel.subscribe((msg) => {
  if (msg.senderId === DEBATE_SESSION_ID) return
  if (msg.kind === 'state') {
    useDebateStore.getState().applyRemoteState(msg.state)
  } else if (msg.kind === 'request-state') {
    if (useDebateStore.getState().isControlSource) broadcastState(useDebateStore.getState)
  } else if (msg.kind === 'action') {
    if (useDebateStore.getState().isControlSource) applyRemoteAction(msg.action)
  }
})

function applyRemoteAction(action: DebateRemoteAction) {
  const store = useDebateStore.getState()
  if (action.type === 'toggle') store.toggle()
  else if (action.type === 'reset') store.reset()
  else if (action.type === 'next') store.selectNext()
  else if (action.type === 'prev') store.selectPrev()
}

export function sendDebateRemoteAction(action: DebateRemoteAction) {
  debateSyncChannel.send({ kind: 'action', action, senderId: DEBATE_SESSION_ID })
}
