/* Caiet — aplicație personală de notițe Markdown, local-first.
 * Notele sunt fișiere .md într-un "seif": fie un dosar real de pe disc
 * (File System Access API), fie stocarea din browser (IndexedDB).
 */
'use strict';

// ---------------------------------------------------------------------------
// Utilitare
// ---------------------------------------------------------------------------
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const isMd = (p) => /\.(md|markdown)$/i.test(p);
const isImg = (p) => /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(p);
const basename = (p) => p.split('/').pop();
const dirname = (p) => p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '';
const stem = (p) => basename(p).replace(/\.(md|markdown)$/i, '');
const join = (...parts) => parts.filter(Boolean).join('/');
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const pad = (n) => String(n).padStart(2, '0');
const today = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const lsGet = (k, d) => { try { const v = localStorage.getItem('caiet:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem('caiet:' + k, JSON.stringify(v)); } catch {} };

function toast(msg, ms = 2200) {
  const t = $('#toast'); t.textContent = msg; t.classList.remove('hidden');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add('hidden'), ms);
}

// ---------------------------------------------------------------------------
// IndexedDB mic (chei-valoare)
// ---------------------------------------------------------------------------
const idb = {
  _db: null,
  open() {
    if (this._db) return this._db;
    this._db = new Promise((res, rej) => {
      const r = indexedDB.open('caiet', 1);
      r.onupgradeneeded = () => { const db = r.result; db.createObjectStore('files'); db.createObjectStore('meta'); };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    return this._db;
  },
  async tx(store, mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const t = db.transaction(store, mode); const s = t.objectStore(store);
      const out = fn(s);
      t.oncomplete = () => res(out && 'result' in out ? out.result : out);
      t.onerror = () => rej(t.error);
    });
  },
  get: (store, k) => idb.tx(store, 'readonly', (s) => s.get(k)),
  set: (store, k, v) => idb.tx(store, 'readwrite', (s) => s.put(v, k)),
  del: (store, k) => idb.tx(store, 'readwrite', (s) => s.delete(k)),
  async entries(store) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const out = []; const t = db.transaction(store); const c = t.objectStore(store).openCursor();
      c.onsuccess = () => { const cur = c.result; if (cur) { out.push([cur.key, cur.value]); cur.continue(); } else res(out); };
      c.onerror = () => rej(c.error);
    });
  },
};

// ---------------------------------------------------------------------------
// Backend-uri de stocare
// Interfață: name, load() -> {files: Map<path,string|Blob>, folders: Set<path>},
//            write(path, data), remove(path, isFolder), mkdir(path)
// ---------------------------------------------------------------------------
class BrowserBackend {
  constructor() { this.name = 'Seif în browser'; this.kind = 'browser'; }
  async load() {
    const files = new Map(), folders = new Set();
    for (const [k, v] of await idb.entries('files')) {
      if (k.startsWith('dir:')) folders.add(k.slice(4)); else files.set(k, v);
    }
    return { files, folders };
  }
  write(path, data) { return idb.set('files', path, data); }
  async remove(path, isFolder) {
    if (!isFolder) return idb.del('files', path);
    for (const [k] of await idb.entries('files')) {
      const p = k.startsWith('dir:') ? k.slice(4) : k;
      if (p === path || p.startsWith(path + '/')) await idb.del('files', k);
    }
  }
  mkdir(path) { return idb.set('files', 'dir:' + path, 1); }
}

class FolderBackend {
  constructor(handle) { this.root = handle; this.name = handle.name; this.kind = 'folder'; }
  async load() {
    const files = new Map(), folders = new Set();
    const walk = async (dir, prefix) => {
      for await (const [name, h] of dir.entries()) {
        if (name.startsWith('.')) continue; // .obsidian, .git, .trash etc.
        const p = join(prefix, name);
        if (h.kind === 'directory') { folders.add(p); await walk(h, p); }
        else if (isMd(name)) files.set(p, await (await h.getFile()).text());
        else if (isImg(name) || /\.pdf$/i.test(name)) files.set(p, await h.getFile());
      }
    };
    await walk(this.root, '');
    return { files, folders };
  }
  async dir(path, create) {
    let d = this.root;
    for (const part of path.split('/').filter(Boolean)) d = await d.getDirectoryHandle(part, { create });
    return d;
  }
  async write(path, data) {
    const d = await this.dir(dirname(path), true);
    const fh = await d.getFileHandle(basename(path), { create: true });
    const w = await fh.createWritable(); await w.write(data); await w.close();
  }
  async remove(path, isFolder) {
    const d = await this.dir(dirname(path), false);
    await d.removeEntry(basename(path), { recursive: !!isFolder });
  }
  mkdir(path) { return this.dir(path, true); }
  async moveFolder(from, to) {
    const copy = async (src, dst) => {
      for await (const [name, h] of src.entries()) {
        if (h.kind === 'directory') await copy(h, await dst.getDirectoryHandle(name, { create: true }));
        else {
          const fh = await dst.getFileHandle(name, { create: true });
          const w = await fh.createWritable(); await w.write(await h.getFile()); await w.close();
        }
      }
    };
    await copy(await this.dir(from, false), await this.dir(to, true));
    await this.remove(from, true);
  }
}

