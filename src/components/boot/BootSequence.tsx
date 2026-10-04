/* ==========================================================================
   BOOT SEQUENCE — the only place the retro OS boot language appears before
   the console. Runs for ~1.8s and hands off to /console automatically.
   ========================================================================== */

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CrtFlash, CrtOverlay } from '@/components/crt/CrtOverlay'
import { Caret } from '@/components/ui/TypeLine'
import { StatusPip } from '@/components/ui/indicators'

const BOOT_LINES: { label: string; dur: number }[] = [
  { label: 'INITIALIZING BEHAVIORAL ENGINE', dur: 300 },
  { label: 'LOADING THREAT ENGINE', dur: 270 },
  { label: 'LOADING DECEPTION', dur: 250 },
  { label: 'LOADING ATTACKTRACE', dur: 250 },
  { label: 'SYSTEM READY', dur: 260 },
]

/** Total runtime — kept deliberately short, the analyst is not made to wait. */
export const BOOT_TOTAL = BOOT_LINES.reduce((a, l) => a + l.dur, 0) + 460

export function BootSequence({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = BOOT_LINES.map((_, i) => window.setTimeout(() => setStep(i + 1), BOOT_LINES[i].dur * (i + 1)))
    const hand = window.setTimeout(onDone, BOOT_TOTAL)
    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      window.clearTimeout(hand)
    }
  }, [onDone])

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[500] flex items-center justify-center overflow-hidden bg-[#030303] px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
      >
        <CrtOverlay intensity={1.3} />
        <div className="pointer-events-none absolute inset-0 pixel-grid opacity-50" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(70% 55% at 50% 45%, rgba(49,85,255,0.14), transparent 70%)',
          }}
          aria-hidden
        />

        <div className="relative w-full max-w-[560px]">
          {/* OS banner */}
          <div className="mb-8 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, letterSpacing: '0.14em' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="glitch font-pixel-sm text-bone sm:font-pixel-md"
              data-text="IDENTITYTWIN OS"
              style={{ textShadow: '0 0 3px rgba(245,245,245,0.7), 0 0 26px rgba(49,85,255,0.6)' }}
            >
              IDENTITYTWIN OS
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-3 font-mono text-[9px] uppercase tracking-[0.3em] text-soft"
            >
              BEHAVIORAL IDENTITY INTELLIGENCE
            </motion.div>
          </div>

          {/* module loader */}
          <div className="border border-[#1c2740] bg-[#05070d]/80 px-4 py-4" style={{ boxShadow: 'inset 0 0 40px rgba(49,85,255,0.07)' }}>
            <div className="mb-3 flex items-center gap-2 border-b border-[#141c2e] pb-2.5">
              <Caret tone="soft" />
              <span className="font-pixel-xs text-ash">KERNEL MODULES</span>
              <span className="ml-auto font-mono text-[9px] tracking-[0.2em] text-[#3f4a66]">
                {String(step).padStart(2, '0')}/{String(BOOT_LINES.length).padStart(2, '0')}
              </span>
            </div>

            <ul className="space-y-[7px]">
              {BOOT_LINES.map((l, i) => {
                const shown = step > i
                const last = i === BOOT_LINES.length - 1
                return (
                  <li key={l.label} className="flex items-center gap-3">
                    <span className="w-3 shrink-0 font-mono text-[11px]" style={{ color: last ? '#35ff72' : '#5b72ff' }}>
                      {shown ? (last ? '✓' : '▸') : '·'}
                    </span>
                    <span
                      className="flex-1 font-mono text-[11.5px] tracking-[0.16em]"
                      style={{
                        color: shown ? (last ? '#35ff72' : '#f5f5f5') : '#2f3a55',
                        textShadow: shown && last ? '0 0 12px rgba(53,255,114,0.5)' : undefined,
                      }}
                    >
                      {l.label}...
                    </span>
                    {shown ? (
                      <span className="font-mono text-[10px] tracking-[0.14em]" style={{ color: last ? '#35ff72' : '#5b72ff' }}>
                        {last ? 'READY' : 'OK'}
                      </span>
                    ) : (
                      <span className="blink h-[9px] w-[6px] bg-[#2f3a55]" />
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* handoff status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 flex items-center justify-between font-mono text-[9.5px] tracking-[0.22em] text-[#3f4a66]"
          >
            <span>CORE · BEHAVIOR · THREAT · DECEPTION · TRACE</span>
            <span className="flex items-center gap-2" style={{ color: step >= BOOT_LINES.length ? '#35ff72' : '#5b72ff' }}>
              <StatusPip tone={step >= BOOT_LINES.length ? 'ok' : 'blue'} size={5} />
              {step >= BOOT_LINES.length ? 'HANDOFF TO CONSOLE' : 'LOADING'}
            </span>
          </motion.div>

          <div className="mt-1.5 h-[3px] w-full overflow-hidden bg-[#0e1420]">
            <motion.div
              className="h-full"
              style={{ background: 'linear-gradient(90deg,#3155FF,#B8FF3D)', boxShadow: '0 0 12px rgba(49,85,255,0.8)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${(step / BOOT_LINES.length) * 100}%` }}
              transition={{ duration: 0.25 }}
            />
          </div>
        </div>

        <CrtFlash trigger={1} />
      </motion.div>
    </AnimatePresence>
  )
}