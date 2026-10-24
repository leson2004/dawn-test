(() => {
  const selector = '[data-hero-slideshow]';
  const instances = new WeakMap();

  function initHeroSlideshow(root) {
    if (!root || instances.has(root)) return;

    const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));

    if (slides.length === 0) return;

    const prevButton = root.querySelector('[data-hero-prev]');
    const nextButton = root.querySelector('[data-hero-next]');
    const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));

    const autoplay = root.dataset.autoplay === 'true';
    const interval = Math.max(1000, Number(root.dataset.interval) || 5000);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));

    if (activeIndex < 0) activeIndex = 0;

    let timer = null;
    let destroyed = false;

    function showSlide(index) {
      if (destroyed) return;

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        const active = i === activeIndex;

        slide.classList.toggle('is-active', active);

        if (active) {
          slide.removeAttribute('aria-hidden');
          slide.removeAttribute('inert');
        } else {
          slide.setAttribute('aria-hidden', 'true');
          slide.setAttribute('inert', '');
        }
      });

      dots.forEach((dot, i) => {
        const active = i === activeIndex;

        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', String(active));
      });
    }

    function stopAutoplay() {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();

      if (!autoplay || slides.length < 2 || reducedMotion.matches || document.hidden) {
        return;
      }

      timer = window.setInterval(() => {
        if (!root.matches(':hover') && !root.contains(document.activeElement)) {
          showSlide(activeIndex + 1);
        }
      }, interval);
    }

    function handlePrev() {
      showSlide(activeIndex - 1);
      startAutoplay();
    }

    function handleNext() {
      showSlide(activeIndex + 1);
      startAutoplay();
    }

    function handleDotClick(event) {
      const dot = event.currentTarget;
      const index = Number(dot.dataset.slideIndex);

      if (Number.isInteger(index)) {
        showSlide(index);
        startAutoplay();
      }
    }

    prevButton?.addEventListener('click', handlePrev);
    nextButton?.addEventListener('click', handleNext);

    dots.forEach((dot) => {
      dot.addEventListener('click', handleDotClick);
    });

    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', startAutoplay);
    root.addEventListener('focusin', stopAutoplay);
    root.addEventListener('focusout', startAutoplay);

    document.addEventListener('visibilitychange', startAutoplay);
    reducedMotion.addEventListener('change', startAutoplay);

    const cleanup = () => {
      destroyed = true;
      stopAutoplay();

      prevButton?.removeEventListener('click', handlePrev);
      nextButton?.removeEventListener('click', handleNext);

      dots.forEach((dot) => {
        dot.removeEventListener('click', handleDotClick);
      });

      root.removeEventListener('mouseenter', stopAutoplay);
      root.removeEventListener('mouseleave', startAutoplay);
      root.removeEventListener('focusin', stopAutoplay);
      root.removeEventListener('focusout', startAutoplay);

      document.removeEventListener('visibilitychange', startAutoplay);
      reducedMotion.removeEventListener('change', startAutoplay);

      instances.delete(root);
    };

    instances.set(root, cleanup);

    showSlide(activeIndex);
    startAutoplay();
  }

  function initWithin(container) {
    if (container.matches?.(selector)) {
      initHeroSlideshow(container);
    }

    container.querySelectorAll?.(selector).forEach(initHeroSlideshow);
  }

  function destroyWithin(container) {
    if (container.matches?.(selector)) {
      instances.get(container)?.();
    }

    container.querySelectorAll?.(selector).forEach((root) => {
      instances.get(root)?.();
    });
  }

  function initAll() {
    document.querySelectorAll(selector).forEach(initHeroSlideshow);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll, {
      once: true,
    });
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', (event) => {
    initWithin(event.target);
  });

  document.addEventListener('shopify:section:unload', (event) => {
    destroyWithin(event.target);
  });
})();
