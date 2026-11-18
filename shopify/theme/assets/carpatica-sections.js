/* ==========================================================================
   Carpatica – componente pentru secțiuni (stories, înainte/după, numere animate,
   hero parallax, tab-uri, hotspot-uri, pop-up promo, player muzică, urmărire comandă)
   ========================================================================== */

(() => {
  const define = (name, ctor) => !customElements.get(name) && customElements.define(name, ctor);
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Instagram stories ---------- */

  class InstaStories extends HTMLElement {
    connectedCallback() {
      this.viewer = this.querySelector('.c-stories__viewer');
      this.slides = Array.from(this.querySelectorAll('[data-story-slide]'));
      this.bars = Array.from(this.querySelectorAll('.c-stories__bar > span'));
      this.duration = (parseInt(this.dataset.duration, 10) || 5) * 1000;
      this.querySelectorAll('[data-story-index]').forEach((thumb) =>
        thumb.addEventListener('click', () => this.open(parseInt(thumb.dataset.storyIndex, 10)))
      );
      this.querySelectorAll('[data-story-close]').forEach((el) => el.addEventListener('click', () => this.close()));
      this.querySelector('[data-story-prev]')?.addEventListener('click', () => this.show(this.index - 1));
      this.querySelector('[data-story-next]')?.addEventListener('click', () => this.show(this.index + 1));
      this.viewer?.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') this.close();
        if (e.key === 'ArrowRight') this.show(this.index + 1);
        if (e.key === 'ArrowLeft') this.show(this.index - 1);
      });
      const frame = this.querySelector('.c-stories__frame');
      frame?.addEventListener('pointerdown', () => this.pause());
      frame?.addEventListener('pointerup', () => this.resume());
      if (this.viewer && this.viewer.parentElement !== document.body) document.body.appendChild(this.viewer);
    }

    disconnectedCallback() {
      cancelAnimationFrame(this.raf);
      this.viewer?.remove();
    }

    open(index) {
      this.opener = document.activeElement;
      this.viewer.hidden = false;
      document.body.classList.add('overflow-hidden');
      this.show(index);
      this.viewer.querySelector('.c-stories__close')?.focus();
    }

    close() {
      cancelAnimationFrame(this.raf);
      this.slides.forEach((slide) => slide.querySelector('video')?.pause());
      this.viewer.hidden = true;
      document.body.classList.remove('overflow-hidden');
      this.opener?.focus();
    }

    show(index) {
      if (index < 0) index = 0;
      if (index >= this.slides.length) return this.close();
      this.index = index;
      this.slides.forEach((slide, i) => {
        slide.hidden = i !== index;
        const video = slide.querySelector('video');
        if (video && i !== index) video.pause();
      });
      this.bars.forEach((bar, i) => (bar.style.width = i < index ? '100%' : '0%'));
      const video = this.slides[index].querySelector('video');
      let duration = this.duration;
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
        if (video.duration && isFinite(video.duration)) duration = video.duration * 1000;
      }
      this.start = performance.now();
      this.elapsed = 0;
      this.current = duration;
      this.paused = false;
      cancelAnimationFrame(this.raf);
      const tick = (now) => {
        if (!this.paused) {
          const progress = Math.min(1, (this.elapsed + now - this.start) / this.current);
          if (this.bars[index]) this.bars[index].style.width = `${progress * 100}%`;
          if (progress >= 1) return this.show(index + 1);
        }
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    }

    pause() {
      if (this.paused) return;
      this.paused = true;
      this.elapsed += performance.now() - this.start;
      this.slides[this.index]?.querySelector('video')?.pause();
    }

    resume() {
      if (!this.paused) return;
      this.paused = false;
      this.start = performance.now();
      this.slides[this.index]?.querySelector('video')?.play().catch(() => {});
    }
  }

  /* ---------- Înainte / după ---------- */

  class ComparisonSlider extends HTMLElement {
    connectedCallback() {
      const range = this.querySelector('.c-ba__range');
      if (!range) return;
      const set = (value) => this.style.setProperty('--c-ba-pos', `${value}%`);
      range.addEventListener('input', () => set(range.value));
      set(range.value);
    }
  }

  /* ---------- Numere animate și bare de progres ---------- */

  // Un singur ciclu de animație mișcă sincron bara, numărul și bulina (--c-progress pe fiecare rând).
  // Rândurile pornesc pe rând (data-stagger), iar la final primesc .is-done pentru efectul „pop”.
  class CountUp extends HTMLElement {
    connectedCallback() {
      this.rows = Array.from(this.querySelectorAll('.c-result'));
      if (!this.rows.length) this.rows = [this];
      if (reducedMotion()) return this.finish();
      this.reset();
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.play();
              if (!this.hasAttribute('data-replay')) this.observer.disconnect();
            } else if (this.hasAttribute('data-replay') && entry.boundingClientRect.top > 0) {
              this.reset();
            }
          });
        },
        { threshold: 0.35 }
      );
      this.observer.observe(this);
    }

    disconnectedCallback() {
      this.observer?.disconnect();
      cancelAnimationFrame(this.frame);
    }

    numbersOf(row) {
      return Array.from(row.querySelectorAll('[data-count-to]'));
    }

    render(row, value, target) {
      row.style.setProperty('--c-progress', value.toFixed(2));
      this.numbersOf(row).forEach((el) => {
        const final = parseFloat(el.dataset.countTo) || 0;
        const decimals = (String(el.dataset.countTo).split('.')[1] || '').length;
        const shown = target ? (final * value) / target : 0;
        el.textContent = shown.toFixed(decimals).replace('.', ',');
      });
    }

    reset() {
      cancelAnimationFrame(this.frame);
      this.playing = false;
      this.classList.remove('is-visible');
      this.rows.forEach((row) => {
        row.classList.remove('is-done', 'is-running');
        this.render(row, 0, 1);
      });
    }

    finish() {
      this.classList.add('is-visible');
      this.rows.forEach((row) => {
        const target = parseFloat(row.dataset.value) || 100;
        this.render(row, target, target);
        row.classList.add('is-done');
      });
    }

    play() {
      if (this.playing) return;
      this.playing = true;
      this.classList.add('is-visible');
      const duration = parseInt(this.dataset.duration, 10) || 1800;
      const stagger = parseInt(this.dataset.stagger, 10) || 0;
      const start = performance.now();
      const ease = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
      const tick = (now) => {
        let running = false;
        this.rows.forEach((row, i) => {
          const target = parseFloat(row.dataset.value) || 100;
          const t = Math.min(1, Math.max(0, (now - start - i * stagger) / duration));
          if (t > 0 && t < 1) running = true;
          if (t === 0) running = true;
          row.classList.toggle('is-running', t > 0 && t < 1);
          this.render(row, target * ease(t), target);
          if (t === 1 && !row.classList.contains('is-done')) row.classList.add('is-done');
        });
        if (running) this.frame = requestAnimationFrame(tick);
        else this.playing = false;
      };
      this.frame = requestAnimationFrame(tick);
    }
  }

  define('insta-stories', InstaStories);
  define('comparison-slider', ComparisonSlider);
  define('c-count-up', CountUp);

  window.CarpaticaSections = { define, reducedMotion };
})();
