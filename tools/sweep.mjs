/* ==========================================================================
   Full-attack route sweep.
   Boots the landing page, walks every console route at three simulation
   checkpoints (idle, mid-attack, complete) and reports console errors plus a
   text digest per route so regressions in rendered content are visible.
   ========================================================================== */

import puppeteer from 'puppeteer-core'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = process.env.BASE ?? 'http://localhost:5199/'
const ROUTES = ['/console', '/identity', '/sessions', '/simulation', '/attacktrace', '/deception', '/incidents', '/vaccination']

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

async function goto(route) {
  await page.evaluate((r) => {
    window.location.hash = `#${r}`
  }, route)
  /* /attacktrace runs a deliberate 1.2s indexing loader before it renders */
  await sleep(route === '/attacktrace' ? 2200 : 1100)
}

async function digest(route) {
  return page.evaluate((r) => {
    const main = document.querySelector('main')
    if (!main) return { route: r, chars: 0, headings: [], text: '' }
    const text = main.innerText.replace(/\s+/g, ' ').trim()
    const headings = [...main.querySelectorAll('h1,h2,h3')].map((h) => h.innerText.trim()).slice(0, 6)
    return { route: r, chars: text.length, headings, text: text.slice(0, 260) }
  }, route)
}

/** Click the demo control's named button inside the popover. */
async function demo(label) {
  const ok = await page.evaluate((l) => {
    /* TerminalButton injects a caret span, so match on inclusion not equality */
    const btn = [...document.querySelectorAll('button')].find((b) => b.innerText.toUpperCase().includes(l))
    if (!btn) return false
    btn.click()
    return true
  }, label)
  await sleep(220)
  return ok
}

async function openDemo() {
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.innerText.includes('DEMO CONTROL'))
    btn?.click()
  })
  await sleep(320)
}

/* ------------------------------------------------------------- landing */

await page.goto(BASE, { waitUntil: 'networkidle2' })
await sleep(900)
const landing = await page.evaluate(() => ({
  scrollH: document.body.scrollHeight,
  chars: document.body.innerText.length,
  headline: document.querySelector('h1')?.innerText.replace(/\s+/g, ' ') ?? '',
}))
console.log('LANDING', JSON.stringify(landing))

/* enter console via the boot gate */
await page.evaluate(() => {
  const el = [...document.querySelectorAll('button')].find((e) =>
    e.innerText.toLowerCase().includes('enter security console'),
  )
  el.click()
})
await sleep(2600)
console.log('AFTER BOOT hash =', await page.evaluate(() => window.location.hash))

const report = []
const checkpoint = async (label) => {
  for (const r of ROUTES) {
    await goto(r)
    report.push({ checkpoint: label, ...(await digest(r)) })
  }
}

await checkpoint('IDLE')

/* ------------------------------------------------- mid-attack (stage 5) */

await goto('/console')
await openDemo()
console.log('demo open:', await page.evaluate(() => !!document.body.innerText.match(/JUMP TO STAGE/)))
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.innerText.trim() === '05')
  btn.click()
})
await sleep(1400)
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.innerText.includes('DEMO CONTROL'))
  btn?.click()
})
await sleep(300)
await page.evaluate(() => {
  document.body.click()
})
await checkpoint('STAGE 05')

/* ------------------------------------------------------- full completion */

await goto('/console')
await openDemo()
console.log('COMPLETE ATTACK clicked:', await demo('COMPLETE ATTACK'))
await sleep(4200)
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.innerText.includes('DEMO CONTROL'))
  btn?.click()
})
await sleep(300)
await checkpoint('COMPLETE')

console.log('\n=== DIGESTS ===')
for (const row of report) {
  console.log(`${row.checkpoint.padEnd(10)} ${row.route.padEnd(13)} chars=${String(row.chars).padEnd(6)} ${row.headings.join(' | ')}`)
  console.log(`           ${row.text}`)
}

await browser.close()
console.log('\n=== MESSAGES (' + errs.length + ') ===')
console.log([...new Set(errs)].join('\n---\n').slice(0, 6000))
