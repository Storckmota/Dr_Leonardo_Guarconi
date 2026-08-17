/* ============================================================================
   OVERLAY DE DEBUG DO GRID — ferramenta de validação, não de produção
   ----------------------------------------------------------------------------
   Desenha as colunas reais do grid global sobre a página, usando o MESMO
   container, gutter e gap (lidos dos custom properties resolvidos), para
   conferir que logomarca, navegação, labels, títulos, parágrafos, CTAs,
   cards, mídias, linha do tempo, mapa e footer nascem nos mesmos eixos.

   Ligar:  tecla "g", `?grid=1` na URL, ou
           document.documentElement.classList.toggle('debug-grid')

   Fica desligado por padrão. Nada é criado até alguém pedir.
   ========================================================================== */

let overlay = null;

function build() {
  const cs = getComputedStyle(document.documentElement);
  const cols = Number(cs.getPropertyValue('--grid-cols').trim()) || 4;

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'grid grid-debug';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = '';
  for (let i = 0; i < cols; i++) overlay.appendChild(document.createElement('i'));

  const tag = document.createElement('b');
  const g = cs.getPropertyValue('--grid-gutter').trim();
  const gap = cs.getPropertyValue('--grid-gap').trim();
  tag.textContent = `${cols} col · gutter ${g} · gap ${gap} · ${document.documentElement.clientWidth}px`;
  overlay.appendChild(tag);
}

function sync() {
  const on = document.documentElement.classList.contains('debug-grid');
  if (on) build();
  else if (overlay) {
    overlay.remove();
    overlay = null;
  }
}

export function initGridDebug() {
  if (new URLSearchParams(location.search).has('grid')) {
    document.documentElement.classList.add('debug-grid');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'g' && e.key !== 'G') return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && /^(input|textarea|select)$/i.test(t.tagName)) return;
    document.documentElement.classList.toggle('debug-grid');
    sync();
  });

  window.addEventListener('resize', () => {
    if (document.documentElement.classList.contains('debug-grid')) build();
  });

  /* Permite que o harness de QA ligue o overlay depois do boot. */
  window.__gridDebug = sync;
  sync();
}
