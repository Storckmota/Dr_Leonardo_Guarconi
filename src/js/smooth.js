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
    duration: 0.92,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    wheelMultiplier: 0.9,
    smoothWheel: true,
    syncTouch: false, /* toque permanece nativo: leve no mobile */
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  bindAnchors(lenis);
  /* Handle global da instância. Ferramentas externas que precisem posicionar a
     página (inspeção, automação) têm de rolar por aqui: com window.scrollTo o
     Lenis desfaz o salto no frame seguinte e a posição medida nunca é a que o
     usuário vê. */
  window.__lenis = lenis;
  return lenis;
}

function bindAnchors(l) {
  const scrollToHash = ({ focus = false } = {}) => {
    const target = location.hash ? document.querySelector(location.hash) : document.querySelector('#inicio');
    if (!target) return;
    const done = () => {
      if (!focus) return;
      if (!/^(a|button|input|select|textarea)$/i.test(target.tagName)) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    };
    if (l) {
      l.scrollTo(target, { offset: HEADER_OFFSET, duration: 0.9, lock: true, onComplete: done });
    } else {
      target.scrollIntoView();
      done();
    }
  };

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
    if (location.hash === id) history.replaceState(null, '', id);
    else history.pushState(null, '', id);
  });

  window.addEventListener('popstate', () => scrollToHash());
}
