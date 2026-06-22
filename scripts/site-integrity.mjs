import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const siteUrl = "https://eugenics.net";
const failures = [];
const warnings = [];
const unfinishedMarkers = ["TO" + "DO", "PLACE" + "HOLDER", "lor" + "em", "\u2020L", "\u3010"];
const cornerstoneSlugs = new Set([
  "what-is-eugenics",
  "eugenics-and-scientific-racism",
  "forced-sterilization-laws",
  "eugenics-in-the-united-states",
  "eugenics-vs-genetics"
]);
const v2NewSlugs = new Set([
  "eugenics-and-race",
  "is-eugenics-pseudoscience",
  "genetic-testing-embryo-selection-ethical-boundaries",
  "crispr-enhancement-new-eugenics",
  "buck-v-bell-forced-sterilization",
  "francis-galton-and-the-origin-of-eugenics",
  "charles-davenport-and-institutional-eugenics",
  "eugenics-in-britain",
  "eugenics-in-canada",
  "eugenics-in-sweden"
]);
const allowedExtraHtmlFiles = new Set(["404.html", "search.html"]);

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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function metaContent(html, attrName, attrValue) {
  const attr = escapeRegExp(attrName);
  const value = escapeRegExp(attrValue);
  const beforeContent = new RegExp(`<meta\\b(?=[^>]*\\b${attr}=["']${value}["'])[^>]*\\bcontent=["']([^"']+)["'][^>]*>`, "i");
  const afterContent = new RegExp(`<meta\\b(?=[^>]*\\bcontent=["'][^"']+["'])[^>]*\\b${attr}=["']${value}["'][^>]*>`, "i");
  const direct = html.match(beforeContent);
  if (direct) return direct[1];
  const fallback = html.match(afterContent)?.[0]?.match(/\bcontent=["']([^"']+)["']/i);
  return fallback?.[1] || "";
}

function localPathForSameOriginUrl(value) {
  try {
    const parsed = new URL(value);
    if (parsed.origin !== siteUrl) return "";
    const pathname = decodeURIComponent(parsed.pathname);
    return pathname.replace(/^\//, "") || "index.html";
  } catch {
    return "";
  }
}

async function pngDimensions(file) {
  const buffer = await fs.readFile(path.join(root, file));
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a" || buffer.length < 24) return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function routeToFile(route) {
  if (route === "/") return "index.html";
  return route.replace(/^\//, "");
}

function routeToCanonicalPath(route) {
  if (route === "/" || route === "/index.html") return "/";
  return route.replace(/\.html$/, "");
}

function canonicalForRoute(route) {
  // The site is served extensionless on Cloudflare Pages (x.html -> /x); canonical
  // URLs, sitemap locs, and JSON-LD use the extensionless form.
  return new URL(routeToCanonicalPath(route), siteUrl).toString();
}

function extractStaticPages(siteTs) {
  const match = siteTs.match(/export const staticPages = \[([\s\S]*?)\];/);
  if (!match) {
    fail("Could not find staticPages in src/data/site.ts");
    return [];
  }
  return Array.from(match[1].matchAll(/"([^"]+)"/g), (item) => item[1]);
}

function extractSiteLastUpdated(siteTs) {
  return siteTs.match(/lastUpdated:\s*"([^"]+)"/)?.[1] || "";
}

function extractStaticPageLastmod(siteTs) {
  const match = siteTs.match(/export const staticPageLastmod:[^{]+{([\s\S]*?)};/);
  const siteLastUpdated = extractSiteLastUpdated(siteTs);
  const entries = new Map();
  if (!match) {
    fail("Could not find staticPageLastmod in src/data/site.ts");
    return entries;
  }
  for (const item of match[1].matchAll(/"([^"]+)":\s*([^,\n]+)/g)) {
    const rawValue = item[2].trim();
    const quotedValue = rawValue.match(/^"([^"]+)"$/)?.[1];
    const value = rawValue === "SITE.lastUpdated" ? siteLastUpdated : quotedValue;
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      fail(`staticPageLastmod has invalid date for ${item[1]}: ${rawValue}`);
      continue;
    }
    entries.set(item[1], value);
  }
  return entries;
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