// ---------------------------------------------------------------------------
// Seiful (model în memorie + index de legături)
// ---------------------------------------------------------------------------
const vault = {
  backend: null,
  files: new Map(),   // path -> string (md) | Blob (atașamente)
  folders: new Set(),
  links: new Map(),   // path -> [{target, resolved}]
  tags: new Map(),    // path -> Set(tag)
  blobUrls: new Map(),

  notes() { return [...this.files.keys()].filter(isMd).sort((a, b) => a.localeCompare(b)); },
  attachments() { return [...this.files.keys()].filter((p) => !isMd(p)); },

  async init(backend) {
    this.backend = backend;
    const { files, folders } = await backend.load();
    this.files = files; this.folders = folders;
    for (const u of this.blobUrls.values()) URL.revokeObjectURL(u);
    this.blobUrls.clear();
    this.reindex();
  },

  // Rezolvă un target de legătură [[...]] la o cale existentă
  resolve(target, from = '') {
    if (!target) return null;
    const t = target.trim().replace(/\\/g, '/').replace(/^\.\//, '');
    const withMd = isMd(t) ? t : t + '.md';
    for (const c of [t, withMd, join(dirname(from), withMd), join(dirname(from), t)]) if (this.files.has(c) && (c === t || isMd(c) || c.endsWith(t))) return c;
    const a = norm(t), b = norm(withMd);
    let best = null;
    for (const p of this.files.keys()) {
      const n = norm(p);
      if (n === a || n === b || n.endsWith('/' + a) || n.endsWith('/' + b)) {
        if (!best || p.split('/').length < best.split('/').length) best = p;
      }
    }
    return best;
  },

  parse(path) {
    const text = this.files.get(path) || '';
    const clean = stripCode(text);
    const links = [];
    const re = /(!?)\[\[([^\]|#^\n]*)(?:[#^][^\]|\n]*)?(?:\|[^\]\n]*)?\]\]/g;
    let m;
    while ((m = re.exec(clean))) if (m[2].trim()) links.push({ target: m[2].trim(), embed: !!m[1] });
    // legături markdown către .md locale
    const re2 = /\[[^\]]*\]\(([^)\s]+\.md)\)/g;
    while ((m = re2.exec(clean))) { try { links.push({ target: decodeURIComponent(m[1]) }); } catch {} }
    const tags = new Set();
    const fm = frontMatter(text).data;
    const fmTags = fm.tags || fm.tag;
    if (fmTags) (Array.isArray(fmTags) ? fmTags : String(fmTags).split(/[,\s]+/)).filter(Boolean).forEach((t) => tags.add(String(t).replace(/^#/, '')));
    const tre = /(^|[\s(,;])#([\p{L}\p{N}_\-/]*[\p{L}_\-/][\p{L}\p{N}_\-/]*)/gu;
    while ((m = tre.exec(clean.replace(/^---\n[\s\S]*?\n---/, '')))) tags.add(m[2]);
    return { links, tags };
  },

  reindex(path) {
    const paths = path ? [path] : this.notes();
    if (!path) { this.links.clear(); this.tags.clear(); }
    for (const p of paths) {
      if (!this.files.has(p)) { this.links.delete(p); this.tags.delete(p); continue; }
      const { links, tags } = this.parse(p);
      this.links.set(p, links); this.tags.set(p, tags);
    }
    // re-rezolvăm toate (o notă nouă poate rezolva legături vechi)
    for (const [p, ls] of this.links) for (const l of ls) l.resolved = this.resolve(l.target, p);
  },

  backlinks(path) {
    const out = [];
    for (const [p, ls] of this.links) if (p !== path && ls.some((l) => l.resolved === path)) out.push(p);
    return out.sort();
  },

  allTags() {
    const counts = new Map();
    for (const set of this.tags.values()) for (const t of set) counts.set(t, (counts.get(t) || 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  },

  blobUrl(path) {
    const v = this.files.get(path);
    if (!(v instanceof Blob)) return null;
    if (!this.blobUrls.has(path)) this.blobUrls.set(path, URL.createObjectURL(v));
    return this.blobUrls.get(path);
  },

  uniquePath(path) {
    if (!this.files.has(path) && !this.folders.has(path)) return path;
    const m = path.match(/^(.*?)(\.[^./]+)?$/);
    for (let i = 1; ; i++) { const p = `${m[1]} ${i}${m[2] || ''}`; if (!this.files.has(p) && !this.folders.has(p)) return p; }
  },

  async ensureParents(path) {
    let d = dirname(path); const todo = [];
    while (d && !this.folders.has(d)) { todo.unshift(d); d = dirname(d); }
    for (const f of todo) { this.folders.add(f); await this.backend.mkdir(f); }
  },

  async write(path, data) {
    await this.ensureParents(path);
    this.files.set(path, data);
    if (data instanceof Blob && this.blobUrls.has(path)) { URL.revokeObjectURL(this.blobUrls.get(path)); this.blobUrls.delete(path); }
    await this.backend.write(path, data);
    if (isMd(path)) this.reindex(path);
  },

  async create(path, content = '') {
    path = this.uniquePath(path);
    await this.write(path, content);
    return path;
  },

  async mkdir(path) {
    path = this.uniquePath(path);
    await this.ensureParents(path + '/x');
    return path;
  },

  async remove(path) {
    const isFolder = this.folders.has(path);
    if (isFolder) {
      for (const p of [...this.files.keys()]) if (p.startsWith(path + '/')) this.files.delete(p);
      for (const f of [...this.folders]) if (f === path || f.startsWith(path + '/')) this.folders.delete(f);
    } else this.files.delete(path);
    await this.backend.remove(path, isFolder);
    this.reindex();
  },

  // Redenumire / mutare cu actualizarea legăturilor din alte note
  async rename(from, to) {
    if (from === to) return to;
    if (this.files.has(to) || this.folders.has(to)) throw new Error('Există deja: ' + to);
    if (to.startsWith(from + '/')) throw new Error('Nu poți muta un dosar în el însuși');
    const isFolder = this.folders.has(from);
    const moves = new Map();
    if (isFolder) { for (const p of this.files.keys()) if (p.startsWith(from + '/')) moves.set(p, to + p.slice(from.length)); }
    else moves.set(from, to);

    // ce texte de legătură (per notă) indică fișierele mutate
    const rewrite = new Map(); // nota -> Map(targetNormalizat -> calea nouă)
    for (const [p, ls] of this.links) for (const l of ls) {
      if (!moves.has(l.resolved)) continue;
      if (!rewrite.has(p)) rewrite.set(p, new Map());
      rewrite.get(p).set(norm(l.target), moves.get(l.resolved));
    }

    await this.ensureParents(isFolder ? to + '/x' : to);
    if (isFolder && this.backend.moveFolder) {
      await this.backend.moveFolder(from, to);
    } else {
      for (const [a, b] of moves) { await this.ensureParents(b); await this.backend.write(b, this.files.get(a)); }
      await this.backend.remove(from, isFolder);
    }
    for (const [a, b] of moves) {
      this.files.set(b, this.files.get(a)); this.files.delete(a);
      if (this.blobUrls.has(a)) { URL.revokeObjectURL(this.blobUrls.get(a)); this.blobUrls.delete(a); }
    }
    if (isFolder) for (const f of [...this.folders]) if (f === from || f.startsWith(from + '/')) { this.folders.delete(f); this.folders.add(to + f.slice(from.length)); }

    for (const [p0, map] of rewrite) {
      const p = moves.get(p0) || p0;
      const text = this.files.get(p); if (typeof text !== 'string') continue;
      const next = text.replace(/(!?\[\[)([^\]|#^\n]*)([^\]\n]*\]\])/g, (all, a, target, rest) => {
        const np = map.get(norm(target.trim()));
        return np ? a + linkText(np, this) + rest : all;
      });
      if (next !== text) { this.files.set(p, next); await this.backend.write(p, next); }
    }
    this.reindex();
    return to;
  },
};

// Textul cel mai scurt care identifică unic o notă
function linkText(path, v = vault) {
  const s = isMd(path) ? stem(path) : basename(path);
  const clash = [...v.files.keys()].filter((p) => (isMd(p) ? stem(p) : basename(p)).toLowerCase() === s.toLowerCase());
  if (clash.length <= 1) return s;
  return isMd(path) ? path.replace(/\.md$/i, '') : path;
}

function stripCode(text) {
  return text.replace(/```[\s\S]*?(```|$)/g, (m) => m.replace(/[^\n]/g, ' ')).replace(/`[^`\n]*`/g, (m) => ' '.repeat(m.length));
}

// Front matter YAML simplu (chei: valoare, liste)
function frontMatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return { data: {}, body: text, raw: '' };
  const data = {}; let lastKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const li = /^\s*-\s+(.*)$/.exec(line);
    if (li && lastKey) { if (!Array.isArray(data[lastKey])) data[lastKey] = []; data[lastKey].push(unq(li[1])); continue; }
    const kv = /^([\w\- ]+):\s*(.*)$/.exec(line);
    if (kv) {
      lastKey = kv[1].trim(); let v = kv[2].trim();
      if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(',').map((s) => unq(s.trim())).filter(Boolean);
      else v = unq(v);
      data[lastKey] = v === '' ? [] : v;
    }
  }
  return { data, body: text.slice(m[0].length), raw: m[0] };
}
function unq(s) { return s.replace(/^["']|["']$/g, ''); }

// ---------------------------------------------------------------------------
// Markdown: extensii pentru [[wikilinks]], ![[embed]], #etichete, ==evidențiere==
// ---------------------------------------------------------------------------
let renderCtx = { path: '', depth: 0 };

marked.use({
  gfm: true,
  breaks: true,
  extensions: [
    {
      name: 'wikilink', level: 'inline',
      start(src) { const i = src.search(/!?\[\[/); return i < 0 ? undefined : i; },
      tokenizer(src) {
        const m = /^(!?)\[\[([^\]\n]+?)\]\]/.exec(src);
        if (!m) return;
        const [target, alias] = m[2].split('|');
        const [file, sub] = target.split(/#\^?/);
        return { type: 'wikilink', raw: m[0], embed: !!m[1], file: file.trim(), sub: (sub || '').trim(), alias: alias && alias.trim() };
      },
      renderer(t) {
        const resolved = t.file ? vault.resolve(t.file, renderCtx.path) : renderCtx.path;
        const label = t.alias || (t.file ? t.file + (t.sub ? ' › ' + t.sub : '') : t.sub);
        if (t.embed) {
          if (resolved && !isMd(resolved)) {
            const url = vault.blobUrl(resolved);
            if (isImg(resolved)) {
              const w = t.alias && /^\d+(x\d+)?$/.test(t.alias) ? ` width="${t.alias.split('x')[0]}"` : '';
              return `<img src="${url}" alt="${esc(basename(resolved))}"${w}>`;
            }
            return `<a href="${url}" target="_blank" rel="noopener">${esc(basename(resolved))}</a>`;
          }
          if (resolved && renderCtx.depth < 2) {
            let src = frontMatter(vault.files.get(resolved) || '').body;
            if (t.sub) src = sectionOf(src, t.sub);
            const saved = renderCtx;
            renderCtx = { path: resolved, depth: saved.depth + 1 };
            const html = marked.parse(src);
            renderCtx = saved;
            return `<div class="embed"><div class="embed-title" data-href="${esc(resolved)}">${esc(stem(resolved))}${t.sub ? ' › ' + esc(t.sub) : ''}</div>${html}</div>`;
          }
        }
        const cls = resolved ? 'internal' : 'internal missing';
        return `<a class="${cls}" data-href="${esc(t.file)}" data-sub="${esc(t.sub)}" href="#">${esc(label)}</a>`;
      },
    },
    {
      name: 'tag', level: 'inline',
      start(src) { const m = /(^|[\s(,;])#[\p{L}_\-/]/u.exec(src); return m ? m.index + m[1].length : undefined; },
      tokenizer(src) {
        const m = /^#([\p{L}\p{N}_\-/]*[\p{L}_\-/][\p{L}\p{N}_\-/]*)/u.exec(src);
        if (m) return { type: 'tag', raw: m[0], tag: m[1] };
      },
      renderer(t) { return `<a class="tag" data-tag="${esc(t.tag)}" href="#">#${esc(t.tag)}</a>`; },
    },
    {
      name: 'highlight', level: 'inline',
      start(src) { const i = src.indexOf('=='); return i < 0 ? undefined : i; },
      tokenizer(src) {
        const m = /^==(?=\S)([\s\S]*?\S)==/.exec(src);
        if (m) return { type: 'highlight', raw: m[0], tokens: this.lexer.inlineTokens(m[1]) };
      },
      renderer(t) { return `<mark>${this.parser.parseInline(t.tokens)}</mark>`; },
    },
  ],
});

function sectionOf(md, heading) {
  const lines = md.split('\n');
  const i = lines.findIndex((l) => /^#{1,6}\s/.test(l) && norm(l.replace(/^#+\s*/, '').trim()) === norm(heading));
  if (i < 0) {
    // bloc ^id
    const b = lines.find((l) => l.trim().endsWith('^' + heading));
    return b ? b.replace(new RegExp('\\s*\\^' + escRe(heading) + '$'), '') : `*Secțiunea „${heading}” nu a fost găsită.*`;
  }
  const level = lines[i].match(/^#+/)[0].length;
  let j = i + 1;
  while (j < lines.length && !(new RegExp(`^#{1,${level}}\\s`).test(lines[j]))) j++;
  return lines.slice(i, j).join('\n');
}

function renderMarkdown(text, path) {
  const { data, body } = frontMatter(text);
  renderCtx = { path, depth: 0 };
  let html = marked.parse(body.replace(/%%[\s\S]*?%%/g, ''));
  const keys = Object.keys(data);
  if (keys.length) {
    html = `<div class="props">${keys.map((k) => `<div><span class="k">${esc(k)}</span><span>${esc(Array.isArray(data[k]) ? data[k].join(', ') : data[k])}</span></div>`).join('')}</div>` + html;
  }
  return html;
}

// După randare: callouts, task-uri, ancore la titluri
function decoratePreview(root) {
  // callouts: > [!tip] Titlu
  for (const bq of root.querySelectorAll('blockquote')) {
    const p = bq.firstElementChild;
    if (!p || p.tagName !== 'P') continue;
    const m = /^\[!(\w+)\]([+-]?)\s*([^\n<]*)/.exec(p.innerHTML);
    if (!m) continue;
    const type = m[1].toLowerCase();
    bq.className = 'callout'; bq.dataset.type = type;
    p.innerHTML = p.innerHTML.slice(m[0].length).replace(/^<br>\s*/, '');
    const title = document.createElement('div');
    title.className = 'callout-title';
    title.textContent = m[3].trim() || type[0].toUpperCase() + type.slice(1);
    bq.prepend(title);
    if (!p.innerHTML.trim()) p.remove();
  }
  root.querySelectorAll('li > input[type=checkbox], li > p:first-child > input[type=checkbox]').forEach((cb, i) => {
    cb.disabled = false; cb.dataset.task = i;
    const li = cb.closest('li');
    li.classList.add('task');
    if (cb.checked) li.classList.add('done');
  });
  root.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((h) => { h.id = 'h-' + norm(h.textContent).replace(/[^\w]+/g, '-'); });
  root.querySelectorAll('a[href^="http"]').forEach((a) => { a.target = '_blank'; a.rel = 'noopener'; });
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|blob:|data:)/.test(src)) {
      let p; try { p = decodeURIComponent(src); } catch { p = src; }
      const r = vault.resolve(p, state.path) || vault.resolve(join(dirname(state.path), p));
      if (r) img.src = vault.blobUrl(r);
    }
  });
  root.querySelectorAll('a[href]:not(.internal):not(.tag)').forEach((a) => {
    const href = a.getAttribute('href');
    if (/^(https?:|mailto:|#|blob:)/.test(href)) return;
    let p; try { p = decodeURIComponent(href); } catch { p = href; }
    const r = vault.resolve(p, state.path);
    if (r) { a.classList.add('internal'); a.dataset.href = r; a.setAttribute('href', '#'); }
  });
}

// ---------------------------------------------------------------------------
// Starea UI
// ---------------------------------------------------------------------------
const state = {
  path: null,
  mode: lsGet('mode', 'split'),
  history: [], hIndex: -1,
  collapsed: new Set(lsGet('collapsed', [])),
  dirty: false,
};
const editor = $('#editor');
const preview = $('#preview');

function setMode(mode) {
  state.mode = mode; lsSet('mode', mode);
  $('#content').classList.remove('mode-edit', 'mode-split', 'mode-preview');
  $('#content').classList.add('mode-' + mode);
  $$('#mode-switch button').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  if (mode !== 'edit') renderPreview();
}

async function openNote(path, { push = true, sub = '' } = {}) {
  await flushSave();
  if (path && !vault.files.has(path)) path = null;
  if (path && !isMd(path)) { const u = vault.blobUrl(path); if (u) window.open(u, '_blank'); return; }
  state.path = path;
  lsSet('last', path);
  $('#content').classList.toggle('no-note', !path);
  if (path) {
    editor.value = vault.files.get(path);
    $('#note-title').value = stem(path);
    if (push) {
      state.history = state.history.slice(0, state.hIndex + 1);
      if (state.history[state.hIndex] !== path) state.history.push(path);
      state.hIndex = state.history.length - 1;
    }
    editor.scrollTop = 0; preview.scrollTop = 0;
    editor.setSelectionRange(0, 0);
  } else {
    editor.value = ''; $('#note-title').value = '';
  }
  document.title = path ? stem(path) + ' – Caiet' : 'Caiet';
  $('#save-state').textContent = '';
  renderPreview(); renderTree(); renderRight(); updateStatus();
  if (sub) scrollToHeading(sub);
}

function scrollToHeading(sub) {
  const id = 'h-' + norm(sub).replace(/[^\w]+/g, '-');
  const el = preview.querySelector('#' + CSS.escape(id));
  if (el && state.mode !== 'edit') el.scrollIntoView({ block: 'start' });
  const i = editor.value.split('\n').findIndex((l) => /^#{1,6}\s/.test(l) && norm(l.replace(/^#+\s*/, '')) === norm(sub));
  if (i >= 0) {
    const pos = editor.value.split('\n').slice(0, i).join('\n').length + (i ? 1 : 0);
    editor.setSelectionRange(pos, pos);
    const lh = parseFloat(getComputedStyle(editor).lineHeight) || 24;
    editor.scrollTop = Math.max(0, i * lh - 60);
  }
}

function renderPreview() {
  if (!state.path || state.mode === 'edit') return;
  preview.innerHTML = renderMarkdown(editor.value, state.path);
  decoratePreview(preview);
}
const renderPreviewSoon = debounce(renderPreview, 150);

// Salvare automată
let saveTimer = null;
function scheduleSave() {
  state.dirty = true;
  $('#save-state').textContent = '•';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 600);
}
async function flushSave() {
  clearTimeout(saveTimer);
  if (!state.dirty || !state.path) return;
  state.dirty = false;
  const path = state.path, text = editor.value;
  try {
    await vault.write(path, text);
    if (state.path === path) $('#save-state').textContent = '';
    renderRight(); refreshSidebarPanes();
  } catch (e) {
    state.dirty = true;
    $('#save-state').textContent = '⚠ nesalvat';
    toast('Eroare la salvare: ' + e.message, 4000);
  }
}

function updateStatus() {
  const t = editor.value;
  const words = (t.match(/[\p{L}\p{N}]+/gu) || []).length;
  $('#status-words').textContent = state.path ? `${words} cuvinte · ${t.length} caractere` : '';
  $('#status-storage').textContent = vault.backend ? (vault.backend.kind === 'folder' ? '📂 ' : '🌐 ') + vault.backend.name : '';
  const bl = state.path ? vault.backlinks(state.path).length : 0;
  $('#status-backlinks').textContent = state.path ? `${bl} legături înapoi` : '';
}

// ---------------------------------------------------------------------------
// Arborele de fișiere
// ---------------------------------------------------------------------------
function buildTree() {
  const root = { name: '', path: '', dirs: new Map(), files: [] };
  const getDir = (p) => {
    let node = root;
    for (const part of p.split('/').filter(Boolean)) {
      const np = join(node.path, part);
      if (!node.dirs.has(part)) node.dirs.set(part, { name: part, path: np, dirs: new Map(), files: [] });
      node = node.dirs.get(part);
    }
    return node;
  };
  for (const f of vault.folders) getDir(f);
  for (const p of vault.files.keys()) getDir(dirname(p)).files.push(p);
  return root;
}

function renderTree() {
  const el = $('#tree');
  const scroll = el.scrollTop;
  const sortMode = lsGet('sort', 'name');
  const html = [];
  const walk = (node) => {
    const dirs = [...node.dirs.values()].sort((a, b) => a.name.localeCompare(b.name, 'ro'));
    for (const d of dirs) {
      const c = state.collapsed.has(d.path);
      html.push(`<div class="tree-item folder${c ? ' collapsed' : ''}" data-path="${esc(d.path)}" data-folder="1" draggable="true"><span class="chev">▼</span><span class="label">${esc(d.name)}</span></div>`);
      html.push(`<div class="tree-children${c ? ' collapsed' : ''}">`); walk(d); html.push('</div>');
    }
    const files = node.files.slice().sort((a, b) => sortMode === 'name' ? basename(a).localeCompare(basename(b), 'ro', { numeric: true }) : 0);
    for (const f of files) {
      const md = isMd(f);
      const ext = md ? '' : `<span class="ext">${esc(f.split('.').pop())}</span>`;
      html.push(`<div class="tree-item file${f === state.path ? ' active' : ''}" data-path="${esc(f)}" draggable="true"><span class="chev"></span><span class="label">${esc(md ? stem(f) : basename(f))}</span>${ext}</div>`);
    }
  };
  walk(buildTree());
  el.innerHTML = html.join('') || '<p class="muted small" style="padding:8px">Seiful e gol. Apasă ＋ pentru o notă nouă.</p>';
  el.scrollTop = scroll;
  $('#vault-name').textContent = vault.backend ? vault.backend.name : '';
}

$('#tree').addEventListener('click', (e) => {
  const item = e.target.closest('.tree-item'); if (!item || item.querySelector('input')) return;
  const p = item.dataset.path;
  if (item.dataset.folder) {
    state.collapsed.has(p) ? state.collapsed.delete(p) : state.collapsed.add(p);
    lsSet('collapsed', [...state.collapsed]); renderTree();
  } else { openNote(p); closeMobileSidebar(); }
});
$('#tree').addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const item = e.target.closest('.tree-item');
  const p = item ? item.dataset.path : '';
  const isFolder = item ? !!item.dataset.folder : true;
  const base = isFolder ? p : dirname(p);
  const items = [
    ['Notă nouă aici', () => newNote(base)],
    ['Dosar nou aici', () => newFolder(base)],
  ];
  if (item) {
    items.push('-', ['Redenumește', () => startRename(item)]);
    if (!isFolder) items.push(['Fă o copie', async () => { const np = await vault.create(p, vault.files.get(p)); renderTree(); openNote(np); }]);
    if (!isFolder && isMd(p)) items.push(['Deschide în graf local', () => { openNote(p).then(() => { $('#graph-local').checked = true; openGraph(); }); }]);
    items.push('-', ['Șterge', () => deletePath(p), 'danger']);
  }
  showMenu(e.clientX, e.clientY, items);
});
$('#tree').addEventListener('dblclick', (e) => { const item = e.target.closest('.tree-item'); if (item) startRename(item); });

// drag & drop pentru mutare
let dragPath = null;
$('#tree').addEventListener('dragstart', (e) => { const it = e.target.closest('.tree-item'); if (it) { dragPath = it.dataset.path; e.dataTransfer.effectAllowed = 'move'; } });
$('#tree').addEventListener('dragover', (e) => {
  if (!dragPath && !e.dataTransfer.types.includes('Files')) return;
  e.preventDefault();
  $$('.drop-target').forEach((x) => x.classList.remove('drop-target'));
  const it = e.target.closest('.tree-item.folder'); if (it) it.classList.add('drop-target');
});
$('#tree').addEventListener('drop', async (e) => {
  e.preventDefault();
  $$('.drop-target').forEach((x) => x.classList.remove('drop-target'));
  const it = e.target.closest('.tree-item');
  const dest = it ? (it.dataset.folder ? it.dataset.path : dirname(it.dataset.path)) : '';
  if (e.dataTransfer.files.length && !dragPath) { await importFiles(e.dataTransfer.files, dest); return; }
  const src = dragPath; dragPath = null;
  if (!src || src === dest || dest.startsWith(src + '/') || dirname(src) === dest) return;
  try {
    await flushSave();
    const np = await vault.rename(src, join(dest, basename(src)));
    if (state.path === src || (state.path && state.path.startsWith(src + '/'))) state.path = np + state.path.slice(src.length);
    renderTree(); openNote(state.path, { push: false });
    toast('Mutat în ' + (dest || 'rădăcină'));
  } catch (err) { toast(err.message, 3500); }
});
$('#tree').addEventListener('dragend', () => { dragPath = null; });

function startRename(item) {
  const p = item.dataset.path, isFolder = !!item.dataset.folder;
  const label = item.querySelector('.label');
  const input = document.createElement('input');
  input.value = isFolder || !isMd(p) ? basename(p) : stem(p);
  label.replaceWith(input); input.focus(); input.select();
  let done = false;
  const finish = async (ok) => {
    if (done) return; done = true;
    const v = input.value.trim().replace(/[\\/:]/g, '-');
    if (ok && v && v !== (isFolder || !isMd(p) ? basename(p) : stem(p))) await renamePath(p, join(dirname(p), isFolder || !isMd(p) ? v : v + '.md'));
    else renderTree();
  };
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') finish(true); if (e.key === 'Escape') finish(false); e.stopPropagation(); });
  input.addEventListener('blur', () => finish(true));
}

async function renamePath(from, to) {
  try {
    await flushSave();
    const np = await vault.rename(from, to);
    if (state.path === from) state.path = np;
    else if (state.path && state.path.startsWith(from + '/')) state.path = np + state.path.slice(from.length);
    state.history = state.history.map((h) => h === from ? np : h.startsWith(from + '/') ? np + h.slice(from.length) : h);
    if (state.collapsed.has(from)) { state.collapsed.delete(from); state.collapsed.add(np); }
    renderTree(); await openNote(state.path, { push: false });
    refreshSidebarPanes();
  } catch (e) { toast(e.message, 3500); renderTree(); }
}

async function deletePath(p) {
  const isFolder = vault.folders.has(p);
  const n = isFolder ? [...vault.files.keys()].filter((f) => f.startsWith(p + '/')).length : 0;
  if (!confirm(isFolder ? `Ștergi dosarul „${basename(p)}” și ${n} fișiere din el?` : `Ștergi „${basename(p)}”?`)) return;
  try {
    await vault.remove(p);
    if (state.path && (state.path === p || state.path.startsWith(p + '/'))) { state.dirty = false; await openNote(null); }
    renderTree(); renderRight(); refreshSidebarPanes();
    toast('Șters');
  } catch (e) { toast(e.message, 3500); }
}

async function newNote(folder = state.path ? dirname(state.path) : '', name = 'Fără titlu', content = '') {
  await flushSave();
  const p = await vault.create(join(folder, name + '.md'), content);
  if (folder) state.collapsed.delete(folder);
  renderTree(); await openNote(p);
  if (state.mode === 'preview') setMode('split');
  $('#note-title').focus(); $('#note-title').select();
  return p;
}
async function newFolder(parent = '') {
  const p = await vault.mkdir(join(parent, 'Dosar nou'));
  if (parent) state.collapsed.delete(parent);
  renderTree();
  const item = $(`#tree .tree-item[data-path="${CSS.escape(p)}"]`);
  if (item) startRename(item);
}

// Redenumire din titlu
$('#note-title').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); editor.focus(); }
  if (e.key === 'Escape') { $('#note-title').value = stem(state.path || ''); editor.focus(); }
});
$('#note-title').addEventListener('blur', async () => {
  if (!state.path) return;
  const v = $('#note-title').value.trim().replace(/[\\/:]/g, '-');
  if (!v) { $('#note-title').value = stem(state.path); return; }
  if (v !== stem(state.path)) await renamePath(state.path, join(dirname(state.path), v + '.md'));
});

