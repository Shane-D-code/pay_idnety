import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { motion } from 'framer-motion'
import { Panel as Frame } from '@/components/ui/Panel'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { Badge, KeyValue, StatusPip } from '@/components/ui/indicators'
import { TerminalLoader } from '@/components/ui/TerminalLoader'
import { EmptyState } from '@/components/ui/ThreatAlert'
import { useSim } from '@/sim/SimulationProvider'
import { useNavigate } from '@/lib/router'
import { ATTACKTRACE_EDGES, ATTACKTRACE_NODES, NODE_REVEAL_ORDER } from '@/data'
import { TONES, cut, type Tone } from '@/components/ui/tokens.tsx'

type TraceNodeData = {
  label: string
  sub: string
  tone: Tone
  glyph: string
  index: string
  active: boolean
  anomalous: boolean
  onSelect: (id: string) => void
}

const POSITIONS: Record<string, { x: number; y: number }> = {
  device: { x: 0, y: 40 },
  ip: { x: 220, y: 140 },
  session: { x: 440, y: 40 },
  account: { x: 440, y: 250 },
  payee: { x: 680, y: 20 },
  custdata: { x: 680, y: 160 },
  honeyapi: { x: 680, y: 300 },
  canary: { x: 920, y: 300 },
}

const GLYPH: Record<string, string> = {
  device: '▣',
  ip: '◍',
  session: '◈',
  account: '☗',
  payee: '₹',
  custdata: '▤',
  honeyapi: '⚑',
  canary: '✖',
}

function TraceNode({ data }: NodeProps) {
  const { label, sub, tone, glyph, index, active, anomalous, onSelect } = data as TraceNodeData
  const t = TONES[tone]

  return (
    <div
      onClick={() => onSelect(label)}
      className="relative w-[168px] cursor-pointer"
      style={{ clipPath: 'polygon(0 8px, 4px 4px, 4px 0, calc(100% - 8px) 0, calc(100% - 4px) 4px, calc(100% - 4px) calc(100% - 8px), calc(100% - 8px) calc(100% - 4px), calc(100% - 8px) 100%, 8px 100%, 4px calc(100% - 4px), 4px calc(100% - 8px), 0 calc(100% - 8px))' }}
    >
      <div
        className="relative px-2.5 py-2"
        style={{
          clipPath: 'polygon(0 8px, 4px 4px, 4px 0, calc(100% - 8px) 0, calc(100% - 4px) 4px, calc(100% - 4px) calc(100% - 8px), calc(100% - 8px) calc(100% - 4px), calc(100% - 8px) 100%, 8px 100%, 4px calc(100% - 4px), 4px calc(100% - 8px), 0 calc(100% - 8px))',
          background: active ? '#14161f' : '#0c0c0c',
          boxShadow: `inset 0 0 0 1px ${t.border}`,
        }}
      >
        {anomalous && (
          <span
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage: `repeating-linear-gradient(-45deg, rgba(255,51,68,0.16) 0 6px, transparent 6px 14px)`,
            }}
            aria-hidden
          />
        )}
        <div className="relative flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <span style={{ color: t.text }}>{glyph}</span>
            <span className="font-pixel-xs" style={{ color: t.text }}>
              {label}
            </span>
          </span>
          <span className="font-mono text-[8px]" style={{ color: '#3a3a3a' }}>
            {index}
          </span>
        </div>
        <div className="relative mt-1.5 truncate font-mono text-[9px]" style={{ color: anomalous ? '#ff6b78' : '#6a6a6a' }}>
          {sub}
        </div>
        {active && (
          <motion.span
            layoutId="trace-scan"
            className="pointer-events-none absolute inset-x-0 h-[6px]"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(91,114,255,0.25), transparent)' }}
            aria-hidden
          />
        )}
      </div>
    </div>
  )
}

const NODE_TYPES = { trace: TraceNode }

