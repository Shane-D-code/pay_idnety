/* ==========================================================================
   LANDING NAVIGATION — minimal, translucent, dark. Every item scrolls to a
   real section on this page; "Attack Intelligence" is a live link because it
   describes a console capability rather than a marketing claim.
   ========================================================================== */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Arrow } from './kit'

const LINKS = [
  { label: 'Platform', target: 'platform' },
  { label: 'How It Works', target: 'how' },
  { label: 'Behavioral Twin', target: 'twin' },
  { label: 'Deception', target: 'deception' },
  { label: 'Security', target: 'security' },
  { label: 'Attack Intelligence', target: 'attack' },
]

export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 78
  window.scrollTo({ top, behavior: 'smooth' })
}

export function LandingNav({
  onEnterConsole,
  onOpenLogin,
}: {
  onEnterConsole: () => void
  onOpenLogin: () => void
}) {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed inset-x-0 top-0 z-[220] transition-colors duration-500"
      style={{
        background: solid ? 'rgba(5,5,5,0.82)' : 'rgba(5,5,5,0.35)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        borderBottom: `1px solid ${solid ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
      }}
    >
      <nav className="mx-auto flex h-[68px] max-w-[1560px] items-center justify-between gap-6 px-6 lg:px-10">
        {/* wordmark */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span
            className="relative flex h-[26px] w-[26px] items-center justify-center"
            style={{ border: '1px solid rgba(184,255,61,0.45)', borderRadius: 5, background: 'rgba(184,255,61,0.06)' }}
            aria-hidden
          >
            <span
              className="h-[8px] w-[8px] transition-transform duration-500 group-hover:rotate-45"
              style={{ background: '#B8FF3D', boxShadow: '0 0 12px rgba(184,255,61,0.9)' }}
            />
          </span>
          <span className="font-sans text-[15px] font-extrabold uppercase tracking-[0.16em] text-[#F5F5F5]">
            Identity<span className="lime-text">Twin</span>
          </span>
        </button>

        {/* desktop links */}
        <ul className="hidden items-center gap-1 xl:flex">
          {LINKS.map((l) => (
            <li key={l.target}>
              <button
                type="button"
                onClick={() => scrollToSection(l.target)}
                className="relative px-3.5 py-2 font-sans text-[12.5px] font-medium text-[#9a9a9a] transition-colors duration-300 hover:text-[#F5F5F5]"
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        {/* actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenLogin}
            className="hidden px-4 py-2.5 font-sans text-[12.5px] font-medium text-[#c9c9c9] transition-colors hover:text-[#F5F5F5] sm:block"
          >
            Log In
          </button>

          <button
            type="button"
            onClick={onEnterConsole}
            className="group hidden h-[42px] items-center gap-2.5 px-5 font-sans text-[11.5px] font-bold uppercase tracking-[0.12em] transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(184,255,61,0.6)] sm:inline-flex"
            style={{ background: '#B8FF3D', color: '#050505' }}
          >
            Enter Security Console
            <Arrow />
          </button>

          {/* mobile trigger */}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
            aria-expanded={open}
            className="flex h-[42px] w-[42px] items-center justify-center xl:hidden"
            style={{ border: '1px solid rgba(255,255,255,0.14)', borderRadius: 6 }}
          >
            <span className="flex flex-col gap-[4px]">
              <span className="block h-[1.5px] w-[16px] bg-[#F5F5F5]" />
              <span className="block h-[1.5px] w-[16px] bg-[#F5F5F5]" />
              <span className="block h-[1.5px] w-[16px] bg-[#F5F5F5]" />
            </span>
          </button>
        </div>
      </nav>

      {/* mobile sheet */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden xl:hidden"
          style={{ background: 'rgba(5,5,5,0.97)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <ul className="px-6 py-3">
            {LINKS.map((l) => (
              <li key={l.target} className="border-b border-white/[0.05] last:border-b-0">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    scrollToSection(l.target)
                  }}
                  className="w-full py-3.5 text-left font-sans text-[14px] font-medium text-[#c9c9c9]"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-2 gap-2 px-6 pb-5">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onOpenLogin()
              }}
              className="h-[46px] font-sans text-[12px] font-medium text-[#F5F5F5]"
              style={{ border: '1px solid rgba(255,255,255,0.14)', borderRadius: 6 }}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onEnterConsole()
              }}
              className="h-[46px] font-sans text-[11.5px] font-bold uppercase tracking-[0.1em]"
              style={{ background: '#B8FF3D', color: '#050505', borderRadius: 6 }}
            >
              Console
            </button>
          </div>
        </motion.div>
      )}
    </header>
  )
}