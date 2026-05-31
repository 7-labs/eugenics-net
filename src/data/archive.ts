export const archiveCategories = [
  {
    title: "Primary Sources",
    path: "/archive/primary-sources/",
    description:
      "Letters, articles, lectures, pamphlets, and institutional documents with source metadata and critical notes."
  },
  {
    title: "Laws and Policies",
    path: "/archive/laws/",
    description:
      "Sterilization laws, immigration restrictions, institutional rules, and court cases with policy context."
  },
  {
    title: "Organizations",
    path: "/archive/organizations/",
    description:
      "Eugenic societies, research offices, public-health institutions, and funders, documented with harm context."
  },
  {
    title: "People",
    path: "/archive/people/",
    description:
      "Biographical entries for advocates, critics, survivors, and affected communities, avoiding hero narratives for eugenicists."
  },
  {
    title: "Images",
    path: "/archive/images/",
    description:
      "Photographs, charts, exhibits, and classroom materials shown only when visual evidence is necessary."
  },
  {
    title: "Propaganda Context",
    path: "/archive/propaganda-context/",
    description:
      "Analysis of propaganda techniques, content warnings, and why harmful claims should not be reproduced uncritically."
  }
];

export const sampleArchiveEntry = {
  title: "Template: Annotated Eugenics Primary Source",
  year: "Year required",
  country: "Country or region required",
  authorInstitution: "Author, organization, or institution required",
  historicalContext:
    "Explain who created the item, when it circulated, and how it connected to policy, institutions, or public messaging.",
  harmfulClaims:
    "Name the harmful claims plainly, including racism, ableism, antisemitism, coercive sterilization, or hierarchy language.",
  affectedGroups:
    "Identify communities targeted or harmed by the document, policy, image, or institution.",
  whyItMatters:
    "Explain what the item helps readers understand today without treating it as a neutral artifact.",
  sourceCitation:
    "Provide a stable citation, archive call number, repository link, or rights note.",
  editorialNote:
    "State why the item is included, how readers should approach it, and why uncontextualized reuse is not appropriate.",
  contentWarning:
    "Warn readers before dehumanizing language, racist claims, ableist claims, antisemitic claims, violence, or coercion."
};

export const annotatedSampleEntries = [
  {
    title: "Sample Annotation: Sterilization Board Case Summary",
    year: "1930s-1970s range, item-specific year required before publication",
    country: "United States or Canada, depending on the reviewed item",
    authorInstitution: "State or provincial sterilization board, hospital, training school, or welfare institution",
    historicalContext:
      "A board case summary should be framed as evidence of administrative power over a person's body and future, not as neutral medical paperwork. The annotation must explain the legal authority, institutional setting, consent conditions, and the way disability, poverty, gender, race, or institutional dependency shaped vulnerability.",
    harmfulClaims:
      "Likely harmful claims include inherited defect, public burden, social unfitness, dependency, sexual danger, or family degeneracy. The annotation must identify these as historical claims used to justify coercion rather than as valid descriptions of the person.",
    affectedGroups:
      "People confined in institutions, disabled people, poor families, women and girls under institutional control, racialized communities, Indigenous communities where applicable, and descendants or families affected by the decision.",
    whyItMatters:
      "The item shows how reproductive coercion could be made to look orderly through forms, board votes, diagnoses, and professional authority. It helps readers understand why consent and appeal rights are central to modern bioethics.",
    sourceCitation:
      "No downloadable record is included in this release. A future item would need repository name, collection, call number or stable URL, rights status, and review date.",
    editorialNote:
      "Publish only a contextual annotation or short excerpt if necessary. Redact private information, avoid sensational detail, and include survivor-centered context before any primary language appears.",
    contentWarning:
      "Discusses forced sterilization, institutional control, disability discrimination, reproductive coercion, and potentially racist or gendered language."
  },
  {
    title: "Sample Annotation: Eugenic Pedigree or Family Study Worksheet",
    year: "1910s-1930s range, item-specific year required before publication",
    country: "United States, Britain, or another country depending on the reviewed item",
    authorInstitution: "Research office, field worker, university course, or eugenic organization",
    historicalContext:
      "A pedigree worksheet should be introduced as an artifact of classification. The annotation must explain who collected the family information, what categories were used, what assumptions converted poverty or disability into heredity, and whether the people recorded had any control over the use of their information.",
    harmfulClaims:
      "Likely harmful claims include inherited feeblemindedness, criminality, pauperism, moral defect, racial inferiority, or social dependency. These labels should be treated as products of institutional prejudice and data misuse.",
    affectedGroups:
      "Families recorded by eugenic field workers, disabled people, poor communities, institutionalized people, racialized communities, and people whose relatives were turned into evidence against them.",
    whyItMatters:
      "The item teaches how data collection can become a tool of social control. It also shows why modern archives must not present historical charts as reliable evidence of inherited worth.",
    sourceCitation:
      "No raw worksheet is published in this release. A future item would need repository details, creator metadata, rights review, and a note on privacy or family sensitivity.",
    editorialNote:
      "The annotation should explain the charting technique without reproducing stigmatizing labels unnecessarily. If a label must be named, it should appear inside critical quotation context with a warning.",
    contentWarning:
      "Discusses heredity claims, family surveillance, disability discrimination, class prejudice, racism, and dehumanizing labels."
  },
  {
    title: "Sample Annotation: Public-Health or Classroom Eugenics Pamphlet",
    year: "1920s-1940s range, item-specific year required before publication",
    country: "Country or region required before publication",
    authorInstitution: "Public-health office, school publisher, eugenics society, museum exhibit, or lecture program",
    historicalContext:
      "A pamphlet or classroom item should be treated as public persuasion. The annotation must explain audience, distribution, visual strategy if any, relationship to schools or health agencies, and the policy environment that made the message appear respectable.",
    harmfulClaims:
      "Likely harmful claims include national improvement through selective reproduction, racial hygiene, family burden, disability prevention through coercion, immigration threat, or duty to reproduce among those labeled fit.",
    affectedGroups:
      "Students exposed to the lesson, disabled people, immigrants, racialized communities, Jewish communities in Nazi or antisemitic contexts, and families described as burdens or threats.",
    whyItMatters:
      "The item shows how eugenics entered everyday civic language. It is useful for teaching propaganda analysis only when the page names persuasive techniques and rejects the claims.",
    sourceCitation:
      "No image scan or downloadable pamphlet is included in this release. A future item would require rights review, alt text, provenance, and an explanation of why visual reproduction is necessary.",
    editorialNote:
      "Use a text-only description unless the visual artifact is essential for analysis. If reproduced later, crop, watermark, caption, and surround it with anti-endorsement and affected-community context.",
    contentWarning:
      "May involve propaganda techniques, racist or ableist claims, antisemitic claims, coercive reproduction language, and dehumanizing public-health framing."
  }
];
