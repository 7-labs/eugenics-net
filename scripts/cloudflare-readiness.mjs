import { execFileSync } from "node:child_process";

const args = new Set(process.argv.slice(2));
const requireAuth = args.has("--require-auth");
const requireProductionDomain = args.has("--require-production-domain");
const jsonMode = args.has("--json");
const baseUrl = process.env.PRODUCTION_BASE_URL || "https://eugenics.net";
const hostname = new URL(baseUrl).hostname;
const timeoutMs = Number(process.env.READINESS_TIMEOUT_MS || 10000);

function hasEnv(name) {
  return Boolean(process.env[name]);
}

function resolveRecords(type) {
  try {
    const output = execFileSync("dig", ["+time=2", "+tries=1", "+short", hostname, type], {
      encoding: "utf8",
      timeout: timeoutMs
    }).trim();
    const records = output.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    return records.length ? records : { error: `no ${type} records` };
  } catch (error) {
    return { error: error.message };
  }
}

async function fetchProductionProbe() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(baseUrl, { method: "GET", redirect: "manual", signal: controller.signal });
    const location = response.headers.get("location") || "";
    return {
      status: response.status,
      location,
      dynadotParked: /forsale\.dynadot\.com/i.test(location),
      cloudflareRay: response.headers.has("cf-ray"),
      securityHeaders: {
        strictTransportSecurity: response.headers.has("strict-transport-security"),
        xContentTypeOptions: response.headers.has("x-content-type-options"),
        contentSecurityPolicy: response.headers.has("content-security-policy")
      }
    };
  } catch (error) {
    return { error: error.message };
  } finally {
    clearTimeout(timer);
  }
}

const result = {
  checkedAt: new Date().toISOString(),
  baseUrl,
  hostname,
  cloudflareEnv: {
    CLOUDFLARE_API_TOKEN: hasEnv("CLOUDFLARE_API_TOKEN") ? "present" : "missing",
    CLOUDFLARE_ACCOUNT_ID: hasEnv("CLOUDFLARE_ACCOUNT_ID") ? "present" : "missing"
  },
  dns: {
    A: resolveRecords("A"),
    AAAA: resolveRecords("AAAA")
  },
  productionProbe: await fetchProductionProbe(),
  failures: []
};

if (requireAuth && result.cloudflareEnv.CLOUDFLARE_API_TOKEN !== "present") {
  result.failures.push("CLOUDFLARE_API_TOKEN is required for non-interactive Wrangler deploy/status checks.");
}

if (requireProductionDomain && result.productionProbe?.dynadotParked) {
  result.failures.push(`${baseUrl} still redirects to Dynadot parked-domain sales page.`);
}

if (requireProductionDomain && result.productionProbe?.status >= 300 && result.productionProbe?.status < 400) {
  result.failures.push(`${baseUrl} returns HTTP ${result.productionProbe.status} redirect before serving the site.`);
}

if (!jsonMode) {
  console.log(`Cloudflare readiness for ${baseUrl}`);
  console.log(`CLOUDFLARE_API_TOKEN: ${result.cloudflareEnv.CLOUDFLARE_API_TOKEN}`);
  console.log(`CLOUDFLARE_ACCOUNT_ID: ${result.cloudflareEnv.CLOUDFLARE_ACCOUNT_ID}`);
  console.log(`DNS A: ${Array.isArray(result.dns.A) ? result.dns.A.join(", ") : result.dns.A.error}`);
  console.log(`DNS AAAA: ${Array.isArray(result.dns.AAAA) ? result.dns.AAAA.join(", ") : result.dns.AAAA.error}`);
  console.log(`HTTP status: ${result.productionProbe.status ?? result.productionProbe.error}`);
  if (result.productionProbe.location) console.log(`Location: ${result.productionProbe.location}`);
  console.log(`Dynadot parked redirect: ${result.productionProbe.dynadotParked ? "yes" : "no"}`);
  console.log(`Cloudflare edge header observed: ${result.productionProbe.cloudflareRay ? "yes" : "no"}`);
  for (const failure of result.failures) {
    console.error(`[cloudflare-readiness] error: ${failure}`);
  }
} else {
  console.log(JSON.stringify(result, null, 2));
}

if (result.failures.length) {
  process.exit(1);
}
