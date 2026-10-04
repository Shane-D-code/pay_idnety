import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Panel } from '@/components/ui/Panel'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { Badge, Bar, KeyValue, StatusPip } from '@/components/ui/indicators'
import { PixelGlyph } from '@/components/ui/PixelGlyph'
import { EmptyState } from '@/components/ui/ThreatAlert'
import { useSim } from '@/sim/SimulationProvider'
import { useNavigate } from '@/lib/router'
import { TONES, cut } from '@/components/ui/tokens.tsx'
import { inr } from '@/lib/format'

/* ------------------------------------------------------------------ decoy */

const TILES = [
  { k: 'AVAILABLE BALANCE', v: '₹8,42,100', sub: 'INR · SETTLEMENT T+1', tone: '#f5f5f5' },
  { k: 'PENDING PAYOUTS', v: '₹4,80,000', sub: '1 PAYOUT · AWAITING RELEASE', tone: '#ffd43b' },
  { k: 'CUSTOMER ACCOUNTS', v: '1,482', sub: 'ACTIVE · 27 NEW THIS MONTH', tone: '#f5f5f5' },
  { k: 'INVOICES', v: '27', sub: '₹3,12,400 OUTSTANDING', tone: '#f5f5f5' },
]

const PAYEES = [
  { n: 'SUNRISE LOGISTICS', v: '₹1,20,000', s: 'VERIFIED' },
  { n: 'NORTHWIND SUPPLIES', v: '₹64,000', s: 'VERIFIED' },
  { n: 'KIRANA STORES LLP', v: '₹32,400', s: 'VERIFIED' },
  { n: 'HOLLOWPOINT TRADING LLC', v: '₹4,80,000', s: 'UNVERIFIED' },
  { n: 'MEADOWS FREIGHT', v: '₹18,900', s: 'VERIFIED' },
]

const ACTIVITY = [
  { t: '03:19:52', k: 'CREDENTIAL VIEW', d: '/finance/api-credentials' },
  { t: '03:19:33', k: 'CUSTOMER EXPORT', d: 'limit=500 · synthetic' },
  { t: '03:18:51', k: 'PAYOUT CREATED', d: '₹4,80,000 · HOLLOWPOINT TRADING LLC' },
  { t: '03:18:22', k: 'PAYEE ADDED', d: 'HOLLOWPOINT TRADING LLC' },
  { t: '03:17:04', k: 'SESSION START', d: 'Delhi, IN · Windows' },
]

