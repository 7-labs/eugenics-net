# SEO Operations

Last updated: 2026-06-12

## Pagefind Search CSP Note

The site search page is static and uses Pagefind's default UI assets from `/pagefind/`. Pagefind's browser bundle runs WebAssembly for the local search index, so Cloudflare Pages must allow:

```text
script-src 'self' 'wasm-unsafe-eval'
```

Keep this exception scoped exactly as above. Do not add `unsafe-inline`, wildcard script origins, or third-party search scripts.

Operational checks:

- `bash ./deploy.sh validate`
- `node scripts/site-integrity.mjs`
- On OpenClaw preview, search `Buck v. Bell` and confirm the result links to `/buck-v-bell-forced-sterilization.html`.
