/* ============================================================================
   REPRODUÇÃO DOS FILMES
   ----------------------------------------------------------------------------
   Base compartilhada — e só isso: escolha de variante, autoplay, observer,
   pausa/retomada por viewport e reduced motion. A COMPOSIÇÃO de cada capítulo
   é do CSS; aqui nada impõe proporção, moldura ou tamanho.

   Regras de reprodução:
   - todos em `muted`, `playsinline`, `loop` — nenhum filme termina e congela;
   - o hero carrega imediatamente (preload="auto") e já entra tocando;
   - os de baixo da dobra só pedem os bytes quando estão perto da viewport,
     então não disputam banda com o hero no carregamento inicial;
   - fora da viewport pausam (sem zerar) e retomam de onde pararam;
   - com prefers-reduced-motion nenhum arquivo é buscado: o poster do próprio
     <video> é a experiência inteira, no mesmo tamanho e no mesmo quadro.
   ========================================================================== */

import { motionOK } from './context.js';

/* Acima disso o site usa as composições de desktop, que pedem o mestre grande. */
const WIDE = '(min-width: 1024px)';

/* Distância em que os bytes começam a chegar: ~1 tela antes de aparecer. */
const PRELOAD_MARGIN = '100% 0px 100% 0px';

/* Toca a partir de 20% visível; pausa quando some de vez. */
const PLAY_IN = 0.2;

export function initMedia() {
  const blocks = Array.from(document.querySelectorAll('[data-mv]'));
  if (!blocks.length) return;

  const variant = window.matchMedia(WIDE).matches ? 'desktop' : 'mobile';

  /* Sem motion: nenhum vídeo é baixado. O poster fica. */
  if (!motionOK) return;

  const hasIO = 'IntersectionObserver' in window;
  const live = [];

  for (const block of blocks) {
    const video = block.querySelector('[data-mv-video]');
    if (!video) continue;

    const entry = { block, video, name: block.dataset.mvName, variant, wired: false };
    live.push(entry);

    if ('mvEager' in block.dataset || !hasIO) {
      attach(entry);
      tryPlay(entry);
    }
  }

  if (!hasIO) return;

  /* 1) Buscar os bytes cedo, mas não cedo demais. */
  const loader = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        loader.unobserve(e.target);
        const item = live.find((l) => l.block === e.target);
        if (item) attach(item);
      }
    },
    { rootMargin: PRELOAD_MARGIN }
  );

  /* 2) Tocar e pausar conforme entra e sai da tela. */
  const player = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const item = live.find((l) => l.block === e.target);
        if (!item) continue;
        if (e.isIntersecting) {
          attach(item);
          tryPlay(item);
        } else {
          /* pause() e não load(): o filme retoma de onde parou. */
          item.video.pause();
        }
      }
    },
    { threshold: PLAY_IN }
  );

  for (const item of live) {
    if (!item.wired) loader.observe(item.block);
    player.observe(item.block);
  }

  /* Aba escondida não gasta decodificação. Ao voltar, quem está na tela volta. */
  document.addEventListener('visibilitychange', () => {
    for (const item of live) {
      if (document.hidden) item.video.pause();
      else if (isOnScreen(item.block)) tryPlay(item);
    }
  });
}

function attach(item) {
  if (item.wired) return;
  item.wired = true;

  const { video, name, variant } = item;
  const base = `/videos/${name}-${variant}`;

  /* WebM primeiro (menor); o MP4 H.264 cobre Safari e o resto. */
  for (const [ext, type] of [['webm', 'video/webm'], ['mp4', 'video/mp4']]) {
    const source = document.createElement('source');
    source.src = `${base}.${ext}`;
    source.type = type;
    video.appendChild(source);
  }

  if (video.preload === 'none') video.preload = 'metadata';
  video.load();
}

function tryPlay(item) {
  const { video } = item;
  if (!video.paused) return;
  const p = video.play();
  if (p && typeof p.catch === 'function') {
    /* Autoplay recusado: o poster segue no lugar, no mesmo tamanho. */
    p.catch(() => {});
  }
}

function isOnScreen(el) {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight;
}
