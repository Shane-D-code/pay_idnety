/* ==========================================================================
   MOCK SESSIONS — SYNTHETIC SESSION TELEMETRY
   ========================================================================== */

import type { Session } from './types'
import { FEATURED_IDENTITIES, IDENTITIES } from './mockIdentities'

export const ATTACK_SESSION_ID = 'S-84729'
export const ATTACK_IDENTITY_ID = 'USR_1024'
export const PAYOUT_AMOUNT = 480000
export const PAYOUT_LABEL = '₹4,80,000'

export const SESSIONS: Session[] = [
  {
    id: 'S-84729',
    identityId: 'USR_1024',
    identityName: 'ADWIKA',
    device: 'WINDOWS/CHROME',
    browser: 'CHROME 129',
    location: 'DELHI, IN',
    ip: '103.87.xx.xx',
    start: '03:17',
    durationMin: 6,
    risk: 91,
    kind: 'ISOLATED',
    trustState: 'ISOLATED',
    actions: 9,
    drift: 64,
    token: 'sk_live_7f2a••••••••',
  },
  {
    id: 'S-84722',
    identityId: 'USR_1187',
    identityName: 'ROHAN',
    device: 'MAC/SAFARI',
    browser: 'SAFARI 18',
    location: 'PUNE, IN',
    ip: '49.36.xx.xx',
    start: '09:31',
    durationMin: 14,
    risk: 8,
    kind: 'LEGIT',
    trustState: 'NORMAL',
    actions: 22,
    drift: 3,
    token: 'tok_4c11••••••••',
  },
  {
    id: 'S-84725',
    identityId: 'USR_1302',
    identityName: 'ISHITA',
    device: 'IPHONE/SAFARI',
    browser: 'SAFARI 18',
    location: 'HYDERABAD, IN',
    ip: '106.51.xx.xx',
    start: '08:02',
    durationMin: 7,
    risk: 5,
    kind: 'LEGIT',
    trustState: 'NORMAL',
    actions: 11,
    drift: 2,
    token: 'tok_9d3e••••••••',
  },
  {
    id: 'S-84726',
    identityId: 'USR_1440',
    identityName: 'KABIR',
    device: 'ANDROID/CHROME',
    browser: 'CHROME 129',
    location: 'MUMBAI, IN',
    ip: '117.209.xx.xx',
    start: '11:48',
    durationMin: 9,
    risk: 44,
    kind: 'DRIFT',
    trustState: 'RESTRICTED',
    actions: 14,
    drift: 27,
    token: 'tok_2b70••••••••',
  },
  {
    id: 'S-84727',
    identityId: 'USR_1590',
    identityName: 'ANANYA',
    device: 'MAC/CHROME',
    browser: 'CHROME 129',
    location: 'KOLKATA, IN',
    ip: '45.114.xx.xx',
    start: '10:12',
    durationMin: 41,
    risk: 3,
    kind: 'LEGIT',
    trustState: 'NORMAL',
    actions: 63,
    drift: 1,
    token: 'tok_a0f9••••••••',
  },
  {
    id: 'S-84728',
    identityId: 'USR_1623',
    identityName: 'VIKRAM',
    device: 'WINDOWS/EDGE',
    browser: 'EDGE 129',
    location: 'CHENNAI, IN',
    ip: '175.41.xx.xx',
    start: '13:05',
    durationMin: 19,
    risk: 17,
    kind: 'LEGIT',
    trustState: 'NORMAL',
    actions: 27,
    drift: 9,
    token: 'tok_55c2••••••••',
  },
  {
    id: 'S-84720',
    identityId: 'USR_1302',
    identityName: 'ISHITA',
    device: 'IPAD/SAFARI',
    browser: 'SAFARI 18',
    location: 'CHENNAI, IN',
    ip: '101.4.xx.xx',
    start: '19:24',
    durationMin: 12,
    risk: 61,
    kind: 'DRIFT',
    trustState: 'DECOY',
    actions: 17,
    drift: 38,
    token: 'tok_8e14••••••••',
  },
  {
    id: 'S-84718',
    identityId: 'USR_1187',
    identityName: 'ROHAN',
    device: 'LINUX/FIREFOX',
    browser: 'FIREFOX 133',
    location: 'GOA, IN',
    ip: '88.201.xx.xx',
    start: '02:41',
    durationMin: 4,
    risk: 72,
    kind: 'DECOY',
    trustState: 'DECOY',
    actions: 6,
    drift: 49,
    token: 'tok_c31a••••••••',
  },
  {
    id: 'S-84716',
    identityId: 'USR_1590',
    identityName: 'ANANYA',
    device: 'MAC/CHROME',
    browser: 'CHROME 129',
    location: 'KOLKATA, IN',
    ip: '45.114.xx.xx',
    start: '08:31',
    durationMin: 52,
    risk: 2,
    kind: 'LEGIT',
    trustState: 'NORMAL',
    actions: 88,
    drift: 1,
    token: 'tok_1d92••••••••',
  },
  {
    id: 'S-84711',
    identityId: 'USR_1440',
    identityName: 'KABIR',
    device: 'ANDROID/CHROME',
    browser: 'CHROME 129',
    location: 'MUMBAI, IN',
    ip: '117.209.xx.xx',
    start: '12:20',
    durationMin: 5,
    risk: 6,
    kind: 'LEGIT',
    trustState: 'NORMAL',
    actions: 8,
    drift: 4,
    token: 'tok_6f88••••••••',
  },
]

