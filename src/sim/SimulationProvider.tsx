/* ==========================================================================
   SIMULATION ENGINE — the single source of truth for the whole IdentityTwin
   demo. Every page reads from this store, so one click of
   "SIMULATE ACCOUNT TAKEOVER" drives the entire product: command centre,
   identity twin, sessions, risk, trust, deception, attacktrace, incident and
   vaccination all react to the same state.
   ========================================================================== */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  AMBIENT_EVENT_POOL,
  ATTACKER_INTENT,
  BASELINE_EVENTS,
  INCIDENT,
  IDENTITY_COUNT,
  LIKELY_OBJECTIVE,
  PAYOUT_LABEL,
  RISK_BASELINE,
  SESSION_STATS,
  THREAT_STATES,
  type AttackTraceNode,
  type Incident,
  type SecurityEvent,
  type TrustState,
} from '@/data'
import { ATTACKTRACE_EDGES, ATTACKTRACE_NODES, NODE_REVEAL_ORDER, type TraceEdge } from '@/data/mockThreats'
import { VACCINE_RULE } from '@/data/mockVaccination'

/* --------------------------------------------------------------- stages */

export interface Stage {
  n: number
  key: string
  title: string
  sub: string
  dur: number
  /** composite risk the engine settles on when this stage opens */
  risk: number
  trust: TrustState
  accent: 'blue' | 'warn' | 'crit'
  /** headline stamp shown large inside the step card */
  headline?: string
  /** detail rows the analyst reads as the stage plays out */
  rows: [string, string][]
  events: Omit<SecurityEvent, 'id'>[]
  logs: string[]
}

