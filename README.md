# Developer portfolio

A personal portfolio built with Angular and pre-rendered to plain static files, so it runs on
GoDaddy's standard web hosting with nothing but Apache and PHP. No photos of you anywhere —
identity comes from typography, a generated system diagram and the work itself.

- **Home**: hero with a live system diagram, selected work, expertise, approach, about, process, contact
- **Case studies**: one page per featured project, with generated architecture and database diagrams
- **Contact form**: posts to `contact.php`, which emails you (spam-protected, rate-limited)

---

## Before you publish — checklist

1. `src/content/site.config.ts` — your **name**, **siteUrl** (your real domain), **email**, **GitHub**, **LinkedIn**, optional **résumé** and **availability**.
2. `src/content/projects.ts` — check every project's **status**, **stack** and wording. They were drafted from your brief; nothing should claim more than you've built. Set `repoUrl` / `liveUrl` only for links that work.
3. `src/content/about.ts` — add institutions and years for your education, and certifications once earned.
4. `src/content/expertise.ts` — remove any skill you wouldn't want to be quizzed on.
5. Run `npm run assets` to regenerate the favicon and social-sharing image with your name.
6. Set up the contact form on GoDaddy (below).

The build prints a "Still to configure" list until the important ones are done.

---

## Project layout

```
src/
  content/            ← everything a visitor reads. Edit here.
    site.config.ts      name, links, contact, hero copy, principles, process steps
    projects.ts         projects + case studies (template entry at the bottom)
    expertise.ts        skill groups
    about.ts            intro, education, certifications, learning, interests
  lib/                ← framework-free helpers shared by both builds
    visuals.ts          hero diagram, project concept visuals, icons for principles, monogram
    diagrams.ts         architecture + database diagrams generated from project data
    case-study.ts       the case-study section template
    helpers.ts          SEO metadata, sitemap paths, "used in" links
  styles/             ← design system (tokens, base, components, sections, visuals, case study)
  app/                ← Angular app (standalone components, signals, zoneless)
public/               ← fonts, favicons, social image, robots.txt, sitemap.xml, résumé
hosting/godaddy/      ← .htaccess, contact.php, contact-config.example.php
tools/
  static/             ← zero-dependency static builder (same content and styles)
  tests/              ← content checks (npm test)
```

There are two ways to build the same site from the same content files:

| | `npm run build` (Angular) | `npm run build:static` |
|---|---|---|
| Output | `dist/portfolio/browser/` | `dist-static/` |
| Needs | Node 20.19+, `npm install` | Node + `tsx` only |
| Use when | You want the Angular codebase to grow (new features, routes) | You only change content and want the lightest possible site |

Both produce pre-rendered HTML for every page, `.htaccess`, `contact.php`, `robots.txt` and `sitemap.xml`. Upload either one.

---

## Local development

```bash
npm install
npm start                # Angular dev server at http://localhost:4200
npm test                 # content checks
npm run build            # production build -> dist/portfolio/browser
npm run build:static     # static build     -> dist-static
npm run build:preview    # static preview with relative links (open dist-preview/index.html)
npm run audit            # check dependencies for known vulnerabilities
```

To try the contact form locally with PHP installed:

```bash
cp hosting/godaddy/contact-config.example.php /tmp/contact-config.php   # set 'mode' => 'log'
PORTFOLIO_CONTACT_CONFIG=/tmp/contact-config.php php -S localhost:8080 -t dist-static
```

Messages are then written to `contact-data/outbox.log` instead of being emailed.

---

## Editing content

**Update a project** — edit its entry in `src/content/projects.ts`. Status is one of
`completed`, `in-development`, `prototype`, `concept`, `experiment`; it's shown as text plus a
shape, so it never relies on colour.

**Add a project** — copy the template entry at the bottom of `projects.ts`, give it a unique
`slug` (lowercase, hyphens), and set `featured: true`. Keep four to six featured. Its case-study
page, sitemap entry and "next case study" link are created automatically. Fill
`architecture` (nodes in tiers, edges between ids) and `dataModel` (tables, relations) to get
diagrams; tables fill a three-column grid left to right, so order related tables side by side.
Empty sections are skipped.

**Replace a concept visual with a real screenshot** — put the image in `public/images/` and add
to the project:

```ts
image: { src: '/images/tms-dashboard.png', alt: 'Shipment board showing loads by status', width: 1600, height: 1000 },
```

