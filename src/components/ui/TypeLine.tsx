import { useTypewriter } from '@/lib/hooks'
import { TONES, type Tone } from './tokens'

/** Typed terminal line with a caret that stays lit while typing. */
export function TypeLine({
  text,
  speed = 12,
  caret = true,
  tone = 'ash',
  className = '',
  start = true,
}: {
  text: string
  speed?: number
  caret?: boolean
  tone?: Tone
  className?: string
  start?: boolean
}) {
  const { text: out, done } = useTypewriter(text, speed, start)
  return (
    <span className={`font-mono ${className}`} style={{ color: TONES[tone].text }}>
      {out}
      {caret && (
        <span className={`${done ? 'blink' : ''} ml-[2px] inline-block h-[10px] w-[6px] translate-y-[1px] bg-current`} />
      )}
    </span>
  )
}

/** Small blinking terminal caret for static text. */
export function Caret({ tone = 'soft' }: { tone?: Tone }) {
  return (
    <span
      className="blink inline-block h-[11px] w-[7px] translate-y-[1px]"
      style={{ background: TONES[tone].text, boxShadow: `0 0 8px ${TONES[tone].bar}` }}
      aria-hidden
    />
  )
}

/** `> PRESS ENTER TO INITIALIZE_` */
export function PromptLine({
  children,
  tone = 'bone',
  className = '',
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span className={`inline-flex items-center font-mono text-[11px] tracking-[0.18em] ${className}`}>
      <span className="mr-1.5" style={{ color: TONES[tone].text }}>
        &gt;
      </span>
      <span className="uppercase">{children}</span>
      <Caret tone={tone} />
    </span>
  )
}