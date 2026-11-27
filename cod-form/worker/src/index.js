/**
 * Formular COD (plata ramburs): server pentru magazinul Shopify.
 *
 * Primește comanda din formularul de pe pagina de produs, recalculează prețurile
 * din Shopify (clientul nu poate trimite alt preț) și creează comanda direct în
 * Shopify, fără checkout-ul Shopify.
 *
 * Rute:
 *   POST /quote  → calculează produsele, livrarea și totalul (pentru rezumatul din formular)
 *   POST /order  → validează datele clientului și creează comanda
 *   GET  /health → verificare rapidă că serverul merge și are acces la Shopify
 */

const COUNTIES = {
  AB: 'Alba', AR: 'Arad', AG: 'Argeș', BC: 'Bacău', BH: 'Bihor', BN: 'Bistrița-Năsăud',
  BT: 'Botoșani', BR: 'Brăila', BV: 'Brașov', B: 'București', BZ: 'Buzău', CL: 'Călărași',
  CS: 'Caraș-Severin', CJ: 'Cluj', CT: 'Constanța', CV: 'Covasna', DB: 'Dâmbovița', DJ: 'Dolj',
  GL: 'Galați', GR: 'Giurgiu', GJ: 'Gorj', HR: 'Harghita', HD: 'Hunedoara', IL: 'Ialomița',
  IS: 'Iași', IF: 'Ilfov', MM: 'Maramureș', MH: 'Mehedinți', MS: 'Mureș', NT: 'Neamț',
  OT: 'Olt', PH: 'Prahova', SJ: 'Sălaj', SM: 'Satu Mare', SB: 'Sibiu', SV: 'Suceava',
  TR: 'Teleorman', TM: 'Timiș', TL: 'Tulcea', VL: 'Vâlcea', VS: 'Vaslui', VN: 'Vrancea',
};

const MAX_ITEMS = 10;
const MAX_QUANTITY = 20;
const MAX_GIFT_LINES = 2;

/* ---------------------------------------------------------------- utilitare */

class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors },
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const ok = allowed.includes(origin);
  return {
    ok,
    headers: ok
      ? {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
          Vary: 'Origin',
        }
      : { Vary: 'Origin' },
  };
}

const toCents = (amount) => Math.round(parseFloat(amount) * 100);
const fromCents = (cents) => (cents / 100).toFixed(2);
const clean = (value, max = 200) =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

/** Acceptă 07xx xxx xxx, +40 7xx…, 0040 7xx…, 40 7xx… și fixe 02x/03x. Întoarce +40XXXXXXXXX sau null. */
export function normalizePhone(raw) {
  let digits = String(raw || '').replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  if (digits.startsWith('0040')) digits = digits.slice(4);
  else if (digits.startsWith('40') && digits.length === 11) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  if (!/^[237]\d{8}$/.test(digits)) return null;
  return `+40${digits}`;
}

function splitName(full) {
  const parts = full.split(' ').filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
}

/* ------------------------------------------------------------ Shopify Admin */

let cachedToken = null;
let cachedTokenExpiresAt = 0;

async function getAdminToken(env) {
  if (env.SHOPIFY_ADMIN_TOKEN) return env.SHOPIFY_ADMIN_TOKEN;
  if (cachedToken && Date.now() < cachedTokenExpiresAt - 60_000) return cachedToken;
  if (!env.SHOPIFY_CLIENT_ID || !env.SHOPIFY_CLIENT_SECRET) {
    throw new Error('Lipsesc SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET (sau SHOPIFY_ADMIN_TOKEN).');
  }
  const response = await fetch(`https://${env.SHOP}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
    }),
  });
  if (!response.ok) throw new Error(`Token Shopify refuzat (${response.status}): ${await response.text()}`);
  const data = await response.json();
  cachedToken = data.access_token;
  cachedTokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

async function adminGraphql(env, query, variables) {
  const version = env.API_VERSION || '2026-10';
  const response = await fetch(`https://${env.SHOP}/admin/api/${version}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': await getAdminToken(env) },
    body: JSON.stringify({ query, variables }),
  });
  if (response.status === 401) cachedToken = null;
  if (!response.ok) throw new Error(`Shopify Admin API ${response.status}: ${await response.text()}`);
  const body = await response.json();
  if (body.errors?.length) throw new Error(`Shopify GraphQL: ${JSON.stringify(body.errors)}`);
  return body.data;
}

