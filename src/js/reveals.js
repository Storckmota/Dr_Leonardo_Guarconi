/* Coreografia genérica de rolagem: blocos ([data-reveal]),
   imagens por máscara ([data-mask]), parallax
   ([data-para]), números fantasmas e viagem de cor do fundo.
   Tudo aqui só roda com motionOK. */

import { gsap, ScrollTrigger } from './context.js';
import { initTextReveals } from './text-reveals.js';

export function initReveals() {
  /* Títulos por linha (SplitText responsivo, exceto hero coreografado à parte) */
  initTextReveals();

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

  /* Curvas do painel da missão: desenham-se conforme a seção entra. */
  const missionPaths = gsap.utils.toArray('.galeria-curve path');
  if (missionPaths.length) {
    missionPaths.forEach((p) => {
      const length = p.getTotalLength();
      gsap.set(p, { strokeDasharray: length, strokeDashoffset: length });
    });
    ScrollTrigger.create({
      trigger: '.galeria-system',
      start: 'top 82%',
      end: 'bottom 60%',
      scrub: 0.45,
      onUpdate: (self) => {
        missionPaths.forEach((p, i) => {
          const length = p.getTotalLength();
          const t = gsap.utils.clamp(0, 1, self.progress * 1.15 - i * 0.12);
          gsap.set(p, { strokeDashoffset: length * (1 - t) });
        });
      },
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

  window.addEventListener('resize', () => ScrollTrigger.refresh());
}
