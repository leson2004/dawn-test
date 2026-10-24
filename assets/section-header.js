document.querySelectorAll('[data-header]').forEach((header) => {
  if (header.dataset.initialized === 'true') return;

  header.dataset.initialized = 'true';

  const toggle = header.querySelector('[data-menu-toggle]');
  const closeButton = header.querySelector('[data-menu-close]');
  const menu = header.querySelector('[data-mobile-menu]');
  const overlay = header.querySelector('[data-menu-overlay]');

  if (!toggle || !closeButton || !menu || !overlay) return;

  let previousActiveElement = null;

  function openMenu() {
    previousActiveElement = document.activeElement;

    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    menu.removeAttribute('inert');

    overlay.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');

    document.body.classList.add('mobile-menu-open');
    closeButton.focus();
  }

  function closeMenu(returnFocus = true) {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    menu.setAttribute('inert', '');

    overlay.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');

    document.body.classList.remove('mobile-menu-open');

    if (returnFocus && previousActiveElement) {
      previousActiveElement.focus();
    }
  }

  toggle.addEventListener('click', () => {
    if (menu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  closeButton.addEventListener('click', () => closeMenu());

  overlay.addEventListener('click', () => closeMenu());

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });
});
