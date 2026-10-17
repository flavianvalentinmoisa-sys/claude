const { chromium } = require('playwright');
(async () => {
  const [,, path, sel, out, w] = process.argv;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: +w || 1280, height: 900 } });
  await p.route(/^https?:\/\/(?!localhost).*/, (r) => r.abort());
  await p.goto('http://localhost:4567' + path, { waitUntil: 'networkidle' });
  await p.$eval(sel, (e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 120));
  await p.waitForTimeout(2500);
  await p.screenshot({ path: out });
  await b.close();
})();
