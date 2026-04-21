const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const canvas = await page.$('canvas');
  await canvas.screenshot({ path: 'canvas.png' });
  await browser.close();
})();
