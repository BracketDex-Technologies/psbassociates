# P S B & Associates LLP website

Responsive 16-page website with a server-side announcements API. Requires Node.js 22 or newer and has no package dependencies. Run `npm run build` to regenerate HTML and the self-contained Cloudflare Worker from `build.mjs`, `npm run check` to verify pages and references, `npm test` for feed parsing and failure-handling tests, and `npm start` for http://127.0.0.1:4173. The local server runs the same Worker entrypoint used in production.

Source facts: http://www.psbassociates.in/ and the user-supplied review. Visual references: https://sseco.in/ and https://www.kirtanepandit.com/. The library and collaboration images are retained from the existing PSB website. Portraits are user-supplied; Photo.png is provisionally mapped to CA Bharadwaj R. Mandhane. No additional qualifications or specialisations are invented for CA Sagar Sahebrao Nikam.

Content corrections include city renaming, 12+ years of firm practice, dynamic copyright year, duplicate removal, replacement accounting copy, professional disclaimer, partner addition and refreshed photos. Business intelligence offerings are retained under Accounting & Virtual CFO. Portraits appear in PSB order: Pavan, Sagar, Bharadwaj. No testimonials or client logos are published.

## Announcements

`GET /api/announcements` retrieves official GST news, Income Tax announcements, ICAI announcements and RBI press releases. Source definitions and parsers live in `lib/announcements.mjs`. No third-party firm's API, credentials or content is reused. Browser requests are same-origin; remote sources are fetched by the Worker with 10-second timeouts. Only official HTTPS links are returned, and the UI renders external content as plain text.

The server caches the aggregate for 15 minutes, deduplicates concurrent refreshes and preserves last-retrieved items for unavailable sources. Responses expose per-source status and last successful check times. `data/announcements.json` is a timestamped fallback snapshot; update it with `npm run refresh:announcements` before building when desired. It is never presented as a successful live fetch during an outage. Cloudflare cache and warm-instance memory are opportunistic caches, not a permanent news archive. During a cold-start outage, the bundled snapshot is the fallback.

The homepage has a compact scrollable feed and the Briefing page has category filters, search, source status, and manual refresh. Both request updates on load, every 15 minutes while visible and when returning to an expired tab. Manual refresh bypasses the server and edge caches and checks all four official sources immediately. Publication dates are distinct from source check times; undated announcements remain labelled as such. There is no background scheduled job or fabricated tax calendar. Reduced-motion preferences disable motion; practice cards support horizontal scrolling, touch, keyboard focus and navigation controls.

## Source layout and hosting

`build.mjs` generates the pages, `components.mjs` contains shared briefing markup, and `dist/assets/` contains the maintained CSS, JavaScript and image assets. `scripts/build-worker.mjs` bundles those pages/assets with the API into `dist/server/index.js`. Do not delete `dist/assets/` as disposable build output. The Worker includes its own static responses and does not need a database, API key or asset binding. `.openai/hosting.json` retains the existing Sites project ID and now uses Worker hosting.

The inquiry form opens an email draft and does not deliver or store submissions. Both offices include Google Maps embeds and direction links. A server-delivered form requires a configured email service. The original domain's certificate and DNS are outside this redesign's hosting; a private HTTPS review site is published separately. Moving psbassociates.in requires access to its domain and hosting controls.

Share metadata uses the deployment origin. Vercel runs `node build.mjs --origin=https://psbassociates.vercel.app` via `vercel.json`; other deployments can set `SITE_URL` or pass `--origin`. Social images must be publicly accessible on that same origin.

Vercel serves the live feed through `api/announcements.js`, which shares `lib/announcements.mjs` with the local/Sites Worker. The function has a 30-second execution allowance and uses a warm-instance cache; Refresh bypasses that cache. Verify a deployment with `node scripts/check-live-feed.mjs https://psbassociates.vercel.app`.
