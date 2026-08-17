/* ============================================================================
   CAP. 06 · PRECISÃO — painel alto que ganha presença
   ----------------------------------------------------------------------------
   O painel do filme ocupa a faixa das colunas 1–7 e começa recortado em 5 pela
   LARGURA. Durante a seção fixada essa largura cresce até as 7 colunas cheias.

   Diferenças deliberadas em relação ao hero:
     · a janela é sempre mais alta que larga — nunca vira faixa panorâmica;
     · o painel nunca toma a tela: ele continua sendo um elemento da página;
     · a copy NÃO sai nem é coberta. Ela fica nas 5 colunas da direita o tempo
       todo; o que muda é o espaço negativo entre os dois, que se fecha;
     · a superfície do capítulo é clara do começo ao fim.

   A largura inicial é medida no grid resolvido (soma das 5 primeiras trilhas
   mais 4 vãos, sobre a soma das 7 primeiras mais 6 vãos), então o recorte cai
   exatamente sobre a linha da coluna 5 em qualquer largura de tela.
   ========================================================================== */

import { gsap, ScrollTrigger } from './context.js';

const START_COLS = 5;
const END_COLS = 7;

function startRatio(stage) {
  const cs = getComputedStyle(stage);
  const tracks = cs.gridTemplateColumns.split(' ').map(parseFloat).filter((n) => !Number.isNaN(n));
  const gap = parseFloat(cs.columnGap) || 0;
  if (tracks.length < END_COLS) return 0.615;
  const sum = (n) => tracks.slice(0, n).reduce((a, b) => a + b, 0) + gap * (n - 1);
  return sum(START_COLS) / sum(END_COLS);
}

export function initPrecision() {
  const runway = document.querySelector('[data-work-runway]');
  const stage = document.querySelector('[data-work-stage]');
  const media = document.querySelector('[data-work-media]');
  if (!runway || !stage || !media) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 1024px)', () => {
    const set = () => gsap.set(media, { width: `${startRatio(stage) * 100}%` });
    set();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: runway,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefreshInit: () => gsap.set(media, { clearProps: 'width' }),
        onRefresh: set,
      },
    });

    tl
      /* uma grandeza, monotônica — como no hero, mas com destino diferente:
         7 colunas, não a viewport */
      .fromTo(
        media,
        { width: () => `${startRatio(stage) * 100}%` },
        { width: '100%', duration: 0.72, ease: 'power2.inOut' },
        0
      )
      /* o assunto cresce junto: a janela alta revela mais cena lateral e o
         ponto focal sobe de leve para não perder as mãos */
      .to(media.querySelector('.mv'), { '--mv-y': '22%', duration: 0.72, ease: 'none' }, 0)
      .to({}, { duration: 0.28 }, 0.72);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.set([media, media.querySelector('.mv')], { clearProps: 'width,--mv-y' });
    };
  });
}
