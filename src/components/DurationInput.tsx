import { useState } from 'react'

interface Props {
  valueMs: number
  onChange: (ms: number) => void
  minMs?: number
  maxMs?: number
  className?: string
  ariaLabel?: string
}

// Seconds represented by each digit position, counted from the right of "MM:SS".
const PLACE_SECONDS = [1, 10, 60, 600, 6000, 60000]

function toDigits(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes.toString().padStart(2, '0') + seconds.toString().padStart(2, '0')
}

/**
 * mm:ss editor driven from the keyboard: ←/→ pick the digit, ↑/↓ change it,
 * number keys overwrite it. Carries between digits naturally (e.g. 0:59 + 1s = 1:00).
 */
export function DurationInput({ valueMs, onChange, minMs = 1000, maxMs = 999 * 60 * 1000 + 59000, className = '', ariaLabel }: Props) {
  const [focused, setFocused] = useState(false)
  const [pos, setPos] = useState(0)

  const totalSeconds = Math.round(valueMs / 1000)
  const digits = toDigits(totalSeconds)
  const maxPos = digits.length - 1

  const commitSeconds = (seconds: number) => {
    const ms = Math.min(maxMs, Math.max(minMs, seconds * 1000))
    if (ms !== valueMs) onChange(ms)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setPos((p) => Math.min(maxPos, p + 1))
    } else if (e.key === 'ArrowRight') {
      setPos((p) => Math.max(0, p - 1))
    } else if (e.key === 'ArrowUp') {
      commitSeconds(totalSeconds + PLACE_SECONDS[pos])
    } else if (e.key === 'ArrowDown') {
      commitSeconds(totalSeconds - PLACE_SECONDS[pos])
    } else if (/^[0-9]$/.test(e.key)) {
      const current = Number(digits[digits.length - 1 - pos] ?? 0)
      commitSeconds(totalSeconds + (Number(e.key) - current) * PLACE_SECONDS[pos])
      setPos((p) => Math.max(0, p - 1))
    } else if (e.key === 'Enter' || e.key === 'Escape') {
      ;(e.currentTarget as HTMLElement).blur()
    } else {
      return
    }
    e.preventDefault()
  }

  const cells = digits.split('')
  const colonAfter = cells.length - 2

  return (
    <div
      role="spinbutton"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuenow={totalSeconds}
      aria-valuetext={`${digits.slice(0, -2)}:${digits.slice(-2)}`}
      className={`duration-input ${focused ? 'duration-input--focused' : ''} ${className}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={onKeyDown}
    >
      {cells.map((ch, i) => {
        const fromRight = cells.length - 1 - i
        return (
          <span key={i} className="duration-cell">
            <span
              className={`duration-digit ${focused && fromRight === pos ? 'duration-digit--active' : ''}`}
              onMouseDown={() => setPos(fromRight)}
            >
              {ch}
            </span>
            {i === colonAfter - 1 && <span className="duration-colon">:</span>}
          </span>
        )
      })}
    </div>
  )
}
