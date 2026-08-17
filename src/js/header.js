/* ============================================================================
   HEADER
   ----------------------------------------------------------------------------
   Três estados, decididos pela seção que cruza a linha do topo e pela fase do
   hero:

     light   superfície clara  → tinta escura
     dark    superfície escura → tinta clara
     film    filme em tela cheia → tinta clara + véu de topo em gradiente

   `data-forced` é escrito por hero.js durante a expansão: o header troca de
   tinta ACOMPANHANDO o filme, sem esperar a próxima seção chegar ao topo.

   O estado compacto (fundo sólido em porcelana quente ou no escuro do sistema)
   só existe DEPOIS do hero. Sobre o hero o header é transparente — nada de
   faixa branca translúcida atravessando duas superfícies.

   Fora do hero o header ainda se esconde ao descer e reaparece ao subir, para
   devolver a tela inteira à leitura.
   ========================================================================== */

import { ScrollTrigger } from './context.js';

export function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const sections = [
    ...document.querySelectorAll('main > section[data-theme]'),
    ...document.querySelectorAll('footer'),
  ];
  const hero = document.querySelector('.hero');
  /* No mobile o filme é a PRIMEIRA DOBRA e a copy do hero vem na dobra
     seguinte, dentro da mesma seção. Quem decide o estado do header é a
     superfície sob a linha do topo, e essa superfície é a mídia — não a seção
     inteira: passada a dobra do filme, o header já está sobre porcelana e
     precisa da tinta escura e da faixa compacta, mesmo ainda dentro do hero. */
  const heroMedia = document.querySelector('[data-hero-media]');
  /* Acima disto o hero é a composição 50/50: logomarca sobre a porcelana e o
     bloco da direita sobre o filme. Abaixo, o filme é a faixa do alto e o
     header inteiro fica sobre ele. */
  const split = window.matchMedia('(min-width: 1024px)');

  let lastY = window.scrollY;

  const read = () => {
    const y = window.scrollY;
    const probe = Math.max(72, header.offsetHeight + 8);

    /* 1 · tema pela seção sob a linha do topo */
    let theme = 'light';
    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= probe && rect.bottom > probe) {
        theme = sec.dataset.theme || 'dark';
        break;
      }
    }

    /* No desktop a referência continua sendo a SEÇÃO: lá a mídia é absoluta
       dentro do palco fixado e o fim dela não é o fim do capítulo. Abaixo de
       1024 a referência é a dobra de filme. */
    const filmEl = (!split.matches && heroMedia) || hero;
    const heroBottom = filmEl ? filmEl.getBoundingClientRect().bottom : 0;
    const pastHero = heroBottom <= probe;

    /* 2 · sobre o hero o header tem estado próprio. `data-forced` (escrito por
       hero.js durante a expansão) só vale AQUI: fora do hero ele é ignorado,
       para que um valor obsoleto nunca deixe o véu de filme ligado sobre uma
       seção clara. */
    if (pastHero) header.dataset.on = theme;
    else header.dataset.on = header.dataset.forced || (split.matches ? 'split' : 'film');

    /* 3 · compacto só fora do hero */
    header.classList.toggle('is-compact', pastHero && y > 8);

    /* 4 · esconder ao descer / mostrar ao subir, nunca sobre o hero */
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (!pastHero || y < 120) header.classList.remove('is-hidden');
    else if (goingDown) header.classList.add('is-hidden');
    else if (goingUp) header.classList.remove('is-hidden');

    if (Math.abs(y - lastY) > 2) lastY = y;
  };

  read();

  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: read, onRefresh: read });
  split.addEventListener('change', read);

  header.addEventListener('lg:theme', read);
  window.addEventListener('scroll', read, { passive: true });
  window.addEventListener('resize', read);
  window.addEventListener('hashchange', () => requestAnimationFrame(read));
  window.addEventListener('load', read);
}
