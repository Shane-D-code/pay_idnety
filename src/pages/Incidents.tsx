import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Panel, SubFrame } from '@/components/ui/Panel'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { Badge, KeyValue, SectionLabel, StatusPip } from '@/components/ui/indicators'
import { EmptyState } from '@/components/ui/ThreatAlert'
import { CanaryBanner } from '@/components/ui/CanaryAlert'
import { PixelSkull } from '@/components/ui/PixelGlyph'
import { TypeLine } from '@/components/ui/TypeLine'
import { TONES, type Tone } from '@/components/ui/tokens.tsx'
import { useNavigate } from '@/lib/router'
import { useSim } from '@/sim/SimulationProvider'
import { useCountUp } from '@/lib/hooks'
import { INCIDENT, INCIDENT_QUEUE, ATTACK_VECTOR } from '@/data'

/* ------------------------------------------------------------------ config */

const TONE_OF: Record<'info' | 'warn' | 'crit', Tone> = { info: 'blue', warn: 'warn', crit: 'crit' }

/** Extra forensic context revealed when an analyst selects a timeline entry. */
const ENTRY_CONTEXT: Record<string, [string, string][]> = {
  LOGIN: [
    ['BASELINE', '74 SESSIONS · 214 ENROLLMENTS'],
    ['AUTH METHOD', 'PASSWORD + INTERCEPTED OTP'],
    ['STEP-UP CHALLENGE', 'NOT PRESENTED'],
  ],
  'DEVICE CHANGE': [
    ['KNOWN DEVICE CLASSES', 'MAC · IPHONE'],
    ['FINGERPRINT', '91C4-A7D2-0031 · NEVER OBSERVED'],
    ['ENROLMENT', 'REJECTED — SILENT'],
  ],
  'LOCATION DRIFT': [
    ['LAST KNOWN', 'BANGALORE · 12:41'],
    ['DISPLACEMENT', '1,450 KM IN 00:00:41'],
    ['IMPOSSIBLE TRAVEL', 'YES'],
  ],
  'PAYEE CREATED': [
    ['PAYEE', 'PAYEE-NEW-4417 · HOLLOWPOINT TRADING LLC'],
    ['KNOWN PAYEES', '6 · ALL PRE-VERIFIED'],
    ['VERIFICATION', 'SKIPPED BY POLICY P-11'],
  ],
  'PAYOUT ATTEMPT': [
    ['AMOUNT', '₹4,80,000'],
    ['CEILING (30D MAX)', '₹8,000'],
    ['DISPOSITION', 'HELD · NO FUNDS MOVED'],
  ],
  'API ACCESS': [
    ['ENDPOINT', 'GET /finance/api-credentials'],
    ['SCOPE', 'SENSITIVE · ADMIN READ'],
    ['PREVIOUS ACCESS', 'NEVER IN 214 ENROLLMENTS'],
  ],
  'CANARY TRIGGER': [
    ['CANARY', 'PAYPAL_SECRET_0042'],
    ['VALUE', 'SYNTHETIC · NO OPERATIONAL USE'],
    ['CONFIDENCE', '98.7%'],
  ],
  'SESSION ISOLATED': [
    ['TOKENS', 'REVOKED'],
    ['PAYOUT', 'CANCELLED'],
    ['EVIDENCE', 'SEALED · CHAIN OF CUSTODY INTACT'],
  ],
}

const STATE_TONE: Record<string, Tone> = {
  ISOLATED: 'ok',
  DECOY: 'blue',
  RESTRICTED: 'warn',
}

/** label, description, tone, 24h queue count */
const SEVERITY_MATRIX: [string, string, string, number][] = [
  ['CRITICAL', 'CONFIRMED MALICIOUS INTENT', 'crit', 1],
  ['HIGH', 'DIVERGENCE ABOVE THRESHOLD', 'warn', 1],
  ['MODERATE', 'BEHAVIOUR OUTSIDE BAND', 'soft', 2],
  ['LOW', 'WITHIN ESTABLISHED BASELINE', 'ok', 0],
]

/* ------------------------------------------------------------------ report */

function ReportBlock({ index }: { index: number }) {
  const para = INCIDENT.report[index]
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.12 }}
      className="font-mono text-[11px] leading-[1.85] tracking-[0.02em] text-ash"
    >
      <span className="mr-2 text-[#3d3d3d]">{String(index + 1).padStart(2, '0')}│</span>
      {para}
    </motion.p>
  )
}

/* ---------------------------------------------------------------- timeline */

