import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Panel, SubFrame } from '@/components/ui/Panel'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { Badge, KeyValue, SectionLabel, StatusPip } from '@/components/ui/indicators'
import { EmptyState } from '@/components/ui/ThreatAlert'
import { Caret } from '@/components/ui/TypeLine'
import { DriftBar, SegmentMeter } from '@/components/security/Gauges'
import { TrustProgressBar, TrustBadge } from '@/components/security/TrustLadder'
import { CanaryBanner } from '@/components/ui/CanaryAlert'
import { Modal } from '@/components/ui/Modal'
import { useCountUp } from '@/lib/hooks'
import { useNavigate } from '@/lib/router'
import { useSim } from '@/sim/SimulationProvider'
import { TONES, cut, type Tone } from '@/components/ui/tokens.tsx'
import {
  ATTACK_SESSION_ID,
  DRIFT_MATRIX,
  IDENTITY_BY_ID,
  ALL_SESSIONS,
  type Session,
  type SessionKind,
} from '@/data'

/* ------------------------------------------------------------------ config */

type Filter = 'ALL' | SessionKind

const STAGE_LABEL: Record<number, string> = {
  1: 'STAGE 01 · ATTACKER LOGIN ACCEPTED',
  2: 'STAGE 02 · BEHAVIORAL DRIFT MEASURED',
  3: 'STAGE 03 · RISK CROSSED POLICY THRESHOLD',
  4: 'STAGE 04 · NEW PAYEE CREATED',
  5: 'STAGE 05 · PAYOUT HELD FOR REVIEW',
  6: 'STAGE 06 · TRUST RESTRICTED',
  7: 'STAGE 07 · DECOY ENVIRONMENT ACTIVE',
  8: 'STAGE 08 · SENSITIVE SCOPE PROBED',
  9: 'STAGE 09 · CANARY TRIGGERED — SESSION SEALED',
  10: 'STAGE 10 · SIGNATURE DEPLOYED',
}

const FILTERS: { key: Filter; label: string; tone: Tone }[] = [
  { key: 'ALL', label: 'ALL', tone: 'bone' },
  { key: 'LEGIT', label: 'LEGITIMATE', tone: 'ok' },
  { key: 'DRIFT', label: 'BEHAVIORAL DRIFT', tone: 'warn' },
  { key: 'DECOY', label: 'DECOY', tone: 'blue' },
  { key: 'ATTACK', label: 'ATTACKER', tone: 'crit' },
  { key: 'ISOLATED', label: 'ISOLATED', tone: 'crit' },
]

const KIND_TONE: Record<SessionKind, Tone> = {
  LEGIT: 'ok',
  DRIFT: 'warn',
  DECOY: 'blue',
  ATTACK: 'crit',
  ISOLATED: 'crit',
}

const RISK_TONE = (risk: number): Tone => (risk >= 75 ? 'crit' : risk >= 40 ? 'warn' : risk >= 15 ? 'soft' : 'ok')

const ROW = 'grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_54px_92px] items-center gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.75fr)_minmax(0,1fr)_62px_92px_52px_104px]'

const identityOf = (s: Session) => IDENTITY_BY_ID.get(s.identityId)

/**
 * Divergence climbs as the scenario advances — device first, then place + time,
 * then money, then the decoy/isolation tail where the twin stops matching the
 * session entirely.
 */
const DRIFT_BY_STAGE: Record<number, number> = {
  1: 18, // device fingerprint alone
  2: 43, // device + location + time
  3: 55, // twin match below threshold
  4: 64, // new payee added
  5: 78, // payout far outside ceiling
  6: 84, // admin scope probe
  7: 90, // bulk export intent
}

function liveDrift(session: Session, stage: number) {
  if (session.id !== ATTACK_SESSION_ID || stage === 0) return session.id === ATTACK_SESSION_ID ? 0 : session.drift
  return DRIFT_BY_STAGE[stage] ?? 100
}

