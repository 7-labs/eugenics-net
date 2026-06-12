# eugenics.net — Development & Launch Roadmap

Last updated: 2026-06-12
Status: pre-launch. Production domain still parked at Dynadot (verified 2026-06-12: `https://eugenics.net/` → 302 → `forsale.dynadot.com`).

This document is the roadmap half of the combined execution spec. It must be read with `docs/DEV-LAUNCH-PLAN.md`; where the two documents conflict, the stricter static-site, dependency-budget, editorial-gate, and runtime-boundary rule wins. Every task has an ID, an owner, file paths, steps, and acceptance criteria. Do not invent scope beyond these documents.

---

## 0. Hard Invariants (read first — violating any of these is a failed task)

These rules override anything else you think is a good idea.

1. **Runtime boundary.** The local SSD checkout is control-plane only: source edits, git, docs, short static checks (`node scripts/*.mjs`). NEVER run `npm install`, `npm run dev/build/preview`, Playwright, or any server locally. All runtime goes through OpenClaw via `bash ./deploy.sh validate` (see `docs/DEPLOYMENT.md`).
2. **URL structure is frozen.** Flat `*.html` URLs at the site root, produced by `astro.config.mjs` → `build.format: "file"`. Do NOT migrate to directory URLs, do NOT add trailing-slash routes, do NOT rename any existing slug. Existing URLs are the SEO asset.
3. **Zero client-side JavaScript by default.** The public UI currently ships no application JS (only inline JSON-LD). Any task that adds JS must say so explicitly in this document (only P3-T2 search does). Never add React/Vue/jQuery/analytics-by-default/third-party embeds.
4. **CSP must stay intact.** `public/_headers` is the source of truth. If a task requires a CSP change, the exact new directive is specified in the task. Never loosen CSP beyond what a task specifies.
5. **Editorial gates are law.** `docs/REVIEW-GATE.md` (word counts, source packets, claim maps), `docs/CONTENT-SOP.md`, the No-Advice gate (no medical/reproductive/genetic-counseling/legal advice), and the Archive gate (no raw propaganda or primary-source downloads) apply to ALL new content. The site is a *critical history* project: every page must keep the explicit anti-eugenics framing (`SITE.globalAlert` in `src/data/site.ts`). Never weaken gate thresholds in `scripts/content-quality-audit.mjs` or `scripts/site-integrity.mjs` to make a check pass.
6. **Validation before "done".** A task is complete only when its listed acceptance commands pass and the output is recorded. `curl 200` is never acceptance evidence for UI work; browser QA on OpenClaw is.
7. **Generated root output.** Top-level `*.html`, `sitemap.xml`, `style.css` at repo root are BUILD ARTIFACTS exported by `scripts/export-root.mjs` from the OpenClaw build. Never hand-edit them; edit `src/` and re-export via `bash ./deploy.sh validate`.
8. **Record keeping.** After every deploy attempt (success or failure) append to `ops/deploy-ledger.jsonl`. After every phase, update `PROJECT_STATE.md` (summary + evidence) and the `updates.html` source page (`src/pages/updates.astro` data).
9. **Dependency budget.** Approved additions remain only `pagefind` and `@astrojs/rss` unless the human owner explicitly approves another package. Prefer dependency-free implementations when practical.

### Anti-scope (do NOT build any of these)

- No CMS, no admin panel, no database, no Pages Functions/Workers backend (v1 is fully static).
- No user accounts, comments, newsletters, or contact forms (corrections flow is email-only by design).
- No i18n/multilingual routes in this roadmap.
- No cookie banners (no cookies are set; analytics in P2-T6 is cookieless).
- No AI-generated images of historical subjects; no raw primary-source/propaganda publishing (Archive gate).
- No paid link building, no doorway/thin pSEO pages (would violate `commonSources.googleSpam` policy the site itself cites).

---

## 1. Current State Snapshot (verified 2026-06-12)

**Stack:** Astro 6.4.3 static output → Cloudflare Pages (intended). No backend. Playwright + custom QA scripts on OpenClaw. Deploy orchestration via `./deploy.sh`.

**Built surface:** 36 routes — 25 foundation articles (content collection `src/content/articles/*.md`), 11 hub/static pages, generated `sitemap.xml`, `robots.txt`, security `_headers`, `www→apex` redirect.

