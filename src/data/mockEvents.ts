/* ==========================================================================
   MOCK EVENTS — SECURITY EVENT STREAM + RISIC LEDGER
   ========================================================================== */

import type { RiskContribution, SecurityEvent, ThreatState } from './types'

/** Baseline event stream shown on an idle command centre. */
export const BASELINE_EVENTS: SecurityEvent[] = [
  { id: 'e01', time: '09:41:12', kind: 'LOGIN', subject: 'ADWIKA', status: 'NORMAL' },
  { id: 'e02', time: '09:41:17', kind: 'TRANSACTION', subject: 'ADWIKA', status: 'NORMAL' },
  { id: 'e03', time: '09:41:44', kind: 'CHECKOUT', subject: 'ISHITA', status: 'NORMAL' },
  { id: 'e04', time: '09:42:03', kind: 'LOGIN', subject: 'ADWIKA', status: 'DRIFT DETECTED' },
  { id: 'e05', time: '09:42:09', kind: 'NEW DEVICE', subject: 'UNKNOWN', status: 'WARNING' },
  { id: 'e06', time: '09:42:14', kind: 'TOKEN REFRESH', subject: 'KABIR', status: 'NORMAL' },
  { id: 'e07', time: '09:42:18', kind: 'PAYEE ADDED', subject: 'UNKNOWN', status: 'HIGH' },
  { id: 'e08', time: '09:42:22', kind: 'PAYOUT', subject: '₹4,80,000', status: 'CRITICAL' },
  { id: 'e09', time: '09:42:31', kind: 'API CALL', subject: 'ANANYA', status: 'NORMAL' },
  { id: 'e10', time: '09:42:36', kind: 'DEVICE VERIFY', subject: 'ROHAN', status: 'NORMAL' },
]

/** Benign ambient traffic used to keep the live feed alive on idle. */
export const AMBIENT_EVENT_POOL: Omit<SecurityEvent, 'id' | 'time'>[] = [
  { kind: 'LOGIN', subject: 'ISHITA', status: 'NORMAL' },
  { kind: 'LOGOUT', subject: 'VIKRAM', status: 'NORMAL' },
  { kind: 'CHECKOUT', subject: 'ROHAN', status: 'NORMAL' },
  { kind: 'TOKEN REFRESH', subject: 'ANANYA', status: 'NORMAL' },
  { kind: 'TRANSACTION', subject: 'KABIR', status: 'NORMAL' },
  { kind: 'API CALL', subject: 'ADWIKA', status: 'NORMAL' },
  { kind: 'PAYEE VERIFIED', subject: 'ISHITA', status: 'NORMAL' },
  { kind: 'STEP-UP AUTH', subject: 'VIKRAM', status: 'NORMAL' },
  { kind: 'IP ALLOWLIST', subject: 'ANANYA', status: 'NORMAL' },
  { kind: 'DEVICE ENROLLED', subject: 'ROHAN', status: 'NORMAL' },
  { kind: 'BEHAVIOR MODEL', subject: 'USR_1302', status: 'NORMAL' },
  { kind: 'SESSION RESUMED', subject: 'ANANYA', status: 'NORMAL' },
]

/**
 * Risk ledger — the six signals sum to exactly 91/100 before the canary pushes
 * the composite score to 100. `fromStage` is when the evidence for that signal
 * actually lands in the stream, so the ledger lights up row by row as the
 * attack is replayed.
 */
export const RISK_CONTRIBUTIONS: (RiskContribution & { fromStage: number })[] = [
  { label: 'NEW DEVICE', value: 18, detail: 'FINGERPRINT 91C4 — NEVER OBSERVED', fromStage: 1 },
  { label: 'UNUSUAL LOCATION', value: 14, detail: 'DELHI — 1,450 KM FROM BASELINE', fromStage: 1 },
  { label: 'UNUSUAL LOGIN TIME', value: 11, detail: '03:17 — OUTSIDE 08:00–22:30 WINDOW', fromStage: 1 },
  { label: 'NEW PAYEE', value: 16, detail: 'PAYEE-NEW-4417 CREATED IN-SESSION', fromStage: 4 },
  { label: 'ABNORMAL PAYOUT', value: 21, detail: '₹4,80,000 — 82× TYPICAL CEILING', fromStage: 5 },
  { label: 'SENSITIVE API ACCESS', value: 11, detail: '/finance/api-credentials ACCESSED', fromStage: 6 },
]

/** The exact sum of the ledger — the score the attack plateaus at. */
export const RISK_LEDGER_SUM = RISK_CONTRIBUTIONS.reduce((a, c) => a + c.value, 0)

export const RISK_BASELINE = 21

