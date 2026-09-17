import type { WarningThreshold } from '../store/types'

/** The most urgent threshold whose trigger point has been reached, if any. */
export function activeThreshold(remainingMs: number, thresholds: WarningThreshold[]): WarningThreshold | null {
  const crossed = thresholds.filter((t) => remainingMs <= t.atMs).sort((a, b) => a.atMs - b.atMs)
  return crossed[0] ?? null
}
