import { getCollection } from "astro:content";
import { SITE, staticPages } from "@data/site";

export async function GET() {
  const articles = await getCollection("articles");
  const entries = [
    ...staticPages.map((path) => ({ path, lastmod: SITE.lastUpdated })),
    ...articles.map((article) => ({
      path: `/${article.id}.html`,
      lastmod: article.data.lastUpdated.toISOString().slice(0, 10)
    }))
  ];
  const uniqueEntries = Array.from(
    new Map(entries.map((entry) => [entry.path, entry])).values()
  );
  const urls = uniqueEntries
    .map((entry) => {
      const { path, lastmod } = entry;
      const loc = new URL(path, SITE.url).toString();
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
