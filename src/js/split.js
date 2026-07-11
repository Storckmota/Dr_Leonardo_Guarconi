/* Split de títulos em linhas mascaradas (.sl > .sl-i).
   Preserva o texto para leitores de tela; <em>/<strong> viram spans com a
   classe .it (estilo preservado, estrutura achatada para permitir o
   agrupamento por linha). Guarda o HTML original para re-split no resize. */

export function splitLines(el) {
  if (!el.dataset.orig) el.dataset.orig = el.innerHTML;

  /* 1. achatar em palavras */
  const words = [];
  const collect = (node, italic) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        for (const w of child.textContent.split(/\s+/)) {
          if (w) words.push({ w, italic });
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        collect(child, italic || /^(em|i|strong)$/i.test(child.tagName));
      }
    }
  };
  collect(el, false);

  /* pontuação que virou token solto (após <em>) volta para a palavra anterior */
  for (let i = words.length - 1; i > 0; i--) {
    if (/^[,.;:!?…»)\]]+$/.test(words[i].w)) {
      words[i - 1].w += words[i].w;
      words.splice(i, 1);
    }
  }

  el.innerHTML = '';
  const spans = words.map(({ w, italic }, i) => {
    const s = document.createElement('span');
    s.className = 'w' + (italic ? ' it' : '');
    s.textContent = w;
    el.appendChild(s);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    return s;
  });

  /* 2. agrupar por linha medida */
  const lines = [];
  let current = null;
  let top = null;
  for (const s of spans) {
    const t = s.offsetTop;
    if (top === null || Math.abs(t - top) > 3) {
      current = [];
      lines.push(current);
      top = t;
    }
    current.push(s);
  }

  el.innerHTML = '';
  const inners = [];
  for (const line of lines) {
    const sl = document.createElement('span');
    sl.className = 'sl';
    const inner = document.createElement('span');
    inner.className = 'sl-i';
    inner.innerHTML = line
      .map((s) => `<span class="${s.className}">${s.textContent}</span>`)
      .join(' ');
    sl.appendChild(inner);
    el.appendChild(sl);
    inners.push(inner);
  }
  return inners;
}

export function unsplit(el) {
  if (el.dataset.orig) el.innerHTML = el.dataset.orig;
}
