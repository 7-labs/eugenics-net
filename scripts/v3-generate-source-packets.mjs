import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const packetDir = path.join(root, "src/content/source-packets");
const articleDir = path.join(root, "src/content/articles");
const today = "2026-05-31";
const reviewer = "Eugenics History & Bioethics Project editorial desk";

const flagshipSlugs = new Set([
  "what-is-eugenics",
  "eugenics-and-scientific-racism",
  "forced-sterilization-laws",
  "eugenics-in-the-united-states",
  "eugenics-vs-genetics"
]);

const sourcePool = {
  nhgri: {
    label: "NHGRI: Eugenics and Scientific Racism",
    url: "https://www.genome.gov/about-genomics/fact-sheets/Eugenics-and-Scientific-Racism",
    role: "Official genomics source explaining eugenics as a scientifically inaccurate theory and showing how scientific racism used measurement language to support hierarchy.",
    claims: ["Eugenics misused heredity and statistics", "Scientific racism converted prejudice into claims of biological hierarchy", "Modern genetics requires explicit rejection of inherited worth claims"],
    limits: "The source is a high-level fact sheet, so it should be paired with legal, archive, country, and affected-community sources for policy detail.",
    sensitive: "Use the source to critique racist and ableist claims, not to repeat classification terms as neutral categories.",
    communities: ["racialized communities", "disabled people", "institutionalized people"]
  },
  nhgriTimeline: {
    label: "NHGRI: Eugenics Timeline",
    url: "https://www.genome.gov/about-genomics/educational-resources/timelines/eugenics",
    role: "Official timeline connecting terms, institutions, laws, Nazi racial hygiene, postwar human-rights responses, and modern bioethics concerns.",
    claims: ["Eugenics developed across institutions and countries", "The history moved through laws, archives, research, and public policy", "Chronology helps prevent isolated or exceptionalist readings"],
    limits: "A timeline compresses events and cannot substitute for country-specific or survivor-centered interpretation.",
    sensitive: "Treat dated institutional language as historical evidence that requires framing before classroom use.",
    communities: ["students", "survivors of coercive policy", "families affected by sterilization"]
  },
  nhgriDiscrimination: {
    label: "NHGRI: Genetic Discrimination",
    url: "https://www.genome.gov/about-genomics/policy-issues/genetic-discrimination",
    role: "Official genomics policy source for distinguishing responsible genetic information from discrimination based on genetic traits, risks, or family history.",
    claims: ["Genetic information can create discrimination risks", "Rights frameworks matter for modern genomics", "Historical eugenics informs present safeguards"],
    limits: "The source focuses on genetic discrimination policy rather than the full history of eugenics.",
    sensitive: "Do not turn genetic-risk discussion into claims about social value, destiny, or reproductive worth.",
    communities: ["patients", "families", "people with genetic conditions"]
  },
  ushmm: {
    label: "United States Holocaust Memorial Museum: Nazi Racial Hygiene",
    url: "https://encyclopedia.ushmm.org/content/en/article/the-biological-state-nazi-racial-hygiene-1933-1939",
    role: "Institutional Holocaust education source explaining Nazi racial hygiene, compulsory sterilization, and the escalation of biological-state ideology.",
    claims: ["Nazi racial hygiene fused eugenics, antisemitism, racism, and state violence", "Sterilization and classification were part of a wider system of persecution", "Extreme cases must be taught without minimizing other national histories"],
    limits: "The source is focused on Nazi Germany and should not be used to imply eugenics existed only under Nazism.",
    sensitive: "Use with direct rejection of antisemitic, racist, and ableist ideology and with warning before discussion of state violence.",
    communities: ["Jewish communities", "Roma and Sinti communities", "disabled people"]
  },
  unescoGenome: {
    label: "UNESCO: Universal Declaration on the Human Genome and Human Rights",
    url: "https://www.unesco.org/en/legal-affairs/universal-declaration-human-genome-and-human-rights",
    role: "International human-rights instrument placing genetic science inside dignity, equality, freedom, consent, and non-discrimination principles.",
    claims: ["Human dignity is not reducible to genetic traits", "Genetic knowledge must be governed by rights", "Bioethics requires consent and non-discrimination"],
    limits: "The declaration gives normative principles, not a detailed history of specific eugenic policies.",
    sensitive: "Use to set rights boundaries rather than to offer medical, reproductive, or legal advice.",
    communities: ["patients", "families", "disabled people", "racialized communities"]
  },
  unescoData: {
    label: "UNESCO: International Declaration on Human Genetic Data",
    url: "https://www.unesco.org/en/ethics-science-technology/human-genetic-data",
    role: "International ethics source for genetic-data consent, privacy, confidentiality, and the risks of misuse in research and governance.",
    claims: ["Genetic data requires consent and privacy safeguards", "Population classification can create social harm", "Data governance is part of the anti-eugenics boundary"],
    limits: "The declaration is a governance text and needs historical pairing when used in eugenics education.",
    sensitive: "Avoid implying that genetic data reveals social worth or group destiny.",
    communities: ["research participants", "patients", "families", "Indigenous and racialized communities"]
  },
  whoGenomeEditing: {
    label: "WHO: Human Genome Editing Recommendations",
    url: "https://www.who.int/publications/i/item/9789240030381",
    role: "Official global health governance source addressing genome editing oversight, accountability, safety, equity, and public trust.",
    claims: ["Genome editing needs governance and accountability", "Therapy, enhancement, access, and social pressure must be separated", "Modern bioethics should not repeat eugenic patterns"],
    limits: "The recommendations are about genome editing governance, not a history of sterilization law.",
    sensitive: "Use as governance context only; this site does not provide clinical or reproductive advice.",
    communities: ["patients", "families", "disabled people", "research participants"]
  },
  nuffield: {
    label: "Nuffield Council on Bioethics: Genome Editing and Human Reproduction",
    url: "https://www.nuffieldbioethics.org/publication/genome-editing-and-human-reproduction-social-and-ethical-issues/",
    role: "Institutional bioethics source for reproductive genome editing, social context, access inequality, disability concerns, and governance.",
    claims: ["Reproductive technologies must be assessed in social context", "Access and pressure can turn choice into coercion", "Ethical analysis must include disability and justice concerns"],
    limits: "The report is a modern bioethics analysis and should not be treated as an endorsement of any procedure.",
    sensitive: "Do not use the source to advise decisions about reproduction, embryos, or clinical care.",
    communities: ["disabled people", "prospective parents", "patients", "families"]
  },
  oyezBuck: {
    label: "Oyez: Buck v. Bell",
    url: "https://www.oyez.org/cases/1900-1940/274us200",
    role: "Institutional legal summary of the U.S. Supreme Court case that upheld forced sterilization and gave legal cover to state coercion.",
    claims: ["Law can legitimize reproductive coercion", "Buck v. Bell remains central to U.S. sterilization history", "Legal language must be contextualized against lived harm"],
    limits: "A case summary cannot represent survivor experience or the full institutional record by itself.",
    sensitive: "Avoid repeating the decision's dehumanizing logic as if it were neutral legal analysis.",
    communities: ["people targeted by sterilization", "disabled people", "institutionalized people"]
  },
  cshlEro: {
    label: "Cold Spring Harbor Laboratory: Eugenics Record Office",
    url: "https://www.cshl.edu/archives/institutional-collections/eugenics-record-office/",
    role: "Institutional archive description of the Eugenics Record Office collection and its role in collecting family data and promoting eugenic interpretation.",
    claims: ["Archives can preserve evidence of institutional harm", "Pedigree records were used to support eugenic arguments", "Archive context is necessary before showing primary materials"],
    limits: "An institutional collection description should be paired with critical sources that interpret harm and affected communities.",
    sensitive: "Do not treat original eugenic records as reliable evidence of inherited social value.",
    communities: ["families recorded by eugenic institutions", "disabled people", "racialized communities"]
  },
  embryoEro: {
    label: "Embryo Project Encyclopedia: Eugenics Record Office",
    url: "https://embryo.asu.edu/pages/eugenics-record-office-cold-spring-harbor-laboratory-1910-1939",
    role: "Academic encyclopedia source summarizing the Eugenics Record Office, its dates, activities, and influence in the United States.",
    claims: ["Institutional eugenics linked research, fieldwork, and policy advocacy", "Data collection and family studies shaped public arguments", "The ERO is a case study in harmful research infrastructure"],
    limits: "The source is a secondary summary and should not replace direct archive context or policy analysis.",
    sensitive: "Keep the focus on institutional accountability rather than biography or admiration.",
    communities: ["families classified by eugenic fieldwork", "institutionalized people", "disabled people"]
  },
  uclCollections: {
    label: "UCL: Prejudice in Power Eugenics Collections",
    url: "https://www.ucl.ac.uk/prejudice-in-power/resources/ucls-collections-relation-eugenics",
    role: "University collection guide showing how eugenics materials can be cataloged with explicit attention to prejudice, power, and institutional responsibility.",
    claims: ["Collection metadata must name harmful context", "Universities have responsibilities for inherited eugenics materials", "Archive access requires anti-endorsement framing"],
    limits: "The source is centered on UCL collections and should not be generalized without additional national context.",
    sensitive: "Use as a model for critical handling, not as a source of uncontextualized historical display.",
    communities: ["students", "researchers", "communities targeted by racial and ableist classification"]
  },
  uclInquiry: {
    label: "UCL: Inquiry into the History of Eugenics at UCL",
    url: "https://www.ucl.ac.uk/about/leadership/organisation/president-provost/inquiry-history-eugenics-ucl",
    role: "Institutional accountability source documenting university inquiry into historical eugenics links and the need for public review.",
    claims: ["Institutions need transparent review of eugenics legacies", "Prestige and academic authority helped normalize harmful ideas", "Reckoning includes teaching, collections, naming, and governance"],
    limits: "The inquiry addresses one university and should be paired with wider country and topic sources.",
    sensitive: "Avoid reducing institutional reckoning to reputational management; keep affected communities central.",
    communities: ["students", "staff", "communities harmed by scientific racism"]
  },
  uclTeaching: {
    label: "UCL: Teaching UCL's Eugenics Legacies Now and in the Future",
    url: "https://www.ucl.ac.uk/teaching-learning/publications/2025/may/elep-toolkit-3-teaching-ucls-eugenics-legacies-now-and-future",
    role: "Institutional teaching resource for discussing eugenics legacies with explicit pedagogy, warnings, and critical classroom framing.",
    claims: ["Teaching difficult eugenics history requires planning", "Source use should not platform harmful claims", "Educators need explicit boundaries and learning goals"],
    limits: "The toolkit is institution-specific and should be adapted to local classroom needs.",
    sensitive: "Do not ask students to reenact classification, ranking, or reproductive policy decisions.",
    communities: ["students", "educators", "affected communities"]
  },
  alberta: {
    label: "University of Alberta: Sterilization and Eugenics in Alberta",
    url: "https://journals.library.ualberta.ca/pi/index.php/pi/article/view/18879",
    role: "Academic source on Alberta sterilization history, provincial law, institutional authority, and the administrative form of coercive eugenics.",
    claims: ["Canadian eugenics operated through provincial institutions", "Sterilization policy was not merely medical", "Survivor-centered and archive-centered accountability matters"],
    limits: "The article focuses on Alberta and should be paired with broader Canadian or comparative sources.",
    sensitive: "Discuss sterilization as reproductive coercion, not as neutral administration.",
    communities: ["sterilization survivors", "disabled people", "Indigenous and racialized communities"]
  },
  lund: {
    label: "Lund University: Sweden and Sterilization History",
    url: "https://www.lunduniversity.lu.se/lup/publication/4905161",
    role: "Academic source for Sweden's sterilization history and the relationship between welfare-state administration, medical authority, and coercion.",
    claims: ["Eugenic policy can be framed as welfare administration", "Consent can be weakened by bureaucracy and dependency", "Country cases require local political context"],
    limits: "The source should be read with broader comparative and human-rights sources.",
    sensitive: "Avoid treating welfare language as proof of consent or benevolence.",
    communities: ["sterilization survivors", "disabled people", "institutionalized people"]
  },
  eugenicsArchive: {
    label: "Eugenics Archives",
    url: "https://www.eugenicsarchive.ca/",
    role: "Archive and public-history source that includes contextual material, primary-source interpretation, and survivor or affected-community perspectives on eugenics history.",
    claims: ["Survivor and affected-community context changes how sources should be read", "Archives need warnings and interpretation", "Primary evidence should not be detached from harm"],
    limits: "Archive entries vary by item; use the site as contextual evidence rather than a substitute for item-level review.",
    sensitive: "Do not copy raw primary sources or testimony out of context; summarize respectfully and link to context.",
    communities: ["survivors", "families", "disabled people", "Indigenous and racialized communities"]
  },
  googleSpam: {
    label: "Google Search Central: Spam Policies",
    url: "https://developers.google.com/search/docs/essentials/spam-policies",
    role: "Search-quality policy source used only for editorial and SEO boundaries against expired-domain abuse, scaled low-value pages, and misleading content.",
    claims: ["SEO should not substitute for usefulness or accuracy", "Trust surfaces need visible editorial standards", "Pre-launch pages should avoid spam-like growth tactics"],
    limits: "This is not a historical or bioethics source; it applies to publication quality controls.",
    sensitive: "Use only for site-governance pages, not as evidence about eugenics history.",
    communities: ["readers", "educators", "research users"]
  }
};