function parseMarkdownArticle(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: "", body: text };
  return { frontmatter: match[1], body: match[2] };
}

function yamlBlock(frontmatter, field) {
  const lines = frontmatter.split("\n");
  const start = lines.findIndex((line) => line === `${field}:`);
  if (start === -1) return "";
  const block = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line && !line.startsWith(" ")) break;
    block.push(line);
  }
  return block.join("\n");
}

function hasFrontmatterField(frontmatter, field) {
  return new RegExp(`^${field}:`, "m").test(frontmatter);
}

function countYamlListItems(frontmatter, field) {
  const block = yamlBlock(frontmatter, field);
  return (block.match(/^\s+-\s+/gm) || []).length;
}

function wordCount(markdown) {
  const withoutFrontmatter = markdown.replace(/^---\n[\s\S]*?\n---\n/, "");
  const text = withoutFrontmatter
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`>[\]():"/]/g, " ");
  return (text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)?/g) || []).length;
}

async function checkLocalRuntimeArtifacts() {
  if (root.startsWith("/Users/openclaw/")) return;
  for (const name of ["node_modules", "dist", ".astro", "_astro", ".codex-results"]) {
    if (await exists(name)) fail(`Local runtime artifact exists: ${name}`);
  }
}

async function checkCloudflarePagesConfig() {
  for (const file of ["public/_headers", "public/_redirects"]) {
    if (!(await exists(file))) fail(`Missing Cloudflare Pages config: ${file}`);
  }
  const headers = await readText("public/_headers");
  for (const marker of ["Content-Security-Policy", "Strict-Transport-Security", "X-Content-Type-Options", "X-Frame-Options"]) {
    if (!headers.includes(marker)) fail(`public/_headers missing ${marker}`);
  }
}

async function checkGeneratedRoutes(routes) {
  for (const route of routes) {
    const file = routeToFile(route);
    if (!(await exists(file))) fail(`Missing generated route file: ${file}`);
  }

  const expectedFiles = new Set(routes.map(routeToFile));
  for (const entry of await fs.readdir(root)) {
    if (entry.endsWith(".html") && !expectedFiles.has(entry) && !allowedExtraHtmlFiles.has(entry)) {
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
    const ogImage = metaContent(html, "property", "og:image");
    const ogImageWidth = metaContent(html, "property", "og:image:width");
    const ogImageHeight = metaContent(html, "property", "og:image:height");
    const ogImageAlt = metaContent(html, "property", "og:image:alt");
    const twitterImage = metaContent(html, "name", "twitter:image");
    const twitterImageAlt = metaContent(html, "name", "twitter:image:alt");

    if (!ogImage) {
      fail(`${file} missing og:image`);
    } else {
      if (!/^https:\/\/eugenics\.net\/assets\/og-(default|history|bioethics|teaching)\.png$/.test(ogImage)) {
        fail(`${file} og:image must use a static per-tier PNG asset: ${ogImage}`);
      }
      const imagePath = localPathForSameOriginUrl(ogImage);
      if (!imagePath) {
        fail(`${file} og:image is not same-origin: ${ogImage}`);
      } else if (!(await exists(imagePath))) {
        fail(`${file} og:image target missing: ${imagePath}`);
      } else {
        const dimensions = await pngDimensions(imagePath);
        if (!dimensions) {
          fail(`${file} og:image target is not a valid PNG: ${imagePath}`);
        } else if (dimensions.width !== 1200 || dimensions.height !== 630) {
          fail(`${file} og:image dimensions must be 1200x630, got ${dimensions.width}x${dimensions.height}: ${imagePath}`);
        }
      }
    }
    if (ogImageWidth !== "1200") fail(`${file} og:image:width must be 1200`);
    if (ogImageHeight !== "630") fail(`${file} og:image:height must be 630`);
    if (!ogImageAlt.trim()) fail(`${file} missing og:image:alt`);
    if (twitterImage !== ogImage) fail(`${file} twitter:image must match og:image`);
    if (twitterImageAlt !== ogImageAlt) fail(`${file} twitter:image:alt must match og:image:alt`);
    if (!/<script type="application\/ld\+json">/.test(html)) fail(`${file} missing JSON-LD`);
    if (!/<h1>/.test(html)) fail(`${file} missing h1`);

    if (articleFiles.has(file)) {
      for (const marker of ["Editorial owner:", "Last updated:", "Teaching and Discussion Questions", "Related Reading", "Source Quality Note", "Sources"]) {
        if (!html.includes(marker)) fail(`${file} missing article marker: ${marker}`);
      }
    }

    for (const pattern of unfinishedMarkers) {
      if (html.includes(pattern)) fail(`${file} contains fake or unfinished marker: ${pattern}`);
    }
  }
}

async function checkArticleContentQuality() {
  const articlesDir = path.join(root, "src/content/articles");
  const files = (await fs.readdir(articlesDir)).filter((file) => file.endsWith(".md"));

  for (const slug of [...v2NewSlugs]) {
    if (!files.includes(`${slug}.md`)) fail(`Missing V2 article source: ${slug}.md`);
  }

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const source = await fs.readFile(path.join(articlesDir, file), "utf8");
    const { frontmatter } = parseMarkdownArticle(source);
    const words = wordCount(source);
    const sourceCount = countYamlListItems(frontmatter, "sources");
    const faqCount = countYamlListItems(frontmatter, "faqs");
    const tocCount = countYamlListItems(frontmatter, "tableOfContents");
    const htmlFile = `${slug}.html`;
    const html = await readText(htmlFile);
    const hasFaqJsonLd = html.includes('"@type":"FAQPage"');

    if (words < 150) fail(`${file} word count too low: ${words}`);
    if (!hasFrontmatterField(frontmatter, "firstPublished")) fail(`${file} missing firstPublished frontmatter date`);
    if (sourceCount < 2) fail(`${file} has fewer than 2 sources`);
    if (!html.includes("Source Quality Note")) fail(`${htmlFile} missing visible source quality note`);
    if (faqCount > 0 && !hasFaqJsonLd) fail(`${htmlFile} has visible FAQ frontmatter but no FAQPage JSON-LD`);
    if (faqCount === 0 && hasFaqJsonLd) fail(`${htmlFile} has FAQPage JSON-LD without visible FAQ frontmatter`);

    if (cornerstoneSlugs.has(slug)) {
      if (words < 900) fail(`${file} cornerstone word count below 900: ${words}`);
      if (sourceCount < 5) fail(`${file} cornerstone has fewer than 5 sources`);
      if (faqCount < 2) fail(`${file} cornerstone has fewer than 2 FAQs`);
      if (tocCount < 4) fail(`${file} cornerstone has fewer than 4 table-of-contents entries`);
      for (const field of ["keyTakeaways", "misconceptions", "reviewStatus", "sourceNotes"]) {
        if (!hasFrontmatterField(frontmatter, field)) fail(`${file} missing cornerstone field: ${field}`);
      }
    }

    if (v2NewSlugs.has(slug)) {
      if (words < 650) fail(`${file} V2 article word count below 650: ${words}`);
      if (sourceCount < 3) fail(`${file} V2 article has fewer than 3 sources`);
      if (tocCount < 3) fail(`${file} V2 article has fewer than 3 table-of-contents entries`);
      for (const field of ["contentWarning", "position", "related", "discussionQuestions", "keyTakeaways", "misconceptions", "reviewStatus", "sourceNotes"]) {
        if (!hasFrontmatterField(frontmatter, field)) fail(`${file} missing V2 field: ${field}`);
      }
    }
  }
}

async function checkInternalLinks(routes) {
  const htmlFiles = new Set([...routes.map(routeToFile), ...allowedExtraHtmlFiles]);
  const files = new Set(htmlFiles);
  files.add("style.css");
  files.add("robots.txt");
  files.add("sitemap.xml");
  files.add("rss.xml");
  files.add("llms.txt");
  files.add("search.js");
  const externalUrls = new Set();

  for (const file of htmlFiles) {
    if (!(await exists(file))) continue;
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
      let target = clean.startsWith("/") ? clean.slice(1) : clean;
      if (target === "") target = "index.html";
      // Extensionless internal links (e.g. /history) map to the generated history.html file.
      const candidates = /\.[a-z0-9]+$/i.test(target) ? [target] : [target, `${target}.html`];
      let found = candidates.some((candidate) => files.has(candidate));
      if (!found) {
        for (const candidate of candidates) {
          if (await exists(candidate)) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
        fail(`${file} links to missing local target: ${ref}`);
      }
    }
  }

  return externalUrls;
}

async function checkSearchArtifacts() {
  if (!(await exists("search.html"))) return;
  const html = await readText("search.html");
  for (const marker of ["Search the Archive", 'id="search"', "/pagefind/pagefind-ui.js", "/search.js"]) {
    if (!html.includes(marker)) fail(`search.html missing marker: ${marker}`);
  }
  for (const file of ["search.js", "pagefind/pagefind-ui.js", "pagefind/pagefind-ui.css"]) {
    if (!(await exists(file))) fail(`search asset missing: ${file}`);
  }
  const headers = await readText("public/_headers");
  if (!headers.includes("script-src 'self' 'wasm-unsafe-eval'")) {
    fail("public/_headers must allow only self scripts plus wasm-unsafe-eval for Pagefind");
  }
  if (headers.includes("'unsafe-inline'")) fail("public/_headers must not include unsafe-inline");
}

async function checkSitemap(routes) {
  const sitemap = await readText("sitemap.xml");
  const siteTs = await readText("src/data/site.ts");
  const staticPages = extractStaticPages(siteTs);
  const staticLastmod = extractStaticPageLastmod(siteTs);
  const expectedLastmod = new Map();

  for (const route of staticPages) {
    if (!staticLastmod.has(route)) fail(`staticPageLastmod missing ${route}`);
    expectedLastmod.set(canonicalForRoute(route), staticLastmod.get(route));
  }

  const articlesDir = path.join(root, "src/content/articles");
  for (const file of (await fs.readdir(articlesDir)).filter((item) => item.endsWith(".md"))) {
    const source = await fs.readFile(path.join(articlesDir, file), "utf8");
    const { frontmatter } = parseMarkdownArticle(source);
    const lastUpdated = frontmatter.match(/^lastUpdated:\s*(\d{4}-\d{2}-\d{2})/m)?.[1];
    if (!lastUpdated) fail(`${file} missing lastUpdated frontmatter date`);
    expectedLastmod.set(canonicalForRoute(`/${file.replace(/\.md$/, ".html")}`), lastUpdated);
  }

  for (const route of routes) {
    const loc = canonicalForRoute(route);
    if (!sitemap.includes(`<loc>${loc}</loc>`)) fail(`sitemap.xml missing ${loc}`);
  }

  const lastmodCount = (sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length;
  const locCount = (sitemap.match(/<loc>https:\/\/eugenics\.net\/[^<]*<\/loc>/g) || []).length;
  if (lastmodCount !== routes.length) {
    fail(`sitemap.xml has ${lastmodCount} lastmod entries for ${routes.length} routes`);
  }
  if (locCount !== routes.length) fail(`sitemap.xml has ${locCount} loc entries for ${routes.length} routes`);

  for (const match of sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)) {
    const [, loc, lastmod] = match;
    const expected = expectedLastmod.get(loc);
    if (!expected) {
      fail(`sitemap.xml contains unexpected URL ${loc}`);
      continue;
    }
    if (lastmod !== expected) fail(`sitemap.xml lastmod mismatch for ${loc}: expected ${expected}, got ${lastmod}`);
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
await checkCloudflarePagesConfig();
await checkGeneratedRoutes(routes);
await checkHtmlMetadata(routes);
await checkArticleContentQuality();
const externalUrls = await checkInternalLinks(routes);
await checkSearchArtifacts();
await checkSitemap(routes);
await checkExternalUrls(externalUrls);

for (const message of warnings) console.warn(`[site-integrity] warning: ${message}`);

if (failures.length) {
  for (const message of failures) console.error(`[site-integrity] error: ${message}`);
  process.exit(1);
}

console.log(`[site-integrity] passed routes=${routes.length} external_urls_checked=${externalUrls.size} warnings=${warnings.length}`);
