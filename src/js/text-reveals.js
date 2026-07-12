/* SplitText responsivo para headlines. Conteúdo permanece visível sem JS;
   este módulo só reorganiza linhas quando motion está permitido. */

import { SplitText } from 'gsap/SplitText';
import { gsap, ScrollTrigger, motionOK } from './context.js';

gsap.registerPlugin(SplitText, ScrollTrigger);

const PRIMARY_SELECTOR = [
  '.missao-title',
  '.tx-title',
  '.processo-title',
  '.doutor-title',
  '.filosofia-title',
  '.final-title',
].join(', ');

const SCRUB_SELECTOR = [
  '.missao-title',
  '.tx-title',
  '.processo-title',
  '.filosofia-title',
  '.final-title',
].join(', ');

/* Nota: os títulos dos cards da filosofia NÃO entram aqui. Eles vivem num
   slider horizontal (cards fora da tela lateral), onde um reveal por rolagem
   vertical nunca dispararia; a entrada deles é conduzida pelo próprio slider. */
const SECONDARY_SELECTOR = [
  '.passo-titulo',
  '.marco-titulo',
  '.mapa-title',
].join(', ');

export async function initTextReveals() {
  if (!motionOK) return;

  if (document.fonts?.ready) await document.fonts.ready;

  gsap.utils.toArray('[data-split]').forEach((el) => {
    const primary = el.matches(PRIMARY_SELECTOR);
    const scrubbed = el.matches(SCRUB_SELECTOR);
    const secondary = el.matches(SECONDARY_SELECTOR) && !primary;

    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit: (instance) => {
        const lines = instance.lines;
        if (!lines.length) return null;

        if (scrubbed) {
          return gsap.from(lines, {
            yPercent: window.innerWidth < 768 ? 42 : 58,
            autoAlpha: 0.12,
            stagger: 0.028,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              end: 'bottom 58%',
              scrub: 0.28,
            },
          });
        }

        /* Reveal binário (once) disparado por IntersectionObserver em vez de
           um ScrollTrigger `once`: o IO é acionado pelo próprio navegador em
           qualquer velocidade de rolagem, inclusive saltos instantâneos e
           âncoras. Assim o texto nunca fica preso invisível caso o gatilho de
           scroll seja pulado (garantia exigida em "scroll rápido"). */
        const tween = gsap.from(lines, {
          yPercent: secondary ? 70 : 58,
          autoAlpha: 0,
          duration: secondary ? 0.72 : 0.78,
          ease: 'power3.out',
          stagger: secondary ? 0.04 : 0.032,
          paused: true,
        });

        if (el._lgRevealIO) el._lgRevealIO.disconnect();
        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              tween.play();
              io.disconnect();
              el._lgRevealIO = null;
            }
          },
          { rootMargin: '0px 0px -12% 0px' }
        );
        io.observe(el);
        el._lgRevealIO = io;

        return tween;
      },
    });
  });
}
