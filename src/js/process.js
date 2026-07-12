/* Processo: no desktop com motion, capítulo pinado com as seis etapas
   conduzidas pelo scrub (crossfade + contador + linha). No mobile ou com
   reduced-motion, a lista vertical padrão do CSS permanece. */

import { gsap, motionOK } from './context.js';

export function initProcess() {
  if (!motionOK) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    const pinEl = document.querySelector('[data-processo-pin]');
    const passos = gsap.utils.toArray('.passo');
    const dots = gsap.utils.toArray('[data-processo-dot]');
    const current = document.querySelector('[data-processo-current]');
    const bar = document.querySelector('[data-processo-progress]');
    if (!pinEl || passos.length < 2) return;

    const pad = (n) => String(n + 1).padStart(2, '0');

    gsap.set(passos, { autoAlpha: 0, y: 44 });
    gsap.set(passos[0], { autoAlpha: 1, y: 0 });

    const steps = passos.length;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinEl,
        start: 'top top',
        end: () => '+=' + steps * 56 + '%',
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        onUpdate: (self) => {
          const idx = Math.min(steps - 1, Math.floor(self.progress * steps));
          if (current) current.textContent = pad(idx);
          if (bar) gsap.set(bar, { scaleX: self.progress });
          dots.forEach((dot, i) => dot.classList.toggle('is-active', i === idx));
        },
      },
    });

    for (let i = 1; i < steps; i++) {
      tl.to(passos[i - 1], { autoAlpha: 0, y: -34, duration: 0.26, ease: 'power2.in' }, i)
        .fromTo(
          passos[i],
          { autoAlpha: 0, y: 34 },
          { autoAlpha: 1, y: 0, duration: 0.34, ease: 'power3.out' },
          i + 0.28
        );
    }
    /* respiro final para o último passo assentar antes do unpin */
    tl.to({}, { duration: 0.6 });

    return () => {
      gsap.set(passos, { clearProps: 'all' });
    };
  });
}
