const { chromium } = require('playwright');
(async () => {
  const [,, pathname, prefix, w, h] = process.argv;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  const logs = [];
  await p.route(/^https?:\/\/(?!localhost).*/, (r) => r.abort());
  p.on('pageerror', (e) => logs.push('pageerror: ' + e.message));
  p.on('console', (m) => m.type() === 'error' && logs.push(m.text()));
  await p.goto('http://localhost:4567' + pathname, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '.scroll-trigger{opacity:1!important;animation:none!important;transform:none!important}' });
  const ids = await p.$$eval('main > .shopify-section', (els) => els.map((e) => e.id));
  let i = 0;
  for (const id of ids) {
    const el = await p.$('#' + id);
    const box = await el.boundingBox(); if (!box || box.height < 2) continue;
    await el.scrollIntoViewIfNeeded();
    await p.waitForTimeout(500);
    await el.screenshot({ path: `${prefix}-${String(i++).padStart(2, '0')}.png` });
  }
  console.log(ids.length, logs.join('\n') || 'fără erori');
  await b.close();
})();
