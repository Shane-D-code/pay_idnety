import { motion } from 'framer-motion'
import { Panel } from '@/components/ui/Panel'
import { RISK_CONTRIBUTIONS } from '@/data'
import { useSim } from '@/sim/SimulationProvider'
import { useCountUp } from '@/lib/hooks'
import { SegmentMeter } from './Gauges'
import { TONES } from '@/components/ui/tokens.tsx'

/** Section 16 — behavioral risk: big meter, animated score, contribution ledger. */
export function RiskPanel({
  compact = false,
  showLedger = true,
}: {
  compact?: boolean
  showLedger?: boolean
}) {
  const sim = useSim()
  const target = sim.riskTarget
  const shown = useCountUp(target, 1600)
  const tone = target >= 85 ? 'crit' : target >= 55 ? 'warn' : 'blue'
  const t = TONES[tone]

  /* the ledger reveals its rows as the score climbs */
  const revealed = Math.round((target / 100) * RISK_CONTRIBUTIONS.length)
  const runningTotal = RISK_CONTRIBUTIONS.slice(0, revealed).reduce((a, c) => a + c.value, 0)

  return (
    <Panel
      title="BEHAVIORAL RISK"
      tone={tone}
      cutSize="md"
      weight={target >= 85 ? 2 : 1}
      right={
        <span className="font-mono text-[9px] tracking-[0.18em] text-muted">
          {sim.stage === 0 ? 'SESSION S-84729 · BASELINE' : `STAGE ${String(sim.stage).padStart(2, '0')} · LIVE`}
        </span>
      }
    >
      <div className="px-4 py-4">
        {/* score */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="font-pixel-xs text-muted">BEHAVIORAL RISK</div>
            <div className="mt-2 flex items-end gap-1.5">
              <motion.span
                key={tone}
                className="font-pixel-md leading-none tnum"
                style={{ color: t.text, textShadow: `0 0 20px rgba(${t.rgb},0.55)` }}
                animate={{ opacity: [1, 0.72, 1] }}
                transition={{ duration: tone === 'crit' ? 0.9 : 2.6, repeat: Infinity, repeatType: 'mirror' }}
              >
                {String(Math.round(shown)).padStart(2, '0')}
              </motion.span>
              <span className="mb-[3px] font-mono text-[12px] text-muted">/100</span>
            </div>
          </div>
          <div className="text-right">
            <div className="font-pixel-xs text-muted">TRUST STATE</div>
            <motion.div
              key={sim.trustState}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-2 font-pixel-xs"
              style={{ color: TONES[sim.trustState === 'NORMAL' ? 'ok' : sim.trustState === 'ISOLATED' ? 'crit' : 'warn'].text }}
            >
              {sim.trustState}
            </motion.div>
          </div>
        </div>

        <div className="mt-3">
          <SegmentMeter value={shown} tone={tone} segments={compact ? 28 : 40} height={compact ? 16 : 20} />
        </div>

        {showLedger && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="font-pixel-xs text-muted">RISK CONTRIBUTION</span>
              <span className="h-px flex-1 bg-[#1e1e1e]" />
              <span className="font-mono text-[9px] tnum text-muted">{revealed}/6 SIGNALS</span>
            </div>

            <ul className="space-y-[3px]">
              {RISK_CONTRIBUTIONS.map((c, i) => {
                const on = i < revealed
                return (
                  <motion.li
                    key={c.label}
                    initial={false}
                    animate={{ opacity: on ? 1 : 0.22 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2 border-b border-[#141414] pb-[3px] last:border-b-0"
                  >
                    <span
                      className="w-[26px] shrink-0 font-mono text-[10px] tnum"
                      style={{ color: on ? '#ff3344' : '#3d3d3d' }}
                    >
                      +{c.value}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-[10px] tracking-[0.12em] text-bone">
                        {c.label}
                      </span>
                      <span className="block truncate font-mono text-[9px] text-[#4a4a4a]">{c.detail}</span>
                    </span>
                    <span
                      className="h-[6px] w-[6px] shrink-0"
                      style={{ background: on ? '#ff3344' : '#1c1c1c' }}
                      aria-hidden
                    />
                  </motion.li>
                )
              })}
            </ul>

            <div
              className="mt-3 flex items-center justify-between px-3 py-2"
              style={{ ...{ background: t.bg, boxShadow: `inset 0 0 0 1px rgba(${t.rgb},0.4)` } }}
            >
              <span className="font-pixel-xs text-ash">TOTAL</span>
              <span className="flex items-baseline gap-1">
                <span className="font-pixel-sm tnum" style={{ color: t.text }}>
                  {sim.stage >= 9 ? 100 : runningTotal}
                </span>
                <span className="font-mono text-[10px] text-muted">/100</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}