function buildEdges(revealed: Set<string>, selected: string | null): Edge[] {
  return ATTACKTRACE_EDGES.filter((e) => revealed.has(e.source) && revealed.has(e.target)).map((e) => {
    const isSel = selected ? e.source === selected || e.target === selected : false
    const tone = e.tone === 'crit' ? '#ff3344' : '#ffd43b'
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      animated: true,
      label: e.label && isSel ? e.label : undefined,
      style: {
        stroke: isSel ? '#5b72ff' : tone,
        strokeWidth: isSel ? 2 : 1.2,
        strokeDasharray: e.tone === 'warn' ? '6 4' : undefined,
        opacity: selected && !isSel ? 0.28 : 1,
      },
      labelStyle: { fill: '#8fa0ff', fontFamily: "'Press Start 2P', monospace", fontSize: 7 },
      labelBgStyle: { fill: '#0c0c0c' },
      labelBgPadding: [4, 2] as [number, number],
      labelBgBorderRadius: 0,
    }
  })
}

function buildNodes(revealed: Set<string>, selected: string | null, onSelect: (id: string) => void): Node[] {
  return NODE_REVEAL_ORDER.filter((id) => revealed.has(id)).map((id, i) => {
    const def = ATTACKTRACE_NODES.find((n) => n.id === id)!
    const anomalous = def.tone === 'crit'
    return {
      id,
      type: 'trace',
      position: POSITIONS[id],
      data: {
        label: def.label,
        sub: String(Object.entries(def.detail)[1]?.[1] ?? '').slice(0, 22),
        tone: def.tone === 'crit' ? ('crit' as Tone) : def.tone === 'warn' ? ('warn' as Tone) : ('blue' as Tone),
        glyph: GLYPH[id] ?? '◈',
        index: `N${String(i + 1).padStart(2, '0')}`,
        active: selected === id,
        anomalous,
        onSelect,
      } satisfies TraceNodeData,
    }
  })
}

function TraceCanvas({
  revealed,
  selected,
  onSelect,
}: {
  revealed: Set<string>
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    setNodes(buildNodes(revealed, selected, (id) => onSelect(id === selected ? null : id)))
  }, [revealed, selected, onSelect, setNodes])

  useEffect(() => {
    setEdges(buildEdges(revealed, selected))
  }, [revealed, selected, setEdges])

  useEffect(() => {
    const t = window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>('.react-flow__viewport')
      if (el) el.style.transform = 'translate(40px, 60px) scale(0.78)'
    }, 60)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onPaneClick={() => onSelect(null)}
      nodeTypes={NODE_TYPES}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      fitView={false}
      minZoom={0.45}
      maxZoom={1.4}
      proOptions={{ hideAttribution: true }}
      className="bg-[#08080a]"
    >
      <Background variant={BackgroundVariant.Lines} gap={18} size={1} color="rgba(91,114,255,0.14)" />
      <Controls
        showInteractive={false}
        className="!bottom-2 !left-2 !flex !gap-px !border !border-[#1e1e1e] !bg-[#0a0a0a] !fill-none [&>button]:!h-6 [&>button]:!w-6 [&>button]:!border [&>button]:!border-[#1e1e1e] [&>button]:!bg-[#0d0d0d] [&>button]:!fill-[#8fa0ff] [&>button:hover]:!bg-[#1838ff]"
      />
      <MiniMap
        pannable
        zoomable
        className="!bottom-2 !right-2 !h-16 !w-24 !border !border-[#1e1e1e] !bg-[#0a0a0a]"
        maskColor="rgba(5,5,5,0.75)"
        nodeColor={(n) => (n.data?.tone === 'crit' ? '#ff3344' : n.data?.tone === 'warn' ? '#ffd43b' : '#244bff')}
        nodeStrokeWidth={0}
      />
    </ReactFlow>
  )
}

