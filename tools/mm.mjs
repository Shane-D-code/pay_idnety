import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox'], defaultViewport: { width: 390, height: 844 } })
const p = await b.newPage()
await p.goto('http://localhost:5178/#/attacktrace', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3500))
console.log(JSON.stringify(await p.evaluate(() => {
  const g = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), pos: cs.position, ov: cs.overflow } }
  return { canvas: g('.react-flow'), panel: g('.react-flow__panel'), minimap: g('.react-flow__minimap'), svg: g('.react-flow__minimap svg') }
}), null, 1))
await b.close()