const VARIANTS_QUERY = `#graphql
  query CodVariants($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        title
        price
        compareAtPrice
        availableForSale
        sku
        media(first: 1) { nodes { preview { image { url } } } }
        product {
          id
          title
          status
          featuredMedia { preview { image { url } } }
        }
      }
    }
  }`;

const ORDER_MUTATION = `#graphql
  mutation CodOrderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
    orderCreate(order: $order, options: $options) {
      order { id name totalPriceSet { shopMoney { amount currencyCode } } }
      userErrors { field message }
    }
  }`;

/* ------------------------------------------------------------------- prețuri */

function parseItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new HttpError(400, 'Coșul este gol.');
  if (rawItems.length > MAX_ITEMS) throw new HttpError(400, 'Prea multe produse.');
  return rawItems.map((item) => {
    const id = String(item?.id ?? '').replace(/^gid:\/\/shopify\/ProductVariant\//, '');
    const quantity = parseInt(item?.quantity, 10);
    if (!/^\d{1,20}$/.test(id)) throw new HttpError(400, 'Produs invalid.');
    if (!(quantity >= 1 && quantity <= MAX_QUANTITY)) throw new HttpError(400, 'Cantitate invalidă.');
    const properties = {};
    if (item.properties && typeof item.properties === 'object') {
      Object.entries(item.properties)
        .slice(0, 10)
        .forEach(([key, value]) => {
          const k = clean(key, 60);
          const v = clean(value, 250);
          if (k && v) properties[k] = v;
        });
    }
    const gift = properties._cadou === 'da';
    return { id, quantity: gift ? 1 : quantity, properties, gift };
  });
}

/**
 * Calculează liniile comenzii cu prețurile din Shopify.
 * Reducerea ofertei (procent sau sumă fixă, la fel ca în blocul „Alege oferta”) se aplică
 * doar produselor principale și nu poate depăși MAX_DISCOUNT_PERCENT din valoarea lor.
 */
async function buildQuote(env, body) {
  const items = parseItems(body.items);
  if (items.filter((i) => i.gift).length > MAX_GIFT_LINES) throw new HttpError(400, 'Prea multe cadouri.');

  const ids = [...new Set(items.map((i) => `gid://shopify/ProductVariant/${i.id}`))];
  const data = await adminGraphql(env, VARIANTS_QUERY, { ids });
  const variants = new Map((data.nodes || []).filter(Boolean).map((v) => [v.id.split('/').pop(), v]));

  const lines = items.map((item) => {
    const variant = variants.get(item.id);
    if (!variant || variant.product?.status !== 'ACTIVE') throw new HttpError(400, 'Un produs nu mai este disponibil.');
    if (!variant.availableForSale) throw new HttpError(409, `${variant.product.title} nu mai este în stoc.`);
    const unit = toCents(variant.price);
    return {
      variant,
      item,
      unitOriginal: unit,
      compareAt: variant.compareAtPrice ? toCents(variant.compareAtPrice) : 0,
      lineOriginal: item.gift ? 0 : unit * item.quantity,
    };
  });

  const mainLines = lines.filter((l) => !l.item.gift);
  const base = mainLines.reduce((sum, l) => sum + l.lineOriginal, 0);
  const percent = Math.max(0, Math.min(100, parseFloat(body.offer?.percent) || 0));
  const amount = Math.max(0, parseInt(body.offer?.amount, 10) || 0);
  let discount = percent > 0 ? Math.round((base * percent) / 100) : Math.min(base, amount);
  const maxPercent = parseFloat(env.MAX_DISCOUNT_PERCENT || '40');
  discount = Math.min(discount, Math.floor((base * maxPercent) / 100));

  // Împarte reducerea pe linii și stabilește prețul pe bucată (în bani).
  let remaining = discount;
  mainLines.forEach((line, index) => {
    const share = index === mainLines.length - 1 ? remaining : Math.round((discount * line.lineOriginal) / (base || 1));
    remaining -= share;
    line.unitFinal = Math.round((line.lineOriginal - share) / line.item.quantity);
  });
  lines.filter((l) => l.item.gift).forEach((l) => (l.unitFinal = 0));

  const shipping = toCents(env.SHIPPING_PRICE || '0');
  const subtotal = lines.reduce((sum, l) => sum + l.unitFinal * l.item.quantity, 0);
  const compareSubtotal = lines.reduce(
    (sum, l) => sum + Math.max(l.compareAt, l.unitOriginal) * l.item.quantity,
    0
  );

  return {
    lines,
    shipping,
    subtotal,
    total: subtotal + shipping,
    savings: Math.max(0, compareSubtotal - subtotal),
    currency: env.CURRENCY || 'RON',
  };
}