export const STAGES: Stage[] = [
  {
    n: 1,
    key: 'LOGIN',
    title: 'ATTACKER LOGIN',
    sub: 'STOLEN CREDENTIALS REPLAYED SUCCESSFULLY',
    dur: 3400,
    risk: 38,
    trust: 'NORMAL',
    accent: 'warn',
    rows: [
      ['DEVICE', 'UNKNOWN WINDOWS DEVICE · FP 91C4-A7D2-0031'],
      ['LOCATION', 'DELHI, IN · 1,450 KM FROM BASELINE'],
      ['TIME', '03:17 AM · OUTSIDE 08:00–22:30 WINDOW'],
      ['AUTH', 'PASSWORD ACCEPTED · OTP INTERCEPTED'],
      ['SESSION', 'S-84729 CREATED · NO STEP-UP CHALLENGE'],
    ],
    events: [
      { time: '03:17:04', kind: 'LOGIN', subject: 'ADWIKA', status: 'DRIFT DETECTED', sessionId: 'S-84729' },
      { time: '03:17:06', kind: 'NEW DEVICE', subject: 'WINDOWS/CHROME', status: 'WARNING', sessionId: 'S-84729' },
      { time: '03:17:09', kind: 'LOCATION', subject: 'DELHI, IN', status: 'WARNING', sessionId: 'S-84729' },
    ],
    logs: [
      'AUTH_ATTEMPT S-84729 · USR_1024 · CREDENTIAL_REPLAY',
      'DEVICE_FP 91C4-A7D2-0031 UNKNOWN · NEVER OBSERVED',
      'GEO DELHI IN · BASELINE BANGALORE · Δ1,450KM',
      'CLOCK 03:17 · OUTSIDE WINDOW 08:00-22:30',
      'DIVERGENCE SCORE 43 · SCORING ENGINE ENGAGED',
    ],
  },
  {
    n: 2,
    key: 'BEHAVIORAL_DRIFT',
    title: 'BEHAVIORAL DRIFT',
    sub: 'SESSION INCONSISTENT WITH THE ESTABLISHED BASELINE',
    dur: 2900,
    risk: 57,
    trust: 'NORMAL',
    accent: 'warn',
    rows: [
      ['DEVICE DRIFT', 'MAC → WINDOWS · +18'],
      ['LOCATION DRIFT', 'BANGALORE → DELHI · +14'],
      ['TIME DRIFT', '08:00–22:30 → 03:17 · +11'],
      ['TWIN MATCH', '71% · BELOW 84% THRESHOLD'],
      ['ACTION', 'MONITORING ELEVATED · ACCOUNT NOT TIPPED'],
    ],
    events: [
      { time: '03:17:31', kind: 'DRIFT DETECTED', subject: 'DEVICE+TIME+GEO', status: 'HIGH', sessionId: 'S-84729' },
      { time: '03:17:38', kind: 'TWIN COMPARED', subject: 'USR_1024', status: 'WARNING', sessionId: 'S-84729' },
    ],
    logs: [
      'TWIN_BASELINE LOADED · 74 SESSIONS · 214 ENROLLMENTS',
      'DRIFT DEVICE +18 · LOCATION +14 · TIME +11',
      'MONITORING ELEVATED · STEPUP PENDING',
    ],
  },
  {
    n: 3,
    key: 'RISK_ESCALATION',
    title: 'RISK ESCALATION',
    sub: 'COMPOSITE RISK 21 → 38 → 57 → 74 → 91',
    dur: 3000,
    risk: 74,
    trust: 'NORMAL',
    accent: 'warn',
    headline: '74 / 100',
    rows: [
      ['RISK LEDGER', '21 → 38 → 57 → 74'],
      ['THRESHOLD', 'P-07 PAYOUT POLICY AT 74'],
      ['TRUST', '96 → 61 · STEPUP AUTH FLAGGED'],
      ['CONTAINMENT', 'DEFERRED · INTENT NOT YET PROVEN'],
      ['SIGNAL', '3 OF 6 CONTRIBUTIONS CONFIRMED'],
    ],
    events: [
      { time: '03:17:52', kind: 'RISK SCORE', subject: '74 / 100', status: 'HIGH', sessionId: 'S-84729' },
      { time: '03:17:58', kind: 'POLICY', subject: 'WATCHLISTED', status: 'HIGH', sessionId: 'S-84729' },
    ],
    logs: [
      'RISK 21 → 38 → 57 → 74',
      'POLICY P-07 WATCHLISTED · PAYOUT CEILING ₹25,000',
      'TRUST 96 → 61 · STEPUP AUTH REQUIRED',
    ],
  },
  {
    n: 4,
    key: 'NEW_PAYEE',
    title: 'NEW PAYEE CREATED',
    sub: 'BENEFICIARY ADDED INSIDE THE COMPROMISED SESSION',
    dur: 3100,
    risk: 84,
    trust: 'NORMAL',
    accent: 'warn',
    rows: [
      ['PAYEE ID', 'PAYEE-NEW-4417'],
      ['PAYEE NAME', 'HOLLOWPOINT TRADING LLC'],
      ['VERIFICATION', 'SKIPPED · IDENTITY HAS 6 KNOWN PAYEES'],
      ['CREATED', '03:18:22 · 78s AFTER LOGIN'],
      ['SIGNAL', 'NEW_PAYEE +16 RISK'],
    ],
    events: [
      { time: '03:18:22', kind: 'PAYEE ADDED', subject: 'UNKNOWN', status: 'HIGH', sessionId: 'S-84729' },
      { time: '03:18:26', kind: 'PAYEE VERIFY', subject: 'SKIPPED', status: 'HIGH', sessionId: 'S-84729' },
    ],
    logs: [
      'PAYEE NEW · PAYEE-NEW-4417 · HOLLOWPOINT TRADING LLC',
      'VERIFICATION SKIPPED · IDENTITY HAS 6 KNOWN PAYEES',
      'RISK 74 → 84 · NEW PAYEE WEIGHT +16',
    ],
  },
  {
    n: 5,
    key: 'PAYOUT',
    title: 'HIGH VALUE PAYOUT',
    sub: 'TRANSFER REQUEST EXCEEDS THE IDENTITY CEILING BY 82×',
    dur: 3300,
    risk: 91,
    trust: 'NORMAL',
    accent: 'crit',
    headline: PAYOUT_LABEL,
    rows: [
      ['AMOUNT', PAYOUT_LABEL],
      ['BASELINE CEILING', '₹8,000 (MAX OBSERVED 30D)'],
      ['RATIO', '60× CEILING · 82× TYPICAL'],
      ['POLICY', 'HELD FOR REVIEW · NO FUNDS MOVED'],
      ['SIGNAL', 'ABNORMAL_PAYOUT +21 RISK'],
    ],
    events: [
      { time: '03:18:51', kind: 'PAYOUT', subject: PAYOUT_LABEL, status: 'CRITICAL', sessionId: 'S-84729' },
      { time: '03:18:53', kind: 'PAYOUT', subject: 'HELD FOR REVIEW', status: 'CRITICAL', sessionId: 'S-84729' },
    ],
    logs: [
      `PAYOUT REQUEST ${PAYOUT_LABEL} → PAYEE-NEW-4417`,
      'CEILING FOR USR_1024 = ₹8,000 · EXCEEDED 60×',
      'HOLD FOR REVIEW · NO REAL FUNDS MOVED',
      'RISK 84 → 91 · ABNORMAL PAYOUT WEIGHT +21',
    ],
  },
  {
    n: 6,
    key: 'ADMIN_API',
    title: 'ADMIN API REQUEST',
    sub: 'ATTACKER PROBES SENSITIVE SCOPE BEFORE MONETISING',
    dur: 3000,
    risk: 93,
    trust: 'NORMAL',
    accent: 'warn',
    rows: [
      ['ENDPOINT', 'GET /finance/admin/credentials'],
      ['SCOPE', 'ADMIN · NEVER HELD BY THIS IDENTITY'],
      ['PREVIOUS', '0 ADMIN CALLS IN 214 ENROLLMENTS'],
      ['RESPONSE', 'PROXY LAYER ENGAGED · SYNTHETIC'],
      ['SIGNAL', 'SENSITIVE_API +11 RISK'],
    ],
    events: [
      { time: '03:19:02', kind: 'API CALL', subject: '/finance/admin/credentials', status: 'HIGH', sessionId: 'S-84729' },
    ],
    logs: [
      'API GET /finance/admin/credentials · ADMIN SCOPE',
      'SCOPE NOT PREVIOUSLY HELD BY USR_1024',
      'PROXY LAYER ENGAGED · SYNTHETIC RESPONSE',
      'RISK 91 → 93 · PRIVILEGE ESCALATION INTENT',
    ],
  },
  {
    n: 7,
    key: 'CUSTOMER_DATA',
    title: 'CUSTOMER DATA SEARCH',
    sub: 'BULK EXPORT ATTEMPT — CONTAINED BY THE DECOY LAYER',
    dur: 3000,
    risk: 94,
    trust: 'NORMAL',
    accent: 'crit',
    rows: [
      ['ENDPOINT', 'GET /customers/search?limit=500'],
      ['QUERY', 'WILDCARD EXPORT'],
      ['RESULT', '1,482 SYNTHETIC RECORDS'],
      ['REAL DATA', 'NEVER TOUCHED · ISOLATED AT PROXY'],
      ['SIGNAL', 'EXFILTRATION INTENT OBSERVED'],
    ],
    events: [
      { time: '03:19:09', kind: 'CUSTOMER SEARCH', subject: 'limit=500', status: 'CRITICAL', sessionId: 'S-84729' },
    ],
    logs: [
      'API GET /customers/search?limit=500 · WILDCARD',
      '1,482 SYNTHETIC RECORDS RETURNED',
      'REAL CUSTOMER TABLE NEVER QUERIED',
    ],
  },
  {
    n: 8,
    key: 'TRUST_RESTRICTION',
    title: 'TRUST RESTRICTION',
    sub: 'PROGRESSIVE TRUST REDUCTION APPLIED',
    dur: 2700,
    risk: 95,
    trust: 'RESTRICTED',
    accent: 'warn',
    rows: [
      ['TRUST STATE', 'NORMAL → RESTRICTED'],
      ['PERMISSION', 'REDUCED TRANSACTION LIMITS'],
      ['PAYOUT CAPPED', '₹25,000'],
      ['AUTH', 'STEPUP REQUIRED FOR ANY MOVEMENT'],
      ['NAVIGATION', 'PATH DEVIATES 31% FROM BASELINE'],
    ],
    events: [
      { time: '03:19:14', kind: 'POLICY', subject: 'RESTRICTED', status: 'HIGH', sessionId: 'S-84729' },
    ],
    logs: [
      'TRUST STATE → RESTRICTED',
      'PAYOUT CAPPED ₹25,000 · STEPUP AUTH FORCED',
      'NAVIGATION PATH DEVIATES 31% FROM BASELINE',
    ],
  },
  {
    n: 9,
    key: 'DECOY',
    title: 'DECOY ACTIVATION',
    sub: 'SESSION REROUTED TO SYNTHETIC HONEY ENVIRONMENT',
    dur: 3100,
    risk: 96,
    trust: 'DECOY',
    accent: 'warn',
    rows: [
      ['TRUST STATE', 'RESTRICTED → DECOY'],
      ['PERMISSION', 'SHADOW ENVIRONMENT'],
      ['BALANCE SHOWN', '₹8,42,100 (SYNTHETIC)'],
      ['PENDING PAYOUT', `${PAYOUT_LABEL} (SYNTHETIC)`],
      ['REAL DATA', 'ZERO BYTES SERVED'],
    ],
    events: [
      { time: '03:19:18', kind: 'DECOY', subject: 'S-84729', status: 'HIGH', sessionId: 'S-84729' },
      { time: '03:19:22', kind: 'HONEY ENV', subject: 'ONLINE', status: 'HIGH', sessionId: 'S-84729' },
    ],
    logs: [
      'DECOY LAYER ARMED · HONEY ENVIRONMENT v4',
      'SESSION S-84729 REROUTED TO SHADOW',
      'ALL RESPONSES SYNTHETIC · NO REAL DATA SERVED',
      'TRUST STATE → DECOY',
    ],
  },
  {
    n: 10,
    key: 'CANARY',
    title: 'CANARY ACCESS',
    sub: 'THE ATTACKER READ A SECRET THAT DOES NOT EXIST',
    dur: 3700,
    risk: 100,
    trust: 'ISOLATED',
    accent: 'crit',
    headline: 'CANARY TRIGGERED',
    rows: [
      ['CANARY', 'PAYPAL_SECRET_0042'],
      ['LOCATION', '/finance/api-credentials'],
      ['SESSION', 'S-84729'],
      ['CONFIDENCE', '98.7% MALICIOUS INTENT'],
      ['RISK', '96 → 100'],
    ],
    events: [
      { time: '03:19:41', kind: 'CANARY', subject: 'PAYPAL_SECRET_0042', status: 'CRITICAL', sessionId: 'S-84729' },
    ],
    logs: [
      'CANARY PAYPAL_SECRET_0042 ACCESSED BY S-84729',
      'CONFIDENCE 98.7% · MALICIOUS INTENT CONFIRMED',
      'RISK 96 → 100 · TRUST DECOY → ISOLATED',
    ],
  },
  {
    n: 11,
    key: 'ISOLATION',
    title: 'ISOLATION',
    sub: 'ALL REAL RESOURCES BLOCKED · ATTACK CONTAINED',
    dur: 3100,
    risk: 100,
    trust: 'ISOLATED',
    accent: 'crit',
    rows: [
      ['TRUST STATE', 'DECOY → ISOLATED'],
      ['PERMISSION', 'REAL RESOURCES BLOCKED'],
      ['TOKENS', 'REVOKED · 3 ACTIVE SESSIONS CUT'],
      ['PAYOUT', `${PAYOUT_LABEL} CANCELLED`],
      ['EVIDENCE', 'SEALED · IMMUTABLE'],
    ],
    events: [
      { time: '03:19:44', kind: 'ISOLATION', subject: 'S-84729', status: 'CRITICAL', sessionId: 'S-84729' },
    ],
    logs: [
      'SESSION ISOLATED AT EDGE PROXY',
      'TOKENS REVOKED · PAYOUT CANCELLED',
      'REAL RESOURCES NEVER REACHED',
    ],
  },
  {
    n: 12,
    key: 'INCIDENT',
    title: 'INCIDENT CREATION',
    sub: 'FULL EVIDENCE PACKAGE ASSEMBLED',
    dur: 3000,
    risk: 100,
    trust: 'ISOLATED',
    accent: 'crit',
    rows: [
      ['INCIDENT', 'INC-84729'],
      ['SEVERITY', 'CRITICAL'],
      ['STATUS', 'ISOLATED · CONTAINED'],
      ['TIMELINE', '8 ENTRIES · 03:17 → 03:19'],
      ['CHAIN OF CUSTODY', 'SEALED · HASH VERIFIED'],
    ],
    events: [
      { time: '03:19:52', kind: 'INCIDENT', subject: 'INC-84729', status: 'CRITICAL', sessionId: 'S-84729' },
    ],
    logs: [
      'INCIDENT INC-84729 OPENED · SEVERITY CRITICAL',
      'TIMELINE 8 ENTRIES ASSEMBLED',
      'AI INVESTIGATOR QUEUED',
    ],
  },
  {
    n: 13,
    key: 'VACCINATION',
    title: 'SECURITY VACCINATION',
    sub: 'BEHAVIOURAL SIGNATURE EXTRACTED · RULE DEPLOYED',
    dur: 4400,
    risk: 100,
    trust: 'ISOLATED',
    accent: 'crit',
    rows: [
      ['SIGNATURE', VACCINE_RULE.id],
      ['IF', 'new_device + unusual_login_time + new_payee'],
      ['THEN', 'high_value_payout + credential_canary'],
      ['ACTION', 'elevate_monitoring · restrict_payout'],
      ['COVERAGE', `${IDENTITY_COUNT.toLocaleString('en-IN')} IDENTITIES`],
    ],
    events: [
      { time: '03:20:02', kind: 'RULE DEPLOYED', subject: VACCINE_RULE.id, status: 'WARNING' },
      { time: '03:20:08', kind: 'PROTECTION', subject: `${IDENTITY_COUNT.toLocaleString('en-IN')} IDENTITIES`, status: 'DRIFT DETECTED' },
    ],
    logs: [
      'ATTACK CONTAINED · SIGNATURE EXTRACTION STARTED',
      `RULE GENERATED · ${VACCINE_RULE.id} · ${VACCINE_RULE.version}`,
      `TESTED AGAINST ${IDENTITY_COUNT.toLocaleString('en-IN')} IDENTITIES · FP 0.4%`,
      'RULE DEPLOYED TO ALL SEGMENTS',
      `1 ATTACK → 1 SIGNATURE → ${IDENTITY_COUNT.toLocaleString('en-IN')} IDENTITIES PROTECTED`,
    ],
  },
]