/** The attacker's world: deliberately a different application. */
function HoneyApp({ onCanary }: { onCanary: () => void }) {
  const [nav, setNav] = useState('PAYMENTS')
  const [paid, setPaid] = useState(false)
  const [reveal, setReveal] = useState(false)

  return (
    <div
      className="relative overflow-hidden"
      style={{ clipPath: 'polygon(0 12px, 6px 6px, 6px 0, calc(100% - 12px) 0, calc(100% - 6px) 6px, calc(100% - 6px) calc(100% - 12px), calc(100% - 12px) calc(100% - 6px), calc(100% - 12px) 100%, 12px 100%, 6px calc(100% - 6px), 6px calc(100% - 12px), 0 calc(100% - 12px))', background: '#2a3a8f', padding: 2 }}
    >
      <div
        className="relative"
        style={{
          clipPath: 'polygon(0 12px, 6px 6px, 6px 0, calc(100% - 12px) 0, calc(100% - 6px) 6px, calc(100% - 6px) calc(100% - 12px), calc(100% - 12px) calc(100% - 6px), calc(100% - 12px) 100%, 12px 100%, 6px calc(100% - 6px), 6px calc(100% - 12px), 0 calc(100% - 12px))',
          background: '#0c0d12',
        }}
      >
        {/* app chrome */}
        <header className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-[#1b1d26] bg-[#101118] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex" style={{ filter: 'drop-shadow(0 0 8px rgba(36,75,255,0.6))' }}>
              <PixelGlyph map="SHIELD_16" color="#5b72ff" px={1.5} animated={false} />
            </span>
            <span
              className="text-[20px] font-bold leading-none"
              style={{ fontFamily: "'Pixelify Sans', monospace", color: '#f5f5f5', letterSpacing: '0.06em' }}
            >
              PAYFLOW
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-1">
            {['PAYMENTS', 'BALANCES', 'PAYEES', 'CUSTOMERS', 'DEVELOPER', 'SETTINGS'].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNav(n)}
                className="cursor-pointer px-2.5 py-1 text-[12px] font-semibold tracking-wide transition-colors"
                style={{
                  fontFamily: "'Pixelify Sans', monospace",
                  color: nav === n ? '#050505' : '#8a8f9c',
                  background: nav === n ? '#5b72ff' : 'transparent',
                }}
              >
                {n}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden font-mono text-[10px] text-[#4d525f] sm:inline">SUPPORT · 24×7</span>
            <span
              className="flex h-7 w-7 items-center justify-center text-[11px] font-bold"
              style={{ background: '#244bff', color: '#fff', fontFamily: "'Pixelify Sans', monospace" }}
            >
              AJ
            </span>
          </div>
        </header>

        {/* account strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#171922] bg-[#0e0f14] px-4 py-2">
          <span className="text-[13px]" style={{ fontFamily: "'Pixelify Sans', monospace", color: '#c9ccd4' }}>
            Adwika Jaiswal <span style={{ color: '#5b6478' }}>· Business account</span>
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] text-[#5b6478]">
            <span className="h-[6px] w-[6px] rounded-full" style={{ background: '#35ff72' }} />
            ALL SYSTEMS OPERATIONAL
          </span>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="p-4">
            {/* tiles */}
            <div className="grid gap-3 sm:grid-cols-2">
              {TILES.map((t, i) => (
                <div
                  key={t.k}
                  className="relative border p-3"
                  style={{ borderColor: '#1e2130', background: '#111320' }}
                >
                  <div className="font-mono text-[9px] tracking-[0.2em] text-[#5b6478]">{t.k}</div>
                  <div
                    className="mt-2 text-[24px] font-bold leading-none tnum"
                    style={{ fontFamily: "'Pixelify Sans', monospace", color: t.tone }}
                  >
                    {t.v}
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] text-[#4d525f]">{t.sub}</div>
                  {i === 1 && (
                    <span
                      className="absolute right-2 top-2 px-1.5 py-[2px] font-mono text-[9px]"
                      style={{ background: 'rgba(255,212,59,0.14)', color: '#ffd43b' }}
                    >
                      82× NORMAL
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* payout composer — the honeypot action */}
            <div className="mt-4 border p-4" style={{ borderColor: '#1e2130', background: '#111320' }}>
              <div className="font-mono text-[9px] tracking-[0.2em] text-[#5b6478]">MAKE A PAYOUT</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="font-mono text-[10px] text-[#5b6478]">BENEFICIARY</span>
                  <select
                    defaultValue="hollow"
                    className="mt-1 w-full px-2 py-2 font-mono text-[11px]"
                    style={{ background: '#0b0d14', border: '1px solid #22263a', color: '#d5d8e0', outline: 'none' }}
                  >
                    <option value="hollow">HOLLOWPOINT TRADING LLC · NEW</option>
                    <option value="sunrise">SUNRISE LOGISTICS</option>
                    <option value="north">NORTHWIND SUPPLIES</option>
                  </select>
                </label>
                <label className="block">
                  <span className="font-mono text-[10px] text-[#5b6478]">AMOUNT (INR)</span>
                  <input
                    defaultValue="480000"
                    className="mt-1 w-full px-2 py-2 font-mono text-[11px] tnum"
                    style={{ background: '#0b0d14', border: '1px solid #22263a', color: '#d5d8e0', outline: 'none' }}
                  />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[10px] text-[#5b6478]">
                  AVAILABLE AFTER PAYOUT: <span className="tnum text-[#d5d8e0]">{inr(842100 - 480000)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPaid(true)}
                  className="cursor-pointer px-4 py-2 text-[13px] font-bold tracking-wide transition-opacity hover:opacity-90"
                  style={{ background: '#244bff', color: '#fff', fontFamily: "'Pixelify Sans', monospace" }}
                >
                  REVIEW PAYOUT
                </button>
              </div>

              <AnimatePresence>
                {paid && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="border px-3 py-3" style={{ borderColor: 'rgba(53,255,114,0.35)', background: 'rgba(53,255,114,0.07)' }}>
                      <div className="text-[14px] font-bold" style={{ fontFamily: "'Pixelify Sans', monospace", color: '#35ff72' }}>
                        PAYMENT INITIATED · REF DECOY-4417-AX
                      </div>
                      <p className="mt-1 font-mono text-[10px] leading-relaxed text-[#8a8f9c]">
                        Funds will be released from the business account within 24 hours. A confirmation has been sent
                        to your registered email.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* payees */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-[0.2em] text-[#5b6478]">RECENT PAYEES</span>
                <span className="font-mono text-[10px] text-[#4d525f]">6 TOTAL</span>
              </div>
              <div className="mt-2 border" style={{ borderColor: '#1e2130' }}>
                {PAYEES.map((p) => (
                  <div
                    key={p.n}
                    className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 last:border-b-0"
                    style={{ borderColor: '#161824', background: p.s === 'UNVERIFIED' ? 'rgba(255,212,59,0.05)' : 'transparent' }}
                  >
                    <span className="font-mono text-[11px] text-[#d5d8e0]">{p.n}</span>
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[11px] tnum text-[#8a8f9c]">{p.v}</span>
                      <span
                        className="px-1.5 py-[2px] font-mono text-[9px]"
                        style={{
                          background: p.s === 'VERIFIED' ? 'rgba(53,255,114,0.12)' : 'rgba(255,212,59,0.14)',
                          color: p.s === 'VERIFIED' ? '#35ff72' : '#ffd43b',
                        }}
                      >
                        {p.s}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* right column: credentials + activity */}
          <aside className="border-t border-[#171922] p-4 lg:border-l lg:border-t-0">
            {/* canary credential card */}
            <div className="border" style={{ borderColor: '#22263a', background: '#0e1018' }}>
              <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: '#1c2030' }}>
                <span className="font-mono text-[9px] tracking-[0.2em] text-[#8a8f9c]">DEVELOPER CREDENTIALS</span>
                <span className="font-mono text-[9px]" style={{ color: '#ffd43b' }}>
                  {reveal ? 'DECOY' : '••••••••'}
                </span>
              </div>
              <div className="space-y-2 px-3 py-3">
                <div>
                  <div className="font-mono text-[9px] text-[#5b6478]">PAYPAL_CLIENT_ID</div>
                  <div className="font-mono text-[12px] text-[#d5d8e0]">AY9X-••••••••</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReveal(true)
                    onCanary()
                  }}
                  className="group block w-full cursor-pointer border px-3 py-2 text-left transition-colors hover:border-[#5b72ff]"
                  style={{ borderColor: reveal ? '#5b72ff' : '#22263a', background: reveal ? 'rgba(91,114,255,0.1)' : 'transparent' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-[#5b6478]">PAYPAL_SECRET</span>
                    <span className="font-mono text-[9px] text-[#4d525f]">SHOW</span>
                  </div>
                  <div className="mt-1 font-mono text-[12px]" style={{ color: reveal ? '#8fa0ff' : '#d5d8e0' }}>
                    {reveal ? 'sk_live-••••••••' : '••••••••••••'}
                  </div>
                  <div className="mt-1 font-mono text-[9px]" style={{ color: '#4d525f' }}>
                    {reveal ? 'SYNTHETIC · NO OPERATIONAL VALUE' : 'CLICK TO REVEAL'}
                  </div>
                </button>
                <div>
                  <div className="font-mono text-[9px] text-[#5b6478]">WEBHOOK_SECRET</div>
                  <div className="font-mono text-[12px] text-[#d5d8e0]">whsec_••••••••</div>
                </div>
              </div>
            </div>

            {/* activity */}
            <div className="mt-4">
              <div className="font-mono text-[9px] tracking-[0.2em] text-[#5b6478]">SESSION ACTIVITY</div>
              <ul className="mt-2 space-y-2">
                {ACTIVITY.map((a, i) => (
                  <li key={a.t} className="border-l pl-2" style={{ borderColor: i > 1 ? '#5b6478' : '#22263a' }}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-[10px] text-[#d5d8e0]">{a.k}</span>
                      <span className="font-mono text-[9px] tnum text-[#4d525f]">{a.t}</span>
                    </div>
                    <div className="font-mono text-[9px] text-[#5b6478]">{a.d}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 border px-3 py-2" style={{ borderColor: '#22263a' }}>
              <div className="font-mono text-[9px] tracking-[0.2em] text-[#5b6478]">SESSION</div>
              <KeyValue k="ID" v="S-84729" tone="soft" />
              <KeyValue k="REGION" v="DELHI, IN" />
              <KeyValue k="DEVICE" v="WINDOWS / CHROME" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- analyst */

function AnalystRail() {
  const sim = useSim()
  const actions = [
    { k: 'LOGIN REROUTED', at: '03:19:14', tone: 'blue' as const },
    { k: 'API CREDENTIALS SERVED', at: '03:19:29', tone: 'warn' as const },
    { k: 'CUSTOMER EXPORT ABSORBED', at: '03:19:33', tone: 'warn' as const },
    { k: 'HONEY PAYOUT ACCEPTED', at: '03:19:52', tone: 'warn' as const },
    { k: 'CANARY READ', at: '03:19:41', tone: 'crit' as const },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="DECOY CONFIGURATION" cutSize="md" tone="blue">
        <div className="px-3 py-2.5">
          <KeyValue k="ENVIRONMENT" v="PAYFLOW HONEY v4" tone="soft" />
          <KeyValue k="SESSION" v="S-84729" />
          <KeyValue k="ROUTED AT" v="03:19:14" />
          <KeyValue k="DATA SOURCE" v="SYNTHETIC GENERATOR" tone="warn" />
          <KeyValue k="REAL DATA SERVED" v="NONE" tone="ok" />
          <KeyValue k="CANARIES ARMED" v="3" tone="warn" />
        </div>
      </Panel>

      <Panel title="ATTACKER ACTIONS IN DECOY" cutSize="md" tone="warn">
        <ul className="px-3 py-2">
          {actions.map((a, i) => (
            <motion.li
              key={a.k}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-baseline justify-between gap-2 border-b border-[#141414] py-[5px] last:border-b-0"
            >
              <span className="flex items-center gap-2">
                <span className="h-[6px] w-[6px]" style={{ background: TONES[a.tone].bar }} aria-hidden />
                <span className="font-mono text-[10px] tracking-[0.1em] text-bone">{a.k}</span>
              </span>
              <span className="font-mono text-[9px] tnum text-muted">{a.at}</span>
            </motion.li>
          ))}
        </ul>
      </Panel>

      <Panel title="WHY IT WORKS" cutSize="md" tone="neutral">
        <div className="px-3 py-3">
          <p className="font-mono text-[10px] leading-relaxed text-ash">
            The attacker receives a complete, convincing product surface. Every number responds, every action appears
            to succeed. Meanwhile the analyst keeps a clean production boundary: the session never reaches a real
            record, and its behaviour becomes evidence.
          </p>
          <Bar value={sim.canaryTriggered ? 100 : 72} tone={sim.canaryTriggered ? 'crit' : 'blue'} height={4} segments={20} className="mt-3" />
          <div className="mt-1.5 flex justify-between font-mono text-[9px] text-[#4a4a4a]">
            <span>INTENT CONFIDENCE</span>
            <span className="tnum">{sim.canaryTriggered ? '98.7%' : '72.0%'}</span>
          </div>
        </div>
      </Panel>
    </div>
  )
}

export function Deception() {
  const sim = useSim()
  const navigate = useNavigate()

  if (!sim.decoyActive) {
    return (
      <div className="space-y-4">
        <Panel cutSize="lg" tone="blue" weight={2} brackets>
          <div className="px-5 py-6">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-warn">
              <StatusPip tone="warn" />
              DECEPTION LAYER · STANDBY
            </div>
            <h2 className="mt-2.5 font-pixel-sm text-bone terminal-glow">ADAPTIVE DECEPTION</h2>
            <p className="mt-3 max-w-[640px] font-mono text-[11px] leading-relaxed text-ash">
              IdentityTwin only opens the honey environment once a session is suspicious enough to be worth
              observing. Nothing is served to an attacker while the session still looks legitimate — that is what
              keeps the deception invisible.
            </p>
          </div>
        </Panel>

        <Panel cutSize="md" tone="blue">
          <EmptyState
            title="HONEY ENVIRONMENT OFFLINE"
            status="STANDBY"
            body="Arm the deception layer, or run the takeover scenario to reach stage 7 where session S-84729 is rerouted into the shadow environment."
            tone="warn"
            action={
              <div className="flex flex-wrap items-center justify-center gap-2">
                <TerminalButton label="RUN SCENARIO" tone="blue" size="sm" active onClick={sim.start} />
                <TerminalButton
                  label="ARM DECOY LAYER"
                  tone="crit"
                  size="sm"
                  onClick={() => sim.goToStage(7)}
                />
              </div>
            }
          />
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* analyst header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusPip tone="ok" />
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted">
              SESSION DECOY ACTIVE · S-84729 REROUTED 03:19:14
            </span>
          </div>
          <h2 className="mt-2 font-pixel-sm text-bone terminal-glow">ADAPTIVE DECEPTION</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TerminalButton label="VIEW CANARY" tone="crit" size="sm" onClick={sim.openAlert} />
          <TerminalButton label="ATTACKTRACE" tone="blue" size="sm" onClick={() => navigate('/attacktrace')} />
          <TerminalButton label="RESET" tone="neutral" size="sm" onClick={sim.reset} />
        </div>
      </div>

      {/* disclosure strip — analyst chrome, deliberately outside the honey app */}
      <div
        className="relative overflow-hidden px-4 py-2.5"
        style={{
          ...cut('md'),
          background: '#7f6512',
          padding: 1,
        }}
      >
        <div
          className="relative flex flex-wrap items-center gap-x-5 gap-y-1.5 px-3 py-2"
          style={{ ...cut('md'), background: '#0d0a04' }}
        >
          <span
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #ffd43b 0 8px, transparent 8px 18px)' }}
            aria-hidden
          />
          <span className="relative font-pixel-xs text-warn">[ DECOY ENVIRONMENT ]</span>
          <span className="relative font-mono text-[10px] tracking-[0.16em] text-ash">SYNTHETIC DATA</span>
          <span className="relative font-mono text-[10px] tracking-[0.16em] text-crit">DO NOT DISPLAY REAL DATA</span>
          <span className="relative ml-auto font-mono text-[9px] tracking-[0.14em] text-[#6b5a20]">
            ANALYST OVERLAY · NOT PART OF THE HONEY APP
          </span>
        </div>
      </div>

      <HoneyApp onCanary={() => sim.openAlert()} />

      <AnalystRail />

      <Panel cutSize="md" tone={sim.canaryTriggered ? 'crit' : 'blue'} weight={sim.canaryTriggered ? 2 : 1}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <div className="font-pixel-xs" style={{ color: sim.canaryTriggered ? '#ff3344' : '#a8a8a8' }}>
              {sim.canaryTriggered ? 'CANARY PAYPAL_SECRET_0042 READ · SESSION ISOLATED' : 'CANARY ARMED · AWAITING ATTACKER READ'}
            </div>
            <div className="mt-1.5 font-mono text-[10px] text-muted">
              {sim.canaryTriggered
                ? 'MALICIOUS INTENT CONFIRMED AT 98.7% CONFIDENCE. TOKENS REVOKED, PAYOUT CANCELLED.'
                : 'CLICK THE PAYPAL_SECRET FIELD INSIDE THE HONEY APP TO TRIGGER THE CANARY.'}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {sim.canaryTriggered ? (
              <>
                <TerminalButton label="OPEN INCIDENT" tone="warn" size="sm" onClick={() => navigate('/incidents')} />
                <TerminalButton label="VACCINATION" tone="ok" size="sm" onClick={() => navigate('/vaccination')} />
              </>
            ) : (
              <>
                <TerminalButton label="TRIGGER CANARY" tone="crit" size="sm" onClick={sim.openAlert} />
                <TerminalButton label="SKIP TO ISOLATION" tone="blue" size="sm" onClick={sim.completeAttack} />
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 border-t border-[#1a1a1a] px-4 py-2">
          <Badge tone={sim.canaryTriggered ? 'crit' : 'ok'}>
            {sim.canaryTriggered ? 'INTENT IDENTIFIED' : 'OBSERVING'}
          </Badge>
          <Badge tone="neutral">CANARIES 3</Badge>
          <Badge tone="neutral">REAL RECORDS TOUCHED 0</Badge>
          <Badge tone="neutral">EVIDENCE SEALED {sim.canaryTriggered ? 'YES' : 'NO'}</Badge>
        </div>
      </Panel>
    </div>
  )
}