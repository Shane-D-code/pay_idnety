import { useEffect, useState, type ReactNode } from 'react'

export interface LoadLine {
  label: string
  /** duration in ms */
  dur?: number
}

/** Block-character progress meter — never a spinner. */
export function LoadBar({ value, tone = '#5b72ff' }: { value: number; tone?: string }) {
  /* clamp defensively: a negative or NaN progress would throw on repeat() */
  const safe = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
  const filled = Math.round((safe / 100) * 28)
  return (
    <span className="font-mono text-[11px] tracking-[0.02em]" style={{ color: tone }}>
      <span aria-hidden>{'█'.repeat(filled)}</span>
      <span className="text-[#333]" aria-hidden>
        {'░'.repeat(28 - filled)}
      </span>
      <span className="ml-2 tnum">{Math.round(safe)}%</span>
    </span>
  )
}

/** Terminal loading sequence: label, block meter, percentage. */
export function TerminalLoader({
  lines,
  className = '',
  compact = false,
}: {
  lines: LoadLine[]
  className?: string
  compact?: boolean
}) {
  const [index, setIndex] = useState(0)
  const [pct, setPct] = useState(0)

  useEffect(() => {
    if (index >= lines.length) return
    const dur = lines[index].dur ?? 420
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      /* rAF timestamps and performance.now() share a clock, but guard the sign
         anyway so a scheduler hiccup can never emit a negative percentage */
      const p = Math.min(100, Math.max(0, ((t - start) / dur) * 100))
      setPct(p)
      if (p < 100) raf = requestAnimationFrame(tick)
      else {
        window.setTimeout(() => {
          setIndex((i) => i + 1)
          setPct(0)
        }, 90)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [index, lines])

  return (
    <div className={`font-mono ${compact ? 'text-[10px]' : 'text-[11px]'} ${className}`}>
      {lines.map((l, i) => {
        if (i > index) return null
        const done = i < index
        const shown = i === index ? pct : 100
        return (
          <div key={l.label} className="mb-1 flex items-baseline justify-between gap-4">
            <span className="truncate tracking-[0.1em]" style={{ color: done ? '#a8a8a8' : '#f5f5f5' }}>
              {l.label.toUpperCase()}
              {!done && <span className="blink ml-1 inline-block h-[9px] w-[5px] translate-y-[1px] bg-soft" />}
            </span>
            <LoadBar value={shown} tone={done ? '#666' : i === lines.length - 1 ? '#35ff72' : '#5b72ff'} />
          </div>
        )
      })}
      {index >= lines.length && (
        <div className="font-mono text-[11px] text-ok" style={{ textShadow: '0 0 10px rgba(53,255,114,0.4)' }}>
          {'█'.repeat(28)} 100%
        </div>
      )}
    </div>
  )
}

/** Pip column for boot sequences and pipelines. */
export function PipelineList({
  items,
  cursor = 0,
  tone = 'ok',
  className = '',
  render,
}: {
  items: string[]
  cursor?: number
  tone?: 'ok' | 'warn' | 'crit' | 'info'
  className?: string
  render?: (item: string, i: number) => ReactNode
}) {
  const color =
    tone === 'ok' ? '#35ff72' : tone === 'warn' ? '#ffd43b' : tone === 'crit' ? '#ff3344' : '#5b72ff'

  return (
    <ul className={`font-mono text-[11px] tracking-[0.06em] ${className}`}>
      {items.map((item, i) => {
        const state = i < cursor ? 'done' : i === cursor ? 'active' : 'idle'
        return (
          <li
            key={item}
            className="flex items-baseline gap-2 py-[3px]"
            style={{ opacity: state === 'idle' ? 0.3 : 1 }}
          >
            <span className="w-[12px] shrink-0" style={{ color }}>
              {state === 'done' ? '✓' : state === 'active' ? '▸' : '·'}
            </span>
            <span style={{ color: state === 'done' ? color : state === 'active' ? '#f5f5f5' : '#666' }}>
              {render ? render(item, i) : item}
            </span>
            {state === 'active' && <span className="blink h-[9px] w-[5px] bg-current" />}
          </li>
        )
      })}
    </ul>
  )
}