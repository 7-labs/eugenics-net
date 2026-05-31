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
    faqs: z.array(faqSchema).default([])
  })
});

export const collections = { articles };
