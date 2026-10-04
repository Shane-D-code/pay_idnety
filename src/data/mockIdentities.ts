/* ==========================================================================
   MOCK IDENTITIES — SYNTHETIC POPULATION
   Fabricated identities used to demonstrate behavioural baselines.
   ========================================================================== */

import type { DriftDimension, Identity } from './types'

export const IDENTITY_COUNT = 1284
export const ACTIVE_IDENTITY_SAMPLE = 6

export const IDENTITIES: Identity[] = [
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

/** The identity used throughout the demonstration scenario. */
export const SUBJECT = IDENTITIES[0]

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