/* ============================================================================
   Functional QA: console errors, horizontal overflow, core interactions,
   reduced motion and comparable screenshots. Requires `npm run preview`.
   ========================================================================== */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = process.env.QA_OUT || path.join(root, 'qa-shots');
await mkdir(outDir, { recursive: true });

const BASE = process.env.QA_BASE || 'http://localhost:4173/';
const viewports = [
  { name: 'm390', width: 390, height: 844, mobile: true },
  { name: 'm430', width: 430, height: 932, mobile: true },
  { name: 't768', width: 768, height: 1024, mobile: true },
  { name: 'd1024', width: 1024, height: 768, mobile: false },
  { name: 'd1280h720', width: 1280, height: 720, mobile: false },
  { name: 'd1366h768', width: 1366, height: 768, mobile: false },
  { name: 'd1440', width: 1440, height: 900, mobile: false },
  { name: 'd1920', width: 1920, height: 1080, mobile: false },
];

const browser = await chromium.launch();
const problems = [];

function listen(page, label) {
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      problems.push(`[console:${msg.type()}] ${label}: ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => problems.push(`[pageerror] ${label}: ${err.message}`));
  page.on('requestfailed', (req) => {
    if (req.url().includes('google.com/maps')) return;
    problems.push(`[requestfailed] ${label}: ${req.url()} ${req.failure()?.errorText}`);
  });
}

async function checkOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const bad = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || (r.right <= w + 1 && r.left >= -1)) continue;
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed') continue;
      let p = el.parentElement;
      let clipped = false;
      while (p && p !== document.body) {
        const pcs = getComputedStyle(p);
        if (/(hidden|clip)/.test(pcs.overflow + pcs.overflowX)) {
          clipped = true;
          break;
        }
        p = p.parentElement;
      }
      if (clipped) continue;
      bad.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} right=${Math.round(r.right)} left=${Math.round(r.left)} vw=${w}`);
    }
    return { scrollW: document.documentElement.scrollWidth, clientW: w, bad: bad.slice(0, 12) };
  });
  if (overflow.scrollW > overflow.clientW + 1) {
    problems.push(`[overflow] ${label}: scrollWidth ${overflow.scrollW} > ${overflow.clientW}\n    ${overflow.bad.join('\n    ')}`);
  }
}

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  listen(page, vp.name);

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3400);
  await checkOverflow(page, vp.name);
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

/* Mobile: menu, treatments, philosophy slider, whatsapp and map. */
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  listen(page, 'mobile-interactions');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200);

  await page.click('[data-menu-toggle]');
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(outDir, 'menu-open.png') });
  if (!(await page.isVisible('.menu-link >> nth=0'))) problems.push('[menu] overlay not visible');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  if (await page.isVisible('.menu-link >> nth=0')) problems.push('[menu] Escape did not close overlay');

  await page.locator('#tratamentos').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.click('[data-tx-btn="4"]');
  await page.waitForTimeout(900);
  const b4 = await page.getAttribute('[data-tx-btn="4"]', 'aria-expanded');
  const body0Hidden = await page.isHidden('#tx-body-0');
  if (b4 !== 'true' || !body0Hidden) problems.push(`[tx] selection did not toggle (b4=${b4})`);
  const plate4 = await page.getAttribute('[data-tx-plate="4"]', 'data-active');
  if (plate4 === null) problems.push('[tx] active plate did not sync');
  await page.screenshot({ path: path.join(outDir, 'tx-mobile-active.png') });

  await page.locator('#filosofia').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.click('[data-filosofia-next]');
  await page.waitForTimeout(500);
  const dot1 = await page.getAttribute('[data-filosofia-dot="1"]', 'aria-current');
  if (dot1 !== 'true') problems.push('[filosofia] next button did not activate card 02 on mobile');
  const activeCard = await page.getAttribute('[data-filosofia-card]:nth-child(2)', 'aria-current');
  if (activeCard !== 'true') problems.push('[filosofia] card 02 aria-current missing on mobile');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  const dot2 = await page.getAttribute('[data-filosofia-dot="2"]', 'aria-current');
  if (dot2 !== 'true') problems.push('[filosofia] keyboard did not activate card 03 on mobile');
  await page.screenshot({ path: path.join(outDir, 'filosofia-mobile-active.png') });

  const wa = await page.getAttribute('.hero-actions a.btn-solid', 'href');
  if (!wa || !wa.startsWith('https://wa.me/5527998113025?text=')) {
    problems.push(`[wa] unexpected href: ${wa}`);
  }

  const mapSrc = await page.getAttribute('.mapa-embed iframe[data-src]', 'src');
  if (mapSrc && !mapSrc.includes('output=embed')) problems.push('[mapa] unexpected src: ' + mapSrc);

  await ctx.close();
}

/* Desktop: treatment keyboard, process pin and philosophy drag/keyboard. */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  listen(page, 'desktop-interactions');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200);

  await page.locator('#tratamentos').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.click('[data-tx-btn="2"]');
  await page.waitForTimeout(500);
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(600);
  const sel = await page.getAttribute('[data-tx-btn="3"]', 'aria-expanded');
  if (sel !== 'true') problems.push('[tx] ArrowDown did not move desktop selection');
  await page.locator('#tratamentos').screenshot({ path: path.join(outDir, 'tx-desktop.png') });

  const pinned = await page.evaluate(() => !!document.querySelector('.pin-spacer'));
  if (!pinned) problems.push('[processo] desktop pin was not created');

  await page.locator('#filosofia').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.click('[data-filosofia-next]');
  await page.waitForTimeout(500);
  const p2 = await page.getAttribute('[data-filosofia-dot="1"]', 'aria-current');
  if (p2 !== 'true') problems.push('[filosofia] next button did not activate card 02 on desktop');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  const p3 = await page.getAttribute('[data-filosofia-dot="2"]', 'aria-current');
  if (p3 !== 'true') problems.push('[filosofia] keyboard did not activate card 03 on desktop');
  const box = await page.locator('[data-filosofia-viewport]').boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.28, box.y + box.height * 0.5, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(650);
  }
  await page.locator('#filosofia').screenshot({ path: path.join(outDir, 'filosofia-desktop-active.png') });

  await ctx.close();
}

/* Reduced motion: content visible and slider still navigable. */
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  listen(page, 'reduced-motion');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const heroVisible = await page.evaluate(() => {
    const el = document.querySelector('.hero-word');
    return el && getComputedStyle(el).opacity === '1' && !document.querySelector('[data-preloader]:not([hidden])');
  });
  if (!heroVisible) problems.push('[reduced] hero was not immediately visible');
  await page.locator('#filosofia').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.click('[data-filosofia-next]');
  await page.waitForTimeout(200);
  const reducedSlider = await page.getAttribute('[data-filosofia-dot="1"]', 'aria-current');
  if (reducedSlider !== 'true') problems.push('[reduced] philosophy slider did not navigate');
  await page.screenshot({ path: path.join(outDir, 'reduced-fold.png') });
  await ctx.close();
}

await browser.close();

if (problems.length) {
  console.log('PROBLEMS FOUND:\n' + problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log('QA OK - no problems detected.');
}
console.log('Screenshots in: ' + outDir);
