const { chromium } = require('playwright');
(async () => {
  const [,, sel, prefix, w] = process.argv;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: +w, height: 900 } });
  const errs = [];
  await p.route(/^https?:\/\/(?!localhost).*/, (r) => r.abort());
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:4567/pages/vivid', { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '.scroll-trigger{opacity:1!important;animation:none!important;transform:none!important} .section-header{position:static!important}' });
  await p.evaluate((s) => window.scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY - 2000), sel);
  await p.waitForTimeout(300);
  const el = await p.$(sel);
  await el.scrollIntoViewIfNeeded();
  for (const t of [0, 450, 900, 2600]) { await p.waitForTimeout(t ? t - (t > 900 ? 900 : t > 450 ? 450 : 0) : 120); await el.screenshot({ path: `${prefix}-${t}.png` }); }
  console.log(errs.filter((e) => !/Shopify|StandardEvents|CartItems/.test(e)).join('\n') || 'ok');
  await b.close();
})();
