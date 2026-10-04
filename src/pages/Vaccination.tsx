import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Panel, SubFrame } from '@/components/ui/Panel'
import { TerminalButton } from '@/components/ui/TerminalButton'
import { Badge, KeyValue, SectionLabel, StatusPip } from '@/components/ui/indicators'
import { EmptyState } from '@/components/ui/ThreatAlert'
import { TerminalLoader } from '@/components/ui/TerminalLoader'
import { Caret } from '@/components/ui/TypeLine'
import { CanaryBanner } from '@/components/ui/CanaryAlert'
import { TONES, cut, type Tone } from '@/components/ui/tokens.tsx'
import { useCountUp } from '@/lib/hooks'
import { useNavigate } from '@/lib/router'
import { useSim } from '@/sim/SimulationProvider'
import { VACCINATION_IMPACT, VACCINE_PIPELINE, VACCINE_RULE } from '@/data'

/* ------------------------------------------------------------------ config */

const PIPELINE_STEPS = VACCINE_PIPELINE.map((label, i) => ({
  label,
  dur: i === 0 ? 320 : 520 + i * 190,
}))

const TONE_OF = (v: string): Tone =>
  v === 'ELEVATE MONITORING' ? 'warn' : v === 'REQUIRE STEP-UP AUTHENTICATION' ? 'warn' : 'crit'

/* ----------------------------------------------------------------- pipeline */

