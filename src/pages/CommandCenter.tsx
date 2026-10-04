import { motion } from 'framer-motion'
import { Panel } from '@/components/ui/Panel'
import { MetricTile } from '@/components/ui/MetricTile'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { CanaryBanner } from '@/components/ui/CanaryAlert'
import { EventStream } from '@/components/security/EventStream'
import { ThreatMonitorPanel } from '@/components/security/ThreatMonitor'
import { TrustLadder } from '@/components/security/TrustLadder'
import { RiskPanel } from '@/components/security/RiskPanel'
import { StatusPip, Badge } from '@/components/ui/indicators'
import { Caret } from '@/components/ui/TypeLine'
import { useSim } from '@/sim/SimulationProvider'
import { useNavigate } from '@/lib/router'
import { SYSTEM_STATUS_ROWS, TRUST_LADDER } from '@/data'
import { STAGES } from '@/sim/SimulationProvider'

const SPARK_ID = [38, 42, 40, 46, 51, 48, 55, 58, 61, 60, 66, 69, 72, 70, 76]
const SPARK_SESSIONS = [62, 58, 66, 71, 69, 74, 80, 77, 83, 86, 81, 88, 84, 87, 87]
const SPARK_THREATS = [1, 1, 2, 1, 3, 2, 2, 3, 3, 2, 3, 2, 3, 2, 3]
const SPARK_DECOY = [0, 0, 1, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2]

