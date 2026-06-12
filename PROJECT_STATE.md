# Project State

Last updated: 2026-06-12

## Summary

`eugenics.net` is an Astro static education and archive site. The source tree is production-prepared for Cloudflare Pages, but the public apex domain is not currently serving this project.

## Current Production Truth

- Public URL checked: `https://eugenics.net/`
- Current response: redirects to `https://forsale.dynadot.com/eugenics.net?drefid=2071`
- Status: production domain is not connected to this Astro site
- Production smoke: expected to fail until Cloudflare Pages custom-domain/DNS binding is completed
- Cloudflare deploy/status: blocked on OpenClaw because Wrangler is not authenticated and `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` are not present in the remote environment
- DNS observation varies by resolver (`198.18.1.200` locally, `54.215.31.113` from OpenClaw), but both paths resolve to the same Dynadot parked-domain redirect.

## Latest Validation Evidence

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

- Bind `eugenics.net` to the Cloudflare Pages project.
- Confirm Cloudflare zone/DNS state for the apex domain.
- Provision OpenClaw Cloudflare auth without printing secrets: `CLOUDFLARE_API_TOKEN` and, if required, `CLOUDFLARE_ACCOUNT_ID`.
- Run Cloudflare deploy and record deployment evidence after auth is present.
- Run `bash ./deploy.sh deploy-closeout` and confirm Cloudflare status plus local/OpenClaw production smoke, non-Dynadot response, and security headers.
- Confirm `corrections@eugenics.net` is provisioned and monitored.
- Keep external subject-matter and affected-community review marked pending until actually completed.