**Quality infrastructure already in place (do not duplicate):**
- `scripts/content-quality-audit.mjs` — word counts, FAQ, packet linkage per page tier
- `scripts/site-integrity.mjs` — route/metadata/sitemap/link gate
- `scripts/openclaw-browser-qa.mjs` — desktop+mobile screenshots of every sitemap route
- `scripts/production-smoke.mjs`, `scripts/cloudflare-readiness.mjs`, `deploy.sh` lifecycle
- Source-packet system: `src/content/source-packets/*.json` (claim maps, source coverage, teaching use) rendered by `SourcePacketPanel.astro`
- SEO foundation: canonical, OG/Twitter meta, JSON-LD (Article, WebSite, WebPage, BreadcrumbList, FAQPage, LearningResource, DefinedTermSet) in `src/utils/seo.ts`

**Known gaps (this roadmap closes them):**

| Gap | Impact | Fixed in |
| --- | --- | --- |
| Domain parked at Dynadot; no Cloudflare auth on OpenClaw | Site is not live at all | Phase 1 |
| ~82 files of uncommitted V3-follow-up work in the tree | Un-snapshotted baseline | Phase 0 |
| No favicon set | Trust/brand signal, browser tab, GSC | P2-T2 |
| No 404 page | Crawl/UX dead-end | P2-T3 |
| Single shared OG image (`archive-reading-room.webp`) | Weak social CTR | P2-T4 |
| No RSS feed | No subscription/distribution channel | P2-T5 |
| No analytics, no uptime monitoring | Flying blind post-launch | P2-T6/T7 |
| No site search | Findability across 36+ pages | P3-T2 |
| No print styles | Teacher UX | P3-T4 |
| No automated a11y audit | WCAG risk on an education site | P3-T5 |
| Glossary 32 terms; 25 articles | Topical authority ceiling | Phase 4 |

---

## 2. Phase Plan Overview (ROI-ordered)

| Phase | Goal | Owner mix | Gate to next phase |
| --- | --- | --- | --- |
| 0 | Commit & baseline the working tree | Codex | `check:site` green, clean `git status` |
| 1 | **GO LIVE** — domain, Cloudflare Pages, closeout | **Human-led**, Codex assists | `deploy.sh deploy-closeout` passes |
| 2 | Launch-week SEO & observability hardening | Codex | GSC verified + new assets in production smoke |
| 3 | UI/UX upgrade | Codex | Browser QA + a11y audit green |
| 4 | Content growth engine (recurring batches) | Codex + human review | Each batch passes REVIEW-GATE |
| 5 | Authority, distribution, ongoing ops | Human-led | n/a (continuous) |

Phases 2 and 3 may run in parallel after Phase 1. Phase 4 runs as repeating batches forever. Nothing in Phases 2–5 may start before Phase 1's closeout gate passes, except pure-source-code tasks explicitly marked **[pre-launch OK]**.

---

## Phase 0 — Repo Hygiene & Baseline (Codex, ~half day)

### P0-T1: Validate and commit the pending working tree

The tree has ~82 modified files (V3 follow-up: layout/SEO/source-packet refinements + regenerated root HTML). Snapshot it before any new work.

Steps:
1. `git status --short` and `git diff --stat` — confirm changes are limited to `src/`, `scripts/`, `docs/`, root `*.html` artifacts, `sitemap.xml`, `package*.json`, `README.md`.
2. Local static checks: `node scripts/content-quality-audit.mjs && node scripts/site-integrity.mjs` must pass.
3. Full runtime validation: `bash ./deploy.sh validate` (runs on OpenClaw: install → build → export → check:site → browser QA). Re-export regenerates root HTML; confirm `git diff` afterwards is stable (no churn).
4. Commit everything as one baseline commit, message: `Snapshot V3 follow-up content and layout refinements`.

Acceptance: clean `git status`; `deploy.sh validate` output recorded in `PROJECT_STATE.md` ("Latest Validation Evidence" section).

### P0-T2: Remove stray artifacts

- Delete `eugenics_site.zip` from repo root (legacy import artifact) via git; confirm nothing references it (`rg eugenics_site` → no hits).
- Add `.DS_Store` to `.gitignore` if not present.

Acceptance: `rg -l "eugenics_site.zip"` returns nothing; `git status` clean.

