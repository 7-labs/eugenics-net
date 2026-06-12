export const SITE = {
  name: "Eugenics: A Critical History",
  title: "Eugenics: A Critical History & Bioethics Archive",
  url: "https://eugenics.net",
  owner: "Eugenics History & Bioethics Project",
  lastUpdated: "2026-06-03",
  correctionsEmail: "corrections@eugenics.net",
  defaultImage: "/assets/archive-reading-room.webp",
  defaultDescription:
    "A critical education and archive project documenting the history, harms, and modern bioethics legacy of eugenics and scientific racism.",
  globalAlert:
    "This site does not endorse eugenics, scientific racism, antisemitism, ableism, racial hierarchy, forced sterilization, or genetic discrimination. Historical materials are presented for education, documentation, and critique."
};

export const navItems = [
  { label: "Home", href: "index.html", path: "/" },
  { label: "History", href: "history.html", path: "/history.html" },
  { label: "Bioethics", href: "bioethics.html", path: "/bioethics.html" },
  { label: "Teaching", href: "teaching.html", path: "/teaching.html" },
  { label: "Archive", href: "archive.html", path: "/archive.html" },
  { label: "Glossary", href: "glossary.html", path: "/glossary.html" },
  { label: "Policy", href: "editorial-policy.html", path: "/editorial-policy.html" },
  { label: "About", href: "about.html", path: "/about.html" }
];

export const staticPages = [
  "/",
  "/history.html",
  "/bioethics.html",
  "/teaching.html",
  "/archive.html",
  "/glossary.html",
  "/editorial-policy.html",
  "/corrections.html",
  "/updates.html",
  "/content-warning.html",
  "/about.html"
];

export const foundationalArticles = [
  { slug: "what-is-eugenics", title: "What Is Eugenics?" },
  { slug: "why-eugenics-is-scientifically-wrong", title: "Why Eugenics Is Scientifically Wrong" },
  { slug: "eugenics-and-scientific-racism", title: "Eugenics and Scientific Racism" },
  { slug: "eugenics-timeline-1883-present", title: "A Timeline of Eugenics, 1883-Present" },
  { slug: "eugenics-in-the-united-states", title: "Eugenics in the United States" },
  { slug: "eugenics-in-nazi-germany", title: "Eugenics in Nazi Germany" },
  { slug: "forced-sterilization-laws", title: "Forced Sterilization Laws" },
  { slug: "eugenics-and-disability-rights", title: "Eugenics and Disability Rights" },
  { slug: "eugenics-and-immigration-policy", title: "Eugenics and Immigration Policy" },
  { slug: "eugenics-iq-and-heredity", title: "Eugenics, IQ, and the Misuse of Heredity" },
  { slug: "eugenics-vs-genetics", title: "Eugenics vs. Genetics" },
  { slug: "eugenics-record-office", title: "What Was the Eugenics Record Office?" },
  { slug: "eugenics-in-schools-and-public-health", title: "How Eugenics Entered Schools and Public Health" },
  { slug: "modern-eugenics-debate", title: "Is There Such a Thing as Modern Eugenics?" },
  { slug: "teaching-eugenics-responsibly", title: "Teaching Eugenics Responsibly" },
  { slug: "eugenics-and-race", title: "Eugenics and Race" },
  { slug: "is-eugenics-pseudoscience", title: "Is Eugenics Pseudoscience?" },
  { slug: "genetic-testing-embryo-selection-ethical-boundaries", title: "Genetic Testing, Embryo Selection, and Ethical Boundaries" },
  { slug: "crispr-enhancement-new-eugenics", title: "CRISPR, Enhancement, and New Eugenics Claims" },
  { slug: "buck-v-bell-forced-sterilization", title: "Buck v. Bell and Forced Sterilization" },
  { slug: "francis-galton-and-the-origin-of-eugenics", title: "Francis Galton and the Origin of Eugenics" },
  { slug: "charles-davenport-and-institutional-eugenics", title: "Charles Davenport and Institutional Eugenics" },
  { slug: "eugenics-in-britain", title: "Eugenics in Britain" },
  { slug: "eugenics-in-canada", title: "Eugenics in Canada" },
  { slug: "eugenics-in-sweden", title: "Eugenics in Sweden" }
];

