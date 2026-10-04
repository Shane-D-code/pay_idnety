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

/** Risk ledger — sums to 91/100 before the canary pushes the score to 100. */
export const RISK_CONTRIBUTIONS: RiskContribution[] = [
  { label: 'NEW DEVICE', value: 18, detail: 'FINGERPRINT 91C4 — NEVER OBSERVED' },
  { label: 'UNUSUAL LOCATION', value: 14, detail: 'DELHI — 1,450 KM FROM BASELINE' },
  { label: 'UNUSUAL TIME', value: 11, detail: '03:17 — OUTSIDE 08:00–22:30 WINDOW' },
  { label: 'NEW PAYEE', value: 16, detail: 'PAYEE-NEW-4417 CREATED IN-SESSION' },
  { label: 'ABNORMAL PAYOUT', value: 21, detail: '₹4,80,000 — 82× TYPICAL CEILING' },
  { label: 'SENSITIVE API', value: 11, detail: '/finance/api-credentials ACCESSED' },
]

export const RISK_BASELINE = 21

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