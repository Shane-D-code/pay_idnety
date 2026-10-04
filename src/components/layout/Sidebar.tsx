import { motion } from 'framer-motion'
import { ROUTES, useRouter } from '@/lib/router'
import { useSim, TOTAL_STAGES } from '@/sim/SimulationProvider'
import { NavRow } from '@/components/ui/TerminalButton'
import { Badge, StatusPip } from '@/components/ui/indicators'
import { BrandMark } from './BrandMark'

function RailFooter() {
  const { stage, simulationRunning } = useSim()
  const pct = Math.round((stage / TOTAL_STAGES) * 100)
  return (
    <div className="mt-auto border-t border-[#1a1a1a] px-3 py-3">
      <div className="flex items-center justify-between">
        <span className="font-pixel-xs text-muted">SYSTEM</span>
        <span className="flex items-center gap-2">
          <StatusPip tone="ok" />
          <span className="font-pixel-xs text-ok">ONLINE</span>
        </span>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="font-pixel-xs text-muted">MODE</span>
        <span className="font-pixel-xs text-warn">SIMULATION ENVIRONMENT</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-pixel-xs text-muted">DATA</span>
        <span className="font-pixel-xs text-soft">SYNTHETIC DATA</span>
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-[9px] tracking-[0.14em] text-[#3d3d3d]">
        <span>
          ENGINE {String(stage).padStart(2, '0')}/{TOTAL_STAGES}
        </span>
        <span className={simulationRunning ? 'text-soft' : 'text-[#3d3d3d]'}>
          {simulationRunning ? '●REC' : '■IDLE'}
        </span>
      </div>
      <div className="mt-2 h-[3px] w-full overflow-hidden bg-[#151515]">
        <motion.div
          className="h-full bg-soft"
          animate={{ width: `${Math.max(4, pct)}%` }}
          transition={{ duration: 0.5 }}
          style={{ boxShadow: '0 0 8px rgba(91,114,255,0.8)' }}
        />
      </div>
    </div>
  )
}

function NavList({ compact = false }: { compact?: boolean }) {
  const { path, navigate } = useRouter()
  return (
    <nav className="flex flex-col" aria-label="Primary">
      {ROUTES.map((r, i) => (
        <NavRow
          key={r.path}
          active={path === r.path}
          glyph={r.glyph}
          index={String(i + 1).padStart(2, '0')}
          onClick={() => navigate(r.path)}
        >
          {compact ? r.short : r.label}
        </NavRow>
      ))}
    </nav>
  )
}

export function Sidebar() {
  const { stage } = useSim()
  return (
    <>
      {/* desktop rail */}
      <aside
        className="fixed inset-y-0 left-0 z-40 hidden w-[236px] flex-col border-r border-[#1a1a1a] bg-abyss lg:flex"
        style={{ boxShadow: 'inset -18px 0 34px rgba(0,0,0,0.75)' }}
      >
        <div className="pointer-events-none absolute inset-0 pixel-grid opacity-60" aria-hidden />

        <div className="relative flex items-center gap-2.5 border-b border-[#1a1a1a] px-3.5 py-3.5">
          <BrandMark size={26} />
          <div className="min-w-0">
            <div
              className="font-pixel-xs leading-[1.6] text-bone"
              style={{ textShadow: '0 0 12px rgba(91,114,255,0.55)' }}
            >
              IDENTITYTWIN
            </div>
            <div className="mt-[3px] font-mono text-[9px] tracking-[0.28em] text-muted">SECURITY OS</div>
          </div>
        </div>

        <div className="relative flex items-center gap-2 border-b border-[#151515] px-3.5 py-2">
          <span className="font-mono text-[9px] tracking-[0.2em] text-[#3d3d3d]">NAVIGATION</span>
          <span className="h-px flex-1 bg-[#181818]" />
          <span className="font-mono text-[9px] text-[#3d3d3d]">08 MODULES</span>
        </div>

        <div className="relative flex-1 overflow-y-auto py-2">
          <NavList />
          {stage > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="mx-3 mt-3 border border-[#8a1e28] px-2 py-1.5"
              style={{ background: 'rgba(255,51,68,0.06)' }}
            >
              <div className="font-pixel-xs text-crit">LIVE INCIDENT</div>
              <div className="mt-1 font-mono text-[9px] text-ash">S-84729 · STAGE {String(stage).padStart(2, '0')}</div>
            </motion.div>
          )}
        </div>

        <RailFooter />
      </aside>

      {/* mobile / tablet top navigation */}
      <div className="sticky top-0 z-40 border-b border-[#1a1a1a] bg-abyss/95 backdrop-blur-[2px] lg:hidden">
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <BrandMark size={22} />
            <div className="min-w-0">
              <div className="truncate font-pixel-xs text-bone">IDENTITYTWIN</div>
              <div className="font-mono text-[8px] tracking-[0.2em] text-muted">SECURITY OS</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge tone="warn">SIM</Badge>
            <StatusPip tone="ok" />
          </div>
        </div>
        <div className="no-scrollbar flex gap-0 overflow-x-auto border-t border-[#151515]">
          <NavList compact />
        </div>
      </div>
    </>
  )
}