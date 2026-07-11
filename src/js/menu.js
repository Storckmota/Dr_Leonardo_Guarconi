/* Menu overlay: wipe de tela cheia, links em cascata, trap de foco, Escape.
   Com reduced-motion o overlay abre e fecha instantaneamente. */

import { gsap, motionOK, mqDesktop } from './context.js';
import { lenis } from './smooth.js';

export function initMenu() {
  const menu = document.querySelector('[data-menu]');
  const toggle = document.querySelector('[data-menu-toggle]');
  if (!menu || !toggle) return;

  const panel = menu.querySelector('.menu-panel');
  const links = [...menu.querySelectorAll('.menu-link')];
  const foot = menu.querySelector('[data-menu-foot]');
  const mark = menu.querySelector('.menu-mark');
  let open = false;
  let tl = null;

  const focusables = () => [toggle, ...menu.querySelectorAll('a[href], button:not([disabled])')];

  function buildTimeline() {
    tl = gsap.timeline({ paused: true });
    tl.set(menu, { visibility: 'visible' })
      .fromTo(panel, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.62, ease: 'power4.inOut' })
      .fromTo(links, { yPercent: 55, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out', stagger: 0.055 }, '-=0.24')
      .fromTo(foot, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }, '-=0.32')
      .fromTo(mark, { autoAlpha: 0, scale: 1.06 }, { autoAlpha: 0.07, scale: 1, duration: 0.7, ease: 'power2.out' }, 0.15);
  }

  function openMenu() {
    if (open) return;
    open = true;
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-locked');
    if (lenis) lenis.stop();
    if (motionOK) {
      if (!tl) buildTimeline();
      tl.timeScale(1).play(0);
    }
    const first = menu.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }

  function closeMenu({ returnFocus = true } = {}) {
    if (!open) return;
    open = false;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-locked');
    if (lenis) lenis.start();
    const done = () => {
      if (!open) menu.hidden = true;
    };
    if (motionOK && tl) {
      tl.timeScale(1.7).reverse();
      tl.eventCallback('onReverseComplete', done);
    } else {
      done();
    }
    if (returnFocus) toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', () => (open ? closeMenu() : openMenu()));

  menu.addEventListener('click', (e) => {
    if (e.target.closest('[data-menu-link]')) closeMenu({ returnFocus: false });
  });

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      return;
    }
    if (e.key === 'Tab') {
      const items = focusables();
      const index = items.indexOf(document.activeElement);
      let next = index + (e.shiftKey ? -1 : 1);
      if (index === -1) next = 0;
      if (next < 0) next = items.length - 1;
      if (next >= items.length) next = 0;
      e.preventDefault();
      items[next].focus({ preventScroll: true });
    }
  });

  mqDesktop.addEventListener('change', (e) => {
    if (e.matches) closeMenu({ returnFocus: false });
  });
}
