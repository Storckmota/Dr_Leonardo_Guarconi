/* Coreografia genérica de rolagem: títulos por linha ([data-split]),
   blocos ([data-reveal]), imagens por máscara ([data-mask]), parallax
   ([data-para]), números fantasmas e viagem de cor do fundo.
   Tudo aqui só roda com motionOK. */

import { gsap, ScrollTrigger } from './context.js';
import { splitLines, unsplit } from './split.js';

const splitEntries = [];

function buildSplit(el) {
  const inners = splitLines(el);
  gsap.set(inners, { yPercent: 115 });
  const trigger = ScrollTrigger.create({
    trigger: el,
    start: 'top 84%',
    once: true,
    onEnter: () =>
      gsap.to(inners, {
        yPercent: 0,
        duration: 1.05,
        ease: 'expo.out',
        stagger: 0.095,
      }),
  });
  splitEntries.push({ el, trigger });
}

export function initReveals() {
  /* Títulos por linha (exceto os do hero, coreografados à parte) */
  document.querySelectorAll('[data-split]').forEach(buildSplit);

  /* Blocos */
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.set(el, { autoAlpha: 0, y: 26 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 86%',
      once: true,
      onEnter: () => gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out' }),
    });
  });

  /* Máscaras de imagem */
  document.querySelectorAll('[data-mask]').forEach((el) => {
    const img = el.querySelector('img');
    gsap.set(el, { clipPath: 'inset(0 0 100% 0)' });
    if (img) gsap.set(img, { scale: 1.14 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 1.15, ease: 'power4.out' });
        if (img) gsap.to(img, { scale: 1, duration: 1.6, ease: 'power3.out' });
      },
    });
  });

  /* Parallax por coeficiente: só a partir do tablet (peso zero no mobile) */
  if (window.matchMedia('(min-width: 768px)').matches) {
    document.querySelectorAll('[data-para]').forEach((el) => {
      const c = parseFloat(el.dataset.para || '0.2');
      gsap.fromTo(
        el,
        { y: () => c * -90 },
        {
          y: () => c * 90,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        }
      );
    });
  }

  /* Marcos da formação: cascata própria */
  const marcos = gsap.utils.toArray('[data-marco]');
  if (marcos.length) {
    gsap.set(marcos, { autoAlpha: 0, y: 34 });
    ScrollTrigger.create({
      trigger: '.marcos',
      start: 'top 82%',
      once: true,
      onEnter: () =>
        gsap.to(marcos, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.16 }),
    });
  }

  /* Viagem de cor entre capítulos claros */
  const travel = [
    { trigger: '.tx', from: 'var(--porcelain)', to: 'var(--ivory)' },
    { trigger: '.filosofia', from: 'var(--ivory)', to: 'var(--porcelain)' },
  ];
  for (const t of travel) {
    const sec = document.querySelector(t.trigger);
    if (!sec) continue;
    gsap.fromTo(
      document.body,
      { backgroundColor: t.from },
      {
        backgroundColor: t.to,
        ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top 90%', end: 'top 30%', scrub: 0.5 },
      }
    );
  }

  /* Re-split em mudança de largura (linhas medidas mudam) */
  let lastW = window.innerWidth;
  let timer = null;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(timer);
    timer = setTimeout(() => {
      for (const entry of splitEntries) {
        entry.trigger.kill();
        unsplit(entry.el);
      }
      splitEntries.length = 0;
      document.querySelectorAll('[data-split]').forEach((el) => {
        /* já revelados: reconstruir visível, sem esconder de novo */
        const inners = splitLines(el);
        gsap.set(inners, { yPercent: 0 });
      });
      ScrollTrigger.refresh();
    }, 280);
  });
}
