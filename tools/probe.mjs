import puppeteer from 'puppeteer-core'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const route = process.argv[2] ?? '#/attacktrace'
const w = Number(process.argv[3] ?? 390)
const b = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'], defaultViewport: { width: w, height: 844 } })
const p = await b.newPage()
await p.goto(`http://localhost:5178/${route}`, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3000))
const out = await p.evaluate(() => {
  let worst = null
  document.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.width > 0 && r.right > window.innerWidth + 1) {
      if (!worst || r.right > worst.r.right) worst = { el, r }
    }
  })
  const chain = []
  let cur = worst?.el ?? null
  while (cur && cur.tagName !== 'BODY') {
    const cs = getComputedStyle(cur)
    const r = cur.getBoundingClientRect()
    chain.push({
      tag: cur.tagName,
      cls: cur.className.toString().slice(0, 80),
      w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right),
      display: cs.display, gridCols: cs.gridTemplateColumns, flexWrap: cs.flexWrap,
      minWidth: cs.minWidth, overflowX: cs.overflowX,
      text: (cur.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30),
    })
    cur = cur.parentElement
  }
  return { docScrollW: document.documentElement.scrollWidth, vw: window.innerWidth, chain }
})
console.log(JSON.stringify(out, null, 1))
await b.close()
