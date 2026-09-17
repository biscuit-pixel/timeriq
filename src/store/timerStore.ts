import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import { defaultPlaylist, defaultSettings } from './defaults'
import { syncChannel, SESSION_ID } from './channel'
import type {
  ItemType,
  PlaylistItem,
  RemoteAction,
  Settings,
  TimerIQState,
  WarningThreshold,
} from './types'

const STORAGE_KEY = 'timeriq-store-v1'

interface Persisted {
  playlist: PlaylistItem[]
  settings: Settings
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { playlist: defaultPlaylist, settings: defaultSettings }
    const parsed = JSON.parse(raw)
    return {
      playlist: parsed.playlist?.length ? parsed.playlist : defaultPlaylist,
      settings: { ...defaultSettings, ...parsed.settings, visual: { ...defaultSettings.visual, ...parsed.settings?.visual } },
    }
  } catch {
    return { playlist: defaultPlaylist, settings: defaultSettings }
  }
}

function savePersisted(state: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or unavailable (private mode) — non-fatal, app still works in-memory
  }
}

const initial = loadPersisted()

interface TimerStore extends TimerIQState {
  isControlSource: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  reset: () => void
  skipNext: () => void
  skipPrev: () => void
  goTo: (index: number) => void
  tickCheck: () => void
  addItem: (type: ItemType, label: string, durationMs: number) => void
  updateItem: (id: string, patch: Partial<Omit<PlaylistItem, 'id'>>) => void
  removeItem: (id: string) => void
  reorderItem: (fromIndex: number, toIndex: number) => void
  duplicateItem: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  updateVisual: (patch: Partial<Settings['visual']>) => void
  addThreshold: (t: Omit<WarningThreshold, 'id'>) => void
  updateThreshold: (id: string, patch: Partial<WarningThreshold>) => void
  removeThreshold: (id: string) => void
  setLogo: (dataUrl: string | null) => void
  applyRemoteState: (state: TimerIQState) => void
  requestSync: () => void
}

function currentItem(state: Pick<TimerStore, 'playlist' | 'run'>) {
  return state.playlist[state.run.currentIndex] ?? null
}

function broadcastState(get: () => TimerStore) {
  const s = get()
  syncChannel.send({
    kind: 'state',
    senderId: SESSION_ID,
    state: { playlist: s.playlist, settings: s.settings, run: s.run },
  })
}

