# Content SOP

This project is a pre-launch static education and archive site. The source of truth is Astro source plus source packets. Root HTML output is a versioned mirror for file use and static publishing, not the editing entry point.

## Scope

- Document and critique eugenics, scientific racism, forced sterilization, genetic discrimination, and related bioethics questions.
- Reject eugenic endorsement, racial hierarchy, antisemitism, ableism, reproductive coercion, forced sterilization, and genetic discrimination.
- Do not provide medical, reproductive, genetic counseling, fertility, or legal advice.
- Do not publish comments, user uploads, affiliate links, ads, DNA-testing lead generation, or unreviewed primary-source downloads.

## Source Packet First

Every public page needs a source packet in `src/content/source-packets/`.

Each packet must record:

- `sourceCoverage`: source role, supported claims, limits or caveats, sensitive-language notes, and affected communities.
- `claimMap`: the claim being made, evidence supporting it, and source labels.
- `deepDiveSections`: visible research context that helps readers understand the topic without raw propaganda.
- `teachingUse`: learning objectives, discussion prompts, and classroom warnings.
- `doesNotDo`: explicit boundaries for advice, endorsement, and unsafe reuse.

URL-only citation is not sufficient. A link can support a page only when the packet says what role the source plays and what it cannot prove.

## Approved Source Boundary

Use academic, official, institutional, and clearly labeled survivor or affected-community material. Broad media can be considered only in a later review lane and must not replace primary evidence, institutional sources, or affected-community context.

Acceptable examples:

- Official genomics and bioethics sources such as NHGRI, UNESCO, WHO.
- University, museum, archive, and public-history sources such as USHMM, UCL, CSHL, Eugenics Archives.
- Academic articles or university-hosted research for country cases.
- Survivor or affected-community testimony when summarized respectfully and kept in context.

## Anti-Endorsement Rules

- Every sensitive page must make clear that documentation is not endorsement.
- Do not use eugenic categories as neutral descriptors. Treat terms such as "fit", "unfit", "feebleminded", "racial hygiene", and similar labels as historical claims that require critique.
- Do not create "balanced debate" framing around forced sterilization, racial hierarchy, disability devaluation, antisemitism, or human worth.
- Do not publish raw propaganda images or historical extremist material unless a future archive gate approves a specific, contextualized use.

## Survivor and Affected-Community Handling

- Name affected communities as part of the evidence structure, not only as a moral closing note.
- Do not extract testimony for emotional effect.
- Do not copy long first-person testimony into the site. Link to source context and summarize with care.
- When privacy, family history, or institutional records are involved, use minimal detail and avoid exposing personally sensitive material.

## Teaching Use

Teaching materials should help students analyze power, institutions, language, source creation, and harm. They must not ask students to rank people, simulate reproductive policy, classify classmates, or debate whether targeted communities deserved rights.

## Runtime Boundary

Editing happens in the SSD source tree. Dependency install, Astro build, export, preview, and browser QA run only on OpenClaw.
