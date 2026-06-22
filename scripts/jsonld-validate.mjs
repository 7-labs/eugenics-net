import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const distRoot = path.join(root, "dist");
const siteUrl = "https://eugenics.net";
const failures = [];

function fail(message) {
  failures.push(message);
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

function routeToFile(route) {
  if (route === "/") return "index.html";
  const clean = route.replace(/^\//, "");
  // Sitemap locs are extensionless (Cloudflare Pages serves x.html at /x); the
  // generated file on disk is still x.html.
  return /\.[a-z0-9]+$/i.test(clean) ? clean : `${clean}.html`;
}

async function readText(base, file) {
  return fs.readFile(path.join(base, file), "utf8");
}

function isHttpsUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function assertText(file, label, value) {
  if (typeof value !== "string" || !value.trim()) fail(`${file} JSON-LD missing ${label}`);
}

function validateUrlValue(file, label, value) {
  if (Array.isArray(value)) {
    for (const item of value) validateUrlValue(file, label, item);
    return;
  }
  if (typeof value === "string" && !isHttpsUrl(value)) fail(`${file} JSON-LD ${label} is not absolute https: ${value}`);
}

function walkUrls(file, value) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) walkUrls(file, item);
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (["url", "@id", "item", "inDefinedTermSet", "image", "citation"].includes(key)) {
      validateUrlValue(file, key, child);
    }
    walkUrls(file, child);
  }
}

function validateArticle(file, block) {
  assertText(file, "Article.headline", block.headline);
  assertText(file, "Article.description", block.description);
  validateUrlValue(file, "Article.url", block.url);
  assertText(file, "Article.datePublished", block.datePublished);
  assertText(file, "Article.dateModified", block.dateModified);
  if (!block.author?.name) fail(`${file} JSON-LD Article missing author.name`);
  if (!block.publisher?.name) fail(`${file} JSON-LD Article missing publisher.name`);
  if (!Array.isArray(block.citation) || block.citation.length === 0) fail(`${file} JSON-LD Article citation must be a non-empty array`);
}

function validateFaq(file, block) {
  if (!Array.isArray(block.mainEntity) || block.mainEntity.length === 0) {
    fail(`${file} JSON-LD FAQPage mainEntity must be non-empty`);
    return;
  }
  for (const [index, question] of block.mainEntity.entries()) {
    assertText(file, `FAQPage.mainEntity[${index}].name`, question.name);
    assertText(file, `FAQPage.mainEntity[${index}].acceptedAnswer.text`, question.acceptedAnswer?.text);
  }
}

function validateBreadcrumb(file, block) {
  if (!Array.isArray(block.itemListElement) || block.itemListElement.length === 0) {
    fail(`${file} JSON-LD BreadcrumbList itemListElement must be non-empty`);
    return;
  }
  for (const [index, item] of block.itemListElement.entries()) {
    assertText(file, `BreadcrumbList.itemListElement[${index}].name`, item.name);
    validateUrlValue(file, `BreadcrumbList.itemListElement[${index}].item`, item.item);
  }
}

function normalizeBlocks(parsed) {
  return Array.isArray(parsed) ? parsed : [parsed];
}

async function main() {
  const targetRoot = (await exists(path.join(distRoot, "index.html"))) ? distRoot : root;
  const sitemap = await readText(targetRoot, "sitemap.xml");
  const routes = Array.from(sitemap.matchAll(/<loc>https:\/\/eugenics\.net([^<]*)<\/loc>/g), (match) => match[1] || "/");

  if (!routes.length) fail("sitemap.xml has no eugenics.net routes");

  for (const route of routes) {
    const file = routeToFile(route);
    const html = await readText(targetRoot, file);
    const scripts = Array.from(
      html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g),
      (match) => match[1]
    );
    if (!scripts.length) {
      fail(`${file} has no JSON-LD blocks`);
      continue;
    }
    for (const [index, script] of scripts.entries()) {
      let parsed;
      try {
        parsed = JSON.parse(script);
      } catch (error) {
        fail(`${file} JSON-LD block ${index + 1} failed JSON.parse: ${error.message}`);
        continue;
      }
      for (const block of normalizeBlocks(parsed)) {
        const type = block?.["@type"];
        assertText(file, "@type", type);
        walkUrls(file, block);
        if (type === "Article") validateArticle(file, block);
        if (type === "FAQPage") validateFaq(file, block);
        if (type === "BreadcrumbList") validateBreadcrumb(file, block);
      }
    }
  }
}

await main();

if (failures.length) {
  for (const message of failures) console.error(`[jsonld-validate] error: ${message}`);
  process.exit(1);
}

console.log("[jsonld-validate] passed");