export const TOTAL_STAGES = STAGES.length

/**
 * Named stage boundaries. Pages must reference these instead of hard-coded
 * numbers so the sequence can be re-ordered without silently breaking gating.
 */
export const STAGE_INDEX = {
  LOGIN: 1,
  DRIFT: 2,
  RISK: 3,
  NEW_PAYEE: 4,
  PAYOUT: 5,
  ADMIN_API: 6,
  CUSTOMER_DATA: 7,
  TRUST_RESTRICTED: 8,
  DECOY: 9,
  CANARY: 10,
  ISOLATION: 11,
  INCIDENT: 12,
  VACCINATION: 13,
} as const

/** Trust after each stage — the session ends isolated at 09. */
const TRUST_BY_STAGE = [96, 88, 71, 61, 52, 44, 38, 32, 24, 22, 14, 9, 9, 9]

/** Trust before the simulation has started. */
const TRUST_IDLE = 96

/** Baseline trust for identities that are not the attack subject. */
export const DEFAULT_TRUST = 96

export interface LogEntry {
  id: string
  time: string
  text: string
  tone: 'info' | 'warn' | 'crit'
}

export interface IntentAxis {
  key: string
  label: string
  pct: number
  evidence: string
  active: boolean
}

export interface VaccineState {
  id: string
  version: string
  conditions: string[]
  actions: string[]
  deployed: boolean
}

