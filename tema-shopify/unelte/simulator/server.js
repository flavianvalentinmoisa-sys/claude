// Mini-simulator Shopify pentru testarea temei Carpatica: randează Liquid cu obiecte mock,
// servește asset-urile și implementează API-ul de coș (add/change/update + Section Rendering).
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Liquid, Drop } = require('liquidjs');
class CartDrop extends Drop { constructor(o) { super(); Object.assign(this, o); } valueOf() { return this.items; } }

const THEME = process.env.THEME || '/home/user/claude/carpatica';
const PORT = +process.env.PORT || 4567;
const read = (p) => fs.readFileSync(path.join(THEME, p), 'utf8');
const ro = JSON.parse(read('locales/ro.default.json'));
const errors = [];

/* ---------------- date mock ---------------- */
const img = (name, w = 800, h = 800) => {
  const o = { src: `/img/${name}.svg`, width: w, height: h, aspect_ratio: w / h, alt: name, id: name.length * 1000 + w,
    media_type: 'image', presentation: { focal_point: '50% 50%' } };
  o.preview_image = o;
  return o;
};
let vid = 1000;
function makeProduct(id, title, handle, price, compare, opts = null, extra = {}) {
  const variants = [];
  const optionNames = opts ? opts.map((o) => o.name) : ['Title'];
  const combos = opts ? opts.reduce((acc, o) => acc.flatMap((a) => o.values.map((v) => [...a, v])), [[]]) : [['Default Title']];
  combos.forEach((combo, i) => {
    variants.push({ id: ++vid, title: combo.join(' / '), price: price + (opts && i % 3 === 2 ? 1000 : 0), compare_at_price: compare,
      available: !(opts && i === combos.length - 1), options: combo, option1: combo[0], option2: combo[1] || null,
      inventory_quantity: 7 + i, inventory_management: 'shopify', inventory_policy: 'deny', sku: `SKU-${id}-${i}`,
      quantity_rule: { min: 1, max: null, increment: 1 }, quantity_price_breaks: [], store_availabilities: [],
      featured_media: null, requires_shipping: true, weight: 500, unit_price_measurement: null, selected: i === 0, url: `/products/${handle}?variant=${vid}` });
  });
  const media = [img(handle + '-1'), img(handle + '-2'), img(handle + '-3')];
  const p = {
    id, title, handle, url: `/products/${handle}`, vendor: 'Carpatica', type: 'Accesorii', tags: extra.tags || ['badge:Best seller'],
    description: '<p>Șase straturi de spumă cu memorie îți susțin gâtul toată noaptea. Țesătură respirabilă, husă lavabilă la 40°C.</p>',
    price: variants[0].price, price_min: Math.min(...variants.map((v) => v.price)), price_max: Math.max(...variants.map((v) => v.price)),
    price_varies: new Set(variants.map((v) => v.price)).size > 1, compare_at_price: compare, compare_at_price_min: compare, compare_at_price_max: compare,
    available: true, variants, media, images: media, featured_media: media[0], featured_image: media[0],
    has_only_default_variant: !opts, options: optionNames, metafields: { reviews: {} },
    'quantity_price_breaks_configured?': false, 'gift_card?': false, requires_selling_plan: false, selling_plan_groups: [],
    created_at: '2026-01-01', published_at: '2026-01-01',
  };
  p.selected_or_first_available_variant = variants[0];
  p.selected_variant = null;
  p.first_available_variant = variants[0];
  p.options_with_values = opts ? opts.map((o, oi) => ({ name: o.name, position: oi + 1, selected_value: o.values[0],
    values: o.values.map((v, vi) => ({ id: oi * 100 + vi + 1, name: v, toString: () => v, available: true, selected: vi === 0, swatch: null, product_url: p.url,
      variant: variants.find((x) => x.options[oi] === v) })) })) : [{ name: 'Title', position: 1, values: [{ id: 1, name: 'Default Title', toString: () => 'Default Title', available: true, selected: true }] }];
  p.options_by_name = {};
  return Object.assign(p, extra);
}
const products = {
  perna: makeProduct(1, 'Pernă cervicală ortopedică cu spumă cu memorie', 'perna', 14999, 24999,
    [{ name: 'Culoare', values: ['Alb', 'Gri', 'Bleumarin'] }, { name: 'Mărime', values: ['Standard', 'Mare'] }]),
  husa: makeProduct(2, 'Husă de rezervă din bambus', 'husa', 4999, 6999),
  masca: makeProduct(3, 'Mască de somn 3D', 'masca', 3999, 5999),
  cadou: makeProduct(4, 'Spray de pernă cu lavandă', 'cadou', 0, 3999),
};
const productByHandle = (h) => products[h];
function withVariant(product, q) {
  let variant;
  if (q.variant) variant = product.variants.find((v) => v.id === Number(q.variant));
  else {
    const ids = String(q.option_values).split(',').map(Number);
    const values = ids.map((id) => { const oi = Math.floor((id - 1) / 100); const vi = (id - 1) % 100; return product.options_with_values[oi]?.values[vi]?.name; });
    variant = product.variants.find((v) => values.every((val, i) => v.options[i] === val));
  }
  if (!variant) return product;
  const copy = { ...product, selected_or_first_available_variant: variant, selected_variant: variant };
  copy.options_with_values = product.options_with_values.map((o, oi) => ({ ...o, selected_value: variant.options[oi], values: o.values.map((v) => ({ ...v, selected: v.name === variant.options[oi] })) }));
  return copy;
}

