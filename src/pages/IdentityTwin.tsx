import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Bar as RBar,
  BarChart,
  Cell,
  XAxis,
  YAxis,
} from 'recharts'
import { Panel } from '@/components/ui/Panel'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { Badge, Bar as ProgressBar, KeyValue, StatusPip } from '@/components/ui/indicators'
import { EmptyState } from '@/components/ui/ThreatAlert'
import { RadialGauge, DriftBar } from '@/components/security/Gauges'
import { IdentityGraph } from '@/components/security/IdentityGraph'
import { TrustBadge, TrustProgressBar } from '@/components/security/TrustLadder'
import { useSim } from '@/sim/SimulationProvider'
import { useNavigate } from '@/lib/router'
import { useCountUp } from '@/lib/hooks'
import {
  BEHAVIOR_DIMENSIONS,
  BASELINE_HOURLY,
  CURRENT_HOURLY,
  DRIFT_MATRIX,
  IDENTITIES,
  SUBJECT,
  type RiskLevel,
} from '@/data'

const LEVEL_TONE: Record<RiskLevel, 'ok' | 'blue' | 'warn' | 'crit'> = {
  LOW: 'ok',
  MODERATE: 'blue',
  HIGH: 'warn',
  CRITICAL: 'crit',
}

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}`)

const RADAR_DATA = BEHAVIOR_DIMENSIONS.map((d) => ({
  dim: d.label,
  baseline: d.score,
  current: 0,
}))

function BehaviourRadar({ current }: { current: number }) {
  const data = RADAR_DATA.map((d, i) => ({
    ...d,
    current: current > 0 ? Math.max(4, Math.round(d.baseline - [42, 36, 58, 71, 63, 54][i] * (current / 100))) : 0,
  }))

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%" margin={{ top: 6, right: 42, bottom: 6, left: 42 }}>
          <PolarGrid stroke="#232323" radialLines />
          <PolarAngleAxis
            dataKey="dim"
            tick={{ fill: '#666', fontSize: 7, fontFamily: "'Press Start 2P', monospace" }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="BASELINE"
            dataKey="baseline"
            stroke="#5b72ff"
            strokeWidth={1}
            fill="#244bff"
            fillOpacity={0.12}
            isAnimationActive
            animationDuration={900}
          />
          <Radar
            name="CURRENT"
            dataKey="current"
            stroke={current > 60 ? '#ff3344' : current > 0 ? '#ffd43b' : '#35ff72'}
            strokeWidth={1.4}
            fill={current > 60 ? '#ff3344' : current > 0 ? '#ffd43b' : '#35ff72'}
            fillOpacity={0.16}
            isAnimationActive
            animationDuration={900}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

function ActivityHistogram({ drifting }: { drifting: boolean }) {
  const data = HOURS.map((h, i) => ({ h, base: BASELINE_HOURLY[i], cur: drifting ? CURRENT_HOURLY[i] : 0 }))
  return (
    <div className="h-[150px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={1} margin={{ top: 4, right: 2, bottom: 0, left: -22 }}>
          <XAxis
            dataKey="h"
            tick={{ fill: '#3d3d3d', fontSize: 7, fontFamily: "'JetBrains Mono', monospace" }}
            interval={2}
            axisLine={{ stroke: '#232323' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#3d3d3d', fontSize: 7, fontFamily: "'JetBrains Mono', monospace" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <RBar dataKey="base" isAnimationActive animationDuration={700} radius={0}>
            {data.map((_, i) => (
              <Cell key={i} fill={i >= 8 && i <= 22 ? 'rgba(91,114,255,0.5)' : 'rgba(91,114,255,0.16)'} />
            ))}
          </RBar>
          <RBar dataKey="cur" isAnimationActive animationDuration={700} radius={0}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.cur ? '#ff3344' : 'transparent'} />
            ))}
          </RBar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function IdentityPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {IDENTITIES.map((i) => (
        <button
          key={i.id}
          type="button"
          onClick={() => onChange(i.id)}
          className="cursor-pointer px-2 py-[4px] font-pixel-xs transition-colors"
          style={{
            clipPath: 'polygon(0 4px, 4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)',
            background: value === i.id ? '#244bff' : '#0c0c0c',
            color: value === i.id ? '#050505' : '#6b6b6b',
            boxShadow: value === i.id ? 'none' : 'inset 0 0 0 1px #1f1f1f',
          }}
        >
          {i.name.split(' ')[0].toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export function IdentityTwin() {
  const sim = useSim()
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(SUBJECT.id)

  const identity = IDENTITIES.find((i) => i.id === selectedId) ?? SUBJECT
  const isSubject = identity.id === SUBJECT.id
  const drifting = isSubject && sim.driftDetected
  const trust = isSubject ? sim.trustScore : identity.trustScore
  const shownTrust = useCountUp(trust, 1300)

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusPip tone={drifting ? 'crit' : 'ok'} />
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted">
              {drifting ? 'SESSION DIVERGING FROM BASELINE' : 'SESSION ALIGNED WITH BASELINE'}
            </span>
          </div>
          <h2 className="mt-2 font-pixel-sm text-bone terminal-glow">
            IDENTITY TWIN <span className="text-soft">//</span> {identity.name.toUpperCase()}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TerminalButton label="RUN SCENARIO" tone="blue" size="sm" active={sim.stage === 0} onClick={sim.start} />
          <TerminalButton label="ATTACKTRACE" tone="blue" size="sm" onClick={() => navigate('/attacktrace')} />
        </div>
      </div>

      {/* identity hero */}
      <Panel cutSize="lg" tone={drifting ? 'crit' : 'blue'} weight={2} brackets>
        {/* the 220px gauge and 260px model rails need xl before the middle column
            is wide enough to hold the fact rows and the trust ladder */}
        <div className="grid gap-5 p-4 xl:grid-cols-[220px_minmax(0,1fr)_260px]">
          {/* trust gauge */}
          <div className="flex flex-col items-center justify-center gap-2 border-b border-[#1a1a1a] pb-4 xl:border-b-0 xl:border-r xl:pr-5">
            <RadialGauge
              value={shownTrust}
              size={180}
              tone={trust > 80 ? 'blue' : trust > 45 ? 'warn' : 'crit'}
              label="TRUST SCORE"
              suffix="/100"
            />
            <div className="flex items-center gap-2">
              <TrustBadge state={isSubject ? sim.trustState : identity.trustState} />
              <Badge tone={LEVEL_TONE[isSubject && sim.stage >= 7 ? 'CRITICAL' : identity.riskLevel]}>
                {isSubject && sim.stage >= 7 ? 'HIGH RISK' : identity.riskLevel}
              </Badge>
            </div>
          </div>

          {/* identity facts */}
          <div className="@container min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-pixel-sm text-bone">{identity.name.toUpperCase()}</h3>
              <span className="font-mono text-[10px] tracking-[0.18em] text-muted">{identity.id}</span>
            </div>
            <div className="mt-1 font-mono text-[10px] tracking-[0.16em] text-soft">{identity.segment}</div>

            {/* this column is squeezed by the 220px gauge and 260px model rails, so the
                split has to key off its own width, not the viewport's */}
            <div className="mt-4 grid gap-x-6 gap-y-0 @2xl:grid-cols-2">
              <div className="space-y-0">
                <KeyValue k="MEMBER SINCE" v={identity.since} />
                <KeyValue k="HANDLE" v={identity.handle} tone="soft" />
                <KeyValue k="FP FINGERPRINT" v={identity.fingerprint} tone="soft" />
                <KeyValue k="TWIN ENROLLMENTS" v={identity.enrollment} />
              </div>
              <div className="space-y-0">
                <KeyValue k="SESSIONS 30D" v={identity.sessions30d} />
                <KeyValue k="AVG SESSION" v={`${identity.typicalSessionMin} MIN`} />
                <KeyValue k="KNOWN PAYEES" v={identity.knownPayees} />
                <KeyValue
                  k="CURRENT SESSION"
                  v={isSubject ? 'S-84729 · ISOLATED' : 'S-84722 · ACTIVE'}
                  tone={isSubject && sim.stage >= 9 ? 'crit' : 'ok'}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="font-pixel-xs text-muted">TRUST COLLAPSE</span>
                <span className="h-px flex-1 bg-[#1e1e1e]" />
                <span className="font-mono text-[9px] tnum text-muted">{shownTrust}/100</span>
              </div>
              <ProgressBar
                value={shownTrust}
                tone={trust > 80 ? 'blue' : trust > 45 ? 'warn' : 'crit'}
                height={8}
                segments={30}
              />
              <div className="mt-2">
                <TrustProgressBar current={isSubject ? sim.trustState : identity.trustState} />
              </div>
            </div>
          </div>

          {/* identity picker + model info */}
          <div className="border-t border-[#1a1a1a] pt-4 xl:border-l xl:border-t-0 xl:pl-5">
            <div className="font-pixel-xs text-muted">TWIN MODEL</div>
            <ul className="mt-2 space-y-[2px]">
              {[
                ['ENROLLMENT DAYS', `${identity.enrollment}`],
                ['SIGNALS TRACKED', '28'],
                ['MODEL CONFIDENCE', isSubject && sim.stage >= 9 ? '12%' : '96.4%'],
                ['DRIFT THRESHOLD', '18 PTS'],
                ['LAST RECALIBRATED', '2H AGO'],
              ].map(([k, v]: string[]) => (
                <li key={k} className="flex items-baseline justify-between border-b border-[#141414] py-[4px]">
                  <span className="font-mono text-[9px] tracking-[0.14em] text-muted">{k}</span>
                  <span className="font-mono text-[10px] tnum text-bone">{v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <div className="mb-2 font-pixel-xs text-muted">SWITCH IDENTITY</div>
              <IdentityPicker value={selectedId} onChange={setSelectedId} />
            </div>
          </div>
        </div>
      </Panel>

      {/* baseline + drift */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="BEHAVIORAL BASELINE" cutSize="md" tone="blue" right={<Badge tone="ok">LEARNED</Badge>}>
          <div className="grid gap-px bg-[#1a1a1a] sm:grid-cols-2">
            {[
              { k: 'TYPICAL LOGIN', v: identity.normalLoginHours, icon: '01' },
              { k: 'TYPICAL DEVICES', v: identity.normalDevices.join(' / '), icon: '02' },
              { k: 'TYPICAL LOCATIONS', v: identity.normalLocations.join(' / '), icon: '03' },
              { k: 'TYPICAL PAYOUT', v: identity.typicalPayout, icon: '04' },
              { k: 'KNOWN PAYEES', v: String(identity.knownPayees), icon: '05' },
              { k: 'TYPICAL SESSION', v: `${identity.typicalSessionMin} MIN`, icon: '06' },
            ].map((b) => (
              <div key={b.k} className="group relative bg-[#0c0c0c] px-3 py-3 transition-colors hover:bg-[#101018]">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-pixel-xs text-muted">{b.k}</span>
                  <span className="font-mono text-[9px] text-[#2f2f2f]">{b.icon}</span>
                </div>
                <div className="mt-2 font-mono text-[12px] text-bone">{b.v}</div>
                <span
                  className="absolute bottom-0 left-0 h-[2px] w-0 bg-electric transition-all duration-300 group-hover:w-full"
                  aria-hidden
                />
              </div>
            ))}
          </div>
          <div className="px-3 py-2 font-mono text-[9px] leading-relaxed tracking-[0.1em] text-[#4a4a4a]">
            BASELINE BUILT FROM {identity.sessions30d} SESSIONS OVER {identity.enrollment} DAYS. SYNTHETIC PROFILE.
          </div>
        </Panel>

        <Panel
          title="BEHAVIORAL DRIFT ANALYSIS"
          cutSize="md"
          tone={drifting ? 'crit' : 'blue'}
          weight={drifting ? 2 : 1}
          right={
            drifting ? (
              <Badge tone="crit">DRIFT +64</Badge>
            ) : (
              <Badge tone="ok">WITHIN TOLERANCE</Badge>
            )
          }
        >
          {drifting ? (
            <div className="space-y-3 px-3 py-3">
              {DRIFT_MATRIX.map((d, i) => (
                <motion.div
                  key={d.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.09 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-pixel-xs text-ash">{d.label}</span>
                    <span
                      className="font-mono text-[11px] tnum"
                      style={{ color: d.drift > 18 ? '#ff3344' : d.drift > 12 ? '#ffd43b' : '#5b72ff' }}
                    >
                      DRIFT +{d.drift}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px]">
                    <span className="text-muted">
                      NORMAL: <span className="text-ash">{d.normal}</span>
                    </span>
                    <span className="text-[#3d3d3d]">→</span>
                    <span className="text-crit">CURRENT: {d.current}</span>
                  </div>
                  <div className="mt-1.5">
                    <DriftBar value={d.drift} delay={0.2 + i * 0.09} />
                  </div>
                </motion.div>
              ))}
              <div
                className="mt-2 flex items-center justify-between px-3 py-2"
                style={{ background: 'rgba(255,51,68,0.08)', boxShadow: 'inset 0 0 0 1px rgba(255,51,68,0.35)' }}
              >
                <span className="font-pixel-xs text-ash">TOTAL DRIFT</span>
                <span className="font-pixel-xs tnum text-crit">+64 / THRESHOLD 18</span>
              </div>
            </div>
          ) : (
            <EmptyState
              title="NO DIVERGENCE DETECTED"
              status="ALIGNED"
              body="This session matches the stored behavioural twin on device class, geography, activity window and payment shape."
              action={
                <TerminalButton label="SIMULATE ATTACK" tone="blue" size="sm" onClick={sim.start} active />
              }
            />
          )}
        </Panel>
      </div>

      {/* behaviour graph */}
      <Panel
        title="BEHAVIOR GRAPH // IDENTITY FINGERPRINT"
        cutSize="md"
        tone={drifting ? 'crit' : 'blue'}
        right={
          <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.14em]">
            <span className="flex items-center gap-1.5">
              <span className="h-[6px] w-[6px] bg-ok" /> BASELINE
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-[6px] w-[6px] bg-crit" /> ANOMALY
            </span>
          </div>
        }
      >
        <div className="grid gap-4 px-3 py-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="relative overflow-hidden" style={{ background: '#08080a' }}>
            <IdentityGraph anomalous={drifting} />
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="font-pixel-xs text-muted">BEHAVIOURAL PROFILE</span>
                <span className="h-px flex-1 bg-[#1e1e1e]" />
                <span className="font-mono text-[9px] text-[#3d3d3d]">BASELINE vs CURRENT</span>
              </div>
              <BehaviourRadar current={drifting ? (sim.stage >= 9 ? 100 : sim.riskTarget) : 0} />
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="font-pixel-xs text-muted">24H ACTIVITY FINGERPRINT</span>
                <span className="h-px flex-1 bg-[#1e1e1e]" />
                <span className="font-mono text-[9px] text-[#3d3d3d]">03:17 SPIKE</span>
              </div>
              <ActivityHistogram drifting={drifting} />
            </div>
          </div>
        </div>
      </Panel>

      {/* dimension scores */}
      <Panel title="TWIN DIMENSION SCORES" cutSize="md" tone="neutral">
        <div className="grid gap-px bg-[#1a1a1a] sm:grid-cols-2 lg:grid-cols-3">
          {BEHAVIOR_DIMENSIONS.map((d, i) => {
            const drop = drifting ? [44, 38, 61, 73, 66, 57][i] : 0
            const score = Math.max(4, d.score - drop)
            return (
              <div key={d.key} className="bg-[#0c0c0c] px-3 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-pixel-xs text-muted">{d.label}</span>
                  <span className="font-mono text-[10px] tnum text-bone">{score}</span>
                </div>
                <ProgressBar
                  value={score}
                  tone={score > 70 ? 'ok' : score > 40 ? 'warn' : 'crit'}
                  height={5}
                  delay={0.1 + i * 0.06}
                  className="mt-2"
                />
                <div className="mt-1.5 font-mono text-[9px] text-[#4a4a4a]">
                  {drop ? `BASELINE ${d.score} · Δ-${drop}` : `BASELINE ${d.score} · STABLE`}
                </div>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}