interface SimValue {
  /* --- simulation --------------------------------------------------- */
  /** 0 = idle/baseline, 1..TOTAL_STAGES = the current cinematic step */
  stage: number
  simulationRunning: boolean
  complete: boolean
  speed: number
  paused: boolean
  current: Stage | null

  /* --- derived security state ---------------------------------------- */
  riskScore: number
  trustScore: number
  sessionStatus: 'NORMAL' | 'OBSERVING' | 'SUSPICIOUS' | 'HIGH RISK' | 'CRITICAL' | 'ISOLATED'
  trustState: TrustState
  threat: ReturnType<typeof threatFor>
  stageKey: string

  /* --- narrative flags ----------------------------------------------- */
  logged: boolean
  driftDetected: boolean
  payeeAdded: boolean
  payoutAttempted: boolean
  deceptionActive: boolean
  canaryTriggered: boolean
  isolated: boolean
  attackContained: boolean
  incidentOpen: boolean
  securityVaccineDeployed: boolean

  /* --- shared artefacts ---------------------------------------------- */
  events: SecurityEvent[]
  log: LogEntry[]
  revealedSteps: number[]
  attackerIntent: IntentAxis[]
  likelyObjective: string
  attackTraceNodes: AttackTraceNode[]
  attackTraceEdges: TraceEdge[]
  attackTraceRevealed: string[]
  incident: Incident
  securityVaccine: VaccineState

