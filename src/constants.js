// ---------------------------------------------------------------------------
// BRAND, FONTS, BOOKS, USERS, AND ALL APP-WIDE CONSTANTS
// ---------------------------------------------------------------------------

// Brand palette — Marginalia warm library aesthetic
export const BRAND = {
  cream: "#F2EFEB",
  paper: "#FBF8F3",
  ink: "#262020",
  muted: "#6B5D54",
  coral: "#F25C5C",
  coralDeep: "#D94A4A",
  terracotta: "#BF755A",
  tan: "#D9A282",
  espresso: "#2A201B",
  espresso2: "#3A2A22",
  line: "#E4D9CC",
  line2: "#D6C7B6",
  oakHi: "#B07F49",
  oak: "#925E32",
  oakLo: "#6E4422",
  oakDeep: "#4A2C16",
  brassHi: "#E8CF93",
  brass: "#C2A35E",
  brassLo: "#8F7233",
  card: "#F6EEDD",
  cardEdge: "#E2D4BC",
  rule: "#C9B79A",
  dark: "#2A201B",
  darkCard: "#3A2A22",
};

// Typography tokens
export const FONT = {
  display: "'Cormorant Garamond', Georgia, serif",
  read: "'Spectral', Georgia, serif",
  body: "'Jost', system-ui, -apple-system, sans-serif",
  type: "'Special Elite', 'Courier New', ui-monospace, monospace",
};

