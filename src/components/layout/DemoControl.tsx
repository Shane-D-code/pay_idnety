import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSim, STAGES, TOTAL_STAGES } from '@/sim/SimulationProvider'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { Panel } from '@/components/ui/Panel'
import { Badge, Bar, StatusPip } from '@/components/ui/indicators'
import { Caret } from '@/components/ui/TypeLine'
import { cut } from '@/components/ui/tokens.tsx'
import { useRouter } from '@/lib/router'

interface DemoControlProps {
  crt: boolean
  onToggleCrt: () => void
}

/**
 * Section 32 — the demo never depends on an external API, so the operator
 * always has a deterministic way to drive the scenario.
 */
export function DemoControl({ crt, onToggleCrt }: DemoControlProps) {
  const [open, setOpen] = useState(false)
  const sim = useSim()
  const { navigate } = useRouter()

  const riskPct = (sim.riskTarget / 100) * 100

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="group relative flex cursor-pointer items-center gap-2 px-3 py-[7px] font-pixel-xs"
        style={{
          ...cut('sm'),
          background: open ? '#244bff' : '#0b0b0b',
          color: open ? '#050505' : '#5b72ff',
          boxShadow: `inset 0 0 0 1px ${open ? '#5b72ff' : 'rgba(91,114,255,0.5)'}`,
        }}
        aria-expanded={open}
      >
        <span
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ background: open ? '#35ff72' : '#5b72ff', boxShadow: '0 0 8px currentColor' }}
          aria-hidden
        />
        DEMO CONTROL
        <Caret tone={open ? 'bright' : 'blue'} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-[calc(100%+6px)] z-50 w-[320px]"
            initial={{ opacity: 0, y: -6, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, y: -4, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <Panel cutSize="md" tone="bright" weight={2} brackets>
              <div className="flex items-center justify-between border-b border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2">
                <span className="font-pixel-xs text-soft">DEMO CONTROL</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer font-mono text-[10px] text-muted hover:text-bone"
                >
                  [ESC]
                </button>
              </div>

              <div className="px-3 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-muted">SIMULATION STATE</span>
                  <Badge tone={sim.stage === 0 ? 'ok' : sim.stage >= 9 ? 'crit' : 'warn'}>
                    STAGE {String(sim.stage).padStart(2, '0')}/{TOTAL_STAGES}
                  </Badge>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <StatusPip tone={sim.stage === 0 ? 'ok' : 'warn'} />
                  <span className="font-mono text-[11px] text-bone">
                    {sim.stage === 0 ? 'IDLE · BASELINE' : STAGES[sim.stage - 1].title}
                  </span>
                </div>

                <Bar value={sim.stage * 10} tone={sim.stage >= 9 ? 'crit' : 'blue'} height={4} className="mt-2" />

                <div className="mt-3 flex items-center justify-between font-mono text-[10px] text-muted">
                  <span>BEHAVIORAL RISK</span>
                  <span className="tnum" style={{ color: riskPct > 80 ? '#ff3344' : '#5b72ff' }}>
                    {sim.riskTarget}/100
                  </span>
                </div>
                <Bar value={riskPct} tone={riskPct > 80 ? 'crit' : riskPct > 50 ? 'warn' : 'blue'} height={4} segments={24} />

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <TerminalButton
                    label="RESET SIM"
                    tone="neutral"
                    size="xs"
                    block
                    onClick={() => {
                      sim.reset()
                    }}
                  />
                  <TerminalButton
                    label="SIMULATE"
                    tone="blue"
                    size="xs"
                    block
                    active
                    onClick={() => {
                      sim.start()
                      setOpen(false)
                    }}
                  />
                  <TerminalButton
                    label="COMPLETE ATTACK"
                    tone="crit"
                    size="xs"
                    block
                    onClick={() => sim.completeAttack()}
                  />
                  <TerminalButton
                    label="NORMAL MODE"
                    tone="ok"
                    size="xs"
                    block
                    onClick={() => sim.goToStage(0)}
                  />
                </div>

                <div className="mt-4">
                  <div className="font-mono text-[10px] tracking-[0.18em] text-muted">SPEED</div>
                  <div className="mt-1.5 flex gap-2">
                    {[1, 2, 3].map((s) => (
                      <TerminalButton
                        key={s}
                        label={`${s}×`}
                        tone="blue"
                        size="xs"
                        block
                        active={sim.speed === s}
                        onClick={() => sim.setSpeed(s)}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-mono text-[10px] tracking-[0.18em] text-muted">JUMP TO STAGE</div>
                  <div className="mt-1.5 grid grid-cols-5 gap-1.5">
                    {Array.from({ length: TOTAL_STAGES }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => sim.goToStage(i + 1)}
                        className="cursor-pointer py-[5px] font-mono text-[10px] transition-colors"
                        style={{
                          ...cut('sm'),
                          background: sim.stage === i + 1 ? '#244bff' : '#0b0b0b',
                          color: sim.stage === i + 1 ? '#050505' : sim.stage > i + 1 ? '#5b72ff' : '#4a4a4a',
                          boxShadow: `inset 0 0 0 1px ${sim.stage === i + 1 ? '#5b72ff' : 'rgba(91,114,255,0.25)'}`,
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#1a1a1a] pt-3">
                  <button
                    type="button"
                    onClick={onToggleCrt}
                    className="cursor-pointer text-left"
                    style={{ ...cut('sm'), background: '#0b0b0b', boxShadow: `inset 0 0 0 1px ${crt ? 'rgba(91,114,255,0.6)' : '#232323'}` }}
                  >
                    <span className="block px-2 py-[6px] font-pixel-xs" style={{ color: crt ? '#5b72ff' : '#666' }}>
                      CRT FX {crt ? 'ON' : 'OFF'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/attacktrace')
                      setOpen(false)
                    }}
                    className="cursor-pointer text-left"
                    style={{ ...cut('sm'), background: '#0b0b0b', boxShadow: 'inset 0 0 0 1px rgba(91,114,255,0.25)' }}
                  >
                    <span className="block px-2 py-[6px] font-pixel-xs text-soft">OPEN TRACE</span>
                  </button>
                </div>

                <p className="mt-3 font-mono text-[9px] leading-relaxed tracking-[0.1em] text-[#4a4a4a]">
                  ALL DATA SYNTHETIC. NO EXTERNAL API. EVERY PAGE REACTS TO ONE SIMULATION STATE.
                </p>
              </div>
            </Panel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}