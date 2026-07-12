/* Auditoria de contraste WCAG dos tokens (OKLCH → sRGB → ratio). */

function oklchToSrgb(L, C, Hdeg) {
  const h = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const toGamma = (x) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * Math.max(x, 0) ** (1 / 2.4) - 0.055;
  return [toGamma(r), toGamma(g), toGamma(bl)].map((v) => Math.min(1, Math.max(0, v)));
}

function luminance([r, g, b]) {
  const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(fg, bg) {
  const l1 = luminance(fg), l2 = luminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const T = {
  porcelain:  [0.984, 0.003, 96],
  ivory:      [0.963, 0.006, 88],
  greige:     [0.916, 0.009, 86],
  mist:       [0.935, 0.008, 230],
  graphite:   [0.24, 0.012, 72],
  graphite2:  [0.185, 0.011, 74],
  umber:      [0.34, 0.044, 54],
  rust:       [0.42, 0.082, 43],
  ink:        [0.245, 0.012, 76],
  inkSoft:    [0.39, 0.014, 76],
  milk:       [0.968, 0.006, 92],
  milkSoft:   [0.855, 0.012, 90],
  copper:     [0.56, 0.104, 45],
  copperInk:  [0.465, 0.098, 45],
  goldThread: [0.78, 0.072, 84],
  goldSoft:   [0.87, 0.052, 88],
};

const rgb = Object.fromEntries(Object.entries(T).map(([k, v]) => [k, oklchToSrgb(...v)]));

const pairs = [
  ['ink @ porcelain (corpo)', 'ink', 'porcelain', 4.5],
  ['ink @ ivory (doutor)', 'ink', 'ivory', 4.5],
  ['ink @ greige (placas claras)', 'ink', 'greige', 4.5],
  ['ink @ mist (planos clinicos)', 'ink', 'mist', 4.5],
  ['inkSoft @ porcelain (secundário)', 'inkSoft', 'porcelain', 4.5],
  ['inkSoft @ ivory', 'inkSoft', 'ivory', 4.5],
  ['inkSoft @ greige', 'inkSoft', 'greige', 4.5],
  ['inkSoft @ mist', 'inkSoft', 'mist', 4.5],
  ['copperInk @ porcelain (acentos, kicker)', 'copperInk', 'porcelain', 4.5],
  ['copperInk @ ivory (anos marcos, display)', 'copperInk', 'ivory', 4.5],
  ['copperInk @ greige (nums placas, display)', 'copperInk', 'greige', 3],
  ['copper @ porcelain (itálicos display)', 'copper', 'porcelain', 3],
  ['milk @ graphite (corpo)', 'milk', 'graphite', 4.5],
  ['milk @ graphite2', 'milk', 'graphite2', 4.5],
  ['milk @ rust (placa)', 'milk', 'rust', 4.5],
  ['milkSoft @ graphite (secundário)', 'milkSoft', 'graphite', 4.5],
  ['milkSoft @ graphite2', 'milkSoft', 'graphite2', 4.5],
  ['goldThread @ graphite (labels/hud)', 'goldThread', 'graphite', 4.5],
  ['goldThread @ graphite2', 'goldThread', 'graphite2', 4.5],
  ['goldSoft @ graphite2 (itálico CTA final)', 'goldSoft', 'graphite2', 3],
  ['milk @ graphite btn (texto botão)', 'milk', 'graphite', 4.5],
];

let fail = 0;
for (const [label, fg, bg, min] of pairs) {
  const r = ratio(rgb[fg], rgb[bg]);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${r.toFixed(2).padStart(5)}  (min ${min})  ${label}`);
}
process.exitCode = fail ? 1 : 0;
