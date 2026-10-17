// Test interactiv: pagina de produs → reduceri la cantitate → adaugă în coș → coș lateral
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const logs = [];
  await p.route(/^https?:\/\/(?!localhost).*/, (r) => r.abort());
  await p.route('https://cdn.shopify.com/storefront/standard-events.js', (r) => r.fulfill({ contentType: 'application/javascript', headers: { 'Access-Control-Allow-Origin': '*' }, body: fs.readFileSync(__dirname + '/standard-events.js', 'utf8') }));
  await p.addInitScript(() => { window.Shopify = { designMode: false }; });
  p.on('console', (m) => m.type() === 'error' && logs.push('console: ' + m.text()));
  p.on('pageerror', (e) => logs.push('pageerror: ' + e.message + ' @ ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await p.request.get('http://localhost:4567/__reset');
  await p.goto('http://localhost:4567/products/perna', { waitUntil: 'networkidle' });
  const step = async (name, fn) => { try { const r = await fn(); console.log('✔', name, r !== undefined ? JSON.stringify(r) : ''); } catch (e) { console.log('✘', name, e.message.split('\n')[0]); } };
  await step('opțiunea 2 preselectată, cantitate 2', () => p.$eval('[data-qb-quantity]', (i) => i.value));
  await step('selectez opțiunea 3', async () => { await p.click('.c-qb__option:nth-child(3)'); return p.$eval('[data-qb-quantity]', (i) => i.value); });
  await step('cadoul 2 (min 3) deblocat', () => p.$eval('quantity-gifts [data-gift]:nth-child(2)', (g) => g.classList.contains('is-unlocked')));
  await step('submit fără câmp obligatoriu → eroare', async () => { await p.click('#ProductSubmitButton-main'); await p.waitForTimeout(400); return p.$eval('.c-field__error', (e) => !e.hidden && e.textContent); });
  await step('completez câmpul și adaug', async () => {
    await p.fill('.c-field__input', 'Andrei & Maria');
    await p.click('#ProductSubmitButton-main');
    await p.waitForSelector('cart-drawer.active', { timeout: 5000 });
    return p.$$eval('#CartDrawer .cart-item', (rows) => rows.map((r) => r.querySelector('.cart-item__name')?.textContent.trim() + ' x' + r.querySelector('.quantity__input')?.value));
  });
  await step('coș JSON', async () => (await (await p.request.get('http://localhost:4567/cart.js')).json()).items.map((i) => `${i.title} x${i.quantity} ${JSON.stringify(i.properties)}`));
  await p.waitForTimeout(600);
  await p.screenshot({ path: out + '-drawer.png' });
  await step('aplic cod BINE10', async () => {
    await p.fill('cart-discount-field input[name=discount]', 'BINE10');
    await p.click('cart-discount-field .c-cart-discount__button');
    await p.waitForTimeout(1200);
    return p.$$eval('.c-cart-discount__code', (c) => c.map((x) => x.textContent.trim()));
  });
  await step('cresc cantitatea primului produs', async () => {
    await p.click('#CartDrawer-Item-1 button[name=plus]');
    await p.waitForTimeout(1500);
    return p.$eval('#Drawer-quantity-1', (i) => i.value);
  });
  await step('închid coșul, adaug pachetul', async () => {
    await p.click('.c-drawer__close');
    await p.waitForTimeout(400);
    await p.click('[data-bundle-add]');
    await p.waitForSelector('cart-drawer.active', { timeout: 5000 });
    return (await (await p.request.get('http://localhost:4567/cart.js')).json()).item_count;
  });
  await p.waitForTimeout(800);
  await p.screenshot({ path: out + '-drawer2.png' });
  await step('sticky ATC vizibil după scroll', async () => { await p.click('.c-drawer__close'); await p.evaluate(() => window.scrollTo(0, 1600)); await p.waitForTimeout(700); return p.$eval('sticky-atc', (s) => s.classList.contains('is-visible')); });
  await step('schimb varianta din sticky', async () => {
    await p.selectOption('[data-sticky-variant]', { index: 1 });
    await p.waitForTimeout(1500);
    return p.$eval('#MainProduct-main [name=id]', (i) => i.value);
  });
  console.log(logs.join('\n') || 'fără erori JS');
  console.log('server:', await (await p.request.get('http://localhost:4567/__errors')).text());
  await b.close();
})();