function driftSteps(session: Session) {
  const identity = identityOf(session)
  const isAttack = session.id === ATTACK_SESSION_ID
  const dims = isAttack
    ? DRIFT_MATRIX
    : ([
        { key: 'device', label: 'DEVICE', normal: (identity?.normalDevices ?? ['—']).join(' / '), current: session.device, drift: Math.round(session.drift * 0.34) },
        { key: 'location', label: 'LOCATION', normal: (identity?.normalLocations ?? ['—']).join(' · '), current: session.location, drift: Math.round(session.drift * 0.24) },
        { key: 'time', label: 'TIME', normal: identity?.normalLoginHours ?? '—', current: session.start, drift: Math.round(session.drift * 0.16) },
        { key: 'payment', label: 'PAYMENT', normal: identity?.typicalPayout ?? '—', current: 'WITHIN BASELINE', drift: Math.round(session.drift * 0.26) },
      ] as typeof DRIFT_MATRIX)
  return dims
}

/* -------------------------------------------------------------- live state */

function useLiveSessionState() {
  const sim = useSim()
  return useMemo(() => {
    const stage = sim.stage
    return (s: Session) => {
      if (s.id !== ATTACK_SESSION_ID) {
        return { ...s, risk: s.risk, drift: s.drift, kind: s.kind, trustState: s.trustState, live: false }
      }
      if (stage === 0) {
        return { ...s, risk: 0, drift: 0, kind: 'ATTACK' as SessionKind, trustState: 'NORMAL' as const, live: false }
      }
      return {
        ...s,
        risk: sim.riskScore,
        drift: liveDrift(s, stage),
        kind: (sim.isolated ? 'ISOLATED' : sim.deceptionActive ? 'DECOY' : 'ATTACK') as SessionKind,
        trustState: sim.trustState,
        live: true,
      }
    }
  }, [sim])
}

/* ------------------------------------------------------------------ header */

function SessionStat({ label, value, tone, note }: { label: string; value: number; tone: Tone; note: string }) {
  const n = useCountUp(value, 900)
  const t = TONES[tone]
  return (
    <SubFrame tone={tone} cutSize="sm">
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <StatusPip tone={tone} size={5} pulse={false} />
          <span className="font-pixel-xs text-muted">{label}</span>
        </div>
        <div
          className="mt-2 font-pixel-md leading-none tnum"
          style={{ color: t.text, textShadow: `0 0 14px rgba(${t.rgb},0.45)` }}
        >
          {String(Math.round(n)).padStart(2, '0')}
        </div>
        <div className="mt-1.5 font-mono text-[9px] tracking-[0.12em] text-[#4a4a4a]">{note}</div>
      </div>
    </SubFrame>
  )
}

/* -------------------------------------------------------------- filter bar */

function FilterBar({
  active,
  counts,
  onPick,
  query,
  onQuery,
}: {
  active: Filter
  counts: Record<Filter, number>
  onPick: (f: Filter) => void
  query: string
  onQuery: (q: string) => void
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-[#1a1a1a] px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between">
      <div className="no-scrollbar flex gap-1 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => {
          const on = active === f.key
          const t = TONES[f.tone]
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onPick(f.key)}
              className="group relative flex shrink-0 cursor-pointer items-center gap-1.5 px-2 py-[6px] font-pixel-xs"
              style={{
                ...cut('sm'),
                background: on ? t.bar : '#0b0b0b',
                color: on ? '#050505' : t.text,
                boxShadow: `inset 0 0 0 1px ${on ? t.bar : `rgba(${t.rgb},0.45)`}`,
                transition: 'background 120ms linear',
              }}
              aria-pressed={on}
            >
              <span>{f.label}</span>
              <span className="font-mono text-[9px] tnum" style={{ color: on ? 'rgba(5,5,5,0.7)' : '#666' }}>
                {String(counts[f.key]).padStart(2, '0')}
              </span>
            </button>
          )
        })}
      </div>

      <label className="flex shrink-0 items-center gap-2 lg:w-[290px]">
        <span className="font-mono text-[11px] text-soft" aria-hidden>
          &gt;
        </span>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value.toUpperCase())}
          placeholder="FILTER SESSION / IDENTITY / CITY"
          className="w-full bg-transparent py-[6px] font-mono text-[10px] tracking-[0.1em] text-bone placeholder:text-[#333] focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQuery('')}
            className="cursor-pointer font-mono text-[10px] text-muted hover:text-bone"
            aria-label="Clear filter"
          >
            ✕
          </button>
        ) : (
          <span className="blink h-[10px] w-[6px] bg-soft" aria-hidden />
        )}
      </label>
    </div>
  )
}

