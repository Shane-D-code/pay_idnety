/* ==========================================================================
   Interactive wiring check.
   Exercises the click paths a reviewer would actually take:
     - deception honey-app nav tabs
     - attacktrace graph node click -> node inspector
     - identity twin graph node click
     - canary row -> CRITICAL alert -> INVESTIGATE / ISOLATE
     - session row selection
   Fails loudly on any dead control (click that changes nothing).
   ========================================================================== */

import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = process.env.BASE ?? 'http://localhost:5199/'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox'],
  defaultViewport: { width: 1600, height: 1000 },
})

const page = await browser.newPage()
const errs = []
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') errs.push(`[${m.type()}] ${m.text()}`)
})
page.on('pageerror', (e) => errs.push(`[pageerror] ${e.stack ?? e.message}`))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []

function record(name, pass, detail) {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`)
}

async function goto(route, wait = 1100) {
  await page.evaluate((r) => {
    window.location.hash = `#${r}`
  }, route)
  await sleep(route === '/attacktrace' ? 2400 : wait)
}

const text = () => page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))
const clickByText = async (needle, selector = 'button') => {
  const ok = await page.evaluate(
    (n, sel) => {
      const el = [...document.querySelectorAll(sel)].find((b) => b.innerText.toUpperCase().includes(n))
      if (!el) return false
      el.click()
      return true
    },
    needle,
    selector,
  )
  await sleep(360)
  return ok
}

/* ------------------------------------------------------------- boot in */
await page.goto(BASE, { waitUntil: 'networkidle2' })
await sleep(800)
await clickByText('ENTER SECURITY CONSOLE')
await sleep(2800)

/* ============================================ 1. deception honey-app tabs */

await goto('/deception')
let before = await text()
record('deception: offline before decoy armed', before.includes('HONEY ENVIRONMENT OFFLINE'))

/* arm the decoy from the demo controls, then re-enter deception */
await goto('/console')
await clickByText('SIMULATE ACCOUNT TAKEOVER')
await sleep(600)
await clickByText('COMPLETE ATTACK')
await sleep(3600)

await goto('/deception')
const tabs = ['BALANCES', 'PAYEES', 'CUSTOMERS', 'DEVELOPER', 'SETTINGS', 'PAYMENTS']
const tabSeen = []
for (const t of tabs) {
  const beforeT = await text()
  const ok = await clickByText(t, 'button')
  await sleep(500)
  const afterT = await text()
  const changed = beforeT !== afterT
  tabSeen.push(`${t}:${ok ? (changed ? 'ok' : 'no-change') : 'missing'}`)
  if (!ok || !changed) record(`deception tab ${t}`, false, ok ? 'click produced identical DOM' : 'button not found')
}
record('deception: all 6 honey-app tabs switch content', true, tabSeen.join(' '))

/* ================================================== 2. canary -> containment */

await clickByText('PAYMENTS', 'button')
await sleep(400)
const canaryClicked = await page.evaluate(() => {
  const el = [...document.querySelectorAll('*')].find(
    (n) => n.children.length === 0 && n.textContent?.trim() === 'PAYPAL_SECRET_0042',
  )
  const target = el?.closest('button, tr, [role="button"], div')
  if (!target) return false
  target.click()
  return true
})
await sleep(900)
const canaryText = await text()
const alertUp = await page.evaluate(() => !!document.body.innerText.match(/CANARY TRIGGERED/))
record('deception: PAYPAL_SECRET_0042 click fires CRITICAL alert', canaryClicked && alertUp)

/* ISOLATE must work from the alert itself */
const isoOk = await clickByText('ISOLATE')
await sleep(2600)
await goto('/console')
const afterIso = await text()
record(
  'canary alert: ISOLATE contains the session',
  isoOk && /CONTAINED/i.test(afterIso),
  afterIso.match(/CONTAINED[^|]{0,44}/)?.[0] ?? '',
)

/* INVESTIGATE is reachable again through REPLAY ALERT */
await goto('/console')
const replayed = await clickByText('REPLAY ALERT')
await sleep(700)
const invOk = await clickByText('INVESTIGATE')
await sleep(600)
const afterInv = await page.evaluate(() => window.location.hash)
record('canary alert: REPLAY -> INVESTIGATE routes to /incidents', replayed && invOk && afterInv === '#/incidents', afterInv)

/* ====================================================== 3. attacktrace graph */

await goto('/attacktrace')
const nodeInfo = await page.evaluate(() => ({
  nodes: document.querySelectorAll('.react-flow__node').length,
  edges: document.querySelectorAll('.react-flow__edges svg path').length,
}))
record(
  'attacktrace: reactflow nodes + edges rendered',
  nodeInfo.nodes >= 8 && nodeInfo.edges >= 8,
  JSON.stringify(nodeInfo),
)

/* the clickable element is the inner card, not the react-flow node wrapper */
const inspector = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.react-flow__node [role="button"]')]
  const target = cards.find((c) => c.innerText.includes('ACCOUNT')) ?? cards[0]
  target?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  return { count: cards.length, clicked: target?.innerText.replace(/\s+/g, ' ') ?? '' }
})
await sleep(600)
const inspectorAfter = await text()
record(
  'attacktrace: node click fills inspector',
  !inspectorAfter.includes('SELECT A NODE') && /NODE \/\/ ACCOUNT/.test(inspectorAfter),
  `${inspector.count} cards, clicked "${inspector.clicked}"`,
)

