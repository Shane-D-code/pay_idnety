import { motion } from 'framer-motion'
import { HazardStrip, Modal } from './Modal'
import { PixelSkull } from './PixelGlyph'
import { TerminalButton } from './TerminalButton'
import { KeyValue } from './indicators'
import { TONES, cut } from './tokens'

export interface ThreatAlertProps {
  open: boolean
  onClose: () => void
  onInvestigate?: () => void
  onIsolate?: () => void
  sessionId?: string
  title?: string
}

/**
 * Section 24 — the original virus-alert language: pixel skull, chunky
 * borders, warning stripes, terminal typography.
 */
export function ThreatAlert({
  open,
  onClose,
  onInvestigate,
  onIsolate,
  sessionId = 'S-84729',
  title = 'THREAT DETECTED',
}: ThreatAlertProps) {
  return (
    <Modal open={open} onClose={onClose} width="max-w-[520px]">
      <div className="relative" style={{ ...cut('lg'), background: '#ff3344', padding: 2 }}>
        <div className="relative overflow-hidden" style={{ ...cut('lg'), background: '#0a0a0a' }}>
          <HazardStrip tone="crit" label="SECURITY ALERT // ACTIVE BREACH CONTAINMENT" />

          <div className="warning-flash relative px-5 py-5 text-center">
            <motion.h2
              className="glitch font-pixel-sm text-crit"
              data-text={title}
              animate={{ opacity: [1, 0.55, 1] }}
              transition={{ duration: 1.05, repeat: Infinity, repeatType: 'mirror' }}
              style={{ textShadow: '0 0 18px rgba(255,51,68,0.6)' }}
            >
              !!! {title} !!!
            </motion.h2>

            <div className="my-4 flex items-center justify-center">
              <PixelSkull px={11} />
            </div>

            <p className="font-pixel-xs text-ash">ACCESS RESTRICTED</p>

            <div className="mx-auto mt-4 max-w-[320px] text-left">
              <KeyValue k="SESSION" v={sessionId} tone="crit" />
              <KeyValue k="RISK LEVEL" v="CRITICAL" tone="crit" />
              <KeyValue k="TRUST STATE" v="DECOY → ISOLATED" tone="warn" />
              <KeyValue k="EVIDENCE" v="SEALED" tone="ok" />
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              <TerminalButton label="INVESTIGATE" tone="blue" size="sm" onClick={onInvestigate} />
              <TerminalButton label="ISOLATE SESSION" tone="crit" size="sm" onClick={onIsolate} active />
              <TerminalButton label="DISMISS" tone="neutral" size="sm" onClick={onClose} />
            </div>
          </div>

          <div
            className="flex items-center justify-between border-t px-4 py-2 font-mono text-[9px] tracking-[0.18em]"
            style={{ borderColor: '#1a1a1a', color: TONES.ash.text }}
          >
            <span>SIMULATION ENVIRONMENT · SYNTHETIC DATA</span>
            <span>ESC TO DISMISS</span>
          </div>
        </div>
      </div>
    </Modal>
  )
}



/** Section 35 — terminal empty state. */
export function EmptyState({
  title,
  status,
  body,
  action,
  tone = 'ok',
}: {
  title: string
  status: string
  body?: string
  action?: React.ReactNode
  tone?: 'ok' | 'neutral' | 'warn'
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div
        className="mb-4 h-[10px] w-[120px] opacity-60"
        style={{ backgroundImage: `repeating-linear-gradient(90deg, ${TONES[tone].bar} 0 4px, transparent 4px 8px)` }}
        aria-hidden
      />
      <h3 className="font-pixel-xs text-ash">{title}</h3>
      <p className="mt-3 font-mono text-[11px] tracking-[0.16em]" style={{ color: TONES[tone].text }}>
        SYSTEM STATUS: {status}
      </p>
      {body && <p className="mt-2 max-w-[420px] font-mono text-[11px] leading-relaxed text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}