import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { TONES, cut, type Tone } from './tokens'

type Size = 'xs' | 'sm' | 'md' | 'lg'

interface TerminalButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: ReactNode
  tone?: Tone
  size?: Size
  active?: boolean
  block?: boolean
  caret?: boolean
}

const SIZES: Record<Size, string> = {
  xs: 'px-2 py-[5px] font-pixel-xs',
  sm: 'px-3 py-[7px] font-pixel-xs',
  md: 'px-4 py-[10px] font-pixel-sm',
  lg: 'px-5 py-[14px] font-pixel-sm',
}

/**
 * Old-terminal control: square pixel corners, thin border, sweeping scan on
 * hover and a blinking caret — nothing rounded, nothing soft.
 */
export function TerminalButton({
  label,
  tone = 'blue',
  size = 'sm',
  active = false,
  block = false,
  caret = true,
  className = '',
  disabled,
  ...rest
}: TerminalButtonProps) {
  const t = TONES[tone]
  const on = active || (disabled ? false : false)

  return (
    <button
      type="button"
      disabled={disabled}
      className={`group relative isolate inline-flex select-none items-center justify-center gap-2 ${
        SIZES[size]
      } ${block ? 'w-full' : ''} ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'} ${className}`}
      style={{
        ...cut('sm'),
        background: on ? t.bar : '#0b0b0b',
        color: on ? '#050505' : t.text,
        boxShadow: disabled ? 'none' : on ? `0 0 18px rgba(${t.rgb},0.28)` : `inset 0 0 0 0 rgba(${t.rgb},0)`,
        transition: 'background 120ms linear, box-shadow 120ms linear',
        border: 'none',
      }}
      {...rest}
    >
      {/* border drawn as an inner outline because clip-path removes real borders */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{ ...cut('sm'), boxShadow: `inset 0 0 0 1px ${active ? t.bar : `rgba(${t.rgb},0.55)`}` }}
        aria-hidden
      />

      {!disabled && (
        <span
          className="pointer-events-none absolute inset-0 -translate-x-[140%] transition-transform duration-500 ease-out group-hover:translate-x-[140%]"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${t.rgb},0.22), transparent)`,
          }}
          aria-hidden
        />
      )}

      <span
        className={`relative transition-[margin] duration-150 ${caret ? 'group-hover:ml-1' : ''}`}
        aria-hidden
      >
        <span className="inline-block w-0 overflow-hidden align-middle transition-all duration-150 group-hover:w-[8px]">
          ›
        </span>
      </span>

      <span className="relative whitespace-nowrap">{label}</span>

      {caret && !disabled && (
        <span
          className="blink relative hidden h-[9px] w-[6px] bg-current group-hover:inline-block"
          aria-hidden
        />
      )}
    </button>
  )
}

/** Nav-style row used by the left rail. */
export function NavRow({
  active,
  glyph,
  children,
  index,
  onClick,
}: {
  active?: boolean
  glyph: string
  children: ReactNode
  index: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block w-full cursor-pointer text-left"
      aria-current={active ? 'page' : undefined}
    >
      <span
        className={`absolute inset-0 ${active ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        style={{ background: 'rgba(36,75,255,0.12)' }}
        aria-hidden
      />
      {active && (
        <span
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ background: '#5b72ff', boxShadow: '0 0 12px rgba(91,114,255,0.8)' }}
          aria-hidden
        />
      )}
      {active && (
        <span
          className="absolute inset-y-0 left-0 w-[38%] overflow-hidden"
          aria-hidden
          style={{ background: 'linear-gradient(90deg, rgba(36,75,255,0.16), transparent)' }}
        >
          <span className="absolute inset-y-0 w-6 -translate-x-full animate-[scan-x_2.6s_linear_infinite]" />
        </span>
      )}
      <span
        className={`relative flex items-center gap-2.5 px-3 py-[9px] font-pixel-xs transition-colors duration-150 ${
          active ? 'text-bone' : 'text-muted group-hover:text-ash'
        }`}
      >
        <span className={active ? 'text-soft' : 'text-[#3d3d3d]'}>{glyph}</span>
        <span className="flex-1 truncate">{children}</span>
        <span className="font-mono text-[9px] text-[#333]">{index}</span>
      </span>
    </button>
  )
}