/* ==========================================================================
   Formular COD: deschide formularul de comandă cu plata la livrare în locul
   adăugării în coș. Produsele (inclusiv oferta din „Alege oferta”, cadourile și
   upsell-urile) sunt citite la fel ca în product-form.js. Prețurile și totalul
   vin de la server, care le recalculează din Shopify.
   ========================================================================== */

(() => {
  if (customElements.get('cod-form')) return;

  const money = (cents) =>
    window.Carpatica?.formatMoney
      ? window.Carpatica.formatMoney(cents)
      : `${(cents / 100).toFixed(2).replace('.', ',')} lei`;

  const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const newKey = () =>
    (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`).replace(/-/g, '');

  const STORAGE_KEY = 'c-cod-customer';

  class CodForm extends HTMLElement {
    connectedCallback() {
      this.endpoint = this.dataset.endpoint;
      this.formId = this.dataset.formId;
      this.panel = this.querySelector('.c-cod__panel');
      this.form = this.querySelector('[data-cod-step="form"]');
      this.success = this.querySelector('[data-cod-step="success"]');
      this.submitButton = this.querySelector('[data-cod-submit]');
      this.errorBox = this.querySelector('[data-cod-error]');

      // Fereastra stă direct în <body>, ca să nu fie tăiată de coloanele paginii.
      if (this.parentElement !== document.body) {
        document.querySelectorAll(`cod-form[data-form-id="${this.formId}"]`).forEach((el) => {
          if (el !== this && el.parentElement === document.body) el.remove();
        });
        document.body.appendChild(this);
        return;
      }

      this.onSubmitCapture = this.onSubmitCapture.bind(this);
      document.addEventListener('submit', this.onSubmitCapture, true);
      this.querySelectorAll('[data-cod-close]').forEach((el) => el.addEventListener('click', () => this.close()));
      this.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') this.close();
        if (event.key === 'Tab') this.trapFocus(event);
      });
      this.form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.submit();
      });
      this.form.addEventListener('input', (event) => this.clearFieldError(event.target.name));
      this.form.addEventListener('change', (event) => this.clearFieldError(event.target.name));
      this.restoreCustomer();
    }

    disconnectedCallback() {
      if (this.onSubmitCapture) document.removeEventListener('submit', this.onSubmitCapture, true);
    }

    /* ---------- interceptarea butonului de cumpărare ---------- */

    onSubmitCapture(event) {
      const form = event.target;
      // getAttribute: formularul Shopify are un câmp name="id", care ascunde form.id
      if (!(form instanceof HTMLFormElement) || form.getAttribute('id') !== this.formId) return;
      event.preventDefault();
      event.stopImmediatePropagation();

      const productForm = form.closest('product-form');
      if (productForm && typeof productForm.validateCustomFields === 'function' && !productForm.validateCustomFields()) return;

      this.open(form);
    }

    collectItems(form) {
      const formData = new FormData(form);
      const properties = {};
      formData.forEach((value, key) => {
        const match = key.match(/^properties\[(.+)\]$/);
        if (match && !(value instanceof File) && value !== '') properties[match[1]] = value;
      });
      const quantityInput =
        Array.from(document.querySelectorAll(`[name="quantity"][form="${this.formId}"]:not([disabled])`)).pop() ||
        form.querySelector('[name="quantity"]:not([disabled])');
      const mainItem = {
        id: Number(formData.get('id')),
        quantity: Math.max(1, parseInt(quantityInput?.value, 10) || 1),
        properties,
      };

      const extensions = Array.from(
        document.querySelectorAll(`[data-cart-extension][data-form-id="${this.formId}"]`)
      ).filter((el) => typeof el.getExtraItems === 'function' || typeof el.replaceMainItems === 'function');

      let items = [mainItem];
      extensions.forEach((ext) => {
        if (typeof ext.replaceMainItems === 'function') items = ext.replaceMainItems(items);
      });
      const mainItems = items;
      extensions.forEach((ext) => {
        if (typeof ext.getExtraItems === 'function') items = items.concat(ext.getExtraItems(mainItems) || []);
      });

      const selected = document.querySelector(
        `quantity-breaks[data-form-id="${this.formId}"] .c-qb__option.is-selected`
      );
      const offer = selected
        ? { percent: parseFloat(selected.dataset.percent) || 0, amount: parseInt(selected.dataset.amount, 10) || 0 }
        : { percent: 0, amount: 0 };

      return { items: items.filter((i) => i.id), offer };
    }

    /* ---------- fereastra ---------- */

    open(form) {
      this.payload = this.collectItems(form);
      if (!this.payload.items.length) return;
      this.key = newKey();
      this.lastFocus = document.activeElement;
      this.showStep('form');
      this.setError('');
      this.removeAttribute('hidden');
      document.body.classList.add('c-cod-open');
      requestAnimationFrame(() => this.classList.add('is-open'));
      setTimeout(() => {
        const first = this.form.querySelector('input:not([type="hidden"]):not([tabindex="-1"])');
        (first && !first.value ? first : this.panel).focus({ preventScroll: true });
      }, 50);
      this.loadQuote().then(() => this.track('InitiateCheckout'));
    }

    close() {
      if (this.hasAttribute('hidden')) return;
      this.classList.remove('is-open');
      document.body.classList.remove('c-cod-open');
      setTimeout(() => this.setAttribute('hidden', ''), 250);
      this.lastFocus?.focus?.({ preventScroll: true });
    }

    showStep(step) {
      this.form.hidden = step !== 'form';
      this.success.hidden = step !== 'success';
    }

    trapFocus(event) {
      const focusables = Array.from(
        this.panel.querySelectorAll('button, [href], input:not([type="hidden"]), select, textarea')
      ).filter((el) => !el.disabled && el.tabIndex !== -1 && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    /* ---------- rezumatul comenzii ---------- */

    async request(path, body) {
      const response = await fetch(`${this.endpoint}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      let data = {};
      try {
        data = await response.json();
      } catch (e) {
        data = {};
      }
      if (!response.ok || data.ok === false) {
        const error = new Error(data.error || 'Nu am putut contacta serverul. Verifică conexiunea și încearcă din nou.');
        error.fields = data.fields;
        throw error;
      }
      return data;
    }

    async loadQuote() {
      this.quote = null;
      this.submitButton.disabled = true;
      this.querySelector('[data-cod-submit-total]').textContent = '';
      this.querySelector('[data-cod-lines]').innerHTML =
        '<div class="c-cod__line c-cod__line--loading"><span class="c-cod__line-image"></span><span class="c-cod__skeleton"></span></div>';
      try {
        this.quote = await this.request('/quote', this.payload);
        this.renderQuote(this.quote);
      } catch (error) {
        this.setError(error.message);
      } finally {
        this.submitButton.disabled = false;
      }
    }

    renderQuote(quote) {
      this.querySelector('[data-cod-lines]').innerHTML = quote.lines
        .map(
          (line) => `
          <div class="c-cod__line">
            <span class="c-cod__line-image">
              ${line.image ? `<img src="${escapeHtml(line.image + (line.image.includes('?') ? '&' : '?') + 'width=120')}" alt="" width="56" height="56" loading="lazy">` : ''}
              <span class="c-cod__line-qty">${line.quantity}</span>
            </span>
            <span class="c-cod__line-info">
              <span class="c-cod__line-title">${escapeHtml(line.title)}</span>
              ${line.variantTitle ? `<span class="c-cod__line-variant">${escapeHtml(line.variantTitle)}</span>` : ''}
            </span>
            <span class="c-cod__line-price">
              ${line.compareLinePrice > line.linePrice ? `<s>${money(line.compareLinePrice)}</s>` : ''}
              <strong>${line.gift ? 'GRATUIT' : money(line.linePrice)}</strong>
            </span>
          </div>`
        )
        .join('');
      this.querySelector('[data-cod-subtotal]').textContent = money(quote.subtotal);
      this.querySelector('[data-cod-shipping]').textContent = quote.shipping > 0 ? money(quote.shipping) : 'Gratuită';
      this.querySelector('[data-cod-total]').textContent = money(quote.total);
      this.querySelector('[data-cod-submit-total]').textContent = `· ${money(quote.total)}`;
      const savings = this.querySelector('[data-cod-savings]');
      savings.hidden = !(quote.savings > 0);
      savings.textContent = `Economisești ${money(quote.savings)} la această comandă`;
    }

    /* ---------- trimiterea comenzii ---------- */

    readCustomer() {
      const data = new FormData(this.form);
      const get = (name) => String(data.get(name) || '').trim();
      return {
        name: get('name'),
        phone: get('phone'),
        email: get('email'),
        county: get('county'),
        city: get('city'),
        address: get('address'),
        note: get('note'),
      };
    }

    validate(customer) {
      const errors = {};
      const digits = customer.phone.replace(/\D/g, '').replace(/^(0040|40)/, '').replace(/^0/, '');
      if (customer.name.length < 3 || !/\s/.test(customer.name)) errors.name = 'Scrie numele și prenumele.';
      if (!/^[237]\d{8}$/.test(digits)) errors.phone = 'Scrie un număr de telefon valid (ex: 07xx xxx xxx).';
      if (!customer.county) errors.county = 'Alege județul.';
      if (customer.city.length < 2) errors.city = 'Scrie localitatea.';
      if (customer.address.length < 5) errors.address = 'Scrie strada, numărul (și blocul/apartamentul, dacă e cazul).';
      if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customer.email)) errors.email = 'Adresa de e-mail nu pare corectă.';
      return errors;
    }

    showFieldErrors(errors) {
      let first = null;
      Object.entries(errors || {}).forEach(([name, message]) => {
        const el = this.form.querySelector(`[data-error-for="${name}"]`);
        const input = this.form.querySelector(`[name="${name}"]`);
        if (el) el.textContent = message;
        if (input) {
          input.setAttribute('aria-invalid', 'true');
          if (!first) first = input;
        }
      });
      if (first) {
        first.focus({ preventScroll: true });
        first.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }

    clearFieldError(name) {
      if (!name) return;
      const el = this.form.querySelector(`[data-error-for="${name}"]`);
      if (el) el.textContent = '';
      this.form.querySelector(`[name="${name}"]`)?.removeAttribute('aria-invalid');
    }

    setError(message) {
      this.errorBox.textContent = message;
      this.errorBox.hidden = !message;
    }

    async submit() {
      if (this.submitting) return;
      this.setError('');
      const customer = this.readCustomer();
      const errors = this.validate(customer);
      if (Object.keys(errors).length) {
        this.showFieldErrors(errors);
        return;
      }

      this.submitting = true;
      this.submitButton.classList.add('is-loading');
      this.submitButton.disabled = true;
      try {
        const result = await this.request('/order', {
          ...this.payload,
          key: this.key,
          customer,
          website: this.form.querySelector('[name="website"]')?.value || '',
          pageUrl: window.location.href,
        });
        this.saveCustomer(customer);
        this.showSuccess(result);
        this.track('Purchase', result);
      } catch (error) {
        if (error.fields) this.showFieldErrors(error.fields);
        this.setError(error.message);
      } finally {
        this.submitting = false;
        this.submitButton.classList.remove('is-loading');
        this.submitButton.disabled = false;
      }
    }

    showSuccess(result) {
      const firstName = (result.customer?.name || '').split(' ')[0];
      const title = this.querySelector('[data-cod-success-title]');
      title.textContent = (title.dataset.template || 'Mulțumim, [nume]!').replace('[nume]', firstName).replace(/,\s*!/, '!');
      this.querySelector('[data-cod-success-order]').textContent = `Comanda ${result.orderName} a fost înregistrată.`;
      const text = this.querySelector('[data-cod-success-text]');
      text.textContent = (text.dataset.template || '').replace('[total]', money(result.total));
      const c = result.customer || {};
      this.querySelector('[data-cod-success-address]').innerHTML = [
        escapeHtml(c.name),
        escapeHtml(c.address),
        `${escapeHtml(c.city)}, jud. ${escapeHtml(c.county)}`,
        escapeHtml(c.phone),
      ].join('<br>');
      this.showStep('success');
      this.panel.scrollTop = 0;
      this.success.focus({ preventScroll: true });
    }

    /* ---------- date salvate pe dispozitiv (completare rapidă la a doua comandă) ---------- */

    saveCustomer(customer) {
      try {
        const { note, ...rest } = customer;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
      } catch (e) {
        /* stocarea poate fi blocată */
      }
    }

    restoreCustomer() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (!saved) return;
        Object.entries(saved).forEach(([name, value]) => {
          const input = this.form.querySelector(`[name="${name}"]`);
          if (input && !input.value && value) input.value = value;
        });
      } catch (e) {
        /* ignorăm */
      }
    }

    /* ---------- evenimente pentru reclame (Meta / TikTok), dacă pixelii există ---------- */

    track(event, result) {
      const currency = this.dataset.currency || 'RON';
      const total = result ? result.total / 100 : this.quote ? this.quote.total / 100 : undefined;
      const contentIds = this.payload.items.map((i) => String(i.id));
      try {
        if (typeof window.fbq === 'function') {
          const params = { currency, value: total, content_ids: contentIds, content_type: 'product' };
          if (result) window.fbq('track', event, params, { eventID: `cod-${result.orderId}` });
          else window.fbq('track', event, params);
        }
        if (window.ttq && typeof window.ttq.track === 'function') {
          window.ttq.track(event === 'Purchase' ? 'CompletePayment' : event, {
            currency,
            value: total,
            contents: contentIds.map((id) => ({ content_id: id })),
          });
        }
        document.dispatchEvent(new CustomEvent(`cod:${event.toLowerCase()}`, { detail: { result, payload: this.payload } }));
      } catch (e) {
        /* un pixel stricat nu trebuie să blocheze comanda */
      }
    }
  }

  customElements.define('cod-form', CodForm);
})();
