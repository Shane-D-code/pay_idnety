import { PixelGlyph } from '@/components/ui/PixelGlyph'

/** IdentityTwin mark: pixel shield core in terminal blue. */
export function BrandMark({ size = 28, pulse = true }: { size?: number; pulse?: boolean }) {
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center">
      {pulse && (
        <span
          className="absolute inset-0"
          style={{
            boxShadow: '0 0 18px rgba(36,75,255,0.35)',
            animation: 'flicker 6s steps(80, end) infinite',
          }}
          aria-hidden
        />
      )}
      <PixelGlyph map="SHIELD_16" color="#5b72ff" px={size / 16} glow="rgba(36,75,255,0.55)" animated={false} />
    </span>
  )
}