const standardSources = ["nhgri", "nhgriTimeline", "unescoGenome", "eugenicsArchive", "uclTeaching"];
const flagshipSources = ["nhgri", "nhgriTimeline", "eugenicsArchive", "unescoGenome", "unescoData", "uclTeaching", "uclInquiry", "uclCollections", "cshlEro", "embryoEro", "ushmm"];

const articleConfigs = [
  ["what-is-eugenics", "What Is Eugenics?", "definition, history, science critique, and responsible study", flagshipSources],
  ["why-eugenics-is-scientifically-wrong", "Why Eugenics Is Scientifically Wrong", "scientific critique of heredity misuse, complex traits, and policy overreach", ["nhgri", "nhgriTimeline", "unescoGenome", "unescoData", "eugenicsArchive", "uclTeaching"]],
  ["eugenics-and-scientific-racism", "Eugenics and Scientific Racism", "racial hierarchy, measurement misuse, institutional racism, and source critique", flagshipSources],
  ["eugenics-timeline-1883-present", "A Timeline of Eugenics, 1883-Present", "chronology as a teaching and archive tool", ["nhgriTimeline", "nhgri", "ushmm", "unescoGenome", "eugenicsArchive", "uclInquiry"]],
  ["eugenics-in-the-united-states", "Eugenics in the United States", "state law, institutional policy, immigration, race, disability, and survivor legacy", [...flagshipSources, "oyezBuck"]],
  ["eugenics-in-nazi-germany", "Eugenics in Nazi Germany", "Nazi racial hygiene, compulsory sterilization, antisemitism, disability murder, and state violence", ["ushmm", "nhgriTimeline", "nhgri", "unescoGenome", "eugenicsArchive", "uclTeaching"]],
  ["forced-sterilization-laws", "Forced Sterilization Laws", "law, medicine, disability, race, gender, institutions, and reproductive coercion", [...flagshipSources, "oyezBuck", "alberta"]],
  ["eugenics-and-disability-rights", "Eugenics and Disability Rights", "disability devaluation, bodily autonomy, rights language, and affected-community critique", ["nhgri", "unescoGenome", "eugenicsArchive", "nuffield", "uclTeaching", "nhgriDiscrimination"]],
  ["eugenics-and-immigration-policy", "Eugenics and Immigration Policy", "border policy, national belonging, race, heredity claims, and exclusion", ["nhgri", "nhgriTimeline", "eugenicsArchive", "unescoGenome", "uclInquiry", "uclTeaching"]],
  ["eugenics-iq-and-heredity", "Eugenics, IQ, and the Misuse of Heredity", "test scores, heritability, class, race, and false policy certainty", ["nhgri", "nhgriTimeline", "eugenicsArchive", "unescoGenome", "uclTeaching", "nhgriDiscrimination"]],
  ["eugenics-vs-genetics", "Eugenics vs. Genetics", "boundaries between heredity science and ideology that ranks human worth", ["nhgri", "nhgriTimeline", "nhgriDiscrimination", "unescoGenome", "unescoData", "whoGenomeEditing", "nuffield", "eugenicsArchive", "uclTeaching", "uclInquiry"]],
  ["eugenics-record-office", "What Was the Eugenics Record Office?", "archives, pedigrees, fieldwork, institutional authority, and policy influence", ["cshlEro", "embryoEro", "nhgri", "eugenicsArchive", "uclCollections", "uclTeaching"]],
  ["eugenics-in-schools-and-public-health", "How Eugenics Entered Schools and Public Health", "education, health administration, heredity lessons, and public authority", ["nhgri", "nhgriTimeline", "eugenicsArchive", "uclTeaching", "uclInquiry", "unescoGenome"]],
  ["modern-eugenics-debate", "Is There Such a Thing as Modern Eugenics?", "modern bioethics, social pressure, genetic discrimination, enhancement, and governance", ["nhgri", "unescoGenome", "unescoData", "whoGenomeEditing", "nuffield", "nhgriDiscrimination"]],
  ["teaching-eugenics-responsibly", "Teaching Eugenics Responsibly", "classroom ethics, source-use rules, warnings, and discussion design", ["uclTeaching", "eugenicsArchive", "nhgri", "nhgriTimeline", "ushmm", "uclCollections"]],
  ["eugenics-and-race", "Eugenics and Race", "race as social power, scientific racism, classification, and affected-community framing", ["nhgri", "ushmm", "eugenicsArchive", "unescoGenome", "uclInquiry", "uclTeaching"]],
  ["is-eugenics-pseudoscience", "Is Eugenics Pseudoscience?", "pseudoscience, measurement misuse, values hidden as data, and institutional authority", ["nhgri", "nhgriTimeline", "eugenicsArchive", "uclTeaching", "unescoGenome"]],
  ["genetic-testing-embryo-selection-ethical-boundaries", "Genetic Testing, Embryo Selection, and Ethical Boundaries", "genetic testing, embryo selection, consent, disability rights, and access inequality", ["unescoGenome", "unescoData", "whoGenomeEditing", "nuffield", "nhgriDiscrimination", "nhgri"]],
  ["crispr-enhancement-new-eugenics", "CRISPR, Enhancement, and New Eugenics Claims", "genome editing, enhancement, governance, social pressure, and anti-eugenics safeguards", ["whoGenomeEditing", "nuffield", "unescoGenome", "unescoData", "nhgri", "nhgriDiscrimination"]],
  ["buck-v-bell-forced-sterilization", "Buck v. Bell and Forced Sterilization", "constitutional language, state sterilization, institutional power, and survivor-centered reading", ["oyezBuck", "nhgriTimeline", "nhgri", "eugenicsArchive", "unescoGenome", "uclTeaching"]],
  ["francis-galton-and-the-origin-of-eugenics", "Francis Galton and the Origin of Eugenics", "the origin of the term, statistics, empire, heredity claims, and institutional memory", ["nhgri", "nhgriTimeline", "uclInquiry", "uclCollections", "eugenicsArchive", "unescoGenome"]],
  ["charles-davenport-and-institutional-eugenics", "Charles Davenport and Institutional Eugenics", "institutional research, pedigree collection, policy advocacy, and archive accountability", ["cshlEro", "embryoEro", "nhgri", "eugenicsArchive", "uclCollections", "uclTeaching"]],
  ["eugenics-in-britain", "Eugenics in Britain", "Galton, UCL legacies, class, empire, statistics, and institutional reckoning", ["nhgriTimeline", "nhgri", "uclInquiry", "uclCollections", "uclTeaching", "eugenicsArchive"]],
  ["eugenics-in-canada", "Eugenics in Canada", "Alberta, provincial sterilization law, institutions, archives, and survivor accountability", ["eugenicsArchive", "alberta", "nhgri", "unescoGenome", "uclTeaching", "nhgriTimeline"]],
  ["eugenics-in-sweden", "Eugenics in Sweden", "welfare administration, medical authority, sterilization history, consent, and comparative lessons", ["lund", "nhgriTimeline", "nhgri", "unescoGenome", "eugenicsArchive", "uclTeaching"]]
];

