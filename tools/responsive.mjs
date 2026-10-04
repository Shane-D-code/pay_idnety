/* ==========================================================================
   Responsive check across the three target desktop widths (plus a phone).
   Reports horizontal overflow, elements pushed outside the viewport, and
   control counts per route. Anything wider than the viewport is a layout bug.
   ========================================================================== */

import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = process.env.BASE ?? 'http://localhost:5199/'
const ROUTES = ['/', '/console', '/identity', '/sessions', '/simulation', '/attacktrace', '/deception', '/incidents', '/vaccination']
const SIZES = [
  { w: 1920, h: 1080, label: '1920x1080' },
  { w: 1440, h: 900, label: '1440x900' },
  { w: 1280, h: 800, label: '1280x800' },
  { w: 390, h: 844, label: '390x844' },
]

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--hide-scrollbars'],
})

const problems = []
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

for (const size of SIZES) {
  const page = await browser.newPage()
  await page.setViewport({ width: size.w, height: size.h })
  const errs = []
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errs.push(`[${m.type()}] ${m.text().slice(0, 200)}`)
  })
  page.on('pageerror', (e) => errs.push(`[pageerror] ${e.message}`))

  /* boot once per viewport so the console routes exist */
  await page.goto(BASE, { waitUntil: 'networkidle2' })
  await sleep(700)
  await page.evaluate(() =>
    [...document.querySelectorAll('button')].find((e) => e.innerText.toLowerCase().includes('enter security console'))?.click(),
  )
  await sleep(2800)

  console.log(`\n--- ${size.label} ---`)
  for (const r of ROUTES) {
    await page.evaluate((route) => {
      window.location.hash = `#${route}`
    }, r)
    await sleep(r === '/attacktrace' ? 2400 : 1300)

    const m = await page.evaluate((vw) => {
      const de = document.documentElement
      const overflowX = Math.max(de.scrollWidth, document.body.scrollWidth) - vw
      /* find the widest offenders that actually stick out past the viewport */
      const offenders = []
      for (const el of document.querySelectorAll('main *, body > div *')) {
        const b = el.getBoundingClientRect()
        if (b.width === 0 || b.height === 0) continue
        const right = b.right + window.scrollX
        if (right > vw + 2) {
          offenders.push(`${el.tagName.toLowerCase()}.${String(el.className || '').split(' ')[0]} right=${Math.round(right)}`)
        }
      }
      return {
        overflowX,
        offenders: offenders.slice(0, 4),
        buttons: document.querySelectorAll('button').length,
        chars: document.body.innerText.length,
      }
    }, size.w)

    const bad = m.overflowX > 2
    if (bad) problems.push(`${size.label} ${r}: overflowX=${m.overflowX} :: ${m.offenders.join(' ; ')}`)
    console.log(
      `${bad ? 'OVERFLOW' : 'ok      '} ${r.padEnd(13)} overflowX=${String(m.overflowX).padStart(4)} buttons=${String(m.buttons).padStart(3)} chars=${m.chars}` +
        (m.offenders.length ? `\n            ${m.offenders.join('\n            ')}` : ''),
    )
  }
  if (errs.length) console.log(`  console: ${[...new Set(errs)].join(' | ')}`)
  await page.close()
}

await browser.close()
console.log(`\n=== ${problems.length} overflow problems ===`)
process.exit(problems.length ? 1 : 0)