function persist(get: () => TimerStore) {
  const s = get()
  savePersisted({ playlist: s.playlist, settings: s.settings })
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  playlist: initial.playlist,
  settings: initial.settings,
  run: {
    phase: 'idle',
    currentIndex: 0,
    remainingMs: initial.playlist[0]?.durationMs ?? 0,
    endTimestamp: null,
  },
  isControlSource: true,

  play: () => {
    const s = get()
    const item = currentItem(s)
    if (!item) return
    const remaining = s.run.phase === 'finished' ? item.durationMs : s.run.remainingMs
    set({ run: { ...s.run, phase: 'running', endTimestamp: Date.now() + remaining, remainingMs: remaining } })
    broadcastState(get)
  },

  pause: () => {
    const s = get()
    if (s.run.phase !== 'running' || s.run.endTimestamp === null) return
    const remainingMs = Math.max(0, s.run.endTimestamp - Date.now())
    set({ run: { ...s.run, phase: 'paused', endTimestamp: null, remainingMs } })
    broadcastState(get)
  },

  toggle: () => {
    const s = get()
    if (s.run.phase === 'running') get().pause()
    else get().play()
  },

  reset: () => {
    const s = get()
    const item = currentItem(s)
    if (!item) return
    set({ run: { ...s.run, phase: 'idle', endTimestamp: null, remainingMs: item.durationMs } })
    broadcastState(get)
  },

  goTo: (index: number) => {
    const s = get()
    const item = s.playlist[index]
    if (!item) return
    set({ run: { phase: 'idle', currentIndex: index, endTimestamp: null, remainingMs: item.durationMs } })
    broadcastState(get)
  },

  skipNext: () => {
    const s = get()
    const nextIndex = s.run.currentIndex + 1
    if (nextIndex >= s.playlist.length) return
    get().goTo(nextIndex)
  },

  skipPrev: () => {
    const s = get()
    const prevIndex = s.run.currentIndex - 1
    if (prevIndex < 0) return
    get().goTo(prevIndex)
  },

  /** Called from a lightweight interval in the app root to advance the playlist when a segment hits zero. */
  tickCheck: () => {
    const s = get()
    if (s.run.phase !== 'running' || s.run.endTimestamp === null) return
    if (Date.now() < s.run.endTimestamp) return

    const nextIndex = s.run.currentIndex + 1
    const next = s.playlist[nextIndex]
    if (next) {
      set({ run: { phase: 'running', currentIndex: nextIndex, endTimestamp: Date.now() + next.durationMs, remainingMs: next.durationMs } })
    } else {
      set({ run: { ...s.run, phase: 'finished', endTimestamp: null, remainingMs: 0 } })
    }
    broadcastState(get)
  },

  addItem: (type, label, durationMs) => {
    const s = get()
    const item: PlaylistItem = { id: uuid(), type, label, durationMs }
    const playlist = [...s.playlist, item]
    set({ playlist })
    if (s.playlist.length === 0) {
      set({ run: { phase: 'idle', currentIndex: 0, endTimestamp: null, remainingMs: item.durationMs } })
    }
    persist(get)
    broadcastState(get)
  },

  updateItem: (id, patch) => {
    const s = get()
    const playlist = s.playlist.map((it) => (it.id === id ? { ...it, ...patch } : it))
    set({ playlist })
    const active = s.playlist[s.run.currentIndex]
    if (active?.id === id && s.run.phase === 'idle' && patch.durationMs !== undefined) {
      set({ run: { ...get().run, remainingMs: patch.durationMs } })
    }
    persist(get)
    broadcastState(get)
  },

  removeItem: (id) => {
    const s = get()
    const removedIndex = s.playlist.findIndex((it) => it.id === id)
    const playlist = s.playlist.filter((it) => it.id !== id)
    let { currentIndex } = s.run
    if (removedIndex !== -1 && removedIndex <= currentIndex) {
      currentIndex = Math.max(0, currentIndex - (removedIndex === currentIndex ? 0 : 1))
    }
    currentIndex = Math.min(currentIndex, Math.max(0, playlist.length - 1))
    const item = playlist[currentIndex]
    set({
      playlist,
      run: { phase: 'idle', currentIndex, endTimestamp: null, remainingMs: item?.durationMs ?? 0 },
    })
    persist(get)
    broadcastState(get)
  },

  reorderItem: (fromIndex, toIndex) => {
    const s = get()
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= s.playlist.length) return
    const playlist = [...s.playlist]
    const [moved] = playlist.splice(fromIndex, 1)
    playlist.splice(toIndex, 0, moved)

    let { currentIndex } = s.run
    if (currentIndex === fromIndex) currentIndex = toIndex
    else if (fromIndex < currentIndex && toIndex >= currentIndex) currentIndex -= 1
    else if (fromIndex > currentIndex && toIndex <= currentIndex) currentIndex += 1

    set({ playlist, run: { ...s.run, currentIndex } })
    persist(get)
    broadcastState(get)
  },

  duplicateItem: (id) => {
    const s = get()
    const idx = s.playlist.findIndex((it) => it.id === id)
    if (idx === -1) return
    const copy: PlaylistItem = { ...s.playlist[idx], id: uuid() }
    const playlist = [...s.playlist]
    playlist.splice(idx + 1, 0, copy)
    set({ playlist })
    persist(get)
    broadcastState(get)
  },

  updateSettings: (patch) => {
    set({ settings: { ...get().settings, ...patch } })
    persist(get)
    broadcastState(get)
  },

  updateVisual: (patch) => {
    const s = get()
    set({ settings: { ...s.settings, visual: { ...s.settings.visual, ...patch } } })
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

  setLogo: (dataUrl) => {
    get().updateVisual({ logoDataUrl: dataUrl })
  },

  applyRemoteState: (state) => {
    set({ ...state, isControlSource: false })
  },

  requestSync: () => {
    syncChannel.send({ kind: 'request-state', senderId: SESSION_ID })
  },
}))

// Keep other windows (output / secondary control views) in sync.
syncChannel.subscribe((msg) => {
  if (msg.senderId === SESSION_ID) return
  if (msg.kind === 'state') {
    useTimerStore.getState().applyRemoteState(msg.state)
  } else if (msg.kind === 'request-state') {
    if (useTimerStore.getState().isControlSource) broadcastState(useTimerStore.getState)
  } else if (msg.kind === 'action') {
    if (useTimerStore.getState().isControlSource) applyRemoteAction(msg.action)
  }
})

function applyRemoteAction(action: RemoteAction) {
  const store = useTimerStore.getState()
  if (action.type === 'toggle') store.toggle()
  else if (action.type === 'reset') store.reset()
  else if (action.type === 'next') store.skipNext()
  else if (action.type === 'prev') store.skipPrev()
}

export function sendRemoteAction(action: RemoteAction) {
  syncChannel.send({ kind: 'action', action, senderId: SESSION_ID })
}
