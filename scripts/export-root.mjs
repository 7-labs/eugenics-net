import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(dist))) {
  throw new Error("dist/ does not exist. Run npm run build on OpenClaw before export:root.");
}

for (const entry of await fs.readdir(root)) {
  if (entry.endsWith(".html") || ["style.css", "robots.txt", "sitemap.xml"].includes(entry)) {
    await fs.rm(path.join(root, entry), { force: true, recursive: true });
  }
}

for (const entry of await fs.readdir(dist)) {
  await fs.cp(path.join(dist, entry), path.join(root, entry), { recursive: true });
}

console.log("export:root copied generated static output from dist/ to project root");
