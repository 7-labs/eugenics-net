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

const packetSourceSchema = z.object({
  label: z.string(),
  url: z.string().url(),
  role: z.string(),
  supportedClaims: z.array(z.string()).default([]),
  limits: z.string(),
  sensitiveLanguageNotes: z.string(),
  affectedCommunities: z.array(z.string()).default([])
});

const claimMapSchema = z.object({
  claim: z.string(),
  evidence: z.string(),
  sourceLabels: z.array(z.string()).min(1)
});

const deepDiveSchema = z.object({
  heading: z.string(),
  body: z.string()
});

const relatedTopicSchema = z.object({
  label: z.string(),
  href: z.string()
});

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    summary: z.string(),
    author: z.string(),
    firstPublished: z.coerce.date().optional(),
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
    tableOfContents: z.array(tocSchema).default([]),
    sourcePacket: z.string().optional(),
    section: z.enum(["history", "bioethics", "teaching", "archive"]).default("history"),
    contentTier: z.enum(["flagship", "standard"]).default("standard"),
    audience: z.array(z.string()).default(["students", "educators", "general readers"]),
    claimReviewStatus: z.string().default("Claims checked against the linked source packet for pre-launch review."),
    learningObjectives: z.array(z.string()).default([]),
    lastReviewedBy: z.string().default("Eugenics History & Bioethics Project editorial desk")
  })
});

const sourcePackets = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/source-packets" }),
  schema: z.object({
    route: z.string(),
    title: z.string(),
    contentTier: z.enum(["flagship", "standard", "static", "teaching", "archive", "glossary"]),
    pageType: z.enum(["article", "hub"]),
    audience: z.array(z.string()).default([]),
    answerSummary: z.string(),
    reviewStatus: z.string(),
    claimReviewStatus: z.string(),
    lastReviewedBy: z.string(),
    learningObjectives: z.array(z.string()).default([]),
    affectedCommunities: z.array(z.string()).default([]),
    claimMap: z.array(claimMapSchema).default([]),
    deepDiveSections: z.array(deepDiveSchema).default([]),
    sourceCoverage: z.array(packetSourceSchema).default([]),
    teachingUse: z.object({
      objectives: z.array(z.string()).default([]),
      discussionPrompts: z.array(z.string()).default([]),
      classroomWarnings: z.array(z.string()).default([])
    }),
    doesNotDo: z.array(z.string()).default([]),
    relatedTopicPath: z.array(relatedTopicSchema).default([])
  })
});

export const collections = { articles, sourcePackets };
