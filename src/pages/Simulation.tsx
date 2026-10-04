import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Panel } from '@/components/ui/Panel'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { Badge, KeyValue, StatusPip } from '@/components/ui/indicators'
import { Caret } from '@/components/ui/TypeLine'
import { RiskPanel } from '@/components/security/RiskPanel'
import { TrustLadder } from '@/components/security/TrustLadder'
import { useSim, STAGES, TOTAL_STAGES } from '@/sim/SimulationProvider'
import { useNavigate } from '@/lib/router'
import { TONES } from '@/components/ui/tokens.tsx'

interface Step {
  n: number
  title: string
  sub: string
  rows: [string, string][]
  accent: 'blue' | 'warn' | 'crit'
  headline?: string
}

const STEPS: Step[] = [
  {
    n: 1,
    title: 'ATTACKER LOGIN',
    sub: 'STOLEN CREDENTIALS REPLAYED SUCCESSFULLY',
    rows: [
      ['DEVICE', 'UNKNOWN WINDOWS DEVICE · FP 91C4-A7D2-0031'],
      ['LOCATION', 'DELHI, IN · 1,450 KM FROM BASELINE'],
      ['TIME', '03:17 AM · OUTSIDE 08:00–22:30 WINDOW'],
      ['AUTH', 'PASSWORD ACCEPTED · OTP INTERCEPTED'],
      ['SESSION', 'S-84729 CREATED · NO STEP-UP CHALLENGE'],
    ],
    accent: 'warn',
  },
  {
    n: 2,
    title: 'NEW PAYEE CREATED',
    sub: 'BENEFICIARY ADDED INSIDE THE COMPROMISED SESSION',
    rows: [
      ['PAYEE ID', 'PAYEE-NEW-4417'],
      ['PAYEE NAME', 'HOLLOWPOINT TRADING LLC'],
      ['VERIFICATION', 'SKIPPED · IDENTITY HAS 6 KNOWN PAYEES'],
      ['CREATED', '03:18:22 · 78s AFTER LOGIN'],
      ['SIGNAL', 'NEW_PAYEE +16 RISK'],
    ],
    accent: 'warn',
  },
  {
    n: 3,
    title: 'HIGH VALUE PAYOUT',
    sub: 'TRANSFER REQUEST EXCEEDS THE IDENTITY CEILING BY 82×',
    rows: [
      ['AMOUNT', '₹4,80,000'],
      ['BASELINE CEILING', '₹8,000 (MAX OBSERVED 30D)'],
      ['RATIO', '60× CEILING · 82× TYPICAL'],
      ['POLICY', 'HELD FOR REVIEW · NO FUNDS MOVED'],
      ['SIGNAL', 'ABNORMAL_PAYOUT +21 RISK'],
    ],
    accent: 'crit',
    headline: '₹4,80,000',
  },
  {
    n: 4,
    title: 'SENSITIVE API ACCESS',
    sub: 'ATTACKER PROBES SENSITIVE SCOPE BEFORE MONETISING',
    rows: [
      ['ENDPOINT', 'GET /finance/api-credentials'],
      ['SCOPE', 'SENSITIVE · ADMIN READ'],
      ['PREVIOUS', 'NEVER ACCESSED IN 214 ENROLLMENTS'],
      ['POLICY', 'SERVED FROM DECOY ENVIRONMENT'],
      ['SIGNAL', 'SENSITIVE_API +11 RISK'],
    ],
    accent: 'warn',
  },
  {
    n: 5,
    title: 'CUSTOMER DATA SEARCH',
    sub: 'BULK EXPORT ATTEMPT — CONTAINED BY DECOY LAYER',
    rows: [
      ['ENDPOINT', 'GET /customers/search?limit=500'],
      ['QUERY', 'WILDCARD EXPORT'],
      ['RESULT', '1,482 SYNTHETIC RECORDS'],
      ['REAL DATA', 'NEVER TOUCHED · ISOLATED AT PROXY'],
      ['SIGNAL', 'EXFILTRATION INTENT OBSERVED'],
    ],
    accent: 'crit',
  },
  {
    n: 6,
    title: 'CANARY RESOURCE ACCESSED',
    sub: 'THE ATTACKER READ A SECRET THAT DOES NOT EXIST',
    rows: [
      ['CANARY', 'PAYPAL_SECRET_0042'],
      ['LOCATION', '/finance/api-credentials'],
      ['CONFIDENCE', '98.7% MALICIOUS INTENT'],
      ['ACTION', 'SESSION ISOLATED · TOKENS REVOKED'],
      ['NEXT', 'BEHAVIOURAL SIGNATURE EXTRACTION'],
    ],
    accent: 'crit',
    headline: 'CANARY TRIGGERED',
  },
]