---

## Phase 1 — Production Launch (P0 — the only thing that matters until done)

Everything else in this roadmap has zero value while the domain serves a Dynadot parking page. Tasks marked **[HUMAN]** require account/DNS/payment access that Codex does not have — Codex must NOT attempt them, NOT mock them, and NOT mark them done. Codex's job in Phase 1 is verification and evidence.

### P1-T1 [HUMAN]: Unpark the domain & create the Cloudflare zone

1. In Dynadot: remove the domain from the parking/for-sale program for `eugenics.net`.
2. In Cloudflare: add `eugenics.net` as a zone (Free plan is fine).
3. In Dynadot: set nameservers to the two Cloudflare-assigned nameservers.
4. Wait for the zone to go Active.

### P1-T2 [HUMAN]: Provision Cloudflare credentials on OpenClaw

1. Create a Cloudflare API token scoped to: Account → Cloudflare Pages: Edit. (Plus Zone:DNS:Edit if DNS will be managed via Wrangler/API.)
2. Place `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` into the OpenClaw shell environment (persistent, non-interactive — e.g. `~/.zshenv` on OpenClaw). Never paste values into chat, code, or this repo.

Codex verification (no secrets printed):
```bash
ssh openclaw 'if printenv CLOUDFLARE_API_TOKEN >/dev/null; then echo token=present; else echo token=missing; fi'
bash ./deploy.sh readiness
```

### P1-T3 [HUMAN]: Provision corrections@eugenics.net

Use Cloudflare Email Routing on the new zone (free): route `corrections@eugenics.net` → the owner's monitored inbox. Send a test mail and confirm receipt.

### P1-T4 (Codex): Backlink / legacy-URL audit

Before launch, check what URLs the domain historically served so we don't 404 valuable inbound links.

Steps:
1. Query the Wayback Machine CDX API for historical paths: `curl 'http://web.archive.org/cdx/search/cdx?url=eugenics.net*&output=json&collapse=urlkey&limit=500'` (run from OpenClaw if local network policy blocks it).
2. List any historically meaningful paths that returned 200 and don't exist in the current sitemap.
3. For each: decide map → nearest current page (add a line to `public/_redirects`, 301) or intentionally drop (document as 410-acceptable in `docs/DEPLOYMENT.md`).
4. Record findings in `docs/LEGACY-URL-AUDIT.md` (new file): table of old path → disposition → rationale.

Acceptance: `docs/LEGACY-URL-AUDIT.md` exists with every CDX path dispositioned; `_redirects` additions (if any) pass `bash ./deploy.sh validate`.

### P1-T5 (Codex): Deploy to Cloudflare Pages

Precondition: P1-T2 verification shows `token=present`.

```bash
bash ./deploy.sh preflight
bash ./deploy.sh readiness
bash ./deploy.sh validate
bash ./deploy.sh deploy-cf
```

Then **[HUMAN]** (or Codex via API if token scope allows): in Cloudflare Pages project `eugenics-net`, add custom domains `eugenics.net` and `www.eugenics.net`.

### P1-T6 (Codex): Launch closeout

```bash
bash ./deploy.sh deploy-closeout
bash ./deploy.sh production-smoke
curl -sI https://eugenics.net/ | head -20   # expect 200, CF headers, HSTS, no Dynadot
```

Acceptance (all required):
- `deploy-closeout` passes end-to-end (Cloudflare status + local & OpenClaw production smoke).
- No route redirects to `forsale.dynadot.com`.
- Security headers from `public/_headers` visible on production responses.
- Append a success entry to `ops/deploy-ledger.jsonl`; update `PROJECT_STATE.md` "Current Production Truth"; update the production-blocker note on the Updates page (`src/pages/updates.astro`) to "resolved" with date, rebuild, redeploy.

### P1-T7: Search-engine registration

- **[HUMAN]**: create/confirm Google Search Console + Bing Webmaster Tools access for `eugenics.net` (DNS TXT verification on the Cloudflare zone is preferred — survives redeploys).
- (Codex) Submit `https://eugenics.net/sitemap.xml` in both consoles once verified; confirm robots.txt fetch is clean; request indexing for the 5 flagship articles listed in `docs/REVIEW-GATE.md`.

