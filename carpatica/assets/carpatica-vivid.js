/* Carpatica – secțiuni dinamice: video redat ca GIF, „Vezi mai multe”, galerie foto (lightbox), recenzii video */
(() => {
  // Scriptul poate fi inclus de mai multe secțiuni: rulează o singură dată
  if (window.CarpaticaVivid) return;
  window.CarpaticaVivid = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Video care se încarcă și pornește doar când e vizibil (economisește date pe mobil)
  const videoObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach(({ target: video, isIntersecting }) => {
              if (isIntersecting) {
                if (!video.dataset.loaded) {
                  video.querySelectorAll('source[data-src]').forEach((source) => (source.src = source.dataset.src));
                  video.dataset.loaded = 'true';
                  video.load();
                }
                if (!reduceMotion && !video.dataset.userPaused) video.play().catch(() => {});
              } else if (!video.paused) {
                video.pause();
              }
            });
          },
          { rootMargin: '150px 0px', threshold: 0.15 }
        )
      : null;

  function initVideos(root = document) {
    root.querySelectorAll('video[data-inview-play]:not([data-observed])').forEach((video) => {
      video.dataset.observed = 'true';
      if (reduceMotion) video.controls = true;
      if (videoObserver) videoObserver.observe(video);
    });
  }

  // <c-load-more data-step="6"> – afișează progresiv elementele [data-more-item]
  if (!customElements.get('c-load-more')) {
    customElements.define(
      'c-load-more',
      class CLoadMore extends HTMLElement {
        connectedCallback() {
          this.button = this.querySelector('[data-load-more]');
          if (!this.button) return;
          this.button.addEventListener('click', () => this.showMore());
        }

        showMore() {
          const step = parseInt(this.dataset.step, 10) || 6;
          const hidden = Array.from(this.querySelectorAll('[data-more-item][hidden]'));
          hidden.slice(0, step).forEach((item, i) => {
            item.hidden = false;
            item.style.setProperty('--c-delay', `${i * 60}ms`);
            item.classList.add('c-appear');
            initVideos(item);
          });
          if (hidden.length <= step) this.button.closest('.c-load-more__actions')?.remove();
        }
      }
    );
  }

  // <c-lightbox> – deschide pozele recenziilor mari, cu navigare stânga/dreapta și swipe
  if (!customElements.get('c-lightbox')) {
    customElements.define(
      'c-lightbox',
      class CLightbox extends HTMLElement {
        connectedCallback() {
          this.dialog = this.querySelector('dialog');
          if (!this.dialog) return;
          this.image = this.dialog.querySelector('.c-lightbox__image');
          this.caption = this.dialog.querySelector('.c-lightbox__caption');
          this.counter = this.dialog.querySelector('.c-lightbox__counter');
          this.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-lightbox-src]');
            if (!trigger || !this.contains(trigger) || this.dialog.contains(trigger)) return;
            e.preventDefault();
            this.open(trigger);
          });
          this.dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', () => this.dialog.close());
          this.dialog.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => this.step(-1));
          this.dialog.querySelector('[data-lightbox-next]')?.addEventListener('click', () => this.step(1));
          this.dialog.addEventListener('click', (e) => e.target === this.dialog && this.dialog.close());
          this.dialog.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.step(-1);
            if (e.key === 'ArrowRight') this.step(1);
          });
          this.dialog.addEventListener('close', () => document.body.classList.remove('overflow-hidden'));
          let startX = 0;
          this.dialog.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX), { passive: true });
          this.dialog.addEventListener(
            'touchend',
            (e) => {
              const dx = e.changedTouches[0].clientX - startX;
              if (Math.abs(dx) > 50) this.step(dx < 0 ? 1 : -1);
            },
            { passive: true }
          );
        }

        items() {
          return Array.from(this.querySelectorAll('[data-lightbox-src]')).filter(
            (el) => !el.parentElement.closest('[hidden]') && !this.dialog.contains(el)
          );
        }

        open(trigger) {
          this.index = this.items().indexOf(trigger);
          this.show();
          this.dialog.showModal();
          document.body.classList.add('overflow-hidden');
        }

        step(direction) {
          const total = this.items().length;
          if (total < 2) return;
          this.index = (this.index + direction + total) % total;
          this.show();
        }

        show() {
          const items = this.items();
          const item = items[this.index];
          if (!item) return;
          this.image.src = item.dataset.lightboxSrc;
          this.image.alt = item.dataset.lightboxAlt || '';
          if (this.caption) this.caption.innerHTML = item.dataset.lightboxCaption || '';
          if (this.counter) this.counter.textContent = items.length > 1 ? `${this.index + 1} / ${items.length}` : '';
        }
      }
    );
  }

  // Recenzii video: atingerea pornește sunetul (și invers)
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-sound-toggle]');
    if (!toggle) return;
    const card = toggle.closest('.c-vreview');
    const video = card?.querySelector('video');
    if (!video) return;
    const unmute = video.muted;
    document.querySelectorAll('.c-vreview video').forEach((other) => {
      if (other !== video) {
        other.muted = true;
        other.closest('.c-vreview')?.classList.remove('is-unmuted');
      }
    });
    video.muted = !unmute;
    if (unmute) {
      delete video.dataset.userPaused;
      video.play().catch(() => {});
    }
    card.classList.toggle('is-unmuted', unmute);
  });

  initVideos();
  document.addEventListener('shopify:section:load', (e) => initVideos(e.target));
})();