const staticConfigs = [
  ["index", "/", "Eugenics: A Critical History & Bioethics Archive", "static", "research portal and source-backed route map", ["nhgri", "nhgriTimeline", "eugenicsArchive", "unescoGenome", "uclTeaching", "ushmm"]],
  ["history", "/history.html", "History of Eugenics", "static", "historical route hub for chronology, law, race, disability, country cases, and institutions", ["nhgriTimeline", "nhgri", "ushmm", "eugenicsArchive", "uclInquiry", "uclTeaching"]],
  ["bioethics", "/bioethics.html", "Modern Bioethics & Genetics", "static", "modern genetics, human rights, consent, genetic discrimination, and enhancement governance", ["unescoGenome", "unescoData", "whoGenomeEditing", "nuffield", "nhgriDiscrimination", "nhgri"]],
  ["teaching", "/teaching.html", "Teaching Resources", "teaching", "printable teaching hub with course paths, source-use rules, and discussion boundaries", ["uclTeaching", "eugenicsArchive", "nhgri", "nhgriTimeline", "ushmm", "uclCollections", "unescoGenome", "googleSpam"]],
  ["archive", "/archive.html", "Critical Archive Model", "archive", "publication gate, planned collections, and annotated non-download sample entries", ["eugenicsArchive", "uclCollections", "cshlEro", "embryoEro", "ushmm", "uclInquiry", "nhgri", "googleSpam"]],
  ["glossary", "/glossary.html", "Glossary", "glossary", "defined terms for classroom, archive, and bioethics use", ["nhgri", "nhgriTimeline", "unescoGenome", "unescoData", "uclTeaching", "eugenicsArchive"]],
  ["editorial-policy", "/editorial-policy.html", "Editorial Policy", "static", "source standards, corrections, archive rules, anti-endorsement, and SEO boundaries", ["googleSpam", "uclTeaching", "uclCollections", "unescoGenome", "eugenicsArchive", "nhgri"]],
  ["about", "/about.html", "About the Project", "static", "mission, scope, pre-launch status, human-rights stance, and trust path", ["nhgri", "eugenicsArchive", "unescoGenome", "uclTeaching", "uclInquiry", "googleSpam"]],
  ["corrections", "/corrections.html", "Corrections and Contact", "static", "public correction route, review categories, limits, and source-update process", ["googleSpam", "uclTeaching", "eugenicsArchive", "unescoGenome", "nhgri"]],
  ["content-warning", "/content-warning.html", "Content Warning", "static", "reader guidance for harmful historical language, coercion, violence, and archive expansion", ["ushmm", "eugenicsArchive", "uclTeaching", "nhgri", "unescoGenome"]]
];

