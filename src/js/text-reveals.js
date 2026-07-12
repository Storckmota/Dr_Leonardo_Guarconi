/* SplitText responsivo para headlines. Conteúdo permanece visível sem JS;
   este módulo só reorganiza linhas quando motion está permitido. */

import { SplitText } from 'gsap/SplitText';
import { gsap, ScrollTrigger, motionOK } from './context.js';

gsap.registerPlugin(SplitText, ScrollTrigger);

const MAIN_SELECTOR = '.missao-title, .filosofia-title';
const SECONDARY_SELECTOR = '.credo-line, .doutor-title, .tx-title, .processo-title, .final-title';

export async function initTextReveals() {
  if (!motionOK) return;

  if (document.fonts?.ready) await document.fonts.ready;

  gsap.utils.toArray('[data-split]').forEach((el) => {
    const scrubbed = el.matches(MAIN_SELECTOR);
    const secondary = el.matches(SECONDARY_SELECTOR) && !scrubbed;

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
            yPercent: window.innerWidth < 768 ? 54 : 72,
            autoAlpha: 0.18,
            stagger: 0.035,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              end: 'bottom 54%',
              scrub: 0.35,
            },
          });
        }

        return gsap.from(lines, {
          yPercent: secondary ? 92 : 76,
          autoAlpha: 0,
          duration: secondary ? 0.9 : 0.75,
          ease: 'power3.out',
          stagger: secondary ? 0.055 : 0.04,
          scrollTrigger: {
            trigger: el,
            start: 'top 84%',
            once: true,
          },
        });
      },
    });
  });
}
