const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await p.route(/^https?:\/\/(?!localhost).*/, (r) => r.abort());
  await p.route('https://cdn.shopify.com/storefront/standard-events.js', (r) => r.fulfill({ contentType: 'application/javascript', headers: { 'Access-Control-Allow-Origin': '*' }, body: fs.readFileSync(__dirname + '/standard-events.js', 'utf8') }));
  await p.addInitScript(() => { window.Shopify = { designMode: false }; });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:4567/products/perna', { waitUntil: 'networkidle' });
  await p.click('#cart-icon-bubble'); await p.waitForTimeout(800);
  await p.screenshot({ path: __dirname + '/drawer-mobile.png' });
  console.log(errs.join('\n') || 'fără erori');
  await b.close();
})();