function EngineLog() {
  const sim = useSim()
  const rows = sim.log.length ? sim.log : [
    { id: 'a', time: '09:42:31', text: 'BEHAVIOR MODEL SYNC · 1,284 IDENTITIES', tone: 'info' as const },
    { id: 'b', time: '09:42:29', text: 'DECOY LAYER ARMED · 2 HONEY SESSIONS', tone: 'info' as const },
    { id: 'c', time: '09:42:22', text: 'PAYOUT FLAGGED · S-84718 · ₹4,80,000', tone: 'warn' as const },
    { id: 'd', time: '09:42:18', text: 'PAYEE CREATED OUTSIDE BASELINE · UNKNOWN', tone: 'warn' as const },
    { id: 'e', time: '09:42:09', text: 'DEVICE ENROLMENT REJECTED · FINGERPRINT', tone: 'crit' as const },
  ]

  return (
    <Panel title="ENGINE LOG" cutSize="md" tone="neutral" right={<StatusPip tone={sim.stage ? 'warn' : 'ok'} size={5} />}>
      <div className="px-3 py-2.5">
        <ul className="max-h-[186px] space-y-[2px] overflow-y-auto">
          {rows
            .slice(-40)
            .reverse()
            .map((r, i) => (
              <motion.li
                key={r.id + i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-baseline gap-2 font-mono text-[10px] leading-[1.55]"
              >
                <span className="shrink-0 tnum text-[#3d3d3d]">{r.time}</span>
                <span
                  className="shrink-0"
                  style={{ color: r.tone === 'crit' ? '#ff3344' : r.tone === 'warn' ? '#ffd43b' : '#666' }}
                  aria-hidden
                >
                  {r.tone === 'crit' ? '!' : r.tone === 'warn' ? '!' : '>'}
                </span>
                <span className="truncate text-ash">{r.text}</span>
              </motion.li>
            ))}
        </ul>
      </div>
      <div className="flex items-center justify-between border-t border-[#1a1a1a] px-3 py-[5px] font-mono text-[9px] tracking-[0.16em] text-[#3d3d3d]">
        <span>STDOUT · IT-ENGINE</span>
        <span className="flex items-center gap-1.5 text-ash">
          <Caret tone="soft" />
          STREAMING
        </span>
      </div>
    </Panel>
  )
}

function SystemPanel() {
  return (
    <Panel title="SYSTEM" cutSize="md" tone="neutral">
      <ul className="px-3 py-2">
        {SYSTEM_STATUS_ROWS.map((r) => (
          <li key={r.label} className="flex items-center justify-between border-b border-[#141414] py-[5px] last:border-b-0">
            <span className="font-mono text-[10px] tracking-[0.14em] text-muted">{r.label}</span>
            <span className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-ok">{r.value}</span>
              <StatusPip tone="ok" size={5} />
            </span>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-px border-t border-[#1a1a1a] bg-[#1a1a1a]">
        {[
          ['UPTIME', '41d 07h'],
          ['EVENTS/S', '1,284'],
          ['DECOYS', '04'],
          ['RULES', '2,048'],
        ].map(([k, v]: string[]) => (
          <div key={k} className="bg-[#0c0c0c] px-3 py-2">
            <div className="font-mono text-[9px] tracking-[0.16em] text-[#3d3d3d]">{k}</div>
            <div className="mt-1 font-mono text-[11px] tnum text-bone">{v}</div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function StageStrip() {
  const sim = useSim()
  return (
    <div className="flex flex-wrap items-center gap-1">
      {STAGES.map((s) => {
        const idx = sim.stage - s.n
        const state = idx > 0 ? 'done' : idx === 0 ? 'active' : 'idle'
        return (
          <span
            key={s.key}
            className="px-[6px] py-[3px] font-mono text-[9px] tracking-[0.1em]"
            style={{
              background:
                state === 'active' ? '#244bff' : state === 'done' ? 'rgba(36,75,255,0.16)' : '#101010',
              color: state === 'active' ? '#050505' : state === 'done' ? '#8fa0ff' : '#3d3d3d',
              boxShadow: state === 'idle' ? 'inset 0 0 0 1px #1c1c1c' : 'none',
            }}
          >
            {String(s.n).padStart(2, '0')} {s.title}
          </span>
        )
      })}
    </div>
  )
}

function AttackCta() {
  const sim = useSim()
  const navigate = useNavigate()

  return (
    <Panel
      title="ATTACK SIMULATION"
      cutSize="lg"
      tone={sim.stage ? 'crit' : 'blue'}
      weight={2}
      right={<Badge tone="warn">SYNTHETIC SCENARIO</Badge>}
      grid
    >
      <div className="relative px-4 py-4">
        {sim.stage === 0 ? (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-[11px] leading-relaxed text-ash">
                Drive the full ten-stage account-takeover scenario. Every page in IdentityTwin reacts to the same
                simulation state.
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.12em] text-muted">
                SCENARIO: STOLEN CREDENTIALS › NEW DEVICE › NEW PAYEE › ₹4,80,000 PAYOUT › CANARY
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <TerminalButton
                label="▶ SIMULATE ACCOUNT TAKEOVER"
                tone="blue"
                size="md"
                active
                onClick={() => sim.start()}
                className="glow-blue"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-pixel-xs text-crit">
                  {sim.stage >= 9 ? 'ATTACK CONTAINED' : `SIMULATION RUNNING · ${STAGES[sim.stage - 1].title}`}
                </span>
                <Badge tone={sim.stage >= 9 ? 'crit' : 'warn'}>STAGE {String(sim.stage).padStart(2, '0')}/10</Badge>
              </div>
              <p className="mt-2 font-mono text-[10px] tracking-[0.1em] text-muted">{STAGES[sim.stage - 1].sub}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {sim.stage < 7 && (
                <TerminalButton label="COMPLETE ATTACK" tone="crit" size="sm" onClick={sim.completeAttack} />
              )}
              <TerminalButton
                label="ENTER DECOY"
                tone="blue"
                size="sm"
                active={sim.decoyActive}
                onClick={() => navigate('/deception')}
              />
              <TerminalButton label="VIEW ATTACKTRACE" tone="blue" size="sm" onClick={() => navigate('/attacktrace')} />
              <TerminalButton label="RESET" tone="neutral" size="sm" onClick={sim.reset} />
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-[#1a1a1a] pt-3">
          <StageStrip />
        </div>
      </div>
    </Panel>
  )
}

export function CommandCenter() {
  const sim = useSim()
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <CanaryBanner />

      {/* headline row */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusPip tone={sim.stage ? 'crit' : 'ok'} />
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted">
              {sim.stage ? 'ACTIVE INCIDENT RESPONSE' : 'ALL SYSTEMS NOMINAL'}
            </span>
          </div>
          <h2 className="mt-2 font-pixel-sm text-bone terminal-glow">
            SECURITY COMMAND CENTER
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TerminalButton label="SIMULATE ATTACK" tone="blue" size="sm" active={sim.stage === 0} onClick={sim.start} />
          <TerminalButton label="IDENTITY TWIN" tone="blue" size="sm" onClick={() => navigate('/identity')} />
          <TerminalButton label="INCIDENTS" tone="blue" size="sm" onClick={() => navigate('/incidents')} />
        </div>
      </div>

      {/* metrics */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          index="01"
          label="IDENTITIES"
          value={sim.identities}
          format={(n) => Math.round(n).toLocaleString('en-IN')}
          delta="ENROLLED · +12 TODAY"
          tone="blue"
          spark={SPARK_ID}
        />
        <MetricTile
          index="02"
          label="ACTIVE SESSIONS"
          value={sim.activeSessions}
          delta="LIVE · 4 GEOGRAPHIES"
          tone="blue"
          spark={SPARK_SESSIONS}
        />
        <MetricTile
          index="03"
          label="ACTIVE THREATS"
          value={sim.activeThreats}
          format={(n) => String(Math.round(n)).padStart(2, '0')}
          delta={sim.stage >= 9 ? 'CONTAINED · 0 OPEN' : '2 DECOY · 1 ISOLATED'}
          tone="crit"
          alert={sim.stage > 0 && sim.stage < 9}
          spark={SPARK_THREATS}
        />
        <MetricTile
          index="04"
          label="DECOY SESSIONS"
          value={sim.decoySessions}
          format={(n) => String(Math.round(n)).padStart(2, '0')}
          delta="HONEY ENVIRONMENT ACTIVE"
          tone="warn"
          spark={SPARK_DECOY}
        />
      </div>

      {/* attack simulation CTA */}
      <AttackCta />

      {/* main grid */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <EventStream events={sim.events} height={430} />

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="PROGRESSIVE TRUST" cutSize="md" tone="blue" right={<Badge tone="neutral">LIVE</Badge>}>
              <div className="px-3 py-3">
                <TrustLadder current={sim.trustState} />
              </div>
              <div className="border-t border-[#1a1a1a] px-3 py-[6px] font-mono text-[9px] tracking-[0.14em] text-[#3d3d3d]">
                CURRENT PERMISSION ·{' '}
                <span className="text-ash">
                  {TRUST_LADDER.find((l) => l.state === sim.trustState)?.permission}
                </span>
              </div>
            </Panel>

            <RiskPanel compact />
          </div>
        </div>

        {/* right rail */}
        <div className="space-y-4">
          <ThreatMonitorPanel threatKey={sim.threat.state} />
          <EngineLog />
          <SystemPanel />

          <Panel title="QUICK ACTIONS" cutSize="md" tone="neutral">
            <div className="grid grid-cols-2 gap-2 p-3">
              <TerminalButton label="ATTACKTRACE" tone="blue" size="xs" block onClick={() => navigate('/attacktrace')} />
              <TerminalButton label="DECOY ENV" tone="blue" size="xs" block onClick={() => navigate('/deception')} />
              <TerminalButton label="IDENTITY" tone="blue" size="xs" block onClick={() => navigate('/identity')} />
              <TerminalButton label="SESSIONS" tone="blue" size="xs" block onClick={() => navigate('/sessions')} />
              <TerminalButton label="INCIDENT" tone="warn" size="xs" block onClick={() => navigate('/incidents')} />
              <TerminalButton label="VACCINATION" tone="ok" size="xs" block onClick={() => navigate('/vaccination')} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}