// ---------------------------------------------------------------------------
// Meniu contextual
// ---------------------------------------------------------------------------
function showMenu(x, y, items) {
  const m = $('#ctxmenu');
  m.innerHTML = '';
  for (const it of items) {
    if (it === '-') { m.appendChild(document.createElement('hr')); continue; }
    const b = document.createElement('button');
    b.textContent = it[0]; if (it[2]) b.className = it[2];
    b.onclick = () => { m.classList.add('hidden'); it[1](); };
    m.appendChild(b);
  }
  m.classList.remove('hidden');
  const r = m.getBoundingClientRect();
  m.style.left = Math.min(x, innerWidth - r.width - 8) + 'px';
  m.style.top = Math.min(y, innerHeight - r.height - 8) + 'px';
}
document.addEventListener('mousedown', (e) => { if (!e.target.closest('#ctxmenu')) $('#ctxmenu').classList.add('hidden'); });

// ---------------------------------------------------------------------------
// Panoul din dreapta: backlinks, mențiuni, legături ieșite, cuprins
// ---------------------------------------------------------------------------
function snippet(text, idx, len, radius = 60) {
  const s = Math.max(0, idx - radius), e = Math.min(text.length, idx + len + radius);
  return (s > 0 ? '…' : '') + esc(text.slice(s, idx)) + '<mark>' + esc(text.slice(idx, idx + len)) + '</mark>' + esc(text.slice(idx + len, e)) + (e < text.length ? '…' : '');
}

