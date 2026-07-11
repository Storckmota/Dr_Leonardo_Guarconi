/* ============================================================================
   Deriva versões otimizadas do logo real (logo.jpg, raiz do projeto):
   - logo-full.webp  → lockup completo, margens aparadas, fundo transparente
   - logo-mark.webp  → somente o símbolo (dente + monograma), transparente
   O original é preservado. Nada é redesenhado: apenas corte de margens e
   remoção do fundo branco (luminância) para uso sobre claro e escuro.
   Uso: node scripts/prepare-logo.mjs
   ========================================================================== */

import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC = path.join(root, 'logo.jpg');
const OUT = (f) => path.join(root, 'public', 'images', f);

/* Converte fundo branco em alfa: alfa pleno abaixo de L=210, zero acima de
   L=247, rampa suave no meio (evita halo dos artefatos JPEG). */
async function whiteToAlpha(input) {
  const { data, info } = await input.raw().toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  const out = Buffer.alloc(px * 4);
  for (let i = 0; i < px; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    let a = 255;
    if (lum >= 247) a = 0;
    else if (lum > 210) a = Math.round(255 * (1 - (lum - 210) / 37));
    out[i * 4] = r;
    out[i * 4 + 1] = g;
    out[i * 4 + 2] = b;
    out[i * 4 + 3] = a;
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
}

/* Bounding box do conteúdo (pixels com luminância < 240) numa região. */
async function bbox(top, bottom) {
  const { data, info } = await sharp(SRC).greyscale().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, maxX = 0, minY = bottom, maxY = top;
  for (let y = top; y < bottom; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] < 240) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, maxX, minY, maxY };
}

async function exportCrop(name, box, pad) {
  const meta = await sharp(SRC).metadata();
  const left = Math.max(0, box.minX - pad);
  const top = Math.max(0, box.minY - pad);
  const width = Math.min(meta.width - left, box.maxX - box.minX + 1 + pad * 2);
  const height = Math.min(meta.height - top, box.maxY - box.minY + 1 + pad * 2);
  const crop = sharp(SRC).extract({ left, top, width, height });
  const img = await whiteToAlpha(crop);
  const info = await img.webp({ quality: 92, alphaQuality: 90 }).toFile(OUT(name));
  console.log(`${name}  ${width}x${height}  ${(info.size / 1024).toFixed(1)} KB`);
}

/* Lockup completo (símbolo + texto). Faixa de texto termina em y≈453. */
await exportCrop('logo-full.webp', await bbox(0, 584), 10);

/* Símbolo isolado: acima da linha em branco y[399..421] que separa o texto. */
await exportCrop('logo-mark.webp', await bbox(0, 399), 8);

console.log('OK');