function PipelinePanel({ armed, runId, onDeploy }: { armed: boolean; runId: number; onDeploy: () => void }) {
  return (
    <Panel
      title="SIGNATURE EXTRACTION PIPELINE"
      cutSize="md"
      tone={armed ? 'ok' : 'neutral'}
      right={
        armed ? (
          <>
            <Badge tone="ok">DEPLOYED</Badge>
            <span className="hidden font-mono text-[9px] tracking-[0.16em] text-[#4a4a4a] sm:inline">
              RULE {VACCINE_RULE.id}
            </span>
          </>
        ) : (
          <span className="font-mono text-[9px] tracking-[0.16em] text-[#4a4a4a]">STANDBY</span>
        )
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {armed ? (
          <motion.div key={`run-${runId}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 py-4">
            <TerminalLoader lines={PIPELINE_STEPS} />
          </motion.div>
        ) : (
          <motion.div key="standby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState
              title="NO SIGNATURE LEARNED YET"
              status="AWAITING A CONTAINED ATTACK"
              tone="neutral"
              body="IdentityTwin can only extract a behavioural signature after an attack has been contained and the incident record is sealed. Nothing is invented before the attack is real."
              action={
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <TerminalButton label="▶ RUN FULL ATTACK" tone="blue" size="sm" active onClick={onDeploy} />
                </div>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between border-t border-[#1a1a1a] px-3 py-[6px] font-mono text-[9px] tracking-[0.14em] text-[#4a4a4a]">
        <span>EXTRACT › GENERATE › TEST › DEPLOY</span>
        <span className="flex items-center gap-1.5 text-ash">
          <Caret tone={armed ? 'ok' : 'soft'} />
          {armed ? 'COMPLETE' : 'IDLE'}
        </span>
      </div>
    </Panel>
  )
}

/* -------------------------------------------------------------------- rule */

function RuleCard({ armed }: { armed: boolean }) {
  return (
    <Panel
      title={`LEARNED RULE ${VACCINE_RULE.id}`}
      cutSize="lg"
      tone={armed ? 'ok' : 'neutral'}
      weight={2}
      grid
      right={
        armed ? (
          <>
            <Badge tone="ok">{VACCINE_RULE.version}</Badge>
            <Badge tone="crit">SEVERITY {VACCINE_RULE.severity}</Badge>
          </>
        ) : (
          <Badge tone="neutral">NOT DEPLOYED</Badge>
        )
      }
    >
      <div className={armed ? '' : 'opacity-35'}>
        {/* rule head */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#1a1a1a] px-4 py-3">
          <span className="font-pixel-lg leading-none text-ok" style={{ textShadow: '0 0 18px rgba(53,255,114,0.5)' }}>
            {VACCINE_RULE.id}
          </span>
          <span className="h-8 w-px bg-[#1e1e1e]" aria-hidden />
          <div className="min-w-0">
            <div className="font-pixel-xs text-muted">SCOPE</div>
            <div className="mt-1 font-mono text-[10px] tracking-[0.1em] text-ash">{VACCINE_RULE.scope}</div>
          </div>
        </div>

        {/* IF / THEN */}
        <div className="grid gap-px bg-[#1a1a1a] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="bg-[#0b0b0b] px-4 py-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="font-pixel-xs text-soft">IF</span>
              <span className="h-px flex-1 bg-[#1a1a1a]" />
              <span className="font-mono text-[9px] tracking-[0.14em] text-[#4a4a4a]">
                ALL CONDITIONS MET
              </span>
            </div>
            <ul className="space-y-1.5">
              {VACCINE_RULE.conditions.map((c, i) => (
                <motion.li
                  key={c}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.07 }}
                  className="flex items-center gap-2.5"
                >
                  <span
                    className="flex h-[16px] w-[16px] shrink-0 items-center justify-center font-mono text-[10px]"
                    style={{ background: '#122a1b', color: '#35ff72', boxShadow: 'inset 0 0 0 1px rgba(53,255,114,0.4)' }}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span className="truncate font-mono text-[11px] tracking-[0.08em] text-bone">{c}</span>
                </motion.li>
              ))}
            </ul>
            <div className="mt-3 border-t border-[#1a1a1a] pt-2 font-mono text-[9px] tracking-[0.1em] text-[#4a4a4a]">
              LOGIC · CONJUNCTION (5 OF 5)
            </div>
          </div>

          <div className="bg-[#0b0b0b] px-4 py-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="font-pixel-xs text-warn">THEN</span>
              <span className="h-px flex-1 bg-[#1a1a1a]" />
              <span className="font-mono text-[9px] tracking-[0.14em] text-[#4a4a4a]">APPLY IN ORDER</span>
            </div>
            <ul className="space-y-1.5">
              {VACCINE_RULE.actions.map((a, i) => (
                <motion.li
                  key={a}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 + i * 0.09 }}
                  className="flex items-center gap-2.5"
                >
                  <span className="shrink-0 font-mono text-[10px] text-warn" aria-hidden>
                    {String(i + 1).padStart(2, '0')}›
                  </span>
                  <span className="min-w-0 flex-1 font-mono text-[11px] leading-snug tracking-[0.06em]" style={{ color: TONES[TONE_OF(a)].text }}>
                    {a}
                  </span>
                </motion.li>
              ))}
            </ul>
            <div className="mt-3 border-t border-[#1a1a1a] pt-2 font-mono text-[9px] tracking-[0.1em] text-[#4a4a4a]">
              NO AUTOMATIC LOCKOUT · USER NEVER LOCKED OUT
            </div>
          </div>
        </div>

        {/* footer metrics */}
        <div className="grid gap-px border-t border-[#1a1a1a] bg-[#1a1a1a] sm:grid-cols-4">
          {[
            ['VERSION', VACCINE_RULE.version, 'soft'],
            ['CONFIDENCE', VACCINE_RULE.confidence, 'ok'],
            ['FALSE POSITIVES', VACCINE_RULE.falsePositiveRate, 'warn'],
            ['POPULATION TESTED', VACCINE_RULE.populationTested.toLocaleString('en-IN'), 'bone'],
          ].map(([k, v, tone]) => (
            <div key={k} className="bg-[#0b0b0b] px-3 py-2.5">
              <div className="font-pixel-xs text-muted">{k}</div>
              <div
                className="mt-2 font-mono text-[12px] tnum"
                style={{ color: TONES[tone as Tone].text, textShadow: `0 0 12px rgba(${TONES[tone as Tone].rgb},0.4)` }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------------ impact */

function ImpactPanel({ armed }: { armed: boolean }) {
  const protectedCount = useCountUp(armed ? VACCINE_RULE.identitiesCovered : 0, 2200, 200)
  const attackCount = useCountUp(armed ? 1 : 0, 700)
  const sigCount = useCountUp(armed ? 1 : 0, 900, 180)

  const values = [attackCount, sigCount, protectedCount]

  return (
    <Panel
      title="SECURITY VACCINATION IMPACT"
      cutSize="lg"
      tone={armed ? 'ok' : 'neutral'}
      weight={2}
      right={armed ? <Badge tone="ok">PRODUCTION</Badge> : <Badge tone="neutral">IDLE</Badge>}
    >
      <div className="px-4 py-5">
        <div className="flex flex-wrap items-stretch justify-center gap-y-5">
          {VACCINATION_IMPACT.map((step, i) => {
            const t = TONES[step.tone]
            const isBig = i === VACCINATION_IMPACT.length - 1
            const display = isBig ? Math.round(values[i]).toLocaleString('en-IN') : Math.round(values[i])
            return (
              <div key={step.label} className="flex items-center gap-5">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: armed ? 1 : 0.35, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.12 }}
                  className="px-2 text-center"
                >
                  <div
                    className="font-pixel-lg leading-none tnum sm:font-pixel-xl"
                    style={{ color: t.text, textShadow: `0 0 26px rgba(${t.rgb},0.6)` }}
                  >
                    {display}
                  </div>
                  <div className="mt-2 font-pixel-xs text-muted">{step.label}</div>
                </motion.div>

                {i < VACCINATION_IMPACT.length - 1 && (
                  <span className="font-mono text-[16px] text-[#333]" aria-hidden>
                    ↓
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-5 border-t border-[#1a1a1a] pt-4 text-center">
          <AnimatePresence mode="wait">
            {armed ? (
              <motion.div
                key="armed"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="font-pixel-sm leading-relaxed text-ok"
                  style={{ textShadow: '0 0 20px rgba(53,255,114,0.55)' }}
                >
                  1,284 IDENTITIES PROTECTED
                </div>
                <p className="mx-auto mt-3 max-w-[560px] font-mono text-[10px] leading-relaxed tracking-[0.06em] text-muted">
                  ONE ATTACK BECAME ONE RULE. THAT RULE IS NOW EVALUATED LIVE AGAINST EVERY ENROLLED IDENTITY —
                  NOT ONLY AGAINST THE VICTIM. THE NEXT 1,283 IDENTITIES THAT SEE THIS SHAPE OF BEHAVIOUR ARE
                  CONTAINED BEFORE THEY REACH A PAYOUT.
                </p>
              </motion.div>
            ) : (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-[10px] leading-relaxed tracking-[0.06em] text-[#3d3d3d]"
              >
                AWAITING A CONTAINED ATTACK TO PRODUCE A SIGNATURE.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-3 border-t border-[#1a1a1a] px-4 py-3"
        style={{ background: armed ? 'rgba(53,255,114,0.05)' : 'transparent' }}
      >
        <span className="font-mono text-[9px] tracking-[0.18em] text-[#4a4a4a]">
          THE ATTACK WAS THE VACCINE
        </span>
        <TerminalButton
          label="VIEW FINAL SYSTEM STATE →"
          tone="ok"
          size="sm"
          active={armed}
          onClick={() => document.getElementById('it-goal')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        />
      </div>
    </Panel>
  )
}

/* --------------------------------------------------------------- coverage */

function CoveragePanel({ armed }: { armed: boolean }) {
  const pop = useCountUp(armed ? VACCINE_RULE.populationTested : 0, 2000, 300)
  return (
    <Panel title="RULE COVERAGE" cutSize="md" tone="soft" right={<Badge tone="neutral">{VACCINE_RULE.version}</Badge>}>
      <div className="space-y-1 px-3 py-3">
        <KeyValue k="IDENTITIES COVERED" v={Math.round(pop).toLocaleString('en-IN')} tone="ok" />
        <KeyValue k="SEGMENTS" v="7 OF 7" tone="ash" />
        <KeyValue k="EVALUATION MODE" v="SHADOW → BLOCKING" tone="soft" />
        <KeyValue k="ROLLOUT" v="HIGH VALUE FIRST" tone="ash" />
        <KeyValue k="FALSE POSITIVE RATE" v={armed ? VACCINE_RULE.falsePositiveRate : '—'} tone={armed ? 'warn' : 'ash'} />
      </div>

      <div className="border-t border-[#1a1a1a] px-3 py-2.5">
        <SectionLabel right={<span className="font-mono text-[9px] tnum text-[#3d3d3d]">{armed ? '100%' : '0%'}</span>}>
          SEGMENT COVERAGE
        </SectionLabel>
        <ul className="mt-2 space-y-[3px]">
          {[
            ['PRIORITY / HIGH VALUE', 342],
            ['STANDARD', 611],
            ['SOVEREIGN / ENTERPRISE', 128],
            ['MERCHANT', 143],
            ['PARTNER API', 60],
          ].map(([name, count], i) => {
            const w = armed ? ((count as number) / 611) * 100 : 0
            return (
              <li key={name as string} className="flex items-center gap-2">
                <span className="w-[132px] shrink-0 truncate font-mono text-[9px] tracking-[0.08em] text-[#4a4a4a]">
                  {name}
                </span>
                <span className="relative h-[8px] flex-1" style={{ background: '#141414' }}>
                  <motion.span
                    className="absolute inset-y-0 left-0"
                    style={{ background: '#5b72ff', boxShadow: '0 0 8px rgba(91,114,255,0.7)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${w}%` }}
                    transition={{ duration: 0.8, delay: armed ? i * 0.1 : 0 }}
                  />
                  <span className="absolute inset-0 pixel-grid-sm-dark opacity-60" aria-hidden />
                </span>
                <span className="w-[34px] shrink-0 text-right font-mono text-[9px] tnum text-ash">{count as number}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </Panel>
  )
}

/* -------------------------------------------------------------------- page */

export function Vaccination() {
  const sim = useSim()
  const navigate = useNavigate()
  const armed = sim.ruleDeployed
  const [runId, setRunId] = useState(0)

  // Re-run the terminal pipeline whenever the rule actually lands.
  useEffect(() => {
    if (armed) setRunId((n) => n + 1)
  }, [armed])

  return (
    <div className="space-y-4">
      <CanaryBanner />

      {/* headline */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusPip tone={armed ? 'ok' : 'neutral'} pulse={armed} />
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted">
              {armed ? 'SIGNATURE LEARNED · RULE IN PRODUCTION' : 'BEHAVIOURAL IMMUNITY SYSTEM'}
            </span>
          </div>
          <h2 className="mt-2 font-pixel-sm text-bone terminal-glow">SECURITY VACCINATION</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TerminalButton label="OPEN INCIDENT" tone="blue" size="sm" onClick={() => navigate('/incidents')} />
          <TerminalButton
            label={armed ? 'REPLAY PIPELINE' : '▶ EXTRACT SIGNATURE'}
            tone={armed ? 'ok' : 'blue'}
            size="sm"
            active={armed}
            onClick={() => {
              if (armed) setRunId((n) => n + 1)
              else sim.goToStage(10)
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <PipelinePanel armed={armed} runId={runId} onDeploy={() => sim.goToStage(10)} />
          <RuleCard armed={armed} />
          <ImpactPanel armed={armed} />
        </div>

        <div className="space-y-4">
          <CoveragePanel armed={armed} />

          <Panel title="WHY IT WORKS" cutSize="md" tone="neutral">
            <ol className="space-y-3 px-3 py-3">
              {[
                ['01', 'ATTACK REPLAYED AS DATA', 'The incident is not a story. It is a feature vector the engine can score against.'],
                ['02', 'GENERALISED, NOT MEMORISED', 'The rule captures the shape of the behaviour, never the identity of the attacker.'],
                ['03', 'TESTED BEFORE DEPLOYMENT', 'Replayed across the whole identity population to bound false positives.'],
                ['04', 'EVALUATED LIVE, ALWAYS', 'From this moment the rule runs on every session, not just the victim’s.'],
              ].map(([n, title, body]) => (
                <li key={n} className="flex gap-3">
                  <span className="shrink-0 font-pixel-xs text-soft">{n}</span>
                  <span className="min-w-0">
                    <span className="block font-pixel-xs text-bone">{title}</span>
                    <span className="mt-1.5 block font-mono text-[10px] leading-relaxed tracking-[0.04em] text-muted">
                      {body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>

          <SubFrame tone="ok" cutSize="sm">
            <div className="px-3 py-3">
              <SectionLabel right={<Caret tone="ok" />}>SYSTEM PROMISE</SectionLabel>
              <p
                className="mt-2 font-pixel-xs leading-[2] text-ok"
                style={{ textShadow: '0 0 14px rgba(53,255,114,0.35)' }}
              >
                THE USER IS NEVER LOCKED OUT OF THEIR OWN ACCOUNT. THE ATTACKER NEVER LEARNS THEY WERE CAUGHT.
              </p>
            </div>
          </SubFrame>

          <Panel title="NEXT" cutSize="md" tone="soft">
            <div className="space-y-2 px-3 py-3">
              <TerminalButton label="FINAL SYSTEM STATE →" tone="ok" size="sm" block onClick={() => navigate('/conclusion')} />
              <TerminalButton label="REPLAY FULL ATTACK" tone="blue" size="sm" block onClick={sim.start} />
              <TerminalButton label="BACK TO COMMAND CENTER" tone="neutral" size="sm" block onClick={() => navigate('/console')} />
            </div>
            <div className="border-t border-[#1a1a1a] px-3 py-[6px] font-mono text-[9px] tracking-[0.14em] text-[#4a4a4a]">
              RULE {VACCINE_RULE.id} · {VACCINE_RULE.version}
            </div>
          </Panel>
        </div>
      </div>

      <div
        id="it-goal"
        className="relative scroll-mt-6 px-4 py-4"
        style={{ ...cut('md'), background: armed ? 'rgba(53,255,114,0.05)' : '#0b0b0b', boxShadow: armed ? 'inset 0 0 0 1px rgba(53,255,114,0.3)' : 'inset 0 0 0 1px #1c1c1c' }}
      >
        <div className="flex flex-wrap items-center justify-center gap-4 text-center">
          <span className="font-mono text-[10px] tracking-[0.14em] text-[#4a4a4a]">
            {armed ? '1 ATTACK DOWN. 1 RULE UP. EVERYONE ELSE INVISIBLE TO THE NEXT ONE.' : 'NO VACCINATION WITHOUT AN ATTACK.'}
          </span>
          <TerminalButton label="OPEN FINAL SCREEN" tone="ok" size="sm" onClick={() => navigate('/conclusion')} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#161616] pt-3 font-mono text-[9px] tracking-[0.18em] text-[#3d3d3d]">
        <span>SIMULATION ENVIRONMENT · SYNTHETIC DATA · NO REAL IDENTITIES</span>
        <span>RULE {VACCINE_RULE.id} · {armed ? 'DEPLOYED TO ALL SEGMENTS' : 'NOT DEPLOYED'}</span>
      </div>
    </div>
  )
}