function renderRight() {
  const p = state.path;
  const bl = $('#backlinks'), um = $('#unlinked'), ol = $('#outlinks'), toc = $('#outline');
  if (!p) { bl.innerHTML = um.innerHTML = ol.innerHTML = toc.innerHTML = ''; $('#bl-count').textContent = $('#um-count').textContent = ''; return; }
  const name = stem(p);
  const back = vault.backlinks(p);
  $('#bl-count').textContent = back.length;
  bl.innerHTML = back.map((b) => {
    const text = vault.files.get(b);
    const re = new RegExp('\\[\\[[^\\]]*' + escRe(name) + '[^\\]]*\\]\\]', 'i');
    const m = re.exec(text);
    return `<div class="result" data-open="${esc(b)}"><div class="r-title">${esc(stem(b))}</div>${m ? `<div class="r-snip">${snippet(text, m.index, m[0].length, 50)}</div>` : ''}</div>`;
  }).join('') || '<p class="muted small">Nicio legătură.</p>';

  // mențiuni fără legătură
  const mentions = [];
  if (name.length >= 3) {
    const re = new RegExp('(^|[^\\p{L}\\p{N}\\[])(' + escRe(name) + ')(?![\\p{L}\\p{N}])', 'iu');
    for (const q of vault.notes()) {
      if (q === p || back.includes(q)) continue;
      const text = stripCode(vault.files.get(q));
      const m = re.exec(text);
      if (m) mentions.push([q, m.index + m[1].length, m[2].length]);
    }
  }
  $('#um-count').textContent = mentions.length;
  um.innerHTML = mentions.map(([q, i, l]) => `<div class="result" data-open="${esc(q)}"><span class="r-actions"><button data-link="${esc(q)}" data-at="${i}" data-len="${l}">Leagă</button></span><div class="r-title">${esc(stem(q))}</div><div class="r-snip">${snippet(vault.files.get(q), i, l, 50)}</div></div>`).join('') || '<p class="muted small">Nicio mențiune.</p>';

  const outs = vault.links.get(p) || [];
  const seen = new Set();
  ol.innerHTML = outs.filter((l) => !seen.has(l.target) && seen.add(l.target)).map((l) =>
    `<div class="result" data-open="${esc(l.resolved || '')}" data-create="${esc(l.target)}"><div class="r-title" style="${l.resolved ? '' : 'color:var(--link-missing)'}">${esc(l.resolved ? stem(l.resolved) : l.target)}${l.resolved ? '' : ' <span class="badge">nu există</span>'}</div></div>`
  ).join('') || '<p class="muted small">Nicio legătură.</p>';

  const heads = [];
  let inCode = false;
  for (const line of editor.value.split('\n')) {
    if (/^\s*```/.test(line)) inCode = !inCode;
    const m = !inCode && /^(#{1,6})\s+(.*)/.exec(line);
    if (m) heads.push([m[1].length, m[2].trim()]);
  }
  toc.innerHTML = heads.map(([lv, h]) => `<div class="result" data-heading="${esc(h)}" style="padding-left:${(lv - 1) * 12 + 8}px">${esc(h)}</div>`).join('') || '<p class="muted small">Niciun titlu.</p>';
  updateStatus();
}
const renderRightSoon = debounce(renderRight, 400);

$('#rightbar').addEventListener('click', async (e) => {
  const lk = e.target.closest('[data-link]');
  if (lk) {
    e.stopPropagation();
    const q = lk.dataset.link, at = +lk.dataset.at, len = +lk.dataset.len;
    const text = vault.files.get(q);
    const word = text.slice(at, at + len);
    const target = linkText(state.path);
    const repl = word === target ? `[[${target}]]` : `[[${target}|${word}]]`;
    await vault.write(q, text.slice(0, at) + repl + text.slice(at + len));
    renderRight(); toast('Legătură creată în „' + stem(q) + '”');
    return;
  }
  const h = e.target.closest('[data-heading]');
  if (h) { scrollToHeading(h.dataset.heading); return; }
  const r = e.target.closest('[data-open]');
  if (!r) return;
  if (r.dataset.open) openNote(r.dataset.open);
  else if (r.dataset.create) followLink(r.dataset.create);
});

// ---------------------------------------------------------------------------
// Navigare prin legături
// ---------------------------------------------------------------------------
async function followLink(target, sub = '', newPane = false) {
  if (!target) { if (sub) scrollToHeading(sub); return; }
  let p = vault.resolve(target, state.path);
  if (!p) {
    const folder = target.includes('/') ? dirname(target) : (lsGet('newNoteFolder', '') || '');
    const file = target.includes('/') ? basename(target) : target;
    p = await vault.create(join(folder, file.replace(/\.md$/i, '') + '.md'), '');
    renderTree(); toast('Notă nouă: ' + stem(p));
  }
  await openNote(p, { sub });
}

function handleLinkClick(e) {
  const a = e.target.closest('a.internal, .embed-title, a.tag');
  if (!a) return;
  e.preventDefault();
  if (a.classList.contains('tag')) { search('tag:#' + a.dataset.tag); return; }
  followLink(a.dataset.href, a.dataset.sub || '');
}
preview.addEventListener('click', handleLinkClick);
$('#hover-preview').addEventListener('click', (e) => { handleLinkClick(e); $('#hover-preview').classList.add('hidden'); });

// bifarea task-urilor din previzualizare
preview.addEventListener('change', (e) => {
  const cb = e.target; if (!cb.matches('input[data-task]')) return;
  const idx = +cb.dataset.task;
  const lines = editor.value.split('\n'); let n = -1, inCode = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) inCode = !inCode;
    if (inCode) continue;
    if (/^\s*(?:[-*+]|\d+[.)])\s+\[[ xX]\]/.test(lines[i]) && ++n === idx) {
      lines[i] = lines[i].replace(/\[([ xX])\]/, (_, c) => c === ' ' ? '[x]' : '[ ]');
      break;
    }
  }
  editor.value = lines.join('\n');
  scheduleSave(); renderPreview();
});

// previzualizare la hover (Ctrl + hover, ca în aplicațiile de notițe clasice; sau hover simplu după 600ms)
let hoverT;
document.addEventListener('mouseover', (e) => {
  const a = e.target.closest('a.internal');
  const hp = $('#hover-preview');
  if (!a) { if (!e.target.closest('#hover-preview')) { clearTimeout(hoverT); hoverT = setTimeout(() => hp.classList.add('hidden'), 250); } return; }
  clearTimeout(hoverT);
  hoverT = setTimeout(() => {
    const p = vault.resolve(a.dataset.href, state.path);
    if (!p || !isMd(p)) return;
    let src = frontMatter(vault.files.get(p)).body;
    if (a.dataset.sub) src = sectionOf(src, a.dataset.sub);
    const saved = state.path;
    hp.innerHTML = `<div class="muted small" style="margin-bottom:6px">${esc(p)}</div>` + (renderCtx = { path: p, depth: 1 }, marked.parse(src));
    decoratePreview(hp);
    hp.querySelectorAll('input').forEach((i) => (i.disabled = true));
    state.path = saved;
    const r = a.getBoundingClientRect();
    hp.classList.remove('hidden');
    const h = hp.offsetHeight, w = hp.offsetWidth;
    hp.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 12)) + 'px';
    hp.style.top = (r.bottom + h + 10 < innerHeight ? r.bottom + 6 : Math.max(8, r.top - h - 6)) + 'px';
  }, e.ctrlKey || e.metaKey ? 50 : 600);
});

// ---------------------------------------------------------------------------
// Editor: tastatură, autocompletare [[, lipire imagini
// ---------------------------------------------------------------------------
editor.addEventListener('input', () => {
  scheduleSave();
  if (state.mode !== 'edit') renderPreviewSoon();
  renderRightSoon();
  updateSuggest();
});

function replaceRange(start, end, text, selStart, selEnd) {
  editor.focus();
  editor.setSelectionRange(start, end);
  // execCommand păstrează undo-ul nativ
  if (!document.execCommand('insertText', false, text)) {
    editor.setRangeText(text, start, end, 'end');
    editor.dispatchEvent(new Event('input'));
  }
  if (selStart != null) editor.setSelectionRange(selStart, selEnd ?? selStart);
}

function wrapSelection(before, after = before) {
  const { selectionStart: s, selectionEnd: e, value: v } = editor;
  const sel = v.slice(s, e);
  if (v.slice(s - before.length, s) === before && v.slice(e, e + after.length) === after) {
    replaceRange(s - before.length, e + after.length, sel, s - before.length, e - before.length);
  } else replaceRange(s, e, before + sel + after, s + before.length, e + before.length);
}

const PAIRS = { '(': ')', '[': ']', '{': '}' };
editor.addEventListener('keydown', (e) => {
  if (suggest.open && handleSuggestKey(e)) return;
  const { selectionStart: s, selectionEnd: en, value: v } = editor;
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 'b') { e.preventDefault(); wrapSelection('**'); return; }
  if (mod && e.key.toLowerCase() === 'i') { e.preventDefault(); wrapSelection('*'); return; }
  if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); const sel = v.slice(s, en); replaceRange(s, en, `[${sel}](url)`, s + sel.length + 3, s + sel.length + 6); return; }
  if (mod && e.key === 'Enter') { // comută checkbox pe linia curentă
    e.preventDefault();
    const ls = v.lastIndexOf('\n', s - 1) + 1; let le = v.indexOf('\n', s); if (le < 0) le = v.length;
    const line = v.slice(ls, le); let nl;
    if (/^\s*[-*+] \[ \]/.test(line)) nl = line.replace('[ ]', '[x]');
    else if (/^\s*[-*+] \[[xX]\]/.test(line)) nl = line.replace(/\[[xX]\]/, '[ ]');
    else if (/^\s*[-*+] /.test(line)) nl = line.replace(/^(\s*[-*+] )/, '$1[ ] ');
    else nl = '- [ ] ' + line;
    replaceRange(ls, le, nl, s + nl.length - line.length);
    return;
  }
  if (e.key === 'Tab') {
    e.preventDefault();
    const ls = v.lastIndexOf('\n', s - 1) + 1;
    if (s !== en || /^\s*([-*+]|\d+[.)])\s/.test(v.slice(ls))) {
      let le = v.indexOf('\n', en - (en > s && v[en - 1] === '\n' ? 1 : 0)); if (le < 0) le = v.length;
      const block = v.slice(ls, le);
      const out = e.shiftKey ? block.replace(/^(\t| {1,4})/gm, '') : block.replace(/^/gm, '\t');
      replaceRange(ls, le, out, Math.max(ls, s + (out.split('\n')[0].length - block.split('\n')[0].length)), ls + out.length);
      if (s === en) { const d = out.length - block.length; editor.setSelectionRange(s + d, s + d); }
    } else replaceRange(s, en, '\t');
    return;
  }
  if (e.key === 'Enter' && !e.shiftKey && s === en) {
    const ls = v.lastIndexOf('\n', s - 1) + 1;
    const line = v.slice(ls, s);
    const m = /^(\s*)((?:[-*+]|(\d+)([.)]))\s+(?:\[[ xX]\]\s+)?|>\s*)/.exec(line);
    if (m) {
      e.preventDefault();
      if (line.trim() === m[2].trim() && v.slice(s, v.indexOf('\n', s) < 0 ? v.length : v.indexOf('\n', s)).trim() === '') {
        replaceRange(ls, s, m[1]); // listă goală → ieșim din listă
        return;
      }
      let marker = m[2];
      if (m[3]) marker = marker.replace(m[3], String(+m[3] + 1));
      marker = marker.replace(/\[[xX]\]/, '[ ]');
      replaceRange(s, s, '\n' + m[1] + marker);
      return;
    }
  }
  if (PAIRS[e.key] && !mod) {
    const close = PAIRS[e.key];
    if (s !== en) { e.preventDefault(); wrapSelection(e.key, close); return; }
    e.preventDefault(); replaceRange(s, s, e.key + close, s + 1);
    return;
  }
  if ([')', ']', '}'].includes(e.key) && v[s] === e.key && s === en) { e.preventDefault(); editor.setSelectionRange(s + 1, s + 1); return; }
  if (e.key === 'Backspace' && s === en && PAIRS[v[s - 1]] && v[s] === PAIRS[v[s - 1]]) { e.preventDefault(); replaceRange(s - 1, s + 1, ''); }
});

// lipire / tragere imagini în editor -> atașamente
async function saveAttachment(file) {
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const d = new Date();
  const name = file.name && !/^image\.\w+$/.test(file.name) ? file.name : `Imagine ${today(d)} ${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.${ext}`;
  const p = vault.uniquePath(join(lsGet('attachFolder', 'atașamente'), name));
  await vault.write(p, file);
  renderTree();
  return p;
}
editor.addEventListener('paste', async (e) => {
  const files = [...(e.clipboardData?.files || [])].filter((f) => f.type.startsWith('image/'));
  if (!files.length) return;
  e.preventDefault();
  for (const f of files) { const p = await saveAttachment(f); replaceRange(editor.selectionStart, editor.selectionEnd, `![[${basename(p)}]]`); }
});
editor.addEventListener('drop', async (e) => {
  const files = [...e.dataTransfer.files];
  if (!files.length) return;
  e.preventDefault();
  for (const f of files) {
    if (isMd(f.name)) { await importFiles([f], ''); continue; }
    const p = await saveAttachment(f);
    replaceRange(editor.selectionStart, editor.selectionEnd, `![[${basename(p)}]]\n`);
  }
});

// --- Autocompletare pentru [[ ---
const suggest = { open: false, items: [], sel: 0, start: 0 };
function updateSuggest() {
  const { selectionStart: s, value: v } = editor;
  const before = v.slice(Math.max(0, s - 200), s);
  const m = /(!?)\[\[([^\[\]\n|]*)$/.exec(before);
  const box = $('#suggest');
  if (!m) { suggest.open = false; box.classList.add('hidden'); return; }
  const q = norm(m[2]);
  suggest.start = s - m[2].length;
  const all = [...vault.notes(), ...(m[1] ? vault.attachments() : [])];
  let items = all.map((p) => [p, fuzzyScore(q, norm(isMd(p) ? stem(p) : basename(p)), norm(p))]).filter((x) => x[1] > -Infinity);
  items.sort((a, b) => b[1] - a[1]);
  items = items.slice(0, 12).map((x) => x[0]);
  if (m[2].trim() && !items.some((p) => norm(stem(p)) === q)) items.push({ create: m[2].trim() });
  suggest.items = items; suggest.sel = 0; suggest.open = items.length > 0;
  if (!suggest.open) { box.classList.add('hidden'); return; }
  drawSuggest();
  const c = caretCoords(editor, s);
  box.classList.remove('hidden');
  box.style.left = Math.min(c.left, innerWidth - box.offsetWidth - 10) + 'px';
  box.style.top = (c.top + c.height + box.offsetHeight + 8 < innerHeight ? c.top + c.height + 4 : c.top - box.offsetHeight - 4) + 'px';
}
function drawSuggest() {
  $('#suggest').innerHTML = suggest.items.map((it, i) => typeof it === 'string'
    ? `<div class="palette-item${i === suggest.sel ? ' sel' : ''}" data-i="${i}"><span>${esc(isMd(it) ? stem(it) : basename(it))}</span><span class="p-sub">${esc(dirname(it))}</span></div>`
    : `<div class="palette-item${i === suggest.sel ? ' sel' : ''}" data-i="${i}"><span>＋ Creează „${esc(it.create)}”</span></div>`).join('');
  $('#suggest .sel')?.scrollIntoView({ block: 'nearest' });
}
function acceptSuggest(i = suggest.sel) {
  const it = suggest.items[i]; if (!it) return;
  const text = typeof it === 'string' ? linkText(it) : it.create;
  const { selectionStart: s, value: v } = editor;
  const hasClose = v.slice(s, s + 2) === ']]';
  replaceRange(suggest.start, s + (hasClose ? 2 : 0), text + ']]');
  suggest.open = false; $('#suggest').classList.add('hidden');
}
function handleSuggestKey(e) {
  if (e.key === 'ArrowDown') { suggest.sel = (suggest.sel + 1) % suggest.items.length; drawSuggest(); e.preventDefault(); return true; }
  if (e.key === 'ArrowUp') { suggest.sel = (suggest.sel - 1 + suggest.items.length) % suggest.items.length; drawSuggest(); e.preventDefault(); return true; }
  if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); acceptSuggest(); return true; }
  if (e.key === 'Escape') { suggest.open = false; $('#suggest').classList.add('hidden'); e.preventDefault(); return true; }
  return false;
}
$('#suggest').addEventListener('mousedown', (e) => { const it = e.target.closest('[data-i]'); if (it) { e.preventDefault(); acceptSuggest(+it.dataset.i); } });
editor.addEventListener('blur', () => setTimeout(() => { suggest.open = false; $('#suggest').classList.add('hidden'); }, 150));
editor.addEventListener('click', () => { if (suggest.open) updateSuggest(); });

// poziția cursorului într-un textarea (oglindă)
function caretCoords(ta, pos) {
  const div = document.createElement('div');
  const cs = getComputedStyle(ta);
  for (const p of ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderLeftWidth', 'letterSpacing', 'tabSize', 'boxSizing', 'wordSpacing'])
    div.style[p] = cs[p];
  Object.assign(div.style, { position: 'absolute', visibility: 'hidden', whiteSpace: 'pre-wrap', wordWrap: 'break-word', width: ta.clientWidth + 'px', top: 0, left: 0 });
  div.textContent = ta.value.slice(0, pos);
  const span = document.createElement('span'); span.textContent = '​'; div.appendChild(span);
  document.body.appendChild(div);
  const r = ta.getBoundingClientRect();
  const out = { left: r.left + span.offsetLeft - ta.scrollLeft, top: r.top + span.offsetTop - ta.scrollTop, height: parseFloat(cs.lineHeight) || 20 };
  div.remove();
  return out;
}

// scor fuzzy simplu: subsecvență, cu bonus pentru potriviri consecutive și la început de cuvânt
function fuzzyScore(q, name, path = name) {
  if (!q) return 0;
  const tryOne = (s, bonus) => {
    let score = 0, i = 0, last = -2;
    for (let j = 0; j < s.length && i < q.length; j++) {
      if (s[j] === q[i]) {
        score += 1 + (j === last + 1 ? 3 : 0) + (j === 0 || /[\s\-_/.]/.test(s[j - 1]) ? 2 : 0);
        last = j; i++;
      }
    }
    return i === q.length ? score + bonus - s.length * 0.02 : -Infinity;
  };
  let s = Math.max(tryOne(name, 5), tryOne(path, 0));
  if (name === q) s += 50; else if (name.startsWith(q)) s += 20; else if (name.includes(q)) s += 10;
  return s;
}
function highlightFuzzy(q, text) {
  if (!q) return esc(text);
  const n = norm(text); let i = 0; let out = '';
  for (let j = 0; j < text.length; j++) {
    if (i < q.length && n[j] === q[i]) { out += '<b>' + esc(text[j]) + '</b>'; i++; } else out += esc(text[j]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Căutare
// ---------------------------------------------------------------------------
function showPane(name) {
  $$('.side-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.pane === name));
  $$('.pane').forEach((p) => p.classList.toggle('active', p.id === 'pane-' + name));
  $('#app').classList.remove('no-sidebar');
  if (name === 'tags') renderTags();
  if (name === 'search') runSearch();
}
$$('.side-tabs button').forEach((b) => b.addEventListener('click', () => showPane(b.dataset.pane)));

function search(q) {
  showPane('search');
  $('#search-input').value = q;
  runSearch(); $('#search-input').focus();
}

function runSearch() {
  const raw = $('#search-input').value.trim();
  const out = $('#search-results');
  if (!raw) { out.innerHTML = '<p class="muted small">Scrie pentru a căuta în toate notele.<br><br>Operatori: <code>tag:#etichetă</code>, <code>path:dosar</code>, <code>"frază exactă"</code>, <code>-exclus</code></p>'; return; }
  const terms = [], neg = [], tags = [], paths = [];
  for (const m of raw.matchAll(/(-?)(?:(tag|path|file):)?(?:"([^"]+)"|(\S+))/g)) {
    const val = norm(m[3] || m[4]);
    if (m[2] === 'tag') tags.push(val.replace(/^#/, ''));
    else if (m[2] === 'path' || m[2] === 'file') paths.push(val);
    else if (m[1]) neg.push(val); else terms.push(val);
  }
  const res = [];
  for (const p of vault.notes()) {
    const text = vault.files.get(p); const nt = norm(text); const np = norm(p);
    if (paths.some((x) => !np.includes(x))) continue;
    const ptags = [...(vault.tags.get(p) || [])].map(norm);
    if (tags.some((t) => !ptags.some((pt) => pt === t || pt.startsWith(t + '/')))) continue;
    if (neg.some((x) => nt.includes(x) || np.includes(x))) continue;
    if (terms.some((x) => !nt.includes(x) && !np.includes(x))) continue;
    const hits = [];
    for (const t of terms.length ? terms : tags.map((t) => '#' + t)) {
      let i = nt.indexOf(t), k = 0;
      while (i >= 0 && k++ < 3) { hits.push([i, t.length]); i = nt.indexOf(t, i + t.length); }
    }
    const score = (terms.some((t) => norm(stem(p)).includes(t)) ? 100 : 0) + hits.length;
    res.push({ p, hits, score, text });
  }
  res.sort((a, b) => b.score - a.score || a.p.localeCompare(b.p));
  out.innerHTML = `<p class="muted small">${res.length} rezultate</p>` + res.slice(0, 200).map(({ p, hits, text }) =>
    `<div class="result" data-open="${esc(p)}" data-q="${esc(terms[0] || '')}"><div class="r-title">${esc(stem(p))}</div><div class="r-path">${esc(dirname(p))}</div>${hits.slice(0, 3).map(([i, l]) => `<div class="r-snip">${snippet(text, i, l, 40)}</div>`).join('')}</div>`
  ).join('');
}
$('#search-input').addEventListener('input', debounce(runSearch, 150));
$('#search-results').addEventListener('click', async (e) => {
  const r = e.target.closest('[data-open]'); if (!r) return;
  await openNote(r.dataset.open);
  const q = r.dataset.q;
  if (q) {
    const i = norm(editor.value).indexOf(q);
    if (i >= 0 && state.mode !== 'preview') {
      editor.focus(); editor.setSelectionRange(i, i + q.length);
      const line = editor.value.slice(0, i).split('\n').length;
      editor.scrollTop = Math.max(0, line * (parseFloat(getComputedStyle(editor).lineHeight) || 24) - 120);
    }
  }
  closeMobileSidebar();
});

function renderTags() {
  const tags = vault.allTags();
  $('#tag-list').innerHTML = tags.map(([t, n]) => `<div class="result tag-row" data-tag="${esc(t)}"><span>#${esc(t)}</span><span class="badge">${n}</span></div>`).join('') || '<p class="muted small">Nicio etichetă. Scrie <code>#etichetă</code> într-o notă.</p>';
}
$('#tag-list').addEventListener('click', (e) => { const r = e.target.closest('[data-tag]'); if (r) search('tag:#' + r.dataset.tag); });

function refreshSidebarPanes() {
  if ($('#pane-tags').classList.contains('active')) renderTags();
  if ($('#pane-search').classList.contains('active') && $('#search-input').value) runSearch();
}

// ---------------------------------------------------------------------------
// Paleta: deschidere rapidă & comenzi
// ---------------------------------------------------------------------------
const palette = { mode: 'files', items: [], sel: 0 };

const COMMANDS = [
  ['Notă nouă', 'Ctrl+N', () => newNote()],
  ['Dosar nou', '', () => newFolder(state.path ? dirname(state.path) : '')],
  ['Nota zilei', 'Alt+D', () => dailyNote()],
  ['Deschide graful', 'Ctrl+G', () => openGraph()],
  ['Graful local al notei curente', '', () => { $('#graph-local').checked = true; openGraph(); }],
  ['Caută în toate notele', 'Ctrl+Shift+F', () => search('')],
  ['Mod editare', '', () => setMode('edit')],
  ['Mod împărțit', '', () => setMode('split')],
  ['Mod citire', 'Ctrl+E', () => setMode('preview')],
  ['Arată/ascunde panoul lateral', 'Ctrl+\\', () => $('#app').classList.toggle('no-sidebar')],
  ['Arată/ascunde panoul de legături', '', () => toggleRight()],
  ['Schimbă tema (deschis/închis)', '', () => toggleTheme()],
  ['Redenumește nota curentă', 'F2', () => { $('#note-title').focus(); $('#note-title').select(); }],
  ['Șterge nota curentă', '', () => state.path && deletePath(state.path)],
  ['Mută nota curentă în dosar…', '', () => state.path && openPalette('move')],
  ['Inserează șablon…', '', () => state.path && openPalette('template')],
  ['Inserează data de azi', '', () => replaceRange(editor.selectionStart, editor.selectionEnd, today())],
  ['Notă aleatorie', '', () => { const n = vault.notes(); if (n.length) openNote(n[Math.floor(Math.random() * n.length)]); }],
  ['Copiază legătura către nota curentă', '', () => state.path && navigator.clipboard?.writeText(`[[${linkText(state.path)}]]`).then(() => toast('Copiat'))],
  ['Descarcă nota curentă (.md)', '', () => state.path && download(basename(state.path), vault.files.get(state.path), 'text/markdown')],
  ['Exportă tot seiful (.json)', '', () => exportVault()],
  ['Schimbă seiful / setări', '', () => openVaultDialog()],
  ['Setează dosarul pentru note zilnice', '', () => { const v = prompt('Dosar pentru notele zilnice (gol = rădăcină):', lsGet('dailyFolder', 'Jurnal')); if (v != null) lsSet('dailyFolder', v.trim().replace(/^\/|\/$/g, '')); }],
  ['Setează dosarul pentru șabloane', '', () => { const v = prompt('Dosar pentru șabloane:', lsGet('templateFolder', 'Șabloane')); if (v != null) lsSet('templateFolder', v.trim().replace(/^\/|\/$/g, '')); }],
  ['Setează dosarul pentru atașamente', '', () => { const v = prompt('Dosar pentru imagini lipite:', lsGet('attachFolder', 'atașamente')); if (v != null) lsSet('attachFolder', v.trim().replace(/^\/|\/$/g, '')); }],
];

function openPalette(mode) {
  palette.mode = mode; palette.sel = 0;
  const inp = $('#palette-input');
  inp.value = '';
  inp.placeholder = { files: 'Caută o notă… (Enter deschide, Shift+Enter creează)', commands: 'Caută o comandă…', move: 'Alege dosarul destinație…', template: 'Alege un șablon…' }[mode];
  $('#palette-hint').innerHTML = { files: '<kbd>↑↓</kbd> navighează · <kbd>Enter</kbd> deschide · <kbd>Shift+Enter</kbd> creează notă nouă · <kbd>Esc</kbd> închide', commands: '<kbd>↑↓</kbd> navighează · <kbd>Enter</kbd> rulează', move: '<kbd>Enter</kbd> mută', template: `Șabloanele sunt notele din dosarul „${esc(lsGet('templateFolder', 'Șabloane'))}”. {{date}}, {{time}}, {{title}} sunt înlocuite.` }[mode];
  $('#palette').classList.remove('hidden');
  inp.focus();
  drawPalette();
}
function closePalette() { $('#palette').classList.add('hidden'); }

function drawPalette() {
  const q = norm($('#palette-input').value.trim());
  let items = [];
  if (palette.mode === 'files') {
    const recent = lsGet('recent', []);
    items = [...vault.notes(), ...vault.attachments()].map((p) => {
      const s = fuzzyScore(q, norm(isMd(p) ? stem(p) : basename(p)), norm(p));
      return { p, s: q ? s : -recent.indexOf(p) * 1 + (recent.includes(p) ? 1000 : 0), label: isMd(p) ? stem(p) : basename(p), sub: dirname(p) };
    }).filter((x) => x.s > -Infinity).sort((a, b) => b.s - a.s).slice(0, 50);
    if (q && !items.some((x) => norm(x.label) === q)) items.push({ create: $('#palette-input').value.trim(), label: `＋ Creează „${$('#palette-input').value.trim()}”`, sub: '' });
  } else if (palette.mode === 'commands') {
    items = COMMANDS.map(([label, sub, fn]) => ({ label, sub, fn, s: fuzzyScore(q, norm(label)) })).filter((x) => x.s > -Infinity);
    if (q) items.sort((a, b) => b.s - a.s);
  } else if (palette.mode === 'move') {
    items = ['', ...[...vault.folders].sort()].map((f) => ({ folder: f, label: f || '/ (rădăcină)', s: fuzzyScore(q, norm(f || '/')) })).filter((x) => x.s > -Infinity).sort((a, b) => b.s - a.s);
  } else if (palette.mode === 'template') {
    const tf = lsGet('templateFolder', 'Șabloane');
    items = vault.notes().filter((p) => p.startsWith(tf + '/')).map((p) => ({ p, label: stem(p), s: fuzzyScore(q, norm(stem(p))) })).filter((x) => x.s > -Infinity).sort((a, b) => b.s - a.s);
    if (!items.length) items = [{ label: `Nu există șabloane în „${tf}”`, none: true }];
  }
  palette.items = items;
  palette.sel = Math.min(palette.sel, Math.max(0, items.length - 1));
  $('#palette-list').innerHTML = items.map((it, i) =>
    `<div class="palette-item${i === palette.sel ? ' sel' : ''}" data-i="${i}"><span>${it.create ? esc(it.label) : highlightFuzzy(q, it.label)}</span><span class="p-sub">${esc(it.sub || '')}</span></div>`
  ).join('') || '<div class="palette-item muted">Niciun rezultat</div>';
  $('#palette-list .sel')?.scrollIntoView({ block: 'nearest' });
}

async function runPaletteItem(i, shift) {
  const it = palette.items[i];
  const typed = $('#palette-input').value.trim();
  closePalette();
  if (palette.mode === 'files') {
    if (shift && typed) return followLink(typed);
    if (!it) return;
    if (it.create) return followLink(it.create);
    return openNote(it.p);
  }
  if (!it || it.none) return;
  if (palette.mode === 'commands') return it.fn();
  if (palette.mode === 'move') return renamePath(state.path, join(it.folder, basename(state.path)));
  if (palette.mode === 'template') {
    const d = new Date();
    const t = vault.files.get(it.p).replace(/\{\{date\}\}/g, today(d)).replace(/\{\{time\}\}/g, `${pad(d.getHours())}:${pad(d.getMinutes())}`).replace(/\{\{title\}\}/g, stem(state.path));
    return replaceRange(editor.selectionStart, editor.selectionEnd, t);
  }
}

$('#palette-input').addEventListener('input', () => { palette.sel = 0; drawPalette(); });
$('#palette-input').addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); palette.sel = Math.min(palette.items.length - 1, palette.sel + 1); drawPalette(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); palette.sel = Math.max(0, palette.sel - 1); drawPalette(); }
  else if (e.key === 'Enter') { e.preventDefault(); runPaletteItem(palette.sel, e.shiftKey); }
  else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
});
$('#palette-list').addEventListener('click', (e) => { const it = e.target.closest('[data-i]'); if (it) runPaletteItem(+it.dataset.i); });
$('#palette').addEventListener('mousedown', (e) => { if (e.target.id === 'palette') closePalette(); });