Acceptance: GSC property verified, sitemap status "Success", screenshot/notes recorded in `PROJECT_STATE.md`.

---

## Phase 2 — Launch-Week SEO & Observability Hardening (Codex, ~2–3 days)

All tasks here are **[pre-launch OK]** to *develop*, but only count as done after they pass `deploy.sh validate` and (post-launch) appear in production smoke.

### P2-T1: Extend production smoke for new assets

As T2–T5 land, extend `scripts/production-smoke.mjs` to also check: `/favicon.ico` (200), `/404.html` content marker, `/rss.xml` (200 + `<rss`), and one selected static OG image URL after the per-tier OG task lands. Keep failures precise (one line per failed check).

### P2-T2: Favicon & app icons

Files: `public/favicon.svg` (primary, dark-mode aware via `prefers-color-scheme` media query inside the SVG), `public/favicon.ico` (32px fallback), `public/apple-touch-icon.png` (180px), `public/icon-192.png`, `public/icon-512.png`, `public/site.webmanifest`.

Design constraints: somber archival aesthetic consistent with `src/styles/global.css` palette; a simple monogram/abstract archive mark; NO imagery referencing eugenics symbols, calipers, family trees used in eugenic propaganda, or DNA helixes with people. Keep it abstract (e.g., stylized open book / column / "E:" mark).

Wire-up: add `<link rel="icon" ...>`, `<link rel="apple-touch-icon" ...>`, `<link rel="manifest" ...>` to `src/layouts/BaseLayout.astro` head. Add immutable cache rules for the icon files in `public/_headers`.

Acceptance: icons appear in OpenClaw browser-QA screenshots (tab not verifiable in screenshot — verify via `curl -sI` 200 + correct content-type on preview); `site-integrity` passes.

### P2-T3: 404 page

File: `src/pages/404.astro` using `BaseLayout`. Content: short "page not found" explanation, links to Home / History / Archive / Glossary, the standard global alert banner, search hint (after P3-T2, add search box). Cloudflare Pages automatically serves root `404.html` for static projects — `build.format: "file"` already emits the right filename.

Important: ensure `scripts/site-integrity.mjs` and the sitemap generator EXCLUDE `404.html` from the sitemap (check `src/pages/sitemap.xml.ts`; exclude the route explicitly). `noindex` robots meta on the 404 page.

Acceptance: build emits `404.html`; sitemap does not contain it; production (post-launch) returns the page body with HTTP 404 for a garbage URL.

### P2-T4: Per-tier OG images (static, dependency-free)

Goal: each article and hub page gets an appropriate 1200×630 OG image selected from a small static set: default, history, bioethics, and teaching/archive. No photos of people, no historical propaganda imagery, and no generated-per-article dependency path.

Implementation (static only, zero runtime JS, zero new dependencies):
1. Create four static PNG assets under `public/assets/`: `og-default.png`, `og-history.png`, `og-bioethics.png`, and `og-teaching.png`.
2. Map page/section to image in `src/data/site.ts`; layouts pass the selected path to `BaseLayout.astro`.
3. `BaseLayout.astro`: add `og:image:width`, `og:image:height`, and `og:image:alt`.
4. Update `articleJsonLd`/meta plumbing in `src/utils/seo.ts` if needed.

Constraints: do not add `astro-og-canvas`, `satori`, `resvg`, `sharp`, or generated-per-article OG dependencies without explicit human approval.

Acceptance: the four static images exist, each is under 120 KB if practical, OG meta on every page points to a resolvable section image, one image is visually spot-checked via OpenClaw artifact or local metadata, and card validators pass post-launch (record in PROJECT_STATE.md).

### P2-T5: RSS feed

Files: add `@astrojs/rss` dev path or hand-roll `src/pages/rss.xml.ts` (hand-rolled is fine and dependency-free; prefer it).
Content: all 25+ articles from the content collection, `title`, `description`, `link` (canonical `.html` URL), `pubDate` from frontmatter `lastUpdated`. Feed metadata from `SITE`.
Wire-up: `<link rel="alternate" type="application/rss+xml" ...>` in `BaseLayout.astro`; add `/rss.xml` to `_headers` with 300s cache; list the feed on the Updates page.

Acceptance: `rss.xml` in build output, validates against W3C feed validator rules (well-formed XML, RFC-822 dates — check with `xmllint --noout`), not in sitemap.

