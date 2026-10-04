import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TONES, cut, type Tone } from './tokens'

/* ------------------------------------------------------------------ pip */

export function StatusPip({
  tone = 'ok',
  pulse = true,
  size = 6,
}: {
  tone?: Tone
  pulse?: boolean
  size?: number
}) {
  const t = TONES[tone]
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {pulse && (
        <motion.span
          className="absolute inset-0"
          style={{ background: t.bar, opacity: 0.5 }}
          animate={{ scale: [1, 2.4], opacity: [0.55, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <span
        className="absolute inset-0"
        style={{ background: t.bar, boxShadow: `0 0 8px ${t.bar}` }}
        aria-hidden
      />
    </span>
  )
}

/* ---------------------------------------------------------------- badge */

export function Badge({
  children,
  tone = 'neutral',
  solid = false,
  className = '',
}: {
  children: ReactNode
  tone?: Tone
  solid?: boolean
  className?: string
}) {
  const t = TONES[tone]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-[6px] py-[2px] font-pixel-xs leading-[1.6] ${className}`}
      style={{
        ...cut('sm'),
        background: solid ? t.bar : t.bg,
        color: solid ? '#050505' : t.text,
        boxShadow: `inset 0 0 0 1px ${solid ? t.bar : `rgba(${t.rgb},0.4)`}`,
        letterSpacing: '0.08em',
      }}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ bar */

export function Bar({
  value,
  max = 100,
  tone = 'blue',
  height = 6,
  segments = 0,
  animated = true,
  delay = 0,
  className = '',
}: {
  value: number
  max?: number
  tone?: Tone
  height?: number
  segments?: number
  animated?: boolean
  delay?: number
  className?: string
}) {
  const t = TONES[tone]
  const p = Math.max(0, Math.min(1, value / max))

  if (segments > 0) {
    const filled = Math.round(p * segments)
    return (
      <div className={`flex w-full items-stretch gap-[2px] ${className}`} style={{ height }}>
        {Array.from({ length: segments }).map((_, i) => {
          const on = i < filled
          const frac = i / segments
          const color = on ? (frac > 0.7 ? '#ff3344' : frac > 0.45 ? '#ffd43b' : t.bar) : '#1c1c1c'
          return (
            <motion.span
              key={i}
              className="flex-1"
              style={{ background: on ? color : '#191919', boxShadow: on ? `0 0 6px ${color}` : 'none' }}
              initial={animated ? { opacity: 0 } : false}
              animate={animated ? { opacity: 1 } : undefined}
              transition={{ delay: delay + i * 0.012 }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height, background: '#151515', boxShadow: 'inset 0 0 0 1px #232323' }}
      role="progressbar"
      aria-valuenow={Math.round(p * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.span
        className="absolute inset-y-0 left-0"
        style={{
          background: t.bar,
          boxShadow: `0 0 10px rgba(${t.rgb},0.7)`,
        }}
        initial={animated ? { width: 0 } : false}
        animate={{ width: `${p * 100}%` }}
        transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      />
      <span className="pointer-events-none absolute inset-y-0 left-0 opacity-25 pixel-grid-sm-dark" />
    </div>
  )
}

/* ------------------------------------------------------------- key/value */

export function KeyValue({
  k,
  v,
  tone = 'ash',
  mono = true,
  gap = 'gap-3',
  className = '',
}: {
  k: ReactNode
  v: ReactNode
  tone?: Tone
  mono?: boolean
  gap?: string
  className?: string
}) {
  return (
    <div className={`flex items-baseline justify-between ${gap} ${className}`}>
      <span className="min-w-0 break-words font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{k}</span>
      <span
        className={`min-w-0 break-words text-right text-[11px] ${mono ? 'font-mono tnum' : ''}`}
        style={{ color: TONES[tone].text }}
      >
        {v}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ pip row */

export function SignalRow({
  label,
  value,
  tone = 'ash',
  glyph = '·',
}: {
  label: string
  value: string
  tone?: Tone
  glyph?: string
}) {
  return (
    <div className="flex items-center gap-2 border-b border-[#1a1a1a] py-[5px] last:border-b-0">
      <span className="w-[10px] text-center font-mono text-[10px]" style={{ color: TONES[tone].text }}>
        {glyph}
      </span>
      <span className="flex-1 truncate font-mono text-[10px] uppercase tracking-[0.12em] text-ash">{label}</span>
      <span className="font-mono text-[10px] tnum text-bone">{value}</span>
    </div>
  )
}

/* --------------------------------------------------------------- section */

export function SectionLabel({
  children,
  right,
  className = '',
}: {
  children: ReactNode
  right?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-pixel-xs text-muted">{children}</span>
      <span className="h-px flex-1 bg-[#1e1e1e]" />
      {right}
    </div>
  )
}