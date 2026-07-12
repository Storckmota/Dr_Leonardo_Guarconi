import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const out = process.env.QA_OUT || 'qa-shots';
const base = process.env.QA_BASE || 'http://localhost:4173/';
await mkdir(out, { recursive: true });

const browser = await chromium.launch();

async function settle(page, ms = 420) {
  await page.waitForTimeout(ms);
}

async function gotoSection(page, selector, offset = 96) {
  await page.evaluate(({ selector, offset }) => {
    document.activeElement?.blur();
    const target = document.querySelector(selector);
    if (!target) return;
    const y = window.scrollY + target.getBoundingClientRect().top - offset;
    window.scrollTo(0, Math.max(0, y));
  }, { selector, offset });
  await settle(page);
}

async function capture(locator, file) {
  try {
    await locator.screenshot({ path: path.join(out, file) });
  } catch (error) {
    console.log('skip', file, error.message.split('\n')[0]);
  }
}

async function openPage(vp, extra = {}) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
    deviceScaleFactor: 1,
    ...extra,
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await settle(page, extra.reducedMotion ? 800 : 3400);
  return { ctx, page };
}

for (const vp of [
  { name: 'm390', width: 390, height: 844, isMobile: true },
  { name: 'd1280h720', width: 1280, height: 720, isMobile: false },
  { name: 'd1366h768', width: 1366, height: 768, isMobile: false },
  { name: 'd1440', width: 1440, height: 900, isMobile: false },
]) {
  const { ctx, page } = await openPage(vp);

  await capture(page.locator('.hero').first(), `${vp.name}-hero.png`);

  if (vp.name === 'd1280h720' || vp.name === 'd1366h768') {
    await ctx.close();
    continue;
  }

  const sections = [
    ['.missao', 'missao'],
    ['.galeria', 'galeria-saude-funcao-estetica'],
    ['.tx', 'tratamentos'],
    ['.doutor', 'doutor'],
    ['.filosofia', 'filosofia-card-01'],
    ['.mapa', 'mapa'],
    ['.final', 'cta'],
    ['.footer', 'footer'],
  ];

  for (const [selector, name] of sections) {
    await gotoSection(page, selector, selector === '.hero' ? 0 : 96);
    await capture(page.locator(selector).first(), `${vp.name}-${name}.png`);
  }

  if (!vp.isMobile) {
    await gotoSection(page, '#tratamentos');
    for (const i of [0, 4, 8]) {
      await page.click(`[data-tx-btn="${i}"]`);
      await settle(page, 650);
      await capture(page.locator('#tratamentos'), `${vp.name}-tratamentos-state-${String(i + 1).padStart(2, '0')}.png`);
    }

    await gotoSection(page, '.processo', 0);
    await page.evaluate(() => {
      const pin = document.querySelector('.processo');
      const r = pin.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top + window.innerHeight * 1.6);
    });
    await settle(page, 900);
    await page.screenshot({ path: path.join(out, `${vp.name}-processo-mid.png`) });

    await gotoSection(page, '#filosofia');
    await capture(page.locator('#filosofia'), `${vp.name}-filosofia-card-01.png`);
    await page.click('[data-filosofia-next]');
    await settle(page, 650);
    await capture(page.locator('#filosofia'), `${vp.name}-filosofia-card-02.png`);

    await gotoSection(page, '#contato', 60);
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.75));
    await settle(page, 550);
    await page.screenshot({ path: path.join(out, `${vp.name}-mapa-cta-transition.png`) });
  } else {
    await gotoSection(page, '#tratamentos');
    await page.click('[data-tx-btn="4"]');
    await settle(page, 650);
    await capture(page.locator('#tratamentos'), `${vp.name}-tratamentos-mobile-active.png`);

    await gotoSection(page, '#filosofia');
    await page.click('[data-filosofia-next]');
    await settle(page, 650);
    await capture(page.locator('#filosofia'), `${vp.name}-filosofia-mobile-card-02.png`);
  }

  await ctx.close();
}

{
  const { ctx, page } = await openPage(
    { name: 'reduced', width: 390, height: 844, isMobile: true },
    { reducedMotion: 'reduce' }
  );
  await page.screenshot({ path: path.join(out, 'reduced-motion.png') });
  await ctx.close();
}

await browser.close();
console.log('done -> ' + out);
