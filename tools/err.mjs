import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox'], defaultViewport: { width: 1600, height: 1000 } })
const p = await b.newPage()
p.on('pageerror', (e) => console.log('PAGEERROR:', e.message, '\nSTACK:\n', e.stack))
p.on('console', (m) => m.type() === 'error' && console.log('CONSOLE:', m.text(), JSON.stringify(m.location())))
await p.goto('http://localhost:5178/#/attacktrace', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 4000))
await b.close()
