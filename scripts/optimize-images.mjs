/* ============================================================================
   Otimização de imagens: assets-src/ → public/images/ (WebP + OG JPEG)
   Uso: npm run images
   Observação: derivados do logo ficam em scripts/prepare-logo.mjs.
   ========================================================================== */

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = (f) => path.join(root, 'assets-src', f);
const out = (f) => path.join(root, 'public', 'images', f);

await mkdir(path.join(root, 'public', 'images'), { recursive: true });

const jobs = [
  { from: 'retrato-01.png', to: 'retrato-01.webp', webp: { quality: 82 } },
  { from: 'retrato-02.png', to: 'retrato-02.webp', webp: { quality: 82 } },
];

for (const job of jobs) {
  const image = sharp(src(job.from));
  const meta = await image.metadata();
  const info = await image.webp(job.webp).toFile(out(job.to));
  console.log(
    `${job.from} (${meta.width}x${meta.height}) → ${job.to}  ${(info.size / 1024).toFixed(1)} KB`
  );
}

/* Open Graph: JPEG (compatibilidade com WhatsApp/redes) */
const og = await sharp(src('retrato-01.png')).jpeg({ quality: 84, mozjpeg: true }).toFile(out('retrato-01-og.jpg'));
console.log(`retrato-01.png → retrato-01-og.jpg  ${(og.size / 1024).toFixed(1)} KB`);

console.log('OK');
