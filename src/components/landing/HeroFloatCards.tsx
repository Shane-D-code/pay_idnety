/* ==========================================================================
   HERO FLOATING CARDS — the data layer that floats around the identity graph.
   Small lime-accented profile cards, plus the red behavioural-signal card that
   states the product's whole thesis in one glance.
   ========================================================================== */

import { motion } from 'framer-motion'

/* --------------------------------------------------------- profile cards */

interface FloatCardProps {
  label: string
  value: string
  sub?: string
  /** absolute placement on ≥1280px, grid cell below that */
  pos: string
  delay?: number
  float?: boolean
  accent?: 'lime' | 'plain'
}

function FloatCard({ label, value, sub, pos, delay = 0, float = true, accent = 'lime' }: FloatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-card pointer-events-none relative px-4 py-3 ${pos} ${float ? 'xl:float-slow' : ''}`}
      style={{ borderRadius: 4 }}
    >
      <div className="font-mono text-[8.5px] uppercase tracking-[0.26em] text-[#6f6f6f]">{label}</div>
      <div
        className="mt-1.5 font-sans text-[19px] font-semibold leading-none tracking-[-0.01em]"
        style={{ color: accent === 'lime' ? '#D5FF72' : '#F5F5F5' }}
      >
        {value}
      </div>
      {sub ? <div className="mt-1.5 font-mono text-[8.5px] uppercase tracking-[0.18em] text-[#5a5a5a]">{sub}</div> : null}
    </motion.div>
  )
}

export function HeroFloatCards() {
  return (
    <div className="pointer-events-none relative z-20 mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:mt-0 xl:block">
      <FloatCard label="TRUST SCORE" value="96" sub="BASELINE CONFIDENCE" pos="xl:absolute xl:left-0 xl:top-[6%]" delay={0.55} />
      <FloatCard
        label="NORMAL LOCATION"
        value="BANGALORE"
        sub="HOME GEO · 74 SESSIONS"
        pos="xl:absolute xl:right-[2%] xl:top-[-2%]"
        delay={0.7}
        float={false}
      />
      <FloatCard
        label="NORMAL DEVICE"
        value="MAC"
        sub="+ IPHONE 14"
        pos="xl:absolute xl:left-[3%] xl:bottom-[16%]"
        delay={0.85}
      />
      <FloatCard
        label="TYPICAL SESSION"
        value="12 MIN"
        sub="MEDIAN 11M 48S"
        pos="xl:absolute xl:right-[-1%] xl:bottom-[20%]"
        delay={1}
        float={false}
      />
      <FloatCard
        label="NORMAL PAYOUT"
        value="₹2K–₹8K"
        sub="6 KNOWN PAYEES"
        pos="xl:absolute xl:left-[16%] xl:bottom-[-4%]"
        delay={1.15}
      />
    </div>
  )
}

/* ------------------------------------------------ behavioural signal card */

const SIGNAL_ROWS = [
  { k: 'DEVICE', v: 'UNKNOWN WINDOWS DEVICE', hot: true },
  { k: 'LOCATION', v: 'DELHI', hot: true },
  { k: 'TIME', v: '03:17 AM', hot: true },
] as const

export function SignalCard({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 1.25, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-card relative overflow-hidden ${className}`}
      style={{ borderRadius: 5 }}
    >
      {/* red top edge — the only hostile colour on the landing page */}
      <span
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg,#FF3344,#FF6B78)', boxShadow: '0 0 14px rgba(255,51,68,0.75)' }}
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full"
        style={{ background: 'radial-gradient(circle,rgba(255,51,68,0.20),transparent 70%)', filter: 'blur(24px)' }}
        aria-hidden
      />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[8.5px] uppercase tracking-[0.26em] text-[#8a8a8a]">
              BEHAVIORAL SIGNAL DETECTED
            </div>
            <div className="mt-2 font-sans text-[17px] font-bold leading-none tracking-[-0.01em] text-[#F5F5F5]">
              ADWIKA
            </div>
            <div className="mt-1 font-mono text-[9.5px] tracking-[0.16em] text-[#858585]">SESSION #84729</div>
          </div>

          <div className="text-right">
            <div className="font-mono text-[8.5px] uppercase tracking-[0.24em] text-[#8a8a8a]">RISK</div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="font-sans text-[34px] font-extrabold leading-none tracking-[-0.04em]"
              style={{ color: '#FF3344', textShadow: '0 0 24px rgba(255,51,68,0.45)' }}
            >
              91
              <span className="ml-1 text-[13px] font-medium text-[#6a3a3f]">/100</span>
            </motion.div>
          </div>
        </div>

        <div className="mt-4 h-[3px] w-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="h-full"
            style={{ background: 'linear-gradient(90deg,#FFD43B,#FF3344)', boxShadow: '0 0 10px rgba(255,51,68,0.8)' }}
            initial={{ width: '0%' }}
            animate={{ width: '91%' }}
            transition={{ delay: 1.5, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <dl className="mt-4 space-y-2.5">
          {SIGNAL_ROWS.map((r) => (
            <div key={r.k} className="flex items-baseline justify-between gap-4">
              <dt className="font-mono text-[8.5px] uppercase tracking-[0.24em] text-[#6f6f6f]">{r.k}</dt>
              <dd className="text-right font-mono text-[10px] tracking-[0.1em]" style={{ color: r.hot ? '#FF7B84' : '#F5F5F5' }}>
                {r.v}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex items-center gap-2 border-t border-white/[0.07] pt-3.5">
          <span className="relative inline-flex h-[7px] w-[7px]">
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: '#FF3344' }}
              animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
            <span className="relative h-full w-full rounded-full" style={{ background: '#FF3344' }} aria-hidden />
          </span>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.26em]" style={{ color: '#FF6B78' }}>
            High Risk
          </span>
          <span className="ml-auto font-mono text-[9px] tracking-[0.16em] text-[#5f5f5f]">TRUST 96 → 09</span>
        </div>
      </div>
    </motion.div>
  )
}