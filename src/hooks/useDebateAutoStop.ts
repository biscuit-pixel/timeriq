import { useEffect } from 'react'
import { useDebateStore } from '../debate/store'

/** Polls so a running debater's clock stops (banked at 0) when it hits zero. Mount once, in the debate control window. */
export function useDebateAutoStop() {
  useEffect(() => {
    const id = window.setInterval(() => {
      useDebateStore.getState().tickCheck()
    }, 200)
    return () => window.clearInterval(id)
  }, [])
}
