import { getCollection } from "astro:content";
import { SITE, staticPageLastmod, staticPages } from "@data/site";
import { canonicalUrl } from "@utils/seo";

export async function GET() {
  const articles = await getCollection("articles");
  const entries = [
    ...staticPages.map((path) => ({ path, lastmod: staticPageLastmod[path] || SITE.lastUpdated })),
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
      const loc = canonicalUrl(path);
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join("\n");

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
