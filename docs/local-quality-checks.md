# Local quality checks — 16 October 2026

Preview: http://127.0.0.1:4191/ . Changes are local, not deployed.

## Measured results

- Homepage Lighthouse simulated mobile performance: **77 → 98**.
- Homepage desktop performance: **100**.
- Homepage automated accessibility, best practices and SEO: **100** each.
- About, Services, Partners, Careers and Contact automated accessibility: **100** each after fixes.
- Mobile homepage largest contentful paint: **2.3 seconds**, layout shift **0** in the final compression run.
- Six main pages at 320, 390, 768, 1280 and 1440 pixels: **30 checks**, no horizontal overflow, missing loaded images or duplicate H1s.
- Build and HTML validation pass; **20 unit tests pass**.
- Phone navigation verified: overlay does not enlarge header; Escape closes it and restores focus.

## Changes

- Fonts served locally with included SIL licenses; no Google Fonts connection needed to render text.
- Minified, content-addressed stylesheet bundles retain the original editable CSS files.
- Responsive portrait variants preserve full-resolution originals while avoiding full-size downloads for avatars and phone rows.
- Shared static response handles negotiated gzip, HEAD, font MIME types, cache policy and 404s. Local server forwards request headers without changing existing host/port settings.
- Improved text contrast, native brand link names, selection status semantics and heading hierarchy.
- Obsolete generated stylesheet bundles are removed on rebuild; source styles are never removed.

## Reproduce

```powershell
npm ci
npm run build
npm run check
npm test
npx lighthouse http://127.0.0.1:4191/ --chrome-flags="--headless --no-sandbox"
npx lighthouse http://127.0.0.1:4191/ --preset=desktop --chrome-flags="--headless --no-sandbox"
```

Normal builds use checked-in fonts and need no font-network access. `node scripts/vendor-fonts.mjs` explicitly refreshes licensed fonts if required.

Scores are local laboratory measurements, not a guarantee of live performance, rankings or full accessibility compliance. Real iPhone/Android testing and production measurements remain separate checks. No genuine form submissions were sent during testing.
