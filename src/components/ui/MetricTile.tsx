import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Panel } from './Panel'
import { Bar, StatusPip } from './indicators'
import { useCountUp } from '@/lib/hooks'
import { TONES, type Tone } from './tokens'

interface MetricTileProps {
  index: string
  label: string
  value: number
  sub?: string
  delta?: string
  tone?: Tone
  spark?: number[]
  format?: (n: number) => string
  alert?: boolean
}

/**
 * Command-centre metric. Deliberately not a rounded card: a cut-corner
 * terminal block with a pixel-grid field, a counting readout and a signal bar.
 */
export function MetricTile({
  index,
  label,
  value,
  sub,
  delta,
  tone = 'blue',
  spark,
  format = (n) => String(n),
  alert = false,
}: MetricTileProps) {
  const shown = useCountUp(value, 1500, 120)
  const t = TONES[tone]

  const peak = useMemo(() => (spark ? Math.max(...spark) : 1), [spark])

  return (
    <Panel cutSize="md" tone={tone === 'blue' ? 'blue' : tone} grid className="h-full">
      <div className={`relative px-3 py-3 ${alert ? 'warning-flash' : ''}`}>
        {/* corner cut glyph */}
        <span
          className="pointer-events-none absolute right-2 top-2 h-[10px] w-[10px] opacity-70"
          style={{
            background: `linear-gradient(135deg, ${t.border} 0 50%, transparent 50%)`,
          }}
          aria-hidden
        />

        <div className="flex items-center justify-between gap-2">
          <span className="font-pixel-xs text-ash">{label}</span>
          <span className="font-mono text-[9px] text-[#3d3d3d]">{index}</span>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span
            className="font-pixel-sm leading-none tnum"
            style={{ color: t.text, textShadow: `0 0 14px rgba(${t.rgb},0.45)` }}
          >
            {format(shown)}
          </span>
          {sub && <span className="mb-[2px] font-mono text-[10px] text-muted">{sub}</span>}
        </div>

        {delta && (
          <div className="mt-2 flex items-center gap-1.5">
            <StatusPip tone={alert ? 'crit' : tone} size={5} pulse={false} />
            <span
              className="font-mono text-[9px] uppercase tracking-[0.14em]"
              style={{ color: alert ? '#ff3344' : '#666' }}
            >
              {delta}
            </span>
          </div>
        )}

        {spark ? (
          <div className="mt-3 flex h-[22px] items-end gap-[2px]">
            {spark.map((v, i) => (
              <motion.span
                key={i}
                className="flex-1"
                style={{ background: i === spark.length - 1 ? t.bar : `rgba(${t.rgb},0.28)` }}
                initial={{ height: 2 }}
                animate={{ height: `${Math.max(6, (v / peak) * 100)}%` }}
                transition={{ delay: 0.14 + i * 0.035, duration: 0.5, ease: 'easeOut' }}
              />
            ))}
          </div>
        ) : (
          <Bar
            value={Math.min(100, (value / (tone === 'crit' ? 3 : value || 1)) * 100)}
            tone={tone}
            height={3}
            delay={300}
            className="mt-3"
          />
        )}
      </div>
    </Panel>
  )
}