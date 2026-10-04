/* Stateful verification: drive the simulation, then measure each page in its
   post-attack state. Not part of the app. */
import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = process.env.BASE ?? 'http://localhost:5178/'

const routes = (process.argv[2] ?? '#/sessions,#/incidents,#/vaccination').split(',')
const width = Number(process.argv[3] ?? 1600)
const height = Number(process.argv[4] ?? 1000)

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--force-device-scale-factor=1'],
  defaultViewport: { width, height },
})

const page = await browser.newPage()
const consoleErrors = []
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR ${e.message}`))

// land, then run the whole scenario from the command center
await page.goto(`${BASE}#/console`, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 1200))

const clickByText = async (text) => {
  const handle = await page.evaluateHandle((t) => {
    const els = [...document.querySelectorAll('button')]
    return els.find((e) => (e.innerText || '').toUpperCase().includes(t)) ?? null
  }, text.toUpperCase())
  const el = handle.asElement()
  if (!el) throw new Error(`button not found: ${text}`)
  await el.click()
  return true
}

await clickByText('SIMULATE ATTACK')
await new Promise((r) => setTimeout(r, 1600))
const midStage = await page.evaluate(() => document.body.innerText.includes('ATTACK SIMULATION'))

// jump straight to the vaccination stage through the demo control rail
await clickByText('COMPLETE ATTACK')
await new Promise((r) => setTimeout(r, 6000))

const simState = await page.evaluate(() => {
  const t = document.body.innerText
  return {
    contained: t.includes('ATTACK CONTAINED'),
    hasCanary: t.includes('CANARY'),
    hasRule: t.includes('VT-2048') || t.includes('SIGNATURE'),
  }
})

const report = []
for (const r of routes) {
  await page.goto(`${BASE}${r}`, { waitUntil: 'networkidle0' })
  await new Promise((res) => setTimeout(res, 4200)) // let count-ups and loaders finish

  const data = await page.evaluate(() => {
    const de = document.documentElement
    const overflow = []
    const clipped = []
    const masked = []
    /* Geometric in-flow overflow, same rule as tools/sweep.mjs: a scrollWidth
       check false-positives on React Flow's transformed viewport and on glow
       pulses, so compare the content box against in-flow children instead. */
    const isOutOfFlow = (el) => {
      const p = getComputedStyle(el).position
      return p === 'absolute' || p === 'fixed'
    }
    const inFlowOverflow = (el) => {
      const ns = el.namespaceURI
      if (ns && ns !== 'http://www.w3.org/1999/xhtml') return null
      const cs = getComputedStyle(el)
      if (cs.display === 'inline') return null
      const box = el.getBoundingClientRect()
      if (!box.width) return null
      const rightLimit = box.right - (parseFloat(cs.paddingRight) || 0)
      const bottomLimit = box.bottom - (parseFloat(cs.paddingBottom) || 0)
      let worstRight = -Infinity
      let worstBottom = -Infinity
      let culprit = ''
      for (const child of el.children) {
        if (isOutOfFlow(child)) continue
        const r = child.getBoundingClientRect()
        if (!r.width && !r.height) continue
        if (r.right > worstRight) {
          worstRight = r.right
          culprit = (child.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 26)
        }
        if (r.bottom > worstBottom) worstBottom = r.bottom
      }
      const dx = Math.round(worstRight - rightLimit)
      const dy = Math.round(worstBottom - bottomLimit)
      if (dx > 2 || dy > 2) return `x+${dx} y+${dy}${culprit ? ` "${culprit}"` : ''}`
      return null
    }
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el)
      const o = cs.overflowX
      if (o === 'auto' || o === 'scroll' || cs.position === 'fixed') return
      const bad = inFlowOverflow(el)
      if (bad) {
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30)
        const row = `${el.tagName}.${el.className.toString().slice(0, 28)} [${bad}] :: ${t}`
        if (o === 'hidden' || o === 'clip') masked.push(row)
        else overflow.push(row)
      }
    })
    document.querySelectorAll('section, div, span, h1, h2, p, li').forEach((el) => {
      const cs = getComputedStyle(el)
      if (cs.clipPath !== 'none' && el.scrollHeight > el.clientHeight + 4) {
        clipped.push(`${el.tagName}.${el.className.toString().slice(0, 30)}`)
      }
    })
    return {
      scrollW: de.scrollWidth,
      clientW: de.clientWidth,
      scrollH: de.scrollHeight,
      overflow: overflow.slice(0, 14),
      masked: [...new Set(masked)].slice(0, 6),
      clipped: [...new Set(clipped)].slice(0, 8),
      text: (document.body.innerText || '').replace(/\s+/g, ' '),
    }
  })
  report.push({ route: r, ...data })
}

/* Assertions the simulation must satisfy once fully driven, checked per route so
   a regression in any single view is attributable. */
const MUST_CONTAIN = {
  '#/console': ['LIVE INCIDENT S-84729', 'STAGE 10'],
  '#/identity': ['ISOLATED'],
  '#/sessions': ['S-84729', 'ISOLATED'],
  '#/simulation': ['ATTACK CONTAINED', '100'],
  '#/attacktrace': ['8 / 8', 'CANARY TRIGGERED', 'ISOLATED'],
  '#/deception': ['DECOY ACTIVE', 'SYNTHETIC', 'NONE'],
  '#/incidents': ['INC-84729', 'RECOMMENDED ACTION', 'AUTOMATED EXECUTED'],
  '#/vaccination': ['VT-2048', '1,284 IDENTITIES PROTECTED'],
}

const fails = []
for (const r of report) {
  const flags = []
  if (r.scrollW > r.clientW + 1) flags.push(`H-SCROLL ${r.scrollW}>${r.clientW}`)
  if (r.overflow.length) flags.push(`OVERFLOW x${r.overflow.length}`)
  if (r.clipped.length) flags.push(`CLIP-PATH x${r.clipped.length}`)
  for (const needle of MUST_CONTAIN[r.route] ?? []) {
    if (!r.text.includes(needle)) flags.push(`MISSING "${needle}"`)
  }
  if (flags.length) fails.push({ route: r.route, flags, overflow: r.overflow, clipped: r.clipped })
}

console.log(JSON.stringify({ viewport: `${width}x${height}`, midStage, simState, report, consoleErrors }, null, 1))
console.log(`\n=== post-attack assertion @ ${width}x${height} ===`)
for (const r of report) {
  const bad = fails.find((f) => f.route === r.route)
  console.log(`  ${bad ? 'FAIL' : ' ok '} ${r.route.padEnd(15)} scrollW ${r.scrollW}/${r.clientW}${bad ? ' :: ' + bad.flags.join(' | ') : ''}`)
  if (bad?.overflow.length) bad.overflow.forEach((o) => console.log(`         ${o}`))
  if (bad?.clipped.length) bad.clipped.forEach((o) => console.log(`         clipPath ${o}`))
  if (r.masked?.length) r.masked.forEach((o) => console.log(`         (masked/intentional) ${o}`))
}
if (consoleErrors.length) console.log(`  console errors: ${JSON.stringify(consoleErrors)}`)
console.log(fails.length || consoleErrors.length ? `  ${fails.length} FAILING ROUTES` : '  ALL POST-ATTACK ASSERTIONS PASS')
await browser.close()
