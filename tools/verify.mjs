/* Headless verification harness for the IdentityTwin frontend.
   Not part of the app — used to measure layout, fonts and console health. */
import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = process.env.BASE ?? 'http://localhost:5178/'

const routes = process.argv[2] ? process.argv[2].split(',') : ['#/', '#/console']
const width = Number(process.argv[3] ?? 1600)
const height = Number(process.argv[4] ?? 1000)
const wait = Number(process.argv[5] ?? 1800)

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--force-device-scale-factor=1', '--hide-scrollbars=false'],
  defaultViewport: { width, height },
})

const report = []
const errors = []

for (const r of routes) {
  const page = await browser.newPage()
  const consoleErrors = []
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text())
  })
  page.on('pageerror', (e) => consoleErrors.push(`PAGEERROR ${e.message}`))

  await page.goto(`${BASE}${r}`, { waitUntil: 'networkidle0' })
  await new Promise((res) => setTimeout(res, wait))

  const data = await page.evaluate(() => {
    const de = document.documentElement
    const overflow = []
    const clipped = []
    const clippedContent = []
    const fontsUsed = new Set()
    // Geometric in-flow overflow: compare each element's content box against the
    // right/bottom edge of its in-flow children. Decorative absolutely positioned
    // children (glow pulses, scan bars) and SVG text (letter-spacing inflates
    // scrollWidth) are excluded — neither can produce a visible cut.
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
          culprit = (child.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30)
        }
        if (r.bottom > worstBottom) worstBottom = r.bottom
      }
      const dx = Math.round(worstRight - rightLimit)
      const dy = Math.round(worstBottom - bottomLimit)
      if (dx > 2 || dy > 2) return `x+${dx} y+${dy} ${culprit ? `child:"${culprit}"` : ''}`
      return null
    }
    document.querySelectorAll('*').forEach((el) => {
      const cs = getComputedStyle(el)
      fontsUsed.add(cs.fontFamily.split(',')[0].replace(/["']/g, ''))
      const o = cs.overflowX
      if (o === 'auto' || o === 'scroll' || cs.position === 'fixed') return
      const bad = inFlowOverflow(el)
      if (!bad) return
      const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 34)
      const row = `${el.tagName}.${el.className.toString().slice(0, 30)} [${bad}] :: ${t}`
      /* overflow:hidden/clip means the content is deliberately masked (marquee,
         gradient edge) — report separately so real leaks stay obvious */
      if (o === 'hidden' || o === 'clip') clippedContent.push(row)
      else overflow.push(row)
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
      fonts: [...fontsUsed],
      pixelFontLoaded: document.fonts.check('12px "Press Start 2P"'),
      displayFontLoaded: document.fonts.check('12px "Pixelify Sans"'),
      monoLoaded: document.fonts.check('12px "JetBrains Mono"'),
      text: (document.body.innerText || '').replace(/\s+/g, ' ').slice(0, 160),
      overflow: overflow.slice(0, 14),
      clippedByOverflowHidden: [...new Set(clippedContent)].slice(0, 6),
      clipped: [...new Set(clipped)].slice(0, 8),
    }
  })

  errors.push({ route: r, consoleErrors: consoleErrors.slice(0, 6) })
  report.push({ route: r, ...data })
  await page.close()
}

console.log(JSON.stringify({ viewport: `${width}x${height}`, report, errors }, null, 1))
await browser.close()