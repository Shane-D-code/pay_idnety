/* ==========================================================================
   MOCK THREATS — ATTACKTRACE GRAPH + THREAT INTELLIGENCE
   ========================================================================== */

import type { AttackTraceNode } from './types'

export const ATTACKTRACE_NODES: AttackTraceNode[] = [
  {
    id: 'device',
    label: 'DEVICE',
    kind: 'origin',
    tone: 'crit',
    detail: {
      FINGERPRINT: '91C4-A7D2-0031',
      PLATFORM: 'WINDOWS 11 · UNKNOWN HARDWARE PROFILE',
      BROWSER: 'CHROME 129 · HEADLESS INDICATORS PRESENT',
      'FIRST SEEN': '2026-10-03 03:17:04 IST',
      TRUST: 'UNTRUSTED / NEVER OBSERVED',
    },
  },
  {
    id: 'ip',
    label: 'IP',
    kind: 'origin',
    tone: 'crit',
    detail: {
      ADDRESS: '103.87.xx.xx',
      ASN: 'AS-9829 · ANONYMOUS HOSTING · NL',
      REPUTATION: 'HOSTILE',
      GEO: 'DELHI, IN · 18ms RTT',
      ANOMALY: 'TLS FINGERPRINT MISMATCH',
      'SEEN BEFORE': '3 IDENTITIES · 0 LEGITIMATE',
    },
  },
  {
    id: 'session',
    label: 'SESSION',
    kind: 'session',
    tone: 'crit',
    detail: {
      ID: 'S-84729',
      IP: '103.xx.xx.xx',
      DEVICE: 'WINDOWS / CHROME',
      LOCATION: 'DELHI, IN',
      ACCOUNT: 'ADWIKA · USR_1024',
      ACTIONS: '9 · 6 INSIDE DECOY ENVIRONMENT',
      STATUS: 'ISOLATED',
    },
  },
  {
    id: 'account',
    label: 'ACCOUNT',
    kind: 'account',
    tone: 'warn',
    detail: {
      IDENTITY: 'ADWIKA JAISWAL',
      HANDLE: 'USR_1024',
      'TRUST SCORE': '96 → 12',
      CREDENTIAL: 'STOLEN · PASSWORD + OTP INTERCEPT',
      SEGMENT: 'PRIORITY / HIGH VALUE',
      ASSETS: '₹8,42,100 BALANCE · 6 PAYEES',
    },
  },
  {
    id: 'payee',
    label: 'PAYEE',
    kind: 'resource',
    tone: 'crit',
    detail: {
      ID: 'PAYEE-NEW-4417',
      NAME: 'HOLLOWPOINT TRADING LLC',
      CREATED: '03:18:22 · INSIDE ATTACKER SESSION',
      VERIFICATION: 'NONE',
      AMOUNT: '₹4,80,000',
      STATUS: 'CANCELLED · EVIDENCE SEALED',
    },
  },
  {
    id: 'custdata',
    label: 'CUSTOMER DATA',
    kind: 'resource',
    tone: 'crit',
    detail: {
      RESOURCE: '/customers/search?limit=500',
      QUERY: 'WILDCARD EXPORT ATTEMPT',
      RESULT: 'SYNTHETIC 1,482 RECORDS',
      'REAL DATA': 'NEVER TOUCHED',
      STATUS: 'CANARY DETECTED · SESSION TAGGED',
    },
  },
  {
    id: 'honeyapi',
    label: 'HONEY API',
    kind: 'action',
    tone: 'warn',
    detail: {
      ENDPOINT: '/finance/api-credentials',
      METHOD: 'GET',
      RESPONSE: 'SYNTHETIC CREDENTIAL SET',
      LURE: 'PAYPAL_SECRET_0042',
      TRIGGER: 'ATTACKER READ THE DECOY SECRET',
      VALUE: 'CONFIRMS INTENT TO MONETISE',
    },
  },
  {
    id: 'canary',
    label: 'CANARY',
    kind: 'terminal',
    tone: 'crit',
    detail: {
      NAME: 'PAYPAL_SECRET_0042',
      TRIGGERED: '03:19:41',
      CONFIDENCE: '98.7%',
      EVIDENCE: 'FULL REQUEST / TRACE CAPTURE SEALED',
      ACTION: 'SESSION ISOLATED · TOKENS REVOKED',
    },
  },
]

export interface TraceEdge {
  id: string
  source: string
  target: string
  tone: 'crit' | 'warn' | 'neutral'
  label?: string
}

export const ATTACKTRACE_EDGES: TraceEdge[] = [
  { id: 'tr-1', source: 'device', target: 'ip', tone: 'crit' },
  { id: 'tr-2', source: 'ip', target: 'session', tone: 'crit' },
  { id: 'tr-3', source: 'session', target: 'account', tone: 'crit' },
  { id: 'tr-4', source: 'session', target: 'payee', tone: 'crit' },
  { id: 'tr-5', source: 'session', target: 'custdata', tone: 'warn' },
  { id: 'tr-6', source: 'session', target: 'honeyapi', tone: 'warn' },
  { id: 'tr-7', source: 'honeyapi', target: 'canary', tone: 'crit', label: 'TRIGGERED' },
  { id: 'tr-8', source: 'payee', target: 'session', tone: 'crit' },
]

/** Nodes light up progressively as the simulation advances. */
export const NODE_REVEAL_ORDER = [
  'device',
  'ip',
  'session',
  'account',
  'payee',
  'custdata',
  'honeyapi',
  'canary',
] as const

export const ATTACK_VECTOR = 'CREDENTIAL THEFT → PAYOUT FRAUD'