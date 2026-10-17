/* ==========================================================================
   Carpatica – nucleu JavaScript
   Utilitare comune (bani, date, coș), corectare diacritice, protecție
   conținut, blocare țări și componente generice (copiere, timer, slider,
   pop-up, dată estimată de livrare).
   ========================================================================== */

(() => {
  const config = window.carpatica || {};
  const strings = config.strings || {};

  /* ---------- Bani ---------- */

  function formatWithDelimiters(number, precision, thousands = ',', decimal = '.') {
    if (isNaN(number) || number == null) return '0';
    const fixed = (number / 100).toFixed(precision);
    const [whole, cents] = fixed.split('.');
    const withThousands = whole.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, `$1${thousands}`);
    return cents ? withThousands + decimal + cents : withThousands;
  }

  function formatMoney(cents, format = config.moneyFormat || '{{amount}} lei') {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    cents = Math.round(Number(cents) || 0);
    const placeholder = /\{\{\s*(\w+)\s*\}\}/;
    const match = format.match(placeholder);
    if (!match) return String(cents / 100);
    let value;
    switch (match[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
      case 'amount_with_apostrophe_separator':
        value = formatWithDelimiters(cents, 2, "'", '.');
        break;
      case 'amount_with_space_separator':
        value = formatWithDelimiters(cents, 2, ' ', ',');
        break;
      default:
        value = formatWithDelimiters(cents, 2);
    }
    return format.replace(placeholder, value);
  }

  /* ---------- Date în română ---------- */

  const list = (value, fallback) => (value ? value.split(',').map((item) => item.trim()) : fallback);
  const DAYS = list(strings.days, ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă']);
  const DAYS_SHORT = list(strings.daysShort, ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm']);
  const MONTHS = list(strings.months, [
    'ianuarie',
    'februarie',
    'martie',
    'aprilie',
    'mai',
    'iunie',
    'iulie',
    'august',
    'septembrie',
    'octombrie',
    'noiembrie',
    'decembrie',
  ]);
  const MONTHS_SHORT = list(strings.monthsShort, [
    'ian.',
    'feb.',
    'mar.',
    'apr.',
    'mai',
    'iun.',
    'iul.',
    'aug.',
    'sept.',
    'oct.',
    'nov.',
    'dec.',
  ]);

  function addDays(date, days, skipWeekends = true, skipDays = []) {
    const result = new Date(date);
    let added = 0;
    while (added < days) {
      result.setDate(result.getDate() + 1);
      const day = result.getDay();
      if (skipWeekends && (day === 0 || day === 6)) continue;
      if (skipDays.includes(day)) continue;
      added++;
    }
    return result;
  }

  function formatDate(date, format = 'weekday_day_month') {
    const d = date.getDate();
    const m = date.getMonth();
    const pad = (n) => String(n).padStart(2, '0');
    switch (format) {
      case 'day_month':
        return `${d} ${MONTHS[m]}`;
      case 'day_month_short':
        return `${d} ${MONTHS_SHORT[m]}`;
      case 'weekday_short_day_month':
        return `${DAYS_SHORT[date.getDay()]}, ${d} ${MONTHS_SHORT[m]}`;
      case 'numeric':
        return `${pad(d)}.${pad(m + 1)}`;
      case 'numeric_year':
        return `${pad(d)}.${pad(m + 1)}.${date.getFullYear()}`;
      case 'weekday_day_month':
      default:
        return `${DAYS[date.getDay()]}, ${d} ${MONTHS[m]}`;
    }
  }

  /* ---------- Coș ---------- */

  const cart = {
    drawer() {
      return document.querySelector('cart-drawer');
    },

    sectionIds() {
      const drawer = this.drawer();
      const ids = drawer && drawer.getSectionsToRender ? drawer.getSectionsToRender().map((s) => s.id) : [];
      if (!ids.includes('cart-icon-bubble')) ids.push('cart-icon-bubble');
      return ids;
    },

    async get() {
      const response = await fetch(`${window.routes.cart_url}.js`, { headers: { Accept: 'application/json' } });
      return response.json();
    },

    /**
     * Adaugă mai multe produse în coș și deschide coșul lateral.
     * items: [{ id, quantity, properties, selling_plan }]
     */
    async add(items, { open = true, source = 'carpatica' } = {}) {
      const body = JSON.stringify({
        items,
        sections: this.sectionIds(),
        sections_url: window.location.pathname,
      });
      const response = await fetch(`${window.routes.cart_add_url}.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body,
      });
      const data = await response.json();
      if (data.status) throw data;
      this.afterChange(data, { open, source });
      return data;
    },

    async change(payload, { open = false, source = 'carpatica' } = {}) {
      const body = JSON.stringify({ ...payload, sections: this.sectionIds(), sections_url: window.location.pathname });
      const response = await fetch(`${window.routes.cart_change_url}.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body,
      });
      const data = await response.json();
      if (data.status) throw data;
      this.afterChange(data, { open, source });
      return data;
    },

    async update(payload, { open = false, source = 'carpatica' } = {}) {
      const body = JSON.stringify({ ...payload, sections: this.sectionIds(), sections_url: window.location.pathname });
      const response = await fetch(`${window.routes.cart_update_url}.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body,
      });
      const data = await response.json();
      if (data.status) throw data;
      this.afterChange(data, { open, source });
      return data;
    },

    afterChange(data, { open, source }) {
      const drawer = this.drawer();
      if (drawer && data.sections) {
        drawer.classList.remove('is-empty');
        drawer.renderContents({ ...data, id: data.items?.[0]?.id }, { open });
      } else if (!drawer && open) {
        window.location = window.routes.cart_url;
        return;
      } else if (data.sections?.['cart-icon-bubble']) {
        const bubble = document.getElementById('cart-icon-bubble');
        const html = new DOMParser().parseFromString(data.sections['cart-icon-bubble'], 'text/html');
        const source = html.querySelector('.shopify-section');
        if (bubble && source) bubble.innerHTML = source.innerHTML;
      }
      if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
        publish(PUB_SUB_EVENTS.cartUpdate, { source, cartData: data });
      }
      document.dispatchEvent(new CustomEvent('carpatica:cart-changed', { detail: data }));
    },

    /** Re-randează coșul lateral fără a modifica nimic (de ex. după aplicarea unui cod). */
    async refresh({ open = false } = {}) {
      const ids = this.sectionIds();
      const response = await fetch(`${window.location.pathname}?sections=${ids.join(',')}`);
      const sections = await response.json();
      const drawer = this.drawer();
      if (drawer) drawer.renderContents({ sections }, { open });
      document.dispatchEvent(new CustomEvent('carpatica:cart-refreshed'));
    },

    async applyDiscount(code) {
      const current = await this.get();
      const codes = (current.discount_codes || []).filter((d) => d.applicable).map((d) => d.code);
      if (codes.map((c) => c.toLowerCase()).includes(code.toLowerCase())) return current;
      const data = await this.update({ discount: [...codes, code].join(',') });
      return data;
    },

    async removeDiscount(code) {
      const current = await this.get();
      const codes = (current.discount_codes || []).map((d) => d.code).filter((c) => c.toLowerCase() !== code.toLowerCase());
      return this.update({ discount: codes.join(',') });
    },
  };

  /* ---------- Corectare ş/ţ → ș/ț ---------- */

  const CEDILLA = /[şţŞŢ]/;
  const CEDILLA_MAP = { ş: 'ș', ţ: 'ț', Ş: 'Ș', Ţ: 'Ț' };

  function fixCedillaIn(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!CEDILLA.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        const parent = node.parentNode && node.parentNode.nodeName;
        if (parent === 'SCRIPT' || parent === 'STYLE' || parent === 'TEXTAREA') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      node.nodeValue = node.nodeValue.replace(/[şţŞŢ]/g, (ch) => CEDILLA_MAP[ch]);
    });
    if (root.querySelectorAll) {
      root.querySelectorAll('[alt], [title], [placeholder], [aria-label]').forEach((el) => {
        ['alt', 'title', 'placeholder', 'aria-label'].forEach((attr) => {
          const value = el.getAttribute(attr);
          if (value && CEDILLA.test(value)) el.setAttribute(attr, value.replace(/[şţŞŢ]/g, (ch) => CEDILLA_MAP[ch]));
        });
      });
    }
  }

  function initCedillaFix() {
    if (!config.fixCedilla) return;
    fixCedillaIn(document.body);
    const title = document.title;
    if (CEDILLA.test(title)) document.title = title.replace(/[şţŞŢ]/g, (ch) => CEDILLA_MAP[ch]);
    let pending = [];
    let scheduled = false;
    new MutationObserver((mutations) => {
      mutations.forEach((m) => m.addedNodes.forEach((n) => pending.push(n)));
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        const nodes = pending;
        pending = [];
        scheduled = false;
        nodes.forEach((n) => {
          if (n.nodeType === Node.TEXT_NODE) {
            if (CEDILLA.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/[şţŞŢ]/g, (ch) => CEDILLA_MAP[ch]);
          } else if (n.nodeType === Node.ELEMENT_NODE) {
            fixCedillaIn(n);
          }
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- Protecție conținut ---------- */

  function initContentProtection() {
    if (!config.disableInspect || config.designMode) return;
    const isEditable = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
    document.addEventListener('contextmenu', (e) => {
      if (!isEditable(e.target)) e.preventDefault();
    });
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG') e.preventDefault();
    });
    document.addEventListener('copy', (e) => {
      if (!isEditable(document.activeElement) && !e.target.closest?.('.c-allow-select')) e.preventDefault();
    });
    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (
        e.key === 'F12' ||
        (mod && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (mod && e.altKey && ['i', 'j', 'c'].includes(key)) ||
        (mod && ['u', 's'].includes(key))
      ) {
        e.preventDefault();
      }
    });
  }

  /* ---------- Blocare țări ---------- */

  async function initCountryBlocker() {
    const el = document.getElementById('c-country-blocker');
    if (!el || config.designMode) return;
    const mode = el.dataset.mode;
    const codes = (el.dataset.countries || '')
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    if (mode === 'off' || !codes.length) return;

    let country = null;
    try {
      country = sessionStorage.getItem('c-country');
    } catch (e) {}
    if (!country) {
      try {
        const response = await fetch('/browsing_context_suggestions.json?country[enabled]=true', {
          headers: { Accept: 'application/json' },
        });
        const data = await response.json();
        country = data?.detected_values?.country?.handle || null;
        if (country) sessionStorage.setItem('c-country', country);
      } catch (e) {
        return;
      }
    }
    if (!country) return;
    country = country.toUpperCase();
    const blocked = mode === 'block' ? codes.includes(country) : !codes.includes(country);
    if (!blocked) return;
    const overlay = document.createElement('div');
    overlay.className = 'c-country-block';
    overlay.innerHTML = el.innerHTML;
    document.body.appendChild(overlay);
    document.documentElement.classList.add('c-blocked');
  }

  /* ---------- Componente generice ---------- */

  // <copy-button data-text="COD10"> – copiază textul și afișează confirmarea
  if (!customElements.get('copy-button')) {
    customElements.define(
      'copy-button',
      class CopyButton extends HTMLElement {
        connectedCallback() {
          this.addEventListener('click', this.copy.bind(this));
        }

        async copy(event) {
          event.preventDefault();
          const text = this.dataset.text || this.textContent.trim();
          try {
            await navigator.clipboard.writeText(text);
          } catch (e) {
            const input = document.createElement('textarea');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            input.remove();
          }
          const feedback = this.querySelector('.c-copy__feedback');
          if (feedback) {
            const original = feedback.dataset.original || feedback.textContent;
            feedback.dataset.original = original;
            feedback.textContent = this.dataset.copiedText || strings.copied || 'Copiat!';
            clearTimeout(this.timer);
            this.timer = setTimeout(() => (feedback.textContent = original), 2000);
          }
          this.dispatchEvent(new CustomEvent('copied', { bubbles: true, detail: { text } }));
        }
      }
    );
  }

  // <countdown-timer data-mode="evergreen|fixed|daily" data-duration="900" data-end="2026-12-31T23:59" data-key="..." data-format="hms|dhms|ms">
  if (!customElements.get('countdown-timer')) {
    customElements.define(
      'countdown-timer',
      class CountdownTimer extends HTMLElement {
        connectedCallback() {
          this.output = this.querySelector('[data-timer-output]') || this;
          this.end = this.computeEnd();
          this.tick();
          this.interval = setInterval(() => this.tick(), 1000);
        }

        disconnectedCallback() {
          clearInterval(this.interval);
        }

        computeEnd() {
          const mode = this.dataset.mode || 'evergreen';
          const now = Date.now();
          if (mode === 'fixed' && this.dataset.end) {
            const parsed = Date.parse(this.dataset.end);
            if (!isNaN(parsed)) return parsed;
          }
          if (mode === 'daily') {
            const end = new Date();
            const [h, m] = (this.dataset.dailyTime || '23:59').split(':').map(Number);
            end.setHours(h || 23, m || 59, 59, 999);
            if (end.getTime() < now) end.setDate(end.getDate() + 1);
            return end.getTime();
          }
          const duration = (parseInt(this.dataset.duration, 10) || 600) * 1000;
          const key = `c-timer-${this.dataset.key || 'default'}`;
          let stored = null;
          try {
            stored = parseInt(localStorage.getItem(key), 10);
          } catch (e) {}
          if (!stored || stored < now) {
            stored = now + duration;
            try {
              localStorage.setItem(key, String(stored));
            } catch (e) {}
          }
          return stored;
        }

        tick() {
          let remaining = Math.max(0, this.end - Date.now());
          if (remaining === 0) {
            if (this.dataset.mode === 'evergreen' && this.dataset.restart !== 'false') {
              try {
                localStorage.removeItem(`c-timer-${this.dataset.key || 'default'}`);
              } catch (e) {}
              this.end = this.computeEnd();
              remaining = this.end - Date.now();
            } else if (this.dataset.hideOnEnd === 'true') {
              this.closest('[data-timer-wrapper]')?.setAttribute('hidden', '');
              clearInterval(this.interval);
              return;
            }
          }
          const total = Math.floor(remaining / 1000);
          const parts = {
            d: Math.floor(total / 86400),
            h: Math.floor((total % 86400) / 3600),
            m: Math.floor((total % 3600) / 60),
            s: total % 60,
          };
          const pad = (n) => String(n).padStart(2, '0');
          const units = this.querySelectorAll('[data-unit]');
          if (units.length) {
            units.forEach((unit) => {
              const key = unit.dataset.unit;
              let value = parts[key];
              if (key === 'h' && !this.querySelector('[data-unit="d"]')) value += parts.d * 24;
              unit.textContent = pad(value);
            });
            return;
          }
          const hours = parts.h + parts.d * 24;
          const text =
            this.dataset.format === 'ms'
              ? `${pad(hours * 60 + parts.m)}:${pad(parts.s)}`
              : `${pad(hours)}:${pad(parts.m)}:${pad(parts.s)}`;
          this.output.textContent = text;
        }
      }
    );
  }

  // <delivery-date data-min="2" data-max="4" data-format="weekday_day_month" data-skip-weekends="true">
  if (!customElements.get('delivery-date')) {
    customElements.define(
      'delivery-date',
      class DeliveryDate extends HTMLElement {
        connectedCallback() {
          const skipWeekends = this.dataset.skipWeekends !== 'false';
          const format = this.dataset.format || 'weekday_day_month';
          let start = new Date();
          const cutoff = parseInt(this.dataset.cutoff, 10);
          if (!isNaN(cutoff) && cutoff > 0 && start.getHours() >= cutoff) start = addDays(start, 1, false);
          this.querySelectorAll('[data-date-offset]').forEach((el) => {
            const offset = parseInt(el.dataset.dateOffset, 10) || 0;
            const date = offset === 0 ? start : addDays(start, offset, skipWeekends);
            el.textContent = formatDate(date, el.dataset.format || format);
          });
        }
      }
    );
  }

  // <c-slider> – slider ușor bazat pe scroll-snap, cu săgeți, puncte și autoplay opțional
  if (!customElements.get('c-slider')) {
    customElements.define(
      'c-slider',
      class CSlider extends HTMLElement {
        connectedCallback() {
          this.track = this.querySelector('.c-slider__track');
          if (!this.track) return;
          this.slides = Array.from(this.track.children);
          this.prev = this.querySelector('[data-slider-prev]');
          this.next = this.querySelector('[data-slider-next]');
          this.dotsContainer = this.querySelector('.c-slider__dots');
          this.prev?.addEventListener('click', () => this.go(-1));
          this.next?.addEventListener('click', () => this.go(1));
          this.track.addEventListener('scroll', debounceFrame(() => this.update()), { passive: true });
          this.buildDots();
          this.update();
          this.setupAutoplay();
          this.addEventListener('shopify:block:select', (e) => this.scrollToSlide(e.target), true);
        }

        disconnectedCallback() {
          clearInterval(this.autoplayTimer);
        }

        perView() {
          const first = this.slides[0];
          if (!first) return 1;
          return Math.max(1, Math.round(this.track.clientWidth / first.getBoundingClientRect().width));
        }

        pageCount() {
          return Math.max(1, this.slides.length - this.perView() + 1);
        }

        currentIndex() {
          const first = this.slides[0];
          if (!first) return 0;
          const slideWidth = first.getBoundingClientRect().width + parseFloat(getComputedStyle(this.track).columnGap || 0);
          const scrollLeft = Math.abs(this.track.scrollLeft);
          return Math.round(scrollLeft / slideWidth);
        }

        go(direction) {
          const index = Math.min(Math.max(this.currentIndex() + direction, 0), this.pageCount() - 1);
          if (this.dataset.loop === 'true') {
            const total = this.pageCount();
            const next = (this.currentIndex() + direction + total) % total;
            return this.scrollToIndex(next);
          }
          this.scrollToIndex(index);
        }

        scrollToIndex(index) {
          const slide = this.slides[index];
          if (!slide) return;
          const offset = slide.offsetLeft - this.track.offsetLeft;
          this.track.scrollTo({ left: offset, behavior: 'smooth' });
        }

        scrollToSlide(slide) {
          const index = this.slides.indexOf(slide.closest('.c-slider__slide') || slide);
          if (index >= 0) this.scrollToIndex(index);
        }

        buildDots() {
          if (!this.dotsContainer) return;
          this.dotsContainer.innerHTML = '';
          const count = this.pageCount();
          if (count < 2) {
            this.dotsContainer.hidden = true;
            return;
          }
          this.dotsContainer.hidden = false;
          for (let i = 0; i < count; i++) {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'c-slider__dot';
            button.setAttribute('aria-label', `${i + 1} / ${count}`);
            button.addEventListener('click', () => this.scrollToIndex(i));
            li.appendChild(button);
            this.dotsContainer.appendChild(li);
          }
        }

        update() {
          const index = this.currentIndex();
          const count = this.pageCount();
          if (this.dotsContainer && this.dotsContainer.children.length !== count) this.buildDots();
          this.dotsContainer?.querySelectorAll('.c-slider__dot').forEach((dot, i) => {
            dot.setAttribute('aria-current', i === index ? 'true' : 'false');
          });
          if (this.dataset.loop !== 'true') {
            if (this.prev) this.prev.disabled = index <= 0;
            if (this.next) this.next.disabled = index >= count - 1;
          }
          const controls = this.querySelector('.c-slider__controls');
          if (controls) controls.hidden = count < 2;
          this.dispatchEvent(new CustomEvent('slide-change', { detail: { index } }));
        }

        setupAutoplay() {
          const speed = parseInt(this.dataset.autoplay, 10);
          if (!speed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
          const start = () => {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = setInterval(() => {
              const total = this.pageCount();
              this.scrollToIndex((this.currentIndex() + 1) % total);
            }, speed * 1000);
          };
          const stop = () => clearInterval(this.autoplayTimer);
          this.addEventListener('mouseenter', stop);
          this.addEventListener('mouseleave', start);
          this.addEventListener('focusin', stop);
          this.addEventListener('touchstart', stop, { passive: true });
          start();
        }
      }
    );
  }

  // <c-modal id="..."> + <button data-modal-open="id">
  if (!customElements.get('c-modal')) {
    customElements.define(
      'c-modal',
      class CModal extends HTMLElement {
        connectedCallback() {
          if (this.parentElement !== document.body && this.dataset.moveToBody !== 'false') {
            this.originalParent = this.parentElement;
            document.body.appendChild(this);
          }
          this.querySelectorAll('[data-modal-close], .c-modal__overlay').forEach((el) =>
            el.addEventListener('click', () => this.close())
          );
          this.addEventListener('keyup', (e) => e.key === 'Escape' && this.close());
        }

        open(opener) {
          this.opener = opener || document.activeElement;
          this.setAttribute('open', '');
          document.body.classList.add('overflow-hidden');
          const dialog = this.querySelector('.c-modal__dialog');
          if (typeof trapFocus === 'function' && dialog) trapFocus(dialog, dialog);
          this.dispatchEvent(new CustomEvent('modal:open'));
        }

        close() {
          if (!this.hasAttribute('open')) return;
          this.removeAttribute('open');
          if (!document.querySelector('c-modal[open]') && !document.querySelector('cart-drawer.active')) {
            document.body.classList.remove('overflow-hidden');
          }
          if (typeof removeTrapFocus === 'function') removeTrapFocus(this.opener);
          this.dispatchEvent(new CustomEvent('modal:close'));
        }
      }
    );

    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-modal-open]');
      if (!opener) return;
      const modal = document.getElementById(opener.dataset.modalOpen);
      if (!modal) return;
      e.preventDefault();
      modal.open(opener);
    });
  }

  // Buton „scroll la” – <a data-scroll-to="#id">
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-scroll-to]');
    if (!link) return;
    const target = document.querySelector(link.dataset.scrollTo);
    if (!target) return;
    e.preventDefault();
    const header = document.querySelector('.section-header.shopify-section-header-sticky, sticky-header');
    const offset = header ? header.getBoundingClientRect().height + 12 : 12;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });

  function debounceFrame(fn) {
    let frame;
    return (...args) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fn(...args));
    };
  }

  window.Carpatica = {
    formatMoney,
    formatDate,
    addDays,
    cart,
    fixCedillaIn,
    debounceFrame,
    strings,
  };

  const init = () => {
    initCedillaFix();
    initContentProtection();
    initCountryBlocker();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
