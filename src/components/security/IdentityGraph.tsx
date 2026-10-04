import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { DriftDimension, Identity } from '@/data'

export interface GraphNodeDef {
  id: string
  label: string
  baseline: string
  current: string
  side: 'left' | 'right'
  y: number
}

/**
 * The six dimensions the twin tracks. Baseline values are filled in from the
 * selected identity at render time; the "current" column only changes once the
 * session actually diverges.
 */
export const GRAPH_DIMENSIONS: Omit<GraphNodeDef, 'baseline' | 'current'>[] = [
  { id: 'device', label: 'DEVICE', side: 'left', y: 58 },
  { id: 'location', label: 'LOCATION', side: 'left', y: 214 },
  { id: 'session', label: 'SESSION', side: 'left', y: 370 },
  { id: 'payee', label: 'PAYEE', side: 'right', y: 58 },
  { id: 'api', label: 'API', side: 'right', y: 214 },
  { id: 'transaction', label: 'TRANSACTION', side: 'right', y: 370 },
]

/** Drift weights stamped next to each bus when the session has diverged. */
const DRIFT_BADGES: Record<string, string> = {
  device: 'NEW DEVICE +18',
  location: 'UNUSUAL LOCATION +14',
  session: 'UNUSUAL LOGIN TIME +11',
  payee: 'NEW PAYEE +16',
  transaction: 'ABNORMAL PAYOUT +21',
  api: 'SENSITIVE API +11',
}

const BASELINE_BY_KEY = (i: Identity): Record<string, string> => ({
  device: i.normalDevices.join(' / ').toUpperCase(),
  location: i.normalLocations.join(', ').toUpperCase(),
  session: `${i.typicalSessionMin} MIN AVG`,
  payee: `${i.knownPayees} KNOWN`,
  api: i.segment.split(' / ')[0],
  transaction: i.typicalPayout,
})

/** Builds the six node definitions for whichever identity is on screen. */
export function buildGraphNodes(identity: Identity, drift: DriftDimension[]): GraphNodeDef[] {
  const baseline = BASELINE_BY_KEY(identity)
  return GRAPH_DIMENSIONS.map((d) => {
    const live = drift.find((x) => x.key === d.id || (d.id === 'transaction' && x.key === 'payment'))
    return {
      ...d,
      baseline: baseline[d.id] ?? '—',
      current: live?.current ?? baseline[d.id] ?? '—',
    }
  })
}

const W = 620
const H = 440
const CX = 310
const CY = 214
const BUS_L = 196
const BUS_R = 424
const NODE_W = 150
const NODE_H = 52

