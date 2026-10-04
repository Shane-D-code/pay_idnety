/* ==========================================================================
   LANDING BANDS — metrics, the four-step method, the trust state machine and
   the before/after attack intelligence comparison.
   ========================================================================== */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCountUp } from '@/lib/hooks'
import { Arrow, Eyebrow, FaintRule, Reveal, SectionHead } from './kit'

/* ================================================================ metrics */

const METRICS = [
  { value: 1284, label: 'IDENTITIES PROTECTED', pad: false },
  { value: 87, label: 'ACTIVE SESSIONS', pad: true },
  { value: 3, label: 'ACTIVE THREATS', pad: true },
  { value: 2, label: 'ACTIVE DECOYS', pad: true },
] as const

function MetricCell({ value, label, pad }: { value: number; label: string; pad: boolean }) {
  const n = useCountUp(value, 1500)
  const text = pad ? String(Math.round(n)).padStart(2, '0') : Math.round(n).toLocaleString('en-IN')
  return (
    <div className="px-2 py-8 sm:px-6 lg:py-11">
      <div
        className="headline-tight text-[clamp(40px,5.2vw,76px)]"
        style={{ color: '#F5F5F5', letterSpacing: '-0.05em' }}
      >
        {text}
      </div>
      <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.26em] text-[#7d7d7d]">{label}</div>
    </div>
  )
}

