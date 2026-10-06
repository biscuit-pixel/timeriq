export interface Env {
  SESSIONS: DurableObjectNamespace
}

type Role = 'host' | 'control' | 'viewer'

interface Peer {
  ws: WebSocket
  role: Role
}

/** One room per session code. Keeps the host's latest state per channel so late joiners see the current view immediately. */
export class SessionRoom {
  private peers = new Set<Peer>()
  private host: Peer | null = null
  private latest = new Map<string, { raw: string; storedAt: number }>()

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected a WebSocket upgrade', { status: 426 })
    }
    const role = parseRole(new URL(request.url).searchParams.get('role'))
    const pair = new WebSocketPair()
    const client = pair[0]
    const server = pair[1]
    server.accept()

    if (role === 'host' && this.host) {
      server.close(4409, 'host-taken')
      return new Response(null, { status: 101, webSocket: client })
    }

    const peer: Peer = { ws: server, role }
    this.peers.add(peer)
    if (role === 'host') this.host = peer

    const now = Date.now()
    for (const { raw, storedAt } of this.latest.values()) {
      server.send(freshenEnvelope(raw, now - storedAt))
    }

    server.addEventListener('message', (event) => this.onMessage(peer, event.data))
    const drop = () => {
      this.peers.delete(peer)
      if (this.host === peer) this.host = null
    }
    server.addEventListener('close', drop)
    server.addEventListener('error', drop)

    return new Response(null, { status: 101, webSocket: client })
  }

  private onMessage(from: Peer, data: unknown) {
    if (typeof data !== 'string') return
    let envelope: { ch?: string; msg?: { kind?: string } }
    try {
      envelope = JSON.parse(data)
    } catch {
      return
    }
    if (envelope.msg?.kind === 'state') {
      if (from.role !== 'host' || !envelope.ch) return
      this.latest.set(envelope.ch, { raw: data, storedAt: Date.now() })
    }
    for (const peer of this.peers) {
      if (peer === from) continue
      try {
        peer.ws.send(data)
      } catch {
        this.peers.delete(peer)
      }
    }
  }
}

function parseRole(value: string | null): Role {
  if (value === 'host' || value === 'control') return value
  return 'viewer'
}

/**
 * Stored states are relative to when they arrived; running clocks count down while nobody is hosting,
 * so late joiners get the remaining time as of right now.
 */
function freshenEnvelope(raw: string, elapsedMs: number): string {
  const envelope = JSON.parse(raw) as { ch: string; msg: { state?: unknown; kind: string }; t: number }
  const state = envelope.msg.state as { run?: RunShape; rounds?: { run: RunShape }[] } | undefined
  if (state) {
    const runs: RunShape[] = state.rounds ? state.rounds.map((r) => r.run) : state.run ? [state.run] : []
    for (const run of runs) {
      if (run.phase === 'running') run.remainingMs = Math.max(0, run.remainingMs - elapsedMs)
    }
  }
  return JSON.stringify(envelope)
}

interface RunShape {
  phase: string
  remainingMs: number
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const match = new URL(request.url).pathname.match(/^\/ws\/([A-Za-z0-9]{4,12})$/)
    if (!match) return new Response('Not found', { status: 404 })
    const id = env.SESSIONS.idFromName(match[1].toUpperCase())
    return env.SESSIONS.get(id).fetch(request)
  },
}
