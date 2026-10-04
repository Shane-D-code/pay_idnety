import { motion } from 'framer-motion'
import { TONES, type Tone } from '@/components/ui/tokens.tsx'

const TAU = Math.PI * 2

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

interface RadialProps {
  value: number
  max?: number
  size?: number
  segments?: number
  label?: string
  suffix?: string
  tone?: Tone
  thickness?: number
  showTicks?: boolean
  animate?: boolean
}

/** Segmented radial meter — reads like a hardware gauge, not a chart library. */
export function RadialGauge({
  value,
  max = 100,
  size = 190,
  segments = 34,
  label,
  suffix = '',
  tone = 'blue',
  thickness = 9,
  showTicks = true,
  animate = true,
}: RadialProps) {
  const t = TONES[tone]
  const c = size / 2
  const r = size / 2 - thickness * 1.6
  const sweep = 280
  const start = -140
  const filled = (value / max) * segments

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges">
        {/* ticks */}
        {showTicks &&
          Array.from({ length: 12 }).map((_, i) => {
            const a = start + (sweep / 11) * i
            const p1 = polar(c, c, r - thickness * 1.1, a)
            const p2 = polar(c, c, r - thickness * 1.9, a)
            const major = i % 3 === 0
            return (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={major ? '#2f2f2f' : '#1c1c1c'}
                strokeWidth={major ? 1.4 : 1}
              />
            )
          })}

        {Array.from({ length: segments }).map((_, i) => {
          const a0 = start + (sweep / segments) * i
          const a1 = a0 + (sweep / segments) * 0.72
          const p1 = polar(c, c, r, a0)
          const p2 = polar(c, c, r, a1)
          const on = i < filled
          const frac = i / segments
          const color = frac > 0.82 ? '#ff3344' : frac > 0.58 ? '#ffd43b' : t.bar
          return (
            <motion.line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={on ? color : '#181818'}
              strokeWidth={thickness}
              strokeLinecap="butt"
              initial={animate ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ delay: animate ? 0.12 + i * 0.012 : 0 }}
              style={on ? { filter: `drop-shadow(0 0 5px ${color})` } : undefined}
            />
          )
        })}

        {/* inner ring */}
        <circle cx={c} cy={c} r={r - thickness * 2.4} fill="none" stroke="#141414" strokeWidth={1} />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-pixel-sm leading-none tnum"
          style={{ color: t.text, textShadow: `0 0 16px rgba(${t.rgb},0.55)` }}
        >
          {Math.round(value)}
        </span>
        {suffix && <span className="mt-1 font-mono text-[10px] tracking-[0.2em] text-muted">{suffix}</span>}
        {label && (
          <span className="mt-2 max-w-[80%] text-center font-pixel-xs leading-[1.7] text-muted">{label}</span>
        )}
      </div>
    </div>
  )
}

/** Big segmented bar meter used for behavioral risk. */
export function SegmentMeter({
  value,
  max = 100,
  segments = 40,
  tone = 'blue',
  height = 22,
  animate = true,
  marks = [0, 25, 50, 75, 100],
}: {
  value: number
  max?: number
  segments?: number
  tone?: Tone
  height?: number
  animate?: boolean
  marks?: number[]
}) {
  const t = TONES[tone]
  const p = Math.min(1, value / max)
  const filled = Math.round(p * segments)

  return (
    <div>
      <div className="flex w-full items-stretch gap-[2px]" style={{ height }}>
        {Array.from({ length: segments }).map((_, i) => {
          const on = i < filled
          const frac = i / segments
          const color = frac > 0.78 ? '#ff3344' : frac > 0.52 ? '#ffd43b' : t.bar
          return (
            <motion.span
              key={i}
              className="relative flex-1"
              style={{
                background: on ? color : '#151515',
                boxShadow: on ? `0 0 8px ${color}` : 'inset 0 0 0 1px #1c1c1c',
              }}
              initial={animate ? { opacity: 0, scaleY: 0.4 } : false}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: animate ? i * 0.014 : 0, duration: 0.18 }}
            />
          )
        })}
      </div>
      <div className="relative mt-1 h-3">
        {marks.map((m) => {
          /* clamp the end labels so neither "0" nor "max" overhangs the meter */
          const atStart = m <= 0
          const atEnd = m >= max
          return (
            <span
              key={m}
              className="absolute tnum font-mono text-[9px] text-[#3d3d3d]"
              style={
                atStart
                  ? { left: 0 }
                  : atEnd
                    ? { right: 0 }
                    : { left: `${(m / max) * 100}%`, transform: 'translateX(-50%)' }
              }
            >
              {m}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/** Thin horizontal drift bar with baseline marker. */
export function DriftBar({ value, max = 25, delay = 0 }: { value: number; max?: number; delay?: number }) {
  const p = Math.min(1, value / max)
  const color = p > 0.72 ? '#ff3344' : p > 0.44 ? '#ffd43b' : '#5b72ff'
  return (
    <div className="relative h-[10px] w-full overflow-hidden" style={{ background: '#141414' }}>
      <motion.div
        className="absolute inset-y-0 left-0"
        style={{ background: color, boxShadow: `0 0 10px ${color}80` }}
        initial={{ width: 0 }}
        animate={{ width: `${p * 100}%` }}
        transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* segment mask */}
      <span className="absolute inset-0 pixel-grid-sm-dark opacity-70" aria-hidden />
      <span
        className="absolute inset-y-0 w-[2px] bg-[#3a3a3a]"
        style={{ left: '50%' }}
        aria-hidden
      />
    </div>
  )
}

/** Dashed circular path used for animated network links. */
export function dashedProps(color: string, speed = 2.4) {
  return {
    stroke: color,
    strokeWidth: 1.2,
    strokeDasharray: '4 4',
    style: { animation: `dash-flow ${speed}s linear infinite` },
  }
}

export { TAU }