function publicQuote(quote) {
  return {
    currency: quote.currency,
    lines: quote.lines.map((l) => ({
      variantId: Number(l.item.id),
      title: l.variant.product.title,
      variantTitle: l.variant.title === 'Default Title' ? '' : l.variant.title,
      image: l.variant.media?.nodes?.[0]?.preview?.image?.url || l.variant.product.featuredMedia?.preview?.image?.url || null,
      quantity: l.item.quantity,
      gift: l.item.gift,
      unitPrice: l.unitFinal,
      linePrice: l.unitFinal * l.item.quantity,
      compareLinePrice: Math.max(l.compareAt, l.unitOriginal) * l.item.quantity,
    })),
    shipping: quote.shipping,
    subtotal: quote.subtotal,
    total: quote.total,
    savings: quote.savings,
  };
}

/* ---------------------------------------------------------------- validare */

function validateCustomer(raw) {
  const c = raw || {};
  const fields = {};
  const name = clean(c.name, 80);
  const phone = normalizePhone(c.phone);
  const email = clean(c.email, 120).toLowerCase();
  const county = clean(c.county, 3).toUpperCase();
  const city = clean(c.city, 80);
  const address = clean(c.address, 200);
  const zip = clean(c.zip, 10);
  const note = clean(c.note, 500);

  if (name.length < 3 || !/\s/.test(name)) fields.name = 'Scrie numele și prenumele.';
  if (!phone) fields.phone = 'Scrie un număr de telefon valid (ex: 07xx xxx xxx).';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fields.email = 'Adresa de e-mail nu pare corectă.';
  if (!COUNTIES[county]) fields.county = 'Alege județul.';
  if (city.length < 2) fields.city = 'Scrie localitatea.';
  if (address.length < 5) fields.address = 'Scrie strada, numărul (și blocul/apartamentul, dacă e cazul).';
  if (zip && !/^\d{6}$/.test(zip)) fields.zip = 'Codul poștal are 6 cifre.';

  if (Object.keys(fields).length) throw new HttpError(422, 'Verifică datele de livrare.', fields);
  return { name, phone, email, county, city, address, zip, note };
}

/* ---------------------------------------------- protecție împotriva abuzului */

const recentByIp = new Map(); // ip → [timestamps]
const recentOrders = new Map(); // cheie idempotență → { at, result }

function rateLimit(ip, env) {
  const limit = parseInt(env.MAX_ORDERS_PER_IP || '5', 10);
  const windowMs = 10 * 60 * 1000;
  const now = Date.now();
  const list = (recentByIp.get(ip) || []).filter((t) => now - t < windowMs);
  if (list.length >= limit) throw new HttpError(429, 'Ai trimis prea multe comenzi într-un timp scurt. Sună-ne și te ajutăm.');
  list.push(now);
  recentByIp.set(ip, list);
  if (recentByIp.size > 5000) recentByIp.clear();
}

/* ------------------------------------------------------------------ comandă */

