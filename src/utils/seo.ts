import { SITE } from "@data/site";

type Source = {
  label: string;
  url: string;
  note?: string;
};

type Faq = {
  question: string;
  answer: string;
};

export function canonicalUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, SITE.url).toString();
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  author: string;
  lastUpdated: Date | string;
  sources: Source[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: canonicalUrl(input.path),
    dateModified: new Date(input.lastUpdated).toISOString(),
    datePublished: new Date(input.lastUpdated).toISOString(),
    author: {
      "@type": "Organization",
      name: input.author
    },
    publisher: {
      "@type": "Organization",
      name: SITE.owner,
      url: SITE.url
    },
    citation: input.sources.map((source) => source.url),
    isAccessibleForFree: true
  };
}

export function webPageJsonLd(input: { title: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.title,
    description: input.description,
    url: canonicalUrl(input.path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE.title,
      url: SITE.url
    }
  };
}

export function faqJsonLd(faqs: Faq[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export function learningResourceJsonLd(input: { title: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: input.title,
    description: input.description,
    url: canonicalUrl(input.path),
    educationalUse: ["lesson planning", "classroom discussion", "research"],
    learningResourceType: ["guide", "teaching resource"],
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "teacher"
    }
  };
}

export function definedTermSetJsonLd(input: {
  title: string;
  description: string;
  path: string;
  terms: { term: string; definition: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: input.title,
    description: input.description,
    url: canonicalUrl(input.path),
    hasDefinedTerm: input.terms.map((term) => ({
      "@type": "DefinedTerm",
      name: term.term,
      description: term.definition,
      inDefinedTermSet: canonicalUrl(input.path)
    }))
  };
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
