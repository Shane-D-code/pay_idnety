/* Shared synthetic-data types for the IdentityTwin demo environment. */

export type TrustState = 'NORMAL' | 'RESTRICTED' | 'DECOY' | 'ISOLATED'
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
export type SessionKind = 'LEGIT' | 'DRIFT' | 'ATTACK' | 'DECOY' | 'ISOLATED'
export type SignalTone = 'neutral' | 'info' | 'ok' | 'warn' | 'crit'

export interface Identity {
  id: string
  name: string
  handle: string
  trustScore: number
  segment: string
  since: string
  riskLevel: RiskLevel
  trustState: TrustState
  normalLocations: string[]
  normalDevices: string[]
  normalLoginHours: string
  typicalPayout: string
  knownPayees: number
  typicalSessionMin: number
  sessions30d: number
  enrollment: number
  fingerprint: string
}

export interface Session {
  id: string
  identityId: string
  identityName: string
  device: string
  browser: string
  location: string
  ip: string
  start: string
  durationMin: number
  risk: number
  kind: SessionKind
  trustState: TrustState
  actions: number
  drift: number
  token: string
}

export type EventStatus = 'NORMAL' | 'DRIFT DETECTED' | 'WARNING' | 'HIGH' | 'CRITICAL'

export interface SecurityEvent {
  id: string
  time: string
  kind: string
  subject: string
  status: EventStatus
  sessionId?: string
  meta?: string
}

export interface DriftDimension {
  key: string
  label: string
  normal: string
  current: string
  drift: number
}

export interface RiskContribution {
  label: string
  value: number
  detail: string
}

export interface TimelineEntry {
  time: string
  title: string
  detail: string
  tone: 'info' | 'warn' | 'crit'
}

export interface AttackTraceNode {
  id: string
  label: string
  kind: 'origin' | 'session' | 'account' | 'resource' | 'action' | 'terminal'
  detail: Record<string, string>
  tone: 'neutral' | 'warn' | 'crit'
}

export interface ThreatState {
  state: 'NORMAL' | 'OBSERVING' | 'SUSPICIOUS' | 'HIGH RISK' | 'CRITICAL' | 'ISOLATED'
  blurb: string
  level: number
}

export interface Incident {
  id: string
  sessionId: string
  identity: string
  risk: number
  status: string
  opened: string
  origin: string
  attackVector: string
  contained: boolean
  timeline: TimelineEntry[]
  report: string[]
  actions: string[]
  signals: string[]
}