function Inspector({ id }: { id: string }) {
  const node = ATTACKTRACE_NODES.find((n) => n.id === id)
  if (!node) return null
  const tone = node.tone === 'crit' ? 'crit' : node.tone === 'warn' ? 'warn' : 'blue'

  return (
    <Frame
      title={`NODE // ${node.label}`}
      tone={tone}
      weight={2}
      cutSize="md"
      right={<Badge tone={tone}>{node.kind.toUpperCase()}</Badge>}
    >
      <div className="px-3 py-3">
        <div className="space-y-0">
          {Object.entries(node.detail).map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 border-b border-[#161616] py-[5px] last:border-b-0">
              <span className="shrink-0 font-mono text-[9px] tracking-[0.16em] text-muted">{k}</span>
              <span className="text-right font-mono text-[10px] text-bone">{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-[#1a1a1a] pt-2">
          <KeyValue k="NODE ID" v={node.id.toUpperCase()} tone="soft" />
        </div>
      </div>
      <div
        className="border-t border-[#1a1a1a] px-3 py-[6px] font-mono text-[9px] tracking-[0.14em]"
        style={{ color: TONES[tone].text }}
      >
        EVIDENCE SEALED · READ-ONLY
      </div>
    </Frame>
  )
}

export function AttackTrace() {
  const sim = useSim()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)
  const [booting, setBooting] = useState(true)

  const revealedCount = sim.stage === 0 ? 3 : sim.stage >= 8 ? 8 : Math.min(8, 2 + sim.stage + 1)
  const revealed = useMemo(
    () => new Set(NODE_REVEAL_ORDER.slice(0, sim.stage === 0 ? 3 : revealedCount)),
    [sim.stage, revealedCount],
  )

  useEffect(() => {
    if (sim.stage >= 4 && !selected) setSelected(null)
  }, [sim.stage, selected])

  useEffect(() => {
    setBooting(true)
    const t = window.setTimeout(() => setBooting(false), 1200)
    return () => window.clearTimeout(t)
  }, [])

  const onSelect = useCallback((id: string | null) => setSelected(id), [])

  if (booting) {
    return (
      <Frame cutSize="lg" tone="blue" weight={2} className="mx-auto max-w-[620px]">
        <div className="px-5 py-6">
          <div className="mb-4 flex items-center gap-2">
            <StatusPip tone="ok" />
            <span className="font-pixel-xs text-ash">ATTACKTRACE ENGINE</span>
          </div>
          <TerminalLoader
            lines={[
              { label: 'INDEXING SESSION S-84729...', dur: 300 },
              { label: 'RESOLVING DEVICE FINGERPRINT...', dur: 280 },
              { label: 'CORRELATING PAYOUT GRAPH...', dur: 260 },
              { label: 'ATTACKTRACE READY', dur: 220 },
            ]}
          />
        </div>
      </Frame>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusPip tone={sim.canaryTriggered ? 'crit' : 'warn'} />
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted">
              {sim.stage === 0 ? 'BASELINE TRACE · NO ACTIVE ATTACK' : `TRACE LIVE · ${revealed.size}/8 NODES RESOLVED`}
            </span>
          </div>
          <h2 className="mt-2 font-pixel-sm text-bone terminal-glow">ATTACKTRACE</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TerminalButton label="REBUILD GRAPH" tone="blue" size="sm" onClick={() => setSelected(null)} />
          <TerminalButton label="OPEN INCIDENT" tone="warn" size="sm" onClick={() => navigate('/incidents')} />
          {sim.stage === 0 && (
            <TerminalButton label="SIMULATE ATTACK" tone="blue" size="sm" active onClick={sim.start} />
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Frame
          title="SESSION GRAPH // S-84729"
          cutSize="md"
          tone={sim.canaryTriggered ? 'crit' : 'blue'}
          weight={sim.canaryTriggered ? 2 : 1}
          brackets
          /* grid items default to min-width:auto — without this the graph canvas
             forces the track wider than the viewport on small screens */
          className="min-w-0"
          right={
            <div className="flex items-center gap-3 font-mono text-[9px] tracking-[0.14em]">
              <span className="flex items-center gap-1.5">
                <span className="h-[6px] w-[6px] bg-soft" /> OBSERVED
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-[6px] w-[6px] bg-crit" /> HOSTILE
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-[6px] w-[6px] bg-warn" /> LURE
              </span>
            </div>
          }
        >
          <div className="relative h-[480px] w-full overflow-hidden xl:h-[560px]">
            <div className="pointer-events-none absolute inset-0 z-10" style={{ ...cut('md'), background: 'linear-gradient(180deg, rgba(5,5,5,0.55) 0%, transparent 14%, transparent 86%, rgba(5,5,5,0.55) 100%)' }} aria-hidden />
            <ReactFlowProvider>
              <TraceCanvas revealed={revealed} selected={selected} onSelect={onSelect} />
            </ReactFlowProvider>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[2px] bg-electric opacity-40" style={{ animation: 'scan-down 6s linear infinite' }} aria-hidden />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1a1a1a] px-3 py-[6px] font-mono text-[9px] tracking-[0.14em] text-[#3d3d3d]">
            <span>CLICK A NODE FOR TECHNICAL DETAIL · DRAG TO PAN · SCROLL TO ZOOM</span>
            <span className="text-ash">
              {selected ? `SELECTED · ${selected.toUpperCase()}` : 'NO SELECTION'}
            </span>
          </div>
        </Frame>

        <div className="space-y-4">
          {selected ? (
            <Inspector id={selected} />
          ) : (
            <Frame title="NODE INSPECTOR" cutSize="md" tone="neutral">
              <EmptyState
                title="SELECT A NODE"
                status="READY"
                body="Click any node in the trace to open its technical record: fingerprints, reputation, scope and containment state."
              />
            </Frame>
          )}

          <Frame title="TRACE SUMMARY" cutSize="md" tone="neutral">
            <div className="px-3 py-2.5">
              <KeyValue k="SESSION" v="S-84729" tone="soft" />
              <KeyValue k="ORIGIN" v="DELHI, IN · 103.87.xx.xx" />
              <KeyValue k="VECTOR" v="CREDENTIAL THEFT" tone="warn" />
              <KeyValue k="NODES RESOLVED" v={`${revealed.size} / 8`} tone="blue" />
              <KeyValue k="CANARY" v={sim.canaryTriggered ? 'TRIGGERED' : 'ARMED'} tone={sim.canaryTriggered ? 'crit' : 'ash'} />
              <KeyValue k="STATUS" v={sim.isolated ? 'ISOLATED' : 'OBSERVING'} tone={sim.isolated ? 'ok' : 'warn'} />
            </div>
            <div className="border-t border-[#1a1a1a] px-3 py-[6px]">
              <TerminalButton
                label={sim.canaryTriggered ? 'VIEW INCIDENT' : 'RUN ATTACK'}
                tone={sim.canaryTriggered ? 'warn' : 'blue'}
                size="xs"
                block
                onClick={sim.canaryTriggered ? () => navigate('/incidents') : sim.start}
              />
            </div>
          </Frame>

          <Frame title="EVIDENCE INTEGRITY" cutSize="md" tone="neutral">
            <div className="px-3 py-2.5">
              {[
                ['REQUEST LOGS', 'SEALED'],
                ['DEVICE IMAGE', 'SEALED'],
                ['PAYOUT RECORD', 'SEALED'],
                ['CANARY CAPTURE', sim.canaryTriggered ? 'SEALED' : 'PENDING'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border-b border-[#141414] py-[5px] last:border-b-0">
                  <span className="font-mono text-[9px] tracking-[0.14em] text-muted">{k}</span>
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: v === 'PENDING' ? '#666' : '#35ff72' }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </Frame>
        </div>
      </div>
    </div>
  )
}