import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox'], defaultViewport: { width: 1600, height: 1000 } })
const p = await b.newPage()
await p.goto('http://localhost:5178/#/console', { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 2500))
for (const label of ['COMPLETE ATTACK', 'SIMULATE ATTACK']) {
  const done = await p.evaluate((l) => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim().includes(l))
    if (!b) return false
    b.click()
    return true
  }, label)
  if (!done) continue
  await new Promise(r => setTimeout(r, 6000))
  break
}
await new Promise(r => setTimeout(r, 2500))
console.log(JSON.stringify(await p.evaluate(() => {
  const core = [...document.querySelectorAll('div')].find(d => d.className.includes('h-[76px]'))
  if (!core) return { err: 'core not found' }
  const r = core.getBoundingClientRect()
  const kids = [...core.children].map(c => {
    const k = c.getBoundingClientRect()
    const cs = getComputedStyle(c)
    return { tag: c.tagName, cls: c.className.toString().slice(0,30), pos: cs.position,
      l: Math.round(k.left), r: Math.round(k.right), t: Math.round(k.top), b: Math.round(k.bottom),
      w: Math.round(k.width), h: Math.round(k.height), text: (c.textContent||'').trim().slice(0,14) }
  })
  return { core: { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) }, kids }
}), null, 1))
await b.close()