// note recente
const _open = openNote;
openNote = async function (path, opts) {
  await _open(path, opts);
  if (path && vault.files.has(path)) { const r = lsGet('recent', []).filter((x) => x !== path); r.unshift(path); lsSet('recent', r.slice(0, 30)); }
};

// ---------------------------------------------------------------------------
// Nota zilei
// ---------------------------------------------------------------------------
async function dailyNote() {
  const folder = lsGet('dailyFolder', 'Jurnal');
  const p = join(folder, today() + '.md');
  if (!vault.files.has(p)) {
    const tpl = vault.resolve(join(lsGet('templateFolder', 'Șabloane'), 'Zilnic'));
    const d = new Date();
    const days = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];
    const content = tpl ? vault.files.get(tpl).replace(/\{\{date\}\}/g, today(d)).replace(/\{\{title\}\}/g, today(d)).replace(/\{\{time\}\}/g, `${pad(d.getHours())}:${pad(d.getMinutes())}`)
      : `# ${today(d)} — ${days[d.getDay()]}\n\n## Sarcini\n- [ ] \n\n## Note\n\n`;
    await vault.write(p, content);
    if (folder) state.collapsed.delete(folder);
    renderTree();
  }
  await openNote(p);
}

// ---------------------------------------------------------------------------
// Graf (simulare de forțe pe canvas)
// ---------------------------------------------------------------------------
const graph = { nodes: [], edges: [], running: false, zoom: 1, ox: 0, oy: 0, hover: null, drag: null, pan: null, alpha: 1 };

