/* ==========================================================================
   MOCK VACCINATION — LEARNED SIGNATURE / DEPLOYED RULE
   ========================================================================== */

export const VACCINE_RULE = {
  id: 'VT-2048',
  severity: 'CRITICAL',
  scope: 'ALL SEGMENTS · HIGH VALUE FIRST',
  conditions: [
    'NEW_DEVICE',
    'UNUSUAL_LOGIN_TIME',
    'NEW_PAYEE',
    'HIGH_VALUE_PAYOUT',
    'CREDENTIAL_CANARY',
  ],
  actions: ['ELEVATE MONITORING', 'REQUIRE STEP-UP AUTHENTICATION', 'RESTRICT PAYOUT'],
  version: 'v1.0.0',
  confidence: '96.4%',
  identitiesCovered: 1284,
  populationTested: 1284,
  falsePositiveRate: '0.4%',
}

/** Terminal lines printed while the signature is extracted and deployed. */
export const VACCINE_PIPELINE = [
  'ATTACK CONFIRMED ✓',
  'EXTRACTING BEHAVIORAL SIGNATURE...',
  'GENERATING DETECTION RULE...',
  'TESTING AGAINST IDENTITY POPULATION...',
  'FALSE POSITIVE CHECK — 0.4% WITHIN TOLERANCE',
  'RULE DEPLOYED ✓',
]

export type ImpactTone = 'crit' | 'soft' | 'ok'

export const VACCINATION_IMPACT: { value: string; label: string; tone: ImpactTone }[] = [
  { value: '1', label: 'ATTACK', tone: 'crit' },
  { value: '1', label: 'LEARNED SIGNATURE', tone: 'soft' },
  { value: '1,284', label: 'IDENTITIES PROTECTED', tone: 'ok' },
]

/** Left column of the final before/after system screen. */
export const WITHOUT_TWIN = [
  'STOLEN CREDENTIALS',
  'SUCCESSFUL LOGIN',
  'PAYMENT SYSTEM',
  'ACCOUNT TAKEOVER',
]

/** Right column of the final before/after system screen. */
export const WITH_TWIN = [
  'STOLEN CREDENTIALS',
  'BEHAVIORAL DIVERGENCE',
  'PROGRESSIVE TRUST REDUCTION',
  'ADAPTIVE DECEPTION',
  'CANARY TRIGGER',
  'INTENT IDENTIFIED',
  'ATTACK ISOLATED',
  'ATTACK SIGNATURE LEARNED',
  'OTHER IDENTITIES PROTECTED',
]