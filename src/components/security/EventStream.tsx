import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { SecurityEvent } from '@/data'
import { Panel } from '@/components/ui/Panel'
import { StatusPip } from '@/components/ui/indicators'
import { TONES, cut, type Tone } from '@/components/ui/tokens.tsx'
import { Caret } from '@/components/ui/TypeLine'

const STATUS_TONE: Record<string, Tone> = {
  NORMAL: 'ok',
  'DRIFT DETECTED': 'blue',
  WARNING: 'warn',
  HIGH: 'warn',
  CRITICAL: 'crit',
}

const FILTERS = [
  { key: 'ALL', label: 'ALL' },
  { key: 'FLAGGED', label: 'FLAGGED' },
  { key: 'SESSION', label: 'S-84729' },
] as const

/** Section 10 — scrolling terminal event stream with typed arrivals. */
export function EventStream({
  events,
  height = 420,
  limit = 40,
  title = 'LIVE SECURITY EVENTS',
}: {
  events: SecurityEvent[]
  height?: number
  limit?: number
  title?: string
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('ALL')

  const rows = useMemo(() => {
    const base = events.slice(0, limit)
    if (filter === 'FLAGGED') return base.filter((e) => e.status !== 'NORMAL')
    if (filter === 'SESSION') return base.filter((e) => e.sessionId === 'S-84729')
    return base
  }, [events, filter, limit])

  const newestId = events[0]?.id

  return (
    <Panel
      title={title}
      cutSize="md"
      tone="blue"
      grid
      right={
        <div className="flex items-center gap-1.5">
          <StatusPip tone="ok" size={5} />
          <span className="font-mono text-[9px] tnum text-muted">{rows.length} EVENTS</span>
        </div>
      }
    >
      {/* filter strip */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[#1a1a1a] bg-[#0c0c0c] px-2.5 py-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className="cursor-pointer px-2 py-[3px] font-pixel-xs transition-colors"
            style={{
              ...cut('sm'),
              background: filter === f.key ? '#244bff' : 'transparent',
              color: filter === f.key ? '#050505' : '#666',
              boxShadow: filter === f.key ? 'none' : 'inset 0 0 0 1px #222',
            }}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[9px] tracking-[0.16em] text-[#3d3d3d]">AUTO-REFRESH 3.4s</span>
      </div>

      {/* column header */}
      <div
        className="grid grid-cols-[58px_minmax(0,1.15fr)_minmax(0,1fr)_auto] gap-2 border-b border-[#1a1a1a] px-3 py-[5px] font-mono text-[9px] tracking-[0.18em] text-[#3d3d3d]"
        style={{ gridTemplateColumns: '58px minmax(0,1.15fr) minmax(0,1fr) 88px' }}
      >
        <span>TIME</span>
        <span>EVENT</span>
        <span>SUBJECT</span>
        <span className="text-right">STATUS</span>
      </div>

      <ul className="overflow-y-auto" style={{ height }}>
        <AnimatePresence initial={false}>
          {rows.map((e, i) => {
            const tone = STATUS_TONE[e.status] ?? 'neutral'
            const t = TONES[tone]
            const isNew = e.id === newestId && i === 0
            return (
              <motion.li
                key={e.id}
                layout
                initial={{ opacity: 0, x: -10, backgroundColor: 'rgba(36,75,255,0.16)' }}
                animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(0,0,0,0)' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="grid items-center gap-2 border-b border-[#141414] px-3 py-[7px] transition-colors hover:bg-[#121218]"
                style={{ gridTemplateColumns: '58px minmax(0,1.15fr) minmax(0,1fr) 88px' }}
              >
                <span className="font-mono text-[10px] tnum text-muted">{e.time}</span>
                <span className="truncate font-mono text-[11px] uppercase tracking-[0.08em] text-bone">
                  {e.kind}
                  {isNew && (
                    <span className="ml-1 inline-block align-middle">
                      <Caret tone={tone} />
                    </span>
                  )}
                </span>
                <span className="truncate font-mono text-[11px] text-ash">{e.subject}</span>
                <span className="flex justify-end">
                  <span
                    className="truncate px-[6px] py-[2px] font-pixel-xs"
                    style={{
                      ...cut('sm'),
                      background: t.bg,
                      color: t.text,
                      boxShadow: `inset 0 0 0 1px rgba(${t.rgb},0.35)`,
                    }}
                  >
                    {e.status}
                  </span>
                </span>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>

      <div className="flex items-center justify-between border-t border-[#1a1a1a] px-3 py-[6px] font-mono text-[9px] tracking-[0.16em] text-[#3d3d3d]">
        <span>STREAM: IT-EVENTS-01 · RETAINED 60</span>
        <span className="flex items-center gap-1.5">
          <span className="h-[6px] w-[6px] bg-ok" aria-hidden />
          INGESTING
        </span>
      </div>
    </Panel>
  )
}

/** Compact live ticker strip for page headers. */
export function EventTicker({ events }: { events: SecurityEvent[] }) {
  const line = useMemo(
    () =>
      events
        .slice(0, 8)
        .map((e) => `${e.time} ${e.kind} ${e.subject} [${e.status}]`)
        .join('   ·   '),
    [events],
  )
  return (
    <div className="relative flex h-[20px] items-center overflow-hidden border-y border-[#151515] bg-[#080808]">
      <span className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#080808] to-transparent" />
      <div className="w-max shrink-0 whitespace-nowrap font-mono text-[9px] tracking-[0.14em] text-[#4a4a4a]">
        <span className="px-4">{line}</span>
        <span className="px-4">{line}</span>
      </div>
    </div>
  )
}