Only use genuine screenshots; without `image`, the card shows a generated concept visual
labelled "Concept visual, not a screenshot".

**Social links and email** — `site.contact` in `site.config.ts`. Anything left `null` is hidden.

**Résumé** — put the PDF at `public/files/resume.pdf` and set `contact.resume: '/files/resume.pdf'`.

**Hero copy, principles, process steps** — `copy`, `principles` and `processSteps` in
`site.config.ts`. The hero takes three lines; each steps in to echo the stacked layers of the diagram.

**Colours and type** — `src/styles/tokens.css`. Blue marks interface and product work, cyan
data and AI, violet security; projects and skills pick theirs with `domain`.

---

## Contact form on GoDaddy

`contact.php` is uploaded with the site. Its settings live **outside** `public_html`, so they are
never downloadable.

1. In cPanel → **Email Accounts**, create a sender mailbox on your domain, e.g. `website@yourdomain.com`.
   Mail sent "from" an address on another domain is often marked as spam.
2. In cPanel → **File Manager**, go to your home folder (the one that *contains* `public_html`)
   and create a folder named `portfolio-private`.
3. Upload `hosting/godaddy/contact-config.example.php` into it, rename it to `contact-config.php`, and fill in:
   `to_email`, `from_email`, `site_name`, `allowed_origins` (your https domain, with and without www), and a random `salt`.
4. Send yourself a test message from the live site. If nothing arrives within a few minutes,
   check spam, then cPanel → **Errors** for lines starting `contact.php:`.

What it does: accepts POST only, checks the request came from your site, drops bots silently
(hidden honeypot field and a minimum fill time), validates every field on the server, strips
line breaks that could inject email headers, limits each visitor to 5 messages an hour (IP
addresses are stored only as salted hashes), and stores nothing else.

**Prefer not to use PHP?** Set `contact.formEndpoint` to a Formspree or Web3Forms URL (and add
that domain to `connect-src` and `form-action` in `.htaccess`), or set it to `null` to show
only the email and profile buttons.

---

## Deploying to GoDaddy

1. Set `siteUrl` in `site.config.ts` to your real address (e.g. `https://www.yourdomain.com`), then build:
   `npm run build` (or `npm run build:static`).
2. In cPanel, turn on **SSL/TLS** for the domain if it isn't already (GoDaddy includes a free certificate on most plans).
3. Upload the **contents** of `dist/portfolio/browser/` (or `dist-static/`) into `public_html`.
   Use File Manager (upload a zip, then Extract) or FTP. Make sure hidden files are included —
   `.htaccess` starts with a dot and some FTP clients hide it.
4. Set up the contact form (above).
5. Visit the site, open a case study, try a wrong URL (you should see the 404 page), and send a test message.
6. Submit `https://yourdomain.com/sitemap.xml` in Google Search Console.

`.htaccess` handles: HTTPS redirect, the 404 page, long-term caching for fingerprinted files,
compression, and security headers (Content-Security-Policy, nosniff, frame protection,
referrer and permissions policies). HSTS is included but commented out — enable it once HTTPS
works on every subdomain. To force `www` (or non-www), uncomment that block so it matches `siteUrl`.

Updating later: rebuild and upload again, replacing the old files. Fingerprinted CSS/JS filenames
mean visitors always get the new version.

---

## Design notes

- Dark midnight base with one light section (the approach), a faint column grid behind the page, and Inter / Inter Display self-hosted (no Google Fonts request).
- The one bold moment is the hero diagram: interface, services and data as stacked layers, requests flowing between them, and an access-check rail beside every layer. It assembles once on load; everything else stays quiet.
- Motion respects `prefers-reduced-motion`; content is visible without JavaScript and without animation.
- The pointer ring and card tilt only run on desktop with a fine pointer; the system cursor is never hidden.
- Accessibility: semantic landmarks, one `h1` per page, visible focus, skip link, keyboard tabs for expertise (arrow keys, Home, End), focus-trapped mobile menu that closes on Escape, text alternatives for every diagram, and colour contrast at WCAG AA or better.

## Security notes

- No secrets in the repository or the frontend. The only server-side setting file lives outside `public_html`.
- No inline scripts (JSON-LD is data, not code), so the CSP can use `script-src 'self'`.
- Generated SVG is built element by element (Angular `Renderer2`), never through `innerHTML`.
- No analytics, trackers or third-party scripts.
- Run `npm run audit` after installing or updating dependencies.
