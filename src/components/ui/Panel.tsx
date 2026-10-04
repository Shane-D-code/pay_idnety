import type { CSSProperties, ReactNode } from 'react'
import { CornerTicks, TONES, cut, type Tone } from './tokens'

interface PanelProps {
  title?: ReactNode
  eyebrow?: string
  right?: ReactNode
  left?: ReactNode
  tone?: Tone
  cutSize?: 'none' | 'sm' | 'md' | 'lg'
  grid?: boolean
  brackets?: boolean
  weight?: 1 | 2
  className?: string
  bodyClass?: string
  headerClass?: string
  children: ReactNode
  style?: CSSProperties
  id?: string
}

/**
 * The core terminal frame: 1px (or 2px) border rendered by an outer clipped
 * layer with an inner clipped fill — produces real pixel-cut corners instead
 * of a fake CSS border.
 */
export function Panel({
  title,
  eyebrow,
  right,
  left,
  tone = 'neutral',
  cutSize = 'md',
  grid = false,
  brackets = false,
  weight = 1,
  className = '',
  bodyClass = '',
  headerClass = '',
  children,
  style,
  id,
}: PanelProps) {
  const t = TONES[tone]
  const clip = cut(cutSize)

  return (
    <section
      id={id}
      className={`relative ${className}`}
      style={{ ...clip, background: t.border, padding: weight, ...style }}
    >
      <div
        className={`relative h-full w-full overflow-hidden ${grid ? 'pixel-grid-sm' : ''}`}
        style={{ ...clip, background: '#101010' }}
      >
        {brackets && <CornerTicks color={`rgba(${t.rgb},0.5)`} />}

        {(title || right || left) && (
          <header
            className={`relative flex items-center justify-between gap-3 border-b px-3 py-2 ${
              title ? 'min-h-[34px]' : ''
            } ${headerClass}`}
            style={{ borderColor: '#202020' }}
          >
            <div className="flex min-w-0 items-center gap-2">
              {left}
              {title && (
                <h2
                  className="truncate font-pixel-xs uppercase text-ash"
                  style={{ color: t.text, textShadow: `0 0 10px rgba(${t.rgb},0.35)` }}
                >
                  {title}
                </h2>
              )}
              {eyebrow && <span className="hidden font-mono text-[10px] tracking-[0.18em] text-muted md:inline">{eyebrow}</span>}
            </div>
            {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
          </header>
        )}

        <div className={`relative ${bodyClass}`}>{children}</div>
      </div>
    </section>
  )
}

/** Lightweight frame for nested content that should not compete with panels. */
export function SubFrame({
  tone = 'neutral',
  cutSize = 'sm',
  className = '',
  children,
  style,
}: {
  tone?: Tone
  cutSize?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  children: ReactNode
  style?: CSSProperties
}) {
  const t = TONES[tone]
  return (
    <div className={`relative ${className}`} style={{ ...cut(cutSize), background: t.border, padding: 1, ...style }}>
      <div className="relative h-full w-full" style={{ ...cut(cutSize), background: '#0c0c0c' }}>
        {children}
      </div>
    </div>
  )
}