function StepCard({ step, revealed, live }: { step: Step; revealed: boolean; live: boolean }) {
  const t = TONES[step.accent]
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (revealed) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [revealed])

  return (
    <div ref={ref} className="relative">
      <div
        className="relative"
        style={{
          clipPath:
            'polygon(0 8px, 4px 4px, 4px 0, calc(100% - 8px) 0, calc(100% - 4px) 4px, calc(100% - 4px) calc(100% - 8px), calc(100% - 8px) calc(100% - 4px), calc(100% - 8px) 100%, 8px 100%, 4px calc(100% - 4px), 4px calc(100% - 8px), 0 calc(100% - 8px))',
          background: revealed ? t.border : '#1a1a1a',
          padding: revealed ? 2 : 1,
          transition: 'background 300ms linear',
        }}
      >
        <div
          className="relative overflow-hidden px-3.5 py-3"
          style={{
            clipPath:
              'polygon(0 8px, 4px 4px, 4px 0, calc(100% - 8px) 0, calc(100% - 4px) 4px, calc(100% - 4px) calc(100% - 8px), calc(100% - 8px) calc(100% - 4px), calc(100% - 8px) 100%, 8px 100%, 4px calc(100% - 4px), 4px calc(100% - 8px), 0 calc(100% - 8px))',
            background: revealed ? '#0b0b0b' : '#080808',
          }}
        >
          {live && revealed && (
            <span
              className="pointer-events-none absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: `repeating-linear-gradient(-45deg, ${t.bar} 0 6px, transparent 6px 14px)`,
              }}
              aria-hidden
            />
          )}

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className="px-2 py-[3px] font-pixel-xs"
                style={{
                  clipPath: 'polygon(0 4px, 4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
                  background: revealed ? t.bar : '#141414',
                  color: revealed ? '#050505' : '#3d3d3d',
                }}
              >
                STEP {String(step.n).padStart(2, '0')}
              </span>
              <h3
                className="font-pixel-xs"
                style={{ color: revealed ? t.text : '#4a4a4a' }}
              >
                {step.title}
              </h3>
            </div>
            {revealed ? <StatusPip tone={step.accent} size={5} /> : <span className="font-mono text-[9px] text-[#2f2f2f]">LOCKED</span>}
          </div>

          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="mt-2.5 font-mono text-[10px] leading-relaxed tracking-[0.08em]" style={{ color: t.text }}>
                  {step.sub}
                </div>
                {step.headline && (
                  <div
                    className="my-3 py-2 text-center font-pixel-md leading-none tnum"
                    style={{ color: t.text, textShadow: `0 0 20px rgba(${t.rgb},0.5)` }}
                  >
                    {step.headline}
                  </div>
                )}
                <dl className="mt-2 space-y-0">
                  {step.rows.map(([k, v], i) => (
                    <motion.div
                      key={k}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 * i }}
                      className="flex items-baseline justify-between gap-3 border-b border-[#161616] py-[4px] last:border-b-0"
                    >
                      <dt className="shrink-0 font-mono text-[9px] tracking-[0.16em] text-muted">{k}</dt>
                      <dd className="text-right font-mono text-[10px] text-bone">{v}</dd>
                    </motion.div>
                  ))}
                </dl>
                {step.n === 6 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#1a1a1a] pt-3">
                    <TerminalButton label="OPEN DECOY ENVIRONMENT" tone="blue" size="xs" onClick={() => navigate('/deception')} />
                    <TerminalButton label="TRIGGER CANARY" tone="crit" size="xs" onClick={() => navigate('/deception')} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {step.n < STEPS.length && (
        <div className="flex h-8 items-center justify-center">
          <motion.span
            className="font-mono text-[11px]"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{ color: revealed ? TONES[step.accent].text : '#242424' }}
            aria-hidden
          >
            ↓
          </motion.span>
        </div>
      )}
    </div>
  )
}