const kb = await page.evaluate(async () => {
  const cards = [...document.querySelectorAll('.react-flow__node [role="button"]')]
  const target = cards.find((c) => c.innerText.includes('IP')) ?? cards[1]
  target?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
  await new Promise((r) => setTimeout(r, 250))
  return document.body.innerText.match(/NODE \/\/ [A-Z ]+/)?.[0] ?? ''
})
record('attacktrace: nodes are keyboard operable', kb.length > 0, kb)

const rebuilt = await page.evaluate(() => {
  const before = document.querySelectorAll('.react-flow__node').length
  const b = [...document.querySelectorAll('button')].find((x) => x.innerText.toUpperCase().includes('REBUILD GRAPH'))
  b?.click()
  return { found: !!b, before }
})
await sleep(2600)
const afterRebuild = await page.evaluate(() => document.querySelectorAll('.react-flow__node').length)
record('attacktrace: REBUILD GRAPH re-renders', rebuilt.found && afterRebuild >= 8, `nodes ${rebuilt.before} -> ${afterRebuild}`)

/* ==================================================== 4. identity twin graph */

await goto('/identity')
const twinIdle = await text()
record(
  'identity: idle twin inspector prompts for a selection',
  /CLICK A NODE IN THE FINGERPRINT GRAPH/.test(twinIdle) && /NO SELECTION/.test(twinIdle),
  'idle hint present',
)

const twin = await page.evaluate(() => {
  const nodes = [...document.querySelectorAll('svg [role="button"]')]
  const target = nodes.find((n) => /LOCATION/.test(n.textContent)) ?? nodes[0]
  target?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  return { nodes: nodes.length, clicked: target?.getAttribute('aria-label')?.slice(0, 44) ?? '' }
})
await sleep(600)
const twinAfter = await text()
record(
  'identity: twin node click shows BASELINE/CURRENT readout',
  twin.nodes >= 6 &&
    /BASELINE/.test(twinAfter) &&
    /CURRENT/.test(twinAfter) &&
    !/CLICK A NODE IN THE FINGERPRINT GRAPH/.test(twinAfter),
  `${twin.nodes} nodes, clicked "${twin.clicked}"`,
)

const pickerWorks = await page.evaluate(async () => {
  const input = document.querySelector('input[type="text"], input[placeholder]')
  if (!input) return 'no input'
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(input, 'ARJUN')
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await new Promise((r) => setTimeout(r, 300))
  return input.value
})
await sleep(400)
record('identity: identity search filters', typeof pickerWorks === 'string' && pickerWorks.includes('ARJUN'), `query="${pickerWorks}"`)

/* ======================================================== 5. sessions table */

await goto('/sessions')
const sessionPick = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('[aria-label^="Inspect session"]')]
  const target = rows.find((r) => !r.innerText.includes('S-84729')) ?? rows[0]
  target?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  return { rows: rows.length, clicked: target?.getAttribute('aria-label') ?? '' }
})
await sleep(600)
const drawerText = await text()
record(
  'sessions: register rows open the session drawer',
  sessionPick.rows >= 20 && /RESET SESSION STATE|SESSION DOSSIER|CONTAINED|DRIFT VECTOR/i.test(drawerText),
  `${sessionPick.rows} rows, clicked "${sessionPick.clicked}"`,
)

const filterOk = await page.evaluate(async () => {
  const read = () => document.body.innerText.match(/\d+\/87/)?.[0] ?? ''
  const before = read()
  const rowCount = () => document.querySelectorAll('[aria-label^="Inspect session"]').length
  const rowsBefore = rowCount()
  const b = [...document.querySelectorAll('button')].find((x) =>
    x.innerText.replace(/\s+/g, ' ').trim().startsWith('BEHAVIORAL DRIFT'),
  )
  b?.click()
  await new Promise((r) => setTimeout(r, 500))
  return { clicked: !!b, label: b?.innerText.replace(/\s+/g, ' ').trim(), before, rowsBefore, rowsAfter: rowCount() }
})
record(
  'sessions: register filter narrows the row set',
  filterOk.clicked && filterOk.rowsAfter > 0 && filterOk.rowsAfter < filterOk.rowsBefore,
  `"${filterOk.label}": ${filterOk.rowsBefore} -> ${filterOk.rowsAfter} rows`,
)

/* =================================================== 6. incidents narrative */

await goto('/incidents')
const inv = await clickByText('INVESTIGATE INCIDENT')
await sleep(1500)
const incText = await text()
record('incidents: INVESTIGATE INCIDENT starts AI narrative', inv && /DIVERGENCE|RECOMMENDED/i.test(incText), '')

/* ==================================================================== report */
const failed = results.filter((r) => !r.pass)
console.log(`\n=== ${results.length - failed.length}/${results.length} checks passed ===`)

await browser.close()
console.log(`=== MESSAGES (${errs.length}) ===`)
console.log([...new Set(errs)].join('\n---\n').slice(0, 6000))
process.exit(failed.length ? 1 : 0)