/* Header: estado de rolagem + tema pela secao que cruza a linha do topo.
   Evita estados obsoletos em anchors, reload no meio da pagina e resize. */

import { ScrollTrigger } from './context.js';

export function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const sections = [
    ...document.querySelectorAll('main > section[data-theme]'),
    ...document.querySelectorAll('footer'),
  ];

  const readTheme = () => {
    const probe = Math.max(72, header.offsetHeight + 8);
    let theme = 'light';

    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= probe && rect.bottom > probe) {
        theme = sec.dataset.theme || 'dark';
        break;
      }
    }

    header.dataset.on = theme;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };

  header.dataset.on = 'light';
  readTheme();

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: readTheme,
    onRefresh: readTheme,
  });

  window.addEventListener('scroll', readTheme, { passive: true });
  window.addEventListener('resize', readTheme);
  window.addEventListener('hashchange', () => requestAnimationFrame(readTheme));
  window.addEventListener('load', readTheme);
}
