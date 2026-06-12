import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const failures = [];
const warnings = [];
const siteUrl = "https://eugenics.net";
const unfinishedMarkers = ["TO" + "DO", "PLACE" + "HOLDER", "lor" + "em", "\u2020L", "\u3010", "unsupported " + "draft"];
const flagshipSlugs = new Set([
  "what-is-eugenics",
  "eugenics-and-scientific-racism",
  "forced-sterilization-laws",
  "eugenics-in-the-united-states",
  "eugenics-vs-genetics"
]);
const expectedStaticPacketIds = new Map([
  ["/", "index"],
  ["/history.html", "history"],
  ["/bioethics.html", "bioethics"],
  ["/teaching.html", "teaching"],
  ["/archive.html", "archive"],
  ["/glossary.html", "glossary"],
  ["/editorial-policy.html", "editorial-policy"],
  ["/corrections.html", "corrections"],
  ["/updates.html", "updates"],
  ["/content-warning.html", "content-warning"],
  ["/about.html", "about"]
]);

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
  return route === "/" ? "index.html" : route.replace(/^\//, "");
}

function packetIdForRoute(route) {
  if (expectedStaticPacketIds.has(route)) return expectedStaticPacketIds.get(route);
  return route.replace(/^\//, "").replace(/\.html$/, "");
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
  const articleDir = path.join(root, "src/content/articles");
  const articleFiles = (await fs.readdir(articleDir)).filter((file) => file.endsWith(".md"));
  routes.push(...articleFiles.map((file) => `/${file.replace(/\.md$/, ".html")}`));
  return Array.from(new Set(routes));
}

function visibleText(html) {
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text) {
  return (text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)?/g) || []).length;
}

function extractFrontmatter(markdown) {
  return markdown.match(/^---\n([\s\S]*?)\n---/)?.[1] || "";
}

function hasField(frontmatter, field) {
  return new RegExp(`^${field}:`, "m").test(frontmatter);
}

function scalarField(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`^${field}:\\s*"?([^"\\n]+)"?\\s*$`, "m"));
  return match?.[1]?.trim() || "";
}

function yamlListCount(frontmatter, field) {
  const lines = frontmatter.split("\n");
  const start = lines.findIndex((line) => line === `${field}:`);
  if (start === -1) return 0;
  let count = 0;
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line && !line.startsWith(" ")) break;
    if (/^\s+-\s+/.test(line)) count += 1;
  }
  return count;
}

async function loadPacket(id) {
  const file = `src/content/source-packets/${id}.json`;
  if (!(await exists(file))) {
    fail(`Missing source packet: ${file}`);
    return null;
  }
  try {
    return JSON.parse(await readText(file));
  } catch (error) {
    fail(`Invalid source packet JSON ${file}: ${error.message}`);
    return null;
  }
}