export const commonSources = {
  nhgri: {
    label: "NHGRI: Eugenics and Scientific Racism",
    url: "https://www.genome.gov/about-genomics/fact-sheets/Eugenics-and-Scientific-Racism"
  },
  ushmm: {
    label: "United States Holocaust Memorial Museum: Nazi Racial Hygiene",
    url: "https://encyclopedia.ushmm.org/content/en/article/the-biological-state-nazi-racial-hygiene-1933-1939"
  },
  unesco: {
    label: "UN Digital Library: Universal Declaration on the Human Genome and Human Rights",
    url: "https://digitallibrary.un.org/record/495408?ln=en"
  },
  ucl: {
    label: "UCL: Teaching UCL's Eugenics Legacies Now and in the Future",
    url: "https://www.ucl.ac.uk/teaching-learning/publications/2025/may/elep-toolkit-3-teaching-ucls-eugenics-legacies-now-and-future"
  },
  archive: {
    label: "Eugenics Archives",
    url: "https://www.eugenicsarchive.ca/"
  },
  nhgriTimeline: {
    label: "NHGRI: Eugenics Timeline",
    url: "https://www.genome.gov/about-genomics/educational-resources/timelines/eugenics"
  },
  nhgriDiscrimination: {
    label: "NHGRI: Genetic Discrimination",
    url: "https://www.genome.gov/about-genomics/policy-issues/genetic-discrimination"
  },
  unescoGenome: {
    label: "UNESCO: Universal Declaration on the Human Genome and Human Rights",
    url: "https://www.unesco.org/en/legal-affairs/universal-declaration-human-genome-and-human-rights"
  },
  unescoData: {
    label: "UNESCO: International Declaration on Human Genetic Data",
    url: "https://www.unesco.org/en/ethics-science-technology/human-genetic-data"
  },
  whoGenomeEditing: {
    label: "WHO: Human Genome Editing Recommendations",
    url: "https://www.who.int/publications/i/item/9789240030381"
  },
  nuffieldGenomeEditing: {
    label: "Nuffield Council on Bioethics: Genome Editing and Human Reproduction",
    url: "https://www.nuffieldbioethics.org/publication/genome-editing-and-human-reproduction-social-and-ethical-issues/"
  },
  oyezBuck: {
    label: "Oyez: Buck v. Bell",
    url: "https://www.oyez.org/cases/1900-1940/274us200"
  },
  cshlEro: {
    label: "Cold Spring Harbor Laboratory: Eugenics Record Office",
    url: "https://www.cshl.edu/archives/institutional-collections/eugenics-record-office/"
  },
  embryoProjectEro: {
    label: "Embryo Project Encyclopedia: Eugenics Record Office",
    url: "https://embryo.asu.edu/pages/eugenics-record-office-cold-spring-harbor-laboratory-1910-1939"
  },
  uclCollections: {
    label: "UCL: Prejudice in Power Eugenics Collections",
    url: "https://www.ucl.ac.uk/prejudice-in-power/resources/ucls-collections-relation-eugenics"
  },
  uclInquiry: {
    label: "UCL: Inquiry into the History of Eugenics at UCL",
    url: "https://www.ucl.ac.uk/about/leadership/organisation/president-provost/inquiry-history-eugenics-ucl"
  },
  albertaSterilization: {
    label: "University of Alberta: Sterilization and Eugenics in Alberta",
    url: "https://journals.library.ualberta.ca/pi/index.php/pi/article/view/18879"
  },
  lundSweden: {
    label: "Lund University: Sweden and Sterilization History",
    url: "https://www.lunduniversity.lu.se/lup/publication/4905161"
  },
  googleSpam: {
    label: "Google Search Central: Spam Policies",
    url: "https://developers.google.com/search/docs/essentials/spam-policies"
  }
};
