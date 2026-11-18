/* ==========================================================================
   Carpatica – componente pentru secțiunile de landing
   ========================================================================== */

(() => {
  const define = (name, ctor) => !customElements.get(name) && customElements.define(name, ctor);
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = (cents) => window.Carpatica.formatMoney(cents);
  const storage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {}
    },
  };

  /* ---------- Adăugare rapidă în coș: [data-quick-add="variantId"] ---------- */

  if (!window.__cQuickAdd) {
    window.__cQuickAdd = true;
    document.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-quick-add]');
      if (!button || button.getAttribute('aria-disabled') === 'true') return;
      event.preventDefault();
      button.classList.add('loading');
      button.setAttribute('aria-disabled', 'true');
      button.querySelector('.loading__spinner')?.classList.remove('hidden');
      try {
        await window.Carpatica.cart.add([{ id: Number(button.dataset.quickAdd), quantity: 1 }], { open: true, source: 'quick-add' });
      } catch (e) {
        console.error(e);
      } finally {
        button.classList.remove('loading');
        button.removeAttribute('aria-disabled');
        button.querySelector('.loading__spinner')?.classList.add('hidden');
      }
    });
  }

  /* ---------- Hero parallax 3D ---------- */

  class ParallaxHero extends HTMLElement {
    connectedCallback() {
      this.layers = Array.from(this.querySelectorAll('[data-depth]'));
      if (reducedMotion() || !this.layers.length) return;
      this.intensity = (parseInt(this.dataset.intensity, 10) || 30) / 10;
      const mode = this.dataset.mode;
      if (mode === 'mouse' || mode === 'both') {
        this.addEventListener('pointermove', (e) => {
          if (e.pointerType !== 'mouse') return;
          const r = this.getBoundingClientRect();
          this.mx = (e.clientX - r.left) / r.width - 0.5;
          this.my = (e.clientY - r.top) / r.height - 0.5;
          this.schedule();
        });
        this.addEventListener('pointerleave', () => {
          this.mx = 0;
          this.my = 0;
          this.schedule();
        });
      }
      if (mode === 'scroll' || mode === 'both') {
        window.addEventListener('scroll', () => this.schedule(), { passive: true });
      }
      this.mx = 0;
      this.my = 0;
      this.schedule();
    }

    schedule() {
      if (this.frame) return;
      this.frame = requestAnimationFrame(() => {
        this.frame = null;
        this.update();
      });
    }

    update() {
      const r = this.getBoundingClientRect();
      const scroll = this.dataset.mode === 'mouse' ? 0 : Math.max(-1, Math.min(1, -r.top / r.height));
      this.layers.forEach((layer) => {
        const depth = parseFloat(layer.dataset.depth) || 0;
        const x = this.mx * depth * this.intensity * 10;
        const y = this.my * depth * this.intensity * 10 + scroll * depth * this.intensity * 30;
        layer.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      });
    }
  }

  /* ---------- Puncte pe imagine (shoppable / caracteristici) ---------- */

  class ShoppableImage extends HTMLElement {
    connectedCallback() {
      this.addEventListener('click', (event) => {
        const dot = event.target.closest('.c-hotspot__dot');
        if (!dot) return;
        const hotspot = dot.closest('.c-hotspot');
        const isOpen = dot.getAttribute('aria-expanded') === 'true';
        this.closeAll();
        if (!isOpen) this.open(hotspot);
      });
      document.addEventListener('click', (event) => {
        if (!this.contains(event.target)) this.closeAll();
      });
      this.addEventListener('keyup', (e) => e.key === 'Escape' && this.closeAll());
      this.addEventListener('shopify:block:select', (e) => {
        const hotspot = e.target.closest('.c-hotspot') || e.target;
        if (hotspot.classList?.contains('c-hotspot')) {
          this.closeAll();
          this.open(hotspot);
        }
      });
    }

    open(hotspot) {
      const dot = hotspot.querySelector('.c-hotspot__dot');
      const card = hotspot.querySelector('.c-hotspot__card');
      dot.setAttribute('aria-expanded', 'true');
      card.hidden = false;
      hotspot.classList.add('is-open');
      const media = this.querySelector('.c-shoppable__media') || this;
      const mr = media.getBoundingClientRect();
      const hr = hotspot.getBoundingClientRect();
      hotspot.classList.toggle('c-hotspot--left', hr.left - mr.left > mr.width / 2);
      hotspot.classList.toggle('c-hotspot--up', hr.top - mr.top > mr.height / 2);
    }

    closeAll() {
      this.querySelectorAll('.c-hotspot').forEach((h) => {
        h.classList.remove('is-open');
        h.querySelector('.c-hotspot__dot')?.setAttribute('aria-expanded', 'false');
        const card = h.querySelector('.c-hotspot__card');
        if (card) card.hidden = true;
      });
    }
  }

  /* ---------- Tab-uri ---------- */

  class ContentTabs extends HTMLElement {
    connectedCallback() {
      this.tabs = Array.from(this.querySelectorAll('[role="tab"]'));
      this.tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => this.select(i));
        tab.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') this.select((i + 1) % this.tabs.length, true);
          if (e.key === 'ArrowLeft') this.select((i - 1 + this.tabs.length) % this.tabs.length, true);
        });
      });
      this.addEventListener('shopify:block:select', (e) => {
        const i = this.tabs.indexOf(e.target);
        if (i >= 0) this.select(i);
      });
    }

    select(index, focus = false) {
      this.tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute('aria-selected', selected);
        tab.tabIndex = selected ? 0 : -1;
        const panel = this.querySelector(`#${tab.getAttribute('aria-controls')}`);
        if (panel) panel.hidden = !selected;
      });
      if (focus) this.tabs[index].focus();
    }
  }

  /* ---------- Pachete (secțiune) ---------- */

  class BundleDeals extends HTMLElement {
    connectedCallback() {
      this.percent = parseFloat(this.dataset.percent) || 0;
      this.addEventListener('change', (e) => {
        if (e.target.matches('[data-deal-toggle]')) e.target.closest('[data-deal-item]').classList.toggle('is-selected', e.target.checked);
        this.update();
      });
      this.querySelector('[data-deal-add]')?.addEventListener('click', () => this.add());
      this.update();
    }

    items() {
      return Array.from(this.querySelectorAll('[data-deal-item]')).filter((i) => i.querySelector('[data-deal-toggle]')?.checked);
    }

    priceOf(item) {
      const source = item.querySelector('[data-deal-variant]');
      const option = source.tagName === 'SELECT' ? source.selectedOptions[0] : source;
      return { price: parseInt(option.dataset.price, 10) || 0, compare: parseInt(option.dataset.compare, 10) || 0 };
    }

    update() {
      let total = 0;
      Array.from(this.querySelectorAll('[data-deal-item]')).forEach((item) => {
        const { price } = this.priceOf(item);
        const el = item.querySelector('[data-deal-price]');
        if (el) el.textContent = money(price);
      });
      this.items().forEach((item) => (total += this.priceOf(item).price));
      const discounted = this.percent > 0 && this.items().length > 1 ? Math.round((total * (100 - this.percent)) / 100) : total;
      const totalEl = this.querySelector('[data-deal-total]');
      const compareEl = this.querySelector('[data-deal-compare]');
      if (totalEl) totalEl.textContent = money(discounted);
      if (compareEl) {
        compareEl.textContent = discounted < total ? money(total) : '';
      }
      const button = this.querySelector('[data-deal-add]');
      if (button) button.disabled = this.items().length === 0;
    }

    async add() {
      const button = this.querySelector('[data-deal-add]');
      const error = this.querySelector('.c-deals__error');
      const items = this.items().map((item) => ({ id: Number(item.querySelector('[data-deal-variant]').value), quantity: 1 }));
      if (!items.length) return;
      button.classList.add('loading');
      button.querySelector('.loading__spinner')?.classList.remove('hidden');
      if (error) error.hidden = true;
      try {
        await window.Carpatica.cart.add(items, { open: true, source: 'bundle-deals' });
      } catch (e) {
        if (error) {
          error.textContent = e.description || e.message || window.cartStrings?.error;
          error.hidden = false;
        }
      } finally {
        button.classList.remove('loading');
        button.querySelector('.loading__spinner')?.classList.add('hidden');
      }
    }
  }

  /* ---------- Grup de secțiuni (două secțiuni una lângă alta) ---------- */

  class SectionGroup extends HTMLElement {
    connectedCallback() {
      requestAnimationFrame(() => this.place());
      document.addEventListener('shopify:section:load', () => requestAnimationFrame(() => this.place()));
    }

    find(id) {
      if (!id) return null;
      const clean = id.replace(/^#/, '').trim();
      const byAnchor = document.getElementById(clean);
      if (byAnchor) return byAnchor.closest('.shopify-section') || byAnchor;
      return document.getElementById(`shopify-section-${clean}`) || document.querySelector(`[id$="__${clean}"].shopify-section`);
    }

    place() {
      [this.dataset.first, this.dataset.second].forEach((id, i) => {
        const el = this.find(id);
        const slot = this.querySelector(`[data-slot="${i + 1}"]`);
        if (el && slot && !slot.contains(el) && !el.contains(this)) slot.appendChild(el);
      });
    }
  }

  /* ---------- Player muzică ---------- */

  class MusicPlayer extends HTMLElement {
    connectedCallback() {
      this.button = this.querySelector('[data-music-toggle]');
      this.progress = this.querySelector('[data-music-progress]');
      this.audio = new Audio();
      this.audio.preload = 'none';
      this.audio.src = this.dataset.src;
      this.audio.loop = this.dataset.loop === 'true';
      this.audio.volume = Math.min(1, (parseInt(this.dataset.volume, 10) || 50) / 100);
      this.button?.addEventListener('click', () => (this.audio.paused ? this.play() : this.pause()));
      this.audio.addEventListener('timeupdate', () => {
        if (this.progress && this.audio.duration) this.progress.style.width = `${(this.audio.currentTime / this.audio.duration) * 100}%`;
        if (this.dataset.global === 'true') {
          try {
            sessionStorage.setItem('c-music-time', String(this.audio.currentTime));
          } catch (e) {}
        }
      });
      this.audio.addEventListener('ended', () => this.setState(false));
      if (this.dataset.global === 'true') {
        let wasPlaying = false;
        try {
          wasPlaying = sessionStorage.getItem('c-music-playing') === '1';
          const time = parseFloat(sessionStorage.getItem('c-music-time'));
          if (time) this.audio.currentTime = time;
        } catch (e) {}
        // Browserele permit redarea doar după o interacțiune: o reluăm la primul click pe pagină
        if (wasPlaying) {
          const resume = () => this.play();
          document.addEventListener('pointerdown', resume, { once: true });
        }
      }
    }

    disconnectedCallback() {
      this.audio?.pause();
    }

    play() {
      document.querySelectorAll('music-player').forEach((p) => p !== this && p.pause?.());
      this.audio.play().then(() => this.setState(true)).catch(() => this.setState(false));
    }

    pause() {
      this.audio.pause();
      this.setState(false);
    }

    setState(playing) {
      this.classList.toggle('is-playing', playing);
      if (this.button) this.button.setAttribute('aria-label', playing ? this.button.dataset.labelPause : this.button.dataset.labelPlay);
      if (this.dataset.global === 'true') {
        try {
          sessionStorage.setItem('c-music-playing', playing ? '1' : '0');
        } catch (e) {}
      }
    }
  }

  /* ---------- Pop-up promoțional ---------- */

  class PromoPopup extends HTMLElement {
    connectedCallback() {
      this.modal = this.querySelector('c-modal');
      if (!this.modal) return;
      const key = this.dataset.key;
      const designMode = this.dataset.designMode === 'true';
      if (this.querySelector('[data-posted="true"]')) {
        storage.set(key, String(Date.now() + 365 * 864e5));
        return this.show();
      }
      if (designMode) {
        document.addEventListener('shopify:section:select', (e) => this.closest('.shopify-section')?.id.endsWith(e.detail.sectionId) && this.show());
        document.addEventListener('shopify:section:deselect', () => this.modal.close());
        return;
      }
      const pages = this.dataset.pages;
      if (pages === 'home' && this.dataset.template !== 'index') return;
      if (pages === 'product' && this.dataset.template !== 'product') return;
      const until = parseInt(storage.get(key), 10);
      if (until && until > Date.now()) return;
      this.modal.addEventListener('modal:close', () => {
        const days = parseInt(this.dataset.frequency, 10) || 0;
        storage.set(key, String(Date.now() + days * 864e5));
      });
      const trigger = this.dataset.trigger;
      if (trigger === 'exit') {
        const onLeave = (e) => {
          if (e.clientY > 0) return;
          document.removeEventListener('mouseout', onLeave);
          this.show();
        };
        document.addEventListener('mouseout', onLeave);
        // pe mobil nu există „ieșire”, folosim întârzierea
        if (window.matchMedia('(pointer: coarse)').matches) setTimeout(() => this.show(), (parseInt(this.dataset.delay, 10) || 10) * 1000);
      } else if (trigger === 'scroll') {
        const onScroll = () => {
          if (window.scrollY / (document.body.scrollHeight - window.innerHeight) < 0.4) return;
          window.removeEventListener('scroll', onScroll);
          this.show();
        };
        window.addEventListener('scroll', onScroll, { passive: true });
      } else {
        setTimeout(() => this.show(), (parseInt(this.dataset.delay, 10) || 5) * 1000);
      }
    }

    show() {
      if (document.querySelector('c-modal[open]') || document.querySelector('cart-drawer.active')) return;
      if (this.modal.parentElement !== document.body) document.body.appendChild(this.modal);
      this.modal.open();
    }
  }

  /* ---------- Urmărire comandă ---------- */

  class TrackOrder extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('form');
      this.form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const awb = this.form.awb.value.trim();
        const error = this.querySelector('.c-track__error');
        if (!awb) {
          if (error) error.hidden = false;
          return;
        }
        if (error) error.hidden = true;
        const courier = this.querySelector('[data-track-courier]');
        const template = (courier && courier.value) || this.dataset.url || 'https://t.17track.net/ro#nums={awb}';
        const url = template.includes('{awb}') ? template.replace('{awb}', encodeURIComponent(awb)) : template + encodeURIComponent(awb);
        window.open(url, '_blank', 'noopener');
      });
    }
  }

  /* ---------- Buton înapoi sus ---------- */

  class ScrollTop extends HTMLElement {
    connectedCallback() {
      const after = parseInt(this.dataset.after, 10) || 600;
      const onScroll = () => this.classList.toggle('is-visible', window.scrollY > after);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      this.querySelector('button')?.addEventListener('click', () =>
        window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })
      );
    }
  }

  define('parallax-hero', ParallaxHero);
  define('shoppable-image', ShoppableImage);
  define('content-tabs', ContentTabs);
  define('bundle-deals', BundleDeals);
  define('section-group', SectionGroup);
  define('music-player', MusicPlayer);
  define('promo-popup', PromoPopup);
  define('track-order', TrackOrder);
  define('scroll-top', ScrollTop);
})();
