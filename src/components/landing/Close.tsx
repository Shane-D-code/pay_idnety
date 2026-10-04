/* ==========================================================================
   LANDING CLOSE — the final launch panel, the footer, and the access dialog
   behind "Log In".
   ========================================================================== */

import { useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Arrow, Eyebrow, LimeButton, Reveal } from './kit'
import { scrollToSection } from './LandingNav'

/* ============================================================== final cta */

export function FinalCta({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="relative overflow-hidden py-32 lg:py-44">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="absolute inset-0 dot-field opacity-[0.28]"
          style={{ maskImage: 'radial-gradient(70% 60% at 50% 50%, #000 20%, transparent 78%)', WebkitMaskImage: 'radial-gradient(70% 60% at 50% 50%, #000 20%, transparent 78%)' }}
        />
        <div
          className="bloom bloom-pulse left-1/2 top-1/2 h-[440px] w-[760px] -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'rgba(184,255,61,0.10)' }}
        />
      </div>

      <div className="mx-auto max-w-[1560px] px-6 text-center lg:px-10">
        <Reveal>
          <div className="flex justify-center">
            <Eyebrow tone="lime">IdentityTwin</Eyebrow>
          </div>
        </Reveal>

        <h2 className="headline mx-auto mt-8 max-w-[1120px] text-[clamp(38px,6.6vw,96px)]">
          <span className="block" style={{ color: '#F5F5F5' }}>
            Don’t just detect
          </span>
          <span className="block">
            <span style={{ color: '#F5F5F5' }}>the attack.</span>{' '}
            <span className="lime-text">Learn from it.</span>
          </span>
        </h2>

        <Reveal i={1}>
          <p className="mx-auto mt-8 max-w-[560px] text-[15.5px] leading-[1.75] text-[#8f8f8f]">
            Every attack IdentityTwin contains becomes a signature that protects every other identity it knows.
            The system gets sharper the more it is attacked.
          </p>
        </Reveal>

        <Reveal i={2}>
          <div className="mt-12 flex justify-center">
            <LimeButton size="lg" onClick={onLaunch}>
              Launch IdentityTwin
              <Arrow />
            </LimeButton>
          </div>
        </Reveal>

        <Reveal i={3}>
          <div className="mt-7 font-mono text-[9.5px] uppercase tracking-[0.22em] text-[#5c5c5c]">
            Synthetic environment · no real accounts, payments or credentials are involved
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ================================================================= footer */

const FOOTER_COLS = [
  {
    title: 'PLATFORM',
    links: [
      { label: 'Behavioral Twin', go: 'twin' },
      { label: 'Adaptive Deception', go: 'deception' },
      { label: 'Progressive Trust', go: 'security' },
      { label: 'Attack Intelligence', go: 'attack' },
    ],
  },
  {
    title: 'CONSOLE',
    links: [
      { label: 'Command Center', go: 'console' },
      { label: 'Identity Twins', go: 'identity' },
      { label: 'Live Sessions', go: 'sessions' },
      { label: 'Incidents', go: 'incidents' },
      { label: 'Security Vaccination', go: 'vaccination' },
    ],
  },
]

export function LandingFooter({
  onEnterConsole,
  onOpenLogin,
}: {
  onEnterConsole: () => void
  onOpenLogin: () => void
}) {
  return (
    <footer className="border-t" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#070707' }}>
      <div className="mx-auto max-w-[1560px] px-6 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-[26px] w-[26px] items-center justify-center"
                style={{ border: '1px solid rgba(184,255,61,0.45)', borderRadius: 5, background: 'rgba(184,255,61,0.06)' }}
                aria-hidden
              >
                <span style={{ background: '#B8FF3D', boxShadow: '0 0 12px rgba(184,255,61,0.9)' }} className="h-[8px] w-[8px]" />
              </span>
              <span className="font-sans text-[15px] font-extrabold uppercase tracking-[0.16em] text-[#F5F5F5]">
                Identity<span className="lime-text">Twin</span>
              </span>
            </div>
            <p className="mt-5 max-w-[300px] text-[13px] leading-[1.75] text-[#6e6e6e]">
              Behavioral identity intelligence for products where a password is never going to be enough.
            </p>
          </div>

          {FOOTER_COLS.map((c) => (
            <div key={c.title}>
              <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-[#5f5f5f]">{c.title}</div>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <button
                      type="button"
                      onClick={() => (l.go === 'console' ? onEnterConsole() : scrollToSection(l.go))}
                      className="font-sans text-[13px] text-[#9a9a9a] transition-colors duration-300 hover:text-[#F5F5F5]"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-[#5f5f5f]">ACCESS</div>
            <ul className="mt-5 space-y-3">
              <li>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="font-sans text-[13px] text-[#9a9a9a] transition-colors duration-300 hover:text-[#F5F5F5]"
                >
                  Log In
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onEnterConsole}
                  className="font-sans text-[13px] text-[#9a9a9a] transition-colors duration-300 hover:text-[#F5F5F5]"
                >
                  Enter Security Console
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-14 flex flex-col gap-4 border-t pt-7 font-mono text-[9px] uppercase leading-[1.9] tracking-[0.16em] text-[#4f4f4f] sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <span>© 2026 IdentityTwin · Behavioral Identity Intelligence</span>
          <span>All identities, sessions, payees and amounts are synthetic</span>
        </div>
      </div>
    </footer>
  )
}

/* ================================================================ dialog */

export function LoginDialog({ open, onClose, onEnterConsole }: { open: boolean; onClose: () => void; onEnterConsole: () => void }) {
  const [email, setEmail] = useState('')
  const [access, setAccess] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!open) {
      setErr('')
      return
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setErr('ENTER A VALID EMAIL ADDRESS')
      return
    }
    if (access.trim().length < 6) {
      setErr('ACCESS KEY MUST BE AT LEAST 6 CHARACTERS')
      return
    }
    onClose()
    onEnterConsole()
  }

  const field = (v: string, set: (s: string) => void, placeholder: string, type = 'text') => (
    <input
      type={type}
      value={v}
      onChange={(e) => set(e.target.value)}
      placeholder={placeholder}
      className="h-[48px] w-full px-4 font-sans text-[13.5px] text-[#EDEDED] outline-none transition-colors placeholder:text-[#4f4f4f] focus:border-lime/60"
      style={{ background: '#0b0b0b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5 }}
    />
  )

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[420] flex items-center justify-center px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Close login"
            onClick={onClose}
            className="absolute inset-0 cursor-default"
            style={{ background: 'rgba(3,3,3,0.82)', backdropFilter: 'blur(8px)' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[420px]"
            style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
          >
            <span
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg,#B8FF3D,transparent)', boxShadow: '0 0 16px rgba(184,255,61,0.6)' }}
              aria-hidden
            />
            <form onSubmit={submit}>
              <div className="px-8 pb-8 pt-8">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-lime">Analyst access</span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-mono text-[10px] text-[#5f5f5f] transition-colors hover:text-[#F5F5F5]"
                  >
                    ESC
                  </button>
                </div>

                <h2 className="headline-tight mt-6 text-[26px]" style={{ color: '#F5F5F5' }}>
                  Log In
                </h2>
                <p className="mt-3 text-[12.5px] leading-[1.7] text-[#6f6f6f]">
                  Any valid address and access key opens the simulation console. No account is created.
                </p>

                <div className="mt-7 space-y-3">
                  {field(email, setEmail, 'analyst@identitytwin.io', 'email')}
                  {field(access, setAccess, 'ACCESS KEY', 'password')}
                </div>

                {err ? (
                  <div className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.18em]" style={{ color: '#FF6B78' }}>
                    {err}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="group mt-7 flex h-[50px] w-full items-center justify-center gap-2.5 font-sans text-[12.5px] font-bold uppercase tracking-[0.12em] text-[#050505] transition-all duration-300"
                  style={{ background: '#B8FF3D', borderRadius: 5, boxShadow: '0 10px 34px -14px rgba(184,255,61,0.75)' }}
                >
                  Enter Security Console
                  <Arrow />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('analyst@identitytwin.io')
                    setAccess('it-demo-2026')
                  }}
                  className="mt-3 w-full font-mono text-[9px] uppercase tracking-[0.18em] text-[#5f5f5f] transition-colors hover:text-[#B8FF3D]"
                >
                  autofill demo credentials
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}