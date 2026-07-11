/* Mapa: carrega o iframe do Google Maps quando o capítulo se aproxima e
   revela o conjunto com máscara + painel. Sem motion, carrega imediatamente. */

import { gsap, ScrollTrigger, motionOK } from './context.js';

export function initMapa() {
  const shell = document.querySelector('[data-mapa-shell]');
  if (!shell) return;

  const embed = shell.querySelector('[data-mapa-embed]');
  const iframe = embed ? embed.querySelector('iframe[data-src]') : null;
  const panel = shell.querySelector('[data-mapa-panel]');

  const load = () => {
    if (iframe && !iframe.src) iframe.src = iframe.dataset.src;
  };

  if (!motionOK) {
    load();
    return;
  }

  ScrollTrigger.create({
    trigger: shell,
    start: 'top 120%',
    once: true,
    onEnter: load,
  });

  gsap.set(embed, { clipPath: 'inset(4% 4% 96% 4%)' });
  gsap.set(panel, { autoAlpha: 0, y: 44 });
  ScrollTrigger.create({
    trigger: shell,
    start: 'top 74%',
    once: true,
    onEnter: () => {
      gsap.to(embed, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power4.inOut' });
      gsap.to(panel, { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.55, ease: 'power3.out' });
    },
  });
}