### P2-T6: Privacy-respecting analytics (Umami, self-hosted)

The VPS toolbox stack (107.174.42.198, `/opt/docker-projects/toolbox/`) already runs Umami. 

Steps:
1. **[HUMAN]** confirm the public Umami URL and create a website entry for eugenics.net → get the website ID + script URL.
2. Add the Umami `<script defer src="https://<umami-host>/script.js" data-website-id="...">` to `BaseLayout.astro`, gated behind a `SITE.analytics` config object in `src/data/site.ts` so it can be disabled by config.
3. CSP update in `public/_headers` — this is the ONLY permitted change: append the exact Umami origin to `script-src` and `connect-src`. Example: `script-src 'self' 'unsafe-inline' https://umami.example.org; connect-src 'self' https://umami.example.org`. No wildcard origins.
4. Document in `editorial-policy`/privacy note: cookieless, no personal data, IP-anonymized analytics; no cookie banner needed.

Acceptance: page views appear in Umami from an OpenClaw browser-QA run against production; CSP report shows no violations (check browser console messages in QA run); documented in the policy page.

### P2-T7: Uptime monitoring

**[HUMAN-assisted]**: add `https://eugenics.net/` and `https://eugenics.net/sitemap.xml` to the existing Uptime-Kuma instance in the VPS toolbox (keyword check: a phrase from the homepage, e.g. "critical history"). Alert channel: owner's preferred. Codex records the monitor IDs in `docs/DEPLOYMENT.md` under a new "Monitoring" section.

### P2-T8: llms.txt (optional, 30 min)

Add `public/llms.txt`: site purpose, anti-eugenics editorial stance, pointer to editorial policy/corrections, list of flagship articles with one-line descriptions. This is cheap insurance for AI-crawler summarization getting the site's stance right — which matters unusually much for this domain name.

Acceptance: served at `/llms.txt`, listed in README public surface.

---

## Phase 3 — UI/UX Upgrade (Codex, ~3–4 days, parallel with Phase 2)

Design direction: the site already has a restrained, archival, text-first visual system (`src/styles/global.css`, ~750 lines, custom properties). UPGRADE it — do not replace it, do not add Tailwind/shadcn, do not introduce a component framework. Each task ends with `bash ./deploy.sh validate` (full browser QA, desktop + mobile).

### P3-T1: Typography & reading-experience pass

Scope (CSS + layout templates only):
1. Fluid type scale via `clamp()` for h1–h4 and body; line-length cap `max-width: 70ch` on article bodies; `line-height` ≥ 1.6 body text.
2. Self-hosted variable font is OPTIONAL; if added: one family, WOFF2 only, `font-display: swap`, preloaded in `BaseLayout`, cached immutable in `_headers`. System-font stack is an acceptable final answer — decide by visual result in browser QA, not by preference.
3. Article page (`src/layouts/ArticleLayout.astro`): add a sticky in-page table of contents on ≥1024px viewports (pure CSS positioning; anchor list generated at build from headings), "On this page" collapsible (`<details>`) on mobile.
4. Visible focus states on every interactive element; `:focus-visible` styling consistent with palette.

Acceptance: browser QA screenshots (desktop+mobile) for home, one flagship article, glossary show the new system; no horizontal scroll at 360px; `site-integrity` green.

### P3-T2: Site search (Pagefind — the one permitted JS addition)