function Node({
  node,
  anomalous,
  onHover,
  hovered,
  onSelect,
  selected,
}: {
  node: GraphNodeDef
  anomalous: boolean
  onHover: (id: string | null) => void
  hovered: boolean
  onSelect: (id: string) => void
  selected: boolean
}) {
  const x = node.side === 'left' ? 16 : W - NODE_W - 16
  const color = anomalous ? '#ff3344' : hovered || selected ? '#8fa0ff' : '#5b72ff'
  const text = anomalous ? node.current : node.baseline

  return (
    <g
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(node.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(node.id)
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${node.label}: baseline ${node.baseline}, current ${node.current}`}
    >
      {anomalous && (
        <motion.rect
          x={x - 3}
          y={node.y - NODE_H / 2 - 3}
          width={NODE_W + 6}
          height={NODE_H + 6}
          fill="none"
          stroke="#ff3344"
          strokeWidth={1}
          initial={{ opacity: 0.55, scale: 1 }}
          animate={{ opacity: 0, scale: 1.09 }}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeOut' }}
          style={{ transformOrigin: `${x + NODE_W / 2}px ${node.y}px` }}
        />
      )}

      {/* pixel-cut node frame */}
      <path
        d={`M${x} ${node.y - NODE_H / 2 + 6} L${x + 6} ${node.y - NODE_H / 2} L${x + NODE_W} ${
          node.y - NODE_H / 2
        } L${x + NODE_W} ${node.y + NODE_H / 2 - 6} L${x + NODE_W - 6} ${node.y + NODE_H / 2} L${x} ${
          node.y + NODE_H / 2
        } Z`}
        fill={anomalous ? 'rgba(255,51,68,0.10)' : 'rgba(36,75,255,0.08)'}
        stroke={color}
        strokeWidth={1}
        style={{ filter: `drop-shadow(0 0 6px ${color}70)` }}
      />

      <text
        x={x + 10}
        y={node.y - 7}
        fill={color}
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 7,
          letterSpacing: '0.06em',
        }}
      >
        {node.label}
      </text>
      <text
        x={x + 10}
        y={node.y + 11}
        fill={anomalous ? '#ff6b78' : '#a8a8a8'}
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5 }}
      >
        {text.length > 20 ? `${text.slice(0, 19)}…` : text}
      </text>

      {anomalous ? (
        <text
          x={x + NODE_W - 10}
          y={node.y + 11}
          fill="#ff3344"
          textAnchor="end"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, fontWeight: 700 }}
        >
          DRIFT
        </text>
      ) : (
        <text
          x={x + NODE_W - 10}
          y={node.y - 7}
          fill={selected ? '#8fa0ff' : '#3d3d3d'}
          textAnchor="end"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7.5, letterSpacing: '0.12em' }}
        >
          {selected ? 'SELECTED' : 'MATCH'}
        </text>
      )}
    </g>
  )
}

/**
 * Section 13 — the identity fingerprint: a schematic bus-trace graph where
 * every behavioural dimension is a node wired back to the twin. Nodes are
 * interactive: clicking one reports it to the parent so the detail readout
 * below the graph can explain what drifted.
 */
export function IdentityGraph({
  identity,
  anomalous,
  drift = [],
  scanActive = true,
  selected: selectedProp,
  onSelect,
}: {
  identity: Identity
  anomalous: boolean
  drift?: DriftDimension[]
  scanActive?: boolean
  selected?: string | null
  onSelect?: (id: string) => void
}) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [internal, setInternal] = useState<string | null>(null)
  const selected = selectedProp !== undefined ? selectedProp : internal

  const nodes = useMemo(() => buildGraphNodes(identity, anomalous ? drift : []), [identity, anomalous, drift])
  const leftNodes = nodes.filter((n) => n.side === 'left')
  const rightNodes = nodes.filter((n) => n.side === 'right')

  const pick = (id: string) => {
    setInternal(id === internal ? null : id)
    onSelect?.(id)
  }

  const color = anomalous ? '#ff3344' : '#244bff'
  const dim = anomalous ? 'rgba(255,51,68,0.35)' : 'rgba(36,75,255,0.45)'
  const firstName = identity.name.split(' ')[0].toUpperCase()

  const bus = (busX: number, list: GraphNodeDef[], side: 'left' | 'right') => (
    <g>
      {/* spine */}
      <path
        d={`M${busX} ${list[0].y} L${busX} ${list[list.length - 1].y}`}
        stroke={dim}
        strokeWidth={1}
        fill="none"
      />
      {/* from centre */}
      <path d={`M${CX} ${CY} L${busX} ${CY}`} stroke={dim} strokeWidth={1} fill="none" />
      {list.map((n, i) => {
        const targetX = side === 'left' ? 16 + NODE_W : W - NODE_W - 16
        const on = anomalous
        const lit = hovered === n.id || selected === n.id
        return (
          <g key={n.id}>
            <path
              d={`M${busX} ${n.y} L${targetX} ${n.y}`}
              stroke={on ? '#ff3344' : lit ? '#8fa0ff' : dim}
              strokeWidth={on ? 1.2 : lit ? 1.4 : 1}
              fill="none"
              strokeDasharray={on ? '5 4' : undefined}
              style={on ? { animation: `dash-flow 1.1s linear infinite` } : undefined}
              opacity={hovered && !lit ? 0.4 : 1}
            />
            {/* junction square */}
            <rect
              x={busX - 3}
              y={n.y - 3}
              width={6}
              height={6}
              fill={on ? '#ff3344' : lit ? '#8fa0ff' : '#0a0a0a'}
              stroke={on ? '#ff3344' : '#2b3a8f'}
              strokeWidth={1}
            />
            {i === 0 && (
              <text x={busX + 6} y={n.y - 6} fill="#3d3d3d" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7 }}>
                {`0${i + 1}`}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ maxHeight: 440 }}
      role="group"
      aria-label={`identity twin fingerprint graph for ${identity.name}`}
    >
      <defs>
        <pattern id="igrid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="rgba(91,114,255,0.07)" strokeWidth="1" />
        </pattern>
        <radialGradient id="icore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={anomalous ? 'rgba(255,51,68,0.35)' : 'rgba(36,75,255,0.35)'} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <rect width={W} height={H} fill="url(#igrid)" />

      {/* centre core */}
      <circle cx={CX} cy={CY} r={86} fill="url(#icore)" />
      <motion.circle
        cx={CX}
        cy={CY}
        r={64}
        fill="none"
        stroke={color}
        strokeWidth={1}
        initial={{ opacity: 0.4, scale: 1 }}
        animate={{ opacity: 0, scale: 1.28 }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
      />

      {bus(BUS_L, leftNodes, 'left')}
      {bus(BUS_R, rightNodes, 'right')}

      {/* centre identity block */}
      <g>
        <path
          d={`M${CX - 54} ${CY - 30} L${CX - 44} ${CY - 40} L${CX + 54} ${CY - 40} L${CX + 54} ${CY + 30} L${
            CX + 44
          } ${CY + 40} L${CX - 54} ${CY + 40} Z`}
          fill="#0a0a0a"
          stroke={color}
          strokeWidth={1.4}
          style={{ filter: `drop-shadow(0 0 10px ${color}90)` }}
        />
        <text
          x={CX}
          y={CY - 12}
          textAnchor="middle"
          fill="#f5f5f5"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: firstName.length > 7 ? 8 : 11,
            letterSpacing: '0.08em',
            textShadow: '0 0 14px rgba(91,114,255,0.6)',
          }}
        >
          {firstName.length > 9 ? `${firstName.slice(0, 9)}…` : firstName}
        </text>
        <text
          x={CX}
          y={CY + 6}
          textAnchor="middle"
          fill={anomalous ? '#ff3344' : '#35ff72'}
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.16em' }}
        >
          {anomalous ? 'DIVERGING' : 'ALIGNED'}
        </text>
        <text
          x={CX}
          y={CY + 24}
          textAnchor="middle"
          fill="#666"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '0.2em' }}
        >
          {identity.id}
        </text>
      </g>

      {nodes.map((n) => (
        <Node
          key={n.id}
          node={n}
          anomalous={anomalous}
          hovered={hovered === n.id}
          selected={selected === n.id}
          onHover={setHovered}
          onSelect={pick}
        />
      ))}

      {/* drift badges */}
      {anomalous && (
        <g>
          <text x={BUS_L + 8} y={28} fill="#ff3344" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8 }}>
            {DRIFT_BADGES.device}
          </text>
          <text x={BUS_R + 8} y={28} fill="#ff3344" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8 }}>
            {DRIFT_BADGES.payee}
          </text>
          <text x={BUS_L + 8} y={H - 12} fill="#ff3344" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8 }}>
            {DRIFT_BADGES.transaction}
          </text>
          <text x={BUS_R + 8} y={H - 12} fill="#ff3344" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8 }}>
            {DRIFT_BADGES.api}
          </text>
        </g>
      )}

      {scanActive && (
        <rect x={0} y={0} width={W} height={26} fill="#5b72ff" opacity={0.05}>
          <animate attributeName="y" values={`0;${H - 26};0`} dur="7s" repeatCount="indefinite" />
        </rect>
      )}
    </svg>
  )
}