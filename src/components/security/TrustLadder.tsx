import { AnimatePresence, motion } from 'framer-motion'
import { TRUST_LADDER, type TrustState } from '@/data'
import { TONES, cut } from '@/components/ui/tokens.tsx'
import { StatusPip } from '@/components/ui/indicators'

const STATE_TONE: Record<TrustState, keyof typeof TONES> = {
  NORMAL: 'ok',
  RESTRICTED: 'warn',
  DECOY: 'blue',
  ISOLATED: 'crit',
}

const ORDER: TrustState[] = ['NORMAL', 'RESTRICTED', 'DECOY', 'ISOLATED']

/**
 * Section 17 — progressive trust collapse rendered as a terminal state
 * machine rather than a progress bar.
 */
export function TrustLadder({
  current,
  compact = false,
}: {
  current: TrustState
  compact?: boolean
}) {
  const currentIdx = ORDER.indexOf(current)

  return (
    <div className="space-y-0">
      {TRUST_LADDER.map((step, i) => {
        const active = i === currentIdx
        const passed = i < currentIdx
        const tone = STATE_TONE[step.state]
        const t = TONES[tone]

        return (
          <div key={step.state} className="relative flex items-stretch">
            {/* rail + connector */}
            <div className="relative flex w-[26px] shrink-0 flex-col items-center">
              <span
                className="absolute top-0 h-full w-[2px]"
                style={{ background: passed ? '#244bff' : active ? t.bar : '#1c1c1c' }}
                aria-hidden
              />
              <motion.span
                className="relative mt-[14px] flex h-[11px] w-[11px] items-center justify-center"
                style={{
                  background: active ? t.bar : passed ? '#244bff' : '#151515',
                  boxShadow: active ? `0 0 12px ${t.bar}` : 'inset 0 0 0 1px #2a2a2a',
                }}
                animate={active ? { scale: [1, 1.25, 1] } : undefined}
                transition={{ duration: 1.6, repeat: Infinity, repeatType: 'mirror' }}
                aria-hidden
              />
            </div>

            {/* body */}
            <div
              className="relative mb-1.5 flex-1 px-3 py-2 transition-colors duration-300"
              style={{
                ...cut('sm'),
                background: active ? t.bg : passed ? 'rgba(36,75,255,0.05)' : '#0b0b0b',
                boxShadow: `inset 0 0 0 1px ${active ? `rgba(${t.rgb},0.55)` : '#1c1c1c'}`,
                opacity: active || passed ? 1 : 0.45,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-[#3d3d3d]">{step.index}</span>
                  <span
                    className="font-pixel-xs"
                    style={{ color: active ? t.text : passed ? '#8fa0ff' : '#6b6b6b' }}
                  >
                    {step.state}
                  </span>
                </span>
                {active && <StatusPip tone={tone} size={5} />}
              </div>
              <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.14em]"
                  style={{ color: active ? '#f5f5f5' : '#7a7a7a' }}
                >
                  {step.permission}
                </span>
                {!compact && (
                  <span className="font-mono text-[9px] tracking-[0.1em] text-[#4a4a4a]">{step.detail}</span>
                )}
              </div>
            </div>

            {/* arrow */}
            {i < TRUST_LADDER.length - 1 && (
              <span
                className="absolute -bottom-[9px] left-[9px] z-10 font-mono text-[9px]"
                style={{ color: passed ? '#5b72ff' : '#242424' }}
                aria-hidden
              >
                ▼
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Horizontal variant — a terminal progress indicator with state cells. */
export function TrustProgressBar({ current }: { current: TrustState }) {
  const idx = ORDER.indexOf(current)
  return (
    <div>
      <div className="flex items-stretch gap-1">
        {ORDER.map((s, i) => {
          const tone = STATE_TONE[s]
          const on = i <= idx
          /* min-w-0 so the flex items can shrink — without it min-width:auto pins
             each segment to the full pixel-font label width and truncate is dead */
          return (
            <div key={s} className="relative min-w-0 flex-1">
              <motion.div
                className="h-[10px]"
                style={{ background: on ? TONES[tone].bar : '#151515', boxShadow: on ? `0 0 10px ${TONES[tone].bar}90` : 'inset 0 0 0 1px #1c1c1c' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
              />
              <span
                className="mt-1.5 block truncate font-pixel-xs"
                style={{ color: on ? TONES[tone].text : '#3d3d3d' }}
              >
                {s}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TrustBadge({ state }: { state: TrustState }) {
  const tone = STATE_TONE[state]
  const t = TONES[tone]
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-[3px] font-pixel-xs"
      style={{
        ...cut('sm'),
        background: t.bg,
        color: t.text,
        boxShadow: `inset 0 0 0 1px rgba(${t.rgb},0.45)`,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 3 }}
          transition={{ duration: 0.15 }}
        >
          {state}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}