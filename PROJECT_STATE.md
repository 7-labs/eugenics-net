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
- DNS observation varies by resolver (`198.18.12.163` locally, `54.215.31.113` from OpenClaw), but both paths resolve to the same Dynadot parked-domain redirect.

## Latest Validation Evidence

- 2026-06-12 OpenClaw `bash ./deploy.sh validate`: passed.
- OpenClaw `npm install`: passed with 0 vulnerabilities.
- OpenClaw `npm run check:all`: passed; Astro built 36 pages, `export:root` completed, production dependency audit reported 0 vulnerabilities, content quality passed with 0 warnings, site integrity passed with 5 upstream external-link warnings only.
- Browser QA: passed against OpenClaw preview for 36 routes across desktop and mobile viewports, producing 72 screenshots at `/Users/openclaw/artifacts/eugenics-net/browser-qa/20260612-124912`.
- Local static checks on 2026-06-12: `node scripts/content-quality-audit.mjs` passed with 36 routes and 0 warnings; `node scripts/site-integrity.mjs` passed with 36 routes and 1 upstream external-link warning; `git diff --check`, `bash -n deploy.sh`, and `xmllint --noout sitemap.xml` passed.
- Deploy readiness preflight on 2026-06-12: blocked because no usable Cloudflare deploy auth path is proven in the current shell/environment.

Historical validation:

- OpenClaw `npm ci`: passed with 0 vulnerabilities after Astro 6.4.3 and Wrangler installation.
- OpenClaw `npm run check:security:all`: passed with 0 vulnerabilities.
- OpenClaw `npm run check:all`: passed; Astro built 36 pages, `export:root` completed, content quality passed with 0 warnings, site integrity passed with only upstream external-link warnings.
- Browser QA: passed against OpenClaw preview for 36 routes across desktop and mobile viewports, producing 72 screenshots plus summary at `/Users/openclaw/artifacts/eugenics-net/browser-qa/20260603-081116`.
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
