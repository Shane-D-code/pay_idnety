/* ==========================================================================
   HERO — oversized fintech typography, then the behavioural identity graph
   floating beneath it. This is the single most important screen in the demo.
   ========================================================================== */

import { motion } from 'framer-motion'
import { Arrow, GhostButton, LimeButton, Ring } from './kit'
import { BehaviorNetwork } from './BehaviorNetwork'
import { HeroFloatCards, SignalCard } from './HeroFloatCards'
import { scrollToSection } from './LandingNav'

export function Hero({ onEnterConsole }: { onEnterConsole: () => void }) {
  return (
    <section className="relative overflow-hidden pt-[132px] lg:pt-[150px]">
      {/* ambient field */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 rule-grid opacity-45" />
        <div
          className="bloom bloom-pulse left-1/2 top-[6%] h-[520px] w-[900px] -translate-x-1/2"
          style={{ background: 'rgba(184,255,61,0.11)' }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[240px]"
          style={{ background: 'linear-gradient(to bottom,transparent,#050505)' }}
        />
      </div>

      <div className="mx-auto max-w-[1560px] px-6 lg:px-10">
        {/* badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-3.5 py-2 pl-3 pr-5"
          style={{ border: '1px solid rgba(184,255,61,0.28)', borderRadius: 999, background: 'rgba(184,255,61,0.05)' }}
        >
          <span className="relative inline-flex h-[7px] w-[7px]">
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: '#B8FF3D' }}
              animate={{ scale: [1, 2.8], opacity: [0.65, 0] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut' }}
            />
            <span className="relative h-full w-full rounded-full" style={{ background: '#B8FF3D' }} aria-hidden />
          </span>
          <span className="font-mono text-[9.5px] uppercase leading-[1.55] tracking-[0.26em] text-[#D5FF72]">
            AI-Powered Security
            <span className="ml-2 text-[#7f8a70]">·</span>
            <span className="ml-2 text-[#9aa3b5]">Behavioral Identity Intelligence</span>
          </span>
        </motion.div>

        {/* headline */}
        <h1 className="headline mt-9 max-w-[1240px] text-[clamp(44px,7.6vw,116px)]">
          <span className="block" style={{ color: '#F5F5F5' }}>
            Your identity
          </span>
          <span className="block" style={{ color: '#F5F5F5' }}>
            is more than
          </span>
          <span className="block">
            <span style={{ color: '#8e8e8e' }}>a</span>{' '}
            <span className="lime-text">password</span>
            <span style={{ color: '#F5F5F5' }}>.</span>
          </span>
        </h1>

        {/* supporting + CTAs */}
        <div className="mt-11 grid gap-10 lg:grid-cols-[minmax(0,560px)_1fr] lg:items-start">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="max-w-[520px] text-[15.5px] leading-[1.75] text-[#8f8f8f]"
            >
              IdentityTwin learns how legitimate users behave, detects behavioral divergence, progressively
              reduces trust, and contains attackers before they can reach real resources.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <LimeButton size="lg" onClick={onEnterConsole}>
                Enter Security Console
                <Arrow />
              </LimeButton>
              <GhostButton size="lg" onClick={() => scrollToSection('how')}>
                See How It Works
                <Ring />
              </GhostButton>
            </motion.div>
          </div>

          {/* credibility strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.8 }}
            className="grid grid-cols-3 gap-px self-stretch overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {[
              { v: '74', k: 'SESSIONS MODELLED', s: 'PER IDENTITY' },
              { v: '214', k: 'SIGNALS PER TWIN', s: 'PER IDENTITY' },
              { v: '1.8s', k: 'TO CONTAINMENT', s: 'MEDIAN' },
            ].map((m) => (
              <div key={m.k} className="px-5 py-6" style={{ background: '#080808' }}>
                <div className="font-sans text-[30px] font-bold leading-none tracking-[-0.03em] text-[#F5F5F5]">{m.v}</div>
                <div className="mt-2.5 font-mono text-[8.5px] uppercase leading-[1.7] tracking-[0.2em] text-[#7d7d7d]">
                  {m.k}
                  <span className="block text-lime/70">{m.s}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* the graph stage */}
        <div className="relative mt-16 lg:mt-20">
          <div className="grid items-center gap-10 xl:grid-cols-[1fr_336px]">
            <div className="relative mx-auto w-full max-w-[1000px] pb-24 xl:pb-0">
              <BehaviorNetwork />
              <HeroFloatCards />
            </div>

            <SignalCard className="xl:sticky xl:top-24" />
          </div>
        </div>
      </div>
    </section>
  )
}