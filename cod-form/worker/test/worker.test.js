import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker, { normalizePhone } from '../src/index.js';

const env = {
  SHOP: 'test-shop.myshopify.com',
  ALLOWED_ORIGINS: 'https://magazin.ro',
  SHOPIFY_ADMIN_TOKEN: 'shpat_test',
  SHIPPING_PRICE: '19.99',
  MAX_DISCOUNT_PERCENT: '40',
  MAX_ORDERS_PER_IP: '100',
};

const VARIANT = {
  id: 'gid://shopify/ProductVariant/111',
  title: 'Default Title',
  price: '89.99',
  compareAtPrice: '139.99',
  availableForSale: true,
  sku: null,
  media: { nodes: [] },
  product: { id: 'gid://shopify/Product/1', title: 'Pompă mini', status: 'ACTIVE', featuredMedia: null },
};

let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    calls.push(body);
    if (body.query.includes('CodVariants')) {
      return new Response(JSON.stringify({ data: { nodes: body.variables.ids.map(() => VARIANT) } }));
    }
    if (body.query.includes('CodOrderCreate')) {
      return new Response(
        JSON.stringify({
          data: {
            orderCreate: {
              order: { id: 'gid://shopify/Order/999', name: '#1001', totalPriceSet: { shopMoney: { amount: '149.97' } } },
              userErrors: [],
            },
          },
        })
      );
    }
    throw new Error('unexpected fetch');
  };
});

const post = (path, body, ip = '1.1.1.1') =>
  worker.fetch(
    new Request(`https://worker.test${path}`, {
      method: 'POST',
      headers: { Origin: 'https://magazin.ro', 'Content-Type': 'application/json', 'CF-Connecting-IP': ip },
      body: JSON.stringify(body),
    }),
    env
  );

const customer = {
  name: 'Ion Popescu',
  phone: '0722 123 456',
  county: 'CJ',
  city: 'Cluj-Napoca',
  address: 'Str. Memorandumului nr. 1, ap. 3',
};

test('normalizePhone accepts Romanian formats', () => {
  assert.equal(normalizePhone('0722 123 456'), '+40722123456');
  assert.equal(normalizePhone('+40 722-123-456'), '+40722123456');
  assert.equal(normalizePhone('0040722123456'), '+40722123456');
  assert.equal(normalizePhone('40722123456'), '+40722123456');
  assert.equal(normalizePhone('0264 123 456'), '+40264123456');
  assert.equal(normalizePhone('12345'), null);
  assert.equal(normalizePhone('0822123456'), null);
});

test('quote applies fixed-amount offer (2 bucăți, -50 lei) and shipping', async () => {
  const res = await post('/quote', { items: [{ id: 111, quantity: 2 }], offer: { amount: 5000 } });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.subtotal, 12998);
  assert.equal(data.shipping, 1999);
  assert.equal(data.total, 14997);
});

test('quote applies percent offer (3 bucăți, -25%)', async () => {
  const data = await (await post('/quote', { items: [{ id: 111, quantity: 3 }], offer: { percent: 25 } })).json();
  assert.equal(data.subtotal, 20247 + 0); // 269.97 * 0.75 = 202.4775 → 67.49 / buc
  assert.equal(data.lines[0].unitPrice, 6749);
});

test('quote caps a tampered discount at MAX_DISCOUNT_PERCENT', async () => {
  const data = await (await post('/quote', { items: [{ id: 111, quantity: 1 }], offer: { percent: 99 } })).json();
  assert.equal(data.subtotal, 5400); // 89.99 * 60% = 53.994 → floor discount → 54.00
});

test('gift lines are free and forced to quantity 1', async () => {
  const data = await (
    await post('/quote', {
      items: [
        { id: 111, quantity: 1 },
        { id: 111, quantity: 5, properties: { _cadou: 'da' } },
      ],
    })
  ).json();
  assert.equal(data.lines[1].quantity, 1);
  assert.equal(data.lines[1].linePrice, 0);
  assert.equal(data.subtotal, 8999);
});

test('order validates customer fields', async () => {
  const res = await post('/order', { items: [{ id: 111, quantity: 1 }], customer: { name: 'Ion', phone: '123' } });
  const data = await res.json();
  assert.equal(res.status, 422);
  assert.ok(data.fields.name && data.fields.phone && data.fields.county && data.fields.city && data.fields.address);
});

test('order creates a pending COD order with server-side prices', async () => {
  const res = await post('/order', {
    key: 'abc123',
    items: [{ id: 111, quantity: 2 }],
    offer: { amount: 5000 },
    customer,
  });
  const data = await res.json();
  assert.equal(res.status, 200, JSON.stringify(data));
  assert.equal(data.orderName, '#1001');
  const order = calls.find((c) => c.query.includes('CodOrderCreate')).variables.order;
  assert.equal(order.financialStatus, 'PENDING');
  assert.equal(order.shippingAddress.provinceCode, 'CJ');
  assert.equal(order.shippingAddress.countryCode, 'RO');
  assert.equal(order.shippingAddress.firstName, 'Ion');
  assert.equal(order.shippingAddress.lastName, 'Popescu');
  assert.equal(order.phone, '+40722123456');
  assert.equal(order.lineItems[0].priceSet.shopMoney.amount, '64.99');
  assert.equal(order.shippingLines[0].priceSet.shopMoney.amount, '19.99');
  assert.ok(order.tags.includes('COD'));

  // Same key again → no second order.
  const before = calls.length;
  await post('/order', { key: 'abc123', items: [{ id: 111, quantity: 2 }], offer: { amount: 5000 }, customer });
  assert.equal(calls.length, before);
});

test('honeypot field blocks bots', async () => {
  const res = await post('/order', { website: 'spam', items: [{ id: 111, quantity: 1 }], customer });
  assert.equal(res.status, 400);
});

test('requests from other sites are refused', async () => {
  const res = await worker.fetch(
    new Request('https://worker.test/order', {
      method: 'POST',
      headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' },
      body: '{}',
    }),
    env
  );
  assert.equal(res.status, 403);
});
