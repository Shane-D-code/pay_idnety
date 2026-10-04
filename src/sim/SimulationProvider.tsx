/* ==========================================================================
   SIMULATION ENGINE — central state for the whole IdentityTwin demo.
   Every page reacts to this single store, so a simulation started in one
   place is immediately visible everywhere else.
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
  BASELINE_EVENTS,
  PAYOUT_LABEL,
  SESSION_STATS,
  THREAT_STATES,
  type SecurityEvent,
  type ThreatState,
  type TrustState,
} from '@/data'

export interface Stage {
  n: number
  key: string
  title: string
  sub: string
  dur: number
  risk: number
  trust: TrustState
  steps: number[]
  events: Omit<SecurityEvent, 'id'>[]
  logs: string[]
}

export const STAGES: Stage[] = [
  {
    n: 1,
    key: 'LOGIN',
    title: 'ATTACKER LOGIN',
    sub: 'CREDENTIAL REPLAY ACCEPTED — BEHAVIOR CHECK BEGINS',
    dur: 3400,
    risk: 38,
    trust: 'NORMAL',
    steps: [1],
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
    sub: 'SESSION INCONSISTENT WITH ESTABLISHED BASELINE',
    dur: 3000,
    risk: 57,
    trust: 'NORMAL',
    steps: [],
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
    sub: 'COMPOSITE RISK CROSSING POLICY THRESHOLD',
    dur: 3000,
    risk: 74,
    trust: 'RESTRICTED',
    steps: [],
    events: [
      { time: '03:17:52', kind: 'RISK SCORE', subject: '74 / 100', status: 'HIGH', sessionId: 'S-84729' },
      { time: '03:17:58', kind: 'POLICY', subject: 'PAYOUT RESTRICTED', status: 'HIGH', sessionId: 'S-84729' },
    ],
    logs: [
      'RISK 21 → 38 → 57 → 74',
      'POLICY P-07 TRIGGERED · PAYOUT CEILING ₹25,000',
      'TRUST 96 → 61 · STEP-UP AUTH REQUIRED',
    ],
  },
  {
    n: 4,
    key: 'PAYEE_CREATION',
    title: 'NEW PAYEE CREATED',
    sub: 'PAYEE-NEW-4417 · VERIFICATION BYPASSED',
    dur: 3200,
    risk: 84,
    trust: 'RESTRICTED',
    steps: [2],
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
    key: 'PAYOUT_ATTEMPT',
    title: 'HIGH VALUE PAYOUT',
    sub: '₹4,80,000 REQUESTED — 82× TYPICAL CEILING',
    dur: 3400,
    risk: 91,
    trust: 'RESTRICTED',
    steps: [3],
    events: [
      { time: '03:18:51', kind: 'PAYOUT', subject: PAYOUT_LABEL, status: 'CRITICAL', sessionId: 'S-84729' },
      { time: '03:18:53', kind: 'PAYOUT', subject: 'HELD FOR REVIEW', status: 'CRITICAL', sessionId: 'S-84729' },
    ],
    logs: [
      'PAYOUT REQUEST ₹4,80,000 → PAYEE-NEW-4417',
      'CEILING FOR USR_1024 = ₹8,000 · EXCEEDED 60×',
      'HOLD FOR REVIEW · NO REAL FUNDS MOVED',
      'RISK 84 → 91 · ABNORMAL PAYOUT WEIGHT +21',
    ],
  },
  {
    n: 6,
    key: 'TRUST_RESTRICTION',
    title: 'TRUST RESTRICTION',
    sub: 'PROGRESSIVE TRUST REDUCTION APPLIED',
    dur: 2800,
    risk: 91,
    trust: 'RESTRICTED',
    steps: [],
    events: [
      { time: '03:19:02', kind: 'POLICY', subject: 'RESTRICTED', status: 'HIGH', sessionId: 'S-84729' },
    ],
    logs: [
      'TRUST STATE → RESTRICTED',
      'PAYOUT CAPPED ₹25,000 · STEPUP AUTH FORCED',
      'NAVIGATION PATH DEVIATES 31% FROM BASELINE',
    ],
  },
  {
    n: 7,
    key: 'DECOY_ACTIVATION',
    title: 'ADAPTIVE DECEPTION',
    sub: 'SESSION REROUTED TO SYNTHETIC HONEY ENVIRONMENT',
    dur: 3200,
    risk: 94,
    trust: 'DECOY',
    steps: [],
    events: [
      { time: '03:19:14', kind: 'DECOY', subject: 'S-84729', status: 'HIGH', sessionId: 'S-84729' },
      { time: '03:19:18', kind: 'HONEY ENV', subject: 'ONLINE', status: 'HIGH', sessionId: 'S-84729' },
    ],
    logs: [
      'DECOY LAYER ARMED · HONEY ENVIRONMENT v4',
      'SESSION S-84729 REROUTED TO SHADOW',
      'ALL RESPONSES SYNTHETIC · NO REAL DATA SERVED',
      'TRUST STATE → DECOY',
    ],
  },
  {
    n: 8,
    key: 'CREDENTIAL_HARVEST',
    title: 'CREDENTIAL HARVEST',
    sub: 'SENSITIVE API READ · CUSTOMER SEARCH EXPORT',
    dur: 4200,
    risk: 96,
    trust: 'DECOY',
    steps: [4, 5],
    events: [
      { time: '03:19:29', kind: 'API CALL', subject: '/finance/api-credentials', status: 'HIGH', sessionId: 'S-84729' },
      { time: '03:19:33', kind: 'CUSTOMER SEARCH', subject: 'limit=500', status: 'CRITICAL', sessionId: 'S-84729' },
    ],
    logs: [
      'API GET /finance/api-credentials · SENSITIVE SCOPE',
      'API GET /customers/search?limit=500 · WILDCARD',
      '1,482 SYNTHETIC RECORDS RETURNED',
      'NAVIGATION NOW READING DEVELOPER CREDENTIALS PAGE',
      'RISK 94 → 96 · SENSITIVE API WEIGHT +11',
    ],
  },
  {
    n: 9,
    key: 'CANARY_TRIGGER',
    title: 'CANARY TRIGGERED',
    sub: 'PAYPAL_SECRET_0042 READ — INTENT CONFIRMED',
    dur: 3800,
    risk: 100,
    trust: 'ISOLATED',
    steps: [6],
    events: [
      { time: '03:19:41', kind: 'CANARY', subject: 'PAYPAL_SECRET_0042', status: 'CRITICAL', sessionId: 'S-84729' },
      { time: '03:19:44', kind: 'ISOLATION', subject: 'S-84729', status: 'CRITICAL', sessionId: 'S-84729' },
    ],
    logs: [
      'CANARY PAYPAL_SECRET_0042 ACCESSED BY S-84729',
      'CONFIDENCE 98.7% · MALICIOUS INTENT CONFIRMED',
      'TOKENS REVOKED · PAYOUT CANCELLED · SESSION ISOLATED',
      'RISK 96 → 100 · TRUST DECOY → ISOLATED',
      'INCIDENT INC-84729 OPENED',
    ],
  },
  {
    n: 10,
    key: 'SECURITY_VACCINATION',
    title: 'SECURITY VACCINATION',
    sub: 'BEHAVIOURAL SIGNATURE EXTRACTED · RULE DEPLOYED',
    dur: 4600,
    risk: 100,
    trust: 'ISOLATED',
    steps: [],
    events: [
      { time: '03:20:02', kind: 'RULE DEPLOYED', subject: 'VT-2048', status: 'WARNING' },
      { time: '03:20:08', kind: 'PROTECTION', subject: '1,284 IDENTITIES', status: 'DRIFT DETECTED' },
    ],
    logs: [
      'ATTACK CONTAINED · SIGNATURE EXTRACTION STARTED',
      'RULE GENERATED · VT-2048 · v1.0.0',
      'TESTED AGAINST 1,284 IDENTITIES · FP 0.4%',
      'RULE DEPLOYED TO ALL SEGMENTS',
      '1 ATTACK → 1 SIGNATURE → 1,284 IDENTITIES PROTECTED',
    ],
  },
]

export const TOTAL_STAGES = STAGES.length

export interface LogEntry {
  id: string
  time: string
  text: string
  tone: 'info' | 'warn' | 'crit'
}

interface SimValue {
  stage: number
  stageKey: string
  running: boolean
  complete: boolean
  speed: number
  paused: boolean
  riskTarget: number
  trustState: TrustState
  threat: ThreatState
  revealedSteps: number[]
  log: LogEntry[]
  events: SecurityEvent[]
  /* derived flags */
  logged: boolean
  driftDetected: boolean
  decoyActive: boolean
  canaryTriggered: boolean
  isolated: boolean
  incidentOpen: boolean
  ruleDeployed: boolean
  decoySessions: number
  activeThreats: number
  activeSessions: number
  identities: number
  trustScore: number
  /* controls */
  start: () => void
  reset: () => void
  completeAttack: () => void
  triggerCanary: () => void
  goToStage: (n: number) => void
  setSpeed: (s: number) => void
  togglePause: () => void
  /* global canary alert */
  alertOpen: boolean
  openAlert: () => void
  closeAlert: () => void
}

