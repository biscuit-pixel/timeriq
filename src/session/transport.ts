export type SyncChannelName = 'timer' | 'debate'
export type SessionRole = 'host' | 'control' | 'viewer'
export type SessionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'rejected'

export const CLIENT_ID = Math.random().toString(36).slice(2)

type Handler = (msg: unknown) => void
type RunLike = { phase: string; remainingMs: number; endTimestamp: number | null }

interface Envelope {
  ch: SyncChannelName
  msg: { kind: string; senderId: string; state?: unknown }
}

/** Running clocks travel as "remaining ms" so each machine computes its own countdown without clock-skew errors. */
function forEachRun(state: unknown, fn: (run: RunLike) => void) {
  const s = state as { run?: RunLike; rounds?: { run: RunLike }[] }
  if (s.rounds) s.rounds.forEach((r) => fn(r.run))
  else if (s.run) fn(s.run)
}

function toWire(msg: Envelope['msg']): Envelope['msg'] {
  if (msg.kind !== 'state') return msg
  const copy = JSON.parse(JSON.stringify(msg)) as Envelope['msg']
  forEachRun(copy.state, (run) => {
    if (run.phase === 'running' && run.endTimestamp !== null) {
      run.remainingMs = Math.max(0, run.endTimestamp - Date.now())
      run.endTimestamp = null
    }
  })
  return copy
}

function fromWire(msg: Envelope['msg']) {
  if (msg.kind !== 'state') return msg
  forEachRun(msg.state, (run) => {
    if (run.phase === 'running' && run.endTimestamp === null) {
      run.endTimestamp = Date.now() + run.remainingMs
    }
  })
  return msg
}

class SessionTransport {
  private ws: WebSocket | null = null
  private handlers = new Map<SyncChannelName, Set<Handler>>()
  private statusListeners = new Set<(status: SessionStatus) => void>()
  private openListeners = new Set<() => void>()
  code: string | null = null
  role: SessionRole | null = null
  status: SessionStatus = 'idle'

  connect(code: string, role: SessionRole) {
    this.disconnect(false)
    this.code = code
    this.role = role
    this.setStatus('connecting')

    const scheme = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${scheme}//${location.host}/ws/${code}?role=${role}`)
    this.ws = ws

    ws.onopen = () => {
      if (this.ws !== ws) return
      this.setStatus('connected')
      this.openListeners.forEach((l) => l())
    }
    ws.onmessage = (event) => {
      if (this.ws !== ws) return
      let envelope: Envelope
      try {
        envelope = JSON.parse(event.data as string)
      } catch {
        return
      }
      const handlers = this.handlers.get(envelope.ch)
      if (!handlers) return
      const msg = fromWire(envelope.msg)
      handlers.forEach((h) => h(msg))
    }
    ws.onclose = (event) => {
      if (this.ws !== ws) return
      this.ws = null
      this.setStatus(event.code === 4409 || event.reason === 'host-taken' ? 'rejected' : 'disconnected')
    }
    ws.onerror = () => {
      if (this.ws === ws) this.setStatus('disconnected')
    }
  }

  disconnect(reset = true) {
    const ws = this.ws
    this.ws = null
    if (ws && ws.readyState <= WebSocket.OPEN) ws.close()
    if (reset) {
      this.code = null
      this.role = null
      this.setStatus('idle')
    }
  }

  /** Remote control PCs send their intentions to the host instead of changing their own state. */
  isRemoteControl() {
    return this.role === 'control' && this.status === 'connected'
  }

  send(ch: SyncChannelName, msg: Envelope['msg']) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify({ ch, msg: toWire(msg), t: Date.now() }))
  }

  onMessage(ch: SyncChannelName, handler: Handler) {
    let set = this.handlers.get(ch)
    if (!set) {
      set = new Set()
      this.handlers.set(ch, set)
    }
    set.add(handler)
    return () => set!.delete(handler)
  }

  onStatus(listener: (status: SessionStatus) => void) {
    this.statusListeners.add(listener)
    return () => this.statusListeners.delete(listener)
  }

  onOpen(listener: () => void) {
    this.openListeners.add(listener)
    return () => this.openListeners.delete(listener)
  }

  private setStatus(status: SessionStatus) {
    this.status = status
    this.statusListeners.forEach((l) => l(status))
  }
}

export const sessionTransport = new SessionTransport()
