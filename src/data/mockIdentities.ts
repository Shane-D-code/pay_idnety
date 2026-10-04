/* ==========================================================================
   MOCK IDENTITIES — SYNTHETIC POPULATION
   Fabricated identities used to demonstrate behavioural baselines.

   The console reports a population of 1,284 identities. Rather than
   hard-coding that number in every component, the population is generated
   deterministically below and `IDENTITY_COUNT` is read off the real array —
   so the number on screen can never drift from the data behind it.
   ========================================================================== */

import type { DriftDimension, Identity } from './types'

/** How many synthetic identities the demo reports on. */
const POPULATION = 1284

/** The hand-written cast that always appears at the top of the register. */
export const FEATURED_IDENTITIES: Identity[] = [
  {
    id: 'USR_1024',
    name: 'Adwika Jaiswal',
    handle: 'adwika.j',
    trustScore: 96,
    segment: 'PRIORITY / HIGH VALUE',
    since: '2021-03-11',
    riskLevel: 'LOW',
    trustState: 'NORMAL',
    normalLocations: ['Bangalore'],
    normalDevices: ['Mac', 'iPhone'],
    normalLoginHours: '08:00-22:30',
    typicalPayout: '₹2,000-₹8,000',
    knownPayees: 6,
    typicalSessionMin: 12,
    sessions30d: 74,
    enrollment: 214,
    fingerprint: 'BT-9F2C-4A71-D08E',
  },
  {
    id: 'USR_1187',
    name: 'Rohan Mehta',
    handle: 'r.mehta',
    trustScore: 88,
    segment: 'STANDARD',
    since: '2020-09-02',
    riskLevel: 'MODERATE',
    trustState: 'NORMAL',
    normalLocations: ['Pune'],
    normalDevices: ['Windows', 'Android'],
    normalLoginHours: '09:00-23:00',
    typicalPayout: '₹1,000-₹15,000',
    knownPayees: 11,
    typicalSessionMin: 18,
    sessions30d: 112,
    enrollment: 96,
    fingerprint: 'BT-11D4-9C20-7BA3',
  },
  {
    id: 'USR_1302',
    name: 'Ishita Rao',
    handle: 'ishita.rao',
    trustScore: 94,
    segment: 'PRIORITY / HIGH VALUE',
    since: '2019-12-20',
    riskLevel: 'LOW',
    trustState: 'NORMAL',
    normalLocations: ['Hyderabad', 'Chennai'],
    normalDevices: ['iPhone', 'iPad'],
    normalLoginHours: '07:30-21:00',
    typicalPayout: '₹500-₹12,000',
    knownPayees: 9,
    typicalSessionMin: 9,
    sessions30d: 88,
    enrollment: 301,
    fingerprint: 'BT-3E88-1174-2F6B',
  },
  {
    id: 'USR_1440',
    name: 'Kabir Anand',
    handle: 'kabir.a',
    trustScore: 71,
    segment: 'STANDARD',
    since: '2023-06-18',
    riskLevel: 'MODERATE',
    trustState: 'RESTRICTED',
    normalLocations: ['Mumbai'],
    normalDevices: ['Android'],
    normalLoginHours: '10:00-22:00',
    typicalPayout: '₹1,000-₹6,000',
    knownPayees: 4,
    typicalSessionMin: 7,
    sessions30d: 41,
    enrollment: 33,
    fingerprint: 'BT-77C1-90D5-2A48',
  },
  {
    id: 'USR_1590',
    name: 'Ananya Bose',
    handle: 'ananya.b',
    trustScore: 99,
    segment: 'SOVEREIGN / ENTERPRISE',
    since: '2018-02-05',
    riskLevel: 'LOW',
    trustState: 'NORMAL',
    normalLocations: ['Kolkata'],
    normalDevices: ['Mac', 'Windows'],
    normalLoginHours: '08:00-20:00',
    typicalPayout: '₹10,000-₹90,000',
    knownPayees: 22,
    typicalSessionMin: 34,
    sessions30d: 156,
    enrollment: 512,
    fingerprint: 'BT-CC52-4E19-8B77',
  },
  {
    id: 'USR_1623',
    name: 'Vikram Iyer',
    handle: 'vikram.i',
    trustScore: 83,
    segment: 'STANDARD',
    since: '2022-01-30',
    riskLevel: 'MODERATE',
    trustState: 'NORMAL',
    normalLocations: ['Chennai'],
    normalDevices: ['Windows', 'Mac'],
    normalLoginHours: '09:30-23:30',
    typicalPayout: '₹2,000-₹20,000',
    knownPayees: 8,
    typicalSessionMin: 22,
    sessions30d: 63,
    enrollment: 141,
    fingerprint: 'BT-4A9E-C033-51D7',
  },
]

