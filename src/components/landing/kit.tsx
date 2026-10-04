/* ==========================================================================
   LANDING KIT — primitives for the premium marketing surface.
   Black / white / acid lime. Deliberately NOT the retro terminal language:
   that vocabulary is reserved for the security console.
   ========================================================================== */

import { motion, type Variants } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

/* ------------------------------------------------------------------ reveal */

const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
  }),
}

export function Reveal({
  children,
  i = 0,
  className = '',
}: {
  children: ReactNode
  i?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      variants={rise}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------- text */

export function Eyebrow({ children, tone = 'dim' }: { children: ReactNode; tone?: 'dim' | 'lime' }) {
  return (
    <span className="eyebrow inline-flex items-center gap-2.5" style={tone === 'lime' ? { color: '#B8FF3D' } : undefined}>
      <span className="h-[5px] w-[5px] rounded-full bg-current" aria-hidden />
      {children}
    </span>
  )
}

export function SectionHead({
  eyebrow,
  title,
  lede,
  align = 'left',
}: {
  eyebrow: string
  title: ReactNode
  lede?: string
  align?: 'left' | 'center'
}) {
  const isCenter = align === 'center'
  return (
    <div style={{ maxWidth: 880, marginInline: isCenter ? 'auto' : undefined }}>
      <Reveal>
        <Eyebrow tone="lime">{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal i={1}>
        <h2 className="headline mt-6 text-[clamp(34px,5.4vw,68px)]" style={{ color: '#F5F5F5' }}>
          {title}
        </h2>
      </Reveal>
      {lede ? (
        <Reveal i={2}>
          <p
            className="mt-6 max-w-[620px] text-[15px] leading-[1.75] text-[#858585]"
            style={{ marginInline: isCenter ? 'auto' : undefined }}
          >
            {lede}
          </p>
        </Reveal>
      ) : null}
    </div>
  )
}

/* ---------------------------------------------------------------- buttons */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  size?: 'md' | 'lg'
}

const BTN_BASE =
  'group relative inline-flex select-none items-center justify-center gap-2.5 overflow-hidden font-sans font-semibold uppercase tracking-[0.08em] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime'

const BTN_SIZE = {
  md: 'h-[46px] px-7 text-[12.5px]',
  lg: 'h-[58px] px-9 text-[13.5px]',
}

/** Primary — solid acid lime, black type. The single loudest element on a page. */
export function LimeButton({ children, size = 'md', className = '', ...rest }: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`${BTN_BASE} ${BTN_SIZE[size]} ${className}`}
      style={{ background: '#B8FF3D', color: '#050505', boxShadow: '0 10px 40px -14px rgba(184,255,61,0.75)' }}
    >
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-500 group-hover:translate-x-full"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)' }}
        aria-hidden
      />
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
    </button>
  )
}

/** Secondary — hairline outline, white type. */
export function GhostButton({ children, size = 'md', className = '', ...rest }: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      className={`${BTN_BASE} ${BTN_SIZE[size]} ${className}`}
      style={{ border: '1px solid rgba(255,255,255,0.16)', color: '#F5F5F5', background: 'rgba(255,255,255,0.015)' }}
    >
      <span
        className="relative z-10 flex items-center gap-2.5 transition-colors duration-300 group-hover:text-lime"
      >
        {children}
      </span>
    </button>
  )
}

/** Arrow that nudges on hover — used inside every CTA. */
export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg
      width="15"
      height="11"
      viewBox="0 0 15 11"
      fill="none"
      aria-hidden
      className={`transition-transform duration-300 group-hover:translate-x-1 ${className}`}
    >
      <path d="M0 5.5h13M9 1l4.5 4.5L9 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  )
}

export function Ring({ className = '' }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden className={className}>
      <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

/* ------------------------------------------------------------------ misc */

/** Thin divider that fades out to the right. */
export function FaintRule({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-px w-full ${className}`}
      style={{ background: 'linear-gradient(90deg,rgba(255,255,255,0.14),rgba(255,255,255,0.02) 60%,transparent)' }}
      aria-hidden
    />
  )
}