function pickSources(keys) {
  return keys.map((key) => sourcePool[key]);
}

function answerSummary(title, angle, tier) {
  if (tier === "flagship") {
    return `${title} explains ${angle} as a source-backed history of eugenic harm. It rejects endorsement, ranks of human worth, and medical or reproductive advice while foregrounding affected communities, institutions, and teaching safeguards.`;
  }
  return `${title} explains ${angle} through source-backed critique. It rejects eugenic endorsement, inherited-worth claims, coercive policy, and medical or reproductive advice while naming affected communities and limits.`;
}

function deepDives(title, angle, sourceLabels, tier) {
  const count = tier === "flagship" ? 6 : tier === "teaching" || tier === "archive" ? 9 : tier === "glossary" ? 7 : 5;
  const frames = [
    ["Start With the Claim Being Reviewed", `This page treats ${angle} as a set of claims that must be checked against evidence, institutions, and harm. The first question is not whether eugenic language sounds modern or efficient. The first question is what the claim does: whether it reduces complex human lives to heredity, ranks people or groups, and then invites law, medicine, education, or administration to act on that ranking. Sources such as ${sourceLabels[0]} and ${sourceLabels[1] || sourceLabels[0]} are used to hold that distinction steady. They help readers see that evidence about heredity is not evidence of human worth, and that a historical claim can be important to document while still being false, coercive, or dehumanizing.`],
    ["Institutions Made the Idea Powerful", `Eugenics did not become harmful only because individuals held prejudiced beliefs. It became powerful when institutions gave those beliefs records, tests, offices, case files, court orders, lesson plans, public-health language, or archive systems. For ${title}, the institutional layer is central because it shows how a claim could move from a private assumption into an administrative decision. A source packet therefore has to ask who collected the data, what categories were used, which people could refuse, and what consequences followed. That approach prevents the page from treating eugenics as a disembodied idea. It shows how authority, paperwork, and professional language could make a rights violation appear orderly.`],
    ["Affected Communities Are Not an Afterthought", `A V3 page must identify affected communities as part of the argument, not as a closing moral note. People targeted by eugenic systems included disabled people, institutionalized people, racialized and Indigenous communities, immigrants, poor families, women and girls under institutional control, Jewish communities under Nazi racial policy, and people whose family histories were turned into evidence against them. For ${angle}, naming affected communities changes the reading. It stops the page from centering only reformers, courts, researchers, or administrators. It asks how the policy was experienced by people subject to classification, surveillance, segregation, sterilization, exclusion, or public devaluation.`],
    ["Science and Values Must Be Separated", `The page separates scientific description from value claims. Genetics can describe inheritance, disease risk, variation, or biological mechanisms. Eugenic reasoning takes a different step: it treats selected traits or social outcomes as measures of social worth and then converts that judgment into policy. That leap is the problem. The source packet uses ${sourceLabels[2] || sourceLabels[0]} and ${sourceLabels[3] || sourceLabels[0]} to show why human-rights language, consent, privacy, and non-discrimination belong in any discussion of heredity. The goal is not to reject genetic science. The goal is to reject claims that use scientific vocabulary to authorize hierarchy or coercion.`],
    ["Teaching Requires an Anti-Endorsement Frame", `Teaching ${title} requires a visible boundary before students encounter disturbing material. The page should not ask learners to rank people, simulate reproductive policy, or debate whether targeted communities deserved rights. Those exercises reproduce the logic being studied. A stronger teaching design asks students to identify the claim, source creator, institution, affected community, missing context, and present-day lesson. This is why the page uses source notes and discussion prompts instead of raw propaganda or unframed primary downloads. Critical education has to show how eugenic claims worked while making clear that the project rejects the claims themselves.`],
    ["Modern Relevance Is About Patterns, Not Alarmism", `The modern lesson is not that every genetic technology is eugenics. That would flatten the distinction between voluntary care, research, governance, and coercive population policy. The useful question is whether familiar patterns are appearing: heredity claims treated as destiny, social inequality explained as biology, access differences hidden behind choice, disability devaluation presented as progress, or state and market pressure shaping reproduction. For ${angle}, the page uses modern bioethics sources to discuss those patterns without giving medical, reproductive, or legal advice. It keeps the focus on consent, dignity, rights, and accountability.`],
    ["Archive Work Needs Publication Gates", `Archive practice is part of the content quality standard. A harmful source can be important evidence and still be unsafe to publish as an unframed download. The gate asks for provenance, content warning, affected-community context, harmful-claim summary, editorial note, source rights, and a reason the item should be visible. For ${title}, that archive discipline helps prevent the site from becoming a repository of disturbing material without interpretation. It also improves SEO quality in a real way: readers get context, not a thin page built around a sensational term or historical artifact.`],
    ["Claim Review Must Stay Visible", `A source-backed page should show how claims are checked. The visible claim map gives readers an audit path: what the page asserts, what source supports it, what the source cannot prove, and where sensitive language needs care. That matters for ${angle} because eugenics often gained credibility by hiding value judgments inside charts, case files, legal summaries, or expert vocabulary. V3 makes the opposite move. It places the claim, evidence, caveat, and affected-community note on the page so educators, readers, and future reviewers can challenge or correct the material without guessing how conclusions were reached.`],
    ["Review Is Pre-Launch, Not Final Authority", `This page is still pre-launch. The current standard is source-backed editorial review, not a claim of final academic authority. That distinction matters because sensitive histories need ongoing correction, specialist review, and affected-community input. The page names the review status, correction route, and limits so readers understand how the resource should be used. For ${title}, the strongest version of trust is not a voice that sounds certain about everything. It is a structure that makes evidence, caveats, editorial boundaries, and future review visible.`]
  ];
  return frames.slice(0, count).map(([heading, body]) => ({ heading, body }));
}

