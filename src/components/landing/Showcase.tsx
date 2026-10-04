/* ==========================================================================
   LANDING SHOWCASE — the three platform pillars, the behavioral-twin pattern
   section, and the deception workspace the attacker walks into.
   ========================================================================== */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Reveal, SectionHead } from './kit'

/* ============================================================== pillars */

const TWIN_SIGNALS = ['DEVICE', 'LOCATION', 'RHYTHM', 'PAYOUT', 'SESSION', 'API']
const TWIN_BARS = [92, 74, 96, 61, 88, 79]

/** Pillar 1 — a behavioural fingerprint that re-measures on hover. */
function TwinVisual() {
  const [hover, setHover] = useState<number | null>(null)
  return (
    <div className="flex h-[132px] items-end gap-[7px]" onMouseLeave={() => setHover(null)}>
      {TWIN_BARS.map((b, i) => (
        <button
          key={TWIN_SIGNALS[i]}
          type="button"
          onMouseEnter={() => setHover(i)}
          onFocus={() => setHover(i)}
          className="group relative flex-1 cursor-pointer"
          style={{ height: '100%' }}
          aria-label={`${TWIN_SIGNALS[i]} fidelity ${b}%`}
        >
          <span className="absolute inset-x-0 bottom-0 flex items-end" style={{ height: '100%' }}>
            <motion.span
              className="w-full"
              style={{
                background: hover === i ? '#D5FF72' : 'rgba(184,255,61,0.45)',
                boxShadow: hover === i ? '0 0 16px rgba(184,255,61,0.8)' : 'none',
              }}
              initial={{ height: 0 }}
              whileInView={{ height: `${b}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          </span>
          <span
            className="absolute inset-x-0 -bottom-5 text-center font-mono text-[7.5px] uppercase tracking-[0.1em]"
            style={{ color: hover === i ? '#D5FF72' : '#555' }}
          >
            {TWIN_SIGNALS[i].slice(0, 4)}
          </span>
        </button>
      ))}
    </div>
  )
}

/** Pillar 2 — the request path being rerouted into a synthetic environment. */
function DeceptionVisual() {
  const [on, setOn] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setOn((o) => !o)}
      className="relative h-[132px] w-full cursor-pointer text-left"
      aria-label="Toggle deception routing preview"
    >
      {[
        { label: 'REAL RESOURCES', tone: '#3a3a3a', active: !on },
        { label: 'POLICY LAYER', tone: '#7f6512', active: !on },
        { label: 'DECOY ENVIRONMENT', tone: '#B8FF3D', active: on },
      ].map((r, i) => (
        <motion.div
          key={r.label}
          className="absolute flex items-center justify-between px-3"
          style={{
            left: `${i * 13}%`,
            width: `${100 - i * 26}%`,
            top: `${i * 38}px`,
            height: 54,
            border: `1px solid ${r.active ? r.tone : 'rgba(255,255,255,0.09)'}`,
            background: r.active ? `${r.tone}12` : 'rgba(255,255,255,0.015)',
            borderRadius: 4,
          }}
          animate={{ opacity: on && i < 2 ? 0.28 : 1 }}
          transition={{ duration: 0.45 }}
        >
          <span
            className="font-mono text-[8.5px] uppercase tracking-[0.2em]"
            style={{ color: r.active ? r.tone : '#5c5c5c' }}
          >
            {r.label}
          </span>
          <span className="font-mono text-[8.5px]" style={{ color: r.active ? r.tone : '#4a4a4a' }}>
            {i === 2 ? 'ACTIVE' : i === 1 ? (on ? 'BYPASSED' : 'ARMED') : 'BLOCKED'}
          </span>
        </motion.div>
      ))}
      <span className="absolute bottom-0 left-0 font-mono text-[8px] uppercase tracking-[0.2em] text-[#4e4e4e]">
        {on ? '● routing to synthetic' : '○ tap to reroute'}
      </span>
    </button>
  )
}

/** Pillar 3 — one signature propagating across the identity population. */
function VaccineVisual() {
  const [on, setOn] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setOn((o) => !o)}
      className="relative h-[132px] w-full cursor-pointer text-left"
      aria-label="Toggle signature propagation preview"
    >
      <svg viewBox="0 0 300 118" className="h-[118px] w-full">
        <circle cx="34" cy="59" r="13" fill="#B8FF3D" opacity={on ? 1 : 0.55} />
        <text x="34" y="62" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="#050505">
          1
        </text>
        {Array.from({ length: 11 }).map((_, i) => {
          const a = (i / 11) * Math.PI * 2
          const x = 248 + Math.cos(a) * 40
          const y = 59 + Math.sin(a) * 40
          return (
            <g key={i}>
              <motion.line
                x1="47"
                y1="59"
                x2={x}
                y2={y}
                stroke="#B8FF3D"
                strokeWidth="0.75"
                animate={{ strokeOpacity: on ? 0.5 : 0.12 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              />
              <motion.circle
                cx={x}
                cy={y}
                r="8"
                fill={on ? '#D5FF72' : '#2a2a2a'}
                initial={{ scale: 0 }}
                animate={{ scale: on ? 1 : 0.55 }}
                transition={{ duration: 0.45, delay: 0.1 + i * 0.045, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
            </g>
          )
        })}
        <text x="248" y="112" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="7.5" fill="#858585" letterSpacing="1.4">
          1,284 IDENTITIES
        </text>
      </svg>
      <span className="absolute bottom-0 left-0 font-mono text-[8px] uppercase tracking-[0.2em] text-[#4e4e4e]">
        {on ? '● signature propagating' : '○ tap to propagate'}
      </span>
    </button>
  )
}

const PILLARS = [
  {
    no: '01',
    title: 'BEHAVIORAL TWIN',
    body: 'Learn the behavioral fingerprint of every identity — device, geography, rhythm, session tempo and payment shape.',
    visual: <TwinVisual />,
  },
  {
    no: '02',
    title: 'ADAPTIVE DECEPTION',
    body: 'Move suspicious users into controlled synthetic environments that are convincing enough to keep an attacker busy.',
    visual: <DeceptionVisual />,
  },
  {
    no: '03',
    title: 'SECURITY VACCINATION',
    body: 'Convert attack signatures into protection for the wider identity population. Every attack makes the next one cheaper.',
    visual: <VaccineVisual />,
  },
]

export function FeatureGrid() {
  return (
    <section id="platform" className="relative scroll-mt-24 py-28 lg:py-36">
      <div className="mx-auto max-w-[1560px] px-6 lg:px-10">
        <SectionHead
          eyebrow="The platform"
          title={
            <>
              Three systems.
              <br />
              One <span className="lime-text">verdict</span>.
            </>
          }
          lede="IdentityTwin is not a login screen or a rules engine. It is a behavioural model, a deception layer and a learning loop — each one making the other two more accurate."
        />

        <div className="mt-16 grid gap-px lg:grid-cols-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {PILLARS.map((p, i) => (
            <Reveal key={p.no} i={i}>
              <article
                className="group relative flex h-full flex-col px-7 py-9 transition-colors duration-500 hover:bg-[#0b0b0b]"
                style={{ background: '#050505' }}
              >
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                  style={{ background: 'linear-gradient(90deg,#B8FF3D,transparent)', boxShadow: '0 0 14px rgba(184,255,61,0.7)' }}
                  aria-hidden
                />
                <span className="font-mono text-[9.5px] tracking-[0.22em] text-lime">{p.no}</span>
                <h3 className="headline-tight mt-6 text-[26px]" style={{ color: '#F5F5F5' }}>
                  {p.title}
                </h3>
                <p className="mt-4 text-[13.5px] leading-[1.72] text-[#7e7e7e]">{p.body}</p>

                <div className="mt-auto pt-9">{p.visual}</div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ========================================================= behavioral twin */

const DIMENSIONS = [
  { k: 'LOGIN RHYTHM', v: '08:00–22:30', note: '214 logins · median 09:42 IST', score: 96 },
  { k: 'DEVICE PATTERN', v: 'Mac / iPhone', note: '2 known fingerprints · 0 unknown', score: 91 },
  { k: 'LOCATION', v: 'Bangalore', note: 'Home geo · 1,450 km from baseline alt', score: 88 },
  { k: 'PAYMENT BEHAVIOR', v: '₹2K–₹8K', note: '6 known payees · all verified', score: 93 },
  { k: 'SESSION BEHAVIOR', v: '12 MIN', note: 'Median 11m 48s · 22 pages typical', score: 90 },
  { k: 'API USAGE', v: 'Read only', note: '0 admin scopes in 214 enrollments', score: 84 },
]

/** Deterministic pseudo-random so the chart never re-shuffles between renders. */
function wave(i: number, seed: number) {
  return (
    Math.sin(i * 0.55 + seed) * 0.32 + Math.sin(i * 0.19 + seed * 2.1) * 0.42 + Math.sin(i * 1.13 + seed * 0.7) * 0.16
  )
}

const POINTS = 44

function TwinChart({ active }: { active: number | null }) {
  const W = 860
  const H = 250
  const y = (v: number) => H - 26 - v * (H - 52)

  const band = Array.from({ length: POINTS }, (_, i) => {
    const base = 0.52 + wave(i, 1.2) * 0.16
    return {
      i,
      lo: y(base - 0.15),
      hi: y(base + 0.15),
      baseline: y(base),
    }
  })

  const line = (offset: number) =>
    band.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (POINTS - 1)) * W} ${p.baseline + offset}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Adwika's 44-session behavioral baseline against her normal band">
      <defs>
        <linearGradient id="tw-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B8FF3D" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#B8FF3D" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* normal band */}
      <path
        d={`M ${(band[0].i / (POINTS - 1)) * W} ${band[0].hi} ${band
          .slice(1)
          .map((p) => `L ${(p.i / (POINTS - 1)) * W} ${p.hi}`)
          .join(' ')} ${band
          .slice()
          .reverse()
          .map((p) => `L ${(p.i / (POINTS - 1)) * W} ${p.lo}`)
          .join(' ')} Z`}
        fill="url(#tw-band)"
      />
      <path d={line(0)} fill="none" stroke="#B8FF3D" strokeWidth="1.6" strokeOpacity={active === null ? 0.9 : 0.4} />

      {/* divergence marker — where the attack would land */}
      <g>
        <line x1={W * 0.955} y1={18} x2={W * 0.955} y2={H - 26} stroke="#FF3344" strokeWidth="1" strokeDasharray="3 4" opacity="0.75" />
        <circle cx={W * 0.955} cy={y(0.06)} r="4.5" fill="#FF3344" />
        <circle cx={W * 0.955} cy={y(0.06)} r="9" fill="none" stroke="#FF3344" strokeOpacity="0.4" />
        <text x={W * 0.955 - 10} y={y(0.06) - 16} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#FF6B78" letterSpacing="1.2">
          03:17 AM · DELHI · WINDOWS
        </text>
      </g>

      {/* axis ticks */}
      {band
        .filter((_, i) => i % 11 === 0)
        .map((p) => (
          <text
            key={p.i}
            x={(p.i / (POINTS - 1)) * W}
            y={H - 6}
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="8"
            fill="#4f4f4f"
            letterSpacing="1"
          >
            S-{String(40 + p.i * 3).padStart(2, '0')}
          </text>
        ))}
    </svg>
  )
}

export function TwinSection() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <section id="twin" className="relative scroll-mt-24 overflow-hidden py-28 lg:py-36">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(60% 45% at 78% 22%, rgba(184,255,61,0.055), transparent 62%)' }}
        aria-hidden
      />
      <div className="mx-auto max-w-[1560px] px-6 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            eyebrow="Behavioral twin"
            title={
              <>
                Every identity
                <br />
                has a <span className="lime-text">pattern</span>.
              </>
            }
          />
          <Reveal i={2}>
            <p className="max-w-[380px] text-[14.5px] leading-[1.75] text-[#7e7e7e]">
              A twin is not a profile you fill in. It is the residue of how a person actually behaves — the only
              credential that cannot be phished, replayed or bought.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-12">
          {/* dimensions */}
          <div className="space-y-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {DIMENSIONS.map((d, i) => {
              const on = active === i
              return (
                <button
                  key={d.k}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-300"
                  style={{ background: on ? '#0c0c0c' : '#050505' }}
                >
                  <span className="min-w-0">
                    <span className="block font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: on ? '#B8FF3D' : '#7a7a7a' }}>
                      {d.k}
                    </span>
                    <span className="mt-1.5 block font-sans text-[15px] font-semibold text-[#EDEDED]">{d.v}</span>
                    <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.1em] text-[#575757]">{d.note}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span
                      className="block font-sans text-[19px] font-bold leading-none"
                      style={{ color: on ? '#D5FF72' : '#6f6f6f' }}
                    >
                      {d.score}
                    </span>
                    <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.14em] text-[#4f4f4f]">fid</span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* graph */}
          <div className="glass-card relative p-7 lg:p-9" style={{ borderRadius: 6 }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-[#6f6f6f]">
                  Behavioural vector · last 44 sessions
                </div>
                <div className="mt-2 font-sans text-[19px] font-bold text-[#F5F5F5]">
                  ADWIKA JAISWAL
                  <span className="ml-3 font-mono text-[10px] font-normal tracking-[0.18em] text-[#B8FF3D]">
                    TWIN CONFIDENCE 96%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-5 font-mono text-[9px] uppercase tracking-[0.16em]">
                <span className="flex items-center gap-2 text-[#858585]">
                  <span className="h-[2px] w-5" style={{ background: '#B8FF3D' }} aria-hidden />
                  Baseline
                </span>
                <span className="flex items-center gap-2 text-[#858585]">
                  <span className="h-[2px] w-5" style={{ background: 'rgba(184,255,61,0.22)' }} aria-hidden />
                  Normal band
                </span>
                <span className="flex items-center gap-2 text-[#FF6B78]">
                  <span className="h-[2px] w-5" style={{ background: '#FF3344' }} aria-hidden />
                  Divergence
                </span>
              </div>
            </div>

            <div className="mt-8">
              <TwinChart active={active} />
            </div>

            <div className="mt-6 border-t border-white/[0.06] pt-5 font-mono text-[10px] uppercase leading-[1.9] tracking-[0.14em] text-[#5f5f5f]">
              {active !== null ? (
                <span>
                  <span className="text-lime">{DIMENSIONS[active].k}</span> — {DIMENSIONS[active].note}
                </span>
              ) : (
                <span>Hover a dimension to inspect it · every signal is learned, none are declared</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================================================== deception */

const DECOY_NAV = ['TRANSACTIONS', 'CUSTOMERS', 'PAYMENTS', 'API CREDENTIALS'] as const
type DecoyNav = (typeof DECOY_NAV)[number]

const DECOY_ROWS: Record<DecoyNav, { h: string[]; rows: string[][] }> = {
  TRANSACTIONS: {
    h: ['REFERENCE', 'COUNTERPARTY', 'METHOD', 'AMOUNT', 'STATE'],
    rows: [
      ['TX-90821', 'NORTHWIND TRADING', 'NEFT', '₹1,24,000', 'SETTLED'],
      ['TX-90834', 'HOLLOWPOINT TRADING LLC', 'PAYOUT', '₹4,80,000', 'PENDING'],
      ['TX-90847', 'MERIDIAN LOGISTICS', 'NEFT', '₹62,400', 'SETTLED'],
      ['TX-90852', 'KADAMB ENTERPRISES', 'RTGS', '₹9,80,000', 'SETTLED'],
      ['TX-90866', 'SUNRISE VENTURES', 'UPI', '₹18,750', 'SETTLED'],
    ],
  },
  CUSTOMERS: {
    h: ['ACCOUNT', 'NAME', 'SEGMENT', 'BALANCE', 'KYC'],
    rows: [
      ['CA-10241', 'ANANYA KRISHNAN', 'BUSINESS', '₹8,42,100', 'VERIFIED'],
      ['CA-10242', 'ROHAN MEHTA', 'BUSINESS', '₹2,18,640', 'VERIFIED'],
      ['CA-10243', 'PRIYA NAIR', 'RETAIL', '₹94,320', 'VERIFIED'],
      ['CA-10244', 'ARJUN RAO', 'BUSINESS', '₹11,05,880', 'PENDING'],
      ['CA-10245', 'SANA IQBAL', 'RETAIL', '₹1,42,760', 'VERIFIED'],
    ],
  },
  PAYMENTS: {
    h: ['PAYEE', 'BANK', 'ACCOUNT', 'AMOUNT', 'STATUS'],
    rows: [
      ['HOLLOWPOINT TRADING LLC', 'HDFC', 'XXXX4417', '₹4,80,000', 'QUEUED'],
      ['MERIDIAN LOGISTICS', 'ICICI', 'XXXX9032', '₹62,400', 'RELEASED'],
      ['KADAMB ENTERPRISES', 'AXIS', 'XXXX1188', '₹9,80,000', 'RELEASED'],
      ['NORTHWIND TRADING', 'SBI', 'XXXX7741', '₹1,24,000', 'RELEASED'],
      ['SUNRISE VENTURES', 'KOTAK', 'XXXX2255', '₹18,750', 'RELEASED'],
    ],
  },
  'API CREDENTIALS': {
    h: ['KEY', 'SCOPE', 'CREATED', 'LAST USED', 'STATE'],
    rows: [
      ['AY9X-••••••••', 'READ:ACCOUNTS', '2024-11-02', '03:19:22', 'ACTIVE'],
      ['sk_live-••••••••', 'FULL ACCESS', '2024-11-02', '03:19:19', 'ARMED'],
      ['PAYPAL_SECRET_0042', 'CANARY TRAP', '2025-01-14', '—', 'ARMED'],
      ['AY9X-••••••••', 'READ:TRANSACTIONS', '2025-03-21', '03:18:44', 'ACTIVE'],
      ['sk_test-••••••••', 'SANDBOX', '2024-08-11', '12:04:09', 'REVOKED'],
    ],
  },
}

const DECOY_HEADLINE = [
  { k: 'AVAILABLE BALANCE', v: '₹8,42,100' },
  { k: 'PENDING PAYOUT', v: '₹4,80,000' },
  { k: 'CUSTOMER ACCOUNTS', v: '1,482' },
]

export function DecoySection({ onEnterConsole }: { onEnterConsole: () => void }) {
  const [tab, setTab] = useState<DecoyNav>('TRANSACTIONS')
  const table = DECOY_ROWS[tab]

  return (
    <section id="deception" className="relative scroll-mt-24 py-28 lg:py-36">
      <div className="mx-auto max-w-[1560px] px-6 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[400px_1fr] lg:items-center lg:gap-16">
          <div>
            <SectionHead
              eyebrow="Adaptive deception"
              title={
                <>
                  Let the attacker
                  <br />
                  walk into the <span className="lime-text">trap</span>.
                </>
              }
              lede="A suspicious session is not blocked. It is quietly rerouted into a synthetic financial workspace with plausible balances, real-looking payees and working navigation — so the attacker keeps operating while IdentityTwin records exactly what they came for."
            />
            <Reveal i={3}>
              <dl className="mt-10 space-y-4">
                {[
                  ['Real resources', 'Never exposed'],
                  ['Response latency', 'Indistinguishable'],
                  ['Attacker time', 'Fully consumed'],
                  ['Intent captured', 'Yes'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6f6f6f]">{k}</dt>
                    <dd className="font-sans text-[13px] font-semibold text-[#D5FF72]">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal i={4}>
              <button
                type="button"
                onClick={onEnterConsole}
                className="group mt-9 inline-flex items-center gap-2.5 font-sans text-[12px] font-bold uppercase tracking-[0.14em] text-lime transition-colors hover:text-limesoft"
              >
                Open the deception console
                <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M0 5.5h13M9 1l4.5 4.5L9 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                </svg>
              </button>
            </Reveal>
          </div>

          {/* the fake workspace */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div
              className="pointer-events-none absolute -inset-10 -z-10"
              style={{ background: 'radial-gradient(60% 50% at 60% 40%, rgba(184,255,61,0.075), transparent 70%)', filter: 'blur(30px)' }}
              aria-hidden
            />
            <div className="overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, background: '#070707' }}>
              {/* chrome */}
              <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4" style={{ background: '#0b0b0b' }}>
                <div className="flex items-center gap-3">
                  <span className="flex gap-[5px]" aria-hidden>
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-[8px] w-[8px] rounded-full" style={{ background: '#3a3a3a' }} />
                    ))}
                  </span>
                  <span className="font-sans text-[13px] font-bold uppercase tracking-[0.16em] text-[#E8E8E8]">
                    Merchant Payments
                  </span>
                </div>
                <span
                  className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em]"
                  style={{ color: '#B8FF3D' }}
                >
                  <span className="relative inline-flex h-[6px] w-[6px]">
                    <motion.span
                      className="absolute inset-0 rounded-full"
                      style={{ background: '#B8FF3D' }}
                      animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                    />
                    <span className="relative h-full w-full rounded-full" style={{ background: '#B8FF3D' }} aria-hidden />
                  </span>
                  Session Decoy Active
                </span>
              </div>

              {/* headline figures */}
              <div className="grid grid-cols-3 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
                {DECOY_HEADLINE.map((h) => (
                  <div key={h.k} className="px-6 py-6" style={{ background: '#080808' }}>
                    <div className="font-mono text-[8.5px] uppercase tracking-[0.24em] text-[#6f6f6f]">{h.k}</div>
                    <div className="mt-2.5 font-sans text-[clamp(20px,2.2vw,30px)] font-bold leading-none tracking-[-0.03em] text-[#F5F5F5]">
                      {h.v}
                    </div>
                  </div>
                ))}
              </div>

              {/* tabs */}
              <div className="flex flex-wrap gap-1.5 border-b border-white/[0.06] px-6 py-3">
                {DECOY_NAV.map((n) => {
                  const on = tab === n
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTab(n)}
                      className="px-3.5 py-2 font-mono text-[9px] uppercase tracking-[0.16em] transition-all duration-300"
                      style={{
                        borderRadius: 4,
                        color: on ? '#050505' : '#8a8a8a',
                        background: on ? '#B8FF3D' : 'rgba(255,255,255,0.035)',
                        boxShadow: on ? '0 0 20px -4px rgba(184,255,61,0.7)' : 'none',
                      }}
                      aria-pressed={on}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>

              {/* table */}
              <div className="px-6 pb-6 pt-2">
                <div className="grid gap-x-5 gap-y-0" style={{ gridTemplateColumns: `repeat(${table.h.length}, minmax(0,1fr))` }}>
                  {table.h.map((c) => (
                    <span
                      key={c}
                      className="border-b border-white/[0.07] py-2.5 font-mono text-[8px] uppercase tracking-[0.2em] text-[#5f5f5f]"
                    >
                      {c}
                    </span>
                  ))}
                  {table.rows.map((r, ri) => (
                    <motion.div key={ri} className="contents">
                      {r.map((cell, ci) => (
                        <span
                          key={ci}
                          className="border-b border-white/[0.04] py-3 font-mono text-[10.5px] tracking-[0.02em]"
                          style={{
                            color: cell.includes('PENDING') || cell.includes('QUEUED') ? '#FFD43B' : cell.includes('ARMED') ? '#B8FF3D' : ci === 3 ? '#EDEDED' : '#8e8e8e',
                          }}
                        >
                          {cell}
                        </span>
                      ))}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-4 font-mono text-[9.5px] uppercase leading-[1.9] tracking-[0.16em] text-[#4f4f4f]">
              Fictional interface · synthetic balances · no real financial system is contacted
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}