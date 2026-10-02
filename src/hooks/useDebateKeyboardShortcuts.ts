import { useEffect } from 'react'
import { useDebateStore } from '../debate/store'
import { sendDebateRemoteAction } from '../debate/store'

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable || target.getAttribute('role') === 'spinbutton'
}

/**
 * Space toggles play/pause of the active speaker, Escape resets their time to allotted,
 * arrow keys move the spotlight to the previous/next debater (banking the outgoing one).
 */
export function useDebateKeyboardShortcuts(isControl: boolean) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return
      if (e.code === 'Space') {
        e.preventDefault()
        if (isControl) useDebateStore.getState().toggle()
        else sendDebateRemoteAction({ type: 'toggle' })
      } else if (e.code === 'Escape') {
        e.preventDefault()
        if (isControl) useDebateStore.getState().reset()
        else sendDebateRemoteAction({ type: 'reset' })
      } else if (e.code === 'ArrowRight') {
        if (isControl) useDebateStore.getState().selectNext()
        else sendDebateRemoteAction({ type: 'next' })
      } else if (e.code === 'ArrowLeft') {
        if (isControl) useDebateStore.getState().selectPrev()
        else sendDebateRemoteAction({ type: 'prev' })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isControl])
}
