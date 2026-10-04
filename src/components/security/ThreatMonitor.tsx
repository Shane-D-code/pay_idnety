import { AnimatePresence, motion } from 'framer-motion'
import { THREAT_STATES } from '@/data'
import { Panel } from '@/components/ui/Panel'
import { StatusPip } from '@/components/ui/indicators'
import { TONES, cut, type Tone } from '@/components/ui/tokens.tsx'

const ORDER = ['NORMAL', 'OBSERVING', 'SUSPICIOUS', 'HIGH', 'CRITICAL', 'ISOLATED'] as const
const TONE_BY_KEY: Record<string, Tone> = {
  NORMAL: 'ok',
  OBSERVING: 'blue',
  SUSPICIOUS: 'blue',
  HIGH: 'warn',
  CRITICAL: 'crit',
  ISOLATED: 'crit',
}

/** Section 11 — dramatic, unmistakable threat-state readout. */
export function ThreatMonitorPanel({ threatKey }: { threatKey: string }) {
  const threat = THREAT_STATES[threatKey] ?? THREAT_STATES.NORMAL
  const tone = TONE_BY_KEY[threatKey] ?? 'ok'
  const t = TONES[tone]
  const levelIdx = ORDER.indexOf(threatKey as (typeof ORDER)[number])
  const word = threat.state === 'HIGH RISK' ? 'HIGH' : threat.state
  /* Press Start 2P is monospace — ~13px per glyph at font-pixel-md including
     tracking. Size the core to the state word so long states (SUSPICIOUS,
     ISOLATED) stay inside the scan field instead of spilling out of it. */
  const coreW = Math.max(76, word.length * 13 + 12)

  return (
    <Panel
      title="THREAT MONITOR"
      cutSize="md"
      tone={tone === 'ok' ? 'blue' : tone}
      weight={tone === 'crit' ? 2 : 1}
      right={<StatusPip tone={tone} />}
    >
      <div className="relative px-3.5 py-4">
        <div className="pointer-events-none absolute inset-0 pixel-grid-sm opacity-50" aria-hidden />

        <div className="relative flex flex-col items-center py-2 text-center">
          {/* pixel status core — width tracks the state word */}
          <div
            className="relative mb-4 flex h-[76px] items-center justify-center"
            style={{ width: coreW }}
          >
            <span
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, ${t.bar} 0 6px, transparent 6px 9px)`,
                maskImage: 'radial-gradient(circle, black 30%, transparent 72%)',
                WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 72%)',
              }}
              aria-hidden
            />
            <motion.span
              className="absolute inset-2"
              style={{ boxShadow: `inset 0 0 0 1px ${t.bar}`, background: t.bg }}
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: tone === 'crit' ? 0.9 : 2.4, repeat: Infinity, repeatType: 'mirror' }}
              aria-hidden
            />
            <AnimatePresence mode="wait">
              <motion.span
                key={threat.state}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.22 }}
                className="relative px-1 font-pixel-md leading-none"
                style={{ color: t.text, textShadow: `0 0 18px rgba(${t.rgb},0.6)` }}
              >
                {word}
              </motion.span>
            </AnimatePresence>
          </div>

          <p className="max-w-[240px] font-mono text-[10px] leading-relaxed tracking-[0.08em] text-muted">
            {threat.blurb}
          </p>
        </div>

        {/* escalation ladder */}
        <div className="relative mt-4 space-y-[3px]">
          {ORDER.map((k, i) => {
            const on = i <= levelIdx
            const here = i === levelIdx
            const kt = TONES[TONE_BY_KEY[k]]
            const label = k === 'HIGH' ? 'HIGH RISK' : k
            return (
              <div
                key={k}
                className="flex items-center gap-2 px-2 py-[3px]"
                style={{
                  ...cut('sm'),
                  background: here ? kt.bg : 'transparent',
                  boxShadow: here ? `inset 0 0 0 1px rgba(${kt.rgb},0.45)` : 'none',
                }}
              >
                <span
                  className="h-[7px] w-[7px] shrink-0"
                  style={{
                    background: on ? kt.bar : '#1c1c1c',
                    boxShadow: on ? `0 0 8px ${kt.bar}` : 'none',
                  }}
                  aria-hidden
                />
                <span
                  className="flex-1 font-pixel-xs"
                  style={{ color: here ? kt.text : on ? '#7a7a7a' : '#3d3d3d' }}
                >
                  {label}
                </span>
                {here && <StatusPip tone={TONE_BY_KEY[k]} size={5} />}
              </div>
            )
          })}
        </div>
      </div>
    </Panel>
  )
}