export function MetricsStrip() {
  return (
    <section className="relative border-y" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
      <div className="mx-auto max-w-[1560px] px-6 lg:px-10">
        <div className="grid grid-cols-2 divide-white/[0.07] lg:grid-cols-4 lg:divide-x">
          {METRICS.map((m, i) => (
            <Reveal key={m.label} i={i} className={i >= 2 ? 'border-t lg:border-t-0' : ''}>
              <MetricCell {...m} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================= how it works */

const STEPS = [
  {
    n: '01',
    title: 'LEARN',
    body: "IdentityTwin learns the user's normal behavioral identity.",
    detail: '74 sessions · 214 signals · 6 known payees',
  },
  {
    n: '02',
    title: 'DETECT',
    body: 'Behavioral divergence increases risk.',
    detail: 'Device · location · rhythm · payout · API scope',
  },
  {
    n: '03',
    title: 'DECEIVE',
    body: 'Suspicious sessions are moved into controlled environments.',
    detail: 'Synthetic balances · honey credentials · zero real data',
  },
  {
    n: '04',
    title: 'LEARN AGAIN',
    body: 'Attacks become security signatures that protect other identities.',
    detail: '1 attack → 1 signature → 1,284 identities',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-24 py-28 lg:py-36">
      <div className="mx-auto max-w-[1560px] px-6 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            eyebrow="How it works"
            title={
              <>
                How IdentityTwin
                <br />
                works
              </>
            }
          />
          <Reveal i={2}>
            <p className="max-w-[380px] text-[14.5px] leading-[1.75] text-[#7e7e7e]">
              One continuous loop. Each pass makes the next decision sharper, and every attack that enters the
              loop leaves the system better defended than before.
            </p>
          </Reveal>
        </div>

        <div className="relative mt-16">
          {/* progression rail */}
          <div
            className="absolute left-0 right-0 top-[38px] hidden h-px lg:block"
            style={{ background: 'linear-gradient(90deg,rgba(184,255,61,0.55),rgba(184,255,61,0.12) 70%,transparent)' }}
            aria-hidden
          />

          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {STEPS.map((s, i) => (
              <Reveal key={s.n} i={i}>
                <div className="group relative h-full px-7 py-9 transition-colors duration-500 hover:bg-[#0c0c0c]" style={{ background: '#050505' }}>
                  <div className="flex items-center gap-4">
                    <span className="relative z-10 font-sans text-[13px] font-bold tracking-[0.06em] text-lime">
                      {s.n}
                    </span>
                    <span
                      className="h-2 w-2 rotate-45 transition-transform duration-500 group-hover:scale-150"
                      style={{ background: '#B8FF3D', boxShadow: '0 0 12px rgba(184,255,61,0.8)' }}
                      aria-hidden
                    />
                  </div>
                  <h3 className="headline-tight mt-7 text-[30px]" style={{ color: '#F5F5F5' }}>
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-[280px] text-[13.5px] leading-[1.7] text-[#7e7e7e]">{s.body}</p>
                  <div className="mt-6 font-mono text-[9px] uppercase tracking-[0.2em] text-[#5f5f5f]">{s.detail}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ========================================================== trust machine */

const TRUST_STATES = [
  { k: 'NORMAL', d: 'Full access', tone: '#B8FF3D', signal: 'Behaviour matches the established twin.' },
  { k: 'DRIFT', d: 'Elevated monitoring', tone: '#D5FF72', signal: 'One or more signals are outside the learned band.' },
  { k: 'RISK', d: 'Composite score rising', tone: '#FFD43B', signal: 'Divergence across device, geo, time and payout.' },
  { k: 'RESTRICTED', d: 'Reduced transaction limits', tone: '#FF9F43', signal: 'High-value actions require step-up authentication.' },
  { k: 'DECOY', d: 'Shadow environment', tone: '#FF3344', signal: 'Session rerouted to a convincing synthetic workspace.' },
  { k: 'ISOLATED', d: 'Real resources blocked', tone: '#FF3344', signal: 'Credentials revoked, payout cancelled, evidence sealed.' },
]

export function SecuritySection() {
  const [i, setI] = useState(0)
  const s = TRUST_STATES[i]

  return (
    <section id="security" className="relative scroll-mt-24 overflow-hidden py-28 lg:py-36">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(70% 50% at 20% 40%, rgba(184,255,61,0.06), transparent 65%)' }}
        aria-hidden
      />
      <div className="mx-auto max-w-[1560px] px-6 lg:px-10">
        <SectionHead
          eyebrow="Progressive trust"
          title={
            <>
              When behavior breaks,
              <br />
              trust <span className="lime-text">changes</span>.
            </>
          }
          lede="Trust is not a boolean. IdentityTwin collapses it in stages, so a suspicious session is contained by the smallest intervention that works — and by the time the attacker is certain he is inside, nothing real is left to reach."
        />

        {/* state ladder */}
        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_400px] lg:items-center">
          <div>
            <div className="flex flex-wrap items-stretch gap-2">
              {TRUST_STATES.map((t, idx) => {
                const on = idx === i
                return (
                  <button
                    key={t.k}
                    type="button"
                    onClick={() => setI(idx)}
                    className="group relative flex-1 basis-[150px] px-4 py-5 text-left transition-all duration-400"
                    style={{
                      border: `1px solid ${on ? `${t.tone}66` : 'rgba(255,255,255,0.08)'}`,
                      background: on ? `${t.tone}0F` : 'rgba(255,255,255,0.012)',
                      borderRadius: 5,
                    }}
                  >
                    <span
                      className="absolute left-0 top-0 h-full w-[2px] transition-opacity duration-300"
                      style={{ background: t.tone, opacity: on ? 1 : 0.25 }}
                      aria-hidden
                    />
                    <span className="block font-mono text-[8.5px] uppercase tracking-[0.22em] text-[#6d6d6d]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="mt-2.5 block font-sans text-[14.5px] font-bold uppercase tracking-[0.03em] transition-colors"
                      style={{ color: on ? t.tone : '#dcdcdc' }}
                    >
                      {t.k}
                    </span>
                    <span className="mt-1.5 block font-mono text-[9px] uppercase leading-[1.6] tracking-[0.14em] text-[#6a6a6a]">
                      {t.d}
                    </span>
                  </button>
                )
              })}
            </div>

            <FaintRule className="mt-10" />

            <motion.p
              key={s.k}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-6 max-w-[560px] text-[15px] leading-[1.7] text-[#8f8f8f]"
            >
              <span className="font-sans font-bold uppercase tracking-[0.06em]" style={{ color: s.tone }}>
                {s.k}
              </span>{' '}
              — {s.signal}
            </motion.p>
          </div>

          {/* readout */}
          <div className="glass-card relative p-7" style={{ borderRadius: 6 }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-[#6f6f6f]">Trust collapse</span>
              <span className="font-mono text-[10px] tracking-[0.16em]" style={{ color: s.tone }}>
                STAGE {i + 1}/06
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span
                className="headline-tight text-[76px]"
                style={{ color: s.tone, textShadow: `0 0 40px ${s.tone}44` }}
              >
                {String(96 - i * 16).padStart(2, '0')}
              </span>
              <span className="font-sans text-[20px] font-medium text-[#5c5c5c]">/100</span>
            </div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-[#6d6d6d]">trust score</div>

            <div className="mt-7 space-y-[7px]">
              {TRUST_STATES.map((t, idx) => (
                <div key={t.k} className="flex items-center gap-3">
                  <span className="font-mono text-[9px] tracking-[0.14em]" style={{ color: idx <= i ? t.tone : '#4a4a4a' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="h-[3px] flex-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.span
                      className="block h-full"
                      style={{ background: t.tone, boxShadow: `0 0 8px ${t.tone}` }}
                      initial={{ width: 0 }}
                      animate={{ width: idx <= i ? '100%' : '0%' }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#5f5f5f]">{t.k}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ==================================================== attack intelligence */

const BEFORE = [
  'STOLEN CREDENTIALS',
  'SUCCESSFUL LOGIN',
  'PAYMENT SYSTEM',
  'ACCOUNT TAKEOVER',
]

const AFTER = [
  'STOLEN CREDENTIALS',
  'BEHAVIORAL DIVERGENCE',
  'TRUST REDUCTION',
  'ADAPTIVE DECEPTION',
  'CANARY TRIGGER',
  'INTENT IDENTIFIED',
  'ATTACK ISOLATED',
  'SIGNATURE LEARNED',
  'OTHER IDENTITIES PROTECTED',
]

function Chain({ items, tone }: { items: string[]; tone: 'dim' | 'lime' }) {
  const lime = tone === 'lime'
  return (
    <ol className="space-y-0">
      {items.map((t, i) => (
        <motion.li
          key={t}
          initial={{ opacity: 0, x: lime ? 16 : 0 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.07 }}
          className="relative flex items-center gap-4 py-3.5"
          style={{ borderBottom: `1px solid ${lime ? 'rgba(184,255,61,0.1)' : 'rgba(255,255,255,0.055)'}` }}
        >
          <span className="font-mono text-[9.5px]" style={{ color: lime ? '#B8FF3D' : '#4f4f4f' }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <span
            className="font-sans text-[15px] font-semibold uppercase tracking-[0.02em]"
            style={{ color: lime ? '#F5F5F5' : '#6d6d6d' }}
          >
            {t}
          </span>
        </motion.li>
      ))}
    </ol>
  )
}

export function AttackSection({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section id="attack" className="relative scroll-mt-24 py-28 lg:py-36">
      <div className="mx-auto max-w-[1560px] px-6 lg:px-10">
        <SectionHead
          eyebrow="Attack intelligence"
          title={
            <>
              The same stolen password.
              <br />
              Two very <span className="lime-text">different</span> outcomes.
            </>
          }
        />

        <div className="mt-16 grid gap-px lg:grid-cols-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="px-8 py-10 lg:px-10" style={{ background: '#050505' }}>
            <Eyebrow>Without IdentityTwin</Eyebrow>
            <h3 className="headline-tight mt-5 text-[34px]" style={{ color: '#6a6a6a' }}>
              Traditional
            </h3>
            <div className="mt-7">
              <Chain items={BEFORE} tone="dim" />
            </div>
            <p className="mt-7 font-mono text-[10.5px] uppercase leading-[1.9] tracking-[0.16em] text-[#5a5a5a]">
              Detection happens at login. Everything after it is invisible until money moves.
            </p>
          </div>

          <div className="relative px-8 py-10 lg:px-10" style={{ background: '#070907' }}>
            <span
              className="pointer-events-none absolute inset-0"
              style={{ background: 'radial-gradient(80% 60% at 50% 0%, rgba(184,255,61,0.07), transparent 70%)' }}
              aria-hidden
            />
            <div className="relative">
              <Eyebrow tone="lime">With IdentityTwin</Eyebrow>
              <h3 className="headline-tight mt-5 text-[34px]" style={{ color: '#F5F5F5' }}>
                Behavioral
              </h3>
              <div className="mt-7">
                <Chain items={AFTER} tone="lime" />
              </div>
              <button
                type="button"
                onClick={onLaunch}
                className="group mt-8 inline-flex items-center gap-2.5 font-sans text-[12px] font-bold uppercase tracking-[0.14em] text-lime transition-colors hover:text-limesoft"
              >
                Run this attack live
                <Arrow />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}