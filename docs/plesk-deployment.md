# Plesk deployment

This project is a Node.js application. It must be deployed as a Node.js app, not only copied as static HTML, because `/api/announcements` and `/api/contact` are served by `server.mjs`.

## 1. Point the domain to the Plesk server

In BigRock, open `psbassociates.in` → **DNS Records** and replace the existing website A record with the public IPv4 address supplied by the Plesk host. Add or update `www` as a CNAME to `psbassociates.in` (or an A record to the same IP). Do not change mail records unless email is also hosted on Plesk. DNS changes can take time to propagate.

## 2. Add the domain in Plesk

In **Websites & Domains**, add or select `psbassociates.in`. If another site is already there, take a backup first. The new application should replace the existing document only after the new app has been tested.

## 3. Upload or pull the repository

Use Plesk Git or upload the `website` directory as the application root. The application root must contain `package.json`, `server.mjs`, `build.mjs`, `lib/`, `data/`, and `dist/`.

Set the Node.js version to **22 or newer**. Set the startup file to `server.mjs` and enable the Plesk Node.js proxy. The start command is already defined as `npm start`.

Before starting the app, run:

```text
npm ci
npm run build -- --origin=https://psbassociates.in
```

Use the Plesk **Application Startup File** field for `server.mjs`; do not use `dist/index.html` as the startup file.

## 4. Environment variables

Set these in Plesk under the Node.js application environment variables:

```text
SITE_URL=https://psbassociates.in
WEB3FORMS_ACCESS_KEY=<owner-provided Web3Forms key>
GA_MEASUREMENT_ID=<optional GA4 measurement ID>
```

The contact form remains safely disabled until `WEB3FORMS_ACCESS_KEY` is supplied. Never commit that value to Git.

## 5. HTTPS and verification

Issue a Let’s Encrypt certificate for `psbassociates.in` and `www.psbassociates.in`, then enable HTTPS redirection. Restart the Node.js application after the build and check:

```text
https://psbassociates.in/
https://psbassociates.in/services/
https://psbassociates.in/api/announcements
https://psbassociates.in/api/contact
```

`/api/contact` should report that the form is unavailable until the Web3Forms key is configured; it should not open an email client or pretend delivery succeeded.
