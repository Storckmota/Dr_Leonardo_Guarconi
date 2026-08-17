/* ============================================================================
   Dr. Leonardo Guarçoni — orquestração
   Funcional sempre (menu, header, tratamentos, mapa, âncoras, ano);
   coreografia (Lenis, preloader, hero, reveals, pin) apenas com motionOK.
   ========================================================================== */

import { motionOK, ScrollTrigger } from './js/context.js';
import { initSmooth } from './js/smooth.js';
import { initHeader } from './js/header.js';
import { initMenu } from './js/menu.js';
import { initTreatments } from './js/treatments.js';
import { initMapa } from './js/mapa.js';

import { runPreloader } from './js/preloader.js';
import { prepareHero, enterHero } from './js/hero.js';
import { initReveals } from './js/reveals.js';
import { initProcess } from './js/process.js';
import { initMedia } from './js/media.js';
import { initPrecision } from './js/precision.js';
import { initGridDebug } from './js/grid-debug.js';
import { initViewport } from './js/viewport.js';

initViewport(); /* precisa vir antes de qualquer medição de layout */
initSmooth();
initGridDebug();
initHeader();
initMenu();
initTreatments();
initMapa();

initMedia(); /* decide sozinho o que fazer sem motion */

if (motionOK) {
  prepareHero();
  initReveals();
  initProcess();
  initPrecision();
  runPreloader().then(enterHero);
} else {
  /* garante que o gate do preloader nunca esconda a página */
  document.documentElement.classList.remove('preloading');
  const pre = document.querySelector('[data-preloader]');
  if (pre) pre.hidden = true;
}

window.addEventListener('load', () => ScrollTrigger.refresh());

/* ============================================================================
   RESSINCRONIZAÇÃO DOS PINS QUANDO A PÁGINA MUDA DE ALTURA
   ----------------------------------------------------------------------------
   O acordeão de Tratamentos abre e fecha o corpo do item (`height: 0 ↔ auto`)
   sozinho, a cada poucos segundos, enquanto está na tela. Isso muda a ALTURA
   TOTAL do documento — e o ScrollTrigger só remede sozinho em resize da janela,
   nunca quando o conteúdo cresce ou encolhe.

   Consequência medida a 1366×768: as posições de início das seções fixadas
   abaixo (Precisão, método, Clínica) ficavam até ~70px defasadas. A Clínica
   entrava com uma zona morta no começo do percurso e o filete de progresso
   parava em 86% no fim da seção — o indicador de estado mentia sobre o quanto
   ainda faltava, que é justamente o que esta rodada foi corrigir.

   Um ResizeObserver no `body` com debounce resolve na origem, sem tocar no
   componente aprovado: quando a altura para de mudar, os gatilhos remedem.
   `ScrollTrigger.refresh()` preserva a posição de rolagem, então nada salta.
   ========================================================================== */
if (motionOK && 'ResizeObserver' in window) {
  let last = document.body.offsetHeight;
  let timer = 0;
  const ro = new ResizeObserver(() => {
    const h = document.body.offsetHeight;
    if (Math.abs(h - last) < 2) return;
    last = h;
    clearTimeout(timer);
    timer = setTimeout(() => ScrollTrigger.refresh(), 220);
  });
  ro.observe(document.body);
}

const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
