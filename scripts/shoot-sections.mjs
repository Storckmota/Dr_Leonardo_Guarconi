import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const out = process.env.QA_OUT || 'qa-shots';
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const sections = ['.hero', '.pratica', '.tx', '.doutor', '.filosofia', '.contato', '.footer'];

for (const vp of [
  { name: 'm390', width: 390, height: 844, isMobile: true },
  { name: 'd1280', width: 1280, height: 800, isMobile: false },
]) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.isMobile,
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

  // varredura lenta para disparar todos os reveals e deixá-los assentar
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 160));
    }
  });
  await page.waitForTimeout(1600);

  for (const sel of sections) {
    const el = page.locator(sel);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await el.screenshot({ path: path.join(out, `${vp.name}-${sel.slice(1)}.png`) });
  }
  await ctx.close();
}

await browser.close();
console.log('done → ' + out);