// ---------------------------------------------------------------------------
// STATIC BOOKS — Amy's pre-loaded books. Lynnell starts with an empty shelf.
// ---------------------------------------------------------------------------
export const AMY_BOOKS = [
  {
    id: "tipping-point",
    title: "The Tipping Point",
    subtitle: "How Little Things Can Make a Big Difference",
    author: "Malcolm Gladwell",
    year: "2000",
    format: "academic",
    accent: "#C1432B",
    theme: {
      bg: "#EDE8DC", card: "#F7F4EC", ink: "#1A1612",
      inkSoft: "rgba(26,22,18,0.62)", inkFaint: "rgba(26,22,18,0.4)", border: "rgba(26,22,18,0.16)",
      display: "'Cormorant Garamond', Georgia, serif", body: "'Jost', system-ui, -apple-system, sans-serif", mono: "'Special Elite', 'Courier New', ui-monospace, monospace",
      displayWeight: 600, headerBg: "#1A1612", headerInk: "#EDE8DC",
    },
    cover: "https://www.gladwellbooks.com/wp-content/uploads/2017/06/9780316316965.jpg",
    tagline: "The moment an idea, product, or behavior crosses a threshold and spreads like an epidemic — and the three forces that decide whether it does.",
    nodes: [
      { tag: "Rule One", title: "The Law of the Few", dek: "Epidemics are driven by a small number of unusually wired people, not the average person.",
        points: ["Connectors — people with enormous, varied social networks who casually link otherwise separate worlds. Gladwell's example: Paul Revere, whose ride worked because he knew everyone worth knowing on the route to Lexington.","Mavens — information hoarders who accumulate knowledge and compulsively share it.","Salesmen — persuaders with a contagious, often unconscious charisma."] },
      { tag: "Rule Two", title: "The Stickiness Factor", dek: "The message itself has to be memorable enough to act on.",
        points: ["Sesame Street tested obsessively which segments held a 4-year-old's attention.","Blue's Clues took stickiness further by repeating a single episode five days running.","Small, counterintuitive tweaks can be the entire difference between a forgotten message and one that spreads."] },
      { tag: "Rule Three", title: "The Power of Context", dek: "People are far more sensitive to their immediate environment than to inner character.",
        points: ["New York's subway crime drop via the Broken Windows theory.","The Rule of 150: groups beyond ~150 need structure to substitute for relationship.","Small situational details measurably change whether people stop to help a stranger."] },
    ],
    caseFile: { tag: "Highlighted story · The Law of the Few", meta: "April 18, 1775", title: "The Midnight Ride of Paul Revere",
      story: ["Two riders set out to warn the countryside: Paul Revere and a tanner named William Dawes — same distance, same news.","Revere's warning galvanized militias; Dawes's barely registered.","Revere was a famous Connector, known personally to the captains he needed to reach."],
      argument: "This is the load-bearing example for the Law of the Few — a message's fate depends disproportionately on who happens to be carrying it." },
    keyLines: ["Ideas, products, messages, and behaviors spread just like outbreaks of infectious disease.","The key to getting people to change their behavior is not in the message itself but in the messenger.","Look at the world around you. It may seem like an immovable, implacable place. It is not."],
    thread: "Gladwell's first take treats epidemics as fundamentally good news: small, targeted interventions can outperform expensive, broad ones.",
  },
  {
    id: "revenge-tipping-point",
    title: "Revenge of the Tipping Point",
    subtitle: "Overstories, Superspreaders, and the Rise of Social Engineering",
    author: "Malcolm Gladwell",
    year: "2024",
    format: "academic",
    accent: "#E8B23D",
    theme: {
      bg: "#16140F", card: "#1F1B14", ink: "#F2ECDD",
      inkSoft: "rgba(242,236,221,0.66)", inkFaint: "rgba(242,236,221,0.42)", border: "rgba(242,236,221,0.16)",
      display: "'Cormorant Garamond', Georgia, serif", body: "'Jost', system-ui, -apple-system, sans-serif", mono: "'Special Elite', 'Courier New', ui-monospace, monospace",
      displayWeight: 800, headerBg: "#E8B23D", headerInk: "#16140F",
    },
    cover: "https://www.gladwellbooks.com/wp-content/uploads/2024/07/9780316575805_638919.jpg",
    tagline: "The same three forces, revisited a quarter-century later — this time tracing who deliberately engineers tipping points.",
    nodes: [
      { tag: "New Idea", title: "The Overstory", dek: "Every group operates inside an invisible 'overstory' that quietly sets what behavior feels normal.",
        points: ["Gladwell asks 'Why is Miami... Miami?' — decades of immigration and finance created an overstory pulling in a particular style of business.","Change the overstory and you change outcomes faster than you can change individuals."] },
      { tag: "New Idea", title: "The Magic Third", dek: "Group behavior often tips only once a minority reaches roughly one-third representation.",
        points: ["A token minority tends to assimilate to majority norms — but once representation nears ~30–35%, culture shifts.","Applied to elite university sports recruiting and racial integration."] },
      { tag: "Dark Mirror", title: "Superspreaders & Engineered Epidemics", dek: "If a few connectors can spread a good idea, a few bad actors can manufacture a harmful one.",
        points: ["The opioid epidemic reframed through a small number of 'superspreader' prescribers.","1990s LA bank robbery spread through a tight social network of repeat offenders.","TV executives credited with normalizing once-taboo subjects."] },
    ],
    caseFile: { tag: "Highlighted story · Superspreaders", meta: "Purdue Pharma, est. 1996", title: "The Opioid Crisis as a Prescribing Epidemic",
      story: ["The conventional story blamed a generic 'opioid culture' — Gladwell argues the data tells a sharper story.","A strikingly small number of physicians wrote a hugely disproportionate share of high-dose prescriptions, courted by Purdue's sales force.","Just as a handful of COVID superspreaders seed regional outbreaks, a handful of prescribers seeded a regional drug crisis."],
      argument: "This is the centerpiece case for the book's 'revenge' — the same Law of the Few, reverse-engineered for harm." },
    keyLines: ["Every tipping point has an engineer — the question worth asking is always who benefits.","A group's overstory can change faster than the people inside it.","Epidemics are not acts of God. Someone, somewhere, is usually pulling a lever."],
    thread: "Gladwell's sequel adds a darker layer: tipping points can be manufactured on purpose by those who understand connectors, stickiness, and context well enough to point them.",
  },
];

export const LYNNELL_BOOKS = [];

export const CHRISTINA_BOOKS = [];

// ---------------------------------------------------------------------------
// ADMIN & ACCESS CONTROL
// ---------------------------------------------------------------------------
export const ADMIN_USER_ID = "amy";
export const ACCESS_STORAGE_KEY = "admin:connections";

// Default connections — which pairs of users can see each other's data.
// Format: [userId1, userId2]. Symmetric — order doesn't matter.
export const DEFAULT_CONNECTIONS = [
  ["amy", "lynnell"],
  ["amy", "christina"],
];

// ---------------------------------------------------------------------------
// USERS — base users are hardcoded; dynamic users are loaded from Supabase
// at runtime via loadDynamicUsers(). Use USERS as the live merged registry.
// ---------------------------------------------------------------------------
export const USERS = {
  amy:      { id: "amy",      name: "Amy",      accent: "#F25C5C", books: AMY_BOOKS },
  lynnell:  { id: "lynnell",  name: "Lynnell",  accent: "#BF755A", books: LYNNELL_BOOKS },
  christina:{ id: "christina",name: "Christina", accent: "#8C5634", books: CHRISTINA_BOOKS },
};