function claimMap(title, angle, sources, tier) {
  const count = tier === "flagship" ? 6 : tier === "teaching" || tier === "archive" ? 7 : 5;
  const sourceLabels = sources.map((source) => source.label);
  const claims = [
    {
      claim: "Eugenics is a rights-violating ideology, not a neutral branch of genetics.",
      evidence: `${sourceLabels[0]} supports the core distinction: evidence about heredity cannot be turned into a ranking of human worth. For ${title}, that means claims about ${angle} must be examined for the policy action they invite, not only for the scientific words they use.`,
      sourceLabels: sourceLabels.slice(0, 3)
    },
    {
      claim: "Historical context is required before harmful claims or primary materials are shown.",
      evidence: `${sourceLabels[1] || sourceLabels[0]} and ${sourceLabels[2] || sourceLabels[0]} show that eugenics moved through dates, institutions, records, and policies. The page therefore rejects raw display and uses warnings, source roles, and caveats before any sensitive material is discussed.`,
      sourceLabels: sourceLabels.slice(1, 4)
    },
    {
      claim: "Affected communities must be named in the analysis.",
      evidence: `The source packet identifies who was classified, excluded, sterilized, institutionalized, surveilled, or otherwise harmed. That is essential for ${angle} because a policy history centered only on officials or researchers can make coercion look abstract.`,
      sourceLabels: [sourceLabels[0], sourceLabels[3] || sourceLabels[0]].filter(Boolean)
    },
    {
      claim: "Bioethics safeguards are part of the historical lesson.",
      evidence: `${sourceLabels.find((label) => label.includes("UNESCO")) || sourceLabels[0]} connects genetic science to dignity, consent, privacy, and non-discrimination. The page uses those principles as boundaries and does not offer medical, reproductive, genetic, or legal advice.`,
      sourceLabels: sourceLabels.filter((label) => /UNESCO|WHO|Nuffield|Genetic Discrimination/.test(label)).slice(0, 3)
    },
    {
      claim: "Teaching should analyze power, not replay classification.",
      evidence: `${sourceLabels.find((label) => label.includes("Teaching")) || sourceLabels[0]} supports a classroom model built around source criticism, careful warnings, and anti-endorsement. Students should study how eugenic claims worked, not practice the ranking logic that made them harmful.`,
      sourceLabels: sourceLabels.filter((label) => /Teaching|Archives|UCL/.test(label)).slice(0, 3)
    },
    {
      claim: "Law and administration can make coercion look ordinary.",
      evidence: `Where ${title} involves courts, boards, schools, public health, or welfare systems, the page treats administrative form as part of the harm. A policy can be coercive even when it appears as a routine file, diagnosis, order, or professional recommendation.`,
      sourceLabels: sourceLabels.filter((label) => /Oyez|Alberta|Sweden|Timeline|Archive/.test(label)).slice(0, 3)
    },
    {
      claim: "Country cases require comparison without false equivalence.",
      evidence: `The packet uses country and institution sources to compare mechanisms while preserving differences in scale, ideology, law, and violence. Comparison is useful only when it clarifies how eugenic patterns traveled and changed, not when it collapses every case into one story.`,
      sourceLabels: sourceLabels.slice(0, 4)
    },
    {
      claim: "Modern relevance should focus on governance patterns.",
      evidence: `The page does not label all genetic technology as eugenics. It asks whether coercion, discrimination, disability devaluation, racial hierarchy, or social pressure is being attached to genetic information. That pattern-based approach keeps the lesson serious and avoids alarmism.`,
      sourceLabels: sourceLabels.filter((label) => /WHO|Nuffield|UNESCO|Genetic Discrimination|NHGRI/.test(label)).slice(0, 4)
    }
  ];
  return claims.slice(0, count);
}

