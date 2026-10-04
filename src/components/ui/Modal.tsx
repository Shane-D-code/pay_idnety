import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { cut } from './tokens'

/** Terminal modal: horizontal scan wipe in, CRT flicker, ESC to dismiss. */
export function Modal({
  open,
  onClose,
  children,
  width = 'max-w-[620px]',
  dismissable = true,
  z = 90,
}: {
  open: boolean
  onClose?: () => void
  children: ReactNode
  width?: string
  dismissable?: boolean
  z?: number
}) {
  useEffect(() => {
    if (!open || !dismissable || !onClose) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismissable, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: z }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          {/* backdrop with CRT wipe */}
          <motion.div
            className="absolute inset-0 bg-void/92 backdrop-blur-[1px]"
            onClick={dismissable ? onClose : undefined}
            initial={{ clipPath: 'inset(50% 0 50% 0)' }}
            animate={{ clipPath: 'inset(0% 0 0% 0)' }}
            exit={{ clipPath: 'inset(50% 0 50% 0)' }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.div
            className={`relative w-full ${width}`}
            initial={{ scaleY: 0.02, opacity: 0, filter: 'brightness(2.2)' }}
            animate={{ scaleY: 1, opacity: 1, filter: 'brightness(1)' }}
            exit={{ scaleY: 0.02, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Diagonal hazard stripe strip used on warning chrome. */
export function HazardStrip({ tone = 'warn', label }: { tone?: 'warn' | 'crit' | 'blue'; label?: ReactNode }) {
  const color = tone === 'crit' ? '#ff3344' : tone === 'warn' ? '#ffd43b' : '#244bff'
  return (
    <div className="relative flex h-[22px] items-center overflow-hidden" style={{ ...cut('sm'), background: '#0b0b0b' }}>
      <span
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, ${color} 0 8px, transparent 8px 18px)`,
        }}
        aria-hidden
      />
      {label && (
        <span
          className="relative mx-auto px-4 font-pixel-xs"
          style={{ color, background: '#0b0b0b', textShadow: `0 0 12px ${color}` }}
        >
          {label}
        </span>
      )}
    </div>
  )
}

/** Full-bleed scanning line used inside modals. */
export function ModalScan() {
  return <span className="scan-bar opacity-70" aria-hidden />
}