function buildGraph() {
  const local = $('#graph-local').checked && state.path;
  const showOrphans = $('#graph-orphans').checked;
  const showTags = $('#graph-tags').checked;
  const nodes = new Map();
  const edges = [];
  const old = new Map(graph.nodes.map((n) => [n.id, n]));
  const add = (id, kind) => {
    if (!nodes.has(id)) {
      const o = old.get(id);
      nodes.set(id, { id, kind, x: o ? o.x : (Math.random() - .5) * 400, y: o ? o.y : (Math.random() - .5) * 400, vx: 0, vy: 0, deg: 0 });
    }
    return nodes.get(id);
  };
  for (const p of vault.notes()) add(p, 'note');
  for (const [p, ls] of vault.links) {
    for (const l of ls) {
      const t = l.resolved || ('?' + l.target);
      if (!l.resolved) add(t, 'missing');
      if (t !== p && !edges.some((e) => (e.a === p && e.b === t) || (e.a === t && e.b === p))) edges.push({ a: p, b: t });
    }
  }
  if (showTags) for (const [p, ts] of vault.tags) for (const t of ts) { add('#' + t, 'tag'); edges.push({ a: p, b: '#' + t }); }
  for (const e of edges) { nodes.get(e.a).deg++; nodes.get(e.b).deg++; }
  let keep = new Set(nodes.keys());
  if (local) {
    keep = new Set([state.path]);
    for (let depth = 0; depth < 2; depth++) {
      for (const e of edges) { if (keep.has(e.a) || keep.has(e.b)) { keep.add(e.a); keep.add(e.b); } }
      if (depth === 0 && !$('#graph-local').dataset.deep) break;
    }
  }
  if (!showOrphans) for (const [id, n] of nodes) if (!n.deg) keep.delete(id);
  graph.nodes = [...nodes.values()].filter((n) => keep.has(n.id));
  graph.edges = edges.filter((e) => keep.has(e.a) && keep.has(e.b)).map((e) => ({ a: nodes.get(e.a), b: nodes.get(e.b) }));
  graph.alpha = 1;
}