/* ------------------------------------------------------------------- table */

function SessionRow({
  session,
  index,
  onOpen,
  selected,
}: {
  session: Session & { live?: boolean }
  index: number
  onOpen: () => void
  selected: boolean
}) {
  const kindTone = KIND_TONE[session.kind]
  const riskTone = RISK_TONE(session.risk)
  const alert = session.kind === 'ISOLATED' || session.kind === 'ATTACK'

  /* the status cell reports what is happening to the session right now, not
     just which trust rung it sits on */
  const statusTone: Tone =
    session.kind === 'ISOLATED' ? 'ok' : session.kind === 'DECOY' ? 'blue' : session.kind === 'ATTACK' ? 'crit' : 'ok'
  const statusLabel =
    session.kind === 'ISOLATED'
      ? 'CONTAINED'
      : session.kind === 'DECOY'
        ? 'IN HONEY ENV'
        : session.kind === 'ATTACK'
          ? session.live
            ? 'ATTACK IN PROGRESS'
            : 'COMPROMISED'
          : session.live
            ? 'ACTIVE'
            : 'COMPLETE'

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.025, 0.3) }}
      className="group relative block w-full cursor-pointer text-left"
      style={{ background: selected ? 'rgba(36,75,255,0.1)' : alert ? 'rgba(255,51,68,0.035)' : 'transparent' }}
      aria-label={`Inspect session ${session.id}`}
    >
      <span className="absolute inset-y-0 left-0 w-[2px]" style={{ background: alert ? '#ff3344' : 'transparent' }} aria-hidden />
      {session.live && (
        <span
          className="absolute inset-y-0 left-0 w-[2px]"
          style={{ background: '#5b72ff', boxShadow: '0 0 12px rgba(91,114,255,0.9)' }}
          aria-hidden
        />
      )}

      <div className={`${ROW} px-3 py-[9px]`}>
        {/* session */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-mono text-[11px] text-bone">{session.id}</span>
            {session.live && (
              <span className="blink shrink-0 font-pixel-xs" style={{ color: '#5b72ff' }}>
                LIVE
              </span>
            )}
            <span
              className="hidden shrink-0 px-[5px] py-[2px] font-pixel-xs md:inline"
              style={{
                ...cut('sm'),
                background: TONES[kindTone].bg,
                color: TONES[kindTone].text,
                boxShadow: `inset 0 0 0 1px rgba(${TONES[kindTone].rgb},0.45)`,
              }}
            >
              {session.kind}
            </span>
          </div>
          <div className="mt-1 truncate font-mono text-[9px] tracking-[0.1em] text-[#4a4a4a]">
            IP {session.ip}
          </div>
        </div>

        {/* identity */}
        <div className="min-w-0">
          <div className="truncate font-mono text-[10px] tracking-[0.1em] text-ash">{session.identityName}</div>
          <div className="mt-1 truncate font-mono text-[9px] tracking-[0.1em] text-[#4a4a4a]">{session.identityId}</div>
        </div>

        {/* location */}
        <div className="min-w-0">
          <div className="truncate font-mono text-[10px] tracking-[0.06em] text-ash lg:text-[10px]">
            {session.location}
          </div>
          <div className="mt-1 truncate font-mono text-[9px] tracking-[0.06em] text-[#4a4a4a]">
            BASELINE {identityOf(session)?.normalLocations?.[0] ?? '—'}
          </div>
        </div>

        {/* device */}
        <div className="hidden min-w-0 lg:block">
          <div className="truncate font-mono text-[10px] tracking-[0.06em] text-ash">{session.device}</div>
          <div className="mt-1 truncate font-mono text-[9px] tracking-[0.06em] text-[#4a4a4a]">{session.browser}</div>
        </div>

        {/* start */}
        <div className="hidden lg:block">
          <div className="font-mono text-[10px] tnum text-bone">{session.start}</div>
          <div className="mt-1 font-mono text-[9px] tnum text-[#4a4a4a]">{session.durationMin}M</div>
        </div>

        {/* drift */}
        <div className="hidden lg:block">
          <DriftBar value={session.drift} max={70} delay={index * 0.02} />
          <div className="mt-1 font-mono text-[9px] tnum text-[#4a4a4a]">Δ{session.drift}</div>
        </div>

        {/* risk */}
        <div className="text-right">
          <span
            className="font-mono text-[12px] tnum"
            style={{ color: TONES[riskTone].text, textShadow: alert ? `0 0 10px ${TONES[riskTone].bar}90` : 'none' }}
          >
            {String(session.risk).padStart(2, '0')}
          </span>
        </div>

        {/* status — trust state plus the live/contained marker */}
        <div className="min-w-0">
          <TrustBadge state={session.trustState} />
          <div
            className="mt-1 truncate font-mono text-[9px] tracking-[0.14em]"
            style={{ color: statusTone === 'ok' ? '#35ff72' : statusTone === 'crit' ? '#ff3344' : '#5b72ff' }}
          >
            {statusLabel}
          </div>
        </div>
      </div>

      <span className="absolute inset-x-0 bottom-0 h-px bg-[#141414]" aria-hidden />
      <span
        className="pointer-events-none absolute inset-y-0 right-0 w-[26px] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(91,114,255,0.14))' }}
        aria-hidden
      />
    </motion.button>
  )
}

