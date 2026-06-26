# Project State

Last updated: 2026-06-26

## Summary

`eugenics.net` is an Astro static education and archive site. CI/CD is live and the site is deployed and green at `https://eugenics-net.pages.dev/`. The public apex domain is **not yet** serving this project: the only remaining launch blocker is a registrar nameserver change at Dynadot. The URL-policy question is resolved (extensionless canonical form, accepted).

## Current Production Truth

- Public URL checked: `https://eugenics.net/`
- Current response: still redirects to `https://forsale.dynadot.com/eugenics.net?drefid=2071`
- Status: apex domain is not yet connected to this Astro site (pending registrar NS change)
- Cloudflare Pages: project `eugenics-net` is live via GitHub Actions CI/CD; production host `https://eugenics-net.pages.dev/` returns HTTP 200 with HSTS/CSP/CF headers
- Cloudflare zone: `eugenics.net` zone created, status **pending**; CF-assigned nameservers are `kristin.ns.cloudflare.com` and `santino.ns.cloudflare.com` (zone/account IDs are in the `ops/deploy-ledger.jsonl` record, not repeated here)
- Custom domains: `eugenics.net` and `www.eugenics.net` registered on the Pages project, status **pending** — they auto-provision once the zone goes Active
- **Sole remaining launch blocker (HUMAN):** Dynadot currently delegates to `raegan/simon.ns.cloudflare.com`, which REFUSE this zone. The owner must set Dynadot nameservers to `kristin/santino.ns.cloudflare.com`; the zone then activates and the pending custom domains provision automatically.
- URL policy: **RESOLVED.** Decision is to accept Cloudflare Pages' extensionless serving (`/x.html` 308-redirects to `/x`). `canonicalUrl()`, sitemap, rss, JSON-LD, and every internal link now emit the extensionless form, so declared URLs equal served URLs. On-disk filenames and slugs stay `*.html` (Astro `format:file` unchanged) — no slug renames, no directory migration.
- Cloudflare deploy/status: CF and GitHub tokens were loaded transiently from `local.env.txt`, never printed or committed; CF credentials live only as GitHub Actions repository secrets.

## Latest Validation Evidence

