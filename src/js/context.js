/* Contexto compartilhado: GSAP registrado, flags de motion e breakpoints. */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* `motion` = a classe foi posta pelo script do <head> e nada mudou desde então. */
export const motionOK = document.documentElement.classList.contains('motion') && !reduceMotion;

export const mqDesktop = window.matchMedia('(min-width: 1024px)');
export const mqStage = window.matchMedia('(min-width: 1080px)');

export { gsap, ScrollTrigger };
