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
 const page = await browser.newPage({ viewport: { width: 557, height: 105 }, deviceScaleFactor: 8 });
 await page.setContent(`<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400&family=Manrope:wght@500&display=swap" rel="stylesheet"><style>
 *{box-sizing:border-box}body{margin:0;background:#fcfdff;color:#102b43;width:557px;height:105px;border-bottom:14px solid #f0eee9}
 .identity{position:absolute;left:71px;top:17px;height:54px;display:flex;align-items:center;gap:18px}
 .mark{width:70px;height:54px;display:flex;align-items:center;justify-content:center}.mark img{width:56px;height:auto}
 .brand{height:54px;border-left:1px solid #102b4326;padding-left:18px}
 .name{font:400 21.6px/1.35 'Libre Baskerville',Georgia,serif;letter-spacing:-.035em;white-space:nowrap}
 .subtitle{font:500 12.16px/1.5 Manrope,Arial,sans-serif;letter-spacing:.045em;color:#607487;margin-top:6px}
 </style></head><body><div class="identity"><div class="mark"><img src="data:image/png;base64,${logo}" alt="CA India logo"></div><div class="brand"><div class="name">PSB &amp; Associates LLP</div><div class="subtitle">Chartered Accountants</div></div></div></body></html>`, { waitUntil: 'networkidle' });
 await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(img => img.decode())); });
 const fontsLoaded = await page.evaluate(() => document.fonts.check('21.6px "Libre Baskerville"') && document.fonts.check('12.16px Manrope'));
 if (!fontsLoaded) throw new Error('Header fonts did not load; refusing to generate a mismatched preview.');
 await page.screenshot({ path: 'dist/assets/social-preview-header-hd.png' });
 console.log('Created horizontal header share image: 4456 × 840 (8× rendering).');
 // WhatsApp's compact card needs a square composition with readable branding.
 const thumbnail = await browser.newPage({viewport:{width:600,height:600},deviceScaleFactor:1});
 await thumbnail.setContent(`<!doctype html><html><head><link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400&family=Manrope:wght@500&display=swap" rel="stylesheet"><style>
 *{box-sizing:border-box}body{margin:0;width:600px;height:600px;background:#fcfdff;color:#102b43;display:flex;flex-direction:column;align-items:center;justify-content:center;border-top:6px solid #dfbd80;border-bottom:6px solid #dfbd80;text-align:center}
 img{display:block;width:210px;height:auto;margin-bottom:18px}.name{font:400 112px/1.15 'Libre Baskerville',Georgia,serif;letter-spacing:-.035em}.firm{font:400 46px/1.3 'Libre Baskerville',Georgia,serif;letter-spacing:-.035em;margin-top:10px}.subtitle{font:500 25px/1.5 Manrope,Arial,sans-serif;color:#607487;margin-top:16px}
 </style></head><body><img src="data:image/png;base64,${logo}" alt="CA India logo"><div class="name">PSB &amp;</div><div class="firm">Associates LLP</div><div class="subtitle">Chartered Accountants</div></body></html>`,{waitUntil:'networkidle'});
 await thumbnail.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode()));});
 const thumbnailFontsLoaded=await thumbnail.evaluate(()=>document.fonts.check('112px "Libre Baskerville"')&&document.fonts.check('25px Manrope'));
 if(!thumbnailFontsLoaded)throw new Error('Thumbnail fonts did not load.');
 await thumbnail.screenshot({path:'dist/assets/social-preview-whatsapp-v3.png'});
 if(process.argv[3]){
  await thumbnail.setViewportSize({width:96,height:96});
  await thumbnail.evaluate(()=>{document.body.style.transform='scale(.16)';document.body.style.transformOrigin='top left';});
  await thumbnail.screenshot({path:process.argv[3]});
 }
 console.log('Created WhatsApp thumbnail: 600 × 600, with prominent PSB branding.');
} finally { await browser.close(); }