/* ---------------- coș ---------------- */
let cartState = { items: [], note: '', discount_codes: [] };
function buildCart() {
  const items = cartState.items.map((it, i) => {
    const prod = Object.values(products).find((p) => p.variants.some((v) => v.id === it.id));
    const variant = prod.variants.find((v) => v.id === it.id);
    const line = variant.price * it.quantity;
    return { id: variant.id, key: `${variant.id}:${i}`, index: i, quantity: it.quantity, title: `${prod.title}${prod.has_only_default_variant ? '' : ' - ' + variant.title}`,
      product: prod, product_id: prod.id, variant, variant_id: variant.id, url: prod.url + '?variant=' + variant.id, image: prod.featured_media,
      price: variant.price, original_price: variant.price, final_price: variant.price, original_line_price: line, final_line_price: line, line_price: line,
      properties: it.properties || {}, options_with_values: variant.options.map((v, oi) => ({ name: prod.options[oi], value: v })),
      line_level_discount_allocations: [], discounts: [], selling_plan_allocation: null, unit_price_measurement: null, parent_relationship: null,
      instructions: { can_update_quantity: true, can_remove: true } };
  });
  const subtotal = items.reduce((s, i) => s + i.final_line_price, 0);
  return new CartDrop({ items, item_count: items.reduce((s, i) => s + i.quantity, 0), total_price: subtotal, items_subtotal_price: subtotal, original_total_price: subtotal,
    note: cartState.note, currency: { iso_code: 'RON' }, cart_level_discount_applications: [], discount_codes: cartState.discount_codes,
    taxes_included: true, duties_included: false, attributes: {}, requires_shipping: true });
}
const cartJson = () => {
  const c = buildCart();
  return { token: 'x', note: c.note, item_count: c.item_count, total_price: c.total_price, items_subtotal_price: c.items_subtotal_price, currency: 'RON',
    discount_codes: c.discount_codes, items: c.items.map((i) => ({ id: i.id, key: i.key, quantity: i.quantity, product_id: i.product_id, variant_id: i.id, title: i.title, price: i.price, properties: i.properties, final_line_price: i.final_line_price })) };
};

