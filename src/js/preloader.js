/* Preloader: marca real + linha de carga. Aparece apenas na primeira visita
   da sessão (classe html.preloading vem do <head>), espera o retrato do hero
   decodificar (com teto de tempo) e entrega a página com um wipe. */

import { gsap } from './context.js';

export function runPreloader() {
  const root = document.documentElement;
  const el = document.querySelector('[data-preloader]');

  if (!root.classList.contains('preloading') || !el) {
    return Promise.resolve();
  }

  el.hidden = false;

  const mark = el.querySelector('.preloader-mark');
  const line = el.querySelector('[data-preloader-line]');
  const place = el.querySelector('.preloader-place');

  const heroImg = document.querySelector('.hero-media img');
  const imageReady = heroImg && heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve();
  const minTime = new Promise((r) => setTimeout(r, 950));
  const cap = new Promise((r) => setTimeout(r, 2400));

  const fill = line.appendChild(document.createElement('i'));

  gsap.set([mark, place], { autoAlpha: 0, y: 14 });
  gsap.timeline()
    .to(mark, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.05)
    .to(place, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.25)
    .to(fill, { scaleX: 0.75, duration: 1.6, ease: 'power2.inOut' }, 0.15);

  return Promise.race([Promise.all([imageReady, minTime]), cap]).then(
    () =>
      new Promise((resolve) => {
        try { sessionStorage.setItem('lg-seen', '1'); } catch (e) {}
        gsap.timeline({
          onComplete: () => {
            root.classList.remove('preloading');
            el.hidden = true;
          },
        })
          .to(fill, { scaleX: 1, duration: 0.28, ease: 'power2.in' })
          .to([mark, place, line], { autoAlpha: 0, y: -12, duration: 0.32, ease: 'power2.in' }, '<0.05')
          .to(el, {
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.7,
            ease: 'power4.inOut',
            onStart: resolve, /* hero entra sob o wipe */
          }, '>-0.05');
      })
  );
}