export const DYNAMIC_USERS_KEY = "admin:dynamic-users";
export const DYNAMIC_PASSWORDS_KEY = "admin:dynamic-passwords";

export const SESSION_KEY = "bookbrain:loggedInUser";

export const DEFAULT_THEME = {
  bg: "#EDE8DC", card: "#F7F4EC", ink: "#1A1612",
  inkSoft: "rgba(26,22,18,0.62)", inkFaint: "rgba(26,22,18,0.4)", border: "rgba(26,22,18,0.16)",
  display: "'Cormorant Garamond', Georgia, serif", body: "'Jost', system-ui, -apple-system, sans-serif", mono: "'Special Elite', 'Courier New', ui-monospace, monospace",
  displayWeight: 600, headerBg: "#1A1612", headerInk: "#EDE8DC",
};

export const MARGINALIA_THEME = {
  bg: "#F2EFEB", card: "#FBF8F3", ink: "#262020",
  inkSoft: "#6B5D54", inkFaint: "rgba(38,32,32,0.4)", border: "#E4D9CC",
  display: "'Cormorant Garamond', Georgia, serif", body: "'Jost', system-ui, -apple-system, sans-serif", mono: "'Special Elite', 'Courier New', ui-monospace, monospace",
  displayWeight: 600, headerBg: "#2A201B", headerInk: "#F2EFEB",
};

// ---------------------------------------------------------------------------
// TOOLTIPS
// ---------------------------------------------------------------------------
export const TOOLTIPS_KEY = "admin:tooltips";
export const TOOLTIP_SECTIONS = [
  { key: "home",          label: "Home Page" },
  { key: "myBooks",       label: "Marginalia section" },
  { key: "shelf",         label: "Bookshelf section" },
  { key: "challenge",     label: "Reading Challenge" },
  { key: "friendReading", label: "Friend Reading widget" },
  { key: "sharedBooks",   label: "Shared Bookshelf widget" },
  { key: "chat",          label: "Chat widget" },
];

// ---------------------------------------------------------------------------
// BOOKSHELF CONSTANTS
// ---------------------------------------------------------------------------
export const DEFAULT_DRAWERS = [
  { id: "reading", name: "Reading", removable: false },
  { id: "read",    name: "Read",    removable: false },
  { id: "want",    name: "Want to Read", removable: false },
  { id: "upnext",  name: "Up Next", removable: true },
  { id: "dnf",     name: "Did Not Finish", removable: true },
];

export const STATUS_TO_DRAWER = { "reading": "reading", "read": "read", "to-read": "want", "up-next": "upnext", "did-not-finish": "dnf" };
export const DRAWER_TO_STATUS = { "reading": "reading", "read": "read", "want": "to-read", "upnext": "up-next", "dnf": "did-not-finish" };

export const SPINE_COLORS = ["#BF755A","#F25C5C","#2A201B","#D9A282","#9a6a3f","#6B4A3A","#3E7C57","#3a6ea5"];

export const ACCENT_PRESETS = ["#F25C5C","#BF755A","#8C5634","#B98D6A","#D1A88C","#7C9E87","#6B8CAE","#A07CC5","#C5876B","#5E9E9E"];

export const OAK_FACE = `linear-gradient(180deg,rgba(255,255,255,.12),rgba(0,0,0,.06) 38%,rgba(0,0,0,.22)),repeating-linear-gradient(92deg,#9a6232,#9a6232 3px,#945d30 3px,#945d30 7px,#a06a39 7px,#a06a39 11px),linear-gradient(180deg,#B07F49,#6E4422)`;
export const BRASS_GRAD = `linear-gradient(180deg,#E8CF93,#C2A35E 55%,#8F7233)`;
export const BRASS_GRAD_V = `linear-gradient(180deg,#E8CF93,#C2A35E 52%,#8F7233)`;
export const BRASS_BORDER = `1px solid #6f5722`;

// Storage key prefixes for bookshelf drawer state
export const CC_DRAWER_STORE = (uid) => `marginalia_shelf_drawers_v1_${uid}`;
export const CC_ASSIGN_STORE = (uid) => `marginalia_shelf_assign_v1_${uid}`;

// Shared chat
export const SHARED_CHAT_KEY = "shared:chat";
export const CHAT_LAST_READ_KEY = (userId) => `chat:lastRead:${userId}`;

// Passwords (static)
export const PASSWORDS = {
  amy:       import.meta.env.VITE_PASSWORD_AMY       || "estes",
  lynnell:   import.meta.env.VITE_PASSWORD_LYNNELL   || "grube",
  christina: import.meta.env.VITE_PASSWORD_CHRISTINA || "brown",
};
