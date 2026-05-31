import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.OPENCLAW_QA_BASE_URL || process.env.OPENCLAW_PREVIEW_URL || "http://127.0.0.1:3200";
const artifactDir = process.env.OPENCLAW_ARTIFACT_DIR || path.join(process.cwd(), ".codex-results", "browser-qa");
const viewports = [
  { label: "desktop", width: 1440, height: 1000 },
  { label: "mobile", width: 390, height: 844 }
];

function pageName(route) {
  if (route === "/") return "home";
  return route.replace(/^\//, "").replace(/\.html$/, "").replace(/[^a-z0-9-]+/gi, "-");
}

async function pagesFromSitemap() {
  const sitemap = await fs.readFile(path.join(process.cwd(), "sitemap.xml"), "utf8");
  const routes = Array.from(sitemap.matchAll(/<loc>https:\/\/eugenics\.net([^<]*)<\/loc>/g), (match) => match[1] || "/");
  const uniqueRoutes = Array.from(new Set(routes.map((route) => route || "/")));
  uniqueRoutes.sort((a, b) => {
    if (a === "/") return -1;
    if (b === "/") return 1;
    return a.localeCompare(b);
  });
  return uniqueRoutes.map((route) => ({ name: pageName(route), path: route }));
}

await fs.mkdir(artifactDir, { recursive: true });
const pages = await pagesFromSitemap();
if (pages.length !== 35) {
  throw new Error(`expected 35 pages from sitemap, found ${pages.length}`);
}
const browser = await chromium.launch();
const results = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    for (const target of pages) {
      const url = new URL(target.path, baseUrl).toString();
      const response = await page.goto(url, { waitUntil: "networkidle" });
      if (!response || !response.ok()) {
        throw new Error(`${target.name} ${viewport.label} failed: HTTP ${response?.status()}`);
      }

      const title = await page.title();
      const h1 = await page.locator("h1").first().textContent();
      const alertText = await page.locator(".site-alert").first().textContent();
      const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      const firstViewportText = await page.locator("body").evaluate((body) => body.innerText.slice(0, 900));
      const bodyText = await page.locator("body").evaluate((body) => body.innerText);

      if (!title || !h1) throw new Error(`${target.name} ${viewport.label} missing title or h1`);
      if (!alertText?.toLowerCase().includes("does not endorse") && target.name === "home") {
        throw new Error("home first viewport is missing anti-endorsement language");
      }
      if (horizontalOverflow) throw new Error(`${target.name} ${viewport.label} has horizontal overflow`);
      for (const marker of ["Evidence Snapshot", "Source Coverage", "What This Page Does Not Do"]) {
        if (!bodyText.includes(marker)) throw new Error(`${target.name} ${viewport.label} missing V3 marker: ${marker}`);
      }

      const screenshot = path.join(artifactDir, `${target.name}-${viewport.label}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      results.push({
        page: target.name,
        viewport: viewport.label,
        title,
        h1,
        screenshot,
        firstViewportHasCriticalPositioning:
          /does not endorse|critical archive|education|critique/i.test(firstViewportText)
      });
    }

    await context.close();
  }
} finally {
  await browser.close();
}

const failedPositioning = results.filter((result) => !result.firstViewportHasCriticalPositioning);
if (failedPositioning.length) {
  throw new Error(`missing critical positioning in first viewport: ${failedPositioning.map((r) => `${r.page}/${r.viewport}`).join(", ")}`);
}

await fs.writeFile(path.join(artifactDir, "summary.json"), JSON.stringify({ baseUrl, results }, null, 2));
console.log(`browser QA passed for ${results.length} screenshots`);
if (results.length !== 70) throw new Error(`expected 70 screenshots, got ${results.length}`);
console.log(`artifacts: ${artifactDir}`);
