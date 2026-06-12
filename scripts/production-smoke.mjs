const baseUrl = process.env.PRODUCTION_BASE_URL || "https://eugenics.net";
const requiredHeaders = [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy"
];
const checks = [
  {
    path: "/",
    type: "html",
    includes: ["Eugenics: A Critical History", "does not endorse", "Research Routes"]
  },
  {
    path: "/what-is-eugenics.html",
    type: "html",
    includes: ["What Is Eugenics?", "Answer First", "Claim Map"]
  },
  {
    path: "/corrections.html",
    type: "html",
    includes: ["Corrections and Contact", "Review Timing", "Updates and Corrections Log"]
  },
  {
    path: "/updates.html",
    type: "html",
    includes: ["Updates and Corrections Log", "Production readiness"]
  },
  {
    path: "/no-such-page",
    type: "html",
    expectedStatus: 404,
    includes: ["Page Not Found", "Current Routes"]
  },
  {
    path: "/robots.txt",
    type: "text",
    includes: ["Sitemap: https://eugenics.net/sitemap.xml"]
  },
  {
    path: "/sitemap.xml",
    type: "xml",
    includes: ["https://eugenics.net/updates.html", "https://eugenics.net/what-is-eugenics.html"]
  },
  {
    path: "/rss.xml",
    type: "xml",
    contentType: "application/rss+xml",
    includes: ["<rss", "<channel>", "What Is Eugenics?"]
  },
  {
    path: "/llms.txt",
    type: "text",
    includes: ["Editorial stance:", "does not endorse eugenics", "Flagship articles:"]
  },
  {
    path: "/search.html",
    type: "html",
    includes: ["Search the Archive", 'id="search"', "/pagefind/pagefind-ui.js", "/search.js"]
  },
  {
    path: "/search.js",
    type: "text",
    contentType: "javascript",
    includes: ["PagefindUI"]
  },
  {
    path: "/pagefind/pagefind-ui.js",
    type: "text",
    contentType: "javascript",
    includes: ["PagefindUI"]
  },
  {
    path: "/pagefind/pagefind-ui.css",
    type: "text",
    contentType: "text/css",
    includes: [".pagefind-ui"]
  },
  {
    path: "/style.css",
    type: "css",
    includes: [":root", ".site-header"]
  },
  {
    path: "/favicon.svg",
    type: "image",
    contentType: "image/svg+xml"
  },
  {
    path: "/favicon.ico",
    type: "image",
    contentType: "image/"
  },
  {
    path: "/assets/og-default.png",
    type: "image",
    contentType: "image/"
  },
  {
    path: "/assets/og-history.png",
    type: "image",
    contentType: "image/"
  },
  {
    path: "/assets/og-bioethics.png",
    type: "image",
    contentType: "image/"
  },
  {
    path: "/assets/og-teaching.png",
    type: "image",
    contentType: "image/"
  }
];

function urlFor(path) {
  return new URL(path, baseUrl).toString();
}

function fail(message) {
  console.error(`[production-smoke] error: ${message}`);
  process.exitCode = 1;
}

for (const check of checks) {
  const url = urlFor(check.path);
  const response = await fetch(url, { redirect: "manual" });
  const location = response.headers.get("location") || "";
  if (location.includes("forsale.dynadot.com")) {
    fail(`${check.path} redirects to Dynadot parked page: ${location}`);
    continue;
  }
  if (response.status >= 300 && response.status < 400) {
    fail(`${check.path} unexpected redirect ${response.status} to ${location}`);
    continue;
  }
  const expectedStatus = check.expectedStatus || 200;
  if (response.status !== expectedStatus) {
    fail(`${check.path} HTTP ${response.status}, expected ${expectedStatus}`);
    continue;
  }

  if (check.type === "html") {
    for (const header of requiredHeaders) {
      if (!response.headers.get(header)) fail(`${check.path} missing response header: ${header}`);
    }
  }
  if (check.contentType) {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes(check.contentType)) fail(`${check.path} content-type ${contentType} missing ${check.contentType}`);
  }
  if (check.type === "image" && !check.includes) continue;

  const body = await response.text();
  for (const marker of check.includes) {
    if (!body.includes(marker)) fail(`${check.path} missing marker: ${marker}`);
  }
}

if (!process.exitCode) {
  console.log(`[production-smoke] passed base=${baseUrl} checks=${checks.length}`);
}