async function createOrder(env, body, request) {
  if (body.website) throw new HttpError(400, 'Cerere invalidă.'); // câmp capcană pentru roboți

  const idempotencyKey = clean(body.key, 64);
  const previous = idempotencyKey && recentOrders.get(idempotencyKey);
  if (previous && Date.now() - previous.at < 15 * 60 * 1000) return previous.result;

  const customer = validateCustomer(body.customer);
  rateLimit(request.headers.get('CF-Connecting-IP') || 'unknown', env);
  const quote = await buildQuote(env, body);
  const { firstName, lastName } = splitName(customer.name);

  const address = {
    firstName,
    lastName,
    address1: customer.address,
    city: customer.city,
    provinceCode: customer.county,
    countryCode: 'RO',
    zip: customer.zip || null,
    phone: customer.phone,
  };

  const order = {
    currency: quote.currency,
    financialStatus: 'PENDING',
    phone: customer.phone,
    email: customer.email || null,
    shippingAddress: address,
    billingAddress: address,
    note: customer.note || null,
    tags: ['COD', 'formular-cod'],
    sourceName: 'formular-cod',
    sourceIdentifier: idempotencyKey || null,
    sourceUrl: /^https:\/\//.test(body.pageUrl || '') ? String(body.pageUrl).slice(0, 500) : null,
    taxesIncluded: true,
    customAttributes: [
      { key: 'Metodă de plată', value: 'Ramburs (plata la livrare)' },
      { key: 'Județ', value: COUNTIES[customer.county] },
    ],
    lineItems: quote.lines.map((l) => ({
      variantId: l.variant.id,
      quantity: l.item.quantity,
      priceSet: { shopMoney: { amount: fromCents(l.unitFinal), currencyCode: quote.currency } },
      properties: Object.entries(l.item.properties).map(([name, value]) => ({ name, value })),
    })),
    shippingLines: [
      {
        title: env.SHIPPING_TITLE || 'Livrare prin curier',
        code: 'COD',
        priceSet: { shopMoney: { amount: fromCents(quote.shipping), currencyCode: quote.currency } },
      },
    ],
  };

  const data = await adminGraphql(env, ORDER_MUTATION, {
    order,
    options: {
      inventoryBehaviour: 'DECREMENT_OBEYING_POLICY',
      sendReceipt: Boolean(customer.email),
      sendFulfillmentReceipt: Boolean(customer.email),
    },
  });

  const errors = data.orderCreate?.userErrors || [];
  if (errors.length || !data.orderCreate?.order) {
    console.error('orderCreate userErrors', JSON.stringify(errors));
    throw new HttpError(502, 'Comanda nu a putut fi înregistrată. Încearcă din nou sau sună-ne.');
  }

  const created = data.orderCreate.order;
  const result = {
    ok: true,
    orderName: created.name,
    orderId: created.id.split('/').pop(),
    ...publicQuote(quote),
    customer: {
      name: customer.name,
      phone: customer.phone,
      city: customer.city,
      county: COUNTIES[customer.county],
      address: customer.address,
    },
  };
  if (idempotencyKey) {
    recentOrders.set(idempotencyKey, { at: Date.now(), result });
    if (recentOrders.size > 2000) recentOrders.clear();
  }
  return result;
}

/* ------------------------------------------------------------------- router */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: cors.ok ? 204 : 403, headers: cors.headers });
    }

    try {
      if (url.pathname === '/health' && request.method === 'GET') {
        const data = await adminGraphql(env, '{ shop { name currencyCode } }');
        return json({ ok: true, shop: data.shop.name, currency: data.shop.currencyCode }, 200, cors.headers);
      }

      if (request.method !== 'POST' || !['/quote', '/order'].includes(url.pathname)) {
        return json({ ok: false, error: 'Not found' }, 404, cors.headers);
      }
      if (!cors.ok) return json({ ok: false, error: 'Origin not allowed' }, 403, cors.headers);

      const length = parseInt(request.headers.get('Content-Length') || '0', 10);
      if (length > 20_000) throw new HttpError(413, 'Cerere prea mare.');
      let body;
      try {
        body = await request.json();
      } catch (e) {
        throw new HttpError(400, 'Cerere invalidă.');
      }

      if (url.pathname === '/quote') {
        return json({ ok: true, ...publicQuote(await buildQuote(env, body)) }, 200, cors.headers);
      }
      return json(await createOrder(env, body, request), 200, cors.headers);
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ ok: false, error: error.message, fields: error.fields || null }, error.status, cors.headers);
      }
      console.error(error);
      return json(
        { ok: false, error: 'A apărut o eroare. Încearcă din nou sau sună-ne și preluăm comanda telefonic.' },
        500,
        cors.headers
      );
    }
  },
};
