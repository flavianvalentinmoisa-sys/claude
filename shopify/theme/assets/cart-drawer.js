class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.bindOverlay();
    this.setHeaderCartIconAccessibility();
    this.setupThemeEditor();
  }

  bindOverlay() {
    this.querySelector('#CartDrawer-Overlay')?.addEventListener('click', this.close.bind(this));
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('#cart-icon-bubble');
    if (!cartLink) return;

    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
    cartLink.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  // Carpatica: în editorul de temă coșul se deschide când selectezi secțiunea sau un bloc al ei
  setupThemeEditor() {
    if (!window.Shopify || !Shopify.designMode) return;
    const isOwnSection = (event) => event.detail?.sectionId === this.dataset.sectionId;
    document.addEventListener('shopify:section:select', (event) => isOwnSection(event) && this.open());
    document.addEventListener('shopify:block:select', (event) => isOwnSection(event) && this.open());
    document.addEventListener('shopify:section:deselect', (event) => isOwnSection(event) && this.close());
  }

  open(triggeredBy) {
    if (this.classList.contains('active')) return;
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add('animate', 'active');
    });

    this.addEventListener(
      'transitionend',
      () => {
        const containerToTrapFocusOn = document.getElementById('CartDrawer');
        const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true },
    );

    document.body.classList.add('overflow-hidden');

    // cart-drawer-items is a CartItems subclass that extends createViewEventElement.
    // Its `view-event-trigger="manual"` skips auto-dispatch on connect; we fire
    // it here when the drawer opens, with `context: 'dialog'` from the payload attribute.
    this.querySelector('cart-drawer-items')?.dispatchViewEvent?.();
    this.dispatchEvent(new CustomEvent('cart-drawer:open', { bubbles: true }));
  }

  close() {
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
    document.body.classList.remove('overflow-hidden');
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if (cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  /**
   * Înlocuiește conținutul coșului cu secțiunile primite de la Shopify.
   * options.open: deschide coșul după randare (implicit true)
   */
  renderContents(parsedState, { open = true } = {}) {
    this.productId = parsedState.id;
    this.lastRenderedAt = Date.now();
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);

      if (!sectionElement || !parsedState.sections?.[section.id]) return;
      sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
    });

    const inner = this.querySelector('.drawer__inner');
    const isEmpty = inner ? Number(inner.dataset.itemCount || 0) === 0 : false;
    this.classList.toggle('is-empty', isEmpty);

    setTimeout(() => {
      this.bindOverlay();
      if (open) this.open();
      document.dispatchEvent(new CustomEvent('cart-drawer:rendered', { detail: parsedState }));
    });
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer',
      },
      {
        id: 'cart-icon-bubble',
      },
    ];
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
    ];
  }

  // Carpatica: re-randează tot coșul (bare de progres, cadouri, total) când alt element modifică coșul
  onCartUpdate() {
    const drawer = document.querySelector('cart-drawer');
    if (drawer?.lastRenderedAt && Date.now() - drawer.lastRenderedAt < 1500) return Promise.resolve();
    return fetch(`${routes.cart_url}?section_id=cart-drawer`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const source = html.querySelector('.drawer__inner');
        const target = document.querySelector('#CartDrawer .drawer__inner');
        if (source && target) {
          target.innerHTML = source.innerHTML;
          target.dataset.itemCount = source.dataset.itemCount;
          target.dataset.cartTotal = source.dataset.cartTotal;
          drawer?.classList.toggle('is-empty', Number(source.dataset.itemCount || 0) === 0);
          document.dispatchEvent(new CustomEvent('cart-drawer:rendered'));
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);
