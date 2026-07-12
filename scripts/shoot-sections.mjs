import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const out = process.env.QA_OUT || 'qa-shots';
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const sections = ['.hero', '.missao', '.galeria', '.tx', '.doutor', '.filosofia', '.mapa', '.final', '.footer'];

for (const vp of [
  { name: 'm390', width: 390, height: 844, isMobile: true },
  { name: 'd1440', width: 1440, height: 900, isMobile: false },
]) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(process.env.QA_BASE || 'http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3400);

  /* varredura lenta para disparar reveals */
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
  });
  await page.waitForTimeout(1800);

  for (const sel of sections) {
    const el = page.locator(sel).first();
    try {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(350);
      await el.screenshot({ path: path.join(out, `${vp.name}${sel.replace('.', '-')}.png`) });
    } catch (e) {
      console.log('skip', sel, e.message.split('\n')[0]);
    }
  }

  /* processo no meio do pin (desktop) */
  if (!vp.isMobile) {
    await page.evaluate(() => {
      const pin = document.querySelector('.processo');
      const r = pin.getBoundingClientRect();
      window.scrollTo(0, window.scrollY + r.top + window.innerHeight * 1.6);
    });
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(out, `${vp.name}-processo-mid.png`) });
  }
  await ctx.close();
}

await browser.close();
console.log('done → ' + out);
