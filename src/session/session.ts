import { create } from 'zustand'
import { useTimerStore, publishTimerState } from '../store/timerStore'
import { useDebateStore, publishDebateState } from '../debate/store'
import { sessionTransport, type SessionRole, type SessionStatus } from './transport'

const STORAGE_KEY = 'timeriq-session'
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

interface SessionState {
  code: string | null
  role: SessionRole | null
  status: SessionStatus
}

export const useSessionStore = create<SessionState>(() => ({ code: null, role: null, status: 'idle' }))

sessionTransport.onStatus((status) => {
  useSessionStore.setState({ status, code: sessionTransport.code, role: sessionTransport.role })
})

sessionTransport.onOpen(() => {
  if (sessionTransport.role === 'host') {
    publishTimerState()
    publishDebateState()
  }
})

export function generateSessionCode() {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

function remember(code: string, role: SessionRole) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ code, role }))
  } catch {
    // session storage unavailable — the session still works until the page is reloaded
  }
}

function forget() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

function connect(code: string, role: SessionRole) {
  const isHost = role === 'host'
  useTimerStore.setState({ isControlSource: isHost })
  useDebateStore.setState({ isControlSource: isHost })
  sessionTransport.connect(code, role)
  remember(code, role)
}

export function startHosting() {
  connect(generateSessionCode(), 'host')
}

export function joinSession(code: string, role: Exclude<SessionRole, 'host'>) {
  connect(code.trim().toUpperCase(), role)
}

export function leaveSession() {
  sessionTransport.disconnect()
  forget()
  useSessionStore.setState({ code: null, role: null, status: 'idle' })
}

/** Reconnects after a reload, or joins straight from a link like /output?s=CODE&role=viewer. */
export function restoreSessionFromPage() {
  const params = new URLSearchParams(window.location.search)
  const fromUrl = params.get('s')
  if (fromUrl) {
    const role = params.get('role') === 'control' ? 'control' : 'viewer'
    joinSession(fromUrl, role)
    return
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as { code: string; role: SessionRole } | null
    if (saved?.code) connect(saved.code, saved.role)
  } catch {
    forget()
  }
}