/* --------------------------------------------------- generated population */

const FIRST = [
  'Aarav', 'Diya', 'Vivaan', 'Anika', 'Reyansh', 'Ira', 'Arjun', 'Saanvi', 'Kabir', 'Meera',
  'Ishaan', 'Tara', 'Advait', 'Rhea', 'Yash', 'Nila', 'Dev', 'Kavya', 'Rohan', 'Pooja',
  'Nikhil', 'Sneha', 'Farhan', 'Aisha', 'Zoya', 'Ved', 'Ritika', 'Aman', 'Shreya', 'Harsh',
]
const LAST = [
  'Sharma', 'Verma', 'Nair', 'Iyer', 'Reddy', 'Rao', 'Kulkarni', 'Chatterjee', 'Banerjee', 'Menon',
  'Pillai', 'Ghosh', 'Malhotra', 'Kapoor', 'Joshi', 'Deshmukh', 'Bose', 'Chopra', 'Saxena', 'Trivedi',
]
const CITIES = [
  'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Kochi', 'Coimbatore', 'Indore', 'Bhubaneswar', 'Nagpur', 'Surat',
]
const DEVICES = ['Mac', 'Windows', 'iPhone', 'Android', 'iPad', 'Linux', 'ChromeOS']
const SEGMENTS = ['STANDARD', 'PRIORITY / HIGH VALUE', 'SOVEREIGN / ENTERPRISE', 'SME GROWTH', 'STUDENT']

/** Tiny deterministic PRNG so the population is identical on every render. */
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

function pad(n: number, len: number) {
  return String(n).padStart(len, '0')
}

const hex = (rnd: () => number, groups: number, len: number) =>
  Array.from({ length: groups }, () =>
    Array.from({ length: len }, () => '0123456789ABCDEF'[Math.floor(rnd() * 16)]).join(''),
  ).join('-')

const inr = (rnd: () => number, lo: number, hi: number, step: number) => {
  const v = (lo + Math.floor(rnd() * ((hi - lo) / step)) * step).toLocaleString('en-IN')
  return `₹${v}`
}

/**
 * Builds the remainder of the population. Index 0 is always USR_1701 so the
 * generated ids never collide with the hand-written cast above.
 */
