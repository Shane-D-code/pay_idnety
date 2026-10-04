/* ==========================================================================
   BEHAVIORAL IDENTITY NETWORK — the hero's central visual.

   Not a generic "cybersecurity illustration": this is the identity graph the
   product actually builds, drawn as a signal network. ADWIKA sits at the centre
   with six behavioural signal satellites wired to it in acid lime.
   ========================================================================== */

import { useState } from 'react'
import { motion } from 'framer-motion'

interface NodeSpec {
  key: string
  x: number
  y: number
  value: string
  detail: string
  /** label sits above or below the node so the hexagon never collides */
  above?: boolean
}

const CX = 500
const CY = 285

const NODES: NodeSpec[] = [
  { key: 'DEVICE', x: 500, y: 58, value: 'MAC · IPHONE', detail: '2 KNOWN DEVICES · 91% FINGERPRINT MATCH', above: true },
  { key: 'LOCATION', x: 815, y: 172, value: 'BANGALORE', detail: 'HOME GEO · 74 SESSIONS FROM THIS ZONE', above: true },
  { key: 'SESSION', x: 815, y: 400, value: '12 MIN AVG', detail: 'LOGIN 08:00–22:30 · MEDIAN 11M 48S' },
  { key: 'PAYMENT', x: 500, y: 514, value: '₹2K–₹8K', detail: 'TYPICAL PAYOUT BAND · MEDIAN ₹4,200' },
  { key: 'PAYEE', x: 185, y: 400, value: '6 KNOWN', detail: 'RECURRING PAYEE SET · ALL VERIFIED', above: true },
  { key: 'API', x: 185, y: 172, value: 'READ ONLY', detail: 'NO ADMIN SCOPE IN 214 ENROLLMENTS' },
]

/** Ambient depth nodes — makes the field read as a live network, not a diagram. */
const DUST: { x: number; y: number; r: number; d: number }[] = [
  { x: 92, y: 96, r: 2, d: 0 },
  { x: 148, y: 470, r: 1.6, d: 0.6 },
  { x: 330, y: 40, r: 2.2, d: 1.2 },
  { x: 700, y: 46, r: 1.8, d: 0.3 },
  { x: 908, y: 268, r: 2.4, d: 0.9 },
  { x: 900, y: 520, r: 1.7, d: 1.5 },
  { x: 640, y: 552, r: 2, d: 0.2 },
  { x: 356, y: 548, r: 1.8, d: 1.1 },
  { x: 70, y: 300, r: 2.1, d: 0.75 },
  { x: 930, y: 88, r: 1.6, d: 1.35 },
  { x: 268, y: 300, r: 1.5, d: 0.45 },
  { x: 736, y: 300, r: 1.5, d: 1.65 },
  { x: 470, y: 12, r: 1.7, d: 0.85 },
]

