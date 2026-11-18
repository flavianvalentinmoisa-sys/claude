/* ==========================================================================
   Carpatica – componente pentru pagina de produs
   Componentele marcate cu [data-cart-extension] sunt citite de product-form.js
   la adăugarea în coș:
   - replaceMainItems(items) → înlocuiește produsul principal (ex: variante diferite per bucată)
   - getExtraItems(mainItems) → produse adăugate suplimentar (upsell, cadouri)
   ========================================================================== */

(() => {
  const money = (cents) => window.Carpatica.formatMoney(cents);
  const strings = () => window.Carpatica?.strings || {};

  function variantChangeFor(sectionId, callback) {
    if (typeof subscribe !== 'function') return () => {};
    return subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
      if (event?.data?.sectionId !== sectionId || !event.data.variant) return;
      callback(event.data.variant);
    });
  }

  function currentQuantity(formId) {
    const inputs = document.querySelectorAll(`[name="quantity"][form="${formId}"]:not([disabled])`);
    const form = document.getElementById(formId);
    const inner = form ? form.querySelector('[name="quantity"]:not([disabled])') : null;
    const input = inputs[inputs.length - 1] || inner;
    return Math.max(1, parseInt(input?.value, 10) || 1);
  }

  function discounted(price, percent, amount = 0) {
    if (percent > 0) return Math.round((price * (100 - percent)) / 100);
    if (amount > 0) return Math.max(0, price - amount);
    return price;
  }

  /* ---------- Reduceri la cantitate ---------- */

  class QuantityBreaks extends HTMLElement {
    connectedCallback() {
      this.formId = this.dataset.formId;
      this.sectionId = this.dataset.sectionId;
      this.input = this.querySelector('[data-qb-quantity]');
      this.options = Array.from(this.querySelectorAll('.c-qb__option'));
      this.youSave = (() => {
        try {
          return JSON.parse(this.querySelector('[data-qb-strings]').textContent).youSave;
        } catch (e) {
          return '[amount]';
        }
      })();

      this.hideDefaultQuantity();
      this.addEventListener('change', (event) => {
        if (event.target.matches('input[type="radio"]')) this.select(event.target.closest('.c-qb__option'));
      });
      const checked = this.querySelector('input[type="radio"]:checked');
      this.select(checked ? checked.closest('.c-qb__option') : this.options[0], false);
      this.unsubscribe = variantChangeFor(this.sectionId, (variant) => this.onVariantChange(variant));
    }

    disconnectedCallback() {
      this.unsubscribe?.();
    }

    hideDefaultQuantity() {
      const wrapper = document.getElementById(`Quantity-Form-${this.sectionId}`);
      if (!wrapper) return;
      wrapper.classList.add('c-hidden');
      wrapper.querySelectorAll('input[name="quantity"]').forEach((input) => {
        input.dataset.cOriginalName = 'quantity';
        input.removeAttribute('name');
      });
    }

    select(option, notify = true) {
      if (!option) return;
      this.options.forEach((o) => o.classList.toggle('is-selected', o === option));
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      this.selected = option;
      this.input.value = option.dataset.quantity;
      if (notify) {
        document.dispatchEvent(
          new CustomEvent('carpatica:quantity-change', {
            detail: { formId: this.formId, quantity: parseInt(option.dataset.quantity, 10) },
          })
        );
      }
    }

    onVariantChange(variant) {
      const compareMode = this.dataset.compareMode;
      this.options.forEach((option) => {
        const quantity = parseInt(option.dataset.quantity, 10);
        const percent = parseFloat(option.dataset.percent) || 0;
        const amount = parseInt(option.dataset.amount, 10) || 0;
        const base = variant.price * quantity;
        const total = percent > 0 ? Math.round((base * (100 - percent)) / 100) : Math.max(0, base - amount);
        let compare = base;
        if (compareMode === 'compare_at' && variant.compare_at_price > variant.price) {
          compare = variant.compare_at_price * quantity;
        }
        const priceText = option.dataset.priceText;
        const priceEl = option.querySelector('[data-qb-price]');
        if (priceEl) {
          priceEl.textContent = priceText
            ? priceText.replace('[price]', money(total)).replace('[unit_price]', money(Math.round(total / quantity)))
            : money(total);
        }
        const compareEl = option.querySelector('[data-qb-compare]');
        if (compareEl) {
          compareEl.textContent = money(compare);
          compareEl.classList.toggle('c-hidden', compare <= total);
        }
        const savingsEl = option.querySelector('[data-qb-savings]');
        if (savingsEl) {
          savingsEl.textContent = this.youSave.replace('[amount]', money(compare - total));
          savingsEl.classList.toggle('c-hidden', compare <= total);
        }
        option.querySelectorAll('[data-qb-variant]').forEach((select) => {
          if (select.dataset.touched !== 'true') select.value = String(variant.id);
        });
      });
    }

    replaceMainItems(items) {
      const main = items[0];
      if (!main || !this.selected) return items;
      const selects = Array.from(this.selected.querySelectorAll('[data-qb-variant]'));
      if (!selects.length) return [{ ...main, quantity: parseInt(this.selected.dataset.quantity, 10) }];
      const counts = new Map();
      selects.forEach((select) => counts.set(select.value, (counts.get(select.value) || 0) + 1));
      return Array.from(counts.entries()).map(([id, quantity]) => ({ ...main, id: Number(id), quantity }));
    }
  }

  /* ---------- Ofertă pachet ---------- */

  class BundleOffer extends HTMLElement {
    connectedCallback() {
      this.formId = this.dataset.formId;
      this.sectionId = this.dataset.sectionId;
      this.items = Array.from(this.querySelectorAll('[data-bundle-item]'));
      this.addEventListener('change', (event) => {
        if (event.target.matches('[data-bundle-toggle]')) {
          event.target.closest('[data-bundle-item]').classList.toggle('is-selected', event.target.checked);
        }
        if (event.target.matches('select[data-bundle-variant]')) event.target.dataset.touched = 'true';
        this.update();
      });
      this.querySelector('[data-bundle-add]')?.addEventListener('click', () => this.add());
      this.unsubscribe = variantChangeFor(this.sectionId, (variant) => {
        const main = this.querySelector('[data-main]');
        if (!main) return;
        main.dataset.price = variant.price;
        main.dataset.compare = variant.compare_at_price || variant.price;
        main.dataset.available = variant.available;
        this.update();
      });
      this.update();
    }

    disconnectedCallback() {
      this.unsubscribe?.();
    }

    itemData(item) {
      const useCompare = this.dataset.useCompare === 'true';
      const percent = parseFloat(item.dataset.percent) || 0;
      let price;
      let compare;
      if (item.hasAttribute('data-main')) {
        price = parseInt(item.dataset.price, 10);
        compare = parseInt(item.dataset.compare, 10) || price;
      } else {
        const source = item.querySelector('[data-bundle-variant]');
        const option = source.tagName === 'SELECT' ? source.selectedOptions[0] : source;
        price = parseInt(option.dataset.price, 10);
        compare = parseInt(option.dataset.compare, 10) || price;
      }
      const final = discounted(price, percent);
      const reference = useCompare ? Math.max(compare, price) : price;
      return { final, reference };
    }

    update() {
      let total = 0;
      let compareTotal = 0;
      this.items.forEach((item) => {
        const { final, reference } = this.itemData(item);
        const priceEl = item.querySelector('[data-bundle-price]');
        const compareEl = item.querySelector('[data-bundle-compare]');
        if (priceEl) priceEl.textContent = final === 0 ? strings().free || '0' : money(final);
        if (compareEl) {
          compareEl.textContent = money(reference);
          compareEl.classList.toggle('c-hidden', reference <= final);
        }
        const toggle = item.querySelector('[data-bundle-toggle]');
        if (item.hasAttribute('data-main') || (toggle && toggle.checked)) {
          total += final;
          compareTotal += reference;
        }
      });
      const totalEl = this.querySelector('[data-bundle-total]');
      const compareEl = this.querySelector('[data-bundle-total-compare]');
      if (totalEl) totalEl.textContent = money(total);
      if (compareEl) {
        compareEl.textContent = money(compareTotal);
        compareEl.classList.toggle('c-hidden', compareTotal <= total);
      }
      const savings = this.querySelector('[data-bundle-savings]');
      if (savings) {
        savings.classList.toggle('c-hidden', compareTotal <= total);
        const amount = savings.querySelector('[data-bundle-savings-amount]');
        if (amount) amount.textContent = money(compareTotal - total);
      }
    }

    async add() {
      const button = this.querySelector('[data-bundle-add]');
      const error = this.querySelector('.c-bundle__error');
      const form = document.getElementById(this.formId);
      const mainId = form?.querySelector('[name="id"]')?.value;
      if (!mainId) return;
      const properties = {};
      if (form) {
        new FormData(form).forEach((value, key) => {
          const match = key.match(/^properties\[(.+)\]$/);
          if (match && value !== '') properties[match[1]] = value;
        });
      }
      const items = [{ id: Number(mainId), quantity: 1, properties }];
      this.items.forEach((item) => {
        if (item.hasAttribute('data-main')) return;
        const toggle = item.querySelector('[data-bundle-toggle]');
        if (!toggle || !toggle.checked) return;
        const id = item.querySelector('[data-bundle-variant]').value;
        items.push({ id: Number(id), quantity: 1 });
      });
      button.classList.add('loading');
      button.setAttribute('aria-disabled', 'true');
      button.querySelector('.loading__spinner')?.classList.remove('hidden');
      if (error) error.hidden = true;
      try {
        await window.Carpatica.cart.add(items, { open: true, source: 'bundle-offer' });
      } catch (e) {
        if (error) {
          error.textContent = e.description || e.message || window.cartStrings?.error;
          error.hidden = false;
        }
      } finally {
        button.classList.remove('loading');
        button.removeAttribute('aria-disabled');
        button.querySelector('.loading__spinner')?.classList.add('hidden');
      }
    }
  }

  /* ---------- Upsell pe pagina de produs ---------- */

  class ProductUpsell extends HTMLElement {
    connectedCallback() {
      this.addEventListener('change', (event) => {
        const item = event.target.closest('[data-upsell-item]');
        if (!item) return;
        if (event.target.matches('[data-upsell-toggle]')) item.classList.toggle('is-selected', event.target.checked);
        if (event.target.matches('select[data-upsell-variant]')) this.updateItem(item);
      });
      this.querySelectorAll('[data-upsell-item]').forEach((item) => {
        const toggle = item.querySelector('[data-upsell-toggle]');
        item.classList.toggle('is-selected', !!toggle?.checked);
      });
    }

    updateItem(item) {
      const source = item.querySelector('[data-upsell-variant]');
      const option = source.tagName === 'SELECT' ? source.selectedOptions[0] : source;
      const price = parseInt(option.dataset.price, 10);
      const compare = parseInt(option.dataset.compare, 10) || price;
      const final = discounted(price, parseFloat(item.dataset.percent) || 0);
      const priceEl = item.querySelector('[data-upsell-price]');
      const compareEl = item.querySelector('[data-upsell-compare]');
      if (priceEl) priceEl.textContent = final === 0 ? strings().free : money(final);
      if (compareEl) {
        const reference = Math.max(compare, price);
        compareEl.textContent = money(reference);
        compareEl.classList.toggle('c-hidden', reference <= final);
      }
    }

    getExtraItems() {
      return Array.from(this.querySelectorAll('[data-upsell-item]'))
        .filter((item) => item.querySelector('[data-upsell-toggle]')?.checked)
        .map((item) => ({ id: Number(item.querySelector('[data-upsell-variant]').value), quantity: 1 }));
    }
  }

  /* ---------- Cadouri la cantitate ---------- */

  class QuantityGifts extends HTMLElement {
    connectedCallback() {
      this.formId = this.dataset.formId;
      this.gifts = Array.from(this.querySelectorAll('[data-gift]'));
      this.onChange = this.update.bind(this);
      document.addEventListener('carpatica:quantity-change', this.onChange);
      document.addEventListener('change', this.onChange);
      document.addEventListener('click', (event) => {
        if (event.target.closest(`.quantity__button`)) setTimeout(this.onChange, 0);
      });
      this.update();
    }

    disconnectedCallback() {
      document.removeEventListener('carpatica:quantity-change', this.onChange);
      document.removeEventListener('change', this.onChange);
    }

    update(event) {
      const quantity = event?.detail?.formId === this.formId ? event.detail.quantity : currentQuantity(this.formId);
      this.gifts.forEach((gift) => {
        const unlocked = quantity >= parseInt(gift.dataset.min, 10);
        gift.classList.toggle('is-unlocked', unlocked);
        const status = gift.querySelector('[data-gift-status]');
        if (status) status.textContent = unlocked ? status.dataset.unlocked : status.dataset.locked;
      });
    }

    getExtraItems() {
      return this.gifts
        .filter((gift) => gift.classList.contains('is-unlocked') && gift.dataset.variantId)
        .map((gift) => ({ id: Number(gift.dataset.variantId), quantity: 1, properties: { _cadou: 'da' } }));
    }
  }

  /* ---------- Adaugă în coș fix ---------- */

  class StickyAtc extends HTMLElement {
    connectedCallback() {
      this.sectionId = this.dataset.sectionId;
      this.mainButton = document.getElementById(`ProductSubmitButton-${this.sectionId}`);
      this.select = this.querySelector('[data-sticky-variant]');
      this.button = this.querySelector('[data-sticky-button]');
      document.querySelectorAll(`sticky-atc[data-section-id="${this.sectionId}"]`).forEach((el) => {
        if (el !== this) el.remove();
      });
      if (this.parentElement !== document.body) {
        this.placeholder = document.createComment('sticky-atc');
        this.parentElement.insertBefore(this.placeholder, this);
        document.body.appendChild(this);
      }
      this.removeAttribute('hidden');
      this.button?.addEventListener('click', () => this.onClick());
      this.select?.addEventListener('change', () => this.selectVariant());
      this.unsubscribe = variantChangeFor(this.sectionId, (variant) => this.onVariantChange(variant));
      this.observe();
    }

    disconnectedCallback() {
      this.unsubscribe?.();
      this.observer?.disconnect();
    }

    observe() {
      const target = this.mainButton || document.getElementById(`MainProduct-${this.sectionId}`);
      if (!target) return;
      const mode = this.dataset.display;
      this.observer = new IntersectionObserver(
        ([entry]) => {
          const passed = entry.boundingClientRect.top < 0;
          const visible = mode === 'always' ? !entry.isIntersecting : !entry.isIntersecting && passed;
          this.classList.toggle('is-visible', visible);
          document.body.classList.toggle('c-has-sticky-atc', visible);
        },
        { threshold: 0 }
      );
      this.observer.observe(target);
    }

    onClick() {
      if (this.dataset.function === 'scroll' || !this.mainButton) {
        const form = document.getElementById(`MainProduct-${this.sectionId}`) || this.mainButton;
        const top = (this.mainButton || form).getBoundingClientRect().top + window.scrollY - window.innerHeight / 3;
        window.scrollTo({ top, behavior: 'smooth' });
        return;
      }
      this.mainButton.click();
    }

    selectVariant() {
      const option = this.select.selectedOptions[0];
      const values = (option.dataset.options || '').split('|');
      const variantSelects = document.querySelector(`#MainProduct-${this.sectionId} variant-selects`) ||
        document.querySelector(`variant-selects[data-section="${this.sectionId}"]`);
      if (!variantSelects) return;
      const groups = variantSelects.querySelectorAll('fieldset, .product-form__input--dropdown');
      let last = null;
      groups.forEach((group, index) => {
        const value = values[index];
        if (value === undefined) return;
        const select = group.querySelector('select');
        if (select) {
          Array.from(select.options).forEach((o) => {
            const match = o.value === value;
            if (match) {
              o.setAttribute('selected', 'selected');
              select.value = o.value;
            } else o.removeAttribute('selected');
          });
          last = select;
        } else {
          const radio = Array.from(group.querySelectorAll('input[type="radio"]')).find((r) => r.value === value);
          if (radio) {
            radio.checked = true;
            last = radio;
          }
        }
      });
      last?.dispatchEvent(new Event('change', { bubbles: true }));
    }

    onVariantChange(variant) {
      if (this.select && this.select.value !== String(variant.id)) this.select.value = String(variant.id);
      const price = this.querySelector('[data-sticky-price]');
      if (price) {
        price.innerHTML =
          (variant.compare_at_price > variant.price ? `<s>${money(variant.compare_at_price)}</s> ` : '') +
          `<strong>${money(variant.price)}</strong>`;
      }
      const buttonPrice = this.querySelector('[data-sticky-button-price]');
      if (buttonPrice) buttonPrice.textContent = `· ${money(variant.price)}`;
      if (this.button) {
        this.button.disabled = !variant.available;
        const label = this.querySelector('[data-sticky-label]');
        if (label) {
          if (!label.dataset.original) label.dataset.original = label.textContent;
          label.textContent = variant.available ? label.dataset.original : window.variantStrings?.soldOut;
        }
      }
    }
  }

  /* ---------- Cod de reducere aplicat cu un click ---------- */

  class ClickableDiscount extends HTMLElement {
    connectedCallback() {
      this.code = this.dataset.code;
      this.button = this.querySelector('[data-cd-apply]');
      try {
        if (localStorage.getItem(`c-discount-${this.code}`) === '1') this.classList.add('is-applied');
      } catch (e) {}
      this.button?.addEventListener('click', () => this.apply());
    }

    async apply() {
      if (!this.code || this.classList.contains('is-applied') || this.classList.contains('is-loading')) return;
      this.classList.add('is-loading');
      try {
        await fetch(`/discount/${encodeURIComponent(this.code)}`, { credentials: 'same-origin' });
        const cart = await window.Carpatica.cart.get();
        if (cart.item_count > 0) await window.Carpatica.cart.applyDiscount(this.code);
        this.classList.add('is-applied');
        try {
          localStorage.setItem(`c-discount-${this.code}`, '1');
        } catch (e) {}
      } catch (e) {
        console.error(e);
      } finally {
        this.classList.remove('is-loading');
      }
    }
  }

  /* ---------- Câmp personalizat ---------- */

  class CustomProductField extends HTMLElement {
    connectedCallback() {
      this.addEventListener('input', () => this.clearError());
      this.addEventListener('change', () => this.clearError());
    }

    get inputs() {
      return Array.from(this.querySelectorAll('input, select, textarea'));
    }

    isValid() {
      if (this.dataset.required !== 'true') return true;
      const inputs = this.inputs;
      if (inputs.some((i) => i.type === 'radio')) return inputs.some((i) => i.checked);
      return inputs.every((i) => String(i.value || '').trim() !== '');
    }

    showError() {
      const error = this.querySelector('.c-field__error');
      if (error) {
        error.textContent = this.dataset.error || strings().requiredField || '';
        error.hidden = false;
      }
      this.classList.add('has-error');
    }

    clearError() {
      const error = this.querySelector('.c-field__error');
      if (error) error.hidden = true;
      this.classList.remove('has-error');
    }
  }

  const define = (name, ctor) => !customElements.get(name) && customElements.define(name, ctor);
  define('quantity-breaks', QuantityBreaks);
  define('bundle-offer', BundleOffer);
  define('product-upsell', ProductUpsell);
  define('quantity-gifts', QuantityGifts);
  define('sticky-atc', StickyAtc);
  define('clickable-discount', ClickableDiscount);
  define('custom-product-field', CustomProductField);
})();
