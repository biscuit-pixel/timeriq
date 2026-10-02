import { useEffect, useRef, useState } from 'react'
import { clampMs } from '../utils/time'

interface LiveRunLike {
  phase: string
  endTimestamp: number | null
  remainingMs: number
}

/** Recomputes remaining time every animation frame while running, for a smooth countdown/progress bar. */
export function useLiveRemaining(run: LiveRunLike): number {
  const [now, setNow] = useState(() => Date.now())
  const frame = useRef<number>(0)

  useEffect(() => {
    if (run.phase !== 'running') return
    const loop = () => {
      setNow(Date.now())
      frame.current = requestAnimationFrame(loop)
    }
    frame.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame.current)
  }, [run.phase, run.endTimestamp])

  if (run.phase === 'running' && run.endTimestamp !== null) {
    return clampMs(run.endTimestamp - now)
  }
  return clampMs(run.remainingMs)
}
