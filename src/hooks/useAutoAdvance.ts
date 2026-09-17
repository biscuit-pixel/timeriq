import { useEffect } from 'react'
import { useTimerStore } from '../store/timerStore'

/** Polls the store so a running segment automatically hands off to the next playlist item at 0. Mount once, in the control window. */
export function useAutoAdvance() {
  useEffect(() => {
    const id = window.setInterval(() => {
      useTimerStore.getState().tickCheck()
    }, 200)
    return () => window.clearInterval(id)
  }, [])
}
