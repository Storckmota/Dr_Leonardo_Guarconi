/* Hero: estados iniciais, timeline de entrada (disparada pelo preloader)
   e transformação nos primeiros pixels de rolagem. */

import { gsap, ScrollTrigger } from './context.js';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

gsap.registerPlugin(MorphSVGPlugin);

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
    swipe: document.querySelector('[data-hero-swipe]'),
    swipeFill: document.querySelector('[data-hero-swipe-fill]'),
    swipeEdge: document.querySelector('[data-hero-swipe-edge]'),
  };
  if (!els.section) return;

  gsap.set(els.panel, { clipPath: 'inset(0 0 0 100%)' });
  gsap.set(els.img, { y: 46, scale: 1.07, autoAlpha: 0 });
  gsap.set(els.mark, { autoAlpha: 0 });
  gsap.set(els.kicker, { autoAlpha: 0, y: 18 });
  if (els.meta) gsap.set(els.meta, { autoAlpha: 0, y: 18 });
  gsap.set(els.words, { yPercent: 112 });
  gsap.set([els.foot, els.cue], { autoAlpha: 0, y: 24 });
  if (els.swipe) gsap.set(els.swipe, { autoAlpha: 0 });
}

export function enterHero() {
  if (!els || !els.section) return;

  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .to(els.panel, { clipPath: 'inset(0 0 0 0%)', duration: 1.15, ease: 'power4.inOut' }, 0)
    .to(els.img, { y: 0, scale: 1, autoAlpha: 1, duration: 1.3 }, 0.35)
    .to(els.mark, { autoAlpha: 0.12, duration: 1.2, ease: 'power2.out' }, 0.8)
    .to(els.kicker, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.55)
    .to(els.words, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.14 }, 0.62)
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
    .to(els.cue, { autoAlpha: 0, ease: 'none' }, 0);

  if (els.swipe && els.swipeFill && els.swipeEdge) {
    const startFill = 'M 0 100 V 99 Q 50 96 100 99 V 100 Z';
    const midFill = 'M 0 100 V 58 Q 49 28 100 56 V 100 Z';
    const endFill = 'M 0 100 V 0 Q 50 0 100 0 V 100 Z';
    const startEdge = 'M 0 99 Q 50 96 100 99';
    const midEdge = 'M 0 58 Q 49 28 100 56';
    const endEdge = 'M 0 0 Q 50 0 100 0';

    gsap.set(els.swipeFill, { morphSVG: startFill });
    gsap.set(els.swipeEdge, { morphSVG: startEdge });

    gsap.timeline({
      scrollTrigger: {
        trigger: els.section,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.35,
        invalidateOnRefresh: true,
      },
    })
      .to(els.swipe, { autoAlpha: 1, duration: 0.08, ease: 'none' }, 0.42)
      .to(els.swipeFill, { morphSVG: midFill, ease: 'power2.in' }, 0.48)
      .to(els.swipeEdge, { morphSVG: midEdge, ease: 'power2.in' }, 0.48)
      .to(els.swipeFill, { morphSVG: endFill, ease: 'power2.out' }, 0.66)
      .to(els.swipeEdge, { morphSVG: endEdge, ease: 'power2.out' }, 0.66)
      .to(els.swipe, { autoAlpha: 0, duration: 0.08, ease: 'none' }, 0.96);
  }
}

/* Sem motion: garante tudo visível (nada foi escondido). */
export function heroStatic() {
  /* nada a fazer: estados iniciais nunca foram aplicados */
}

export function refreshAfterHero() {
  ScrollTrigger.refresh();
}
