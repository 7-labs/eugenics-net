import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const siteUrl = "https://eugenics.net";
const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

async function readText(file) {
  return fs.readFile(path.join(root, file), "utf8");
}

async function exists(file) {
  try {
    await fs.access(path.join(root, file));
    return true;
  } catch {
    return false;
  }
}

function routeToFile(route) {
  if (route === "/") return "index.html";
  return route.replace(/^\//, "");
}

function canonicalForRoute(route) {
  return new URL(route, siteUrl).toString();
}

function extractStaticPages(siteTs) {
  const match = siteTs.match(/export const staticPages = \[([\s\S]*?)\];/);
  if (!match) {
    fail("Could not find staticPages in src/data/site.ts");
    return [];
  }
  return Array.from(match[1].matchAll(/"([^"]+)"/g), (item) => item[1]);
}

async function expectedRoutes() {
  const siteTs = await readText("src/data/site.ts");
  const routes = extractStaticPages(siteTs);
  const articlesDir = path.join(root, "src/content/articles");
  for (const file of await fs.readdir(articlesDir)) {
    if (file.endsWith(".md")) routes.push(`/${file.replace(/\.md$/, ".html")}`);
  }
  return Array.from(new Set(routes));
}

async function checkLocalRuntimeArtifacts() {
  if (root.startsWith("/Users/openclaw/")) return;
  for (const name of ["node_modules", "dist", ".astro", "_astro", ".codex-results"]) {
    if (await exists(name)) fail(`Local runtime artifact exists: ${name}`);
  }
}

async function checkGeneratedRoutes(routes) {
  for (const route of routes) {
    const file = routeToFile(route);
    if (!(await exists(file))) fail(`Missing generated route file: ${file}`);
  }

  const expectedFiles = new Set(routes.map(routeToFile));
  for (const entry of await fs.readdir(root)) {
    if (entry.endsWith(".html") && !expectedFiles.has(entry)) {
      fail(`Stale or unexpected generated HTML file: ${entry}`);
    }
  }
}

function parseAttributes(html, attrName) {
  const pattern = new RegExp(`\\b${attrName}=["']([^"']+)["']`, "g");
  return Array.from(html.matchAll(pattern), (match) => match[1]);
}

async function checkHtmlMetadata(routes) {
  const articleFiles = new Set(
    (await fs.readdir(path.join(root, "src/content/articles")))
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ".html"))
  );

  for (const route of routes) {
    const file = routeToFile(route);
    const html = await readText(file);
    const expectedCanonical = canonicalForRoute(route);

    if (!/<title>[^<]+<\/title>/.test(html)) fail(`${file} missing <title>`);
    if (!/<meta name="description" content="[^"]+"/.test(html)) fail(`${file} missing meta description`);
    if (!html.includes(`<link rel="canonical" href="${expectedCanonical}"`)) {
      fail(`${file} missing expected canonical ${expectedCanonical}`);
    }
    if (!/<script type="application\/ld\+json">/.test(html)) fail(`${file} missing JSON-LD`);
    if (!/<h1>/.test(html)) fail(`${file} missing h1`);

    if (articleFiles.has(file)) {
      for (const marker of ["Editorial owner:", "Last updated:", "Teaching and Discussion Questions", "Related Reading", "Sources"]) {
        if (!html.includes(marker)) fail(`${file} missing article marker: ${marker}`);
      }
    }

    for (const pattern of ["TODO", "PLACEHOLDER", "lorem", "†L", "【"]) {
      if (html.includes(pattern)) fail(`${file} contains fake or unfinished marker: ${pattern}`);
    }
  }
}

async function checkInternalLinks(routes) {
  const files = new Set(routes.map(routeToFile));
  files.add("style.css");
  files.add("robots.txt");
  files.add("sitemap.xml");
  const externalUrls = new Set();

  for (const route of routes) {
    const file = routeToFile(route);
    const html = await readText(file);
    const refs = [...parseAttributes(html, "href"), ...parseAttributes(html, "src")];

    for (const ref of refs) {
      if (/^(mailto:|tel:|#)/.test(ref)) continue;
      if (/^https?:\/\//.test(ref)) {
        try {
          const parsed = new URL(ref);
          if (parsed.origin !== new URL(siteUrl).origin) {
            externalUrls.add(parsed.toString());
          }
        } catch {
          fail(`${file} has malformed external URL: ${ref}`);
        }
        continue;
      }
      const clean = ref.split("#")[0].split("?")[0];
      if (!clean) continue;
      const target = clean.startsWith("/") ? clean.slice(1) || "index.html" : clean;
      if (!files.has(target) && !(await exists(target))) {
        fail(`${file} links to missing local target: ${ref}`);
      }
    }
  }

  return externalUrls;
}

async function checkSitemap(routes) {
  const sitemap = await readText("sitemap.xml");
  for (const route of routes) {
    const loc = canonicalForRoute(route);
    if (!sitemap.includes(`<loc>${loc}</loc>`)) fail(`sitemap.xml missing ${loc}`);
  }

  const lastmodCount = (sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length;
  if (lastmodCount < routes.length) {
    fail(`sitemap.xml has ${lastmodCount} lastmod entries for ${routes.length} routes`);
  }
}

async function checkExternalUrls(urls) {
  for (const url of urls) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      let response = await fetch(url, { method: "HEAD", signal: controller.signal, redirect: "follow" });
      if (response.status === 405 || response.status === 403) {
        response = await fetch(url, { method: "GET", signal: controller.signal, redirect: "follow" });
      }
      if (!response.ok) warn(`External URL returned HTTP ${response.status}: ${url}`);
    } catch (error) {
      warn(`External URL check warning for ${url}: ${error.message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}

const routes = await expectedRoutes();
await checkLocalRuntimeArtifacts();
await checkGeneratedRoutes(routes);
await checkHtmlMetadata(routes);
const externalUrls = await checkInternalLinks(routes);
await checkSitemap(routes);
await checkExternalUrls(externalUrls);

for (const message of warnings) console.warn(`[site-integrity] warning: ${message}`);

if (failures.length) {
  for (const message of failures) console.error(`[site-integrity] error: ${message}`);
  process.exit(1);
}

console.log(`[site-integrity] passed routes=${routes.length} external_urls_checked=${externalUrls.size} warnings=${warnings.length}`);
