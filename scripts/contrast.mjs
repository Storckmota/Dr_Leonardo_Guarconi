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
  ivory:      [0.962, 0.011, 84],
  ivoryDeep:  [0.938, 0.015, 82],
  porcelain:  [0.982, 0.006, 90],
  espresso:   [0.245, 0.021, 55],
  espresso2:  [0.21, 0.019, 52],
  ink:        [0.245, 0.021, 55],
  inkSoft:    [0.41, 0.028, 55],
  milk:       [0.965, 0.009, 84],
  milkSoft:   [0.84, 0.018, 78],
  copper:     [0.56, 0.104, 45],
  copperInk:  [0.465, 0.098, 45],
  goldThread: [0.78, 0.072, 84],
};

const rgb = Object.fromEntries(Object.entries(T).map(([k, v]) => [k, oklchToSrgb(...v)]));

const pairs = [
  ['ink @ ivory (corpo)', 'ink', 'ivory', 4.5],
  ['ink @ ivoryDeep (corpo)', 'ink', 'ivoryDeep', 4.5],
  ['inkSoft @ ivory (corpo secundário)', 'inkSoft', 'ivory', 4.5],
  ['inkSoft @ ivoryDeep', 'inkSoft', 'ivoryDeep', 4.5],
  ['inkSoft @ porcelain', 'inkSoft', 'porcelain', 4.5],
  ['copperInk @ ivory (texto pequeno)', 'copperInk', 'ivory', 4.5],
  ['copperInk @ ivoryDeep (tx-num)', 'copperInk', 'ivoryDeep', 4.5],
  ['copperInk @ porcelain', 'copperInk', 'porcelain', 4.5],
  ['copper @ ivory (display grande ≥24px)', 'copper', 'ivory', 3],
  ['milk @ espresso (corpo)', 'milk', 'espresso', 4.5],
  ['milkSoft @ espresso (secundário)', 'milkSoft', 'espresso', 4.5],
  ['milkSoft @ espresso2 (footer)', 'milkSoft', 'espresso2', 4.5],
  ['goldThread @ espresso (labels/anos)', 'goldThread', 'espresso', 4.5],
  ['goldThread @ espresso2', 'goldThread', 'espresso2', 4.5],
  ['milk @ espresso btn (texto botão)', 'milk', 'espresso', 4.5],
];

let fail = 0;
for (const [label, fg, bg, min] of pairs) {
  const r = ratio(rgb[fg], rgb[bg]);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(`${ok ? 'OK  ' : 'FAIL'}  ${r.toFixed(2).padStart(5)}  (min ${min})  ${label}`);
}
process.exitCode = fail ? 1 : 0;
