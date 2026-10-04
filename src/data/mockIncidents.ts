/* ==========================================================================
   MOCK INCIDENTS — FORENSIC RECORD FOR INCIDENT #INC-84729
   ========================================================================== */

import type { Incident } from './types'

export const INCIDENT: Incident = {
  id: '#INC-84729',
  sessionId: 'S-84729',
  identity: 'ADWIKA JAISWAL',
  risk: 91,
  status: 'CRITICAL',
  opened: '2026-10-03 03:17:04 IST',
  origin: 'DELHI, IN · 103.87.xx.xx',
  attackVector: 'CREDENTIAL THEFT → PAYOUT FRAUD',
  contained: true,
  signals: [
    'NEW DEVICE FINGERPRINT 91C4-A7D2-0031',
    'GEO-VELOCITY: 1,450 KM IN A SINGLE SESSION',
    'LOGIN 05H47M BEFORE BASELINE WINDOW OPENS',
    'PAYEE CREATED LESS THAN 2 MIN AFTER LOGIN',
    'PAYOUT 82× IDENTITY TYPICAL CEILING',
    'SENSITIVE API READ FROM UNFAMILIAR DEVICE CLASS',
    'CANARY CREDENTIAL ACCESSED — INTENT CONFIRMED',
  ],
  timeline: [
    { time: '03:17', title: 'LOGIN', detail: 'AUTHENTICATION SUCCEEDED — STOLEN CREDENTIAL', tone: 'warn' },
    { time: '03:17', title: 'DEVICE CHANGE', detail: 'FINGERPRINT 91C4-A7D2-0031 — UNKNOWN CLASS', tone: 'warn' },
    { time: '03:18', title: 'LOCATION DRIFT', detail: 'BANGALORE → DELHI · 1,450 KM DISPLACEMENT', tone: 'warn' },
    { time: '03:18', title: 'PAYEE CREATED', detail: 'PAYEE-NEW-4417 · NO VERIFICATION CHALLENGE', tone: 'crit' },
    { time: '03:19', title: 'PAYOUT ATTEMPT', detail: '₹4,80,000 REQUESTED — ABOVE CEILING 82×', tone: 'crit' },
    { time: '03:19', title: 'API ACCESS', detail: '/finance/api-credentials — SENSITIVE SCOPE', tone: 'warn' },
    { time: '03:19', title: 'CANARY TRIGGER', detail: 'PAYPAL_SECRET_0042 READ — INTENT CONFIRMED', tone: 'crit' },
    { time: '03:19', title: 'SESSION ISOLATED', detail: 'TOKENS REVOKED · PAYOUT CANCELLED · SEALED', tone: 'crit' },
  ],
  report: [
    "A session associated with Adwika's account deviated significantly from the established behavioural baseline held by IdentityTwin.",
    'The session originated from a previously unseen device, an unregistered location and an atypical hour — three independent signals that combined into a divergence score of 64 points before any transactional action was attempted.',
    'The session subsequently created a new payee and requested an unusually large payout of ₹4,80,000, roughly 82× the ceiling observed across 74 legitimate sessions in the last 30 days.',
    'Rather than locking the account and alerting the real user, IdentityTwin progressively reduced trust and redirected the session into a controlled deception environment. There the session accessed a canary credential — a synthetic secret with no operational value — confirming malicious intent to monetise the access.',
    'No real customer record was read, no live credential was disclosed and no funds moved. The attack was contained at stage 11 of 13 and converted into a reusable behavioural signature.',
  ],
  actions: ['ISOLATE SESSION', 'REVOKE ACTIVE CREDENTIALS', 'CANCEL PENDING PAYOUT', 'PRESERVE EVIDENCE'],
}

/** Lightweight queue shown above the incident view. */
export const INCIDENT_QUEUE = [
  { id: '#INC-84729', subject: 'ADWIKA JAISWAL', risk: 91, state: 'ISOLATED', age: '02M' },
  { id: '#INC-84721', subject: 'ISHITA RAO', risk: 61, state: 'DECOY', age: '19M' },
  { id: '#INC-84718', subject: 'ROHAN MEHTA', risk: 72, state: 'DECOY', age: '41M' },
  { id: '#INC-84704', subject: 'KABIR ANAND', risk: 44, state: 'RESTRICTED', age: '2H' },
]