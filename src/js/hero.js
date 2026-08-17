/* ============================================================================
   HERO AUDIOVISUAL
   ----------------------------------------------------------------------------
   ENTRADA
   A superfície abre da borda direita e a tipografia sobe por baixo de uma
   máscara. As duas coisas acontecem em elementos SEPARADOS do que o scrub
   anima — era a sobreposição de um clip-path de entrada com a largura animada
   pela rolagem que fazia o filme sumir por alguns quadros e reentrar pela
   direita. Se a página já estiver rolada, a entrada é pulada, não reproduzida.

   ROLAGEM (só no desktop)
   O palco fica fixo por ~120svh e a mídia CRESCE de 50vw para 100vw.

     .hero-media { top: 0; bottom: 0; right: 0; width: W }
     W: 50% → 100%

   Uma única grandeza monotônica. O lado direito está ancorado em `right: 0`,
   então `left` é sempre 100% − W: não existe faixa branca, salto, reentrada
   lateral nem frame mais estreito que o inicial. A rolagem continua nativa —
   `position: sticky` com um scrub em cima, sem scroll-jacking.

   O crescimento termina em 60% do percurso; os 40% restantes são a PERMANÊNCIA
   em tela cheia (~48svh), antes de a Missão entrar.
   ========================================================================== */

import { gsap, ScrollTrigger } from './context.js';

/* Fração do percurso fixado em que a mídia chega a 100vw. O resto é hold. */
const GROWTH_END = 0.6;

let els = null;
let entered = false;

export function prepareHero() {
  els = {
    section: document.querySelector('.hero'),
    runway: document.querySelector('[data-hero-runway]'),
    stage: document.querySelector('[data-hero-stage]'),
    media: document.querySelector('[data-hero-media]'),
    reveal: document.querySelector('[data-hero-reveal]'),
    mv: document.querySelector('[data-hero-media] .mv'),
    signature: document.querySelector('.hero-media-signature'),
    title: document.querySelector('.hero-title'),
    label: document.querySelector('[data-hero-label]'),
    words: gsap.utils.toArray('[data-hero-word]'),
    foot: document.querySelector('[data-hero-foot]'),
    copy: document.querySelector('[data-hero-copy]'),
    header: document.querySelector('[data-header]'),
  };
  if (!els.section) return;

  /* Máscara temporária do título: aplicada agora, removida quando as palavras
     terminam de subir. Nunca fica no CSS — foi um `overflow: hidden` fixo que
     fatiou "Odontologia" quando o tipo passou da largura da coluna. */
  if (els.title) els.title.style.overflow = 'hidden';

  gsap.set(els.reveal, { clipPath: 'inset(0% 0% 0% 100%)' });
  gsap.set(els.label, { autoAlpha: 0, y: 18 });
  gsap.set(els.words, { yPercent: 112 });
  gsap.set(els.foot, { autoAlpha: 0, y: 24 });
  if (els.signature) gsap.set(els.signature, { autoAlpha: 0 });
}

function clearEntrance() {
  if (!els) return;
  gsap.set(els.reveal, { clipPath: 'none' });
  gsap.set([els.label, els.foot], { clearProps: 'opacity,visibility,transform' });
  gsap.set(els.words, { clearProps: 'transform' });
  if (els.signature) gsap.set(els.signature, { autoAlpha: 1 });
  if (els.title) els.title.style.overflow = '';
}

export function enterHero() {
  if (!els || !els.section || entered) return;
  entered = true;

  /* Reload no meio da página, âncora ou volta do histórico: a entrada não
     acontece — ela existe só para quem chega no topo. */
  if (window.scrollY > 4) {
    clearEntrance();
  } else {
    gsap
      .timeline({ defaults: { ease: 'power4.out' }, onComplete: clearEntrance })
      .to(els.reveal, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power4.inOut' }, 0)
      .to(els.label, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.5)
      .to(els.words, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.14 }, 0.58)
      .to(els.foot, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.05)
      .to(els.signature, { autoAlpha: 1, duration: 0.9 }, 1.1);
  }

  /* A coreografia de rolagem só existe onde a composição 50/50 existe. */
  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    /* ESTADO INICIAL EXPLÍCITO = PROGRESSO 0 DA TIMELINE.
       Toda grandeza que o scrub anima é fixada aqui, com o MESMO valor que o
       CSS declara, antes de qualquer medição. Enquanto isso não era feito para
       `--mv-y`, a leitura do valor de partida ficava por conta do CSSPlugin —
       e uma custom property chega a ele como string, não como número
       resolvido. Era essa divergência (com `--mv-gutter: clamp(...)`, que o
       plugin não sabia ler) que abria a faixa escura entre texto e filme no
       carregamento e a fechava no primeiro tick da rolagem. */
    gsap.set(els.media, { width: '50%' });
    gsap.set(els.mv, { '--mv-y': '46%' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: els.runway,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => setHeaderPhase(self.progress),
        onRefresh: (self) => setHeaderPhase(self.progress),
      },
    });

    tl
      /* A ÚNICA grandeza animada da geometria: cresce e nunca recua.
         `power2.in` mantém o avanço lento enquanto o texto ainda está na tela
         e acelera depois — a curva é crescente em todo o intervalo, então a
         monotonicidade continua garantida. */
      .to(els.media, { width: '100%', duration: GROWTH_END, ease: 'power2.in' }, 0)
      /* Enquadramento: ao virar paisagem, a janela sobe um pouco para manter
         os rostos dentro do quadro. Não é zoom — o vídeo não escala. */
      .to(els.mv, { '--mv-y': '38%', duration: GROWTH_END, ease: 'none' }, 0)
      /* O texto cede o lugar ANTES de ser coberto: sai pela esquerda e some
         enquanto o filme ainda ocupa pouco mais da metade da tela. */
      .to(els.copy, { xPercent: -5, duration: 0.3, ease: 'none' }, 0.06)
      .to(els.copy, { autoAlpha: 0, duration: 0.26, ease: 'none' }, 0.08)
      /* Permanência: nada se move entre GROWTH_END e 1. */
      .to({}, { duration: 1 - GROWTH_END }, GROWTH_END);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set([els.media, els.copy, els.mv], {
        clearProps: 'width,opacity,visibility,transform,--mv-y',
      });
      if (els.header) delete els.header.dataset.forced;
    };
  });
}

/* O header acompanha a expansão: some a tinta escura quando o filme toma a
   tela, sem esperar a próxima seção cruzar a linha do topo. */
function setHeaderPhase(progress) {
  if (!els?.header) return;
  if (progress > 0.42) els.header.dataset.forced = 'film';
  else delete els.header.dataset.forced;
  els.header.dispatchEvent(new CustomEvent('lg:theme'));
}

/* Sem motion: nada foi escondido, nada a restaurar. */
export function heroStatic() {}

export function refreshAfterHero() {
  ScrollTrigger.refresh();
}
