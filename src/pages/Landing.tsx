/* ==========================================================================
   LANDING — the premium product surface.

   Black / white / acid lime, oversized typography, floating data cards and a
   behavioural identity network. Deliberately NOT a terminal: the retro SOC
   vocabulary is reserved for the security console the visitor opts into.
   ========================================================================== */

import { useCallback, useState } from 'react'
import { LandingNav } from '@/components/landing/LandingNav'
import { Hero } from '@/components/landing/Hero'
import { MetricsStrip, HowItWorks, SecuritySection, AttackSection } from '@/components/landing/Bands'
import { FeatureGrid, TwinSection, DecoySection } from '@/components/landing/Showcase'
import { FinalCta, LandingFooter, LoginDialog } from '@/components/landing/Close'
import { BootSequence } from '@/components/boot/BootSequence'
import { useNavigate } from '@/lib/router'

export function Landing() {
  const navigate = useNavigate()
  const [booting, setBooting] = useState(false)
  const [login, setLogin] = useState(false)

  const enterConsole = useCallback(() => {
    setLogin(false)
    window.scrollTo({ top: 0 })
    setBooting(true)
  }, [])

  const handoff = useCallback(() => {
    setBooting(false)
    navigate('/console')
  }, [navigate])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-void text-bone" style={{ background: '#050505' }}>
      <LandingNav onEnterConsole={enterConsole} onOpenLogin={() => setLogin(true)} />

      <main>
        <Hero onEnterConsole={enterConsole} />
        <MetricsStrip />
        <HowItWorks />
        <FeatureGrid />
        <TwinSection />
        <SecuritySection />
        <DecoySection onEnterConsole={enterConsole} />
        <AttackSection onLaunch={enterConsole} />
        <FinalCta onLaunch={enterConsole} />
      </main>

      <LandingFooter onEnterConsole={enterConsole} onOpenLogin={() => setLogin(true)} />

      <LoginDialog open={login} onClose={() => setLogin(false)} onEnterConsole={enterConsole} />

      {booting && <BootSequence onDone={handoff} />}
    </div>
  )
}