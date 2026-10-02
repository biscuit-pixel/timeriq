import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { defaultDebaters, defaultDebateSettings } from './defaults'
import { debateSyncChannel, DEBATE_SESSION_ID } from './channel'
import type { DebateRemoteAction, DebateSettings, DebateState, Debater, DebateRunState } from './types'
import type { WarningThreshold } from '../store/types'

const STORAGE_KEY = 'timeriq-debate-store-v1'

interface Persisted {
  debaters: Debater[]
  settings: DebateSettings
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { debaters: defaultDebaters, settings: defaultDebateSettings }
    const parsed = JSON.parse(raw)
    return {
      debaters: parsed.debaters?.length ? parsed.debaters : defaultDebaters,
      settings: { ...defaultDebateSettings, ...parsed.settings },
    }
  } catch {
    return { debaters: defaultDebaters, settings: defaultDebateSettings }
  }
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
  addDebater: (name: string, allottedMs: number) => void
  updateDebater: (id: string, patch: Partial<Omit<Debater, 'id'>>) => void
  removeDebater: (id: string) => void
  reorderDebater: (fromIndex: number, toIndex: number) => void
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
    state: { debaters: s.debaters, settings: s.settings, run: s.run },
  })
}

function persist(get: () => DebateStore) {
  const s = get()
  savePersisted({ debaters: s.debaters, settings: s.settings })
}

/** Bank the active debater's live countdown back into their `remainingMs` before switching or mutating the list. */
function bankActive(debaters: Debater[], run: DebateRunState): Debater[] {
  const active = debaters[run.activeIndex]
  if (!active) return debaters
  const liveMs = run.phase === 'running' && run.endTimestamp !== null ? Math.max(0, run.endTimestamp - Date.now()) : run.remainingMs
  return debaters.map((d, i) => (i === run.activeIndex ? { ...d, remainingMs: liveMs } : d))
}

export const useDebateStore = create<DebateStore>((set, get) => ({
  debaters: initial.debaters,
  settings: initial.settings,
  run: {
    activeIndex: 0,
    phase: 'idle',
    remainingMs: initial.debaters[0]?.remainingMs ?? 0,
    endTimestamp: null,
  },
  isControlSource: true,

  play: () => {
    const s = get()
    const active = s.debaters[s.run.activeIndex]
    if (!active) return
    set({ run: { ...s.run, phase: 'running', endTimestamp: Date.now() + s.run.remainingMs } })
    broadcastState(get)
  },

  pause: () => {
    const s = get()
    if (s.run.phase !== 'running' || s.run.endTimestamp === null) return
    const remainingMs = Math.max(0, s.run.endTimestamp - Date.now())
    set({ run: { ...s.run, phase: 'paused', endTimestamp: null, remainingMs } })
    persist(get)
    broadcastState(get)
  },

  toggle: () => {
    const s = get()
    if (s.run.phase === 'running') get().pause()
    else get().play()
  },

  reset: () => {
    const s = get()
    const active = s.debaters[s.run.activeIndex]
    if (!active) return
    set({ run: { ...s.run, phase: 'idle', endTimestamp: null, remainingMs: active.allottedMs } })
    persist(get)
    broadcastState(get)
  },

  selectIndex: (index) => {
    const s = get()
    const target = s.debaters[index]
    if (!target || index === s.run.activeIndex) return
    const debaters = bankActive(s.debaters, s.run)
    const bankedTarget = debaters[index]
    set({
      debaters,
      run: { activeIndex: index, phase: 'idle', endTimestamp: null, remainingMs: bankedTarget.remainingMs },
    })
    persist(get)
    broadcastState(get)
  },

  selectNext: () => {
    const s = get()
    get().selectIndex((s.run.activeIndex + 1) % s.debaters.length)
  },

  selectPrev: () => {
    const s = get()
    get().selectIndex((s.run.activeIndex - 1 + s.debaters.length) % s.debaters.length)
  },

  tickCheck: () => {
    const s = get()
    if (s.run.phase !== 'running' || s.run.endTimestamp === null) return
    if (Date.now() < s.run.endTimestamp) return
    const debaters = bankActive(s.debaters, { ...s.run, remainingMs: 0 })
    set({ debaters, run: { ...s.run, phase: 'paused', endTimestamp: null, remainingMs: 0 } })
    persist(get)
    broadcastState(get)
  },

  addDebater: (name, allottedMs) => {
    const s = get()
    const debater: Debater = { id: uuid(), name, photoDataUrl: null, allottedMs, remainingMs: allottedMs }
    set({ debaters: [...s.debaters, debater] })
    persist(get)
    broadcastState(get)
  },

  updateDebater: (id, patch) => {
    const s = get()
    const activeId = s.debaters[s.run.activeIndex]?.id
    const debaters = s.debaters.map((d) => (d.id === id ? { ...d, ...patch } : d))
    set({ debaters })
    if (activeId === id && s.run.phase === 'idle' && patch.allottedMs !== undefined) {
      set({ run: { ...get().run, remainingMs: patch.allottedMs } })
    }
    persist(get)
    broadcastState(get)
  },

  removeDebater: (id) => {
    const s = get()
    const removedIndex = s.debaters.findIndex((d) => d.id === id)
    if (removedIndex === -1) return
    const debaters = s.debaters.filter((d) => d.id !== id)
    let { activeIndex } = s.run
    if (removedIndex <= activeIndex) activeIndex = Math.max(0, activeIndex - (removedIndex === activeIndex ? 0 : 1))
    activeIndex = Math.min(activeIndex, Math.max(0, debaters.length - 1))
    const active = debaters[activeIndex]
    set({
      debaters,
      run: { activeIndex, phase: 'idle', endTimestamp: null, remainingMs: active?.remainingMs ?? 0 },
    })
    persist(get)
    broadcastState(get)
  },

  reorderDebater: (fromIndex, toIndex) => {
    const s = get()
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= s.debaters.length) return
    const debaters = [...s.debaters]
    const [moved] = debaters.splice(fromIndex, 1)
    debaters.splice(toIndex, 0, moved)
    let { activeIndex } = s.run
    if (activeIndex === fromIndex) activeIndex = toIndex
    else if (fromIndex < activeIndex && toIndex >= activeIndex) activeIndex -= 1
    else if (fromIndex > activeIndex && toIndex <= activeIndex) activeIndex += 1
    set({ debaters, run: { ...s.run, activeIndex } })
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
