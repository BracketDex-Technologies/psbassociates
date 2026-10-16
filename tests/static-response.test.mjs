import test from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync, gunzipSync } from 'node:zlib';
import { staticResponse } from '../lib/static-response.mjs';
import { optimizePageHtml } from '../scripts/optimize-assets.mjs';

const asset = { type: 'text/css', body: 'body{color:navy}', gzip: gzipSync('body{color:navy}').toString('base64') };
test('static assets negotiate gzip and preserve uncompressed/HEAD fallback', async () => {
  for (const [encoding, expected] of [['gzip, deflate, br', true], ['gzip;q=0, br', false], ['', false]]) {
    const response = staticResponse(new Request('https://example.test/', { headers: { 'Accept-Encoding': encoding } }), asset, '/assets/site-123456abcdef.css');
    assert.equal(response.headers.get('Content-Encoding'), expected ? 'gzip' : null);
    assert.equal(response.headers.get('Vary'), 'Accept-Encoding');
    assert.match(response.headers.get('Cache-Control'), /immutable/);
    const body = Buffer.from(await response.arrayBuffer());
    assert.equal(expected ? gunzipSync(body).toString() : body.toString(), asset.body);
  }
  const head = staticResponse(new Request('https://example.test/', { method: 'HEAD', headers: { 'Accept-Encoding': 'gzip' } }), asset, '/');
  assert.equal(await head.text(), '');
  assert.equal(head.headers.get('Content-Encoding'), 'gzip');
  assert.doesNotMatch(head.headers.get('Cache-Control'), /immutable/);
});

test('optimized pages preserve layout, voice labels and responsive image dimensions', () => {
  const html = '<head><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="old.css"></head><main id="main"><img src="/assets/pavan.webp" alt="Partner" loading="lazy"></main><button aria-label="Toggle navigation">Menu <span>☰</span></button>';
  const result = optimizePageHtml(html, 'careers', { styles: { site: '/site.css', forms: '/forms.css' }, portraits: { pavan: { width: 769, height: 974 } } });
  assert.doesNotMatch(result, /fonts.googleapis|old.css/);
  assert.match(result, /href="\/forms.css"/);
  assert.match(result, /srcset="[^\"]*pavan-256.webp 256w/);
  assert.match(result, /width="769" height="974"/);
  assert.match(result, /tabindex="-1"/);
  assert.match(result, /aria-label="Menu"/);
});