  /* --- population ---------------------------------------------------- */
  identities: number
  activeSessions: number
  activeThreats: number
  decoySessions: number

  /* --- controls ------------------------------------------------------ */
  start: () => void
  reset: () => void
  completeAttack: () => void
  triggerCanary: () => void
  isolateSession: () => void
  goToStage: (n: number) => void
  setSpeed: (s: number) => void
  pause: () => void
  resume: () => void
  togglePause: () => void

  /* --- global alerts ------------------------------------------------- */
  alertOpen: boolean
  openAlert: () => void
  closeAlert: () => void
}

function threatFor(stage: number) {
  if (stage === 0) return THREAT_STATES.NORMAL
  if (stage <= STAGE_INDEX.DRIFT) return THREAT_STATES.OBSERVING
  if (stage <= STAGE_INDEX.RISK) return THREAT_STATES.SUSPICIOUS
  if (stage <= STAGE_INDEX.CUSTOMER_DATA) return THREAT_STATES.HIGH
  if (stage <= STAGE_INDEX.CANARY) return THREAT_STATES.CRITICAL
  return THREAT_STATES.ISOLATED
}

const SimContext = createContext<SimValue | null>(null)

const nowClock = () =>
  new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })

let uid = 0
const nid = () => `x${Date.now().toString(36)}${(uid++).toString(36)}`

