/* ============================================================================
   QA visual e funcional (dev-time): screenshots por viewport, erros de
   console, overflow horizontal e interações principais.
   Uso: node scripts/qa.mjs [--full]
   Requer: npm run preview rodando em http://localhost:4173
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
  { name: 'd1280', width: 1280, height: 800, mobile: false },
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
  await page.waitForTimeout(1500);

  const overflow = await page.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const bad = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width > 1 && (r.right > w + 1 || r.left < -1)) {
        const cs = getComputedStyle(el);
        if (cs.position === 'fixed') continue;
        bad.push(
          `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(r.right)} left=${Math.round(r.left)}`
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

  // dobra
  await page.screenshot({ path: path.join(outDir, `${vp.name}-fold.png`) });

  if (process.argv.includes('--full')) {
    await page.evaluate(async () => {
      // rolagem para disparar reveals antes do screenshot full
      const step = window.innerHeight * 0.8;
      for (let y = 0; y <= document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 400));
    });
    await page.screenshot({ path: path.join(outDir, `${vp.name}-full.png`), fullPage: true });
  }

  await ctx.close();
}

/* Interações em mobile: menu e tabs */
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

  await page.click('[data-menu-toggle]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'menu-open.png') });
  const menuVisible = await page.isVisible('.menu-link >> nth=0');
  if (!menuVisible) problems.push('[menu] overlay não visível após toggle');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  if (await page.isVisible('.menu-link >> nth=0')) problems.push('[menu] Escape não fechou');

  // tabs de tratamentos
  await page.click('[data-tx-tab="4"]');
  await page.waitForTimeout(700);
  const p4visible = await page.isVisible('#tx-panel-4');
  const p0hidden = await page.isHidden('#tx-panel-0');
  if (!p4visible || !p0hidden) problems.push('[tx] seleção de tab não alternou painéis');
  await page.screenshot({ path: path.join(outDir, 'tx-mobile-active.png') });

  // link do whatsapp
  const wa = await page.getAttribute('.hero-actions a.btn-solid', 'href');
  if (!wa || !wa.startsWith('https://wa.me/5527998113025?text='))
    problems.push(`[wa] href inesperado: ${wa}`);

  await ctx.close();
}

/* Interação desktop: painel tx + teclado */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (err) => problems.push(`[pageerror] desktop: ${err.message}`));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.click('[data-tx-tab="2"]');
  await page.waitForTimeout(500);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(400);
  const sel = await page.getAttribute('[data-tx-tab="3"]', 'aria-selected');
  if (sel !== 'true') problems.push('[tx] ArrowDown não moveu seleção (desktop)');
  const shot = page.locator('#tratamentos');
  await shot.screenshot({ path: path.join(outDir, 'tx-desktop.png') });
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
