document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNavigation();
  initAnchorNavigation();
  setCurrentYear();
});

function initTheme() {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  const readStoredTheme = () => {
    try {
      const stored = localStorage.getItem('tasteties-theme');
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      return null;
    }
  };

  const applyTheme = theme => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    if (themeColor) {
      themeColor.setAttribute('content', theme === 'dark' ? '#101713' : '#F7F5EF');
    }

    if (toggle) {
      const nextTheme = theme === 'dark' ? 'ljust' : 'mörkt';
      const english = root.lang === 'en';
      toggle.setAttribute(
        'aria-label',
        english ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : `Byt till ${nextTheme} läge`
      );
      const label = toggle.querySelector('.theme-label');
      if (label) {
        label.textContent = english
          ? (theme === 'dark' ? 'Light mode' : 'Dark mode')
          : (theme === 'dark' ? 'Ljust läge' : 'Mörkt läge');
      }
    }
  };

  const storedTheme = readStoredTheme();
  applyTheme(storedTheme || (systemDark.matches ? 'dark' : 'light'));

  toggle?.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    try {
      localStorage.setItem('tasteties-theme', nextTheme);
    } catch {
      // The selected theme still applies for the current visit.
    }
  });

  systemDark.addEventListener('change', event => {
    if (!readStoredTheme()) applyTheme(event.matches ? 'dark' : 'light');
  });
}

function initMobileNavigation() {
  const toggle = document.getElementById('mobile-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  const firstLink = () => nav.querySelector('a');

  const setOpen = (open, returnFocus = false) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute(
      'aria-label',
      document.documentElement.lang === 'en'
        ? (open ? 'Close menu' : 'Open menu')
        : (open ? 'Stäng meny' : 'Öppna meny')
    );
    document.body.classList.toggle('nav-open', open);

    if (open) {
      window.requestAnimationFrame(() => firstLink()?.focus());
    } else if (returnFocus) {
      toggle.focus();
    }
  };

  toggle.addEventListener('click', () => {
    setOpen(!nav.classList.contains('is-open'));
  });

  nav.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false, true);
    }
  });

  document.addEventListener('click', event => {
    if (!nav.classList.contains('is-open')) return;
    if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 800 && nav.classList.contains('is-open')) setOpen(false);
  });
}

function initAnchorNavigation() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const openTargetDetails = target => {
    if (target instanceof HTMLDetailsElement) target.open = true;
  };

  const initialHash = window.location.hash;
  if (initialHash) {
    const initialTarget = document.querySelector(initialHash);
    openTargetDetails(initialTarget);
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    openTargetDetails(target);
    target.scrollIntoView({behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start'});
    window.history.replaceState(null, '', hash);
  });
}

function setCurrentYear() {
  const year = String(new Date().getFullYear());
  document.querySelectorAll('[data-current-year]').forEach(node => {
    node.textContent = year;
  });
}
