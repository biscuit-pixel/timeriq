export function clampMs(ms: number) {
  return Math.max(0, ms)
}

/** Formats a duration as H:MM:SS or M:SS, always showing at least minutes:seconds. */
export function formatDuration(ms: number): string {
  const total = Math.ceil(clampMs(ms) / 1000)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const mm = minutes.toString().padStart(hours > 0 ? 2 : 1, '0')
  const ss = seconds.toString().padStart(2, '0')
  return hours > 0 ? `${hours}:${mm.padStart(2, '0')}:${ss}` : `${mm}:${ss}`
}

/** Compact editor-friendly form, e.g. "12:30" for 12m30s. */
export function msToClockInput(ms: number): string {
  const total = Math.round(clampMs(ms) / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function clockInputToMs(value: string): number {
  const parts = value.split(':').map((p) => Number.parseInt(p, 10) || 0)
  if (parts.length === 1) return parts[0] * 60 * 1000
  if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000
  return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000
}

export function formatClock(date: Date, format: '24h' | '12h'): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: format === '12h',
  })
}