export function BehaviorNetwork({ className = '' }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null)

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 1000 570"
        className="h-auto w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Behavioral identity network for Adwika Jaiswal linking device, location, session, payment, payee and API signals"
      >
        <defs>
          <radialGradient id="it-core-glow">
            <stop offset="0%" stopColor="#B8FF3D" stopOpacity="0.4" />
            <stop offset="55%" stopColor="#B8FF3D" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#B8FF3D" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="it-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B8FF3D" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#D5FF72" stopOpacity="0.12" />
          </linearGradient>
          <filter id="it-soft" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* ambient core bloom */}
        <circle cx={CX} cy={CY} r="230" fill="url(#it-core-glow)" />

        {/* orbital rings */}
        {[176, 226, 276].map((r, i) => (
          <g key={r} style={{ transformOrigin: `${CX}px ${CY}px`, animation: `spin-slow ${70 + i * 46}s linear infinite` }}>
            <circle
              cx={CX}
              cy={CY}
              r={r}
              fill="none"
              stroke="#B8FF3D"
              strokeOpacity={0.1 - i * 0.022}
              strokeWidth="1"
              strokeDasharray={i === 1 ? '2 9' : '1 14'}
            />
          </g>
        ))}

        {/* dust field + hairline links to core */}
        <g>
          {DUST.map((d, i) => (
            <g key={`${d.x}-${d.y}`}>
              <line
                x1={d.x}
                y1={d.y}
                x2={CX}
                y2={CY}
                stroke="#ffffff"
                strokeOpacity={0.055}
                strokeWidth="0.75"
              />
              <circle
                cx={d.x}
                cy={d.y}
                r={d.r}
                fill="#B8FF3D"
                opacity={0.35}
                style={{ animation: `bloom-pulse ${5 + (i % 5)}s ease-in-out ${d.d}s infinite` }}
              />
            </g>
          ))}
        </g>

        {/* satellite spokes */}
        {NODES.map((n, i) => {
          const on = active === n.key
          const dim = active !== null && !on
          return (
            <g key={n.key}>
              <line
                x1={CX}
                y1={CY}
                x2={n.x}
                y2={n.y}
                stroke="url(#it-edge)"
                strokeWidth={on ? 1.8 : 1}
                strokeOpacity={dim ? 0.14 : on ? 0.95 : 0.5}
                style={{ transition: 'stroke-width .3s, stroke-opacity .3s' }}
              />
              {/* travelling signal packet */}
              <circle r={on ? 3.4 : 2.4} fill="#D5FF72" opacity={dim ? 0 : 1}>
                <animateMotion
                  dur={`${4.6 + i * 0.55}s`}
                  repeatCount="indefinite"
                  path={`M ${CX} ${CY} L ${n.x} ${n.y}`}
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="spline"
                  keySplines="0.4 0 0.6 1"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur={`${4.6 + i * 0.55}s`}
                  repeatCount="indefinite"
                />
              </circle>

              {/* node */}
              <g
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setActive(n.key)}
                onMouseLeave={() => setActive(null)}
              >
                <circle cx={n.x} cy={n.y} r="20" fill="transparent" />
                {on && (
                  <circle cx={n.x} cy={n.y} r="15" fill="#B8FF3D" opacity="0.14" filter="url(#it-soft)" />
                )}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="5"
                  fill="#0a0a0a"
                  stroke="#B8FF3D"
                  strokeWidth="1.5"
                  style={{ transition: 'r .3s' }}
                />
                <circle cx={n.x} cy={n.y} r="2" fill="#B8FF3D" opacity={on ? 1 : 0.75} />

                <text
                  x={n.x}
                  y={n.above ? n.y - 18 : n.y + 20}
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="10"
                  letterSpacing="2.4"
                  fill={on ? '#D5FF72' : '#F5F5F5'}
                  opacity={dim ? 0.35 : 1}
                  style={{ transition: 'fill .3s, opacity .3s' }}
                >
                  {n.key}
                </text>
                <text
                  x={n.x}
                  y={n.above ? n.y - 31 : n.y + 33}
                  textAnchor="middle"
                  fontFamily="'JetBrains Mono', monospace"
                  fontSize="8.5"
                  letterSpacing="1.4"
                  fill="#858585"
                  opacity={dim ? 0.25 : 0.9}
                >
                  {n.value}
                </text>
              </g>
            </g>
          )
        })}

        {/* identity core */}
        <g>
          <motion.circle
            cx={CX}
            cy={CY}
            r="52"
            fill="none"
            stroke="#B8FF3D"
            strokeWidth="0.8"
            strokeOpacity="0.35"
            strokeDasharray="3 7"
            animate={{ rotate: 360 }}
            transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
          />
          <circle cx={CX} cy={CY} r="40" fill="#0a0d07" stroke="#B8FF3D" strokeOpacity="0.75" strokeWidth="1.2" />
          <circle cx={CX} cy={CY} r="33" fill="none" stroke="#B8FF3D" strokeOpacity="0.16" strokeWidth="1" />

          <text
            x={CX}
            y={CY - 4}
            textAnchor="middle"
            fontFamily="'Inter', sans-serif"
            fontWeight="800"
            fontSize="17"
            letterSpacing="1.6"
            fill="#F5F5F5"
          >
            ADWIKA
          </text>
          <text
            x={CX}
            y={CY + 13}
            textAnchor="middle"
            fontFamily="'JetBrains Mono', monospace"
            fontSize="8"
            letterSpacing="2.2"
            fill="#B8FF3D"
            opacity="0.9"
          >
            IDENTITY TWIN
          </text>

          {/* trust ring — 96% */}
          <circle cx={CX} cy={CY} r="46" fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="2.5" />
          <motion.circle
            cx={CX}
            cy={CY}
            r="46"
            fill="none"
            stroke="#B8FF3D"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 46}
            initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
            whileInView={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - 0.96) }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            transform={`rotate(-90 ${CX} ${CY})`}
            style={{ filter: 'drop-shadow(0 0 6px rgba(184,255,61,0.7))' }}
          />
        </g>
      </svg>

      {/* hover readout — sits under the art, never covers it */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
        <div
          className="glass-card px-4 py-2 font-mono text-[10px] tracking-[0.16em] transition-opacity duration-300"
          style={{ opacity: active ? 1 : 0 }}
        >
          {active ? (
            <span className="text-lime">{NODES.find((n) => n.key === active)?.key}</span>
          ) : (
            <span />
          )}
          <span className="ml-2 text-[#858585]">
            {active ? NODES.find((n) => n.key === active)?.detail : ' '}
          </span>
        </div>
      </div>
    </div>
  )
}