/** Composite risk as it climbs during the simulation. */
export const RISK_LADDER = [21, 38, 57, 74, 91, 100] as const

/** Trust as it collapses — the session ends isolated at 09. */
export const TRUST_LADDER_SCORES = [96, 88, 71, 61, 24, 9] as const

/**
 * What the attacker appears to be after, inferred from the actions taken inside
 * the decoy environment. An axis only becomes legible once there is evidence for
 * it, so the panel fills in as the simulation progresses.
 */
export const ATTACKER_INTENT: {
  key: string
  label: string
  pct: number
  fromStage: number
  evidence: string
}[] = [
  { key: 'cred', label: 'CREDENTIAL DISCOVERY', pct: 92, fromStage: 7, evidence: 'READ /finance/api-credentials · SECRET VIEWED' },
  { key: 'fin', label: 'FINANCIAL TARGETING', pct: 87, fromStage: 5, evidence: 'BALANCE READ · PAYOUT FORM OPENED' },
  { key: 'priv', label: 'PRIVILEGE ESCALATION', pct: 71, fromStage: 8, evidence: 'ADMIN API PROBED · SCOPE EXPANSION ATTEMPT' },
  { key: 'cust', label: 'CUSTOMER DATA DISCOVERY', pct: 54, fromStage: 8, evidence: 'CUSTOMER SEARCH · WILDCARD EXPORT' },
  { key: 'src', label: 'SOURCE CODE DISCOVERY', pct: 19, fromStage: 6, evidence: 'STATIC ASSET PROBES ONLY' },
]

export const LIKELY_OBJECTIVE = 'FINANCIAL THEFT THROUGH PAYOUT MANIPULATION'

/** Progressive trust-collapse ladder. */
export const TRUST_LADDER: {
  state: 'NORMAL' | 'RESTRICTED' | 'DECOY' | 'ISOLATED'
  permission: string
  detail: string
  index: string
}[] = [
  { state: 'NORMAL', permission: 'FULL ACCESS', detail: 'ALL PAYMENT APIs · FULL PAYOUT LIMITS', index: 'F1' },
  {
    state: 'RESTRICTED',
    permission: 'REDUCED TRANSACTION LIMITS',
    detail: 'PAYOUT CAPPED AT ₹25,000 · STEP-UP AUTH REQUIRED',
    index: 'F2',
  },
  {
    state: 'DECOY',
    permission: 'SHADOW ENVIRONMENT',
    detail: 'SESSION REROUTED TO SYNTHETIC HONEY ENVIRONMENT',
    index: 'F3',
  },
  {
    state: 'ISOLATED',
    permission: 'REAL RESOURCES BLOCKED',
    detail: 'ALL TOKENS REVOKED · EVIDENCE PRESERVED',
    index: 'F4',
  },
]

/** Right-hand threat monitor states. */
export const THREAT_STATES: Record<string, ThreatState> = {
  NORMAL: {
    state: 'NORMAL',
    blurb: 'NO ACTIVE DIVERGENCE. BASELINES ALIGNED WITH OBSERVED BEHAVIOR.',
    level: 1,
  },
  OBSERVING: {
    state: 'OBSERVING',
    blurb: 'SESSION S-84729 DEVIATES FROM BASELINE. SCORING IN PROGRESS.',
    level: 2,
  },
  SUSPICIOUS: {
    state: 'SUSPICIOUS',
    blurb: 'DEVICE AND GEOGRAPHY UNKNOWN. ELEVATED MONITORING ENGAGED.',
    level: 3,
  },
  HIGH: {
    state: 'HIGH RISK',
    blurb: 'DIVERGENCE SCORE 74. PAYOUT POLICY TIGHTENING.',
    level: 4,
  },
  CRITICAL: {
    state: 'CRITICAL',
    blurb: 'INTENT INDICATORS PRESENT. DECOY ENVIRONMENT ARMING.',
    level: 5,
  },
  ISOLATED: {
    state: 'ISOLATED',
    blurb: 'CANARY TRIGGERED. SESSION ISOLATED. SIGNATURE EXTRACTION RUNNING.',
    level: 6,
  },
}

export const SYSTEM_STATUS_ROWS = [
  { label: 'CORE ENGINE', value: 'ONLINE', tone: 'ok' as const },
  { label: 'BEHAVIOR MODEL', value: 'ONLINE', tone: 'ok' as const },
  { label: 'THREAT ENGINE', value: 'ONLINE', tone: 'ok' as const },
  { label: 'DECEPTION LAYER', value: 'ARMED', tone: 'ok' as const },
  { label: 'ATTACKTRACE', value: 'READY', tone: 'ok' as const },
]