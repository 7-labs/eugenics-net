import { getCollection } from "astro:content";
import { SITE } from "@data/site";
import { canonicalUrl } from "@utils/seo";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822Date(value: Date) {
  return value.toUTCString();
}

export async function GET() {
  const articles = await getCollection("articles");
  const newestUpdate = new Date(Math.max(...articles.map((article) => article.data.lastUpdated.getTime())));
  const items = articles
    .sort((a, b) => b.data.lastUpdated.getTime() - a.data.lastUpdated.getTime())
    .map((article) => {
      const url = canonicalUrl(`/${article.id}.html`);
      return [
        "    <item>",
        `      <title>${escapeXml(article.data.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(article.data.description)}</description>`,
        `      <pubDate>${rfc822Date(article.data.lastUpdated)}</pubDate>`,
        "    </item>"
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>${escapeXml(SITE.title)}</title>\n    <link>${SITE.url}</link>\n    <description>${escapeXml(SITE.defaultDescription)}</description>\n    <language>en</language>\n    <lastBuildDate>${rfc822Date(newestUpdate)}</lastBuildDate>\n${items}\n  </channel>\n</rss>\n`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
}
