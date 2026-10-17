/* ==========================================================================
   Carpatica – componente pentru coș (lateral și pagina de coș)
   ========================================================================== */

(() => {
  const cartApi = () => window.Carpatica.cart;
  const define = (name, ctor) => !customElements.get(name) && customElements.define(name, ctor);

  function setLoading(button, loading) {
    if (!button) return;
    button.classList.toggle('loading', loading);
    button.toggleAttribute('aria-disabled', loading);
    button.querySelector('.loading__spinner')?.classList.toggle('hidden', !loading);
  }

  /* ---------- Upsell în coș ---------- */

  class CartUpsell extends HTMLElement {
    connectedCallback() {
      this.addEventListener('change', (event) => {
        if (!event.target.matches('[data-upsell-variant]')) return;
        const button = event.target.closest('.c-cart-upsell__card')?.querySelector('[data-upsell-add]');
        if (button) button.dataset.variantId = event.target.value;
      });
      this.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-upsell-add]');
        if (!button || button.getAttribute('aria-disabled') === 'true') return;
        setLoading(button, true);
        try {
          await cartApi().add([{ id: Number(button.dataset.variantId), quantity: 1 }], { open: true, source: 'cart-upsell' });
        } catch (e) {
          console.error(e);
          setLoading(button, false);
        }
      });
    }
  }

  /* ---------- Cadou gratuit automat ---------- */

  let giftSyncing = false;

  async function syncGifts() {
    if (giftSyncing) return;
    const gifts = Array.from(document.querySelectorAll('cart-gift[data-auto="true"]'));
    if (!gifts.length) return;
    const toAdd = [];
    const toRemove = [];
    gifts.forEach((gift) => {
      const unlocked = gift.dataset.unlocked === 'true';
      const line = parseInt(gift.dataset.line, 10) || 0;
      if (unlocked && line === 0) toAdd.push({ id: Number(gift.dataset.variantId), quantity: 1, properties: { _cadou: 'da' } });
      if (!unlocked && line > 0) toRemove.push(line);
    });
    if (!toAdd.length && !toRemove.length) return;
    giftSyncing = true;
    try {
      // eliminăm de la ultima linie spre prima ca indexurile să rămână corecte
      for (const line of toRemove.sort((a, b) => b - a)) {
        await cartApi().change({ line, quantity: 0 }, { open: false, source: 'cart-gift' });
      }
      if (toAdd.length) await cartApi().add(toAdd, { open: false, source: 'cart-gift' });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => (giftSyncing = false), 300);
    }
  }

  class CartGift extends HTMLElement {
    connectedCallback() {
      clearTimeout(window.__cGiftTimer);
      window.__cGiftTimer = setTimeout(syncGifts, 150);
    }
  }

  /* ---------- Cod de reducere ---------- */

  class CartDiscountField extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('form');
      this.input = this.querySelector('input[name="discount"]');
      this.message = this.querySelector('.c-cart-discount__message');
      this.form?.addEventListener('submit', (event) => {
        event.preventDefault();
        this.apply();
      });
      this.addEventListener('click', (event) => {
        const remove = event.target.closest('[data-remove-discount]');
        if (remove) this.remove(remove.dataset.removeDiscount);
      });
    }

    async apply() {
      const code = this.input.value.trim();
      if (!code) return;
      const button = this.querySelector('.c-cart-discount__button');
      setLoading(button, true);
      try {
        const cart = await cartApi().applyDiscount(code);
        const applied = (cart.discount_codes || []).find((d) => d.code.toLowerCase() === code.toLowerCase());
        if (!applied || !applied.applicable) {
          await cartApi().removeDiscount(code);
          this.showMessage(this.message?.dataset.invalid, true);
        }
        if (document.getElementById('main-cart-footer')) refreshCartPage();
      } catch (e) {
        this.showMessage(this.message?.dataset.invalid, true);
      } finally {
        setLoading(button, false);
      }
    }

    async remove(code) {
      try {
        await cartApi().removeDiscount(code);
        if (document.getElementById('main-cart-footer')) refreshCartPage();
      } catch (e) {
        console.error(e);
      }
    }

    showMessage(text, isError) {
      // coșul este re-randat după aplicare, așa că mesajul se afișează pe elementul nou
      requestAnimationFrame(() => {
        const field = document.querySelector(`cart-discount-field`);
        const message = field?.querySelector('.c-cart-discount__message') || this.message;
        if (!message || !text) return;
        message.textContent = text;
        message.hidden = false;
        message.classList.toggle('c-text-urgency', isError);
      });
    }
  }

  /* ---------- Acord termeni și condiții ---------- */

  class TncCheckbox extends HTMLElement {
    connectedCallback() {
      this.input = this.querySelector('[data-tnc-input]');
      this.warning = this.querySelector('.c-tnc__warning');
      try {
        this.input.checked = sessionStorage.getItem('c-tnc') === '1';
      } catch (e) {}
      this.input.addEventListener('change', () => {
        try {
          sessionStorage.setItem('c-tnc', this.input.checked ? '1' : '0');
        } catch (e) {}
        if (this.input.checked && this.warning) this.warning.hidden = true;
        this.updateButtons();
      });
      this.onCheckout = this.onCheckout.bind(this);
      document.addEventListener('click', this.onCheckout, true);
      this.updateButtons();
    }

    disconnectedCallback() {
      document.removeEventListener('click', this.onCheckout, true);
    }

    get buttons() {
      const scope = this.closest('cart-drawer, #main-cart-footer, form, .cart__footer') || document;
      return scope.querySelectorAll('[name="checkout"], .additional-checkout-buttons');
    }

    updateButtons() {
      if (this.dataset.disableCheckout !== 'true') return;
      this.buttons.forEach((b) => b.classList.toggle('c-checkout-locked', !this.input.checked));
    }

    onCheckout(event) {
      const target = event.target.closest('[name="checkout"], .additional-checkout-buttons');
      if (!target || this.input.checked) return;
      if (!Array.from(this.buttons).includes(target)) return;
      event.preventDefault();
      event.stopPropagation();
      if (this.warning) this.warning.hidden = false;
      this.classList.remove('c-shake');
      void this.offsetWidth;
      this.classList.add('c-shake');
    }
  }

  /* ---------- Pagina de coș: actualizează blocurile Carpatica ---------- */

  async function refreshCartPage() {
    const footer = document.getElementById('main-cart-footer');
    if (!footer) return;
    try {
      const response = await fetch(`${window.routes.cart_url}?section_id=${footer.dataset.id}`);
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      const source = html.querySelector('.cart__blocks');
      const target = footer.querySelector('.cart__blocks');
      if (source && target) target.innerHTML = source.innerHTML;
    } catch (e) {
      console.error(e);
    }
  }

  if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
    subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (document.getElementById('main-cart-footer')) refreshCartPage();
      if (event?.source !== 'cart-gift') setTimeout(syncGifts, 400);
    });
  }
  document.addEventListener('cart-drawer:rendered', () => setTimeout(syncGifts, 100));

  define('cart-upsell', CartUpsell);
  define('cart-gift', CartGift);
  define('cart-discount-field', CartDiscountField);
  define('tnc-checkbox', TncCheckbox);
})();