function generateIdentities(count: number): Identity[] {
  const rnd = mulberry32(0x1d34)
  const out: Identity[] = []

  for (let i = 0; i < count; i++) {
    const seq = 1701 + i
    const first = FIRST[Math.floor(rnd() * FIRST.length)]
    const last = LAST[Math.floor(rnd() * LAST.length)]
    const city = CITIES[Math.floor(rnd() * CITIES.length)]
    const d1 = DEVICES[Math.floor(rnd() * DEVICES.length)]
    const d2 = DEVICES[Math.floor(rnd() * DEVICES.length)]
    const city2 = CITIES[Math.floor(rnd() * CITIES.length)]
    const segment = SEGMENTS[Math.floor(rnd() * SEGMENTS.length)]
    const trustScore = 52 + Math.floor(rnd() * 48)
    const open = String(7 + Math.floor(rnd() * 4)).padStart(2, '0')
    const close = String(19 + Math.floor(rnd() * 5)).padStart(2, '0')
    const year = 2017 + Math.floor(rnd() * 8)
    const month = 1 + Math.floor(rnd() * 12)
    const day = 1 + Math.floor(rnd() * 28)
    const lo = [500, 1000, 2000, 10000][Math.floor(rnd() * 4)]
    const hi = lo + [6000, 12000, 18000, 80000][Math.floor(rnd() * 4)]

    out.push({
      id: `USR_${seq}`,
      name: `${first} ${last}`,
      handle: `${first.toLowerCase()}.${last[0].toLowerCase()}${Math.floor(rnd() * 90) + 10}`,
      trustScore,
      segment,
      since: `${year}-${pad(month, 2)}-${pad(day, 2)}`,
      riskLevel: trustScore >= 88 ? 'LOW' : trustScore >= 70 ? 'MODERATE' : trustScore >= 58 ? 'HIGH' : 'CRITICAL',
      trustState: trustScore >= 70 ? 'NORMAL' : trustScore >= 55 ? 'RESTRICTED' : 'DECOY',
      normalLocations: city2 === city ? [city] : [city, city2],
      normalDevices: d1 === d2 ? [d1] : [d1, d2],
      normalLoginHours: `${open}:00-${close}:30`,
      typicalPayout: `${inr(rnd, lo, lo + 500, 500)}-${inr(rnd, hi, hi + 1000, 500)}`,
      knownPayees: 3 + Math.floor(rnd() * 26),
      typicalSessionMin: 4 + Math.floor(rnd() * 40),
      sessions30d: 18 + Math.floor(rnd() * 180),
      enrollment: 12 + Math.floor(rnd() * 540),
      fingerprint: `BT-${hex(rnd, 2, 4)}-${hex(rnd, 2, 4)}`,
    })
  }

  return out
}

export const IDENTITIES: Identity[] = [
  ...FEATURED_IDENTITIES,
  ...generateIdentities(POPULATION - FEATURED_IDENTITIES.length),
]

/** Derived from the real array so the UI can never report a phantom population. */
export const IDENTITY_COUNT = IDENTITIES.length

/** Lookup map — pages join on identity id constantly and the array is 1,284 long. */
export const IDENTITY_BY_ID = new Map(IDENTITIES.map((i) => [i.id, i]))

export const ACTIVE_IDENTITY_SAMPLE = 6

/** The identity used throughout the demonstration scenario. */
export const SUBJECT = FEATURED_IDENTITIES[0]

/** Behavioural drift matrix surfaced once the attack session diverges. */
export const DRIFT_MATRIX: DriftDimension[] = [
  { key: 'device', label: 'DEVICE', normal: 'MAC / IPHONE', current: 'WINDOWS / CHROME', drift: 18 },
  { key: 'location', label: 'LOCATION', normal: 'BANGALORE', current: 'DELHI, IN', drift: 14 },
  { key: 'time', label: 'TIME', normal: '08:00–22:30', current: '03:17', drift: 11 },
  { key: 'payment', label: 'PAYMENT', normal: '₹2K–₹8K', current: '₹4.8L', drift: 21 },
]

/** 24h normalised activity fingerprint for the subject identity. */
export const BASELINE_HOURLY = [
  1, 1, 1, 1, 2, 6, 18, 42, 71, 88, 79, 63, 58, 66, 74, 69, 57, 61, 72, 64, 41, 24, 12, 4,
]

/** The attack session contributes a spike at 03:00 — far outside the band. */
export const CURRENT_HOURLY = [0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

export const BEHAVIOR_DIMENSIONS = [
  { key: 'rhythm', label: 'SESSION RHYTHM', score: 92 },
  { key: 'location', label: 'GEO PATTERN', score: 88 },
  { key: 'device', label: 'DEVICE FINGERPRINT', score: 96 },
  { key: 'payment', label: 'PAYMENT SHAPE', score: 84 },
  { key: 'tempo', label: 'ACTION TEMPO', score: 79 },
  { key: 'navigation', label: 'NAVIGATION PATH', score: 91 },
]