function openGraph() {
  $('#graph-view').classList.remove('hidden');
  buildGraph();
  resizeGraph();
  const steps = graph.nodes.length > 1500 ? 30 : 250;
  for (let i = 0; i < steps; i++) stepGraph();
  fitGraph();
  if (!graph.running) { graph.running = true; requestAnimationFrame(tickGraph); }
}
function closeGraph() { $('#graph-view').classList.add('hidden'); graph.running = false; }
function resizeGraph() {
  const c = $('#graph-canvas'); const r = c.getBoundingClientRect();
  c.width = r.width * devicePixelRatio; c.height = r.height * devicePixelRatio;
}
addEventListener('resize', () => { if (graph.running) resizeGraph(); });
['#graph-local', '#graph-orphans', '#graph-tags'].forEach((s) => $(s).addEventListener('change', () => { buildGraph(); for (let i = 0; i < 150; i++) stepGraph(); fitGraph(); }));

function fitGraph() {
  if (!graph.nodes.length) return;
  const r = $('#graph-canvas').getBoundingClientRect();
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const n of graph.nodes) { x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y); x1 = Math.max(x1, n.x); y1 = Math.max(y1, n.y); }
  graph.zoom = Math.max(0.15, Math.min(2, Math.min(r.width / (x1 - x0 + 160), r.height / (y1 - y0 + 120))));
  graph.ox = -(x0 + x1) / 2 * graph.zoom; graph.oy = -(y0 + y1) / 2 * graph.zoom;
}

function tickGraph() {
  if (!graph.running) return;
  stepGraph();
  drawGraph();
  requestAnimationFrame(tickGraph);
}

function stepGraph() {
  const N = graph.nodes, E = graph.edges;
  if (graph.alpha > 0.005) {
    const a = graph.alpha;
    // respingere (O(n²), ok pentru câteva mii de note)
    for (let i = 0; i < N.length; i++) {
      const n = N[i];
      for (let j = i + 1; j < N.length; j++) {
        const m = N[j];
        let dx = n.x - m.x, dy = n.y - m.y; let d2 = dx * dx + dy * dy;
        if (d2 < 0.01) { dx = Math.random() - .5; dy = Math.random() - .5; d2 = .25; }
        if (d2 > 250000) continue;
        const f = 900 / d2 * a;
        n.vx += dx * f; n.vy += dy * f; m.vx -= dx * f; m.vy -= dy * f;
      }
      n.vx -= n.x * 0.004 * a; n.vy -= n.y * 0.004 * a; // gravitație spre centru
    }
    for (const { a: s, b: t } of E) {
      const dx = t.x - s.x, dy = t.y - s.y; const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - 70) * 0.03 * a;
      const fx = dx / d * f, fy = dy / d * f;
      s.vx += fx; s.vy += fy; t.vx -= fx; t.vy -= fy;
    }
    for (const n of N) {
      if (n === graph.drag) { n.vx = n.vy = 0; continue; }
      n.vx *= 0.6; n.vy *= 0.6;
      n.x += Math.max(-20, Math.min(20, n.vx)); n.y += Math.max(-20, Math.min(20, n.vy));
    }
    graph.alpha *= 0.995;
  }
}

function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
function drawGraph() {
  const c = $('#graph-canvas'), ctx = c.getContext('2d');
  const W = c.width, H = c.height, dpr = devicePixelRatio;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.setTransform(graph.zoom * dpr, 0, 0, graph.zoom * dpr, W / 2 + graph.ox * dpr, H / 2 + graph.oy * dpr);
  const hov = graph.hover;
  const nb = new Set();
  if (hov) for (const e of graph.edges) { if (e.a === hov) nb.add(e.b); if (e.b === hov) nb.add(e.a); }
  const colText = cssVar('--text'), colMuted = cssVar('--text-faint'), colAccent = cssVar('--accent'), colBorder = cssVar('--border'), colTag = cssVar('--tag'), colMiss = cssVar('--link-missing');
  ctx.lineWidth = 1 / graph.zoom;
  for (const e of graph.edges) {
    const hi = hov && (e.a === hov || e.b === hov);
    ctx.strokeStyle = hi ? colAccent : colBorder;
    ctx.globalAlpha = hov && !hi ? 0.25 : 1;
    ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
  }
  for (const n of graph.nodes) {
    const r = 3.5 + Math.sqrt(n.deg) * 1.6;
    const dim = hov && n !== hov && !nb.has(n);
    ctx.globalAlpha = dim ? 0.25 : 1;
    ctx.fillStyle = n.id === state.path || n === hov ? colAccent : n.kind === 'tag' ? colTag : n.kind === 'missing' ? colMiss : colMuted;
    ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();
    if (graph.zoom > 0.6 || n === hov || nb.has(n) || n.id === state.path) {
      ctx.fillStyle = colText;
      ctx.globalAlpha = dim ? 0.2 : Math.min(1, (graph.zoom - 0.4) * 2.5) || 1;
      if (n === hov || nb.has(n) || n.id === state.path) ctx.globalAlpha = 1;
      ctx.font = `${12 / Math.max(0.8, graph.zoom)}px ${cssVar('--font')}`;
      ctx.textAlign = 'center';
      const label = n.kind === 'note' ? stem(n.id) : n.kind === 'missing' ? n.id.slice(1) : n.id;
      ctx.fillText(label, n.x, n.y + r + 13 / Math.max(0.8, graph.zoom));
    }
  }
  ctx.globalAlpha = 1;
}

function graphPoint(e) {
  const c = $('#graph-canvas'); const r = c.getBoundingClientRect();
  return { x: (e.clientX - r.left - r.width / 2 - graph.ox) / graph.zoom, y: (e.clientY - r.top - r.height / 2 - graph.oy) / graph.zoom };
}
function nodeAt(pt) {
  let best = null, bd = Infinity;
  for (const n of graph.nodes) { const d = Math.hypot(n.x - pt.x, n.y - pt.y); if (d < bd) { bd = d; best = n; } }
  return bd < (8 + (best ? Math.sqrt(best.deg) * 1.6 : 0)) / Math.min(1, graph.zoom) ? best : null;
}
{
  const c = $('#graph-canvas');
  let moved = false;
  c.addEventListener('pointerdown', (e) => {
    const n = nodeAt(graphPoint(e)); moved = false;
    c.setPointerCapture(e.pointerId);
    if (n) { graph.drag = n; graph.alpha = Math.max(graph.alpha, 0.3); }
    else graph.pan = { x: e.clientX - graph.ox, y: e.clientY - graph.oy };
  });
  c.addEventListener('pointermove', (e) => {
    const pt = graphPoint(e);
    if (graph.drag) { graph.drag.x = pt.x; graph.drag.y = pt.y; moved = true; graph.alpha = Math.max(graph.alpha, 0.3); }
    else if (graph.pan) { graph.ox = e.clientX - graph.pan.x; graph.oy = e.clientY - graph.pan.y; moved = true; }
    else { graph.hover = nodeAt(pt); c.style.cursor = graph.hover ? 'pointer' : 'grab'; }
  });
  c.addEventListener('pointerup', async (e) => {
    const n = graph.drag; graph.drag = null; graph.pan = null;
    if (n && !moved) {
      if (n.kind === 'tag') { closeGraph(); search('tag:' + n.id); }
      else if (n.kind === 'missing') { closeGraph(); followLink(n.id.slice(1)); }
      else { closeGraph(); openNote(n.id); }
    }
  });
  c.addEventListener('wheel', (e) => {
    e.preventDefault();
    const r = c.getBoundingClientRect();
    const mx = e.clientX - r.left - r.width / 2, my = e.clientY - r.top - r.height / 2;
    const k = Math.exp(-e.deltaY * 0.0015);
    const nz = Math.max(0.1, Math.min(5, graph.zoom * k));
    graph.ox = mx - (mx - graph.ox) * (nz / graph.zoom);
    graph.oy = my - (my - graph.oy) * (nz / graph.zoom);
    graph.zoom = nz;
  }, { passive: false });
}

// ---------------------------------------------------------------------------
// Seif: alegere, import/export
// ---------------------------------------------------------------------------
async function openVaultDialog() {
  const d = $('#vault-dialog');
  $('#vault-desc').textContent = vault.backend ? `Seif curent: ${vault.backend.name} (${vault.backend.kind === 'folder' ? 'dosar pe disc' : 'stocare în browser'}) — ${vault.notes().length} note.` : '';
  $('#btn-open-folder').disabled = !('showDirectoryPicker' in window);
  if (!('showDirectoryPicker' in window)) $('#btn-open-folder').textContent = '📂 Dosar pe disc (indisponibil în acest browser)';
  d.showModal();
}

async function useFolder(handle) {
  await flushSave();
  const be = new FolderBackend(handle);
  await vault.init(be);
  await idb.set('meta', 'folderHandle', handle);
  lsSet('backend', 'folder');
  afterVaultLoad();
  toast(`Seif deschis: ${handle.name} (${vault.notes().length} note)`);
}

$('#btn-open-folder').addEventListener('click', async () => {
  try {
    const h = await window.showDirectoryPicker({ mode: 'readwrite', id: 'caiet' });
    $('#vault-dialog').close();
    await useFolder(h);
  } catch (e) { if (e.name !== 'AbortError') toast(e.message, 4000); }
});
$('#btn-use-browser').addEventListener('click', async () => {
  $('#vault-dialog').close();
  await flushSave();
  await vault.init(new BrowserBackend());
  lsSet('backend', 'browser');
  if (!vault.notes().length) await seedVault();
  afterVaultLoad();
});
$('#btn-export').addEventListener('click', () => exportVault());
$('#import-file').addEventListener('change', async (e) => { await importFiles(e.target.files, ''); e.target.value = ''; $('#vault-dialog').close(); });