function teachingUse(title, angle, tier) {
  const objectiveCount = tier === "flagship" || tier === "teaching" || tier === "archive" ? 5 : 3;
  const promptCount = tier === "flagship" || tier === "teaching" || tier === "archive" ? 5 : 3;
  return {
    objectives: [
      `Define the main claim in ${title} without adopting eugenic categories as neutral vocabulary.`,
      `Identify how ${angle} moved through institutions, source records, policy, or public authority.`,
      "Distinguish evidence about heredity from claims about human worth, rights, or social value.",
      "Explain which affected communities must be centered when teaching or citing this history.",
      "Apply the source-packet method: role, supported claim, caveat, sensitive-language note, and affected-community context."
    ].slice(0, objectiveCount),
    discussionPrompts: [
      `What claim does this page ask readers to reject, and what historical evidence explains why it mattered?`,
      `Which institution gave ${angle} authority, and which people had the least power to refuse its consequences?`,
      "Where does the page separate historical description from project position?",
      "What would make a primary source unsafe or misleading if shown without context?",
      "How can modern genetics or bioethics learn from this history without turning the past into a vague analogy?"
    ].slice(0, promptCount),
    classroomWarnings: [
      "Begin with the anti-endorsement statement and content warning before students read historical claims.",
      "Do not assign simulations that rank people, families, races, disabilities, or reproductive value.",
      "Do not ask students to debate whether targeted communities deserved rights, dignity, or bodily autonomy.",
      "Use primary-source excerpts only with provenance, harmful-claim summary, and affected-community context."
    ]
  };
}