function Timeline() {
  const [sel, setSel] = useState<number | null>(null)
  const shown = INCIDENT.timeline.length

  return (
    <div>
      <ol className="relative">
        {/* spine */}
        <span className="absolute bottom-2 left-[46px] top-2 w-px bg-[#1e1e1e]" aria-hidden />

        {INCIDENT.timeline.slice(0, shown).map((e, i) => {
          const tone = TONE_OF[e.tone]
          const t = TONES[tone]
          const on = sel === i
          return (
            <motion.li
              key={`${e.time}-${e.title}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, delay: i * 0.07 }}
              className="relative"
            >
              <button
                type="button"
                onClick={() => setSel(on ? null : i)}
                className="group flex w-full cursor-pointer items-start gap-3 py-[7px] text-left"
                style={{ background: on ? 'rgba(36,75,255,0.07)' : 'transparent' }}
                aria-expanded={on}
              >
                <span className="w-[38px] shrink-0 pt-[3px] text-right font-mono text-[10px] tnum text-muted">{e.time}</span>
                <span className="relative z-10 mt-[5px] shrink-0" aria-hidden>
                  <span
                    className="block h-[7px] w-[7px]"
                    style={{ background: t.bar, boxShadow: `0 0 10px ${t.bar}` }}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-pixel-xs" style={{ color: t.text }}>
                      {e.title}
                    </span>
                    {i === shown - 1 && (
                      <span className="blink font-pixel-xs text-[#3d3d3d]">LATEST</span>
                    )}
                  </span>
                  <span className="mt-1 block font-mono text-[10px] leading-relaxed tracking-[0.04em] text-muted">
                    {e.detail}
                  </span>
                </span>
                <span className="shrink-0 pt-[2px] font-mono text-[10px] text-[#333] group-hover:text-soft" aria-hidden>
                  {on ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {on && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-2 ml-[58px] border border-[#1e1e1e] bg-[#0c0c0c] px-3 py-2">
                      <div className="mb-1.5 font-pixel-xs text-muted">SIGNAL CONTEXT</div>
                      {ENTRY_CONTEXT[e.title]?.map(([k, v]) => (
                        <KeyValue key={k} k={k} v={v} tone="ash" gap="gap-4" />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}

/* ---------------------------------------------------------------- actions */

function ActionChecklist() {
  const [done, setDone] = useState<string[]>(INCIDENT.actions)
  const n = useCountUp(done.length, 700)

  return (
    <div>
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-3 py-2">
        <span className="font-pixel-xs text-muted">
          EXECUTED {String(Math.round(n)).padStart(2, '0')}/{String(INCIDENT.actions.length).padStart(2, '0')}
        </span>
        <div className="flex gap-[3px]" aria-hidden>
          {INCIDENT.actions.map((a) => (
            <span
              key={a}
              className="h-[8px] w-[18px]"
              style={{ background: done.includes(a) ? '#35ff72' : '#191919', boxShadow: done.includes(a) ? '0 0 8px rgba(53,255,114,0.6)' : 'inset 0 0 0 1px #232323' }}
            />
          ))}
        </div>
      </div>

      <ul>
        {INCIDENT.actions.map((a, i) => {
          const on = done.includes(a)
          return (
            <motion.li
              key={a}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18, delay: i * 0.06 }}
              className="border-b border-[#141414] last:border-b-0"
            >
              <button
                type="button"
                onClick={() => setDone((p) => (on ? p.filter((x) => x !== a) : [...p, a]))}
                className="flex w-full cursor-pointer items-center gap-3 px-3 py-[9px] text-left"
                aria-pressed={on}
              >
                <span
                  className="flex h-[14px] w-[14px] shrink-0 items-center justify-center font-mono text-[10px]"
                  style={{
                    background: on ? '#35ff72' : '#0b0b0b',
                    color: on ? '#050505' : '#333',
                    boxShadow: on ? '0 0 10px rgba(53,255,114,0.5)' : 'inset 0 0 0 1px #2a2a2a',
                  }}
                  aria-hidden
                >
                  {on ? '✓' : ''}
                </span>
                <span
                  className="flex-1 font-mono text-[11px] tracking-[0.12em]"
                  style={{ color: on ? '#35ff72' : '#a8a8a8' }}
                >
                  {a}
                </span>
                <span className="font-mono text-[9px] tracking-[0.14em] text-[#3d3d3d]">
                  {on ? 'DONE' : 'PENDING'}
                </span>
              </button>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------- queue */

function IncidentQueue({ active }: { active: string }) {
  const navigate = useNavigate()
  return (
    <Panel title="INCIDENT QUEUE" cutSize="md" tone="neutral" right={<Badge tone="neutral">{INCIDENT_QUEUE.length} OPEN</Badge>}>
      <ul>
        {INCIDENT_QUEUE.map((q) => {
          const on = q.id === active
          const t = TONES[STATE_TONE[q.state] ?? 'neutral']
          return (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => on && navigate('/incidents')}
                className="flex w-full cursor-pointer items-center gap-2 border-b border-[#141414] px-3 py-[9px] text-left"
                style={{ background: on ? 'rgba(255,51,68,0.07)' : 'transparent' }}
              >
                <StatusPip tone={STATE_TONE[q.state] ?? 'neutral'} size={5} pulse={on} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[10px] text-bone">{q.id}</span>
                  <span className="mt-0.5 block truncate font-mono text-[9px] tracking-[0.1em] text-[#4a4a4a]">
                    {q.subject}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-[10px] tnum" style={{ color: TONES.crit.text }}>
                    {q.risk}
                  </span>
                  <span className="block font-pixel-xs" style={{ color: t.text }}>
                    {q.state}
                  </span>
                </span>
                <span className="w-[24px] shrink-0 text-right font-mono text-[9px] tnum text-[#3d3d3d]">{q.age}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="border-t border-[#1a1a1a] px-3 py-[6px] font-mono text-[9px] tracking-[0.14em] text-[#4a4a4a]">
        AGE = TIME SINCE OPEN
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------------- chain */

function ChainOfCustody() {
  const sim = useSim()
  const navigate = useNavigate()
  const [log, setLog] = useState<string[]>([])

  const push = (line: string) => {
    setLog((p) => [line, ...p].slice(0, 4))
  }

  return (
    <Panel
      title="EVIDENCE VAULT"
      cutSize="md"
      tone="neutral"
      right={<span className="font-mono text-[9px] tracking-[0.16em] text-[#4a4a4a]">SHA-256 SEALED</span>}
    >
      <div className="space-y-1 px-3 py-2.5">
        <KeyValue k="EVIDENCE ID" v="EV-84729-A4" tone="soft" />
        <KeyValue k="SEALED AT" v="2026-10-03 03:19:47 IST" tone="ash" />
        <KeyValue k="CUSTODIAN" v="IDENTITYTWIN ENGINE" tone="ash" />
        <KeyValue k="INTEGRITY" v={sim.isolated ? 'VERIFIED ✓' : 'PENDING CONTAINMENT'} tone={sim.isolated ? 'ok' : 'warn'} />
        <KeyValue
          k="DIGEST"
          v="9f2c4a71…d08e"
          tone="soft"
        />
      </div>

      <div className="flex flex-wrap gap-2 border-t border-[#1a1a1a] px-3 py-2.5">
        <TerminalButton
          label="EXPORT REPORT"
          tone="blue"
          size="xs"
          onClick={() => push('REPORT EXPORTED · INC-84729.forensic.json · SYNTHETIC')}
        />
        <TerminalButton label="SEAL AGAIN" tone="ok" size="xs" onClick={() => push('EVIDENCE RE-SEALED · EV-84729-A4')} />
        <TerminalButton label="ATTACKTRACE" tone="crit" size="xs" onClick={() => navigate('/attacktrace')} />
      </div>

      {log.length > 0 && (
        <ul className="border-t border-[#1a1a1a] px-3 py-2">
          {log.map((l, i) => (
            <li key={l + i} className="font-mono text-[9px] tracking-[0.08em]" style={{ opacity: 1 - i * 0.22, color: '#35ff72' }}>
              &gt; {l}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/* -------------------------------------------------------------------- page */

export function Incidents() {
  const sim = useSim()
  const navigate = useNavigate()
  const open = sim.incidentOpen

  return (
    <div className="space-y-4">
      <CanaryBanner />

      {/* headline */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusPip tone={open ? 'ok' : 'neutral'} pulse={open} />
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted">
              {open ? 'INCIDENT CONTAINED · FORENSIC RECORD SEALED' : 'FORENSIC INCIDENT RECORDS'}
            </span>
          </div>
          <h2 className="mt-2 font-pixel-sm text-bone terminal-glow">FORENSIC INCIDENT REPORT</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TerminalButton label="ATTACKTRACE" tone="blue" size="sm" onClick={() => navigate('/attacktrace')} />
          <TerminalButton label="VACCINATION" tone="ok" size="sm" onClick={() => navigate('/vaccination')} />
        </div>
      </div>

      {/* incident header card */}
      <Panel
        title={`INCIDENT ${INCIDENT.id}`}
        cutSize="lg"
        tone={open ? 'ok' : 'neutral'}
        weight={2}
        grid
        right={
          <>
            <Badge tone={open ? 'ok' : 'neutral'}>{open ? 'CONTAINED' : 'NO ACTIVE RECORD'}</Badge>
            {open && (
              <>
                <Badge tone="crit">SEVERITY {INCIDENT.status}</Badge>
                <Badge tone="soft">ISOLATED</Badge>
              </>
            )}
          </>
        }
      >
        <div className="grid gap-px bg-[#1a1a1a] sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['SUBJECT', open ? INCIDENT.identity : '—', 'bone'],
            ['SESSION', open ? INCIDENT.sessionId : '—', 'soft'],
            ['RISK SCORE', open ? `${INCIDENT.risk}/100` : '—', open ? 'crit' : 'ash'],
            ['ATTACK VECTOR', open ? ATTACK_VECTOR : '—', 'warn'],
            ['ORIGIN', open ? INCIDENT.origin : '—', 'ash'],
            ['OPENED', open ? INCIDENT.opened : '—', 'ash'],
            ['CONTAINMENT', open ? 'TOKENS REVOKED' : '—', open ? 'ok' : 'ash'],
            ['TIME TO CONTAIN', open ? '00:02:43' : '—', 'ok'],
          ].map(([k, v, tone]) => (
            <div key={k} className="bg-[#0b0b0b] px-3 py-2.5">
              <div className="font-pixel-xs text-muted">{k}</div>
              <div
                className="mt-2 font-mono text-[11px] leading-tight tracking-[0.06em]"
                style={{ color: TONES[tone as Tone].text }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>

        {open && (
          <div className="flex flex-wrap items-center gap-3 border-t border-[#1a1a1a] px-4 py-3">
            <PixelSkull px={4} color="#35ff72" animated={false} />
            <p className="min-w-0 flex-1 font-mono text-[10px] leading-relaxed tracking-[0.06em] text-muted">
              NO REAL CUSTOMER RECORD WAS READ. NO LIVE CREDENTIAL WAS DISCLOSED. NO FUNDS MOVED. THE ATTACK WAS
              CONTAINED AT STEP SIX OF TEN AND CONVERTED INTO A REUSABLE BEHAVIOURAL SIGNATURE.
            </p>
            <TerminalButton label="REPLAY CANARY ALERT" tone="crit" size="xs" onClick={sim.openAlert} />
          </div>
        )}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* main column */}
        <div className="space-y-4">
          {!open ? (
            <Panel title="AWAITING TRIGGER" cutSize="md" tone="neutral">
              <EmptyState
                title="NO ACTIVE INCIDENT"
                status="AWAITING ATTACK CONTAINMENT"
                tone="neutral"
                body="A forensic record is written only when IdentityTwin isolates a session and confirms malicious intent. Run the account-takeover scenario, or jump straight to the canary trigger, to open incident #INC-84729."
                action={
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <TerminalButton label="▶ SIMULATE ATTACK" tone="blue" size="sm" active onClick={sim.start} />
                    <TerminalButton label="JUMP TO CANARY" tone="crit" size="sm" onClick={() => sim.goToStage(9)} />
                  </div>
                }
              />
            </Panel>
          ) : (
            <>
              {/* timeline */}
              <Panel
                title="RECONSTRUCTION"
                cutSize="md"
                tone="crit"
                right={
                  <>
                    <Badge tone="crit">{INCIDENT.timeline.length} EVENTS</Badge>
                    <span className="hidden font-mono text-[9px] tracking-[0.16em] text-[#4a4a4a] sm:inline">
                      03:17:04 → 03:19:47
                    </span>
                  </>
                }
              >
                <div className="px-2 py-2">
                  <Timeline />
                </div>
                <div className="flex items-center justify-between border-t border-[#1a1a1a] px-3 py-[6px] font-mono text-[9px] tracking-[0.14em] text-[#4a4a4a]">
                  <span>SELECT AN EVENT FOR SIGNAL CONTEXT</span>
                  <span>WINDOW 2M 43S</span>
                </div>
              </Panel>

              {/* AI investigation */}
              <Panel
                title="AI SECURITY INVESTIGATION"
                cutSize="md"
                tone="soft"
                right={
                  <>
                    <StatusPip tone="ok" size={5} pulse={false} />
                    <span className="font-mono text-[9px] tracking-[0.16em] text-[#4a4a4a]">CONFIDENCE 98.7%</span>
                  </>
                }
              >
                <div className="space-y-3 px-4 py-4">
                  <div className="flex items-center gap-2 border-b border-[#1a1a1a] pb-2">
                    <span className="font-pixel-xs text-muted">NARRATIVE</span>
                    <span className="h-px flex-1 bg-[#1a1a1a]" />
                    <span className="font-mono text-[9px] tracking-[0.14em] text-[#4a4a4a]">GENERATED FROM BEHAVIOURAL GRAPH</span>
                  </div>
                  {INCIDENT.report.map((_, i) => (
                    <ReportBlock key={i} index={i} />
                  ))}
                  <div className="border-t border-[#1a1a1a] pt-3">
                    <TypeLine
                      text="> ANALYSIS COMPLETE. RECOMMENDED ACTIONS BELOW. NO HUMAN OPERATOR REQUIRED."
                      tone="ok"
                      speed={22}
                    />
                  </div>
                </div>
              </Panel>

              {/* signals */}
              <Panel
                title="DIVERGENCE SIGNALS"
                cutSize="md"
                tone="warn"
                right={<Badge tone="warn">{INCIDENT.signals.length} FLAGS</Badge>}
              >
                <ul className="px-3 py-2.5">
                  {INCIDENT.signals.map((s, i) => (
                    <motion.li
                      key={s}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.18, delay: i * 0.05 }}
                      className="flex items-start gap-2.5 border-b border-[#141414] py-[6px] last:border-b-0"
                    >
                      <span className="mt-[1px] shrink-0 font-mono text-[10px] text-warn" aria-hidden>
                        ▲
                      </span>
                      <span className="font-mono text-[10px] leading-relaxed tracking-[0.06em] text-ash">{s}</span>
                    </motion.li>
                  ))}
                </ul>
              </Panel>

              {/* recommended actions */}
              <Panel
                title="RECOMMENDED ACTION"
                cutSize="md"
                tone="ok"
                right={<Badge tone="ok">AUTOMATED</Badge>}
              >
                <ActionChecklist />
                <div className="flex flex-wrap items-center gap-2 border-t border-[#1a1a1a] px-3 py-2.5">
                  <span className="font-mono text-[9px] tracking-[0.14em] text-[#4a4a4a]">
                    NEXT: EXTRACT SIGNATURE FROM THIS INCIDENT
                  </span>
                  <TerminalButton
                    label="→ VACCINATION"
                    tone="ok"
                    size="xs"
                    className="ml-auto"
                    onClick={() => navigate('/vaccination')}
                  />
                </div>
              </Panel>
            </>
          )}
        </div>

        {/* right rail */}
        <div className="space-y-4">
          <IncidentQueue active={open ? INCIDENT.id : ''} />
          <ChainOfCustody />

          <Panel title="SEVERITY MATRIX" cutSize="md" tone="neutral">
            <div className="space-y-2 px-3 py-3">
              {SEVERITY_MATRIX.map(([label, note, tone, count]) => {
                const on = open && label === 'CRITICAL'
                const t = TONES[tone as Tone]
                return (
                  <div key={label} className="flex items-center gap-2.5">
                    <span
                      className="h-[10px] w-[10px] shrink-0"
                      style={{
                        background: on ? t.bar : '#141414',
                        boxShadow: on ? `0 0 10px ${t.bar}` : 'inset 0 0 0 1px #232323',
                      }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-pixel-xs" style={{ color: on ? t.text : '#3d3d3d' }}>
                        {label}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[9px] tracking-[0.08em] text-[#4a4a4a]">
                        {note}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] tnum" style={{ color: on ? t.text : '#4a4a4a' }}>
                      {String(count).padStart(2, '0')}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-[#1a1a1a] px-3 py-[6px] font-mono text-[9px] tracking-[0.14em] text-[#4a4a4a]">
              {open ? 'THIS INCIDENT · CRITICAL' : 'QUEUE DISTRIBUTION · 24H'}
            </div>
          </Panel>

          <SubFrame tone="neutral" cutSize="sm">
            <div className="px-3 py-3">
              <SectionLabel right={<span className="font-mono text-[9px] text-[#3d3d3d]">RETENTION 7Y</span>}>
                LEGAL HOLD
              </SectionLabel>
              <p className="mt-2 font-mono text-[10px] leading-relaxed tracking-[0.04em] text-muted">
                Session telemetry, decoy responses and canary access logs for this incident are immutable and
                retained for seven years. Every read of a canary secret is itself an evidentiary event.
              </p>
            </div>
          </SubFrame>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#161616] pt-3 font-mono text-[9px] tracking-[0.18em] text-[#3d3d3d]">
        <span>SIMULATION ENVIRONMENT · SYNTHETIC DATA · NO REAL IDENTITIES</span>
        <span>RECORD {INCIDENT.id} · SHA-256 SEALED</span>
      </div>
    </div>
  )
}
