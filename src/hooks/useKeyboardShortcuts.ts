import { useEffect } from 'react'
import { useTimerStore } from '../store/timerStore'
import { sendRemoteAction } from '../store/timerStore'

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

/**
 * Space toggles play/pause, Escape resets the current segment.
 * `isControl` is true in the control window (acts on the store directly);
 * the output window forwards the same keys as remote actions so an operator
 * who has the projector window focused can still drive the timer.
 */
export function useKeyboardShortcuts(isControl: boolean) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return
      if (e.code === 'Space') {
        e.preventDefault()
        if (isControl) useTimerStore.getState().toggle()
        else sendRemoteAction({ type: 'toggle' })
      } else if (e.code === 'Escape') {
        e.preventDefault()
        if (isControl) useTimerStore.getState().reset()
        else sendRemoteAction({ type: 'reset' })
      } else if (e.code === 'ArrowRight') {
        if (isControl) useTimerStore.getState().skipNext()
        else sendRemoteAction({ type: 'next' })
      } else if (e.code === 'ArrowLeft') {
        if (isControl) useTimerStore.getState().skipPrev()
        else sendRemoteAction({ type: 'prev' })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isControl])
}