- 2026-06-26 function-first UX design deployed (commits `45893b0`, `976ddd8`, `59d00de`, `e902f6f`): fast-forward merged the 3-batch function-first optimization to `main` and deployed via CI to pages.dev — first-screen `TaskPanel`/`QuickActionStrip` task routers (home, article template, 404), glossary A–Z index, teaching/archive navigability panels, and `tableOfContents` + `keyTakeaways` backfilled on the 10 standard articles that lacked them (all 25 articles now at parity). Frontmatter-only content; zero new client JS; CSP unchanged. OpenClaw `deploy.sh validate` green (check:all routes=36, content-quality warnings=0, site-integrity + jsonld passed, browser QA 72 screenshots, axe-core 9 checks, Lighthouse a11y 5 routes @ 100). batch-3 toc ids verified against H2 github-slugger slugs + editorial review CLEAN (faithfulness / no-advice / anti-endorsement). CI runs `28232837512` and `28241794685` succeeded; live pages.dev confirms "On This Page" TOC + Key Takeaways render with anchors resolving. `PRODUCTION_BASE_URL=https://eugenics-net.pages.dev node scripts/production-smoke.mjs` passed 20/20 after syncing the 404 marker (`Current Routes` → `Find Your Way`, renamed in batch 1). See `ops/deploy-ledger.jsonl`.
- 2026-06-21 extensionless URL switch (commits `4a58b01`, `23b4825`): `canonicalUrl()` strips `.html` and maps `/index` to `/`; sitemap/rss route through it; nav, sections, and all internal hrefs are root-absolute extensionless. QA scripts updated to expect extensionless canonical/sitemap/links while still reading `x.html` files. OpenClaw `npm run check:all` passed (content-quality routes=36 warnings=0; site-integrity routes=36, upstream-link-only warnings; jsonld-validate passed). On the live pages.dev deploy, `/what-is-eugenics` returns 200 with canonical `https://eugenics.net/what-is-eugenics`, the `.html` form 308-redirects to extensionless, and `rss.xml` is served as `application/rss+xml`. `PRODUCTION_BASE_URL=https://eugenics-net.pages.dev node scripts/production-smoke.mjs` passed all 20 checks.
- 2026-06-21 GitHub Actions CI/CD + zone setup: created repo `7-labs/eugenics-net` (verified no secrets/forbidden files in tree), added `.github/workflows/deploy.yml` (Node 22, `npm ci` → `npm run build` → `wrangler pages deploy`). CI run `27906217972` succeeded end-to-end; production deployment `1f029f33`; `https://eugenics-net.pages.dev` returns 200 with HSTS/CSP/CF headers. Created the `eugenics.net` Cloudflare zone and registered apex+www Pages custom domains (both pending registrar NS).
- 2026-06-20 Cloudflare Pages deploy: created Pages project `eugenics-net` and deployed 113 files successfully. Wrangler reported deployment complete at `https://19246860.eugenics-net.pages.dev`; canonical project host `https://eugenics-net.pages.dev/` returned HTTP 200 with Cloudflare headers, HSTS, CSP, and rendered homepage content.
- 2026-06-20 production smoke against `https://eugenics-net.pages.dev` did not fully pass because Cloudflare Pages redirects `.html` pages to extensionless routes (`/what-is-eugenics.html` -> `/what-is-eugenics`) and serves `rss.xml` as `application/xml` instead of `application/rss+xml`.
- 2026-06-20 OpenClaw `bash ./deploy.sh validate`: passed after lockfile-only Astro update from 6.4.3 to 6.4.8. Astro built 38 pages, Pagefind v1.5.2 indexed 37 pages, production dependency audit at `moderate` threshold passed with only low-severity esbuild dev-server advisory remaining, content quality passed, site integrity passed with upstream-only external URL warnings, JSON-LD validation passed, and browser QA produced 72 screenshots plus search QA at `eugenics-net/browser-qa/20260620-044403`.
- 2026-06-20 local static checks after collecting generated output: `node scripts/content-quality-audit.mjs` passed; `node scripts/site-integrity.mjs` passed with 0 warnings; `node scripts/jsonld-validate.mjs`, `xmllint --noout sitemap.xml`, `xmllint --noout rss.xml`, and `git diff --check` passed.
- 2026-06-20 sync safety: `scripts/sync-openclaw.sh` now excludes `local.env*` and `.env*`; OpenClaw workspace confirmed `local.env.txt` absent before and after deploy.
- 2026-06-12 OpenClaw `bash ./deploy.sh validate`: passed after Pagefind static search integration. Clean install used `npm ci --no-audit --no-fund`; the separate production dependency audit still passed with 0 vulnerabilities. Astro built 38 pages, Pagefind v1.5.2 indexed 37 pages, `export:root` mirrored `pagefind/`, `content-quality`, `site-integrity`, and JSON-LD validation passed.
- Browser QA: passed with console/pageerror guards against OpenClaw preview for 36 sitemap routes across desktop and mobile viewports, producing 72 screenshots at `eugenics-net/browser-qa/20260612-160150`; added search QA passed for query `Buck v. Bell` linking to `/buck-v-bell-forced-sterilization.html`.
- Local static checks after collecting generated output: `node scripts/content-quality-audit.mjs` passed; `node scripts/site-integrity.mjs` passed with 0 warnings; `node scripts/jsonld-validate.mjs`, `git diff --check`, `xmllint --noout sitemap.xml`, and `xmllint --noout rss.xml` passed. `test -f search.html search.js pagefind/pagefind-ui.js pagefind/pagefind-ui.css` confirmed generated search assets are present.
- 2026-06-12 OpenClaw `bash ./deploy.sh validate`: passed after typography and print stylesheet hardening. OpenClaw `npm ci`, Astro build/export, production dependency audit, content quality, site integrity, JSON-LD validation, and browser QA all completed; browser QA produced 72 screenshots at `eugenics-net/browser-qa/20260612-134955`.
- Local static checks after collecting generated `style.css`: `node scripts/content-quality-audit.mjs` passed; `node scripts/site-integrity.mjs` passed with 1 upstream external-link timeout warning; `node scripts/jsonld-validate.mjs` and `git diff --check` passed. `rg` confirmed `Inter`, `font-size: clamp`, and `font-size:*vw` are absent from source/generated CSS and `@media print` is present.
- Print-to-PDF artifact was not generated in this pass: `openclaw-ops serve --project eugenics-net --replace --port 3351 --json` remained in `starting`; `serve-stop` reported a stale lock/process-stop failure, while remote `ps` showed the recorded PIDs were no longer running. No OpenClaw state files were manually edited.
- 2026-06-12 OpenClaw `bash ./deploy.sh validate`: passed after static per-tier OG image hardening (`og-default.png`, `og-history.png`, `og-bioethics.png`, `og-teaching.png`), route-based OG mapping, Article JSON-LD image alignment, and OG metadata/dimension gates.
- OpenClaw `npm ci`: passed with 0 vulnerabilities.
- OpenClaw `npm run check:all`: passed; Astro emitted `404.html` and `rss.xml`, `export:root` completed, production dependency audit reported 0 vulnerabilities, content quality passed with 0 warnings, site integrity passed with 5 upstream external-link warnings only, and `scripts/jsonld-validate.mjs` passed.
- Browser QA: passed against OpenClaw preview for 36 sitemap routes across desktop and mobile viewports, producing 72 screenshots at `eugenics-net/browser-qa/20260612-134001`.
- Local static checks after collecting generated output: `node scripts/content-quality-audit.mjs` passed; `node scripts/site-integrity.mjs` passed with 0 warnings; `node scripts/jsonld-validate.mjs`, `git diff --check`, `xmllint --noout sitemap.xml`, and `xmllint --noout rss.xml` passed. `identify public/assets/og-*.png assets/og-*.png` confirmed all eight source/exported OG PNGs are `1200x630` and about 10-11 KB each.
- 2026-06-12 OpenClaw `bash ./deploy.sh validate`: passed after favicon/404/CSP/JSON-LD/sitemap/RSS/llms hardening.
- OpenClaw `npm install`: passed with 0 vulnerabilities.
- OpenClaw `npm run check:all`: passed; Astro emitted `404.html` and `rss.xml`, `export:root` completed, production dependency audit reported 0 vulnerabilities, content quality passed with 0 warnings, site integrity passed with 5 upstream external-link warnings only, and `scripts/jsonld-validate.mjs` passed.
- Browser QA: passed against OpenClaw preview for 36 sitemap routes across desktop and mobile viewports, producing 72 screenshots at `eugenics-net/browser-qa/20260612-131918`.
- Local static checks after collecting generated output: `node scripts/content-quality-audit.mjs` passed; `node scripts/site-integrity.mjs` passed with 0 warnings on the final run; `node scripts/jsonld-validate.mjs`, `git diff --check`, `xmllint --noout sitemap.xml`, and `xmllint --noout rss.xml` passed.
- Launch readiness checks on 2026-06-12: `dig NS eugenics.net +short` still showed `ns1.dyna-ns.net` / `ns2.dyna-ns.net`; `curl -sI https://eugenics.net/` returned HTTP 302 to Dynadot; `bash ./deploy.sh cf-status` failed because Cloudflare API token/account ID are missing.

