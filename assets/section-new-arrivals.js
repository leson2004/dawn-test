(() => {
  const selector = '[data-new-arrivals]';
  const initialized = new WeakMap();

  function initSection(root) {
    if (initialized.has(root)) return;

    const track = root.querySelector('[data-na-track]');
    const prev = root.querySelector('[data-na-prev]');
    const next = root.querySelector('[data-na-next]');

    if (!track) return;

    function getStep() {
      const item = track.querySelector('[data-na-item]');

      if (!item) return track.clientWidth;

      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap) || 0;

      return item.getBoundingClientRect().width + gap;
    }

    function scrollProducts(direction) {
      track.scrollBy({
        left: direction * getStep() * 2,
        behavior: 'smooth',
      });
    }

    const onPrev = () => scrollProducts(-1);
    const onNext = () => scrollProducts(1);

    prev?.addEventListener('click', onPrev);
    next?.addEventListener('click', onNext);

    function updateButtons() {
      const maxScroll = track.scrollWidth - track.clientWidth;

      if (prev) {
        prev.disabled = track.scrollLeft <= 2;
      }

      if (next) {
        next.disabled = track.scrollLeft >= maxScroll - 2;
      }
    }

    track.addEventListener('scroll', updateButtons, {
      passive: true,
    });

    const observer = new ResizeObserver(updateButtons);
    observer.observe(track);

    const cleanup = () => {
      prev?.removeEventListener('click', onPrev);
      next?.removeEventListener('click', onNext);
      track.removeEventListener('scroll', updateButtons);
      observer.disconnect();
      initialized.delete(root);
    };

    initialized.set(root, cleanup);

    updateButtons();
  }

  function initWithin(container) {
    if (container.matches?.(selector)) {
      initSection(container);
    }

    container.querySelectorAll?.(selector).forEach(initSection);
  }

  function destroyWithin(container) {
    if (container.matches?.(selector)) {
      initialized.get(container)?.();
    }

    container.querySelectorAll?.(selector).forEach((root) => {
      initialized.get(root)?.();
    });
  }

  function initAll() {
    document.querySelectorAll(selector).forEach(initSection);
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
