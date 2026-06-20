import { chromium } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.OPENCLAW_QA_BASE_URL || process.env.OPENCLAW_PREVIEW_URL || "http://127.0.0.1:3200";
const artifactDir = process.env.OPENCLAW_ARTIFACT_DIR || path.join(process.cwd(), ".codex-results", "browser-qa");
const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const require = createRequire(import.meta.url);
const viewports = [
  { label: "desktop", width: 1440, height: 1000 },
  { label: "mobile", width: 390, height: 844 }
];
const a11yRoutes = new Set(["/", "/what-is-eugenics.html", "/glossary.html", "/archive.html"]);
const lighthouseRoutes = ["/", "/what-is-eugenics.html", "/glossary.html", "/search.html", "/archive.html"];

function pageName(route) {
  if (route === "/") return "home";
  return route.replace(/^\//, "").replace(/\.html$/, "").replace(/[^a-z0-9-]+/gi, "-");
}

function attachConsoleGuards(page, label) {
  const problems = [];
  page.on("console", (message) => {
    const text = message.text();
    if (message.type() === "error" && !text.startsWith("Failed to load resource: net::ERR_")) {
      problems.push(`${label} console error: ${text}`);
    }
  });
  page.on("pageerror", (error) => {
    problems.push(`${label} page error: ${error.message}`);
  });
  page.on("requestfailed", (request) => {
    if (request.url().startsWith(baseUrl)) {
      problems.push(`${label} request failed: ${request.url()} ${request.failure()?.errorText || "unknown error"}`);
    }
  });
  page.on("response", (response) => {
    if (response.url().startsWith(baseUrl) && response.status() >= 400) {
      problems.push(`${label} HTTP ${response.status()}: ${response.url()}`);
    }
  });
  return problems;
}

async function readOptionalFile(filePath) {
  if (!filePath) return null;
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

async function resolveAxeSource() {
  const envSource = await readOptionalFile(process.env.AXE_CORE_SOURCE);
  if (envSource) return envSource;

  try {
    return await fs.readFile(require.resolve("axe-core/axe.min.js"), "utf8");
  } catch {
    // Keep axe out of the project dependency graph; OpenClaw may fetch it ephemerally for QA.
  }

  const packed = spawnSync(
    "npm",
    [
      "pack",
      "--silent",
      "axe-core@4",
      "--pack-destination",
      artifactDir
    ],
    { encoding: "utf8", maxBuffer: 1024 * 1024 }
  );
  if (packed.status !== 0) {
    throw new Error(`failed to fetch axe-core: ${packed.stderr || packed.stdout}`);
  }
  const tarballName = packed.stdout.trim().split(/\n/).pop();
  const tarballPath = path.join(artifactDir, tarballName);
  const extractDir = path.join(artifactDir, "axe-core");
  await fs.rm(extractDir, { force: true, recursive: true });
  await fs.mkdir(extractDir, { recursive: true });
  const extracted = spawnSync("tar", ["-xzf", tarballPath, "-C", extractDir], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024
  });
  if (extracted.status !== 0) {
    throw new Error(`failed to extract axe-core: ${extracted.stderr || extracted.stdout}`);
  }
  return fs.readFile(path.join(extractDir, "package", "axe.min.js"), "utf8");
}

function summarizeAxeViolations(violations) {
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .slice(0, 3)
        .map((node) => node.target.join(" "))
        .join("; ");
      return `${violation.id} [${violation.impact || "unknown"}]: ${violation.help} (${nodes})`;
    })
    .join("\n");
}

async function runAxe(page, label, viewport, axeSource) {
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async () => {
    return globalThis.axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa", "best-practice"]
      }
    });
  });
  if (result.violations.length) {
    throw new Error(`${label} ${viewport.label} axe violations:\n${summarizeAxeViolations(result.violations)}`);
  }
  return {
    page: label,
    viewport: viewport.label,
    passes: result.passes.length,
    incomplete: result.incomplete.length,
    inapplicable: result.inapplicable.length,
    violations: 0
  };
}

function lighthouseArgs(route, outputPath) {
  const args = [
    "exec",
    "--yes",
    "--package",
    "lighthouse",
    "--",
    "lighthouse",
    new URL(route, baseUrl).toString(),
    "--only-categories=accessibility",
    "--output=json",
    `--output-path=${outputPath}`,
    "--quiet",
    "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
    "--emulated-form-factor=desktop"
  ];
  if (chromiumExecutablePath) args.push(`--chrome-path=${chromiumExecutablePath}`);
  return args;
}

