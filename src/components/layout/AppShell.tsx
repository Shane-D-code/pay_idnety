import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CrtOverlay } from '@/components/crt/CrtOverlay'
import { CanaryAlert } from '@/components/ui/CanaryAlert'
import { Sidebar } from './Sidebar'
import { BottomStatus, TopBar } from './TopBar'
import { useNavigate, useRouter } from '@/lib/router'

const pageVariants = {
  initial: { opacity: 0, clipPath: 'inset(0% 100% 0% 0%)', filter: 'brightness(1.5)' },
  animate: { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', filter: 'brightness(1)' },
  exit: { opacity: 0, clipPath: 'inset(0% 0% 0% 100%)', filter: 'brightness(1.35)' },
}

/** Section 37 — page changes feel like an old machine switching programs. */
export function PageShell({ children }: { children: ReactNode }) {
  const { path } = useRouter()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [path])

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={path}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${path}-sweep`}
          className="pointer-events-none fixed inset-x-0 top-0 z-[250] h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, #5b72ff, transparent)', boxShadow: '0 0 14px rgba(91,114,255,0.9)' }}
          initial={{ top: '0%', opacity: 0.9 }}
          animate={{ top: '100%', opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: 'easeInOut' }}
        />
      </AnimatePresence>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const [crt, setCrt] = useState(true)
  const navigate = useNavigate()

  return (
    <div className="crt-screen min-h-screen bg-void text-bone">
      <CrtOverlay enabled={crt} />
      <Sidebar />
      <div className="relative lg:pl-[236px]">
        <TopBar crt={crt} onToggleCrt={() => setCrt((c) => !c)} />
        <main className="px-3 pb-16 pt-4 lg:px-5 lg:pb-10">
          <PageShell>{children}</PageShell>
        </main>
      </div>
      <BottomStatus onOpenTrace={() => navigate('/attacktrace')} />
      <CanaryAlert />
    </div>
  )
}