function checkPacket(id, packet, tier) {
  const minSources = tier === "flagship" ? 10 : 5;
  const minClaims = tier === "flagship" ? 6 : tier === "teaching" || tier === "archive" ? 7 : 5;
  const minDeepDives = tier === "flagship" ? 6 : tier === "teaching" || tier === "archive" ? 8 : 5;

  if (!packet) return;
  if (!packet.route || !packet.title || !packet.answerSummary) fail(`${id} packet missing route, title, or answerSummary`);
  const expectedRoute = expectedStaticPacketIds.has(packet.route)
    ? packet.route
    : `/${id}.html`;
  if (packet.route !== expectedRoute) fail(`${id} packet route ${packet.route} does not match expected ${expectedRoute}`);
  if (wordCount(packet.answerSummary) > 50) fail(`${id} answerSummary exceeds 50 words`);
  if ((packet.sourceCoverage || []).length < minSources) fail(`${id} packet has ${(packet.sourceCoverage || []).length} sources; expected at least ${minSources}`);
  if ((packet.claimMap || []).length < minClaims) fail(`${id} packet has ${(packet.claimMap || []).length} claim-map entries; expected at least ${minClaims}`);
  if ((packet.deepDiveSections || []).length < minDeepDives) fail(`${id} packet has ${(packet.deepDiveSections || []).length} research brief sections; expected at least ${minDeepDives}`);
  if (!(packet.teachingUse?.objectives || []).length) fail(`${id} packet missing teaching objectives`);
  if (!(packet.teachingUse?.discussionPrompts || []).length) fail(`${id} packet missing teaching discussion prompts`);
  if (!(packet.doesNotDo || []).length) fail(`${id} packet missing doesNotDo boundaries`);

  const coverageLabels = new Set((packet.sourceCoverage || []).map((source) => source.label));
  for (const [index, item] of (packet.claimMap || []).entries()) {
    const prefix = `${id} claimMap[${index}]`;
    if (!Array.isArray(item.sourceLabels) || item.sourceLabels.length === 0) fail(`${prefix} has no sourceLabels`);
    for (const label of item.sourceLabels || []) {
      if (!coverageLabels.has(label)) fail(`${prefix} references missing sourceCoverage label: ${label}`);
    }
  }

  for (const [index, source] of (packet.sourceCoverage || []).entries()) {
    const prefix = `${id} sourceCoverage[${index}]`;
    if (!source.label || !source.url || !source.role) fail(`${prefix} missing label, url, or role`);
    if (!Array.isArray(source.supportedClaims) || source.supportedClaims.length < 2) fail(`${prefix} missing supportedClaims`);
    if (!source.limits) fail(`${prefix} missing limits/caveats`);
    if (!source.sensitiveLanguageNotes) fail(`${prefix} missing sensitiveLanguageNotes`);
    if (!Array.isArray(source.affectedCommunities) || source.affectedCommunities.length === 0) fail(`${prefix} missing affectedCommunities`);
    try {
      new URL(source.url);
    } catch {
      fail(`${prefix} malformed URL: ${source.url}`);
    }
  }
}

async function checkLocalRuntimeArtifacts() {
  if (root.startsWith("/Users/openclaw/")) return;
  for (const name of ["node_modules", "dist", ".astro", "_astro", ".codex-results"]) {
    if (await exists(name)) fail(`Local runtime artifact exists: ${name}`);
  }
}

async function checkRoutes(routes) {
  const siteTs = await readText("src/data/site.ts");
  const staticCount = extractStaticPages(siteTs).length;
  const articleCount = (await fs.readdir(path.join(root, "src/content/articles"))).filter((file) => file.endsWith(".md")).length;
  const expectedCount = staticCount + articleCount;
  if (routes.length !== expectedCount) fail(`Expected ${expectedCount} public routes, found ${routes.length}`);
  const expectedFiles = new Set(routes.map(routeToFile));
  for (const route of routes) {
    const file = routeToFile(route);
    if (!(await exists(file))) {
      fail(`Missing generated HTML for ${route}: ${file}`);
      continue;
    }
  }
  for (const entry of await fs.readdir(root)) {
    if (entry.endsWith(".html") && !expectedFiles.has(entry)) {
      fail(`Unexpected stale root HTML file: ${entry}`);
    }
  }
}