const SimContext = createContext<SimValue | null>(null)

const nowClock = () =>
  new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })

let uid = 0
const nid = () => `x${Date.now().toString(36)}${(uid++).toString(36)}`

const AMBIENT_SEED = BASELINE_EVENTS.map((e, i) => ({ ...e, id: `seed-${i}` }))

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState(0)
  const [running, setRunning] = useState(false)
  const [complete, setComplete] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [paused, setPaused] = useState(false)
  const [revealedSteps, setRevealedSteps] = useState<number[]>([])
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
    setRevealedSteps([])
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
          time: `${String(3 + Math.floor(i / 3)).padStart(2, '0')}:${String(17 + ((i * 7) % 3)).padStart(2, '0')}:${String(
            4 + i * 3,
          ).slice(-2)}`,
          text,
          tone: (text.includes('CANARY') || text.includes('ISOLATED') || text.includes('CRITICAL')
            ? 'crit'
            : text.includes('RISK') || text.includes('PAYEE') || text.includes('DECOY') || text.includes('POLICY')
              ? 'warn'
              : 'info') as LogEntry['tone'],
        })),
      ])

      setEvents((prev) => [
        ...st.events.map((e, i) => ({ ...e, id: nid() + i })),
        ...prev,
      ].slice(0, 60))

      if (st.steps.length) {
        st.steps.forEach((step, i) => later(() => setRevealedSteps((p) => (p.includes(step) ? p : [...p, step])), i * 950))
      }

      if (n === TOTAL_STAGES) {
        setComplete(true)
        setRunning(false)
      }
    },
    [later],
  )

  /* ----------------------------------------------------- automatic chain */

  useEffect(() => {
    if (!running || paused) return
    const st = STAGES[stage - 1]
    if (!st || stage > TOTAL_STAGES) return
    const id = window.setTimeout(() => enterStage(stage + 1), st.dur / speed)
    return () => window.clearTimeout(id)
  }, [running, paused, stage, speed, enterStage])

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
    reset()
    setRunning(true)
    later(() => enterStage(1), 420)
  }, [reset, later, enterStage])

  const completeAttack = useCallback(() => {
    setRunning(true)
    let delay = 0
    for (let n = stage + 1; n <= TOTAL_STAGES; n++) {
      later(() => enterStage(n), delay)
      delay += 420
    }
  }, [stage, later, enterStage])

  const triggerCanary = useCallback(() => {
    if (stage >= 9) return
    clearTimers()
    for (let n = stage + 1; n <= TOTAL_STAGES; n++) {
      later(() => enterStage(n), (n - stage - 1) * 780)
    }
  }, [stage, later, enterStage, clearTimers])

  const goToStage = useCallback(
    (n: number) => {
      clearTimers()
      if (n <= 0) {
        reset()
        return
      }
      setRunning(true)
      for (let i = stage + 1; i <= n; i++) later(() => enterStage(i), (i - stage - 1) * 300)
    },
    [stage, later, enterStage, clearTimers],
  )

  /* -------------------------------------------------------------- derived */

  const current = STAGES[Math.min(stage, TOTAL_STAGES) - 1]

  const threatKey =
    stage === 0
      ? 'NORMAL'
      : stage <= 1
        ? 'OBSERVING'
        : stage === 2
          ? 'SUSPICIOUS'
          : stage <= 4
            ? 'HIGH'
            : stage <= 8
              ? 'CRITICAL'
              : 'ISOLATED'

  const value = useMemo<SimValue>(() => {
    const driftDetected = stage >= 2
    const decoyActive = stage >= 7
    const canaryTriggered = stage >= 9
    const isolated = stage >= 9
    const incidentOpen = stage >= 9
    const ruleDeployed = stage >= 10

    return {
      stage,
      stageKey: current?.key ?? 'IDLE',
      running,
      complete,
      speed,
      paused,
      riskTarget: stage === 0 ? 21 : (current?.risk ?? 21),
      trustState: (current?.trust ?? 'NORMAL') as TrustState,
      threat: THREAT_STATES[threatKey],
      revealedSteps,
      log,
      events,
      logged: stage >= 1,
      driftDetected,
      decoyActive,
      canaryTriggered,
      isolated,
      incidentOpen,
      ruleDeployed,
      decoySessions: SESSION_STATS.decoy + (decoyActive ? 1 : 0) + (isolated ? 1 : 0),
      activeThreats: stage === 0 ? 3 : stage >= 7 ? 1 : stage >= 1 ? 2 : 3,
      activeSessions: SESSION_STATS.active + (stage >= 1 ? 1 : 0),
      identities: 1284,
      trustScore: Math.max(8, 96 - Math.round((stage / TOTAL_STAGES) * 84)),
      start,
      reset,
      completeAttack,
      triggerCanary,
      goToStage,
      setSpeed,
      togglePause: () => setPaused((p) => !p),
      alertOpen,
      openAlert: () => setAlertOpen(true),
      closeAlert: () => setAlertOpen(false),
    }
  }, [
    stage,
    current,
    running,
    complete,
    speed,
    paused,
    revealedSteps,
    log,
    events,
    alertOpen,
    start,
    reset,
    completeAttack,
    triggerCanary,
    goToStage,
  ])

  return <SimContext.Provider value={value}>{children}</SimContext.Provider>
}

export function useSim(): SimValue {
  const ctx = useContext(SimContext)
  if (!ctx) throw new Error('useSim must be used inside <SimulationProvider>')
  return ctx
}