export function Simulation() {
  const sim = useSim()
  const navigate = useNavigate()
  const [armed, setArmed] = useState(false)

  const revealed = new Set(sim.revealedSteps)
  const running = sim.stage > 0

  const startSim = () => {
    setArmed(true)
    sim.start()
  }

  return (
    <div className="space-y-4">
      {/* header + primary action */}
      <Panel
        cutSize="lg"
        tone={running ? 'crit' : 'blue'}
        weight={2}
        brackets
        grid
        right={<Badge tone={running ? 'crit' : 'warn'}>{running ? 'SEQUENCE RUNNING' : 'ARMED'}</Badge>}
      >
        <div className="relative px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-muted">
                <StatusPip tone={running ? 'crit' : 'ok'} />
                {running ? `STAGE ${String(sim.stage).padStart(2, '0')} / ${TOTAL_STAGES} · ${sim.stageKey}` : 'SCENARIO READY'}
              </div>
              <h2 className="mt-2.5 font-pixel-sm text-bone terminal-glow sm:font-pixel-md">
                ATTACK SIMULATION
              </h2>
              <p className="mt-2.5 max-w-[560px] font-mono text-[11px] leading-relaxed text-ash">
                A full ten-stage account-takeover scenario driven by one shared engine. Identity, deception,
                attacktrace, incident and vaccination views all react to the same state.
              </p>

              {armed && running && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 font-mono text-[11px] tracking-[0.14em] text-crit"
                >
                  &gt; SIMULATION STARTED_
                  <Caret tone="crit" />
                </motion.div>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
              {sim.stage === 0 ? (
                <TerminalButton
                  label="▶ SIMULATE ACCOUNT TAKEOVER"
                  tone="blue"
                  size="lg"
                  active
                  onClick={startSim}
                  className="glow-blue"
                />
              ) : (
                <div className="flex flex-wrap justify-end gap-2">
                  <TerminalButton
                    label={sim.paused ? 'RESUME' : 'PAUSE'}
                    tone="warn"
                    size="md"
                    onClick={sim.togglePause}
                  />
                  <TerminalButton label="COMPLETE" tone="crit" size="md" onClick={sim.completeAttack} />
                  <TerminalButton label="RESET" tone="neutral" size="md" onClick={sim.reset} />
                </div>
              )}
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <TerminalButton key={s} label={`${s}×`} tone="blue" size="xs" active={sim.speed === s} onClick={() => sim.setSpeed(s)} />
                ))}
              </div>
            </div>
          </div>

          {/* stage rail */}
          <div className="mt-5 grid gap-1 sm:grid-cols-5 lg:grid-cols-10">
            {STAGES.map((s) => {
              const state = sim.stage > s.n ? 'done' : sim.stage === s.n ? 'active' : 'idle'
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => sim.goToStage(s.n)}
                  className="group cursor-pointer px-1.5 py-[5px] text-left"
                  style={{
                    clipPath: 'polygon(0 4px, 4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
                    background: state === 'active' ? '#244bff' : state === 'done' ? 'rgba(36,75,255,0.14)' : '#0d0d0d',
                    boxShadow: state === 'idle' ? 'inset 0 0 0 1px #1e1e1e' : 'none',
                  }}
                >
                  <span
                    className="block font-mono text-[9px] tnum"
                    style={{ color: state === 'active' ? '#050505' : state === 'done' ? '#8fa0ff' : '#3d3d3d' }}
                  >
                    {String(s.n).padStart(2, '0')}
                  </span>
                  <span
                    className="mt-[2px] block truncate font-pixel-xs leading-[1.6]"
                    style={{
                      color: state === 'active' ? '#050505' : state === 'done' ? '#5b72ff' : '#2f2f2f',
                      fontSize: 6,
                    }}
                    title={s.title}
                  >
                    {s.title}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* step sequence */}
        <div className="space-y-0">
          {STEPS.map((s) => (
            <StepCard key={s.n} step={s} revealed={revealed.has(s.n)} live={running} />
          ))}

          {!running && (
            <Panel cutSize="md" tone="neutral" className="mt-2">
              <div className="px-4 py-4">
                <div className="font-pixel-xs text-muted">SCENARIO BRIEF</div>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-ash">
                  A stolen credential is replayed from an unknown device at 03:17. IdentityTwin does not lock the
                  account — it measures the divergence, reduces trust progressively, and eventually reroutes the
                  attacker into a synthetic environment where their intent becomes observable.
                </p>
                <p className="mt-2 font-mono text-[9px] tracking-[0.14em] text-[#4a4a4a]">
                  ALL IDENTITIES, AMOUNTS AND PAYEES ARE SYNTHETIC.
                </p>
              </div>
            </Panel>
          )}
        </div>

        {/* live rail */}
        <div className="space-y-4">
          <RiskPanel compact />

          <Panel title="TRUST STATE MACHINE" cutSize="md" tone="blue" right={<Badge tone="neutral">{sim.trustState}</Badge>}>
            <div className="px-3 py-3">
              <TrustLadder current={sim.trustState} />
            </div>
          </Panel>

          <Panel
            title="LIVE ENGINE LOG"
            cutSize="md"
            tone={running ? 'warn' : 'neutral'}
            right={<StatusPip tone={running ? 'warn' : 'ok'} size={5} />}
          >
            <div className="px-3 py-2.5">
              {sim.log.length === 0 ? (
                <p className="font-mono text-[10px] leading-relaxed text-muted">
                  AWAITING EVENTS. PRESS <span className="text-soft">▶ SIMULATE ACCOUNT TAKEOVER</span> TO BEGIN THE
                  SEQUENCE.
                </p>
              ) : (
                <ul className="max-h-[260px] space-y-[2px] overflow-y-auto">
                  {sim.log
                    .slice()
                    .reverse()
                    .map((l, i) => (
                      <motion.li
                        key={l.id + i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-baseline gap-2 font-mono text-[10px] leading-[1.5]"
                      >
                        <span className="shrink-0 tnum text-[#333]">{l.time}</span>
                        <span
                          style={{ color: l.tone === 'crit' ? '#ff3344' : l.tone === 'warn' ? '#ffd43b' : '#666' }}
                          aria-hidden
                        >
                          {l.tone === 'info' ? '>' : '!'}
                        </span>
                        <span className="text-ash">{l.text}</span>
                      </motion.li>
                    ))}
                </ul>
              )}
            </div>
          </Panel>

          <Panel title="NEXT ACTIONS" cutSize="md" tone="neutral">
            <div className="grid grid-cols-2 gap-2 p-3">
              <TerminalButton label="IDENTITY TWIN" tone="blue" size="xs" block onClick={() => navigate('/identity')} />
              <TerminalButton label="DECOY ENV" tone="blue" size="xs" block onClick={() => navigate('/deception')} />
              <TerminalButton label="ATTACKTRACE" tone="blue" size="xs" block onClick={() => navigate('/attacktrace')} />
              <TerminalButton label="INCIDENT" tone="warn" size="xs" block onClick={() => navigate('/incidents')} />
            </div>
            <div className="border-t border-[#1a1a1a] px-3 py-2">
              <KeyValue k="TRUST SCORE" v={sim.trustScore} tone={sim.trustScore > 60 ? 'ok' : 'crit'} />
              <KeyValue k="RISK TARGET" v={sim.riskTarget} tone={sim.riskTarget > 80 ? 'crit' : 'blue'} />
              <KeyValue k="DECOY" v={sim.decoyActive ? 'ACTIVE' : 'STANDBY'} tone={sim.decoyActive ? 'ok' : 'ash'} />
              <KeyValue k="CANARY" v={sim.canaryTriggered ? 'TRIGGERED' : 'ARMED'} tone={sim.canaryTriggered ? 'crit' : 'ash'} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}