async function checkRenderedPage(route) {
  const file = routeToFile(route);
  if (!(await exists(file))) return;
  const id = packetIdForRoute(route);
  const html = await readText(file);
  const text = visibleText(html);
  const words = wordCount(text);
  const packet = await loadPacket(id);
  const isArticle = !expectedStaticPacketIds.has(route);
  const tier = isArticle ? (flagshipSlugs.has(id) ? "flagship" : "standard") : packet?.contentTier || "static";

  checkPacket(id, packet, tier);

  const minWords = tier === "flagship" ? 3000 : tier === "teaching" || tier === "archive" ? 2000 : tier === "glossary" ? 1200 : isArticle ? 1500 : 900;
  if (words < minWords) fail(`${file} visible word count ${words} below ${tier} floor ${minWords}`);

  const requiredMarkers = ["Evidence Snapshot", "Source Coverage", "Claim Map", "Teaching Use", "What This Page Does Not Do"];
  for (const marker of requiredMarkers) {
    if (!html.includes(marker)) fail(`${file} missing V3 source-packet marker: ${marker}`);
  }

  if (isArticle) {
    const markdown = await readText(`src/content/articles/${id}.md`);
    const frontmatter = extractFrontmatter(markdown);
    const bodyWords = wordCount(markdown.replace(/^---\n[\s\S]*?\n---\n/, ""));
    const bodyFloor = flagshipSlugs.has(id) ? 900 : 450;
    if (bodyWords < bodyFloor) fail(`${id}.md article body word count ${bodyWords} below ${bodyFloor}`);
    for (const field of ["sourcePacket", "contentTier", "audience", "reviewStatus", "claimReviewStatus", "learningObjectives", "lastReviewedBy"]) {
      if (!hasField(frontmatter, field)) fail(`${id}.md missing V3 frontmatter field: ${field}`);
    }
    const sourcePacketField = scalarField(frontmatter, "sourcePacket");
    if (sourcePacketField && sourcePacketField !== id) fail(`${id}.md sourcePacket ${sourcePacketField} does not match article id`);
    if (!html.includes("Answer First")) fail(`${file} missing Answer First section`);
    if (!html.includes("Related Topic Path")) fail(`${file} missing related topic path`);
    if (flagshipSlugs.has(id)) {
      if (yamlListCount(frontmatter, "faqs") < 2) fail(`${id}.md flagship missing visible FAQ items`);
      if (!html.includes('"@type":"FAQPage"')) fail(`${file} flagship missing FAQPage schema`);
    }
  }

  if (tier === "archive") {
    for (const marker of ["Annotated Non-Download Sample Entries", "Sample Annotation: Sterilization Board", "Sample Annotation: Eugenic Pedigree", "Sample Annotation: Public-Health"]) {
      if (!html.includes(marker)) fail(`${file} missing archive gate marker: ${marker}`);
    }
  }

  if (tier === "teaching") {
    for (const marker of ["90-Minute Intro", "Two-Week Seminar", "Archive Source Analysis", "Printable Source-Use Rules", "Discussion Prompts"]) {
      if (!html.includes(marker)) fail(`${file} missing teaching marker: ${marker}`);
    }
  }
}

async function checkGlossary() {
  const source = await readText("src/data/glossary.ts");
  const termCount = (source.match(/\bterm:\s*"/g) || []).length;
  if (termCount < 25) fail(`Glossary has ${termCount} terms; expected at least 25`);
  const html = await readText("glossary.html");
  if (!html.includes('"@type":"DefinedTermSet"')) fail("glossary.html missing DefinedTermSet JSON-LD");
}

async function checkSitemap(routes) {
  const sitemap = await readText("sitemap.xml");
  const locCount = (sitemap.match(/<loc>https:\/\/eugenics\.net\/[^<]*<\/loc>/g) || []).length;
  const lastmodCount = (sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length;
  if (locCount !== routes.length) fail(`sitemap.xml has ${locCount} loc entries; expected ${routes.length}`);
  if (lastmodCount !== routes.length) fail(`sitemap.xml has ${lastmodCount} lastmod entries; expected ${routes.length}`);
  for (const route of routes) {
    const loc = new URL(route, siteUrl).toString();
    if (!sitemap.includes(`<loc>${loc}</loc>`)) fail(`sitemap.xml missing ${loc}`);
  }
}

async function checkMarkers() {
  const roots = ["src", "scripts", "docs"];
  for (const folder of roots) {
    if (!(await exists(folder))) continue;
    const files = await walk(path.join(root, folder));
    for (const file of files) {
      const rel = path.relative(root, file);
      if (rel.endsWith(".webp")) continue;
      const text = await fs.readFile(file, "utf8");
      for (const marker of unfinishedMarkers) {
        if (text.includes(marker)) fail(`${rel} contains unfinished marker: ${marker}`);
      }
    }
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

const routes = await expectedRoutes();
await checkLocalRuntimeArtifacts();
await checkRoutes(routes);
for (const route of routes) await checkRenderedPage(route);
await checkGlossary();
await checkSitemap(routes);
await checkMarkers();

for (const message of warnings) console.warn(`[content-quality] warning: ${message}`);

if (failures.length) {
  for (const message of failures) console.error(`[content-quality] error: ${message}`);
  process.exit(1);
}

console.log(`[content-quality] passed routes=${routes.length} warnings=${warnings.length}`);