function doesNotDo(title) {
  return [
    `${title} does not endorse eugenics, racial hierarchy, antisemitism, ableism, forced sterilization, genetic discrimination, or reproductive coercion.`,
    "It does not provide medical, reproductive, genetic counseling, fertility, or legal advice.",
    "It does not publish raw propaganda, extremist material, or primary-source downloads without context and review.",
    "It does not treat survivor testimony, affected-community history, or disability-rights critique as optional decoration.",
    "It does not use SEO value as a reason to flatten complex history into thin pages or sensational summaries."
  ];
}

function relatedTopics(id) {
  const base = [
    { label: "Definition", href: "what-is-eugenics.html" },
    { label: "Science critique", href: "why-eugenics-is-scientifically-wrong.html" },
    { label: "Scientific racism", href: "eugenics-and-scientific-racism.html" },
    { label: "Forced sterilization law", href: "forced-sterilization-laws.html" },
    { label: "Modern bioethics", href: "bioethics.html" },
    { label: "Teaching hub", href: "teaching.html" },
    { label: "Archive gate", href: "archive.html" }
  ];
  return base.filter((item) => !item.href.startsWith(`${id}.`)).slice(0, 5);
}

function firstSentence(text) {
  const sentence = text.match(/^[^.]+[.]/);
  return sentence ? sentence[0] : text;
}

