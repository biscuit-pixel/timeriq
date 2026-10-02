import { useEffect, useRef } from 'react'

interface Props {
  color: string
  /** Higher = more particles per pixel. Preview uses a lower value than the projector output. */
  density?: number
}

interface Particle {
  x: number
  y: number
  r: number
  speed: number
  drift: number
  phase: number
  twinkle: number
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim())
  if (!m) return [124, 92, 255]
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

export function ParticleField({ color, density = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const targetColor = useRef<[number, number, number]>(hexToRgb(color))

  useEffect(() => {
    targetColor.current = hexToRgb(color)
  }, [color])

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !parent || !ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let dpr = 1
    let particles: Particle[] = []
    const current: [number, number, number] = [...targetColor.current]

    const seed = (): Particle => {
      const big = Math.random() < 0.16
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: (big ? 2.6 + Math.random() * 2.4 : 0.6 + Math.random() * 1.5) * dpr,
        speed: (big ? 4 + Math.random() * 7 : 7 + Math.random() * 17) * dpr,
        drift: (Math.random() - 0.5) * 10 * dpr,
        phase: Math.random() * Math.PI * 2,
        twinkle: 0.5 + Math.random() * 1.6,
      }
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = Math.max(1, Math.floor(parent.clientWidth * dpr))
      height = Math.max(1, Math.floor(parent.clientHeight * dpr))
      canvas.width = width
      canvas.height = height
      const count = Math.round(Math.min(90, Math.max(22, ((parent.clientWidth * parent.clientHeight) / 12000) * density)))
      particles = Array.from({ length: count }, seed)
    }

    const draw = (t: number, dt: number) => {
      for (let i = 0; i < 3; i++) current[i] += (targetColor.current[i] - current[i]) * Math.min(1, dt * 3)
      const [cr, cg, cb] = current.map(Math.round)
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.y -= p.speed * dt
        p.x += (p.drift + Math.sin(t * 0.0004 * p.twinkle + p.phase) * 6 * dpr) * dt
        if (p.y < -10) {
          p.y = height + 10
          p.x = Math.random() * width
        }
        if (p.x < -10) p.x = width + 10
        else if (p.x > width + 10) p.x = -10
      }

      for (const p of particles) {
        const tw = 0.5 + 0.5 * Math.sin(t * 0.001 * p.twinkle + p.phase)
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.22 * tw})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.5 + 0.45 * tw})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(parent)

    if (reduceMotion) {
      draw(0, 0)
      return () => observer.disconnect()
    }

    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      draw(now, dt)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [density])

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />
}
