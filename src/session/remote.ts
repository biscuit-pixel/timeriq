import type { StoreApi } from 'zustand'
import { sessionTransport, CLIENT_ID, type SyncChannelName } from './transport'

/** Actions that only make sense on the machine that owns the clock — remote controllers never run them. */
const NEVER_REMOTE = new Set(['applyRemoteState', 'requestSync'])
const SKIP_ON_REMOTE = new Set(['tickCheck'])

/**
 * Wraps every action on a store so that, when this PC is a remote controller, the call is forwarded to the
 * host (which executes it and broadcasts the resulting state) instead of changing local state.
 */
export function installRemoteCalls<T extends object>(store: StoreApi<T>, ch: SyncChannelName) {
  const patch: Record<string, unknown> = {}
  for (const [name, value] of Object.entries(store.getState())) {
    if (typeof value !== 'function' || NEVER_REMOTE.has(name)) continue
    const original = value as (...args: unknown[]) => unknown
    patch[name] = (...args: unknown[]) => {
      if (!sessionTransport.isRemoteControl()) return original(...args)
      if (SKIP_ON_REMOTE.has(name)) return undefined
      sessionTransport.send(ch, { kind: 'call', name, args: args.map(toPlainArg), senderId: CLIENT_ID } as never)
      return undefined
    }
  }
  store.setState(patch as Partial<T>)
}

/** Button handlers receive DOM/React events as arguments; only plain data can cross the wire. */
function toPlainArg(arg: unknown): unknown {
  if (arg === null || typeof arg !== 'object') return arg
  if ('nativeEvent' in arg || ('target' in arg && 'preventDefault' in arg)) return undefined
  try {
    return JSON.parse(JSON.stringify(arg))
  } catch {
    return undefined
  }
}