/* ----------------------------------------------------------------- drawer */

function SessionDrawer({ session, onClose }: { session: Session | null; onClose: () => void }) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const dims = session ? driftSteps(session) : []

  return (
    <Modal open={!!session} onClose={onClose} width="max-w-[640px]">
      {session && (
        <div className="relative" style={{ ...cut('lg'), background: TONES[KIND_TONE[session.kind]].border, padding: 2 }}>
          <div className="relative" style={{ ...cut('lg'), background: '#0b0b0b' }}>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1c1c] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <StatusPip tone={KIND_TONE[session.kind]} />
                <div className="min-w-0">
                  <div className="font-pixel-xs text-bone">SESSION {session.id}</div>
                  <div className="mt-1 font-mono text-[9px] tracking-[0.14em] text-[#4a4a4a]">
                    {session.identityName} · {session.identityId} · OPENED {session.start}
                  </div>
                </div>
              </div>
              <TrustBadge state={session.trustState} />
            </header>

            <div className="max-h-[62vh] overflow-y-auto px-4 py-4">
              <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                <KeyValue k="DEVICE" v={session.device} tone="ash" />
                <KeyValue k="BROWSER" v={session.browser} tone="ash" />
                <KeyValue k="LOCATION" v={session.location} tone="ash" />
                <KeyValue k="SOURCE IP" v={session.ip} tone="ash" />
                <KeyValue k="DURATION" v={`${session.durationMin} MIN`} tone="ash" />
                <KeyValue k="ACTIONS" v={session.actions} tone="ash" />
                <KeyValue k="SESSION TOKEN" v={session.token} tone="soft" />
                <KeyValue k="DEVICE FP" v={session.id === ATTACK_SESSION_ID ? '91C4-A7D2-0031' : identityOf(session)?.fingerprint ?? '—'} tone="soft" />
              </div>

              <SectionLabel className="mt-5">RISK SCORE</SectionLabel>
              <div className="mt-3">
                <SegmentMeter value={session.risk} segments={32} tone={RISK_TONE(session.risk)} height={16} marks={[0, 25, 50, 75, 100]} />
              </div>

              <SectionLabel className="mt-5">BEHAVIORAL DIVERGENCE</SectionLabel>
              <ul className="mt-2 space-y-2">
                {dims.map((d, i) => (
                  <li key={d.key}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-pixel-xs text-muted">{d.label}</span>
                      <span className="font-mono text-[9px] tnum text-[#4a4a4a]">Δ{d.drift}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] text-muted">{d.normal}</span>
                      <span className="font-mono text-[10px] text-crit">→</span>
                      <span className="font-mono text-[10px] text-bone">{d.current}</span>
                    </div>
                    <div className="mt-1.5">
                      <DriftBar value={d.drift} max={25} delay={i * 0.06} />
                    </div>
                  </li>
                ))}
              </ul>

              <SectionLabel className="mt-5">TRUST STATE</SectionLabel>
              <div className="mt-3">
                <TrustProgressBar current={session.trustState} />
              </div>
            </div>

            <footer className="flex flex-wrap items-center gap-2 border-t border-[#1c1c1c] px-4 py-3">
              {session.id === ATTACK_SESSION_ID && (
                <TerminalButton label="ATTACKTRACE" tone="crit" size="sm" onClick={() => navigate('/attacktrace')} />
              )}
              <TerminalButton
                label={copied ? 'COPIED ✓' : 'COPY SESSION ID'}
                tone="blue"
                size="sm"
                onClick={() => {
                  void navigator.clipboard?.writeText(session.id)
                  setCopied(true)
                  window.setTimeout(() => setCopied(false), 1600)
                }}
              />
              <TerminalButton label="CLOSE" tone="neutral" size="sm" onClick={onClose} />
              <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] tracking-[0.16em] text-[#4a4a4a]">
                SIMULATION ENVIRONMENT · SYNTHETIC DATA
              </span>
            </footer>
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ------------------------------------------------------------------- page */

export function Sessions() {
  const sim = useSim()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('ALL')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const live = useLiveSessionState()

  const all = useMemo(
    () =>
      ALL_SESSIONS.map((s) => live(s)).sort((a, b) => {
        if (a.live !== b.live) return a.live ? -1 : 1
        return b.risk - a.risk
      }),
    [live],
  )

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { ALL: all.length, LEGIT: 0, DRIFT: 0, DECOY: 0, ATTACK: 0, ISOLATED: 0 }
    all.forEach((s) => {
      c[s.kind] += 1
    })
    return c
  }, [all])

  const rows = useMemo(() => {
    const q = query.trim()
    return all.filter((s) => {
      if (filter !== 'ALL' && s.kind !== filter) return false
      if (!q) return true
      return (
        s.id.includes(q) ||
        s.identityName.includes(q) ||
        s.identityId.includes(q) ||
        s.location.includes(q) ||
        s.device.includes(q) ||
        s.ip.includes(q)
      )
    })
  }, [all, filter, query])

  const selected = rows.find((s) => s.id === openId) ?? null
  const attack = all.find((s) => s.id === ATTACK_SESSION_ID)!

  return (
    <div className="space-y-4">
      <CanaryBanner />

      {/* headline */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusPip tone={sim.isolated ? 'ok' : sim.stage ? 'crit' : 'ok'} />
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted">
              {sim.isolated ? 'CONTAINED · SESSION TERMINATED' : sim.stage ? 'MONITORING ACTIVE ATTACK SESSION' : 'SESSION TELEMETRY STREAMING'}
            </span>
          </div>
          <h2 className="mt-2 font-pixel-sm text-bone terminal-glow">LIVE SESSION TELEMETRY</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TerminalButton label="IDENTITY TWIN" tone="blue" size="sm" onClick={() => navigate('/identity')} />
          <TerminalButton
            label={sim.stage ? 'RESET SESSION STATE' : 'SIMULATE ATTACK'}
            tone={sim.stage ? 'neutral' : 'blue'}
            size="sm"
            active={!sim.stage}
            onClick={() => (sim.stage ? sim.reset() : sim.start())}
          />
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <SessionStat label="TRACKED" value={all.length} tone="bone" note="SYNTHETIC" />
        <SessionStat label="NORMAL" value={counts.LEGIT} tone="ok" note="BASELINE MATCH" />
        <SessionStat label="DRIFT" value={counts.DRIFT} tone="warn" note="REVIEW" />
        <SessionStat label="DECOY" value={counts.DECOY + (sim.deceptionActive && !sim.isolated ? 1 : 0)} tone="blue" note="HONEY ENV" />
        <SessionStat label="ATTACKER" value={counts.ATTACK} tone="crit" note="S-84729" />
        <SessionStat label="ISOLATED" value={counts.ISOLATED} tone="crit" note="TOKENS REVOKED" />
      </div>

      {/* live attack strip */}
      {sim.stage > 0 && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Panel title="ACTIVE ATTACK SESSION" cutSize="md" tone={sim.isolated ? 'ok' : 'crit'} weight={2}>
            <div className="grid gap-px bg-[#1a1a1a] sm:grid-cols-4">
              {[
                ['SESSION', ATTACK_SESSION_ID, 'bone'],
                ['BEHAVIORAL RISK', `${attack.risk}/100`, 'crit'],
                ['DIVERGENCE', `Δ${attack.drift}`, 'warn'],
                ['TRUST STATE', attack.trustState, 'soft'],
              ].map(([k, v, tone]) => (
                <div key={k} className="bg-[#0b0b0b] px-3 py-2.5">
                  <div className="font-pixel-xs text-muted">{k}</div>
                  <div
                    className="mt-2 font-mono text-[13px] tnum"
                    style={{ color: TONES[tone as Tone].text, textShadow: `0 0 12px rgba(${TONES[tone as Tone].rgb},0.45)` }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-[#1a1a1a] px-3 py-2.5">
              <span className="font-mono text-[10px] tracking-[0.1em] text-muted">
                {sim.isolated ? 'TOKENS REVOKED · PAYOUT CANCELLED · EVIDENCE SEALED' : `${STAGE_LABEL[sim.stage] ?? 'SESSION UNDER OBSERVATION'}`}
              </span>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <TerminalButton label="INSPECT" tone="blue" size="xs" onClick={() => setOpenId(ATTACK_SESSION_ID)} />
                <TerminalButton label="OPEN INCIDENT" tone="warn" size="xs" onClick={() => navigate('/incidents')} />
              </div>
            </div>
          </Panel>
        </motion.div>
      )}

      {/* table */}
      <Panel
        title="SESSION REGISTER"
        cutSize="md"
        tone="neutral"
        right={
          <>
            <Badge tone={rows.length === all.length ? 'neutral' : 'blue'}>
              {rows.length}/{all.length} SHOWN
            </Badge>
            <span className="hidden items-center gap-1.5 font-mono text-[9px] tracking-[0.16em] text-[#4a4a4a] md:flex">
              <Caret tone="soft" /> LIVE
            </span>
          </>
        }
      >
        <FilterBar active={filter} counts={counts} onPick={setFilter} query={query} onQuery={setQuery} />

        <div className={`${ROW} border-b border-[#1a1a1a] bg-[#0d0d0d] px-3 py-[7px]`}>
          {['SESSION', 'IDENTITY', 'LOCATION', 'DEVICE', 'START', 'DIVERGENCE', 'RISK', 'STATUS'].map((h, i) => (
            <span
              key={h}
              className={`font-pixel-xs text-muted ${i >= 3 && i <= 5 ? 'hidden lg:block' : ''} ${
                i === 6 ? 'text-right' : ''
              }`}
            >
              {h}
            </span>
          ))}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            title="NO SESSIONS MATCH"
            status="FILTER EMPTY"
            tone="warn"
            body="The register returned no rows for this filter combination. Clear the query or switch back to ALL."
            action={
              <TerminalButton
                label="RESET FILTERS"
                tone="warn"
                size="sm"
                onClick={() => {
                  setFilter('ALL')
                  setQuery('')
                }}
              />
            }
          />
        ) : (
          <div className="max-h-[520px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {rows.map((s, i) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  index={i}
                  selected={s.id === openId}
                  onOpen={() => setOpenId(s.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1a1a1a] px-3 py-[6px] font-mono text-[9px] tracking-[0.14em] text-[#4a4a4a]">
          <span>DRIFT BARS · MARKER AT BASELINE MEDIAN</span>
          <span className="flex items-center gap-2">
            <span className="text-ok">LOW</span>
            <span className="text-warn">MID</span>
            <span className="text-crit">HIGH</span>
          </span>
        </div>
      </Panel>

      <SessionDrawer session={selected} onClose={() => setOpenId(null)} />
    </div>
  )
}
