/* ============================================================================
   Dr. Leonardo Guarçoni — interações
   Sem dependências: header, menu, índice de tratamentos (tabs), reveals
   e parallax sutil. Tudo é enhancement progressivo sobre HTML completo.
   ========================================================================== */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isCompact = window.matchMedia('(max-width: 999px)');

/* --- Header: estado ao rolar ------------------------------------------------ */

const header = document.querySelector('[data-header]');
let lastScrolled = false;

function syncHeader() {
  const scrolled = window.scrollY > 12;
  if (scrolled !== lastScrolled) {
    lastScrolled = scrolled;
    header.classList.toggle('is-scrolled', scrolled);
  }
}

window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

/* --- Menu mobile -------------------------------------------------------------- */

const menu = document.querySelector('[data-menu]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const menuPanel = menu.querySelector('.menu-panel');
let menuOpen = false;

const focusablesIn = (root) =>
  [...root.querySelectorAll('a[href], button:not([disabled])')].filter(
    (el) => el.offsetParent !== null || el === document.activeElement
  );

function openMenu() {
  if (menuOpen) return;
  menuOpen = true;
  menu.hidden = false;
  requestAnimationFrame(() => menu.classList.add('is-open'));
  menuToggle.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-locked');
  const first = menuPanel.querySelector('a');
  if (first) first.focus({ preventScroll: true });
}

function closeMenu({ returnFocus = true } = {}) {
  if (!menuOpen) return;
  menuOpen = false;
  menu.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-locked');
  const delay = reduceMotion.matches ? 0 : 420;
  window.setTimeout(() => {
    if (!menuOpen) menu.hidden = true;
  }, delay);
  if (returnFocus) menuToggle.focus({ preventScroll: true });
}

menuToggle.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));

/* Se a viewport crescer até o layout desktop, o overlay fecha sozinho. */
const desktopNav = window.matchMedia('(min-width: 1024px)');
desktopNav.addEventListener('change', (e) => {
  if (e.matches) closeMenu({ returnFocus: false });
});

menu.addEventListener('click', (e) => {
  if (e.target.closest('[data-menu-link]')) closeMenu({ returnFocus: false });
});

document.addEventListener('keydown', (e) => {
  if (!menuOpen) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeMenu();
    return;
  }
  if (e.key === 'Tab') {
    const items = [menuToggle, ...focusablesIn(menuPanel)];
    const index = items.indexOf(document.activeElement);
    let next = index + (e.shiftKey ? -1 : 1);
    if (index === -1) next = 0;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    e.preventDefault();
    items[next].focus({ preventScroll: true });
  }
});

/* --- Tratamentos: índice → tabs acessíveis ------------------------------------ */

const txList = document.querySelector('[data-tx-list]');
const txTabs = [...document.querySelectorAll('[data-tx-tab]')];
const txPanels = [...document.querySelectorAll('[data-tx-panel]')];

function selectTreatment(index, { scrollToPanel = false, focusTab = false } = {}) {
  txTabs.forEach((tab, i) => {
    const active = i === index;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  txPanels.forEach((panel, i) => {
    const active = i === index;
    if (active && panel.hidden) {
      panel.hidden = false;
      panel.classList.add('is-entering');
      window.setTimeout(() => panel.classList.remove('is-entering'), 480);
    } else if (!active) {
      panel.hidden = true;
      panel.classList.remove('is-entering');
    }
  });
  if (focusTab) txTabs[index].focus({ preventScroll: true });
  if (scrollToPanel && isCompact.matches) {
    txPanels[index].scrollIntoView({
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
      block: 'start',
    });
  }
}

if (txList && txTabs.length === txPanels.length && txTabs.length > 0) {
  txList.setAttribute('role', 'tablist');
  txList.setAttribute('aria-orientation', 'vertical');
  txList.setAttribute('aria-label', 'Índice de tratamentos');

  txTabs.forEach((tab, i) => {
    tab.setAttribute('role', 'tab');
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      selectTreatment(i, { scrollToPanel: true });
    });
    tab.addEventListener('keydown', (e) => {
      const max = txTabs.length - 1;
      let target = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') target = i === max ? 0 : i + 1;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') target = i === 0 ? max : i - 1;
      else if (e.key === 'Home') target = 0;
      else if (e.key === 'End') target = max;
      if (target !== null) {
        e.preventDefault();
        selectTreatment(target, { focusTab: true });
      }
    });
  });

  txPanels.forEach((panel) => {
    panel.setAttribute('role', 'tabpanel');
    panel.tabIndex = 0;
    const back = panel.querySelector('[data-tx-back]');
    if (back) {
      back.hidden = false;
      back.addEventListener('click', (e) => {
        e.preventDefault();
        const active = txTabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
        const tab = txTabs[Math.max(active, 0)];
        tab.focus({ preventScroll: true });
        tab.scrollIntoView({
          behavior: reduceMotion.matches ? 'auto' : 'smooth',
          block: 'center',
        });
      });
    }
  });

  selectTreatment(0);
}

/* --- Reveals -------------------------------------------------------------------- */

const revealables = document.querySelectorAll('[data-reveal], [data-reveal-img]');

if (!reduceMotion.matches && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  revealables.forEach((el) => io.observe(el));
} else {
  revealables.forEach((el) => el.classList.add('is-in'));
}

/* --- Parallax sutil (desktop, ponteiro fino, sem reduced-motion) --------------- */

const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
const wantsParallax = window.matchMedia('(min-width: 1024px) and (pointer: fine)');

if (parallaxEls.length && wantsParallax.matches && !reduceMotion.matches) {
  let ticking = false;

  const applyParallax = () => {
    ticking = false;
    const vh = window.innerHeight;
    for (const el of parallaxEls) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) continue;
      const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2);
      const y = Math.max(-1, Math.min(1, progress)) * -13;
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    }
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyParallax);
      }
    },
    { passive: true }
  );
  applyParallax();
}

/* --- Ano corrente no footer ------------------------------------------------------ */

const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