const AMBIENT_SEED = BASELINE_EVENTS.map((e, i) => ({ ...e, id: `seed-${i}` }))

const toneOfLog = (text: string): LogEntry['tone'] =>
  text.includes('CANARY') || text.includes('ISOLATED') || text.includes('CRITICAL') || text.includes('REVOKED')
    ? 'crit'
    : text.includes('RISK') || text.includes('PAYEE') || text.includes('DECOY') || text.includes('POLICY') || text.includes('RESTRICT')
      ? 'warn'
      : 'info'

/** Deterministic per-stage log timestamps — the clock walks forward 03:17 → 03:20. */
function logTime(stage: number, i: number) {
  const secs = (stage - 1) * 9 + i * 3
  const mins = 17 + Math.floor(secs / 60)
  const ss = secs % 60
  return `03:${String(mins).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState(0)
  const [running, setRunning] = useState(false)
  const [complete, setComplete] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [paused, setPaused] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([])
  const [events, setEvents] = useState<SecurityEvent[]>(AMBIENT_SEED)
  const [alertOpen, setAlertOpen] = useState(false)
  const timers = useRef<number[]>([])

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timers.current.push(id)
  }, [])

  /* ---------------------------------------------------------------- reset */

  const reset = useCallback(() => {
    clearTimers()
    setStage(0)
    setRunning(false)
    setComplete(false)
    setPaused(false)
    setLog([])
    setEvents(AMBIENT_SEED)
    setAlertOpen(false)
  }, [clearTimers])

  /* --------------------------------------------------------- enter stage */

  const enterStage = useCallback(
    (n: number) => {
      const st = STAGES[n - 1]
      if (!st) return

      setStage(n)

      setLog((prev) => [
        ...prev,
        ...st.logs.map((text, i) => ({
          id: nid(),
          time: logTime(n, i),
          text,
          tone: toneOfLog(text),
        })),
      ])

      setEvents((prev) => [...st.events.map((e, i) => ({ ...e, id: `${nid()}${i}` })), ...prev].slice(0, 60))

      if (n === TOTAL_STAGES) {
        setComplete(true)
        setRunning(false)
      }
    },
    [],
  )

  /* ----------------------------------------------------- automatic chain */

  useEffect(() => {
    if (!running || paused) return
    const st = STAGES[stage - 1]
    if (!st) return
    const id = window.setTimeout(() => enterStage(stage + 1), st.dur / speed)
    return () => window.clearTimeout(id)
  }, [running, paused, stage, speed, enterStage])

  /* ambient traffic keeps the feed alive even when nothing is happening */
  useEffect(() => {
    const tick = () => {
      const tpl = AMBIENT_EVENT_POOL[Math.floor(Math.random() * AMBIENT_EVENT_POOL.length)]
      setEvents((prev) => [{ ...tpl, id: nid(), time: nowClock() }, ...prev].slice(0, 60))
    }
    const id = window.setInterval(tick, running ? 5200 : 3400)
    return () => window.clearInterval(id)
  }, [running])

  useEffect(() => () => clearTimers(), [clearTimers])

  /* -------------------------------------------------------------- actions */

  const start = useCallback(() => {
    clearTimers()
    setStage(0)
    setLog([])
    setEvents(AMBIENT_SEED)
    setComplete(false)
    setPaused(false)
    setAlertOpen(false)
    setRunning(true)
    later(() => enterStage(1), 420)
  }, [later, enterStage, clearTimers])

  /** Jump every remaining stage forward at once — the "skip to the end" control. */
  const completeAttack = useCallback(() => {
    clearTimers()
    setPaused(false)
    setRunning(true)
    let delay = 0
    for (let n = stage + 1; n <= TOTAL_STAGES; n++) {
      later(() => enterStage(n), delay)
      delay += 420
    }
  }, [stage, later, enterStage, clearTimers])

  /**
   * Called when the attacker reads the canary credential inside the decoy
   * environment. Fast-forwards straight to the canary stage and opens the alert.
   */
  const triggerCanary = useCallback(() => {
    const target = STAGE_INDEX.CANARY
    clearTimers()
    setPaused(false)
    setRunning(true)
    if (stage >= target) {
      setAlertOpen(true)
      return
    }
    for (let n = stage + 1; n <= target; n++) {
      later(() => enterStage(n), (n - stage - 1) * 640)
    }
    later(() => setAlertOpen(true), (target - stage) * 640 + 220)
  }, [stage, later, enterStage, clearTimers])

  const goToStage = useCallback(
    (n: number) => {
      clearTimers()
      if (n <= 0) {
        reset()
        return
      }
      setPaused(false)
      setRunning(true)
      for (let i = stage + 1; i <= n; i++) later(() => enterStage(i), (i - stage - 1) * 320)
    },
    [stage, later, enterStage, clearTimers, reset],
  )

  /**
   * Respond to the canary from the alert dialog: cut the session off at the
   * proxy right now instead of waiting for the scripted isolation beat.
   */
  const isolateSession = useCallback(() => {
    const target = STAGE_INDEX.ISOLATION
    clearTimers()
    setPaused(false)
    setRunning(true)
    for (let n = stage + 1; n <= target; n++) {
      later(() => enterStage(n), (n - stage - 1) * 460)
    }
  }, [stage, later, enterStage, clearTimers])

  const pause = useCallback(() => setPaused(true), [])
  const resume = useCallback(() => setPaused(false), [])
  const togglePause = useCallback(() => setPaused((p) => !p), [])

  /* -------------------------------------------------------------- derived */

  const current = stage > 0 ? (STAGES[stage - 1] ?? null) : null
  const riskScore = current?.risk ?? RISK_BASELINE
  const trustScore = TRUST_BY_STAGE[Math.min(stage, TOTAL_STAGES)] ?? TRUST_IDLE
  const threat = threatFor(stage)

  const revealedSteps = useMemo(() => Array.from({ length: stage }, (_, i) => i + 1), [stage])

  const attackerIntent = useMemo<IntentAxis[]>(
    () =>
      ATTACKER_INTENT.map((a) => {
        const active = stage >= a.fromStage
        /* confidence ramps in over the two stages after the evidence appears */
        const ramp = Math.min(1, Math.max(0, (stage - a.fromStage + 1) / 2))
        return {
          key: a.key,
          label: a.label,
          pct: active ? Math.round(a.pct * ramp) : 0,
          evidence: a.evidence,
          active,
        }
      }),
    [stage],
  )

  const attackTraceRevealed = useMemo(() => {
    if (stage === 0) return NODE_REVEAL_ORDER.slice(0, 3) as unknown as string[]
    const count = Math.min(NODE_REVEAL_ORDER.length, 2 + stage)
    return NODE_REVEAL_ORDER.slice(0, count) as unknown as string[]
  }, [stage])

  const attackTraceNodes = useMemo(
    () => ATTACKTRACE_NODES.filter((n) => attackTraceRevealed.includes(n.id)),
    [attackTraceRevealed],
  )
  const attackTraceEdges = useMemo(
    () => ATTACKTRACE_EDGES.filter((e) => attackTraceRevealed.includes(e.source) && attackTraceRevealed.includes(e.target)),
    [attackTraceRevealed],
  )

  const value = useMemo<SimValue>(() => {
    const driftDetected = stage >= STAGE_INDEX.DRIFT
    const payeeAdded = stage >= STAGE_INDEX.NEW_PAYEE
    const payoutAttempted = stage >= STAGE_INDEX.PAYOUT
    const deceptionActive = stage >= STAGE_INDEX.DECOY
    const canaryTriggered = stage >= STAGE_INDEX.CANARY
    const isolated = stage >= STAGE_INDEX.ISOLATION
    const incidentOpen = stage >= STAGE_INDEX.INCIDENT
    const vaccineDeployed = stage >= STAGE_INDEX.VACCINATION

    return {
      stage,
      simulationRunning: running,
      complete,
      speed,
      paused,
      current,

      riskScore,
      trustScore,
      sessionStatus: threat.state,
      trustState: current?.trust ?? 'NORMAL',
      threat,
      stageKey: current?.key ?? 'IDLE',

      logged: stage >= STAGE_INDEX.LOGIN,
      driftDetected,
      payeeAdded,
      payoutAttempted,
      deceptionActive,
      canaryTriggered,
      isolated,
      attackContained: isolated,
      incidentOpen,
      securityVaccineDeployed: vaccineDeployed,

      events,
      log,
      revealedSteps,
      attackerIntent,
      likelyObjective: LIKELY_OBJECTIVE,
      attackTraceNodes,
      attackTraceEdges,
      attackTraceRevealed,
      incident: INCIDENT,
      securityVaccine: {
        id: VACCINE_RULE.id,
        version: VACCINE_RULE.version,
        conditions: VACCINE_RULE.conditions,
        actions: VACCINE_RULE.actions,
        deployed: vaccineDeployed,
      },

      identities: IDENTITY_COUNT,
      activeSessions: SESSION_STATS.active + (stage >= STAGE_INDEX.LOGIN ? 1 : 0),
      activeThreats: stage === 0 ? 3 : deceptionActive || isolated ? 1 : 2,
      decoySessions:
        SESSION_STATS.decoy + (deceptionActive ? 1 : 0) + (isolated ? 1 : 0),

      start,
      reset,
      completeAttack,
      triggerCanary,
      isolateSession,
      goToStage,
      setSpeed,
      pause,
      resume,
      togglePause,

      alertOpen,
      openAlert: () => setAlertOpen(true),
      closeAlert: () => setAlertOpen(false),
    }
  }, [
    stage,
    running,
    complete,
    speed,
    paused,
    current,
    riskScore,
    trustScore,
    threat,
    events,
    log,
    revealedSteps,
    attackerIntent,
    attackTraceNodes,
    attackTraceEdges,
    attackTraceRevealed,
    start,
    reset,
    completeAttack,
    triggerCanary,
    isolateSession,
    goToStage,
    pause,
    resume,
    togglePause,
    alertOpen,
  ])

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>
}

export function useSim(): SimValue {
  const ctx = useContext(SimContext)
  if (!ctx) throw new Error('useSim must be used inside <SimulationProvider>')
  return ctx
}