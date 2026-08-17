/* ============================================================================
   ONDE ESTAMOS — revelação do cartão
   ----------------------------------------------------------------------------
   CAUSA DO MAPA VAZIO (corrigida)
   Este módulo procurava `[data-mapa-shell]`, um atributo que NÃO existia no
   index.html — a seção só tinha `[data-mapa-embed]` e `[data-mapa-panel]`.
   O `if (!shell) return` na primeira linha abortava o módulo inteiro, e o
   iframe carregava seu endereço de `data-src` por JS: sem o módulo, `src`
   nunca era escrito e o navegador renderizava um iframe vazio. Como o embed
   existia no DOM e o container tinha altura, nada denunciava a falha — a área
   simplesmente ficava bege.

   Agora o `src` é estático no HTML e o adiamento é do `loading="lazy"` nativo:
   o mapa não depende mais de JS nenhum para aparecer.

   O que sobrou aqui é SÓ a revelação, e ela é reversível por construção: os
   `from()` animam A PARTIR de um estado até o estado que já está no DOM. Se o
   gatilho nunca disparar — sem motion, erro em outro módulo, refresh no meio
   da página — o mapa e o cartão permanecem visíveis. Nenhum estado inicial
   escondido é escrito fora do próprio gatilho.
   ========================================================================== */

import { gsap, ScrollTrigger, motionOK } from './context.js';

export function initMapa() {
  const shell = document.querySelector('[data-mapa-shell]');
  if (!shell || !motionOK) return;

  const embed = shell.querySelector('[data-mapa-embed]');
  const panel = shell.querySelector('[data-mapa-panel]');

  ScrollTrigger.create({
    trigger: shell,
    start: 'top 74%',
    once: true,
    onEnter: () => {
      if (embed) {
        gsap.from(embed, {
          clipPath: 'inset(6% 6% 6% 6%)',
          duration: 1.2,
          ease: 'power4.inOut',
          clearProps: 'clipPath',
        });
      }
      if (panel) {
        gsap.from(panel, {
          autoAlpha: 0,
          y: 40,
          duration: 0.8,
          delay: 0.35,
          ease: 'power3.out',
          clearProps: 'opacity,visibility,transform',
        });
      }
    },
  });
}
