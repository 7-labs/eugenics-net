# Deployment Runbook

This project is an Astro static site. Local SSD work is for source edits, git, and short non-runtime checks only. Dependency installation, build, preview, browser QA, and Cloudflare deploy run on OpenClaw.

## Current Production State

As of 2026-06-03, `https://eugenics.net/` does not serve this project. Public smoke shows the apex domain redirects to Dynadot's parked-domain flow. Do not mark production complete until:

- Cloudflare Pages has a successful deployment for this project.
- `eugenics.net` is added as a Cloudflare Pages custom domain.
- DNS is pointed at Cloudflare as required for the apex domain.
- `npm run check:production` passes against `https://eugenics.net`.
- Cloudflare deployment state or dashboard logs confirm the latest deployment.

## Commands

From the SSD project root:

```bash
bash ./deploy.sh preflight
bash ./deploy.sh readiness
bash ./deploy.sh validate
bash ./deploy.sh deploy-cf
bash ./deploy.sh deploy-closeout
bash ./deploy.sh production-smoke
bash ./deploy.sh cf-status
```

`bash ./deploy.sh readiness` checks the current production URL, DNS observations, and whether the remote shell has Cloudflare deploy credentials. It does not print secret values.

`bash ./deploy.sh validate` syncs to OpenClaw, installs dependencies on OpenClaw, builds, exports static root output, runs content/site checks, starts a temporary OpenClaw preview, runs browser QA across all sitemap routes, and stops the preview.

`bash ./deploy.sh deploy-cf` syncs to OpenClaw, runs the safety check, verifies Cloudflare auth readiness, installs dependencies, runs the production dependency audit, builds, and runs:

```bash
npm run deploy:cloudflare
```

`bash ./deploy.sh deploy-closeout` is the release acceptance gate after deploy and custom-domain binding. It checks Cloudflare status/deployment list, production readiness from the local control plane, local production smoke, production readiness from OpenClaw, and OpenClaw production smoke. It must fail while `eugenics.net` is parked at Dynadot or while Cloudflare auth is missing.

## Cloudflare Pages Requirements

Cloudflare Pages uses:

- `public/_headers` for security headers and cache policy.
- `public/_redirects` for `www` to apex redirect.
- `dist/` as the upload directory after `npm run build`.

The CSP keeps executable scripts first-party only. Pagefind search adds the scoped WebAssembly token `script-src 'self' 'wasm-unsafe-eval'`; inline `application/ld+json` blocks are structured data, not application scripts. Do not add `unsafe-inline` or third-party script origins without a specific approved task.

For the apex custom domain, Cloudflare's current Pages documentation requires the domain to be added as a Pages custom domain and, for apex usage, the domain must be a Cloudflare zone with nameservers configured for Cloudflare.

## Legacy URL Policy

The canonical URL-level audit is `docs/LEGACY-URLS.md`. It uses Wayback Machine CDX data only and does not import, mirror, quote, or summarize prior-owner page content.

Redirects should stay narrow:

- Keep old-owner topical pages, PDFs, image galleries, scripts, ad/tracking files, cPanel defaults, and malformed crawler URLs as 404 unless a future human editorial review approves a specific contextual target.
- Redirect only safe index aliases that clearly map to the current homepage: `/index.shtml` and `/index2.html`.
- Do not add feed redirects until `/rss.xml` exists.
- Do not add `/llms.txt` handling until that optional file exists.

## Credential Gate

OpenClaw must have non-interactive Cloudflare credentials before deploy, status, or log evidence can run:

- `CLOUDFLARE_API_TOKEN`: required by Wrangler in non-interactive shells.
- `CLOUDFLARE_ACCOUNT_ID`: required when the token or account context is not otherwise discoverable.

Check without printing secrets:

```bash
ssh openclaw 'if printenv CLOUDFLARE_API_TOKEN >/dev/null; then echo token=present; else echo token=missing; fi'
bash ./deploy.sh readiness
```

If this gate fails, do not attempt production deploy. Fix OpenClaw environment/auth first, then rerun `bash ./deploy.sh cf-status`.

## Production Smoke

Run:

```bash
PRODUCTION_BASE_URL=https://eugenics.net npm run check:production
```

The smoke fails if:

- Any checked route redirects to `forsale.dynadot.com`.
- HTML routes miss core content markers.
- HTML routes miss key security headers.
- `robots.txt`, `sitemap.xml`, or `style.css` do not match the generated site.

## Cloudflare Evidence

For a static Pages site, runtime request logs may be limited because there are no Pages Functions. Use these production receipts:

- `npx wrangler whoami`
- `npx wrangler pages deployment list --project-name eugenics-net`
- Cloudflare Pages dashboard deployment details for the latest deployment.
- Custom domain status in Cloudflare Pages.
- `bash ./deploy.sh deploy-closeout` output after DNS/custom domain binding.
- Response headers from `curl -I https://eugenics.net/`.

Record the result in `ops/deploy-ledger.jsonl` after every deploy or failed deploy attempt.

## Rollback

Use the Cloudflare Pages dashboard to roll back to a previous successful deployment. After rollback, rerun:

```bash
PRODUCTION_BASE_URL=https://eugenics.net npm run check:production
```

If the domain still points to Dynadot or any non-project origin, rollback is not the relevant fix; DNS/custom-domain binding is.
