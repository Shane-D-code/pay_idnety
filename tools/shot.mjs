/* Quick screenshot / probe tool.
   Usage: node tools/shot.mjs <route1,route2,...> [outDir] */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const BASE = process.env.BASE ?? 'http://localhost:5199/'
const W = Number(process.env.W ?? 1600)
const H = Number(process.env.H ?? 1000)
const routes = (process.argv[2] ?? '/').split(',')
const OUT = process.argv[3] ?? '/tmp/it-shots'
const FULL = process.env.FULL === '1'
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--force-device-scale-factor=1', '--hide-scrollbars'],
  defaultViewport: { width: W, height: H, deviceScaleFactor: 1 },
})

const page = await browser.newPage()
const errs = []
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)) })
page.on('pageerror', (e) => errs.push(`PAGEERROR: ${e.message}`.slice(0, 300)))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const report = []

for (const r of routes) {
  await page.goto(`${BASE}#${r}`, { waitUntil: 'networkidle2' })
  await sleep(1400)
  const name = r === '/' ? 'root' : r.replace(/\//g, '-').replace(/^-/, '')
  const info = await page.evaluate(() => ({
    h: document.body.scrollHeight,
    text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 260),
    links: document.querySelectorAll('a').length,
    buttons: document.querySelectorAll('button').length,
  }))
  report.push({ route: r, ...info })
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: FULL })
}

await browser.close()
console.log(JSON.stringify(report, null, 2))
console.log('\n=== CONSOLE ERRORS (' + errs.length + ') ===')
console.log([...new Set(errs)].slice(0, 25).join('\n'))