Earlier 2026-06-12 baseline:

- 2026-06-12 OpenClaw `bash ./deploy.sh validate`: passed.
- OpenClaw `npm install`: passed with 0 vulnerabilities.
- OpenClaw `npm run check:all`: passed; Astro built 36 pages, `export:root` completed, production dependency audit reported 0 vulnerabilities, content quality passed with 0 warnings, site integrity passed with 5 upstream external-link warnings only.
- Browser QA: passed against OpenClaw preview for 36 routes across desktop and mobile viewports, producing 72 screenshots at `eugenics-net/browser-qa/20260612-124912`.
- Local static checks on 2026-06-12: `node scripts/content-quality-audit.mjs` passed with 36 routes and 0 warnings; `node scripts/site-integrity.mjs` passed with 36 routes and 1 upstream external-link warning; `git diff --check`, `bash -n deploy.sh`, and `xmllint --noout sitemap.xml` passed.
- Deploy readiness preflight on 2026-06-12: blocked because no usable Cloudflare deploy auth path is proven in the current shell/environment.

Historical validation:

- OpenClaw `npm ci`: passed with 0 vulnerabilities after Astro 6.4.3 and Wrangler installation.
- OpenClaw `npm run check:security:all`: passed with 0 vulnerabilities.
- OpenClaw `npm run check:all`: passed; Astro built 36 pages, `export:root` completed, content quality passed with 0 warnings, site integrity passed with only upstream external-link warnings.
- Browser QA: passed against OpenClaw preview for 36 routes across desktop and mobile viewports, producing 72 screenshots plus summary at `eugenics-net/browser-qa/20260603-081116`.
- Local static checks: `node scripts/content-quality-audit.mjs`, `node scripts/site-integrity.mjs`, `bash -n deploy.sh`, and `git diff --check` passed.
- Cloudflare readiness gate: `bash ./deploy.sh cf-status` fails before Wrangler because `CLOUDFLARE_API_TOKEN` is missing; the gate also reports Dynadot parked redirect and no Cloudflare edge header.
- Production closeout gate: `bash ./deploy.sh deploy-closeout` is the required post-deploy acceptance command after auth and domain binding are fixed; it must fail until Cloudflare status and local/OpenClaw production smoke both pass.

## Runtime Boundary

- Local SSD: source edits, git, docs, and short non-runtime checks only.
- OpenClaw: dependency install, build, preview, browser QA, and Cloudflare deploy.
- Cloudflare Pages: intended production hosting target.

## Launch Blockers

- **[HUMAN, sole blocker]** Set Dynadot nameservers for `eugenics.net` to `kristin.ns.cloudflare.com` and `santino.ns.cloudflare.com`. The current `raegan/simon` delegation refuses this zone, so the zone stays pending and the apex keeps serving the Dynadot parked redirect. Once changed, the zone activates and the already-registered apex+www Pages custom domains auto-provision.
- After the zone is Active, run `bash ./deploy.sh deploy-closeout` and confirm Cloudflare status plus local/OpenClaw production smoke against the apex, a non-Dynadot response, and security headers.
- Confirm `corrections@eugenics.net` is provisioned and monitored (Cloudflare Email Routing on the new zone).
- Keep external subject-matter and affected-community review marked pending until actually completed.

Resolved (no longer blockers): URL-policy decision (extensionless accepted, landed 2026-06-21); Cloudflare Pages deploy + CI/CD (live); zone creation + custom-domain registration (done, pending NS only).
