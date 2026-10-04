import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CrtOverlay, CrtFlash } from '@/components/crt/CrtOverlay'
import { PixelGlyph } from '@/components/ui/PixelGlyph'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { TerminalLoader } from '@/components/ui/TerminalLoader'
import { PromptLine, Caret } from '@/components/ui/TypeLine'
import { StatusPip } from '@/components/ui/indicators'
import { cut } from '@/components/ui/tokens.tsx'
import { useNavigate } from '@/lib/router'
import { useKey } from '@/lib/hooks'
import { BOOT_SEQUENCE, SYSTEM_STATUS_ROWS } from '@/data'

const FEATURES = [
  {
    no: '01',
    map: 'SHIELD_16',
    title: 'BEHAVIORAL TWIN',
    body: 'Learns normal user behavior. Every identity gets a behavioural twin built from its own history — device, geography, rhythm, tempo and payment shape.',
  },
  {
    no: '02',
    map: 'RADAR_16',
    title: 'ADAPTIVE DECEPTION',
    body: 'Moves suspicious sessions into controlled environments. The attacker walks into a convincing shadow system while the real one stays untouched.',
  },
  {
    no: '03',
    map: 'SKULL_16',
    title: 'SECURITY VACCINATION',
    body: 'Learns from attacks and protects other identities. Every contained attack becomes a behavioural signature deployed across the whole population.',
  },
]

