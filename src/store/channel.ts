import type { SyncMessage } from './types'
import { sessionTransport } from '../session/transport'

export const CHANNEL_NAME = 'timeriq-sync-v1'
export const SESSION_ID = Math.random().toString(36).slice(2)

type Listener = (msg: SyncMessage) => void

/**
 * Sends state between windows on this computer (BroadcastChannel) and, when a session is active,
 * between computers (via the session relay). Falls back to a no-op if BroadcastChannel isn't available.
 */
class SyncChannel {
  private channel: BroadcastChannel | null = null
  private listeners = new Set<Listener>()

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(CHANNEL_NAME)
      this.channel.onmessage = (ev: MessageEvent<SyncMessage>) => {
        this.listeners.forEach((l) => l(ev.data))
      }
    }
    sessionTransport.onMessage('timer', (msg) => {
      this.listeners.forEach((l) => l(msg as SyncMessage))
    })
  }

  send(msg: SyncMessage) {
    this.channel?.postMessage(msg)
    sessionTransport.send('timer', msg as never)
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

export const syncChannel = new SyncChannel()
