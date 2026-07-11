/* ============================================================================
   QA visual e funcional (dev-time): screenshots por viewport, erros de
   console, overflow horizontal e interações principais da v2.
   Uso: node scripts/qa.mjs [--full]   (requer `npm run preview` ativo)
   ========================================================================== */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = process.env.QA_OUT || path.join(root, 'qa-shots');
await mkdir(outDir, { recursive: true });

const BASE = 'http://localhost:4173/';
const viewports = [
  { name: 'm390', width: 390, height: 844, mobile: true },
  { name: 'm430', width: 430, height: 932, mobile: true },
  { name: 't768', width: 768, height: 1024, mobile: true },
  { name: 'd1024', width: 1024, height: 768, mobile: false },
  { name: 'd1440', width: 1440, height: 900, mobile: false },
  { name: 'd1920', width: 1920, height: 1080, mobile: false },
];

const browser = await chromium.launch();
const problems = [];

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`[console:${msg.type()}] ${vp.name}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`[pageerror] ${vp.name}: ${err.message}`));
  page.on('requestfailed', (req) =>
    problems.push(`[requestfailed] ${vp.name}: ${req.url()} ${req.failure()?.errorText}`)
  );

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3400); /* preloader + entrada do hero */

  const overflow = await page.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const bad = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width > 1 && (r.right > w + 1 || r.left < -1)) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed') continue;
        /* fantasmas e placas decorativas podem sangrar por design (overflow
           clip nos pais); reporta só se o pai não recorta */
        let p = el.parentElement, clipped = false;
        while (p && p !== document.body) {
          const pcs = getComputedStyle(p);
          if (/(hidden|clip)/.test(pcs.overflow + pcs.overflowX)) { clipped = true; break; }
          p = p.parentElement;
        }
        if (clipped) continue;
        bad.push(
          `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(r.right)} left=${Math.round(r.left)} vw=${w}`
        );
      }
    }
    return { scrollW: document.documentElement.scrollWidth, clientW: w, bad: bad.slice(0, 12) };
  });
  if (overflow.scrollW > overflow.clientW + 1) {
    problems.push(
      `[overflow] ${vp.name}: scrollWidth ${overflow.scrollW} > ${overflow.clientW}\n    ${overflow.bad.join('\n    ')}`
    );
  }

  await page.screenshot({ path: path.join(outDir, `${vp.name}-fold.png`) });

  if (process.argv.includes('--full')) {
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.66;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 200));
      }
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, `${vp.name}-full.png`), fullPage: true });
  }

  await ctx.close();
}

/* Interações mobile: menu, tratamentos, whatsapp */
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  page.on('pageerror', (err) => problems.push(`[pageerror] interações: ${err.message}`));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200);

  await page.click('[data-menu-toggle]');
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(outDir, 'menu-open.png') });
  if (!(await page.isVisible('.menu-link >> nth=0'))) problems.push('[menu] overlay não visível');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  if (await page.isVisible('.menu-link >> nth=0')) problems.push('[menu] Escape não fechou');

  await page.locator('#tratamentos').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.click('[data-tx-btn="4"]');
  await page.waitForTimeout(900);
  const b4 = await page.getAttribute('[data-tx-btn="4"]', 'aria-expanded');
  const body0Hidden = await page.isHidden('#tx-body-0');
  if (b4 !== 'true' || !body0Hidden) problems.push(`[tx] seleção não alternou (b4=${b4})`);
  const plate4 = await page.getAttribute('[data-tx-plate="4"]', 'data-active');
  if (plate4 === null) problems.push('[tx] placa ativa não sincronizou');
  await page.screenshot({ path: path.join(outDir, 'tx-mobile-active.png') });

  const wa = await page.getAttribute('.hero-actions a.btn-porcelain', 'href');
  if (!wa || !wa.startsWith('https://wa.me/5527998113025?text='))
    problems.push(`[wa] href inesperado: ${wa}`);

  const mapSrc = await page.getAttribute('.mapa-embed iframe[data-src]', 'src');
  if (mapSrc && !mapSrc.includes('output=embed')) problems.push('[mapa] src estranho: ' + mapSrc);

  await ctx.close();
}

/* Desktop: teclado nos tratamentos + pin do processo ativo */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (err) => problems.push(`[pageerror] desktop: ${err.message}`));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200);

  await page.locator('#tratamentos').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.click('[data-tx-btn="2"]');
  await page.waitForTimeout(500);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(600);
  const sel = await page.getAttribute('[data-tx-btn="3"]', 'aria-expanded');
  if (sel !== 'true') problems.push('[tx] ArrowDown não moveu seleção (desktop)');
  await page.locator('#tratamentos').screenshot({ path: path.join(outDir, 'tx-desktop.png') });

  const pinned = await page.evaluate(() => !!document.querySelector('.pin-spacer'));
  if (!pinned) problems.push('[processo] pin não criado no desktop');

  await ctx.close();
}

/* Reduced motion: conteúdo visível sem coreografia */
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  page.on('pageerror', (err) => problems.push(`[pageerror] reduced: ${err.message}`));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const heroVisible = await page.evaluate(() => {
    const el = document.querySelector('.hero-word');
    return el && getComputedStyle(el).opacity === '1' && !document.querySelector('[data-preloader]:not([hidden])');
  });
  if (!heroVisible) problems.push('[reduced] hero não visível de imediato');
  await page.screenshot({ path: path.join(outDir, 'reduced-fold.png') });
  await ctx.close();
}

await browser.close();

if (problems.length) {
  console.log('PROBLEMAS ENCONTRADOS:\n' + problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log('QA OK — nenhum problema detectado.');
}
console.log('Screenshots em: ' + outDir);