1. Add `pagefind` as devDependency; run the indexer after `astro build` (modify the `build` npm script: `astro build && pagefind --site dist`). OpenClaw-only.
2. Add a `/search.html` page (`src/pages/search.astro`) hosting the Pagefind UI, plus a small search input in `SiteHeader.astro` that links to `/search.html` (no inline JS in the header).
3. Progressive enhancement: `search.astro` must render a useful noscript fallback (links to Glossary, Archive, sitemap-style index of all articles).
4. CSP: Pagefind needs `script-src 'self' 'wasm-unsafe-eval'` (WASM). Add exactly that token to `_headers`; nothing else. Verify no CSP violations in QA console output.
5. Exclude the search page itself from indexing (`data-pagefind-ignore` on chrome; `noindex` is NOT needed — page can be indexed, but keep it out of the "article" tier in `content-quality-audit` expectations; update the audit script's page-tier map accordingly).

Acceptance: OpenClaw browser QA — type a query ("sterilization") on the preview, results render; zero console errors; `check:security` clean; CSP intact otherwise.

### P3-T3: Reserved

Dark mode is deliberately out of scope under the combined plan. Use this slot only if the human owner explicitly reopens the decision. Print styles remain the higher-ROI reader/teacher task.

### P3-T4: Print styles

`@media print` in `global.css`: hide nav/footer/banners, serif body, show URLs after external links in source lists (`a[href^="http"]::after { content: " (" attr(href) ")" }` scoped to source sections), page margins, avoid breaking inside FAQ/source-packet blocks. The Teaching page audience prints these pages — that's the use case.

Acceptance: print-to-PDF of one flagship article on OpenClaw (Playwright `page.pdf()`) attached as artifact; visually sane.

### P3-T5: Accessibility audit & fixes (WCAG 2.2 AA)

1. Do not add `@axe-core/playwright` by default. First try an OpenClaw-only `npx --yes @axe-core/cli` run against the preview for sitemap routes, or request explicit approval for a repo devDependency if the CLI route fails.
2. Fix everything it finds. Expected fixes: skip-to-content link, landmark roles, heading order, contrast in banner/alert components, table headers in timeline/glossary, `aria-expanded` only where state actually changes.
3. Document the gate in `docs/REVIEW-GATE.md` (new "Accessibility Gate" section: zero serious/critical axe violations on every route).

Acceptance: `npm run check:a11y` green across all routes on OpenClaw; gate documented.

---

## Phase 4 — Content Growth Engine (recurring; Codex drafts + human review gate)

This is the long-term traffic engine. It must run as **batches of ≤5 articles**, each batch a separate release through the full REVIEW-GATE. Never bulk-generate dozens of thin pages (Anti-scope; spam policy).

### P4-T1: Batch pipeline definition (one-time)

Create `docs/CONTENT-BATCH-SOP.md` describing the repeatable loop (this is a doc task; the loop itself repeats per batch):
1. Pick ≤5 slugs from the backlog (P4-T2).
2. For each: write `src/content/articles/<slug>.md` (standard-article tier: ≥1500 visible words, ≥450 before packets, FAQ frontmatter, discussion questions, related reading, anti-endorsement positioning) + `src/content/source-packets/<slug>.json` (≥5 sources, full claim map, the five source-review questions answered).
3. Add slug to `foundationalArticles` in `src/data/site.ts`; cross-link from ≥2 existing related articles' related-reading lists and the relevant hub page (History/Bioethics/Teaching).
4. `node scripts/content-quality-audit.mjs` locally → `bash ./deploy.sh validate` → human editorial review (REQUIRED — Codex marks batch "awaiting editorial review", never self-approves) → deploy → GSC request-indexing for new URLs → ledger + Updates page entry.

### P4-T2: Article backlog (priority order)

Backlog file: `docs/CONTENT-BACKLOG.md` (create from this list; keep it the single source of truth; mark status per slug).

Batch A — people & institutions (highest internal-link leverage with existing pages):
- `harry-laughlin-and-model-sterilization-law`
- `madison-grant-and-scientific-racism`
- `karl-pearson-and-biometrics`
- `marie-stopes-and-eugenics`
- `cold-spring-harbor-and-american-eugenics`

Batch B — law & policy:
- `skinner-v-oklahoma`
- `immigration-act-of-1924`
- `racial-integrity-act-of-1924`
- `california-sterilization-program`
- `north-carolina-eugenics-board`

Batch C — international:
- `eugenics-in-australia`
- `eugenics-in-japan`
- `eugenics-in-norway-denmark-finland`
- `eugenics-in-switzerland`
- `eugenics-and-colonialism`

Batch D — modern bioethics (strict No-Advice gate review):
- `he-jiankui-crispr-babies-case`
- `genetic-discrimination-and-gina`
- `prenatal-screening-disability-critique`
- `human-genome-editing-governance`
- `eugenics-rhetoric-in-modern-tech`

Constraints for every article: sources must be institutional/scholarly (museums, university archives, courts, UN bodies, peer-reviewed); modern-topic pages must discuss governance/history/critique only — never guidance for personal medical or reproductive decisions; affected communities named per the source-review questions.

### P4-T3: Glossary expansion 32 → 60 terms

Extend `src/data/glossary.ts` (+28 terms: e.g., biometrics, racial hygiene, fitter families contests, feeblemindedness (as historical label, with framing note), miscegenation laws, negative/positive eugenics, social Darwinism, germ plasm theory, Lebensborn, T4 program, genetic counseling (historical origin), newgenics, liberal eugenics, ableism, sanism…). Each: term, plain-language definition, historical-framing note where the term itself is a slur or pseudo-clinical label. DefinedTermSet JSON-LD updates automatically via the existing page. Update the glossary minimum in `docs/REVIEW-GATE.md` from 25 → 50 once landed.

### P4-T4: Timeline enrichment

`eugenics-timeline-1883-present` is a flagship-adjacent asset. Move timeline entries into structured data (`src/data/timeline.ts`), render from data, add decade anchors (`id` per decade) so other articles can deep-link (`...timeline-1883-present.html#1920s`). Every new Phase 4 article must link to its decade anchor.

### P4-T5: Internal-link integrity automation

Extend `scripts/site-integrity.mjs`: every article must (a) be reachable from ≥1 hub page, (b) contain ≥3 internal links to other articles, (c) have ≥2 inbound internal links. Fail the gate otherwise. This keeps the cluster structure healthy as content grows.

---

## Phase 5 — Authority, Distribution & Ongoing Ops (human-led; Codex assists)

- **Outreach** [HUMAN]: notify the institutions the site cites heavily (Eugenics Archives Canada, university disability-studies programs, USHMM education dept) — ask for resource-page listing consideration. Honest education outreach only; no paid links.
- **Expert review program** [HUMAN]: recruit ≥1 historian + ≥1 disability-rights reviewer; record reviews on `editorial-policy`/`corrections` pages. This unlocks the Archive gate for annotated primary-source items (currently blocked by REVIEW-GATE §Archive).
- **Quarterly ops** (Codex, recurring): dependency update + `check:security:all`; full `deploy.sh validate`; GSC coverage/CWV report review; link-rot pass (extend `site-integrity` external-link warnings into a report; fix or archive.org-swap dead citations); update `SITE.lastUpdated` and per-article `lastUpdated` only when content actually changes.
- **Corrections SLA**: triage `corrections@` weekly; every accepted correction → corrections page entry + Updates page note (per existing editorial policy).

---

## Execution Protocol for Codex (read before every work session)

1. Work strictly in phase order; within a phase, task order is the listed order unless a task is blocked on **[HUMAN]** — then skip and report the block, do not improvise around it.
2. One task = one commit (Phase 4: one batch = one commit). Commit message format: `P<phase>-T<n>: <imperative summary>`.
3. After every task: run the task's acceptance commands + `node scripts/content-quality-audit.mjs && node scripts/site-integrity.mjs` locally; run `bash ./deploy.sh validate` before any commit that touches `src/`, `scripts/`, or `public/`.
4. Never edit root `*.html` / `sitemap.xml` / `style.css` directly (build artifacts — see Invariant 7).
5. Every closeout reports: files changed, commands run with pass/fail output, blockers/assumptions/risks. No "should work". No claiming a [HUMAN] task is done.
6. If a check fails twice with different approaches, STOP and report — do not weaken the check (Invariant 5).
7. Keep `PROJECT_STATE.md`, `ops/deploy-ledger.jsonl`, `docs/CONTENT-BACKLOG.md` statuses current — they are the project's memory between sessions.

## Dependency graph (summary)

```
P0-T1 ─► P0-T2 ─► Phase 1
P1-T1 [H] ─► P1-T2 [H] ─► P1-T5 ─► P1-T6 ─► P1-T7
P1-T3 [H] ──────────────────────────► P1-T6 (corrections email live)
P1-T4 ──────────────────────────────► P1-T5 (redirects in build)
Phase 1 done ─► P2-* and P3-* (parallel; dev work pre-launch OK, acceptance post-launch)
P2-T2..T5 ─► P2-T1 (smoke covers new assets)
P3-T2 ─► P2-T3 (404 search hint) [soft]
Phase 2+3 done ─► Phase 4 batches (A ─► B ─► C ─► D)
Phase 4 cadence + expert review [H] ─► Phase 5 archive unlock
```