/* ---------------- setări ---------------- */
function schemaDefaults(settings) {
  const o = {};
  (settings || []).forEach((s) => {
    if (!s.id) return;
    if (s.default !== undefined) o[s.id] = s.default;
    else if (s.type === 'checkbox') o[s.id] = false;
    else o[s.id] = null;
  });
  return o;
}
function getSchema(file) {
  const t = read(file);
  const m = t.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  return m ? JSON.parse(m[1]) : {};
}
const settingsSchema = JSON.parse(read('config/settings_schema.json'));
const settingsData = JSON.parse(read('config/settings_data.json'));
const preset = settingsData.presets[settingsData.current] || {};
const globalSettings = {};
settingsSchema.forEach((g) => Object.assign(globalSettings, schemaDefaults(g.settings)));
Object.assign(globalSettings, preset);
const colorObj = (hex) => {
  hex = (hex || '#000000').replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
  return { red: r, green: g, blue: b, rgb: `${r} ${g} ${b}`, alpha: 1, toString: () => '#' + hex, hex: '#' + hex };
};
// culori → obiecte
settingsSchema.forEach((g) => (g.settings || []).forEach((s) => {
  if (s.type === 'color' && globalSettings[s.id]) globalSettings[s.id] = colorObj(globalSettings[s.id]);
}));
const schemes = preset.color_schemes || {};
globalSettings.color_schemes = Object.entries(schemes).map(([id, sc]) => ({ id, settings: Object.fromEntries(Object.entries(sc.settings).map(([k, v]) => [k, k.includes('gradient') ? v : colorObj(v)])) }));
const font = (family, weight) => ({ family, fallback_families: 'sans-serif', weight, style: 'normal', system: false, 'system?': false, toString: () => family });
globalSettings.type_header_font = font('Assistant', 700);
globalSettings.type_body_font = font('Assistant', 400);
['logo', 'favicon', 'brand_image', 'custom_cursor', 'cart_drawer_collection'].forEach((k) => (globalSettings[k] = globalSettings[k] || null));

function resolveSettingValue(def, value) {
  if (value === null || value === undefined) return value;
  if (def.type === 'product') return productByHandle(value) || null;
  if (def.type === 'product_list') return (Array.isArray(value) ? value : []).map(productByHandle).filter(Boolean);
  if (def.type === 'color' && typeof value === 'string' && value) return colorObj(value);
  if (def.type === 'image_picker' && typeof value === 'string' && value) return img(value);
  if (def.type === 'video_url' && typeof value === 'string' && value) return { type: 'youtube', id: value };
  return value;
}
function makeSection(id, type, data = {}) {
  const schema = getSchema(`sections/${type}.liquid`);
  const settings = { ...schemaDefaults(schema.settings), ...(data.settings || {}) };
  (schema.settings || []).forEach((d) => d.id && (settings[d.id] = resolveSettingValue(d, settings[d.id])));
  const order = data.block_order || Object.keys(data.blocks || {});
  const blocks = order.map((bid) => {
    const b = data.blocks[bid];
    const bschema = (schema.blocks || []).find((x) => x.type === b.type) || { settings: [] };
    const bs = { ...schemaDefaults(bschema.settings), ...(b.settings || {}) };
    (bschema.settings || []).forEach((d) => d.id && (bs[d.id] = resolveSettingValue(d, bs[d.id])));
    return { id: bid, type: b.type, settings: bs, shopify_attributes: `data-block="${bid}"` };
  });
  return { id, settings, blocks, location: 'template', index: 1 };
}

/* ---------------- motor Liquid ---------------- */
const engine = new Liquid({ root: [path.join(THEME, 'snippets')], extname: '.liquid', strictFilters: false, strictVariables: false, jsTruthy: false, ownPropertyOnly: false });

