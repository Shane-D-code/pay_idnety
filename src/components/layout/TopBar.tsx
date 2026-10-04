import { useEffect, useState } from 'react'
import { ROUTES, useRouter } from '@/lib/router'
import { useSim } from '@/sim/SimulationProvider'
import { Badge, StatusPip } from '@/components/ui/indicators'
import { DemoControl } from './DemoControl'
import { Caret } from '@/components/ui/TypeLine'

const TITLES: Record<string, string> = {
  '/': 'SYSTEM ENTRY',
  '/console': 'SECURITY COMMAND CENTER',
  '/identity': 'IDENTITY TWIN // ADWIKA JAISWAL',
  '/sessions': 'LIVE SESSION MONITOR',
  '/simulation': 'ATTACK SIMULATION',
  '/attacktrace': 'ATTACKTRACE // SESSION S-84729',
  '/deception': 'ADAPTIVE DECEPTION',
  '/incidents': 'INCIDENT // #INC-84729',
  '/vaccination': 'SECURITY VACCINATION',
}

function useClock() {
  const [t, setT] = useState(() => new Date().toLocaleTimeString('en-GB', { hour12: false }))
  useEffect(() => {
    const id = window.setInterval(
      () => setT(new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })),
      1000,
    )
    return () => window.clearInterval(id)
  }, [])
  return t
}

export function TopBar({ crt, onToggleCrt }: { crt: boolean; onToggleCrt: () => void }) {
  const { path } = useRouter()
  const sim = useSim()
  const clock = useClock()
  const route = ROUTES.find((r) => r.path === path)

  return (
    <header className="sticky top-0 z-30 border-b border-[#1a1a1a] bg-abyss/92 backdrop-blur-[2px] lg:top-0">
      <div className="pointer-events-none absolute inset-0 pixel-grid opacity-30" aria-hidden />

      <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2.5 lg:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden font-pixel-xs text-soft sm:inline">IDENTITYTWIN</span>
          <span className="hidden text-[#2a2a2a] sm:inline">//</span>
          <h1 className="truncate font-pixel-xs text-bone">{TITLES[path] ?? 'SECURITY OS'}</h1>
          {route && <Badge tone="neutral" className="hidden md:inline-flex">{route.label}</Badge>}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="hidden items-center gap-4 xl:flex">
            <span className="flex items-center gap-2">
              <StatusPip tone={sim.canaryTriggered ? 'crit' : 'ok'} size={5} />
              <span className="font-mono text-[10px] tracking-[0.16em] text-ash">
                {sim.canaryTriggered ? 'SYSTEM BREACH CONTAINED' : 'SYSTEM ONLINE'}
              </span>
            </span>
            <span className="font-mono text-[10px] tracking-[0.16em] text-muted">
              LAST SYNC <span className="tnum text-ash">09:42:31</span>
            </span>
            <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] text-warn">
              SIMULATION MODE
            </span>
          </div>

          <span className="font-mono text-[11px] tnum text-ash">{clock}</span>
          <DemoControl crt={crt} onToggleCrt={onToggleCrt} />
        </div>
      </div>

      {/* simulation / synthetic-data disclosure strip */}
      <div
        className="relative flex flex-wrap items-center justify-between gap-2 overflow-hidden border-t border-[#141414] px-3 py-[5px] lg:px-5"
        style={{ background: 'rgba(255,212,59,0.035)' }}
      >
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'repeating-linear-gradient(-45deg, #ffd43b 0 6px, transparent 6px 14px)',
          }}
          aria-hidden
        />
        <span className="relative font-mono text-[9px] tracking-[0.2em] text-warn">
          SIMULATION ENVIRONMENT · SYNTHETIC DATA
        </span>
        <span className="relative font-mono text-[9px] tracking-[0.16em] text-[#5a5a5a]">
          DEMO IDENTITIES, SESSIONS AND AMOUNTS ARE FABRICATED — NOT REAL ACCOUNTS OR PAYMENTS
        </span>
        {sim.stage > 0 && (
          <span className="relative flex items-center gap-2 font-mono text-[9px] tracking-[0.16em] text-crit">
            <span className="blink h-[8px] w-[8px] bg-crit" />
            LIVE INCIDENT S-84729 · STAGE {String(sim.stage).padStart(2, '0')}
          </span>
        )}
      </div>
    </header>
  )
}

export function BottomStatus({ onOpenTrace }: { onOpenTrace?: () => void }) {
  const sim = useSim()
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 hidden border-t border-[#141414] bg-abyss/85 lg:block">
      <div className="pointer-events-auto flex items-center justify-between gap-4 px-5 py-[6px]">
        <span className="flex items-center gap-3 font-mono text-[9px] tracking-[0.18em] text-[#4a4a4a]">
          <span>IDENTITYTWIN v4.2.0 · BUILD 20261003</span>
          <span className="text-[#2a2a2a]">│</span>
          <span>ENGINES: CORE · BEHAVIOR · THREAT · DECEPTION · TRACE</span>
        </span>
        <span className="flex items-center gap-4 font-mono text-[9px] tracking-[0.18em] text-[#4a4a4a]">
          <span>
            TRUST <span className="tnum text-ash">{sim.trustScore}</span>
          </span>
          <span>
            RISK{' '}
            <span className="tnum" style={{ color: sim.riskScore > 80 ? '#ff3344' : '#a8a8a8' }}>
              {sim.riskScore}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Caret tone="ok" />
            LINK STABLE
          </span>
          {onOpenTrace && (
            <button
              type="button"
              onClick={onOpenTrace}
              className="pointer-events-auto cursor-pointer font-mono text-[9px] tracking-[0.18em] text-soft hover:text-bone"
            >
              VIEW ATTACKTRACE ›
            </button>
          )}
        </span>
      </div>
    </div>
  )
}