export const ATTACK_SESSION = SESSIONS[0]

/* ------------------------------------------------------- generated fleet */

const FLEET_DEVICES = ['MAC/SAFARI', 'WINDOWS/CHROME', 'IPHONE/SAFARI', 'ANDROID/CHROME', 'IPAD/SAFARI', 'WINDOWS/EDGE']
const FLEET_BROWSERS = ['CHROME 129', 'SAFARI 18', 'EDGE 129', 'FIREFOX 133']
const FLEET_CITIES = ['BANGALORE, IN', 'MUMBAI, IN', 'DELHI, IN', 'HYDERABAD, IN', 'CHENNAI, IN', 'PUNE, IN', 'KOCHI, IN', 'INDORE, IN']

/** Deterministic PRNG so the fleet is identical on every render. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * The register claims `SESSION_STATS.active` concurrent sessions, so the fleet
 * is generated to exactly that size rather than leaving the headline number and
 * the row count disagreeing.
 */
function generateSessions(count: number): Session[] {
  const rnd = mulberry32(0x5a17)
  const out: Session[] = []
  const pool = IDENTITIES.slice(FEATURED_IDENTITIES.length)

  for (let i = 0; i < count; i++) {
    const id = `S-${83000 - i}`
    const who = pool[Math.floor(rnd() * pool.length)]
    const city = FLEET_CITIES[Math.floor(rnd() * FLEET_CITIES.length)]
    const device = FLEET_DEVICES[Math.floor(rnd() * FLEET_DEVICES.length)]
    const browser = FLEET_BROWSERS[Math.floor(rnd() * FLEET_BROWSERS.length)]
    const hour = 6 + Math.floor(rnd() * 17)
    const minute = Math.floor(rnd() * 60)
    /* most sessions match their baseline; a minority drift */
    const drifting = rnd() < 0.16
    const risk = drifting ? 32 + Math.floor(rnd() * 30) : Math.floor(rnd() * 26)
    const drift = drifting ? 22 + Math.floor(rnd() * 26) : Math.floor(rnd() * 12)

    out.push({
      id,
      identityId: who.id,
      identityName: who.name.split(' ')[0].toUpperCase(),
      device,
      browser,
      location: city,
      ip: `${49 + Math.floor(rnd() * 130)}.${Math.floor(rnd() * 255)}.xx.xx`,
      start: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      durationMin: 3 + Math.floor(rnd() * 56),
      risk,
      kind: drifting ? 'DRIFT' : 'LEGIT',
      trustState: drifting ? 'RESTRICTED' : 'NORMAL',
      actions: 5 + Math.floor(rnd() * 90),
      drift,
      token: `tok_${Math.floor(rnd() * 0xffff).toString(16).padStart(4, '0')}••••••••`,
    })
  }

  return out
}

const FLEET_SIZE = 77 // + the 10 hand-written rows above = 87 concurrent sessions

export const SESSION_FLEET: Session[] = generateSessions(FLEET_SIZE)

/** Every session the console knows about, hand-written cast first. */
export const ALL_SESSIONS: Session[] = [...SESSIONS, ...SESSION_FLEET]

export const SESSION_STATS = {
  active: ALL_SESSIONS.length,
  decoy: SESSIONS.filter((s) => s.kind === 'DECOY').length,
  isolated: SESSIONS.filter((s) => s.kind === 'ISOLATED').length,
  restricted: SESSIONS.filter((s) => s.trustState === 'RESTRICTED').length,
}