function rawBlock(name, wrap) {
  engine.registerTag(name, {
    parse(token, remain) {
      this.tpls = [];
      const stream = this.liquid.parser.parseStream(remain).on(`tag:end${name}`, () => stream.stop()).on('template', (t) => this.tpls.push(t)).on('end', () => { throw new Error(`tag ${name} not closed`); });
      stream.start();
    },
    *render(ctx, emitter) {
      if (!wrap) return;
      const html = yield this.liquid.renderer.renderTemplates(this.tpls, ctx);
      emitter.write(wrap(html));
    },
  });
}
engine.registerTag('schema', { parse(token, remain) { while (remain.length) { const t = remain.shift(); if (t.name === 'endschema') return; } }, render() {} });
rawBlock('style', (h) => `<style>${h}</style>`);
rawBlock('stylesheet', (h) => `<style>${h}</style>`);
rawBlock('javascript', (h) => `<script>${h}</script>`);
rawBlock('paginate', (h) => h);
rawBlock('doc', null);
engine.registerTag('layout', { parse() {}, render() {} });
engine.registerTag('form', {
  parse(token, remain) {
    this.args = token.args;
    this.tpls = [];
    const stream = this.liquid.parser.parseStream(remain).on('tag:endform', () => stream.stop()).on('template', (t) => this.tpls.push(t));
    stream.start();
  },
  *render(ctx, emitter) {
    const attrs = [];
    const re = /(\w[\w-]*):\s*('[^']*'|"[^"]*"|[\w.\[\]-]+)/g;
    let m;
    while ((m = re.exec(this.args))) {
      const v = yield this.liquid.evalValue(m[2], ctx);
      if (m[1] !== 'return_to') attrs.push(`${m[1]}="${v}"`);
    }
    const type = (this.args.match(/^\s*'([^']+)'/) || [])[1];
    const action = type === 'product' ? '/cart/add' : type === 'cart' ? '/cart' : '/contact';
    ctx.push({ form: { posted_successfully: false, errors: null, email: '', toString: () => '' } });
    const inner = yield this.liquid.renderer.renderTemplates(this.tpls, ctx);
    ctx.pop();
    emitter.write(`<form method="post" action="${action}" ${attrs.join(' ')}>${inner}</form>`);
  },
});
engine.registerTag('section', {
  parse(token) { this.name = token.args.replace(/['"]/g, '').trim(); },
  *render(ctx, emitter) { emitter.write(yield renderSection(this.name, staticSectionData(this.name), ctx.getAll())); },
});
engine.registerTag('sections', {
  parse(token) { this.name = token.args.replace(/['"]/g, '').trim(); },
  *render(ctx, emitter) {
    let group;
    try { group = JSON.parse(read(`sections/${this.name}.json`)); } catch (e) { return; }
    for (const sid of group.order) {
      const s = group.sections[sid];
      emitter.write(yield renderSection(s.type, s, ctx.getAll(), `sections--1__${sid}`));
    }
  },
});

const money = (cents) => {
  const n = (Number(cents) || 0) / 100;
  return n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' lei';
};
const lookup = (key) => key.split('.').reduce((o, k) => (o ? o[k] : undefined), ro);
engine.registerFilter('t', (key, ...args) => {
  const vars = {};
  args.forEach((a) => Array.isArray(a) && (vars[a[0]] = a[1]));
  let val = lookup(key);
  if (val && typeof val === 'object') {
    const c = Number(vars.count);
    val = c === 1 ? val.one : (c === 0 || (c % 100 > 0 && c % 100 < 20)) ? (val.few || val.other) : val.other;
  }
  if (val === undefined) { errors.push(`traducere lipsă: ${key}`); return `[missing ${key}]`; }
  return String(val).replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
});
const imgUrl = (o) => (o && typeof o === 'object' ? o.src || o.preview_image?.src : String(o || ''));
engine.registerFilter('money', money);
engine.registerFilter('money_with_currency', money);
engine.registerFilter('money_without_trailing_zeros', (c) => money(c).replace(',00', ''));
engine.registerFilter('money_without_currency', (c) => money(c).replace(' lei', ''));
engine.registerFilter('asset_url', (n) => `/assets/${n}`);
engine.registerFilter('shopify_asset_url', (n) => `/assets/${n}`);
engine.registerFilter('stylesheet_tag', (u) => `<link rel="stylesheet" href="${u}">`);
engine.registerFilter('preload_tag', () => '');
engine.registerFilter('inline_asset_content', (n) => { try { return read('assets/' + n); } catch (e) { errors.push('asset lipsă ' + n); return ''; } });
engine.registerFilter('image_url', (o) => imgUrl(o));
engine.registerFilter('img_url', (o) => imgUrl(o));
engine.registerFilter('image_tag', (u, ...args) => {
  const a = {}; args.forEach((x) => Array.isArray(x) && (a[x[0]] = x[1]));
  return `<img src="${u}" alt="${a.alt || ''}" loading="lazy"${a.class ? ` class="${a.class}"` : ''}${a.width ? ` width="${a.width}"` : ''}>`;
});
engine.registerFilter('placeholder_svg_tag', (n, cls) => `<svg class="${cls || ''}" viewBox="0 0 100 100"><rect width="100" height="100" fill="#ddd"/></svg>`);
engine.registerFilter('payment_type_svg_tag', (t) => `<svg class="icon" viewBox="0 0 38 24" width="38" height="24"><rect width="38" height="24" rx="3" fill="#eee"/><text x="19" y="15" font-size="7" text-anchor="middle">${t}</text></svg>`);
engine.registerFilter('font_face', () => '');
engine.registerFilter('font_modify', (f) => f);
engine.registerFilter('font_url', () => '');
const toRgb = (c) => { if (c && typeof c === 'object') return [c.red, c.green, c.blue]; const h = String(c || '#000').replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0); };
engine.registerFilter('color_brightness', (c) => { const [r, g, b] = toRgb(c); return (r * 299 + g * 587 + b * 114) / 1000; });
engine.registerFilter('color_difference', (a, b) => { const x = toRgb(a), y = toRgb(b); return x.reduce((s, v, i) => s + Math.abs(v - y[i]), 0); });
const lighten = (c, amt) => { const [r, g, b] = toRgb(c).map((v) => Math.round(v + (255 - v) * amt / 100)); return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join(''); };
engine.registerFilter('color_lighten', (c, a) => lighten(c, a));
engine.registerFilter('color_darken', (c) => c);
engine.registerFilter('standard_event_data', () => '{}');
engine.registerFilter('item_count_for_variant', (cart, id) => (cart.items || []).filter((i) => i.variant_id === id).reduce((s, i) => s + i.quantity, 0));
engine.registerFilter('payment_button', () => '<div class="shopify-payment-button"></div>');
engine.registerFilter('payment_terms', () => '');
engine.registerFilter('link_to', (t, u) => `<a href="${u}">${t}</a>`);
engine.registerFilter('structured_data', () => '{}');
engine.registerFilter('media_tag', (m) => `<img src="${imgUrl(m)}">`);
engine.registerFilter('video_tag', () => '<video></video>');
engine.registerFilter('external_video_tag', () => '<iframe></iframe>');
engine.registerFilter('external_video_url', () => '');
engine.registerFilter('time_tag', (d) => `<time>${d}</time>`);
engine.registerFilter('metafield_tag', () => '');
engine.registerFilter('format_address', () => '');
engine.registerFilter('unit_price_with_measurement', () => '');
engine.registerFilter('line_items_for', () => []);
engine.registerFilter('login_button', () => '');
engine.registerFilter('money_amount', (c) => money(c));
engine.registerFilter('handleize', (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-'));
engine.registerFilter('handle', (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-'));

function staticSectionData(type) {
  return (preset.sections || {})[type] || { type, settings: {} };
}
let currentPageCtx = {};
async function renderSection(type, data, scope, id) {
  const section = makeSection(id || type, type, data);
  const src = read(`sections/${type}.liquid`);
  try {
    const html = await engine.parseAndRender(src, { ...scope, section }, { globals: { ...globalsOf(scope), section } });
    const cls = getSchema(`sections/${type}.liquid`).class || '';
    const tag = getSchema(`sections/${type}.liquid`).tag || 'div';
    return `<${tag} id="shopify-section-${section.id}" class="shopify-section ${cls}">${html}</${tag}>`;
  } catch (e) {
    errors.push(`[${type}] ${e.message}`);
    return `<div class="harness-error">EROARE ${type}: ${e.message}</div>`;
  }
}

const GLOBAL_KEYS = ['settings', 'cart', 'shop', 'request', 'routes', 'localization', 'template', 'customer', 'linklists', 'collections', 'canonical_url', 'powered_by_link', 'additional_checkout_buttons', 'content_for_additional_checkout_buttons', 'page_title', 'product', 'collection'];
function globalsOf(scope) { const g = {}; GLOBAL_KEYS.forEach((k) => (g[k] = scope[k])); return g; }
function baseScope(extra = {}) {
  return {
    settings: globalSettings, cart: buildCart(), shop: { name: 'Magazin Demo', money_format: '{{amount_with_comma_separator}} lei', enabled_payment_types: ['visa', 'master', 'paypal'],
      customer_accounts_enabled: false, policies: [], shipping_policy: { body: '' }, url: 'http://localhost', currency: 'RON' },
    request: { locale: { iso_code: 'ro' }, design_mode: false, page_type: extra.template || 'index', origin: `http://localhost:${PORT}`, host: 'localhost', path: '/' },
    routes: { root_url: '/', cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', cart_update_url: '/cart/update', all_products_collection_url: '/collections/all',
      search_url: '/search', predictive_search_url: '/search/suggest', account_login_url: '/account/login', account_url: '/account', collections_url: '/collections' },
    localization: { available_countries: [], available_languages: [], country: { iso_code: 'RO' }, language: { iso_code: 'ro' } },
    template: { name: extra.template || 'index', suffix: null }, canonical_url: '/', page_title: 'Magazin Demo', content_for_header: '',
    linklists: {}, collections: { all: { products: Object.values(products), title: 'Toate' } }, customer: null, powered_by_link: '',
    additional_checkout_buttons: false, content_for_additional_checkout_buttons: '',
    ...extra,
  };
}

async function renderPage(template, extra) {
  const scope = baseScope(extra);
  let content = '';
  for (const sid of template.order) {
    const s = template.sections[sid];
    content += await renderSection(s.type, s, scope, sid);
  }
  scope.content_for_layout = content;
  try {
    return await engine.parseAndRender(read('layout/theme.liquid'), scope, { globals: globalsOf(scope) });
  } catch (e) {
    errors.push('[layout] ' + e.message);
    return `<pre>${e.stack}</pre>`;
  }
}

async function renderSectionsJson(ids, extra) {
  const out = {};
  const scope = baseScope(extra);
  for (const id of ids) {
    if (!id) continue;
    if (id === 'cart-icon-bubble' || id === 'cart-drawer' || id === 'cart-live-region-text' || id === 'cart-notification-product' || id === 'cart-notification-button') {
      out[id] = await renderSection(id, staticSectionData(id), scope, id);
    } else if (sectionRegistry[id]) {
      out[id] = await renderSection(sectionRegistry[id].type, sectionRegistry[id], scope, id);
    }
  }
  return out;
}

/* ---------------- pagini de test ---------------- */
const sectionRegistry = {};
function productTemplate() {
  const t = JSON.parse(fs.readFileSync(path.join(__dirname, 'product-template.json'), 'utf8'));
  Object.entries(t.sections).forEach(([k, v]) => (sectionRegistry[k] = v));
  return t;
}

/* ---------------- server ---------------- */
const mime = { '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json' };
const body = (req) => new Promise((res) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => res(d)); });
function svgImage(name) {
  const hue = [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % 360;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},55%,82%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},50%,62%)"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><text x="400" y="420" font-family="sans-serif" font-size="48" text-anchor="middle" fill="rgba(0,0,0,.35)">${name}</text></svg>`;
}

const server = http.createServer(async (req, res) => {
  const u = url.parse(req.url, true);
  const send = (code, type, data) => { res.writeHead(code, { 'Content-Type': type }); res.end(data); };
  try {
    if (u.pathname.startsWith('/assets/')) {
      const f = path.join(THEME, 'assets', path.basename(u.pathname));
      if (!fs.existsSync(f)) { errors.push('404 ' + u.pathname); return send(404, 'text/plain', 'nu'); }
      return send(200, mime[path.extname(f)] || 'application/octet-stream', fs.readFileSync(f));
    }
    if (u.pathname.startsWith('/img/')) return send(200, 'image/svg+xml', svgImage(path.basename(u.pathname, '.svg')));
    if (u.pathname === '/__errors') return send(200, 'application/json', JSON.stringify(errors));
    if (u.pathname === '/__reset') { cartState = { items: [], note: '', discount_codes: [] }; errors.length = 0; return send(200, 'text/plain', 'ok'); }
    if (u.pathname === '/browsing_context_suggestions.json') return send(200, 'application/json', JSON.stringify({ detected_values: { country: { handle: 'RO' } } }));
    if (u.pathname.startsWith('/discount/')) { return send(200, 'text/html', 'ok'); }
    if (u.pathname === '/cart.js' || u.pathname === '/cart.json') return send(200, 'application/json', JSON.stringify(cartJson()));
    if (['/cart/add.js', '/cart/add', '/cart/change.js', '/cart/change', '/cart/update.js', '/cart/update'].includes(u.pathname) && req.method === 'POST') {
      const raw = await body(req);
      let data = {};
      if ((req.headers['content-type'] || '').includes('json')) data = JSON.parse(raw || '{}');
      else { // multipart FormData
        const fields = {}; raw.split(/------[^\r\n]+/).forEach((part) => { const m = part.match(/name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n$/); if (m) fields[m[1]] = m[2]; });
        data = { id: fields.id, quantity: fields.quantity, sections: fields.sections, sections_url: fields.sections_url };
        Object.keys(fields).forEach((k) => { const pm = k.match(/^properties\[(.+)\]$/); if (pm) { data.properties = data.properties || {}; data.properties[pm[1]] = fields[k]; } });
      }
      let added = [];
      if (u.pathname.startsWith('/cart/add')) {
        const items = data.items || [{ id: data.id, quantity: data.quantity || 1, properties: data.properties }];
        items.forEach((it) => {
          const id = Number(it.id); const q = Number(it.quantity) || 1;
          const existing = cartState.items.find((x) => x.id === id && JSON.stringify(x.properties || {}) === JSON.stringify(it.properties || {}));
          if (existing) existing.quantity += q; else cartState.items.push({ id, quantity: q, properties: it.properties || {} });
          added.push(id);
        });
      } else if (u.pathname.startsWith('/cart/change')) {
        const line = Number(data.line); const q = Number(data.quantity);
        if (line && cartState.items[line - 1]) { if (q === 0) cartState.items.splice(line - 1, 1); else cartState.items[line - 1].quantity = q; }
      } else {
        if (data.note !== undefined) cartState.note = data.note;
        if (data.discount !== undefined) cartState.discount_codes = String(data.discount).split(',').filter(Boolean).map((c) => ({ code: c, applicable: c.toUpperCase() === 'BINE10' }));
      }
      const sections = typeof data.sections === 'string' ? data.sections.split(',') : data.sections || [];
      const out = cartJson();
      out.sections = await renderSectionsJson(sections, {});
      if (u.pathname.startsWith('/cart/add')) {
        const lastItems = out.items.filter((i) => added.includes(i.id));
        if (!data.items) return send(200, 'application/json', JSON.stringify({ ...lastItems[0], sections: out.sections }));
        return send(200, 'application/json', JSON.stringify({ items: lastItems, sections: out.sections }));
      }
      return send(200, 'application/json', JSON.stringify(out));
    }
    if (u.query.sections) {
      return send(200, 'application/json', JSON.stringify(await renderSectionsJson(u.query.sections.split(','), {})));
    }
    if (u.query.section_id) {
      const id = u.query.section_id;
      let product = productByHandle((u.pathname.split('/products/')[1] || '').split('?')[0]);
      if (product && (u.query.option_values || u.query.variant)) product = withVariant(product, u.query);
      const json = await renderSectionsJson([id], product ? { product, template: 'product' } : {});
      return send(200, 'text/html', json[id] || '');
    }
    if (u.pathname.startsWith('/products/')) {
      const product = productByHandle(u.pathname.split('/products/')[1]);
      if (!product) return send(404, 'text/plain', 'nu');
      const html = await renderPage(productTemplate(), { product, template: 'product', page_title: product.title });
      return send(200, 'text/html; charset=utf-8', html);
    }
    if (u.pathname.startsWith('/pages/')) {
      const name = u.pathname.split('/pages/')[1];
      const tfile = path.join(__dirname, 'pages', name + '.json');
      if (!fs.existsSync(tfile)) return send(404, 'text/plain', 'nu');
      const t = JSON.parse(fs.readFileSync(tfile, 'utf8'));
      Object.entries(t.sections).forEach(([k, v]) => (sectionRegistry[k] = v));
      return send(200, 'text/html; charset=utf-8', await renderPage(t, { template: 'page', product: products.perna }));
    }
    send(404, 'text/plain', 'nu ' + u.pathname);
  } catch (e) {
    errors.push(e.stack);
    send(500, 'text/plain', e.stack);
  }
});
server.listen(PORT, () => console.log('harness pe', PORT));
