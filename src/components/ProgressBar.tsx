interface Props {
  fraction: number // 0..1 remaining
  color: string
}

export function ProgressBar({ fraction, color }: Props) {
  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{ width: `${Math.min(100, Math.max(0, fraction * 100))}%`, background: color }}
      />
    </div>
  )
}
