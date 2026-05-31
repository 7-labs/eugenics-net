import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const sourceSchema = z.object({
  label: z.string(),
  url: z.string().url(),
  note: z.string().optional()
});

const faqSchema = z.object({
  question: z.string(),
  answer: z.string()
});

const tocSchema = z.object({
  id: z.string(),
  label: z.string()
});

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    summary: z.string(),
    author: z.string(),
    lastUpdated: z.coerce.date(),
    contentWarning: z.string().optional(),
    position: z.string(),
    topics: z.array(z.string()).default([]),
    sources: z.array(sourceSchema),
    related: z.array(z.string()).default([]),
    discussionQuestions: z.array(z.string()).default([]),
    faqs: z.array(faqSchema).default([]),
    keyTakeaways: z.array(z.string()).default([]),
    misconceptions: z.array(z.string()).default([]),
    reviewStatus: z.string().default("Pre-launch editorial review complete; subject-matter review pending."),
    sourceNotes: z.string().optional(),
    tableOfContents: z.array(tocSchema).default([])
  })
});

export const collections = { articles };