function download(name, data, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
function exportVault() {
  const notes = {};
  for (const p of vault.notes()) notes[p] = vault.files.get(p);
  download(`caiet-${today()}.json`, JSON.stringify({ app: 'caiet', version: 1, exported: new Date().toISOString(), notes }, null, 2), 'application/json');
}
async function importFiles(list, dest) {
  let n = 0;
  for (const f of list) {
    if (/\.json$/i.test(f.name)) {
      try {
        const data = JSON.parse(await f.text());
        for (const [p, c] of Object.entries(data.notes || {})) { await vault.write(join(dest, p), c); n++; }
      } catch (e) { toast('JSON invalid: ' + e.message, 4000); }
    } else if (/\.(md|markdown|txt)$/i.test(f.name)) {
      const name = f.name.replace(/\.(txt|markdown)$/i, '.md');
      await vault.write(vault.uniquePath(join(dest, name)), await f.text()); n++;
    } else if (isImg(f.name) || /\.pdf$/i.test(f.name)) { await vault.write(vault.uniquePath(join(dest, f.name)), f); n++; }
  }
  vault.reindex(); renderTree(); renderRight();
  toast(`Importate ${n} fișiere`);
}

function afterVaultLoad() {
  state.history = []; state.hIndex = -1;
  renderTree(); refreshSidebarPanes();
  const last = lsGet('last', null);
  const first = vault.files.has(last) ? last : (vault.resolve('Bun venit') || vault.notes()[0] || null);
  openNote(first);
}

async function seedVault() {
  const files = {
    'Bun venit.md': `# Bun venit în Caiet 👋

Caiet este aplicația ta personală de notițe în **Markdown**. Totul rămâne local: fie într-un dosar de pe disc, fie în browser.

## Ce poți face
- Leagă notele între ele cu paranteze duble: [[Legături și grafuri]]
- Vezi cine trimite către nota curentă în panoul din dreapta (*legături înapoi*)
- Folosește etichete ca #idee sau #proiect/caiet
- Deschide **graful** cu \`Ctrl+G\` și vezi cum se leagă ideile
- Nota zilei: \`Alt+D\` → [[${today()}]]
- Caută rapid cu \`Ctrl+O\`, comenzi cu \`Ctrl+P\`
- Încorporează altă notă: \`![[Scurtături]]\`

> [!tip] Sfat
> Notele sunt fișiere \`.md\` obișnuite. Apasă ⚙ (stânga jos) și alege un dosar de pe disc ca să lucrezi direct cu fișierele tale — inclusiv cu un seif existent.

## Sarcini
- [x] Instalează Caiet
- [ ] Scrie prima notă
- [ ] Leagă două note între ele

![[Scurtături]]
`,
    'Legături și grafuri.md': `---
tags: [ghid]
---
# Legături și grafuri

O legătură se scrie \`[[Nume notă]]\`. Variante:
- cu alias: [[Bun venit|pagina de start]]
- către o secțiune: [[Bun venit#Sarcini]]
- către o notă care nu există încă: [[Idei de proiecte]] — un clic o creează.

Când redenumești o notă, toate legăturile către ea se actualizează automat.

Graful (\`Ctrl+G\`) arată notele ca puncte și legăturile ca linii. Poți trage nodurile, face zoom cu rotița și da clic pentru a deschide o notă. Bifează „doar vecinii” pentru graful local.

#idee
`,
    'Scurtături.md': `## Scurtături de tastatură

| Tastă | Acțiune |
|---|---|
| \`Ctrl+O\` | Deschide rapid o notă |
| \`Ctrl+P\` | Paleta de comenzi |
| \`Ctrl+N\` | Notă nouă |
| \`Ctrl+E\` | Comută citire / editare |
| \`Ctrl+G\` | Graf |
| \`Ctrl+Shift+F\` | Căutare în toate notele |
| \`Alt+D\` | Nota zilei |
| \`Ctrl+B\` / \`Ctrl+I\` | **Bold** / *italic* |
| \`Ctrl+Enter\` | Bifează / debifează sarcina |
| \`Alt+←\` / \`Alt+→\` | Înapoi / înainte |
| \`[[\` | Autocompletare legături |

Ține \`Ctrl\` apăsat peste o legătură pentru previzualizare.
`,
    'Șabloane/Zilnic.md': `# {{date}}

## 🎯 Prioritate azi
- [ ]

## 📝 Note

## 🙏 Recunoștință
`,
    'Proiecte/Caiet.md': `# Proiectul Caiet

Clonă personală, inspirată de aplicațiile de notițe bazate pe Markdown. Vezi [[Bun venit]].

#proiect/caiet #idee

==Text evidențiat== și ~~tăiat~~ funcționează, la fel și blocurile de cod:

\`\`\`js
console.log('salut');
\`\`\`
`,
  };
  for (const [p, c] of Object.entries(files)) await vault.write(p, c);
}

// ---------------------------------------------------------------------------
// Temă, panouri, scurtături globale
// ---------------------------------------------------------------------------
function applyTheme(t) { document.documentElement.dataset.theme = t; lsSet('theme', t); $('meta[name=theme-color]').content = t === 'light' ? '#ffffff' : '#1e1e22'; }
function toggleTheme() { applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); }
function toggleRight() {
  if (innerWidth <= 900) $('#app').classList.toggle('show-right');
  else { $('#app').classList.toggle('no-right'); lsSet('noRight', $('#app').classList.contains('no-right')); }
}
function closeMobileSidebar() { if (innerWidth <= 640) $('#app').classList.add('no-sidebar'); }
function back() { if (state.hIndex > 0) openNote(state.history[--state.hIndex], { push: false }); }
function forward() { if (state.hIndex < state.history.length - 1) openNote(state.history[++state.hIndex], { push: false }); }

const CMD = {
  'toggle-sidebar': () => { $('#app').classList.toggle('no-sidebar'); lsSet('noSidebar', $('#app').classList.contains('no-sidebar')); },
  'quick-switcher': () => openPalette('files'),
  palette: () => openPalette('commands'),
  graph: () => openGraph(),
  'graph-close': () => closeGraph(),
  daily: () => dailyNote(),
  theme: () => toggleTheme(),
  vault: () => openVaultDialog(),
  'new-note': () => newNote(''),
  'new-folder': () => newFolder(''),
  'collapse-all': () => { vault.folders.forEach((f) => state.collapsed.add(f)); lsSet('collapsed', [...state.collapsed]); renderTree(); },
  back, forward,
  'toggle-right': () => toggleRight(),
};
document.addEventListener('click', (e) => { const b = e.target.closest('[data-cmd]'); if (b) CMD[b.dataset.cmd]?.(); });
$$('#mode-switch button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

document.addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey;
  const k = e.key.toLowerCase();
  if (e.key === 'Escape') {
    if (!$('#graph-view').classList.contains('hidden')) closeGraph();
    $('#hover-preview').classList.add('hidden'); $('#app').classList.remove('show-right');
  }
  if (mod && k === 'o') { e.preventDefault(); openPalette('files'); }
  else if (mod && k === 'p') { e.preventDefault(); openPalette('commands'); }
  else if (mod && k === 'n') { e.preventDefault(); newNote(); }
  else if (mod && k === 'e') { e.preventDefault(); setMode(state.mode === 'preview' ? lsGet('lastEditMode', 'split') : (lsSet('lastEditMode', state.mode), 'preview')); }
  else if (mod && k === 'g') { e.preventDefault(); $('#graph-view').classList.contains('hidden') ? openGraph() : closeGraph(); }
  else if (mod && e.shiftKey && k === 'f') { e.preventDefault(); search(editor.value.slice(editor.selectionStart, editor.selectionEnd)); }
  else if (mod && k === 's') { e.preventDefault(); state.dirty = true; flushSave().then(() => toast('Salvat')); }
  else if (mod && e.key === '\\') { e.preventDefault(); CMD['toggle-sidebar'](); }
  else if (e.altKey && k === 'd') { e.preventDefault(); dailyNote(); }
  else if (e.altKey && e.key === 'ArrowLeft') { e.preventDefault(); back(); }
  else if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); forward(); }
  else if (e.key === 'F2' && state.path) { e.preventDefault(); $('#note-title').focus(); $('#note-title').select(); }
});

// redimensionarea panoului lateral
{
  const rz = $('#sidebar-resizer');
  rz.addEventListener('pointerdown', (e) => {
    rz.setPointerCapture(e.pointerId); rz.classList.add('drag');
    const move = (ev) => { const w = Math.max(180, Math.min(520, ev.clientX - 44)); document.documentElement.style.setProperty('--sidebar-w', w + 'px'); lsSet('sidebarW', w); };
    const up = () => { rz.classList.remove('drag'); rz.removeEventListener('pointermove', move); rz.removeEventListener('pointerup', up); };
    rz.addEventListener('pointermove', move); rz.addEventListener('pointerup', up);
  });
}

// sincronizare scroll aproximativă editor -> previzualizare în modul împărțit
editor.addEventListener('scroll', () => {
  if (state.mode !== 'split') return;
  const r = editor.scrollTop / Math.max(1, editor.scrollHeight - editor.clientHeight);
  preview.scrollTop = r * (preview.scrollHeight - preview.clientHeight);
});

// salvează înainte de închidere; reîncarcă dacă fișierele s-au schimbat pe disc
addEventListener('beforeunload', (e) => { if (state.dirty) { flushSave(); e.preventDefault(); } });
addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'hidden') { flushSave(); return; }
  if (vault.backend?.kind !== 'folder' || state.dirty) return;
  try {
    const { files, folders } = await vault.backend.load();
    let changed = files.size !== vault.files.size;
    if (!changed) for (const [p, c] of files) if (typeof c === 'string' && vault.files.get(p) !== c) { changed = true; break; }
    if (!changed) return;
    vault.files = files; vault.folders = folders; vault.reindex();
    renderTree();
    if (state.path && files.has(state.path) && editor.value !== files.get(state.path)) { const sel = editor.selectionStart; editor.value = files.get(state.path); editor.setSelectionRange(sel, sel); renderPreview(); }
    renderRight();
  } catch {}
});

// ---------------------------------------------------------------------------
// Pornire
// ---------------------------------------------------------------------------
(async function boot() {
  applyTheme(lsGet('theme', matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  if (lsGet('sidebarW', null)) document.documentElement.style.setProperty('--sidebar-w', lsGet('sidebarW') + 'px');
  if (lsGet('noRight', false)) $('#app').classList.add('no-right');
  if (lsGet('noSidebar', false) || innerWidth <= 640) $('#app').classList.add('no-sidebar');
  setMode(innerWidth <= 900 && state.mode === 'split' ? 'preview' : state.mode);

  let loaded = false;
  if (lsGet('backend', 'browser') === 'folder') {
    try {
      const h = await idb.get('meta', 'folderHandle');
      if (h) {
        const perm = await h.queryPermission({ mode: 'readwrite' });
        if (perm === 'granted') { await useFolder(h); loaded = true; }
        else {
          // permisiunea trebuie cerută după un gest al utilizatorului
          await vault.init(new BrowserBackend()); afterVaultLoad(); loaded = true;
          toast('Apasă oriunde pentru a redeschide dosarul „' + h.name + '”', 6000);
          const again = async () => {
            document.removeEventListener('click', again, true);
            try { if ((await h.requestPermission({ mode: 'readwrite' })) === 'granted') await useFolder(h); } catch (e) { toast(e.message, 4000); }
          };
          document.addEventListener('click', again, true);
        }
      }
    } catch (e) { console.warn(e); }
  }
  if (!loaded) {
    await vault.init(new BrowserBackend());
    if (!vault.notes().length && !lsGet('seeded', false)) { await seedVault(); lsSet('seeded', true); }
    afterVaultLoad();
  }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