function Marquee() {
  const items = [
    'BEHAVIORAL IDENTITY INTELLIGENCE',
    'PROGRESSIVE TRUST REDUCTION',
    'ADAPTIVE DECEPTION LAYER',
    'CANARY CREDENTIAL TRAPS',
    'ATTACKTRACE EVIDENCE ENGINE',
    'SECURITY VACCINATION',
  ]
  const row = [...items, ...items]
  return (
    <div className="relative flex h-[22px] items-center overflow-hidden border-b border-[#121212] bg-[#070707]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, #5b72ff 0 6px, transparent 6px 14px)',
        }}
        aria-hidden
      />
      <div className="flex w-max shrink-0" style={{ animation: 'marquee-x 38s linear infinite' }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 gap-8" aria-hidden={copy === 1}>
            {row.map((t, i) => (
              <span key={i} className="flex items-center gap-8 font-mono text-[9px] tracking-[0.3em] text-[#3d3d3d]">
                {t}
                <span className="text-electric">■</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Landing() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'idle' | 'booting' | 'ready'>('idle')
  const [flash, setFlash] = useState(0)

  const launch = () => {
    if (phase !== 'idle') return
    setPhase('booting')
    setFlash((f) => f + 1)
  }

  useKey('Enter', launch, phase === 'idle')

  useEffect(() => {
    if (phase !== 'booting') return
    const total = BOOT_SEQUENCE.length * 320 + 700
    const t1 = window.setTimeout(() => setPhase('ready'), total)
    const t2 = window.setTimeout(() => navigate('/console'), total + 900)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [phase, navigate])

  return (
    <div className="crt-screen relative min-h-screen overflow-hidden bg-void text-bone">
      <CrtOverlay />
      <CrtFlash trigger={flash} />

      {/* ambient field */}
      <div className="pointer-events-none absolute inset-0 pixel-grid opacity-70" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 34%, rgba(24,56,255,0.10) 0%, transparent 58%), radial-gradient(70% 50% at 50% 100%, rgba(24,56,255,0.06) 0%, transparent 60%)',
        }}
        aria-hidden
      />

      <Marquee />

      {/* corner registration marks */}
      {[
        'left-3 top-7 border-l border-t',
        'right-3 top-7 border-r border-t',
        'left-3 bottom-3 border-b border-l',
        'right-3 bottom-3 border-b border-r',
      ].map((cls) => (
        <span key={cls} className={`pointer-events-none absolute h-3 w-3 border-[#1c2a6a] ${cls}`} aria-hidden />
      ))}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-22px)] max-w-[1100px] flex-col items-center justify-center px-5 py-10">
        {/* top system line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8 flex w-full items-center justify-between font-mono text-[9px] tracking-[0.24em] text-[#3d3d3d]"
        >
          <span>IDENTITYTWIN SECURITY OS · BUILD 20261003</span>
          <span className="flex items-center gap-2 text-warn">
            <span className="h-[6px] w-[6px] bg-warn" aria-hidden />
            SIMULATION ENVIRONMENT · SYNTHETIC DATA
          </span>
          <span className="hidden sm:inline">NODE 01 / SFO-3</span>
        </motion.div>

        {/* logo */}
        <motion.h1
          initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glitch text-center font-pixel-md leading-[1.9] text-bone sm:font-pixel-lg"
          data-text="IDENTITYTWIN"
          style={{
            letterSpacing: '0.06em',
            textShadow: '0 0 2px rgba(245,245,245,0.6), 0 0 22px rgba(36,75,255,0.55), 0 0 60px rgba(24,56,255,0.3)',
          }}
        >
          <span className="text-soft">IDENTITY</span>
          <span className="text-bone">TWIN</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-4 flex items-center gap-3"
        >
          <span className="h-px w-8 bg-electric" aria-hidden />
          <span className="font-pixel-xs text-soft sm:text-[9px]">BEHAVIORAL IDENTITY INTELLIGENCE</span>
          <span className="h-px w-8 bg-electric" aria-hidden />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-[520px] text-center font-mono text-[12px] leading-relaxed text-ash"
        >
          “Passwords authenticate who you are.
          <br />
          <span className="text-bone">IdentityTwin learns how you behave.</span>”
        </motion.p>

        {/* system status */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62 }}
          className="mt-9 w-full max-w-[440px]"
          style={{ ...cut('md'), background: '#1b3ba8', padding: 1 }}
        >
          <div className="px-4 py-3.5" style={{ ...cut('md'), background: '#0a0a0a' }}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-pixel-xs text-ash">SYSTEM STATUS</span>
              <span className="font-mono text-[9px] text-muted">5 MODULES</span>
            </div>
            <div className="mb-2.5 h-px bg-[#1a1a1a]" />
            <ul>
              {SYSTEM_STATUS_ROWS.map((r, i) => (
                <motion.li
                  key={r.label}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.09 }}
                  className="flex items-center justify-between py-[3px] font-mono text-[11px]"
                >
                  <span className="text-muted">{r.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-ok" style={{ textShadow: '0 0 10px rgba(53,255,114,0.5)' }}>
                      {r.value}
                    </span>
                    <StatusPip tone={r.tone} size={5} />
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* feature blocks */}
        <div className="mt-8 grid w-full gap-3 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.no}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95 + i * 0.12 }}
              className="group relative text-left"
              style={{ ...cut('md'), background: '#1b3ba8', padding: 1 }}
            >
              <div
                className="relative h-full px-4 py-4 transition-colors duration-300 group-hover:bg-[#0e0e12]"
                style={{ ...cut('md'), background: '#0a0a0a' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <PixelGlyph map={f.map} color="#5b72ff" px={1.6} glow="rgba(36,75,255,0.45)" animated={false} />
                  <span className="font-mono text-[9px] text-[#2f2f2f]">{f.no}</span>
                </div>
                <h3 className="mt-4 font-pixel-xs text-bone">{f.title}</h3>
                <p className="mt-2.5 font-mono text-[10px] leading-relaxed text-muted">{f.body}</p>
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-electric transition-transform duration-300 group-hover:scale-x-100"
                  style={{ boxShadow: '0 0 10px rgba(36,75,255,0.8)' }}
                  aria-hidden
                />
              </div>
            </motion.article>
          ))}
        </div>

        {/* launch */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35 }}
          className="mt-10 flex flex-col items-center gap-4"
        >
          <TerminalButton
            label="LAUNCH SECURITY CONSOLE"
            tone="blue"
            size="lg"
            active
            onClick={launch}
            className="glow-blue"
          />
          <div className="font-mono text-[11px] tracking-[0.2em] text-ash">
            <PromptLine>PRESS ENTER TO INITIALIZE</PromptLine>
          </div>
          <p className="max-w-[560px] text-center font-mono text-[9px] leading-relaxed tracking-[0.12em] text-[#3d3d3d]">
            DEMONSTRATION ENVIRONMENT · ALL IDENTITIES, SESSIONS, PAYEES AND AMOUNTS ARE SYNTHETIC. NO REAL
            ACCOUNTS, PAYMENTS OR CREDENTIALS ARE INVOLVED.
          </p>
        </motion.div>
      </div>

      {/* boot overlay */}
      <AnimatePresence>
        {phase !== 'idle' && (
          <motion.div
            className="fixed inset-0 z-[260] flex items-center justify-center bg-[#030303] px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pointer-events-none absolute inset-0 pixel-grid opacity-40" aria-hidden />
            <div className="relative w-full max-w-[520px]">
              <div className="mb-5 flex items-center gap-2">
                <Caret tone="soft" />
                <span className="font-pixel-xs text-ash">IDENTITYTWIN BOOT</span>
              </div>
              <TerminalLoader
                lines={BOOT_SEQUENCE.map((line, i) => ({ label: line, dur: 240 + i * 60 }))}
              />
              <div className="mt-6 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-[#3d3d3d]">
                <span>CORE · BEHAVIOR · THREAT · DECEPTION · TRACE</span>
                <span className={phase === 'ready' ? 'text-ok' : 'text-muted'}>
                  {phase === 'ready' ? 'HANDOFF TO CONSOLE' : 'LOADING'}
                </span>
              </div>
              {phase === 'ready' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 flex items-center gap-2 font-pixel-xs text-ok"
                >
                  <StatusPip tone="ok" />
                  TRANSFERRING TO COMMAND CENTER
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}