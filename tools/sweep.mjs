/* Full-app responsive sweep: one browser, every route, every breakpoint.
   Not part of the app. */
import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = process.env.BASE ?? 'http://localhost:5178/'

const ROUTES = [
  '#/', '#/console', '#/identity', '#/sessions', '#/simulation',
  '#/attacktrace', '#/deception', '#/incidents', '#/vaccination', '#/conclusion',
]
const VIEWPORTS = [
  { w: 1600, h: 1000 },
  { w: 1366, h: 768 },
  { w: 1024, h: 768 },
  { w: 768, h: 1024 },
  { w: 390, h: 844 },
]

const MEASURE = () => {
  const de = document.documentElement
  const overflow = []
  const clipped = []
  const masked = []
  const fontsUsed = new Set()

  const isOutOfFlow = (el) => {
    const pos = getComputedStyle(el).position
    return pos === 'absolute' || pos === 'fixed'
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
    fontsUsed.add(cs.fontFamily.split(',')[0].replace(/["']/g, ''))
    const o = cs.overflowX
    if (o === 'auto' || o === 'scroll' || cs.position === 'fixed') return
    const bad = inFlowOverflow(el)
    if (bad) {
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30)
      const row = `${el.tagName}.${el.className.toString().slice(0, 28)} [${bad}] :: ${t}`
      if (o === 'hidden' || o === 'clip') masked.push(row)
      else overflow.push(row)
    }
    if (cs.clipPath !== 'none' && el.scrollHeight > el.clientHeight + 4) {
      clipped.push(`${el.tagName}.${el.className.toString().slice(0, 28)}`)
    }
  })

  return {
    scrollW: de.scrollWidth,
    clientW: de.clientWidth,
    fonts: [...fontsUsed],
    pixelFont: document.fonts.check('12px "Press Start 2P"'),
    overflow,
    masked: [...new Set(masked)],
    clipped: [...new Set(clipped)],
    text: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 70),
  }
}

const launch = () =>
  puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--force-device-scale-factor=1'],
  })

let browser = await launch()

/* Headless Chrome on this machine is prone to dropping its CDP connection after
   a few dozen page opens, and to detaching frames mid-measurement. Retry with a
   fresh page, then a fresh browser, rather than reporting phantom failures. */
async function measure(vp, route) {
  const attempt = async (browser) => {
    const page = await browser.newPage()
    const errs = []
    page.on('console', (m) => m.type() === 'error' && errs.push(m.text()))
    page.on('pageerror', (e) => errs.push(`PAGEERROR ${e.message}`))
    try {
      await page.setViewport({ width: vp.w, height: vp.h })
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0' })
      await new Promise((r) => setTimeout(r, 2400))
      const m = await page.evaluate(MEASURE)
      await page.close()
      return { ...m, errs }
    } catch (e) {
      try { await page.close() } catch {}
      throw e
    }
  }

  for (let tries = 0; tries < 4; tries++) {
    if (!browser || !browser.connected) {
      browser = await launch()
    }
    try {
      return await attempt(browser)
    } catch (e) {
      const msg = String(e.message).split('\n')[0]
      if (/Connection closed|detached Frame|Target closed|Session closed/i.test(msg)) {
        try { await browser.close() } catch {}
        browser = null
        await new Promise((r) => setTimeout(r, 800))
        continue
      }
      return { scrollW: 0, clientW: 0, fonts: [], pixelFont: false, overflow: [], masked: [], clipped: [], text: '', errs: [`HARNESS ${msg}`] }
    }
  }
  return { scrollW: 0, clientW: 0, fonts: [], pixelFont: false, overflow: [], masked: [], clipped: [], text: '', errs: ['HARNESS gave up after 4 attempts'] }
}

let failures = 0
for (const vp of VIEWPORTS) {
  const rows = []
  for (const route of ROUTES) {
    const m = await measure(vp, route)
    const hScroll = m.scrollW > m.clientW + 1
    const bad = m.overflow.length > 0 || hScroll || m.errs.length > 0 || !m.pixelFont
    if (bad) failures++
    rows.push({ route, ...m, hScroll, errs: m.errs })
  }

  const label = `${vp.w}x${vp.h}`.padEnd(10)
  console.log(`\n${label} ${failures === 0 ? 'CLEAN' : ''}`)
  for (const r of rows) {
    const flags = []
    if (r.hScroll) flags.push(`H-SCROLL ${r.scrollW}>${r.clientW}`)
    if (r.overflow.length) flags.push(`OVERFLOW x${r.overflow.length}`)
    if (r.errs.length) flags.push(`ERRORS x${r.errs.length}`)
    if (!r.pixelFont) flags.push('PIXEL FONT MISSING')
    console.log(
      `  ${flags.length ? 'FAIL' : ' ok '} ${r.route.padEnd(15)} h=${String(r.scrollH ?? '').padEnd(0)}${flags.length ? ' ' + flags.join(' | ') : ''}`,
    )
    if (r.overflow.length) r.overflow.forEach((o) => console.log(`        ${o}`))
    if (r.errs.length) r.errs.slice(0, 3).forEach((e) => console.log(`        ${e}`))
    if (r.masked.length) r.masked.forEach((o) => console.log(`        (masked/intentional) ${o}`))
  }
}

console.log(`\n${failures === 0 ? 'ALL CLEAN' : `${failures} page/viewport combinations with findings`}`)
await browser.close()