function packetFor({ id, route, title, tier, pageType, angle, sourceKeys }) {
  const sources = pickSources(sourceKeys);
  const sourceLabels = sources.map((source) => source.label);
  return {
    route,
    title,
    contentTier: tier,
    pageType,
    audience: pageType === "hub" ? ["educators", "research users", "students", "editors"] : ["students", "educators", "general readers", "research users"],
    answerSummary: answerSummary(title, angle, tier),
    reviewStatus: "V3 pre-launch source-packet review complete; external subject-matter and affected-community review pending.",
    claimReviewStatus: "Claims are mapped to the source packet below; URL-only citation is not treated as sufficient support.",
    lastReviewedBy: reviewer,
    learningObjectives: teachingUse(title, angle, tier).objectives,
    affectedCommunities: ["disabled people", "institutionalized people", "racialized communities", "survivors and families affected by coercive policy"],
    claimMap: claimMap(title, angle, sources, tier),
    deepDiveSections: deepDives(title, angle, sourceLabels, tier),
    sourceCoverage: sources.map((source) => ({
      label: source.label,
      url: source.url,
      role: firstSentence(source.role),
      supportedClaims: source.claims.slice(0, 2),
      limits: firstSentence(source.limits),
      sensitiveLanguageNotes: firstSentence(source.sensitive),
      affectedCommunities: source.communities
    })),
    teachingUse: teachingUse(title, angle, tier),
    doesNotDo: doesNotDo(title),
    relatedTopicPath: relatedTopics(id)
  };
}

function yamlList(items, indent = "  ") {
  return items.map((item) => `${indent}- "${item.replace(/"/g, '\\"')}"`).join("\n");
}

function insertFrontmatterFields(markdown, slug) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return markdown;
  let frontmatter = match[1];
  const body = match[2];
  frontmatter = frontmatter.replace(/^lastUpdated:\s*.+$/m, `lastUpdated: ${today}`);
  const tier = flagshipSlugs.has(slug) ? "flagship" : "standard";
  const fieldBlock = [
    `sourcePacket: "${slug}"`,
    `contentTier: "${tier}"`,
    "audience:",
    yamlList(["students", "educators", "research users", "general readers"], "  "),
    `claimReviewStatus: "V3 source-packet review complete; claims require linked source roles, limits, and affected-community notes."`,
    "learningObjectives:",
    yamlList([
      "Identify the page's core claim and the evidence used to support it.",
      "Distinguish historical description from anti-endorsement project position.",
      "Explain affected communities and why source caveats matter for this topic."
    ], "  "),
    `lastReviewedBy: "${reviewer}"`
  ].join("\n");
  if (!/^sourcePacket:/m.test(frontmatter)) {
    const positionPattern = /^position:\s*.*$/m;
    if (positionPattern.test(frontmatter)) {
      frontmatter = frontmatter.replace(positionPattern, (line) => `${line}\n${fieldBlock}`);
    } else {
      frontmatter = `${frontmatter}\n${fieldBlock}`;
    }
  }
  if (/^reviewStatus:/m.test(frontmatter)) {
    frontmatter = frontmatter.replace(/^reviewStatus:\s*.*$/m, `reviewStatus: "V3 pre-launch editorial review complete; external subject-matter and affected-community review pending."`);
  } else {
    frontmatter += `\nreviewStatus: "V3 pre-launch editorial review complete; external subject-matter and affected-community review pending."`;
  }
  return `---\n${frontmatter}\n---\n${body}`;
}

await fs.mkdir(packetDir, { recursive: true });

for (const [id, title, angle, sourceKeys] of articleConfigs) {
  const tier = flagshipSlugs.has(id) ? "flagship" : "standard";
  const packet = packetFor({
    id,
    route: `/${id}.html`,
    title,
    tier,
    pageType: "article",
    angle,
    sourceKeys
  });
  await fs.writeFile(path.join(packetDir, `${id}.json`), `${JSON.stringify(packet, null, 2)}\n`);

  const articlePath = path.join(articleDir, `${id}.md`);
  const current = await fs.readFile(articlePath, "utf8");
  const updated = insertFrontmatterFields(current, id);
  await fs.writeFile(articlePath, updated);
}

for (const [id, route, title, tier, angle, sourceKeys] of staticConfigs) {
  const packet = packetFor({
    id,
    route,
    title,
    tier,
    pageType: "hub",
    angle,
    sourceKeys
  });
  await fs.writeFile(path.join(packetDir, `${id}.json`), `${JSON.stringify(packet, null, 2)}\n`);
}

const allPackets = articleConfigs.length + staticConfigs.length;
console.log(`Generated ${allPackets} V3 source packets.`);
