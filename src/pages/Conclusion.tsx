import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CrtOverlay } from '@/components/crt/CrtOverlay'
import { BrandMark } from '@/components/layout/BrandMark'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { StatusPip } from '@/components/ui/indicators'
import { PixelSkull, PixelGlyph } from '@/components/ui/PixelGlyph'
import { TONES, cut, type Tone } from '@/components/ui/tokens.tsx'
import { useSim } from '@/sim/SimulationProvider'
import { useNavigate } from '@/lib/router'
import { useCountUp, useKey } from '@/lib/hooks'
import { pad2 } from '@/lib/format'
import { WITH_TWIN, WITHOUT_TWIN, VACCINE_RULE } from '@/data'

/* ------------------------------------------------------------------ config */

const ROW_DELAY = 0.22

/** Tone ladder applied to the shared data strings — no duplicated copy here. */
const WITHOUT_TONES: Tone[] = ['crit', 'crit', 'neutral', 'crit']
const WITH_TONES: Tone[] = ['soft', 'soft', 'warn', 'warn', 'crit', 'crit', 'ok', 'ok', 'ok']

const WITHOUT_ROWS = WITHOUT_TWIN.map((label, i) => ({
  n: pad2(i + 1),
  label,
  tone: WITHOUT_TONES[i] ?? 'neutral',
}))

const WITH_ROWS = WITH_TWIN.map((label, i) => ({
  n: pad2(i + 1),
  label,
  tone: WITH_TONES[i] ?? 'soft',
  final: i >= WITH_TONES.length - 3,
}))

const QUOTE = 'IT DOESN’T JUST DETECT THE ATTACK. IT LEARNS FROM IT.'

/* ------------------------------------------------------------------- rows */

