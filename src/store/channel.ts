import type { SyncMessage } from './types'

export const CHANNEL_NAME = 'timeriq-sync-v1'
export const SESSION_ID = Math.random().toString(36).slice(2)

type Listener = (msg: SyncMessage) => void

/**
 * Thin wrapper around BroadcastChannel so the control window and output
 * window(s) can stay in sync without a server. Falls back to a no-op if
 * BroadcastChannel isn't available (very old browsers) — the app still
 * works single-window in that case.
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
  }

  send(msg: SyncMessage) {
    this.channel?.postMessage(msg)
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

export const syncChannel = new SyncChannel()
