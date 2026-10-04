const SKULL_16 = [
  '................',
  '.....######.....',
  '...##########...',
  '..############..',
  '..##oo####oo##..',
  '..##oo####oo##..',
  '..############..',
  '..####..######..',
  '..###########...',
  '..############..',
  '...###.##.###...',
  '...###.##.###...',
  '....##....##....',
  '.....######.....',
  '................',
  '................',
]

const SHIELD_16 = [
  '..####..####....',
  '.##############..',
  '.############...',
  '################',
  '###.########.###',
  '##.#########.##',
  '##..######..###',
  '##...####...###',
  '.#...####...##',
  '....######.....',
  '...########....',
  '..##########...',
  '.############...',
  '.###########....',
  '..#########.....',
  '...#####.......',
]

const RADAR_16 = [
  '......####......',
  '....########....',
  '...##########...',
  '..####......####',
  '.###........###.',
  '####.........##',
  '###..........##',
  '##...######...##',
  '##..##....##..##',
  '##.##......##.##',
  '###.##....##.###',
  '####......####..',
  '..####....####..',
  '...##########...',
  '....########....',
  '......####......',
]

const MAPS: Record<string, string[]> = { SKULL_16, SHIELD_16, RADAR_16 }

/**
 * Pixel-art glyph rendered from a bitmap — deliberately blocky, never a
 * 3D illustration. Used by the warning dialog and empty states.
 */
export function PixelGlyph({
  map = 'SKULL_16',
  color = '#f5f5f5',
  px = 12,
  glow = 'rgba(255,51,68,0.55)',
  animated = true,
  className = '',
}: {
  map?: keyof typeof MAPS | string
  color?: string
  px?: number
  glow?: string
  animated?: boolean
  className?: string
}) {
  const rows = MAPS[map] ?? MAPS.SKULL_16
  const size = rows.length

  return (
    <svg
      viewBox={`-1 -1 ${size + 2} ${size + 2}`}
      width={size * px}
      height={size * px}
      className={className}
      shapeRendering="crispEdges"
      style={glow ? { filter: `drop-shadow(0 0 12px ${glow})` } : undefined}
      role="img"
      aria-label="pixel warning glyph"
    >
      <g>
        {rows.map((row, y) =>
          row.split('').map((cell, x) => {
            if (cell === '.') return null
            const isHole = cell === 'o'
            return (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={isHole ? '#050505' : color}
              />
            )
          }),
        )}
        {animated && (
          <rect
            x={0}
            y={0}
            width={size}
            height={1.4}
            fill="#ffffff"
            opacity={0.14}
            style={{ animation: 'scan-down 3.4s linear infinite' }}
          />
        )}
      </g>
    </svg>
  )
}

export const PixelSkull = (props: Omit<Parameters<typeof PixelGlyph>[0], 'map'>) => (
  <PixelGlyph map="SKULL_16" color="#f5f5f5" px={13} glow="rgba(255,51,68,0.5)" {...props} />
)