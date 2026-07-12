/* Header: estado de rolagem + tema conforme o capítulo sob o topo.
   ScrollTrigger é usado apenas como observador (funciona também com
   prefers-reduced-motion: nenhum tween aqui). */

import { ScrollTrigger } from './context.js';

export function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  header.dataset.on = 'light'; /* a página abre no hero claro */

  ScrollTrigger.create({
    start: 8,
    onEnter: () => header.classList.add('is-scrolled'),
    onLeaveBack: () => header.classList.remove('is-scrolled'),
  });

  document.querySelectorAll('main > section[data-theme]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 4.5rem',
      end: 'bottom 4.5rem',
      onToggle: (self) => {
        if (self.isActive) header.dataset.on = sec.dataset.theme;
      },
    });
  });

  /* footer é escuro */
  const footer = document.querySelector('.footer');
  if (footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: 'top 4.5rem',
      end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive) header.dataset.on = 'dark';
      },
    });
  }
}
