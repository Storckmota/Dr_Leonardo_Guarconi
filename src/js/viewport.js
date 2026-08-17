/* ============================================================================
   LARGURA REAL DA VIEWPORT
   ----------------------------------------------------------------------------
   `100vw` inclui a barra de rolagem; `clientWidth` não. O grid global calcula
   o recuo externo a partir da largura da viewport, e essa diferença de ~15px
   no Windows faria os eixos das seções que rompem o container discordarem dos
   das seções contidas — exatamente o sintoma de "cada seção com um grid".

   `--vw` publica a largura real. O CSS já tem `100vw` como valor inicial, de
   modo que o layout está correto mesmo antes do JS rodar (e sem JS nenhum, em
   navegadores com barra sobreposta).
   ========================================================================== */

export function initViewport() {
  const root = document.documentElement;

  const set = () => {
    root.style.setProperty('--vw', `${root.clientWidth}px`);
  };

  set();
  window.addEventListener('resize', set);
  window.addEventListener('orientationchange', set);
  if ('ResizeObserver' in window) new ResizeObserver(set).observe(root);
}