async function runLighthouseA11y() {
  const results = [];
  for (const route of lighthouseRoutes) {
    const outputPath = path.join(artifactDir, `${pageName(route)}-lighthouse-a11y.json`);
    const run = spawnSync("npm", lighthouseArgs(route, outputPath), {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 10
    });
    if (run.status !== 0) {
      throw new Error(`lighthouse a11y failed for ${route}: ${run.stderr || run.stdout}`);
    }
    const report = JSON.parse(await fs.readFile(outputPath, "utf8"));
    const score = report.categories?.accessibility?.score;
    const numericScore = typeof score === "number" ? score : 0;
    if (numericScore < 1) {
      const failedAudits = Object.values(report.audits || {})
        .filter((audit) => audit.score !== null && audit.score !== 1)
        .map((audit) => `${audit.id}: ${audit.title}`)
        .slice(0, 8);
      throw new Error(`lighthouse accessibility score below 100 for ${route}: ${Math.round(numericScore * 100)}\n${failedAudits.join("\n")}`);
    }
    results.push({ page: pageName(route), route, score: numericScore, report: outputPath });
  }
  return results;
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
if (pages.length < 1) {
  throw new Error("expected at least one page from sitemap");
}
const axeSource = await resolveAxeSource();
const browser = await chromium.launch(chromiumExecutablePath ? { executablePath: chromiumExecutablePath } : {});
const results = [];
const axeResults = [];
let searchResult = null;

async function checkSearch(browser, axeSource) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const consoleProblems = attachConsoleGuards(page, "search desktop");
  try {
    const response = await page.goto(new URL("/search.html", baseUrl).toString(), { waitUntil: "networkidle" });
    if (!response || !response.ok()) throw new Error(`search page failed: HTTP ${response?.status()}`);
    const input = page.locator("#search .pagefind-ui__search-input");
    await input.waitFor({ timeout: 15000 });
    const a11y = await runAxe(page, "search", { label: "desktop" }, axeSource);
    await input.fill("Buck v. Bell");
    const result = page.getByRole("link", { name: /Buck v\. Bell/i }).first();
    await result.waitFor({ timeout: 15000 });
    const href = await result.getAttribute("href");
    if (!href || !href.includes("buck-v-bell-forced-sterilization.html")) {
      throw new Error(`search result linked to unexpected href: ${href}`);
    }
    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (horizontalOverflow) throw new Error("search desktop has horizontal overflow");
    if (consoleProblems.length) throw new Error(consoleProblems.join("\n"));
    const screenshot = path.join(artifactDir, "search-desktop.png");
    await page.screenshot({ path: screenshot, fullPage: true });
    return { query: "Buck v. Bell", href, screenshot, a11y };
  } finally {
    await context.close();
  }
}

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });

    for (const target of pages) {
      const page = await context.newPage();
      const consoleProblems = attachConsoleGuards(page, `${target.name} ${viewport.label}`);
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
      if (consoleProblems.length) throw new Error(consoleProblems.join("\n"));
      for (const marker of ["Evidence Snapshot", "Source Coverage", "What This Page Does Not Do"]) {
        if (!bodyText.includes(marker)) throw new Error(`${target.name} ${viewport.label} missing V3 marker: ${marker}`);
      }
      if (a11yRoutes.has(target.path)) {
        axeResults.push(await runAxe(page, target.name, viewport, axeSource));
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
          /does not endorse|critical archive|education|critique|publication-state|corrections|accountable/i.test(firstViewportText)
      });
      await page.close();
    }

    await context.close();
  }
  searchResult = await checkSearch(browser, axeSource);
  axeResults.push(searchResult.a11y);
} finally {
  await browser.close();
}

const failedPositioning = results.filter((result) => !result.firstViewportHasCriticalPositioning);
if (failedPositioning.length) {
  throw new Error(`missing critical positioning in first viewport: ${failedPositioning.map((r) => `${r.page}/${r.viewport}`).join(", ")}`);
}

const lighthouseResults = await runLighthouseA11y();

await fs.writeFile(path.join(artifactDir, "summary.json"), JSON.stringify({ baseUrl, results, search: searchResult, axe: axeResults, lighthouse: lighthouseResults }, null, 2));
console.log(`browser QA passed for ${results.length} screenshots`);
console.log(`search QA passed: ${searchResult.query} -> ${searchResult.href}`);
console.log(`axe-core a11y passed for ${axeResults.length} page/viewport checks`);
console.log(`Lighthouse a11y passed for ${lighthouseResults.length} routes at 100`);
const expectedScreenshots = pages.length * viewports.length;
if (results.length !== expectedScreenshots) {
  throw new Error(`expected ${expectedScreenshots} screenshots, got ${results.length}`);
}
console.log(`artifacts: ${artifactDir}`);
