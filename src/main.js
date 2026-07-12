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
import { initPhilosophySlider } from './js/philosophy-slider.js';
import { runPreloader } from './js/preloader.js';
import { prepareHero, enterHero } from './js/hero.js';
import { initReveals } from './js/reveals.js';
import { initProcess } from './js/process.js';

initSmooth();
initHeader();
initMenu();
initTreatments();
initMapa();
initPhilosophySlider();

if (motionOK) {
  prepareHero();
  initReveals();
  initProcess();
  runPreloader().then(enterHero);
} else {
  /* garante que o gate do preloader nunca esconda a página */
  document.documentElement.classList.remove('preloading');
  const pre = document.querySelector('[data-preloader]');
  if (pre) pre.hidden = true;
}

window.addEventListener('load', () => ScrollTrigger.refresh());

const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
