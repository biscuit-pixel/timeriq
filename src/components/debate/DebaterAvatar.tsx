function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface Props {
  name: string
  photoDataUrl: string | null
  size?: number
  className?: string
}

export function DebaterAvatar({ name, photoDataUrl, size = 48, className = '' }: Props) {
  const style = { width: size, height: size, fontSize: size * 0.38 }
  if (photoDataUrl) {
    return <img src={photoDataUrl} alt={name} className={`debater-avatar debater-avatar--photo ${className}`} style={style} />
  }
  return (
    <div className={`debater-avatar debater-avatar--initials ${className}`} style={style}>
      {initials(name)}
    </div>
  )
}
