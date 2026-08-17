/* Processo: no desktop com motion, capítulo pinado com as seis etapas
   conduzidas pelo scrub (crossfade + contador). No mobile ou com
   reduced-motion, a lista vertical padrão do CSS permanece.

   O filete de progresso foi removido do HUD: ele repetia, em proporção, a
   informação que o contador `01 / 06` já dá em número. */

import { gsap, motionOK } from './context.js';

export function initProcess() {
  if (!motionOK) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    const pinEl = document.querySelector('[data-processo-pin]');
    const passos = gsap.utils.toArray('.passo');
    const dots = gsap.utils.toArray('[data-processo-dot]');
    const ring = document.querySelector('.processo-ring');
    const current = document.querySelector('[data-processo-current]');
    if (!pinEl || passos.length < 2) return;

    const pad = (n) => String(n + 1).padStart(2, '0');
    const layoutOrbit = () => {
      if (!ring || !dots.length) return;
      const radiusRatio = 0.44;
      dots.forEach((dot, i) => {
        const angle = (-90 + i * (360 / dots.length)) * (Math.PI / 180);
        const x = 50 + Math.cos(angle) * radiusRatio * 100;
        const y = 50 + Math.sin(angle) * radiusRatio * 100;
        const cos = Math.cos(angle);
        dot.style.setProperty('--orbit-x', `${x.toFixed(3)}%`);
        dot.style.setProperty('--orbit-y', `${y.toFixed(3)}%`);
        dot.dataset.orbitAlign = cos > 0.28 ? 'right' : cos < -0.28 ? 'left' : 'center';
      });
    };

    gsap.set(passos, { autoAlpha: 0, y: 44 });
    gsap.set(passos[0], { autoAlpha: 1, y: 0 });
    layoutOrbit();

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

    window.addEventListener('resize', layoutOrbit);

    return () => {
      window.removeEventListener('resize', layoutOrbit);
      gsap.set(passos, { clearProps: 'all' });
      dots.forEach((dot) => {
        dot.style.removeProperty('--orbit-x');
        dot.style.removeProperty('--orbit-y');
        delete dot.dataset.orbitAlign;
      });
    };
  });

  /* Mobile: sem órbita. Etapas em slides verticais conduzidos pelo scroll,
     uma protagonista por vez, com contador e linha de progresso. Pin curto,
     proporcional às seis etapas. Reduced-motion cai na lista empilhada (CSS). */
  mm.add('(max-width: 767.98px)', () => {
    const pinEl = document.querySelector('[data-processo-pin]');
    const passos = gsap.utils.toArray('.passo');
    const current = document.querySelector('[data-processo-current]');
    if (!pinEl || passos.length < 2) return;

    const pad = (n) => String(n + 1).padStart(2, '0');
    const steps = passos.length;

    gsap.set(passos, { autoAlpha: 0, yPercent: 40 });
    gsap.set(passos[0], { autoAlpha: 1, yPercent: 0 });
    if (current) current.textContent = pad(0);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinEl,
        start: 'top top',
        end: () => '+=' + steps * 56 + '%',
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(steps - 1, Math.floor(self.progress * steps));
          if (current) current.textContent = pad(idx);
        },
      },
    });

    for (let i = 1; i < steps; i++) {
      tl.to(passos[i - 1], { autoAlpha: 0, yPercent: -40, duration: 0.26, ease: 'power2.in' }, i)
        .fromTo(
          passos[i],
          { autoAlpha: 0, yPercent: 40 },
          { autoAlpha: 1, yPercent: 0, duration: 0.34, ease: 'power3.out' },
          i + 0.28
        );
    }
    /* respiro final para a última etapa assentar antes do unpin */
    tl.to({}, { duration: 0.6 });

    return () => {
      gsap.set(passos, { clearProps: 'all' });
    };
  });
}
