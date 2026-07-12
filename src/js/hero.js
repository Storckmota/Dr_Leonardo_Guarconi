/* Hero: estados iniciais, timeline de entrada (disparada pelo preloader)
   e transformação nos primeiros pixels de rolagem. */

import { gsap, ScrollTrigger } from './context.js';

let els = null;

export function prepareHero() {
  els = {
    section: document.querySelector('.hero'),
    panel: document.querySelector('[data-hero-panel]'),
    media: document.querySelector('[data-hero-media]'),
    img: document.querySelector('[data-hero-media] img'),
    mark: document.querySelector('.hero-panel-mark'),
    meta: document.querySelector('[data-hero-meta]'),
    kicker: document.querySelector('[data-hero-kicker]'),
    words: gsap.utils.toArray('[data-hero-word]'),
    foot: document.querySelector('[data-hero-foot]'),
    cue: document.querySelector('[data-hero-cue]'),
  };
  if (!els.section) return;

  gsap.set(els.panel, { clipPath: 'inset(0 0 0 100%)' });
  gsap.set(els.img, { y: 46, scale: 1.07, autoAlpha: 0 });
  gsap.set(els.mark, { autoAlpha: 0 });
  gsap.set([els.meta, els.kicker], { autoAlpha: 0, y: 18 });
  gsap.set(els.words, { yPercent: 112 });
  gsap.set([els.foot, els.cue], { autoAlpha: 0, y: 24 });
}

export function enterHero() {
  if (!els || !els.section) return;

  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .to(els.panel, { clipPath: 'inset(0 0 0 0%)', duration: 1.15, ease: 'power4.inOut' }, 0)
    .to(els.img, { y: 0, scale: 1, autoAlpha: 1, duration: 1.3 }, 0.35)
    .to(els.mark, { autoAlpha: 0.12, duration: 1.2, ease: 'power2.out' }, 0.8)
    .to(els.kicker, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.55)
    .to(els.words, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.14 }, 0.62)
    .to(els.meta, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.9)
    .to(els.foot, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.1)
    .to(els.cue, { autoAlpha: 1, y: 0, duration: 0.7 }, 1.3);

  /* Camadas em velocidades diferentes ao começar a rolar */
  const scrub = gsap.timeline({
    scrollTrigger: {
      trigger: els.section,
      start: 'top top',
      end: '+=62%',
      scrub: 0.55,
    },
  });
  scrub
    .to(els.img, { yPercent: -9, ease: 'none' }, 0)
    .to('.hero-title', { yPercent: -16, ease: 'none' }, 0)
    .to(els.meta, { autoAlpha: 0, y: -18, ease: 'none' }, 0)
    .to(els.cue, { autoAlpha: 0, ease: 'none' }, 0);
}

/* Sem motion: garante tudo visível (nada foi escondido). */
export function heroStatic() {
  /* nada a fazer: estados iniciais nunca foram aplicados */
}

export function refreshAfterHero() {
  ScrollTrigger.refresh();
}