function FlowRow({
  n,
  label,
  tone,
  visible,
  final,
}: {
  n: string
  label: string
  tone: Tone
  visible: boolean
  final?: boolean
}) {
  const t = TONES[tone]
  return (
    <li className="relative flex items-center gap-3 py-[7px]">
      <span
        className="absolute inset-y-0 left-0 w-[2px]"
        style={{ background: visible ? t.bar : 'transparent', boxShadow: visible ? `0 0 10px ${t.bar}` : 'none' }}
        aria-hidden
      />
      <span className="w-[22px] shrink-0 font-mono text-[10px] tnum text-[#3d3d3d]">{n}</span>
      <span
        className="shrink-0 font-mono text-[11px]"
        style={{ color: visible ? t.text : '#2a2a2a' }}
        aria-hidden
      >
        ▸
      </span>
      <span
        className="min-w-0 flex-1 truncate font-mono text-[11px] tracking-[0.1em] sm:text-[12px]"
        style={{
          color: visible ? (final ? t.text : '#f5f5f5') : '#2a2a2a',
          textShadow: visible && final ? `0 0 14px rgba(${t.rgb},0.6)` : 'none',
        }}
      >
        {label}
      </span>
      {visible && final && (
        <span className="shrink-0 font-pixel-xs" style={{ color: t.text }}>
          ✓
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 h-px bg-[#141414]" aria-hidden />
    </li>
  )
}

function Column({
  title,
  subtitle,
  rows,
  visible,
  tone,
  accent,
}: {
  title: string
  subtitle: string
  rows: { n: string; label: string; tone: Tone; final?: boolean }[]
  visible: number
  tone: Tone
  accent: 'crit' | 'ok'
}) {
  const t = TONES[tone]
  return (
    <section className="relative" style={{ ...cut('lg'), background: t.border, padding: 2 }}>
      <div className="relative h-full" style={{ ...cut('lg'), background: '#0b0b0b' }}>
        <header className="border-b border-[#1c1c1c] px-4 py-3">
          <div className="flex items-center gap-2">
            <StatusPip tone={tone} size={6} />
            <h2 className="font-pixel-xs" style={{ color: t.text, textShadow: `0 0 12px rgba(${t.rgb},0.4)` }}>
              {title}
            </h2>
          </div>
          <p className="mt-2 font-mono text-[9px] tracking-[0.16em] text-[#4a4a4a]">{subtitle}</p>
        </header>

        <ul className="px-4 py-3">
          {rows.map((r, i) => (
            <FlowRow key={r.label} n={r.n} label={r.label} tone={r.tone} visible={i < visible} final={'final' in r ? r.final : false} />
          ))}
        </ul>

        <footer
          className="border-t border-[#1c1c1c] px-4 py-[10px]"
          style={{ background: accent === 'crit' ? 'rgba(255,51,68,0.07)' : 'rgba(53,255,114,0.06)' }}
        >
          <div className="font-pixel-xs" style={{ color: accent === 'crit' ? '#ff3344' : '#35ff72' }}>
            {accent === 'crit' ? '₹4,80,000 DRAWN' : '₹0 DRAWN · RULE LEARNED'}
          </div>
          <div className="mt-2 font-mono text-[9px] tracking-[0.12em] text-[#4a4a4a]">
            {accent === 'crit' ? 'ATTACKER NEVER DETECTED · USER LOCKED OUT' : 'ATTACKER NEVER AWARE · USER NEVER DISTURBED'}
          </div>
        </footer>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ wordmark */

function Wordmark({ armed }: { armed: boolean }) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, letterSpacing: '0.6em' }}
        animate={{ opacity: 1, letterSpacing: '0.14em' }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="font-pixel-xl leading-none text-bone sm:font-pixel-lg"
        style={{ textShadow: '0 0 30px rgba(91,114,255,0.5)' }}
      >
        IDENTITYTWIN
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-3 font-mono text-[10px] tracking-[0.3em] text-soft"
      >
        BEHAVIORAL IDENTITY INTELLIGENCE
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-4 flex flex-wrap items-center justify-center gap-2"
      >
        <BadgeLine tone={armed ? 'ok' : 'neutral'}>{armed ? 'RULE DEPLOYED · 1,284 PROTECTED' : 'SIMULATION COMPLETE'}</BadgeLine>
        <BadgeLine tone="soft">SYNTHETIC DATA</BadgeLine>
      </motion.div>
    </div>
  )
}

function BadgeLine({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const t = TONES[tone]
  return (
    <span
      className="inline-flex items-center px-2 py-[3px] font-pixel-xs"
      style={{ ...cut('sm'), background: t.bg, color: t.text, boxShadow: `inset 0 0 0 1px rgba(${t.rgb},0.4)` }}
    >
      {children}
    </span>
  )
}

/* -------------------------------------------------------------------- page */

export function Conclusion() {
  const sim = useSim()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const armed = sim.securityVaccineDeployed

  /* Cinematic reveal — replays whenever the screen is entered. */
  useEffect(() => {
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setStep(i)
      if (i >= 12) window.clearInterval(id)
    }, ROW_DELAY * 1000)
    return () => window.clearInterval(id)
  }, [])

  const leftVisible = Math.min(WITHOUT_ROWS.length, step + 1)
  const rightVisible = Math.min(WITH_ROWS.length, step)
  const protectedCount = useCountUp(step > 10 ? VACCINE_RULE.identitiesCovered : 0, 2400, 200)

  useKey('Escape', () => navigate('/console'))

  return (
    <div className="crt-screen relative min-h-screen overflow-y-auto bg-void text-bone">
      <CrtOverlay />

      <div className="relative z-10 mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 lg:py-14">
        {/* masthead */}
        <div className="mb-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BrandMark size={22} />
            <span className="font-pixel-xs text-muted">FINAL SYSTEM STATE</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/console')}
            className="cursor-pointer font-mono text-[10px] tracking-[0.16em] text-muted transition-colors hover:text-bone"
          >
            [ ESC ] BACK TO CONSOLE
          </button>
        </div>

        <Wordmark armed={armed} />

        {/* quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 10 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-12 max-w-[900px] text-center"
        >
          <p
            className="font-pixel-sm leading-[2.1] text-bone sm:font-pixel-md"
            style={{ textShadow: '0 0 26px rgba(36,75,255,0.45)' }}
          >
            {QUOTE}
          </p>
        </motion.blockquote>

        {/* before / after */}
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Column
            title="WITHOUT IDENTITYTWIN"
            subtitle="TRADITIONAL AUTHENTICATION · RULE-BASED FRAUD FILTERS"
            rows={WITHOUT_ROWS}
            visible={leftVisible}
            tone="crit"
            accent="crit"
          />
          <Column
            title="WITH IDENTITYTWIN"
            subtitle={`BEHAVIOURAL BASELINE · DECEPTION · VACCINATION ${armed ? `· RULE ${VACCINE_RULE.id}` : ''}`}
            rows={WITH_ROWS}
            visible={rightVisible}
            tone="ok"
            accent="ok"
          />
        </div>

        {/* payoff */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: step >= 11 ? 1 : 0, y: step >= 11 ? 0 : 12 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <div className="relative" style={{ ...cut('lg'), background: '#1c6b3d', padding: 2 }}>
            <div
              className="flex flex-col items-center gap-4 px-5 py-6 text-center sm:flex-row sm:justify-between sm:text-left"
              style={{ ...cut('lg'), background: '#080a08' }}
            >
              <div className="flex items-center gap-4">
                <PixelGlyph map="SHIELD_16" color="#35ff72" px={3.4} glow="rgba(53,255,114,0.6)" animated={false} />
                <div>
                  <div
                    className="font-pixel-md leading-none tnum text-ok"
                    style={{ textShadow: '0 0 24px rgba(53,255,114,0.6)' }}
                  >
                    {protectedCount.toLocaleString('en-IN')} IDENTITIES PROTECTED
                  </div>
                  <div className="mt-2 font-mono text-[10px] tracking-[0.14em] text-[#4a4a4a]">
                    FROM A SINGLE ATTACK · RULE {VACCINE_RULE.id} · {VACCINE_RULE.version}
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <TerminalButton label="REPLAY FROM COMMAND CENTER" tone="ok" size="md" onClick={() => navigate('/console')} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* closing actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 12 ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          <TerminalButton label="RUN THE ATTACK AGAIN" tone="blue" size="md" active onClick={() => { sim.start(); navigate('/simulation') }} />
          <TerminalButton label="VIEW ATTACKTRACE" tone="crit" size="md" onClick={() => navigate('/attacktrace')} />
          <TerminalButton label="OPEN INCIDENT" tone="warn" size="md" onClick={() => navigate('/incidents')} />
          <TerminalButton label="SECURITY VACCINATION" tone="ok" size="md" onClick={() => navigate('/vaccination')} />
          <TerminalButton label="COMMAND CENTER" tone="neutral" size="md" onClick={() => navigate('/console')} />
        </motion.div>

        {/* footer */}
        <footer className="mt-12 border-t border-[#161616] pt-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-3">
              <PixelSkull px={3} color="#2a2a2a" animated={false} />
              <span className="font-mono text-[9px] tracking-[0.22em] text-[#3d3d3d]">
                SIMULATION ENVIRONMENT · ALL IDENTITIES, SESSIONS, PAYOUTS AND ATTACKS ARE SYNTHETIC
              </span>
              <PixelSkull px={3} color="#2a2a2a" animated={false} />
            </div>
            <span className="font-mono text-[9px] tracking-[0.22em] text-[#2f2f2f]">
              IDENTITYTWIN · BEHAVIORAL IDENTITY INTELLIGENCE · NO EXTERNAL DATA SOURCES
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
