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
 const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
 await page.setContent(`<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400&family=Manrope:wght@500&display=swap" rel="stylesheet"><style>
 *{box-sizing:border-box}body{margin:0;background:#fcfdff;color:#102b43;width:1200px;height:630px;display:grid;place-items:center;border-top:5px solid #dfbd80}
 .identity{display:flex;align-items:center;gap:32px}
 .mark{width:158px;display:flex;justify-content:center}.mark img{width:150px;height:auto}
 .brand{border-left:1px solid #102b4326;padding:12px 0 12px 32px}
 .name{font:400 44px/1.35 'Libre Baskerville',Georgia,serif;letter-spacing:-.035em;white-space:nowrap}
 .subtitle{font:500 25px/1.5 Manrope,Arial,sans-serif;letter-spacing:.045em;color:#607487;margin-top:14px}
 </style></head><body><div class="identity"><div class="mark"><img src="data:image/png;base64,${logo}" alt="CA India logo"></div><div class="brand"><div class="name">PSB &amp; Associates LLP</div><div class="subtitle">Chartered Accountants</div></div></div></body></html>`, { waitUntil: 'networkidle' });
 await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(img => img.decode())); });
 const fontsLoaded = await page.evaluate(() => document.fonts.check('44px "Libre Baskerville"') && document.fonts.check('25px Manrope'));
 if (!fontsLoaded) throw new Error('Header fonts did not load; refusing to generate a mismatched preview.');
 await page.screenshot({ path: 'dist/assets/social-preview-header.png' });
 console.log('Created header-matched share image: 1200 × 630.');
} finally { await browser.close(); }
