import type { DebateSyncMessage } from './types'

export const DEBATE_CHANNEL_NAME = 'timeriq-debate-sync-v1'
export const DEBATE_SESSION_ID = Math.random().toString(36).slice(2)

type Listener = (msg: DebateSyncMessage) => void

class DebateSyncChannel {
  private channel: BroadcastChannel | null = null
  private listeners = new Set<Listener>()

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel(DEBATE_CHANNEL_NAME)
      this.channel.onmessage = (ev: MessageEvent<DebateSyncMessage>) => {
        this.listeners.forEach((l) => l(ev.data))
      }
    }
  }

  send(msg: DebateSyncMessage) {
    this.channel?.postMessage(msg)
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

export const debateSyncChannel = new DebateSyncChannel()
