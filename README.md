# UAE Movers and Packers — one-page landing site

A static, dependency-free landing page. No build step, no framework, no third-party requests.
Drop the folder on a static host and it runs.

## File structure

```
uae-movers-packers/
├── index.html                 the twelve sections, JSON-LD, SVG icon sprite
│                              01 hero · 02 what you will not do · 03 prices ·
│                              04 everything in that number · 05 how it works ·
│                              06 the guarantee · 07 one job at a time · 08 about us ·
│                              09 storage · 10 offices and abroad · 11 FAQ · 12 closing
├── 404.html                   on-brand not-found page (noindex)
├── favicon.ico
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── _headers                   security headers + cache policy (Cloudflare Pages / Netlify)
├── README.md
└── assets/
    ├── css/style.css          the whole design system, one file
    ├── js/
    │   ├── boot.js            adds the `js` class before first paint (2 lines)
    │   └── main.js            scroll reveal, stat count-ups, FAQ, sticky bar
    ├── fonts/                 self-hosted, subset to Latin, ~54 KB total
    │   ├── archivo.woff2      headlines, 400–800 variable
    │   ├── inter.woff2        body and UI, 400–700 variable
    │   └── source-serif.woff2 section 06 only, 400–600 variable
    └── img/
        ├── logo.png / .webp   supplied logo, background removed, 500×141
        ├── og.jpg             1200×630 social card
        ├── favicon-16/32.png, apple-touch-icon.png, icon-192/512.png
```

Total first load is roughly 190 KB: 54 KB fonts, ~32 KB logo (WebP), ~38 KB HTML, ~37 KB CSS, ~6 KB JS.

## Deploying to Cloudflare Pages

Either connect the repository or upload the folder directly.

```bash
npx wrangler pages deploy . --project-name=uae-movers-packers
```

- **Build command:** none
- **Build output directory:** `/` (the folder itself)
- `_headers` is read automatically by Cloudflare Pages and by Netlify. On Vercel or Amplify the same
  rules need translating into `vercel.json` / a custom header config.

### One thing to change before going live

Every absolute URL assumes the site is served from `https://uaemoversandpacker.com/`. If the domain
differs, update it in five places:

| File | What to change |
|---|---|
| `index.html` | `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image` |
| `index.html` | both JSON-LD blocks (`url`, `@id`, `image`, `logo`) |
| `sitemap.xml` | `<loc>` |
| `robots.txt` | the `Sitemap:` line |

```bash
grep -rl "uaemoversandpacker.com" . --include="*.html" --include="*.xml" --include="*.txt"
```

## Cache policy

`_headers` deliberately splits the assets:

- **Fonts and images** — one year, `immutable`. They are content-stable; if the artwork changes,
  rename the file rather than overwriting it.
- **CSS and JS** — `max-age=0, must-revalidate`. They keep their filenames across releases, so they
  must revalidate or a returning visitor would keep an old copy. Revalidation is a cheap 304.

## Content Security Policy

The page contains **no inline styles and no inline scripts**, which lets the CSP stay tight:

```
style-src 'self'; script-src 'self'
```

Keep it that way. If you add a `style="…"` attribute or an inline `<script>`, the browser will refuse it
and log a console error. Put styles in `assets/css/style.css` and scripts in `assets/js/`.
(The two `application/ld+json` blocks are data, not executable script, and are not affected.)

## Editing the content

- **Prices** live in four places that must agree: the tier cards in section 03, the `<h1>`, the
  `<title>` / meta description / OG tags, and the `makesOffer` block in the JSON-LD. They are flat,
  decimal-free numbers — AED 1,099 / 1,999 / 2,999 / 3,999 — shown as `AED` above a single large
  figure with nothing after it.
- **WhatsApp buttons** are plain `<a href>` with the message already percent-encoded, so they work
  without JavaScript. All fifteen point at `wa.me/971568943249`. To change one, URL-encode the new text:
  ```bash
  python -c "from urllib.parse import quote; print(quote(input(), safe=''))"
  ```
- **The FAQ** must be kept in sync in two places: the accordion markup and the `FAQPage` JSON-LD at the
  bottom of `index.html`.
- **Scroll reveal** comes from the `reveal` class; stagger comes from a `stagger` class on the parent
  list (delays are per `nth-child`, no inline styles).
- **Stat count-ups** read `data-to`; the final figure is also the HTML text, so the numbers are correct
  with JavaScript disabled.

## Accessibility and progressive enhancement

- With JavaScript off: every FAQ answer is open, nothing is hidden by the reveal animation, the stat
  figures show their final values, and every button still works.
- `prefers-reduced-motion: reduce` disables reveals, count-ups and hover transforms.
- Colour pairs meet WCAG AA; the sticky bottom bar is mobile-only and the footer reserves its height so
  it never covers content.

## Local preview

```bash
python -m http.server 8123
```
