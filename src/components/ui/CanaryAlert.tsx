import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Modal } from './Modal'
import { TerminalButton } from './TerminalButton'
import { KeyValue } from './indicators'
import { PixelSkull } from './PixelGlyph'
import { useSim } from '@/sim/SimulationProvider'
import { useNavigate } from '@/lib/router'
import { cut } from './tokens'
import { useCountUp } from '@/lib/hooks'

/**
 * Section 19 — the canary credential fires and the whole console is replaced
 * by an old-style security alert.
 */
export function CanaryAlert() {
  const sim = useSim()
  const navigate = useNavigate()
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!sim.alertOpen) {
      setPhase(0)
      return
    }
    const a = window.setTimeout(() => setPhase(1), 420)
    const b = window.setTimeout(() => setPhase(2), 1500)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [sim.alertOpen])

  const risk = useCountUp(phase >= 2 ? 100 : 74, 1400)

  return (
    <Modal open={sim.alertOpen} onClose={sim.closeAlert} width="max-w-[660px]">
      <motion.div
        className="relative"
        style={{
          ...cut('lg'),
          background: phase >= 2 ? '#ff3344' : '#8a6a12',
          padding: 2,
          transition: 'background 500ms linear',
        }}
      >
        <div className="relative overflow-hidden" style={{ ...cut('lg'), background: '#08080a' }}>
          {/* top hazard strip */}
          <div className="relative flex h-[26px] items-center justify-center overflow-hidden">
            <span
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(-45deg, ${phase >= 2 ? '#ff3344' : '#ffd43b'} 0 10px, transparent 10px 22px)`,
                opacity: 0.28,
              }}
              aria-hidden
            />
            <motion.span
              className="relative px-4 font-pixel-xs"
              style={{
                color: phase >= 2 ? '#ff3344' : '#ffd43b',
                background: '#08080a',
                textShadow: `0 0 14px ${phase >= 2 ? '#ff3344' : '#ffd43b'}`,
              }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: 'mirror' }}
            >
              {phase >= 2 ? 'SESSION TERMINATED // MALICIOUS INTENT CONFIRMED' : 'CREDENTIAL DECOY ACCESSED'}
            </motion.span>
          </div>

          <div className={`relative px-6 py-6 ${phase >= 2 ? 'warning-flash' : ''}`}>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="shrink-0">
                <motion.div
                  animate={{ scale: phase >= 2 ? [1, 1.04, 1] : 1 }}
                  transition={{ duration: 0.7, repeat: phase >= 2 ? Infinity : 0, repeatType: 'mirror' }}
                >
                  <PixelSkull px={9} color={phase >= 2 ? '#ff3344' : '#ffd43b'} />
                </motion.div>
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h2
                  className="glitch font-pixel-sm"
                  data-text="CANARY TRIGGERED"
                  style={{
                    color: phase >= 2 ? '#ff3344' : '#ffd43b',
                    textShadow: `0 0 18px ${phase >= 2 ? 'rgba(255,51,68,0.6)' : 'rgba(255,212,59,0.5)'}`,
                  }}
                >
                  CANARY TRIGGERED
                </h2>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="space-y-0.5">
                    <KeyValue k="CANARY" v="PAYPAL_SECRET_0042" tone="warn" />
                    <KeyValue k="SESSION" v="S-84729" tone="ash" />
                    <KeyValue k="IDENTITY" v="ADWIKA · USR_1024" tone="ash" />
                  </div>
                  <div className="space-y-0.5">
                    <KeyValue k="RESOURCE" v="/finance/api-credentials" tone="ash" />
                    <KeyValue k="CONFIDENCE" v="98.7%" tone="crit" />
                    <KeyValue k="EVIDENCE" v="SEALED" tone="ok" />
                  </div>
                </div>
              </div>
            </div>

            {/* risk / trust transition */}
            <div className="mt-6 grid gap-px bg-[#1a1a1a] sm:grid-cols-2">
              <div className="bg-[#0b0b0b] px-3 py-2.5">
                <div className="font-pixel-xs text-muted">BEHAVIORAL RISK</div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="font-mono text-[11px] tnum text-muted">74</span>
                  <span className="font-mono text-[12px] text-crit">→</span>
                  <span
                    className="font-pixel-sm leading-none tnum text-crit"
                    style={{ textShadow: '0 0 16px rgba(255,51,68,0.6)' }}
                  >
                    {risk}
                  </span>
                </div>
              </div>
              <div className="bg-[#0b0b0b] px-3 py-2.5">
                <div className="font-pixel-xs text-muted">TRUST STATE</div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="font-pixel-xs transition-opacity duration-300"
                    style={{ color: '#ffd43b', opacity: phase >= 2 ? 0.4 : 1 }}
                  >
                    DECOY
                  </span>
                  <span className="font-mono text-[12px] text-crit">→</span>
                  <span
                    className="font-pixel-xs text-crit"
                    style={{ textShadow: '0 0 14px rgba(255,51,68,0.7)', opacity: phase >= 2 ? 1 : 0.25 }}
                  >
                    ISOLATED
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-4 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-muted">
              THE ATTACKER READ A SYNTHETIC SECRET THAT HAS NO OPERATIONAL VALUE. THIS CONFIRMS INTENT TO
              MONETISE THE STOLEN SESSION — IDENTITYTWIN NOW ISOLATES IT AND LEARNS FROM IT.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <TerminalButton
                label="VIEW ATTACKTRACE"
                tone="blue"
                size="sm"
                onClick={() => {
                  sim.closeAlert()
                  navigate('/attacktrace')
                }}
              />
              <TerminalButton
                label="OPEN INCIDENT"
                tone="warn"
                size="sm"
                onClick={() => {
                  sim.closeAlert()
                  navigate('/incidents')
                }}
              />
              <TerminalButton
                label="DISMISS"
                tone="neutral"
                size="sm"
                onClick={sim.closeAlert}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#171717] px-4 py-2 font-mono text-[9px] tracking-[0.18em] text-[#4a4a4a]">
            <span>SIMULATION ENVIRONMENT · SYNTHETIC DATA</span>
            <span>CANARY PAYPAL_SECRET_0042</span>
          </div>
        </div>
      </motion.div>
    </Modal>
  )
}

/** Compact critical banner used in-page when the canary has fired. */
export function CanaryBanner() {
  const sim = useSim()
  const navigate = useNavigate()
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (sim.canaryTriggered) {
      const t = window.setTimeout(() => setShown(true), 400)
      return () => window.clearTimeout(t)
    }
    setShown(false)
  }, [sim.canaryTriggered])

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="relative mb-4"
          style={{ ...cut('md'), background: '#8a1e28', padding: 2 }}
        >
          <div
            className="warning-flash flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            style={{ ...cut('md'), background: '#0b0808' }}
          >
            <div className="flex items-center gap-3">
              <PixelSkull px={4} color="#ff3344" animated={false} />
              <div>
                <div className="font-pixel-xs text-crit">CANARY PAYPAL_SECRET_0042 TRIGGERED</div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.1em] text-ash">
                  SESSION S-84729 ISOLATED · CONFIDENCE 98.7% · INCIDENT #INC-84729 OPENED
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TerminalButton label="REPLAY ALERT" tone="crit" size="xs" onClick={sim.openAlert} />
              <TerminalButton label="OPEN INCIDENT" tone="warn" size="xs" onClick={() => navigate('/incidents')} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}