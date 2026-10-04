import { motion } from 'framer-motion'

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

/**
 * Global CRT treatment. Sits above every surface, below nothing the analyst
 * must read — pointer-transparent, deliberately low-contrast.
 */
export function CrtOverlay({ enabled = true, intensity = 1 }: { enabled?: boolean; intensity?: number }) {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 300 }}
      animate={{ opacity: enabled ? intensity : 0 }}
      transition={{ duration: 0.4 }}
      aria-hidden
    >
      {/* scanlines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.55) 3px, rgba(0,0,0,0) 4px)',
          mixBlendMode: 'multiply',
          opacity: 0.5,
        }}
      />

      {/* aperture grille */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to right, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)',
          mixBlendMode: 'screen',
          opacity: 0.35,
        }}
      />

      {/* screen noise */}
      <div
        className="absolute -inset-[6%]"
        style={{
          backgroundImage: NOISE,
          opacity: 0.035,
          animation: 'noise-jitter 1.1s steps(3, end) infinite',
        }}
      />

      {/* travelling scan bar */}
      <div className="scan-bar" style={{ opacity: 0.75 }} />

      {/* slow horizontal retrace bar */}
      <div className="scan-line-x" style={{ opacity: 0.6 }} />

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 95% at 50% 45%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.35) 76%, rgba(0,0,0,0.72) 100%)',
        }}
      />

      {/* faint blue phosphor wash */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(80% 60% at 50% 0%, rgba(24,56,255,0.07), transparent 70%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* corner darkening + edge glow */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 140px rgba(0,0,0,0.9), inset 0 0 24px rgba(24,56,255,0.06)',
        }}
      />
    </motion.div>
  )
}

/** Boot-up CRT flash used by the landing and boot sequence. */
export function CrtFlash({ trigger }: { trigger: number }) {
  return (
    <motion.div
      key={trigger}
      className="pointer-events-none fixed inset-0 bg-bone"
      style={{ zIndex: 400 }}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      aria-hidden
    />
  )
}