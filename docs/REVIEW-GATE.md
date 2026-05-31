# Review Gate

V3 is a pre-launch authority-quality gate. Passing build is not enough. Pages need visible content, source coverage, claim review, teaching safety, and archive boundaries.

## Page Tiers

### Flagship Articles

Required routes:

- `what-is-eugenics.html`
- `eugenics-and-scientific-racism.html`
- `forced-sterilization-laws.html`
- `eugenics-in-the-united-states.html`
- `eugenics-vs-genetics.html`

Gate:

- Visible rendered word count: at least 3000.
- Source packet sources: at least 10.
- Visible FAQ in article frontmatter and matching FAQPage schema.
- Source packet claim map, source coverage, teaching use, and "What This Page Does Not Do".
- Answer-first summary in the first article screen.

### Standard Articles

Gate:

- Visible rendered word count: at least 1500.
- Source packet sources: at least 5.
- Source packet exists and is linked from article frontmatter.
- Discussion questions, related reading, source quality note, and explicit anti-endorsement position.

### Static and Hub Pages

Gate:

- Source packet exists and is rendered.
- Title, meta description, canonical, JSON-LD, H1, and trust surface are present.
- Teaching and Archive pages: at least 2000 visible words.
- Glossary: at least 25 terms and DefinedTermSet JSON-LD.
- Archive: publication gate plus three fully annotated non-download sample entries.

## Source Review

Every source in a packet must answer five questions:

- What role does the source play?
- Which claims does it support?
- What are its limits or caveats?
- What sensitive language or harm context does it require?
- Which affected communities are named?

If any answer is missing, the page is not ready for launch.

## No-Advice Gate

Pages must not give:

- Medical advice.
- Reproductive advice.
- Genetic counseling advice.
- Fertility advice.
- Legal advice.
- Instructions for coercive policy design.

Modern genetics and bioethics pages can discuss governance, consent, privacy, disability rights, and discrimination boundaries, but they must not guide personal medical or reproductive decisions.

## Archive Gate

Raw primary sources, propaganda, image scans, case files, and downloadable historical materials are blocked until an item has:

- Provenance.
- Rights review.
- Content warning.
- Harmful-claim summary.
- Affected-community note.
- Editorial reason for inclusion.
- Accessibility notes.
- Review owner and date.

This release can publish annotated models and contextual summaries. It must not publish raw propaganda or primary-source downloads.

## Validation Chain

Local non-runtime:

```sh
git status --short --ignored
find . -maxdepth 1 \( -name node_modules -o -name dist -o -name .astro -o -name _astro -o -name .codex-results \) -print
node scripts/content-quality-audit.mjs
node scripts/site-integrity.mjs
xmllint --noout sitemap.xml
rg "<unfinished-marker-pattern>" .
```

OpenClaw runtime:

```sh
bash scripts/sync-openclaw.sh
~/.codex/bin/openclaw-ops exec --project eugenics-net --cmd 'npm install'
~/.codex/bin/openclaw-ops exec --project eugenics-net --cmd 'npm run build && npm run export:root && npm run check:site'
OPENCLAW_QA_BASE_URL=http://localhost:3350 npm run qa:openclaw
```

If managed preview is unstable, use the documented OpenClaw SSH preview fallback only. Do not fall back to local Mac preview.
