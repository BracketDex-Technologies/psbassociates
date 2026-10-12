// Render the site's header identity as a static, crawler-readable share image.
// Usage: node scripts/build-social-preview.mjs <bundled-node-modules-directory>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(path.resolve(process.argv[2], 'package.json'));
const { chromium } = require('playwright');
const logo = fs.readFileSync('dist/assets/ca-india-logo.png').toString('base64');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
 const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1 });
 await page.setContent(`<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400&family=Manrope:wght@500&display=swap" rel="stylesheet"><style>
 *{box-sizing:border-box}body{margin:0;background:#fcfdff;color:#102b43;width:1200px;height:1200px;display:grid;place-items:center;border-top:12px solid #dfbd80;border-bottom:12px solid #dfbd80}
 .identity{display:flex;flex-direction:column;align-items:center;gap:54px;width:100%;padding:70px;text-align:center}
 .mark{display:flex;justify-content:center}.mark img{width:420px;height:auto}
 .brand{width:100%}
 .name{font:400 160px/1.2 'Libre Baskerville',Georgia,serif;letter-spacing:-.035em}.name span{display:block;font-size:110px;margin-top:14px;white-space:nowrap}
 .subtitle{font:500 54px/1.5 Manrope,Arial,sans-serif;letter-spacing:.01em;color:#607487;margin-top:34px}
 </style></head><body><div class="identity"><div class="mark"><img src="data:image/png;base64,${logo}" alt="CA India logo"></div><div class="brand"><div class="name">PSB &amp;<span>Associates LLP</span></div><div class="subtitle">Chartered Accountants</div></div></div></body></html>`, { waitUntil: 'networkidle' });
 await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(img => img.decode())); });
 const fontsLoaded = await page.evaluate(() => document.fonts.check('160px "Libre Baskerville"') && document.fonts.check('54px Manrope'));
 if (!fontsLoaded) throw new Error('Header fonts did not load; refusing to generate a mismatched preview.');
 await page.screenshot({ path: 'dist/assets/social-preview-square.png' });
 if (process.argv[3]) {
  await page.setViewportSize({ width: 96, height: 96 });
  await page.evaluate(() => { document.body.style.transform='scale(.08)'; document.body.style.transformOrigin='top left'; });
  await page.screenshot({ path: process.argv[3] });
 }
 console.log('Created square share image with enlarged header branding: 1200 × 1200.');
} finally { await browser.close(); }
