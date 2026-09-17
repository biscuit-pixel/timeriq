import { useEffect, useState } from 'react'
import { formatClock } from '../utils/time'
import type { ClockFormat } from '../store/types'

export function ClockWidget({ format }: { format: ClockFormat }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return <div className="clock-widget">{formatClock(now, format)}</div>
}
