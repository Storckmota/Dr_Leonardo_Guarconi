/* Smooth scroll (Lenis) integrado ao ScrollTrigger + âncoras suaves. */

import Lenis from 'lenis';
import { gsap, ScrollTrigger, motionOK } from './context.js';

export let lenis = null;

const HEADER_OFFSET = -76;

export function initSmooth() {
  if (!motionOK) {
    bindAnchors(null);
    return null;
  }

  lenis = new Lenis({
    duration: 1.05,
    easing: (t) => 1 - Math.pow(1 - t, 3.2),
    smoothWheel: true,
    syncTouch: false, /* toque permanece nativo: leve no mobile */
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  bindAnchors(lenis);
  return lenis;
}

function bindAnchors(l) {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const focusTarget = () => {
      if (!/^(a|button|input|select|textarea)$/i.test(target.tagName)) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    };
    if (l) {
      l.scrollTo(target, {
        offset: HEADER_OFFSET,
        duration: 1.15,
        lock: true,
        onComplete: focusTarget,
      });
    } else {
      target.scrollIntoView();
      focusTarget();
    }
    history.replaceState(null, '', id);
  });
}
