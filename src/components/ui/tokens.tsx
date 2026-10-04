import type { CSSProperties } from 'react'

/* Pixel-notch clip paths, shared by panels, buttons and dialogs. */
export const CUTS: Record<string, string> = {
  none: 'none',
  sm: 'polygon(0 5px, 5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%)',
  md: 'polygon(0 8px, 4px 4px, 4px 0, calc(100% - 8px) 0, calc(100% - 4px) 4px, calc(100% - 4px) calc(100% - 8px), calc(100% - 8px) calc(100% - 4px), calc(100% - 8px) 100%, 8px 100%, 4px calc(100% - 4px), 4px calc(100% - 8px), 0 calc(100% - 8px))',
  lg: 'polygon(0 14px, 7px 7px, 7px 0, calc(100% - 14px) 0, calc(100% - 7px) 7px, calc(100% - 7px) calc(100% - 14px), calc(100% - 14px) calc(100% - 7px), calc(100% - 14px) 100%, 14px 100%, 7px calc(100% - 7px), 7px calc(100% - 14px), 0 calc(100% - 14px))',
}

export const cut = (size: keyof typeof CUTS = 'md'): CSSProperties => ({
  clipPath: CUTS[size],
})

export type Tone = 'neutral' | 'blue' | 'bright' | 'soft' | 'bone' | 'ok' | 'warn' | 'crit' | 'ash'

export interface ToneSpec {
  border: string
  text: string
  bar: string
  bg: string
  rgb: string
}

export const TONES: Record<Tone, ToneSpec> = {
  neutral: { border: '#232323', text: '#a8a8a8', bar: '#a8a8a8', bg: 'rgba(168,168,168,0.06)', rgb: '168,168,168' },
  blue: { border: '#1b3ba8', text: '#5b72ff', bar: '#244bff', bg: 'rgba(36,75,255,0.07)', rgb: '91,114,255' },
  bright: { border: '#244bff', text: '#8ea0ff', bar: '#5b72ff', bg: 'rgba(36,75,255,0.12)', rgb: '120,140,255' },
  soft: { border: '#2c3fa0', text: '#8fa0ff', bar: '#5b72ff', bg: 'rgba(91,114,255,0.08)', rgb: '143,160,255' },
  bone: { border: '#3a3a3a', text: '#f5f5f5', bar: '#f5f5f5', bg: 'rgba(245,245,245,0.05)', rgb: '245,245,245' },
  ok: { border: '#1c6b3d', text: '#35ff72', bar: '#35ff72', bg: 'rgba(53,255,114,0.07)', rgb: '53,255,114' },
  warn: { border: '#7f6512', text: '#ffd43b', bar: '#ffd43b', bg: 'rgba(255,212,59,0.07)', rgb: '255,212,59' },
  crit: { border: '#8a1e28', text: '#ff3344', bar: '#ff3344', bg: 'rgba(255,51,68,0.08)', rgb: '255,51,68' },
  ash: { border: '#2f2f2f', text: '#a8a8a8', bar: '#666666', bg: 'rgba(168,168,168,0.04)', rgb: '168,168,168' },
}

export const toneOf = (t: Tone = 'neutral') => TONES[t]

/** Four small pixel brackets that pin the corners of a terminal panel. */
export function CornerTicks({
  size = 8,
  color = 'rgba(91,114,255,0.45)',
}: {
  size?: number
  color?: string
}) {
  const base = 'pointer-events-none absolute'
  return (
    <>
      <span
        className={`${base} left-[3px] top-[3px]`}
        style={{ width: size, height: size, borderLeft: `1px solid ${color}`, borderTop: `1px solid ${color}` }}
      />
      <span
        className={`${base} right-[3px] top-[3px]`}
        style={{ width: size, height: size, borderRight: `1px solid ${color}`, borderTop: `1px solid ${color}` }}
      />
      <span
        className={`${base} bottom-[3px] left-[3px]`}
        style={{ width: size, height: size, borderLeft: `1px solid ${color}`, borderBottom: `1px solid ${color}` }}
      />
      <span
        className={`${base} bottom-[3px] right-[3px]`}
        style={{ width: size, height: size, borderRight: `1px solid ${color}`, borderBottom: `1px solid ${color}` }}
      />
    </>
  )
}