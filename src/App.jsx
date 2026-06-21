import React, { useState, useEffect, useCallback } from "react";
import { storage, subscribeToChatUpdates } from "./storage.js";

// ---------------------------------------------------------------------------
// STATIC BOOKS — Amy's pre-loaded books. Lynnell starts with an empty shelf.
// ---------------------------------------------------------------------------
const AMY_BOOKS = [
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
      display: "'Fraunces', serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace",
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
      display: "'Fraunces', serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace",
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

const LYNNELL_BOOKS = [];

const CHRISTINA_BOOKS = [];

// Brand palette — Marginalia warm library aesthetic
const BRAND = {
  // Page surfaces
  cream: "#F2EFEB",
  paper: "#FBF8F3",
  // Text
  ink: "#262020",
  muted: "#6B5D54",
  // Accent
  coral: "#F25C5C",
  coralDeep: "#D94A4A",
  terracotta: "#BF755A",
  tan: "#D9A282",
  // Dark sections (footer, shelves, espresso bars)
  espresso: "#2A201B",
  espresso2: "#3A2A22",
  // Borders
  line: "#E4D9CC",
  line2: "#D6C7B6",
  // Card catalogue wood & brass
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
  // Legacy aliases (used by book themes & widgets)
  dark: "#2A201B",
  darkCard: "#3A2A22",
};

// Typography tokens
const FONT = {
  display: "'Cormorant Garamond', Georgia, serif",
  read: "'Spectral', Georgia, serif",
  body: "'Jost', system-ui, -apple-system, sans-serif",
  type: "'Special Elite', 'Courier New', ui-monospace, monospace",
};

// ---------------------------------------------------------------------------
// ADMIN & ACCESS CONTROL
// ---------------------------------------------------------------------------
const ADMIN_USER_ID = "amy";
const ACCESS_STORAGE_KEY = "admin:connections";

// Default connections — which pairs of users can see each other's data.
// Format: [userId1, userId2]. Symmetric — order doesn't matter.
const DEFAULT_CONNECTIONS = [
  ["amy", "lynnell"],
  ["amy", "christina"],
];

function hasConnection(id1, id2, connections) {
  return connections.some(([a, b]) => (a === id1 && b === id2) || (a === id2 && b === id1));
}

function getConnectedUsers(userId, connections) {
  return Object.values(USERS).filter((u) => u.id !== userId && hasConnection(userId, u.id, connections));
}

async function loadConnections() {
  try {
    const res = await storage.get(ACCESS_STORAGE_KEY);
    return res ? JSON.parse(res.value) : DEFAULT_CONNECTIONS;
  } catch { return DEFAULT_CONNECTIONS; }
}

async function saveConnections(connections) {
  try { await storage.set(ACCESS_STORAGE_KEY, JSON.stringify(connections)); } catch {}
}

// ---------------------------------------------------------------------------
// USERS — base users are hardcoded; dynamic users are loaded from Supabase
// at runtime via loadDynamicUsers(). Use USERS as the live merged registry.
// ---------------------------------------------------------------------------
const USERS = {
  amy:      { id: "amy",      name: "Amy",      accent: "#F25C5C", books: AMY_BOOKS },
  lynnell:  { id: "lynnell",  name: "Lynnell",  accent: "#BF755A", books: LYNNELL_BOOKS },
  christina:{ id: "christina",name: "Christina", accent: "#8C5634", books: CHRISTINA_BOOKS },
};

const DYNAMIC_USERS_KEY = "admin:dynamic-users";
const DYNAMIC_PASSWORDS_KEY = "admin:dynamic-passwords";

async function loadDynamicUsers() {
  try {
    const [usersRes, pwRes] = await Promise.all([
      storage.get(DYNAMIC_USERS_KEY),
      storage.get(DYNAMIC_PASSWORDS_KEY),
    ]);
    const dynamicUsers = usersRes ? JSON.parse(usersRes.value) : [];
    const dynamicPasswords = pwRes ? JSON.parse(pwRes.value) : {};
    // Merge into live USERS registry
    dynamicUsers.forEach((u) => { USERS[u.id] = { ...u, books: [] }; });
    return { dynamicUsers, dynamicPasswords };
  } catch { return { dynamicUsers: [], dynamicPasswords: {} }; }
}

async function saveNewUser(newUser, password, existingDynamic, existingPasswords) {
  const updatedUsers = [...existingDynamic.filter((u) => u.id !== newUser.id), newUser];
  const updatedPasswords = { ...existingPasswords, [newUser.id]: password };
  await Promise.all([
    storage.set(DYNAMIC_USERS_KEY, JSON.stringify(updatedUsers)),
    storage.set(DYNAMIC_PASSWORDS_KEY, JSON.stringify(updatedPasswords)),
  ]);
  return { dynamicUsers: updatedUsers, dynamicPasswords: updatedPasswords };
}

async function deleteDynamicUser(userId, existingDynamic, existingPasswords) {
  const updatedUsers = existingDynamic.filter((u) => u.id !== userId);
  const updatedPasswords = { ...existingPasswords };
  delete updatedPasswords[userId];
  await Promise.all([
    storage.set(DYNAMIC_USERS_KEY, JSON.stringify(updatedUsers)),
    storage.set(DYNAMIC_PASSWORDS_KEY, JSON.stringify(updatedPasswords)),
  ]);
  delete USERS[userId];
  return { dynamicUsers: updatedUsers, dynamicPasswords: updatedPasswords };
}

// ---------------------------------------------------------------------------
// STORAGE KEY HELPERS — all namespaced by userId
// ---------------------------------------------------------------------------
function quotesKey(userId, bookId) { return `${userId}:quotes:${bookId}`; }
function chatKey(userId, bookId) { return `${userId}:chat:${bookId}`; }
function dateAddedKey(userId, bookId) { return `${userId}:dateAdded:${bookId}`; }
function progressKey(userId, bookId) { return `${userId}:progress:${bookId}`; }
function shelfKey(userId) { return `${userId}:shelf:books`; }
function statusKey(userId, id) { return `${userId}:readStatus:${id}`; }
function customBooksKey(userId) { return `${userId}:customBooks:list`; }

async function loadQuotes(userId, bookId) {
  try { const res = await storage.get(quotesKey(userId, bookId)); return res ? JSON.parse(res.value) : []; } catch (e) { return []; }
}
async function saveQuotes(userId, bookId, items) {
  try { await storage.set(quotesKey(userId, bookId), JSON.stringify(items)); } catch (e) {}
}
async function loadChat(userId, bookId) {
  try { const res = await storage.get(chatKey(userId, bookId)); return res ? JSON.parse(res.value) : []; } catch (e) { return []; }
}
async function saveChat(userId, bookId, messages) {
  try { await storage.set(chatKey(userId, bookId), JSON.stringify(messages)); } catch (e) {}
}
async function loadDateAdded(userId, bookId) {
  try { const res = await storage.get(dateAddedKey(userId, bookId)); return res ? res.value : null; } catch (e) { return null; }
}
async function saveDateAdded(userId, bookId, dateStr) {
  try { await storage.set(dateAddedKey(userId, bookId), dateStr); } catch (e) {}
}
async function loadProgress(userId, bookId) {
  try { const res = await storage.get(progressKey(userId, bookId)); return res ? JSON.parse(res.value) : null; } catch (e) { return null; }
}
async function saveProgress(userId, bookId, data) {
  try { const result = await storage.set(progressKey(userId, bookId), JSON.stringify(data)); return !!result; } catch (e) { return false; }
}
async function loadShelfBooks(userId) {
  try { const res = await storage.get(shelfKey(userId)); return res ? JSON.parse(res.value) : []; } catch (e) { return []; }
}
async function saveShelfBooks(userId, list) {
  try { const result = await storage.set(shelfKey(userId), JSON.stringify(list)); return !!result; } catch (e) { return false; }
}
async function loadStatus(userId, id) {
  try { const res = await storage.get(statusKey(userId, id)); return res ? res.value : null; } catch (e) { return null; }
}
async function saveStatus(userId, id, status) {
  try { const result = await storage.set(statusKey(userId, id), status); return !!result; } catch (e) { return false; }
}
async function loadCustomBooks(userId) {
  try { const res = await storage.get(customBooksKey(userId)); return res ? JSON.parse(res.value) : []; } catch (e) { return []; }
}
async function saveCustomBooks(userId, list) {
  try { const result = await storage.set(customBooksKey(userId), JSON.stringify(list)); return !!result; } catch (e) { return false; }
}

function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function formatCatalogDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
}
function daysBetween(fromISO, toISO) {
  return Math.round((new Date(toISO + "T00:00:00") - new Date(fromISO + "T00:00:00")) / 86400000);
}

const DEFAULT_THEME = {
  bg: "#EDE8DC", card: "#F7F4EC", ink: "#1A1612",
  inkSoft: "rgba(26,22,18,0.62)", inkFaint: "rgba(26,22,18,0.4)", border: "rgba(26,22,18,0.16)",
  display: "'Fraunces', serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace",
  displayWeight: 600, headerBg: "#1A1612", headerInk: "#EDE8DC",
};

// ---------------------------------------------------------------------------
// BOOK SEARCH — Open Library API (free, no key required)
// ---------------------------------------------------------------------------
async function searchBooks(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query.trim())}&limit=6&fields=title,author_name,number_of_pages_median,cover_i,first_publish_year`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.docs || []).map((d) => ({
      title: d.title || "",
      author: d.author_name?.[0] || "",
      pages: d.number_of_pages_median || null,
      year: d.first_publish_year ? String(d.first_publish_year) : "",
      cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : "",
    }));
  } catch { return []; }
}

// ---------------------------------------------------------------------------
// TOOLTIPS — admin-editable help text shown via ⓘ icon on each section
// ---------------------------------------------------------------------------
const TOOLTIPS_KEY = "admin:tooltips";
const TOOLTIP_SECTIONS = [
  { key: "home",          label: "Home Page" },
  { key: "myBooks",       label: "Book Notes section" },
  { key: "shelf",         label: "Bookshelf section" },
  { key: "challenge",     label: "Reading Challenge" },
  { key: "friendReading", label: "Friend Reading widget" },
  { key: "sharedBooks",   label: "Shared Bookshelf widget" },
  { key: "chat",          label: "Chat widget" },
];

async function loadTooltips() {
  try {
    const res = await storage.get(TOOLTIPS_KEY);
    return res ? JSON.parse(res.value) : {};
  } catch { return {}; }
}

async function saveTooltips(tooltips) {
  try { await storage.set(TOOLTIPS_KEY, JSON.stringify(tooltips)); } catch {}
}

function TooltipIcon({ text, color }) {
  const [show, setShow] = useState(false);
  if (!text) return null;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        onClick={(e) => { e.stopPropagation(); setShow((s) => !s); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: color || BRAND.tan, fontSize: "0.8rem", lineHeight: 1, padding: "0 0.3rem", opacity: 0.7 }}
        title="Help"
      >ⓘ</button>
      {show && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
          background: BRAND.darkCard, border: `1px solid ${BRAND.cream}22`, borderRadius: 8,
          padding: "0.8rem 1rem", zIndex: 100, width: 220, boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: BRAND.cream, margin: "0 0 0.5rem", lineHeight: 1.5 }}>{text}</p>
          <button onClick={() => setShow(false)} style={{ background: "none", border: "none", color: `${BRAND.cream}55`, cursor: "pointer", fontSize: "0.7rem", padding: 0 }}>Close</button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHARED UI COMPONENTS
// ---------------------------------------------------------------------------

function NodeCard({ node, accent, theme, isOpen, onToggle }) {
  return (
    <div onClick={onToggle} style={{ background: theme.card, border: `1px solid ${isOpen ? accent : theme.border}`, borderRadius: 4, padding: "1.6rem", cursor: "pointer", transition: "border-color .25s ease, transform .25s ease", transform: isOpen ? "translateY(-2px)" : "none" }}>
      <div style={{ fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: "0.7rem" }}>{node.tag}</div>
      <h3 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.3rem", margin: "0 0 0.6rem", color: theme.ink, lineHeight: 1.15 }}>{node.title}</h3>
      <p style={{ fontSize: "0.88rem", lineHeight: 1.55, color: theme.inkSoft, margin: 0 }}>{node.dek}</p>
      {isOpen && (
        <div style={{ marginTop: "1.1rem", paddingTop: "1.1rem", borderTop: `1px solid ${theme.border}` }}>
          {node.points.map((p, i) => (
            <p key={i} style={{ fontSize: "0.85rem", lineHeight: 1.6, color: theme.inkSoft, margin: i === node.points.length - 1 ? 0 : "0 0 0.8rem", paddingLeft: "0.9rem", borderLeft: `2px solid ${theme.border}` }}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function CaseFile({ data, accent, theme }) {
  return (
    <div style={{ marginTop: "3.5rem", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "1.1rem 1.6rem", borderBottom: `1px solid ${theme.border}`, fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: theme.inkFaint, flexWrap: "wrap" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent, flexShrink: 0 }} />
        <span>{data.tag}</span>
        <span style={{ marginLeft: "auto", opacity: 0.7 }}>{data.meta}</span>
      </div>
      <div style={{ padding: "1.8rem", display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: "1.8rem" }} className="casefile-grid">
        <div>
          <h4 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.45rem", margin: "0 0 0.7rem", color: theme.ink, lineHeight: 1.15 }}>{data.title}</h4>
          {data.story.map((p, i) => (<p key={i} style={{ fontSize: "0.9rem", lineHeight: 1.65, color: theme.inkSoft, margin: i === data.story.length - 1 ? 0 : "0 0 0.8rem" }}>{p}</p>))}
        </div>
        <div style={{ borderLeft: `1px solid ${theme.border}`, paddingLeft: "1.6rem" }}>
          <span style={{ fontFamily: theme.mono, fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: "0.6rem", display: "block" }}>Why it matters to the argument</span>
          <p style={{ fontSize: "0.86rem", lineHeight: 1.6, color: theme.inkSoft, margin: 0 }}>{data.argument}</p>
        </div>
      </div>
    </div>
  );
}

function YourQuotes({ userId, book }) {
  const theme = book.theme;
  const [quotes, setQuotes] = useState([]);
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [link, setLink] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    loadQuotes(userId, book.id).then((items) => { if (active) { setQuotes(items); setLoaded(true); } });
    return () => { active = false; };
  }, [userId, book.id]);

  const handleAdd = useCallback(async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const newItem = { id: Date.now().toString(36), text: trimmed, page: page.trim(), link: link.trim() };
    const updated = [...quotes, newItem];
    setQuotes(updated); setText(""); setPage(""); setLink("");
    await saveQuotes(userId, book.id, updated);
  }, [userId, text, page, link, quotes, book.id]);

  const handleDelete = useCallback(async (id) => {
    const updated = quotes.filter((q) => q.id !== id);
    setQuotes(updated);
    await saveQuotes(userId, book.id, updated);
  }, [userId, quotes, book.id]);

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.8rem", marginBottom: "1.2rem" }}>
        <h3 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.3rem", margin: 0, color: theme.ink }}>{USERS[userId].name}'s Quotes</h3>
        <span style={{ fontFamily: theme.mono, fontSize: "0.7rem", color: theme.inkFaint }}>saved to {USERS[userId].name}'s book mind</span>
      </div>
      <form onSubmit={handleAdd} style={{ display: "grid", gridTemplateColumns: "1fr 130px 160px auto", gap: "0.6rem", marginBottom: "1.6rem" }} className="quote-form">
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the quote here…" rows={1} style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.display, fontSize: "0.88rem", padding: "0.6rem 0.8rem", borderRadius: 3, resize: "vertical", minHeight: 40 }} />
        <input value={page} onChange={(e) => setPage(e.target.value)} placeholder="Page (optional)" style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.85rem", padding: "0.6rem 0.8rem", borderRadius: 3 }} />
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link (optional)" type="url" style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.85rem", padding: "0.6rem 0.8rem", borderRadius: 3 }} />
        <button type="submit" style={{ background: book.accent, border: "none", color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.74rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.6rem 1rem", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}>Save</button>
      </form>
      {!loaded ? (
        <div style={{ fontFamily: theme.mono, fontSize: "0.8rem", color: theme.inkFaint, padding: "1.2rem" }}>Loading your quotes…</div>
      ) : quotes.length === 0 ? (
        <div style={{ fontFamily: theme.mono, fontSize: "0.8rem", color: theme.inkFaint, padding: "1.4rem", border: `1px dashed ${theme.border}`, borderRadius: 3, textAlign: "center" }}>No quotes saved yet — add one above.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          {quotes.slice().reverse().map((q) => (
            <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 3, padding: "1rem 1.2rem" }}>
              <div>
                <p style={{ fontFamily: theme.display, fontStyle: "italic", fontSize: "0.95rem", lineHeight: 1.5, margin: "0 0 0.3rem", color: theme.ink }}>"{q.text}"</p>
                <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                  {q.page && <span style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: theme.inkFaint }}>{q.page}</span>}
                  {q.link && <a href={q.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: book.accent, textDecoration: "none", borderBottom: `1px solid ${book.accent}` }}>source link ↗</a>}
                </div>
              </div>
              <button onClick={() => handleDelete(q.id)} aria-label="Delete quote" style={{ background: "none", border: "none", color: theme.inkFaint, cursor: "pointer", fontSize: "1.1rem", lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookChat({ userId, book }) {
  const theme = book.theme;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = React.useRef(null);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    loadChat(userId, book.id).then((items) => { if (active) { setMessages(items); setLoaded(true); } });
    return () => { active = false; };
  }, [userId, book.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const systemPrompt = `You are a sharp, well-read research companion helping a reader go "down the rabbit hole" starting from the book "${book.title}" by ${book.author} (${book.year}). The book's core ideas: ${(book.nodes || []).map(n => `${n.title} — ${n.dek}`).join(" ")} Central thread: ${book.thread || ""} Use this as a jumping-off point, not a fence. Be direct and substantive.`;

  const handleSend = useCallback(async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setError(null);
    const userMsg = { role: "user", content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setSending(true);
    try {
      const CHAT_ENDPOINT = import.meta.env.VITE_CHAT_ENDPOINT;
      if (!CHAT_ENDPOINT) throw new Error("NO_ENDPOINT_CONFIGURED");
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: systemPrompt, messages: updated.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await response.json();
      const replyText = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n\n").trim() || "I wasn't able to generate a response.";
      const final = [...updated, { role: "assistant", content: replyText }];
      setMessages(final);
      await saveChat(userId, book.id, final);
    } catch (err) {
      setError(err.message === "NO_ENDPOINT_CONFIGURED" ? "Chat isn't wired up yet — set VITE_CHAT_ENDPOINT to your backend's chat route." : "Something went wrong. Try again.");
      setMessages(updated);
    } finally {
      setSending(false);
    }
  }, [userId, input, sending, messages, book.id, systemPrompt]);

  const handleClear = useCallback(async () => {
    setMessages([]);
    await saveChat(userId, book.id, []);
  }, [userId, book.id]);

  return (
    <div style={{ marginTop: "3.2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.8rem", marginBottom: "1.2rem" }}>
        <h3 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.3rem", margin: 0, color: theme.ink }}>Down the rabbit hole</h3>
        {messages.length > 0 && (
          <button onClick={handleClear} style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.inkSoft, fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.35rem 0.7rem", borderRadius: 3, cursor: "pointer" }}>Clear chat</button>
        )}
      </div>
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 4, overflow: "hidden" }}>
        <div ref={scrollRef} style={{ maxHeight: 420, minHeight: 140, overflowY: "auto", padding: "1.4rem 1.6rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {!loaded ? (
            <div style={{ fontFamily: theme.mono, fontSize: "0.8rem", color: theme.inkFaint }}>Loading conversation…</div>
          ) : messages.length === 0 ? (
            <div style={{ fontFamily: theme.mono, fontSize: "0.78rem", color: theme.inkFaint, lineHeight: 1.6 }}>No conversation yet. Start with the book or wander wherever it leads.</div>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                <span style={{ fontFamily: theme.mono, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: m.role === "user" ? book.accent : theme.inkFaint, marginBottom: "0.35rem" }}>{m.role === "user" ? "You" : "Claude"}</span>
                <div style={{ maxWidth: "85%", background: m.role === "user" ? `${book.accent}14` : "transparent", border: m.role === "user" ? `1px solid ${book.accent}55` : "none", borderRadius: 3, padding: m.role === "user" ? "0.7rem 0.95rem" : 0, fontSize: "0.88rem", lineHeight: 1.6, color: theme.ink, whiteSpace: "pre-wrap" }}>{m.content}</div>
              </div>
            ))
          )}
          {sending && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontFamily: theme.mono, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: theme.inkFaint, marginBottom: "0.35rem" }}>Claude</span>
              <div style={{ fontSize: "0.85rem", color: theme.inkFaint, fontFamily: theme.mono }}>researching…</div>
            </div>
          )}
        </div>
        {error && <div style={{ padding: "0 1.6rem", fontFamily: theme.mono, fontSize: "0.74rem", color: "#C1432B" }}>{error}</div>}
        <form onSubmit={handleSend} style={{ display: "flex", gap: "0.6rem", padding: "1rem 1.4rem", borderTop: `1px solid ${theme.border}` }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything — start here or go wherever it leads…" disabled={sending} style={{ flex: 1, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.88rem", padding: "0.65rem 0.9rem", borderRadius: 3 }} />
          <button type="submit" disabled={sending || !input.trim()} style={{ background: book.accent, border: "none", color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.74rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.65rem 1.1rem", borderRadius: 3, cursor: sending ? "default" : "pointer", fontWeight: 600, opacity: sending || !input.trim() ? 0.5 : 1 }}>Send</button>
        </form>
      </div>
    </div>
  );
}

function DateAddedInverted({ userId, book }) {
  const theme = book.theme;
  const [date, setDate] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    loadDateAdded(userId, book.id).then(async (val) => {
      if (!active) return;
      if (val) { setDate(val); }
      else { const today = todayISO(); await saveDateAdded(userId, book.id, today); if (active) setDate(today); }
      if (active) setLoaded(true);
    });
    return () => { active = false; };
  }, [userId, book.id]);

  const commit = async () => {
    const val = draft || todayISO();
    setDate(val); setEditing(false);
    await saveDateAdded(userId, book.id, val);
  };

  if (!loaded) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontFamily: theme.mono, fontSize: "0.72rem", color: `${theme.headerInk}aa` }}>
      <span style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>Added</span>
      {editing ? (
        <input type="date" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }} autoFocus style={{ background: theme.headerBg, border: `1px solid ${theme.headerInk}`, color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.72rem", padding: "0.2rem 0.4rem", borderRadius: 2 }} />
      ) : (
        <button onClick={() => { setDraft(date || todayISO()); setEditing(true); }} title="Click to edit" style={{ background: "none", border: "none", borderBottom: `1px dotted ${theme.headerInk}66`, color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.72rem", padding: 0, cursor: "pointer" }}>{formatCatalogDate(date)}</button>
      )}
    </div>
  );
}

function PageTracker({ userId, book }) {
  const theme = book.theme;
  const accent = book.accent;
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState({ totalPages: 300, currentPage: 0, finishDate: "", dateFinished: "" });
  const [totalDraft, setTotalDraft] = useState("300");
  const [pageDraft, setPageDraft] = useState("0");
  const [finishDateDraft, setFinishDateDraft] = useState("");
  const [dateFinishedDraft, setDateFinishedDraft] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    loadProgress(userId, book.id).then((data) => {
      if (!active) return;
      const next = { totalPages: data?.totalPages ?? 300, currentPage: data?.currentPage ?? 0, finishDate: data?.finishDate ?? "", dateFinished: data?.dateFinished ?? "" };
      setSaved(next); setTotalDraft(String(next.totalPages)); setPageDraft(String(next.currentPage));
      setFinishDateDraft(next.finishDate); setDateFinishedDraft(next.dateFinished); setLoaded(true);
    });
    return () => { active = false; };
  }, [userId, book.id]);

  const isDirty = totalDraft !== String(saved.totalPages) || pageDraft !== String(saved.currentPage) || finishDateDraft !== saved.finishDate || dateFinishedDraft !== saved.dateFinished;

  const handleSave = async () => {
    setSaving(true); setSaveError(null);
    const total = Math.max(1, parseInt(totalDraft, 10) || 1);
    const current = Math.max(0, Math.min(total, parseInt(pageDraft, 10) || 0));
    const justFinished = current >= total && saved.currentPage < saved.totalPages;
    const dateFinishedFinal = dateFinishedDraft || (justFinished ? todayISO() : "");
    const next = { totalPages: total, currentPage: current, finishDate: finishDateDraft, dateFinished: dateFinishedFinal };
    const ok = await saveProgress(userId, book.id, next);
    if (!ok) { setSaving(false); setSaveError("Save failed — try again."); return; }
    const confirmed = await loadProgress(userId, book.id);
    const verified = confirmed && confirmed.totalPages === next.totalPages && confirmed.currentPage === next.currentPage;
    setSaving(false);
    if (!verified) { setSaveError("Save didn't stick — try again."); return; }
    setSaved(next); setTotalDraft(String(total)); setPageDraft(String(current)); setDateFinishedDraft(dateFinishedFinal);
    setJustSaved(true); setTimeout(() => setJustSaved(false), 1800);
  };

  if (!loaded) return null;

  const totalPages = Math.max(1, parseInt(totalDraft, 10) || 1);
  const currentPage = Math.max(0, Math.min(totalPages, parseInt(pageDraft, 10) || 0));
  const pct = totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;
  const pagesLeft = Math.max(0, totalPages - currentPage);
  const finished = currentPage >= totalPages && totalPages > 0;
  const stops = 10;

  let paceMessage = null;
  if (finished) {
    paceMessage = dateFinishedDraft ? `Finished on ${formatCatalogDate(dateFinishedDraft)}.` : "Finished — save to record today's date.";
  } else if (finishDateDraft) {
    const daysLeft = daysBetween(todayISO(), finishDateDraft);
    if (daysLeft <= 0) paceMessage = pagesLeft > 0 ? `Target date has passed — ${pagesLeft} pages still to go.` : "Finished — nice work.";
    else { const perDay = Math.ceil(pagesLeft / daysLeft); paceMessage = `Read ${perDay} ${perDay === 1 ? "page" : "pages"}/day for ${daysLeft} ${daysLeft === 1 ? "day" : "days"} to finish by ${formatCatalogDate(finishDateDraft)}.`; }
  }

  return (
    <div style={{ marginBottom: "2.4rem", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 4, padding: "1.6rem 1.8rem", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.3rem" }}>
        <span style={{ fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: accent }}>Reading tracker</span>
        <span style={{ fontFamily: theme.mono, fontSize: "0.74rem", color: theme.inkSoft }}>
          Page{" "}
          <input type="number" min={0} max={totalPages} value={pageDraft} onChange={(e) => setPageDraft(e.target.value)} style={{ width: 52, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.mono, fontSize: "0.74rem", textAlign: "center", borderRadius: 2, padding: "0.15rem 0.1rem" }} />{" "}of{" "}
          <input type="number" min={1} value={totalDraft} onChange={(e) => setTotalDraft(e.target.value)} style={{ width: 56, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.mono, fontSize: "0.74rem", textAlign: "center", borderRadius: 2, padding: "0.15rem 0.1rem" }} />{" "}pages
        </span>
      </div>
      <div style={{ position: "relative", padding: "0 0 0.6rem" }}>
        <div style={{ position: "relative", height: 10, borderRadius: 6, background: theme.border, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`, background: accent, borderRadius: 6, transition: "width .35s ease" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex" }}>
            {Array.from({ length: stops - 1 }).map((_, i) => (<div key={i} style={{ flex: 1, borderRight: i < stops - 2 ? `2px solid ${theme.bg}` : "none" }} />))}
          </div>
        </div>
        <div style={{ position: "absolute", top: -7, left: `calc(${pct}% - 11px)`, width: 22, height: 22, borderRadius: "50%", background: theme.headerBg, border: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.35)", transition: "left .35s ease" }}>
          <span style={{ fontSize: "0.85rem" }} role="img" aria-label="bookmark">🔖</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: theme.mono, fontSize: "0.66rem", letterSpacing: "0.04em", color: theme.inkFaint, marginBottom: "1.4rem" }}>
        <span>START</span><span style={{ color: accent, fontWeight: 700 }}>{pct}%</span><span>{finished ? "FINISHED" : "THE END"}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.4rem", alignItems: "flex-end", justifyContent: "space-between", paddingTop: "1.1rem", borderTop: `1px solid ${theme.border}`, marginBottom: "1.2rem" }}>
        <div>
          {finished ? (
            <><div style={{ fontFamily: theme.mono, fontSize: "0.64rem", letterSpacing: "0.1em", textTransform: "uppercase", color: theme.inkFaint, marginBottom: "0.4rem" }}>Date finished</div>
            <input type="date" value={dateFinishedDraft} onChange={(e) => setDateFinishedDraft(e.target.value)} style={{ background: theme.bg, border: `1px solid ${accent}`, color: theme.ink, fontFamily: theme.mono, fontSize: "0.78rem", padding: "0.35rem 0.55rem", borderRadius: 3 }} /></>
          ) : (
            <><div style={{ fontFamily: theme.mono, fontSize: "0.64rem", letterSpacing: "0.1em", textTransform: "uppercase", color: theme.inkFaint, marginBottom: "0.4rem" }}>Target finish date</div>
            <input type="date" value={finishDateDraft} onChange={(e) => setFinishDateDraft(e.target.value)} style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.mono, fontSize: "0.78rem", padding: "0.35rem 0.55rem", borderRadius: 3 }} />
            {finishDateDraft && <button onClick={() => setFinishDateDraft("")} style={{ marginLeft: "0.5rem", background: "none", border: "none", color: theme.inkFaint, fontFamily: theme.mono, fontSize: "0.7rem", textDecoration: "underline", cursor: "pointer" }}>clear</button>}</>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 220, textAlign: "right" }}>
          {paceMessage ? <p style={{ margin: 0, fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "0.98rem", color: theme.ink, lineHeight: 1.4 }}>{paceMessage}</p>
            : <p style={{ margin: 0, fontFamily: theme.mono, fontSize: "0.76rem", color: theme.inkFaint }}>{pagesLeft} pages left · set a finish date for a daily pace</p>}
        </div>
      </div>
      {saveError && <div style={{ marginBottom: "0.8rem", padding: "0.7rem 1rem", background: "#C1432B14", border: "1px solid #C1432B55", borderRadius: 3, fontFamily: theme.mono, fontSize: "0.74rem", color: "#C1432B" }}>{saveError}</div>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.8rem" }}>
        {justSaved && <span style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: accent }}>✓ Saved</span>}
        <button onClick={handleSave} disabled={!isDirty || saving} style={{ background: isDirty && !saving ? accent : theme.border, border: "none", color: isDirty && !saving ? theme.headerInk : theme.inkFaint, fontFamily: theme.mono, fontSize: "0.74rem", letterSpacing: "0.05em", textTransform: "uppercase", fontWeight: 700, padding: "0.55rem 1.3rem", borderRadius: 3, cursor: isDirty && !saving ? "pointer" : "default" }}>
          {saving ? "Saving…" : "Save progress"}
        </button>
      </div>
    </div>
  );
}

function AcademicSections({ book, theme, openNode, setOpenNode }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.1rem" }}>
        {book.nodes.map((node, i) => (<NodeCard key={i} node={node} accent={book.accent} theme={theme} isOpen={openNode === i} onToggle={() => setOpenNode(openNode === i ? null : i)} />))}
      </div>
      <CaseFile data={book.caseFile} accent={book.accent} theme={theme} />
      <div style={{ marginTop: "3rem", padding: "1.6rem 1.8rem", background: `${book.accent}14`, border: `1px dashed ${theme.border}`, borderRadius: 4 }}>
        <span style={{ fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: book.accent, display: "block", marginBottom: "0.6rem" }}>Thread</span>
        <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.6, color: theme.inkSoft }}>{book.thread}</p>
      </div>
      <h2 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.7rem", margin: "3.2rem 0 1.2rem", color: theme.ink }}>Lines worth keeping</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.9rem", marginBottom: "1rem" }}>
        {book.keyLines.map((line, i) => (
          <div key={i} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderLeft: `3px solid ${book.accent}`, borderRadius: 3, padding: "1.2rem 1.3rem" }}>
            <p style={{ fontFamily: theme.display, fontStyle: "italic", fontWeight: 500, fontSize: "0.98rem", lineHeight: 1.5, margin: 0, color: theme.ink }}>"{line}"</p>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: theme.inkFaint, margin: "0 0 1rem" }}>Paraphrased, not verbatim — out of respect for the author's original wording.</p>
    </>
  );
}

// ---------------------------------------------------------------------------
// BOOK EDITOR — inline editor for custom-added books
// ---------------------------------------------------------------------------
function BookEditorPanel({ userId, book, theme, onSaved }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [title, setTitle]     = useState(book.title || "");
  const [subtitle, setSubtitle] = useState(book.subtitle || "");
  const [author, setAuthor]   = useState(book.author || "");
  const [year, setYear]       = useState(book.year || "");
  const [pages, setPages]     = useState(book.pages ? String(book.pages) : "");
  const [cover, setCover]     = useState(book.cover || "");
  const [tagline, setTagline] = useState(book.tagline || "");
  const [thread, setThread]   = useState(book.thread || "");
  const [keyLines, setKeyLines] = useState(book.keyLines && book.keyLines.length ? book.keyLines : [""]);
  const [nodes, setNodes]     = useState(
    book.nodes && book.nodes.length
      ? book.nodes.map((n) => ({ tag: n.tag || "", title: n.title || "", dek: n.dek || "", points: n.points && n.points.length ? n.points : [""] }))
      : [{ tag: "", title: "", dek: "", points: [""] }]
  );
  const [cfTag, setCfTag]         = useState(book.caseFile?.tag || "");
  const [cfMeta, setCfMeta]       = useState(book.caseFile?.meta || "");
  const [cfTitle, setCfTitle]     = useState(book.caseFile?.title || "");
  const [cfStory, setCfStory]     = useState(book.caseFile?.story && book.caseFile.story.length ? book.caseFile.story : [""]);
  const [cfArgument, setCfArgument] = useState(book.caseFile?.argument || "");

  const iStyle = { background: `${theme.bg}`, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.85rem", padding: "0.5rem 0.75rem", borderRadius: 3, width: "100%", boxSizing: "border-box" };
  const taStyle = { ...iStyle, resize: "vertical", minHeight: 68 };
  const labelStyle = { fontFamily: theme.mono, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: book.accent, display: "block", marginBottom: "0.3rem", marginTop: "0.8rem" };

  const handleSave = async () => {
    setSaving(true);
    const existing = await loadCustomBooks(userId);
    const cleanNodes = nodes.filter((n) => n.title.trim()).map((n) => ({
      tag: n.tag.trim(), title: n.title.trim(), dek: n.dek.trim(),
      points: n.points.filter((p) => p.trim()),
    }));
    const cleanKeyLines = keyLines.filter((l) => l.trim());
    const hasCaseFile = cfTitle.trim();
    const updatedBook = {
      ...book,
      title: title.trim() || book.title,
      subtitle: subtitle.trim(),
      author: author.trim() || book.author,
      year: year.trim(),
      pages: pages ? parseInt(pages, 10) : null,
      cover: cover.trim(),
      tagline: tagline.trim(),
      thread: thread.trim(),
      keyLines: cleanKeyLines,
      nodes: cleanNodes,
      caseFile: hasCaseFile ? { tag: cfTag.trim(), meta: cfMeta.trim(), title: cfTitle.trim(), story: cfStory.filter((s) => s.trim()), argument: cfArgument.trim() } : null,
    };
    // Save as custom override — replaces or appends; deduplication in MyBooksHome handles the rest
    const alreadyInCustom = existing.some((b) => b.id === book.id);
    const updatedCustom = alreadyInCustom ? existing.map((b) => b.id === book.id ? updatedBook : b) : [...existing, updatedBook];
    const shelfExisting = await loadShelfBooks(userId);
    const updatedShelf = shelfExisting.map((b) => b.id === book.id ? updatedBook : b);
    await Promise.all([saveCustomBooks(userId, updatedCustom), saveShelfBooks(userId, updatedShelf)]);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onSaved(updatedBook);
  };

  const accent = book.accent;

  return (
    <div style={{ marginTop: "2.5rem", border: `1px solid ${theme.border}`, borderLeft: `3px solid ${accent}`, borderRadius: 6, overflow: "hidden" }}>
      <button onClick={() => setOpen((v) => !v)} style={{ width: "100%", background: `${accent}18`, border: "none", padding: "0.9rem 1.2rem", display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontFamily: theme.mono, fontSize: "0.66rem", letterSpacing: "0.12em", textTransform: "uppercase", color: accent, fontWeight: 700 }}>✏ Edit Book Details</span>
        <span style={{ marginLeft: "auto", fontFamily: theme.mono, fontSize: "0.65rem", color: `${theme.ink}55` }}>{open ? "▲ Close" : "▼ Open"}</span>
      </button>
      {open && (
        <div style={{ padding: "1.2rem 1.4rem", background: theme.card, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <span style={labelStyle}>Basic Info</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <div><label style={labelStyle}>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} style={iStyle} /></div>
            <div><label style={labelStyle}>Subtitle</label><input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={iStyle} placeholder="Optional" /></div>
            <div><label style={labelStyle}>Author</label><input value={author} onChange={(e) => setAuthor(e.target.value)} style={iStyle} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
              <div><label style={labelStyle}>Year</label><input value={year} onChange={(e) => setYear(e.target.value)} style={iStyle} /></div>
              <div><label style={labelStyle}>Pages</label><input type="number" value={pages} onChange={(e) => setPages(e.target.value)} style={iStyle} /></div>
            </div>
          </div>
          <label style={labelStyle}>Cover image URL</label>
          <input value={cover} onChange={(e) => setCover(e.target.value)} style={iStyle} placeholder="https://…" />
          {cover && <img src={cover} alt="cover preview" style={{ width: 48, height: 68, objectFit: "cover", borderRadius: 3, marginTop: "0.4rem" }} onError={(e) => e.target.style.display = "none"} />}

          <label style={{ ...labelStyle, marginTop: "1.4rem" }}>Tagline</label>
          <textarea value={tagline} onChange={(e) => setTagline(e.target.value)} style={taStyle} placeholder="One-sentence hook shown under the title" />

          <label style={{ ...labelStyle, marginTop: "1.4rem" }}>Overall Thread / Argument</label>
          <textarea value={thread} onChange={(e) => setThread(e.target.value)} style={{ ...taStyle, minHeight: 80 }} placeholder="The book's central argument in 2–3 sentences" />

          {/* Key Lines */}
          <span style={{ ...labelStyle, marginTop: "1.4rem" }}>Lines Worth Keeping</span>
          <p style={{ fontFamily: theme.mono, fontSize: "0.62rem", color: `${theme.ink}55`, margin: "0 0 0.5rem" }}>Paraphrased memorable lines — shown as quote cards</p>
          {keyLines.map((line, i) => (
            <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.35rem", alignItems: "flex-start" }}>
              <textarea value={line} onChange={(e) => { const n = [...keyLines]; n[i] = e.target.value; setKeyLines(n); }} style={{ ...taStyle, minHeight: 48, flex: 1 }} placeholder={`Key line ${i + 1}`} />
              <button onClick={() => setKeyLines(keyLines.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: `${theme.ink}44`, fontSize: "1rem", cursor: "pointer", padding: "0.3rem", lineHeight: 1 }}>✕</button>
            </div>
          ))}
          <button onClick={() => setKeyLines([...keyLines, ""])} style={{ background: "none", border: `1px dashed ${theme.border}`, color: `${theme.ink}55`, fontFamily: theme.mono, fontSize: "0.65rem", padding: "0.4rem 0.8rem", borderRadius: 3, cursor: "pointer", width: "fit-content" }}>+ Add line</button>

          {/* Key Ideas / Nodes */}
          <span style={{ ...labelStyle, marginTop: "1.6rem" }}>Key Ideas</span>
          <p style={{ fontFamily: theme.mono, fontSize: "0.62rem", color: `${theme.ink}55`, margin: "0 0 0.5rem" }}>Each idea becomes an expandable card (like "Rule One" or "New Idea")</p>
          {nodes.map((node, ni) => (
            <div key={ni} style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: "0.9rem", marginBottom: "0.8rem", background: theme.bg }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: theme.mono, fontSize: "0.62rem", color: accent }}>Idea {ni + 1}</span>
                <button onClick={() => setNodes(nodes.filter((_, j) => j !== ni))} style={{ background: "none", border: "none", color: `${theme.ink}44`, fontSize: "0.9rem", cursor: "pointer" }}>✕ Remove</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <div><label style={labelStyle}>Tag (e.g. "Rule One")</label><input value={node.tag} onChange={(e) => { const n = [...nodes]; n[ni] = { ...n[ni], tag: e.target.value }; setNodes(n); }} style={iStyle} /></div>
                <div><label style={labelStyle}>Title</label><input value={node.title} onChange={(e) => { const n = [...nodes]; n[ni] = { ...n[ni], title: e.target.value }; setNodes(n); }} style={iStyle} /></div>
              </div>
              <label style={labelStyle}>Summary (dek)</label>
              <textarea value={node.dek} onChange={(e) => { const n = [...nodes]; n[ni] = { ...n[ni], dek: e.target.value }; setNodes(n); }} style={{ ...taStyle, minHeight: 54 }} placeholder="One sentence summarizing this idea" />
              <label style={{ ...labelStyle, marginTop: "0.7rem" }}>Bullet Points</label>
              {node.points.map((pt, pi) => (
                <div key={pi} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem", alignItems: "flex-start" }}>
                  <textarea value={pt} onChange={(e) => { const n = [...nodes]; n[ni].points[pi] = e.target.value; setNodes(n); }} style={{ ...taStyle, minHeight: 44, flex: 1 }} placeholder={`Point ${pi + 1}`} />
                  <button onClick={() => { const n = [...nodes]; n[ni].points = n[ni].points.filter((_, j) => j !== pi); setNodes(n); }} style={{ background: "none", border: "none", color: `${theme.ink}44`, fontSize: "0.9rem", cursor: "pointer", padding: "0.3rem" }}>✕</button>
                </div>
              ))}
              <button onClick={() => { const n = [...nodes]; n[ni].points = [...n[ni].points, ""]; setNodes(n); }} style={{ background: "none", border: `1px dashed ${theme.border}`, color: `${theme.ink}55`, fontFamily: theme.mono, fontSize: "0.62rem", padding: "0.3rem 0.6rem", borderRadius: 3, cursor: "pointer" }}>+ Add point</button>
            </div>
          ))}
          <button onClick={() => setNodes([...nodes, { tag: "", title: "", dek: "", points: [""] }])} style={{ background: "none", border: `1px dashed ${theme.border}`, color: `${theme.ink}55`, fontFamily: theme.mono, fontSize: "0.65rem", padding: "0.4rem 0.8rem", borderRadius: 3, cursor: "pointer", width: "fit-content" }}>+ Add key idea</button>

          {/* Case File / Highlighted Story */}
          <span style={{ ...labelStyle, marginTop: "1.6rem" }}>Highlighted Story</span>
          <p style={{ fontFamily: theme.mono, fontSize: "0.62rem", color: `${theme.ink}55`, margin: "0 0 0.5rem" }}>One featured story or example (shown as a highlighted case file)</p>
          <div style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: "0.9rem", background: theme.bg }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "0.4rem" }}>
              <div><label style={labelStyle}>Tag (e.g. "Highlighted story · The Law of the Few")</label><input value={cfTag} onChange={(e) => setCfTag(e.target.value)} style={iStyle} /></div>
              <div><label style={labelStyle}>Meta (date, context)</label><input value={cfMeta} onChange={(e) => setCfMeta(e.target.value)} style={iStyle} placeholder="e.g. April 18, 1775" /></div>
            </div>
            <label style={labelStyle}>Story Title</label>
            <input value={cfTitle} onChange={(e) => setCfTitle(e.target.value)} style={iStyle} />
            <label style={{ ...labelStyle, marginTop: "0.6rem" }}>Story Paragraphs</label>
            {cfStory.map((s, si) => (
              <div key={si} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem", alignItems: "flex-start" }}>
                <textarea value={s} onChange={(e) => { const a = [...cfStory]; a[si] = e.target.value; setCfStory(a); }} style={{ ...taStyle, minHeight: 60, flex: 1 }} placeholder={`Paragraph ${si + 1}`} />
                <button onClick={() => setCfStory(cfStory.filter((_, j) => j !== si))} style={{ background: "none", border: "none", color: `${theme.ink}44`, fontSize: "0.9rem", cursor: "pointer", padding: "0.3rem" }}>✕</button>
              </div>
            ))}
            <button onClick={() => setCfStory([...cfStory, ""])} style={{ background: "none", border: `1px dashed ${theme.border}`, color: `${theme.ink}55`, fontFamily: theme.mono, fontSize: "0.62rem", padding: "0.3rem 0.6rem", borderRadius: 3, cursor: "pointer" }}>+ Add paragraph</button>
            <label style={{ ...labelStyle, marginTop: "0.7rem" }}>Argument / Takeaway</label>
            <textarea value={cfArgument} onChange={(e) => setCfArgument(e.target.value)} style={{ ...taStyle, minHeight: 60 }} placeholder="Why this story matters — the point it proves" />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.4rem" }}>
            <button onClick={handleSave} disabled={saving} style={{ background: accent, border: "none", color: theme.headerInk || "#fff", fontFamily: theme.mono, fontSize: "0.74rem", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, padding: "0.65rem 1.6rem", borderRadius: 3, cursor: saving ? "default" : "pointer" }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {saved && <span style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: accent }}>✓ Saved</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function BookDashboard({ userId, book: initialBook, onBack, onLogout }) {
  const [book, setBook] = useState(initialBook);
  const theme = book.theme;
  const hasAcademic = !!(book.nodes && book.nodes.length && book.caseFile && book.keyLines && book.thread);
  const [openNode, setOpenNode] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.ink }}>
      <div style={{ padding: "1.4rem 1.8rem", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "1rem", background: theme.headerBg }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${theme.headerInk}55`, color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.75rem", padding: "0.5rem 0.9rem", borderRadius: 3, cursor: "pointer" }}>← All books</button>
        <span style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: `${theme.headerInk}99` }}>{book.author} · {book.year}</span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1.2rem" }}>
          <DateAddedInverted userId={userId} book={book} />
          <button onClick={onLogout} style={{ background: "none", border: `1px solid ${theme.headerInk}33`, color: `${theme.headerInk}88`, fontFamily: theme.mono, fontSize: "0.65rem", padding: "0.3rem 0.65rem", borderRadius: 3, cursor: "pointer" }}>Log out</button>
        </span>
      </div>
      <div style={{ padding: "3rem 1.8rem 5rem", maxWidth: 980, margin: "0 auto" }}>
        <div style={{ fontFamily: theme.mono, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: book.accent, marginBottom: "0.8rem" }}>Book summary</div>
        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", marginBottom: "1.6rem" }}>
          {book.cover && (
            <img src={book.cover} alt={book.title} style={{ width: 110, height: 160, objectFit: "cover", borderRadius: 4, flexShrink: 0, boxShadow: "0 6px 20px rgba(0,0,0,0.45)" }} onError={(e) => e.target.style.display = "none"} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.02, margin: "0 0 0.6rem", color: theme.ink }}>{book.title}</h1>
            {book.subtitle && <div style={{ fontFamily: theme.mono, fontSize: "0.76rem", color: theme.inkSoft, marginBottom: "0.5rem", letterSpacing: "0.03em" }}>{book.subtitle}</div>}
            {book.tagline && <p style={{ fontSize: "1rem", color: theme.inkSoft, margin: 0, maxWidth: "60ch", lineHeight: 1.5 }}>{book.tagline}</p>}
          </div>
        </div>
        <PageTracker userId={userId} book={book} />
        <BookEditorPanel userId={userId} book={book} theme={theme} onSaved={setBook} />
        {hasAcademic && <AcademicSections book={book} theme={theme} openNode={openNode} setOpenNode={setOpenNode} />}
        <YourQuotes userId={userId} book={book} />
        <BookChat userId={userId} book={book} />
      </div>
    </div>
  );
}

function StatusBadge({ status, accent }) {
  if (status === "read") return (
    <div title="Finished" style={{ position: "absolute", top: -6, right: -10, width: 34, height: 34, borderRadius: "50%", background: accent, border: "2px solid #F4EFE4", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-12deg)", boxShadow: "0 2px 5px rgba(0,0,0,0.4)" }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.03em", color: "#1A1610", textAlign: "center", lineHeight: 1.05 }}>READ</span>
    </div>
  );
  if (status === "reading") return (
    <div title="Currently reading" style={{ position: "absolute", top: -6, right: -14, width: 16, height: 38, background: accent, boxShadow: "0 2px 5px rgba(0,0,0,0.4)", clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "6px" }}>
      <span style={{ fontSize: "0.6rem" }} role="img" aria-label="reading">📖</span>
    </div>
  );
  if (status === "up-next") return (
    <div title="Up next" style={{ position: "absolute", top: -8, right: -8, width: 28, height: 28, borderRadius: "50%", background: "#1A1612", border: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.4)" }}>
      <span style={{ fontSize: "0.72rem", color: accent }}>▶</span>
    </div>
  );
  return (
    <div title="To read" style={{ position: "absolute", top: -6, right: -10, width: 30, height: 30, borderRadius: "50%", background: "#F4EFE4", border: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-12deg)", boxShadow: "0 2px 5px rgba(0,0,0,0.35)" }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.42rem", fontWeight: 700, letterSpacing: "0.02em", color: accent, textAlign: "center", lineHeight: 1.05 }}>TO<br/>READ</span>
    </div>
  );
}

function CatalogCard({ userId, book, onSelect }) {
  const [date, setDate] = useState(null);
  const [readStatus, setReadStatus] = useState("to-read");

  useEffect(() => {
    let active = true;
    loadDateAdded(userId, book.id).then(async (val) => {
      if (!active) return;
      if (val) setDate(val);
      else { const today = todayISO(); await saveDateAdded(userId, book.id, today); if (active) setDate(today); }
    });
    (async () => {
      const manualStatus = await loadStatus(userId, book.id);
      if (!active) return;
      if (manualStatus) { setReadStatus(manualStatus); return; }
      const data = await loadProgress(userId, book.id);
      if (!active) return;
      const total = data?.totalPages ?? 0;
      const current = data?.currentPage ?? 0;
      if (total > 0 && current >= total) setReadStatus("read");
      else if (current > 0) setReadStatus("reading");
      else setReadStatus("to-read");
    })();
    return () => { active = false; };
  }, [userId, book.id]);

  const callNumber = `${book.author.split(" ").pop().slice(0, 3).toUpperCase()}-${book.year || "NEW"}`;

  return (
    <button onClick={() => onSelect(book.id)} style={{ position: "relative", display: "flex", gap: 16, textAlign: "left", cursor: "pointer", width: "100%", background: BRAND.card, color: BRAND.ink, border: `1px solid ${BRAND.cardEdge}`, borderTop: "none", borderRadius: "0 0 3px 3px", padding: "16px 18px", boxShadow: "0 4px 12px rgba(20,30,50,.10)", transition: "transform .22s,box-shadow .22s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(20,30,50,.16)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(20,30,50,.10)"; }}>
      {/* Tab */}
      <span style={{ position: "absolute", top: -26, left: 16, width: 110, height: 26, background: BRAND.card, border: `1px solid ${BRAND.cardEdge}`, borderBottom: "none", borderRadius: "5px 5px 0 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: FONT.type, fontSize: 10, color: BRAND.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 94 }}>{book.title}</span>
      </span>
      <span style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 4, background: book.accent, borderRadius: "0 0 0 3px" }} />
      <div style={{ position: "relative", flexShrink: 0 }}>
        {book.cover
          ? <img src={book.cover} alt={book.title} style={{ width: 54, height: 78, objectFit: "cover", display: "block", borderRadius: 2, boxShadow: "0 2px 6px rgba(20,30,50,.2)" }} onError={(e) => { e.target.style.display = "none"; }} />
          : <div style={{ width: 54, height: 78, background: book.accent, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}><span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 11, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>{book.title}</span></div>}
        <StatusBadge status={readStatus} accent={book.accent} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT.type, fontSize: 9.5, letterSpacing: "0.04em", color: BRAND.terracotta, borderBottom: `1px solid ${BRAND.rule}`, paddingBottom: 7, marginBottom: 10 }}>{callNumber}</div>
        <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 20, lineHeight: 1.1, color: BRAND.ink, marginBottom: 4 }}>{book.title}</div>
        {book.subtitle && <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13, color: BRAND.muted, marginBottom: 6 }}>{book.subtitle}</div>}
        <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13.5, color: BRAND.muted, marginBottom: 12 }}>{book.author}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ height: 1, background: BRAND.rule, opacity: 0.7 }} />
          <div style={{ height: 1, background: BRAND.rule, opacity: 0.45 }} />
          <div style={{ height: 1, background: BRAND.rule, opacity: 0.25 }} />
        </div>
        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: FONT.type, fontSize: 9.5, color: BRAND.muted }}>{book.year}{book.pages ? ` · ${book.pages} pp` : ""}</span>
          <span style={{ fontFamily: FONT.body, fontSize: 11.5, color: BRAND.coral }}>{date ? formatCatalogDate(date) : ""} Read card →</span>
        </div>
      </div>
    </button>
  );
}

function BookSearchInput({ onSelect, userAccent, inputStyle: extraStyle = {} }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const timerRef = React.useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timerRef.current);
    if (val.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      const found = await searchBooks(val);
      setResults(found);
      setSearching(false);
    }, 500);
  };

  const baseInput = { background: BRAND.paper, border: `1px solid ${BRAND.line2}`, color: BRAND.ink, fontFamily: FONT.body, fontSize: 14, padding: "10px 13px", borderRadius: 2, width: "100%", outline: "none", ...extraStyle };

  return (
    <div style={{ position: "relative" }}>
      <input autoFocus value={query} onChange={handleChange} placeholder="Search by book title…" style={baseInput} />
      {(searching || results.length > 0) && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: BRAND.paper, border: `1px solid ${BRAND.line2}`, borderRadius: 3, zIndex: 50, overflow: "hidden", boxShadow: "0 4px 12px rgba(20,30,50,.12)" }}>
          {searching && <div style={{ padding: "10px 14px", fontFamily: FONT.body, fontSize: 13, color: BRAND.muted }}>Searching…</div>}
          {results.map((r, i) => (
            <button key={i} type="button" onClick={() => { onSelect(r); setQuery(""); setResults([]); }}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "none", border: "none", borderBottom: `1px solid ${BRAND.line}`, cursor: "pointer", textAlign: "left", transition: "background .12s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = BRAND.cream}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
            >
              {r.cover && <img src={r.cover} alt="" style={{ width: 28, height: 40, objectFit: "cover", borderRadius: 2, flexShrink: 0 }} onError={(e) => e.target.style.display = "none"} />}
              <div>
                <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 15, color: BRAND.ink, lineHeight: 1.2 }}>{r.title}</div>
                <div style={{ fontFamily: FONT.body, fontSize: 12.5, color: BRAND.muted }}>{r.author}{r.pages ? ` · ${r.pages} pp` : ""}{r.year ? ` · ${r.year}` : ""}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AddBookToMyBooks({ userId, userAccent, onAdded }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [pages, setPages] = useState("");
  const [cover, setCover] = useState("");
  const [tagline, setTagline] = useState("");

  const handleSelect = (r) => {
    setSelected(r);
    setTitle(r.title); setAuthor(r.author);
    setYear(r.year || ""); setPages(r.pages ? String(r.pages) : "");
    setCover(r.cover || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    const id = `custom-${userId}-${Date.now().toString(36)}`;
    const newBook = {
      id, title: title.trim(), subtitle: "", author: author.trim(),
      year: year.trim() || new Date().getFullYear().toString(),
      pages: pages ? parseInt(pages, 10) : null,
      format: "simple", accent: userAccent, theme: { ...DEFAULT_THEME, headerBg: userAccent, headerInk: "#F4EFE4" },
      cover: cover.trim(), tagline: tagline.trim(), nodes: [], caseFile: null, keyLines: [], thread: "",
    };
    const existing = await loadCustomBooks(userId);
    await saveCustomBooks(userId, [...existing, newBook]);
    setTitle(""); setAuthor(""); setYear(""); setPages(""); setCover(""); setTagline(""); setSelected(null); setOpen(false);
    onAdded();
  };

  const iStyle = { background: BRAND.paper, border: `1px solid ${BRAND.line2}`, color: BRAND.ink, fontFamily: FONT.body, fontSize: 14, padding: "10px 13px", borderRadius: 2, width: "100%", outline: "none" };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", width: "100%", background: "transparent", color: BRAND.muted, border: `1px dashed ${BRAND.line2}`, borderRadius: 2, padding: "18px 24px", fontFamily: FONT.body, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", transition: "border-color .15s,color .15s" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = BRAND.terracotta; e.currentTarget.style.color = BRAND.terracotta; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = BRAND.line2; e.currentTarget.style.color = BRAND.muted; }}>
      <span style={{ fontSize: 18 }}>+</span><span>Add a book to your catalogue</span>
    </button>
  );

  return (
    <form onSubmit={handleSubmit} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 4, padding: "clamp(18px,3vw,28px)", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 1px 2px rgba(20,30,50,.06)" }}>
      <div style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: BRAND.terracotta, marginBottom: 4 }}>Add a book</div>
      {!selected ? (
        <BookSearchInput onSelect={handleSelect} userAccent={userAccent} />
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            {cover && <img src={cover} alt={title} style={{ width: 48, height: 68, objectFit: "cover", borderRadius: 2, flexShrink: 0 }} onError={(e) => e.target.style.display = "none"} />}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required style={iStyle} />
              <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" required style={iStyle} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" style={iStyle} />
                <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="Pages" type="number" style={iStyle} />
              </div>
              <input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Tagline (optional)" style={iStyle} />
            </div>
          </div>
          <button type="button" onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: BRAND.muted, fontFamily: FONT.body, fontSize: 12, cursor: "pointer", textAlign: "left", padding: 0, textDecoration: "underline" }}>← Search again</button>
        </>
      )}
      {selected && (
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button type="submit" style={{ flex: 1, background: BRAND.coral, border: "none", color: "#fff", fontFamily: FONT.body, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", padding: "12px", borderRadius: 2, cursor: "pointer", fontWeight: 500 }}
            onMouseEnter={(e) => e.currentTarget.style.background = BRAND.coralDeep}
            onMouseLeave={(e) => e.currentTarget.style.background = BRAND.coral}>
            File this card →
          </button>
          <button type="button" onClick={() => { setOpen(false); setSelected(null); }} style={{ background: "none", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, fontFamily: FONT.body, fontSize: 13, padding: "12px 16px", borderRadius: 2, cursor: "pointer" }}>Cancel</button>
        </div>
      )}
    </form>
  );
}

function MyBooksHome({ userId, userAccent, staticBooks, onSelect, onBack, onLogout }) {
  const [customBooks, setCustomBooks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    loadCustomBooks(userId).then((list) => { if (active) { setCustomBooks(list); setLoaded(true); } });
    return () => { active = false; };
  }, [userId, version]);

  const customIds = new Set(customBooks.map((b) => b.id));
  const allBooks = [...staticBooks.filter((b) => !customIds.has(b.id)), ...customBooks];

  return (
    <div style={{ minHeight: "100vh", background: BRAND.cream, color: BRAND.ink, fontFamily: FONT.body }}>
      {/* Header */}
      <div style={{ background: BRAND.espresso, borderBottom: `3px solid ${BRAND.oakDeep}`, padding: "clamp(28px,4vw,44px) 24px clamp(24px,3vw,36px)", position: "relative" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <button onClick={onBack} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: "0.04em", background: "none", border: `1px solid rgba(242,239,235,.3)`, color: "rgba(242,239,235,.7)", padding: "8px 14px", borderRadius: 2, cursor: "pointer" }}>← Back</button>
            <button onClick={onLogout} style={{ fontFamily: FONT.body, fontSize: 13, color: "rgba(242,239,235,.45)", background: "none", border: "none", cursor: "pointer" }}>Sign out</button>
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND.tan, marginBottom: 12 }}>
            The card catalogue
          </div>
          <h1 style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: "clamp(34px,5vw,60px)", lineHeight: 1.03, letterSpacing: "-0.01em", color: BRAND.cream, margin: "0 0 14px" }}>
            {USERS[userId].name}'s Book Notes
          </h1>
          <p style={{ fontFamily: FONT.read, fontSize: "clamp(15px,1.3vw,17px)", lineHeight: 1.6, color: "rgba(242,239,235,.62)", margin: 0, maxWidth: "40em" }}>
            Full summaries — key ideas, highlighted stories, quotes, and reading trackers.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "clamp(28px,4vw,48px) 24px clamp(48px,6vw,80px)" }}>
        <div style={{ fontFamily: FONT.type, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: 20, borderBottom: `1px solid ${BRAND.line}`, paddingBottom: 10 }}>
          {allBooks.length} {allBooks.length === 1 ? "entry" : "entries"} on file
        </div>
        {!loaded ? (
          <div style={{ fontFamily: FONT.body, fontSize: 14, color: BRAND.muted, padding: "1.5rem 0" }}>Loading…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {allBooks.map((book) => (<CatalogCard key={book.id} userId={userId} book={book} onSelect={onSelect} />))}
          </div>
        )}
        <div style={{ marginTop: 20 }}>
          <AddBookToMyBooks userId={userId} userAccent={userAccent} onAdded={() => setVersion((v) => v + 1)} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BOOKSHELF
// ---------------------------------------------------------------------------

function estimateReadTime(pages) {
  if (!pages) return null;
  return Math.round(((pages * 250) / 200 / 60) * 10) / 10;
}

function ShelfSpine({ shelfBook, status, onClick }) {
  const accent = shelfBook.accent || "#7A8B6F";
  return (
    <button onClick={onClick} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", width: 92, flexShrink: 0, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
      <div style={{ position: "relative", width: 84, height: 124 }}>
        {shelfBook.cover ? (
          <img src={shelfBook.cover} alt={shelfBook.title} style={{ width: "100%", height: "100%", objectFit: "cover", boxShadow: "0 4px 10px rgba(0,0,0,0.45)", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.45)", padding: "0.5rem" }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "0.78rem", color: "#1A1612", textAlign: "center", lineHeight: 1.2 }}>{shelfBook.title}</span>
          </div>
        )}
        <StatusBadge status={status} accent={accent} />
      </div>
      <div style={{ marginTop: "0.6rem", textAlign: "center", width: "100%" }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "0.78rem", color: "#F4EFE4", lineHeight: 1.2, marginBottom: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shelfBook.title}</div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", color: "rgba(244,239,228,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shelfBook.author}</div>
        {shelfBook.pages && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "rgba(244,239,228,0.3)", marginTop: "0.1rem" }}>{shelfBook.pages}p</div>}
      </div>
      <div style={{ position: "absolute", bottom: -8, left: "10%", right: "10%", height: 6, background: "radial-gradient(ellipse at center, rgba(0,0,0,0.35), transparent 70%)" }} />
    </button>
  );
}

function ShelfRow({ books, statuses, onOpen }) {
  return (
    <div style={{ position: "relative", marginBottom: "2.6rem" }}>
      <div style={{ display: "flex", gap: "1.4rem", overflowX: "auto", paddingBottom: "1.4rem", paddingTop: "0.4rem" }}>
        {books.map((b) => (<ShelfSpine key={b.id} shelfBook={b} status={statuses[b.id] || "to-read"} onClick={() => onOpen(b)} />))}
      </div>
      <div style={{ height: 14, background: "linear-gradient(180deg, #6B4A2E, #4A311C)", borderRadius: 2, boxShadow: "0 4px 8px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.08)" }} />
    </div>
  );
}

function ShelfPopup({ shelfBook, status, userAccent, onClose, onStatusChange }) {
  const accent = shelfBook.accent || userAccent;
  const readHours = estimateReadTime(shelfBook.pages);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,26,43,0.78)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#F4EFE4", color: "#1A1612", borderRadius: 4, maxWidth: 420, width: "100%", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", gap: "1.1rem", padding: "1.6rem", borderBottom: `3px solid ${accent}` }}>
          {shelfBook.cover ? <img src={shelfBook.cover} alt={shelfBook.title} style={{ width: 76, height: 112, objectFit: "cover", flexShrink: 0, boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }} onError={(e) => { e.target.style.display = "none"; }} />
            : <div style={{ width: 76, height: 112, background: accent, flexShrink: 0 }} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.2rem", margin: "0 0 0.3rem", lineHeight: 1.2 }}>{shelfBook.title}</h3>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.74rem", color: "rgba(26,22,18,0.6)", marginBottom: "0.6rem" }}>{shelfBook.author}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", color: "rgba(26,22,18,0.55)" }}>
              {shelfBook.pages && <span>{shelfBook.pages} pages</span>}
              {readHours && <span>· ~{readHours}h read</span>}
            </div>
          </div>
        </div>
        <div style={{ padding: "1.4rem 1.6rem" }}>
          {shelfBook.summary && <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "rgba(26,22,18,0.78)", margin: "0 0 1.2rem" }}>{shelfBook.summary}</p>}
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(26,22,18,0.5)", marginBottom: "0.6rem" }}>Status</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.4rem" }}>
            {["to-read", "up-next", "reading", "read"].map((s) => (
              <button key={s} onClick={() => onStatusChange(s)} style={{ background: status === s ? accent : "transparent", border: `1px solid ${status === s ? accent : "rgba(26,22,18,0.25)"}`, color: status === s ? "#1A1612" : "rgba(26,22,18,0.65)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.03em", textTransform: "uppercase", padding: "0.4rem 0.7rem", borderRadius: 3, cursor: "pointer", fontWeight: status === s ? 700 : 500 }}>
                {s === "to-read" ? "To read" : s === "up-next" ? "Up next" : s === "reading" ? "Reading" : "Read"}
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ width: "100%", background: "#1A1612", border: "none", color: "#F4EFE4", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.74rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.7rem", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function AddShelfBookCard({ userAccent, onAdd }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSelect = (r) => setSelected(r);

  const handleConfirm = () => {
    if (!selected) return;
    onAdd({ title: selected.title, author: selected.author, pages: selected.pages, cover: selected.cover, year: selected.year });
    setSelected(null); setOpen(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", width: 92, height: 124, flexShrink: 0, background: "transparent", border: "1px dashed rgba(244,239,228,0.32)", color: "rgba(244,239,228,0.55)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", cursor: "pointer", flexDirection: "column" }}>
      <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>+</span>
      <span>Add book</span>
    </button>
  );

  return (
    <div style={{ width: 260, flexShrink: 0, background: "#162338", border: "1px solid rgba(244,239,228,0.2)", borderRadius: 4, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {!selected ? (
        <BookSearchInput onSelect={handleSelect} userAccent={userAccent} />
      ) : (
        <>
          <div style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
            {selected.cover && <img src={selected.cover} alt="" style={{ width: 36, height: 52, objectFit: "cover", borderRadius: 2, flexShrink: 0 }} onError={(e) => e.target.style.display = "none"} />}
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "0.88rem", color: "#F4EFE4", lineHeight: 1.2 }}>{selected.title}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.74rem", color: "rgba(244,239,228,0.5)", marginTop: "0.2rem" }}>{selected.author}</div>
              {selected.pages && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(244,239,228,0.4)", marginTop: "0.15rem" }}>{selected.pages} pages</div>}
            </div>
          </div>
          <button type="button" onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(244,239,228,0.4)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", cursor: "pointer", textAlign: "left", padding: 0 }}>← Search again</button>
        </>
      )}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {selected && <button type="button" onClick={handleConfirm} style={{ flex: 1, background: userAccent, border: "none", color: "#F4EFE4", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em", padding: "0.5rem", borderRadius: 3, cursor: "pointer", fontWeight: 700 }}>Add</button>}
        <button type="button" onClick={() => { setOpen(false); setSelected(null); }} style={{ flex: selected ? 0 : 1, background: "none", border: "1px solid rgba(244,239,228,0.28)", color: "rgba(244,239,228,0.6)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", padding: "0.5rem 0.7rem", borderRadius: 3, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

function Bookshelf({ userId, userAccent, onBack, onLogout }) {
  const [shelfBooks, setShelfBooks] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [activeBook, setActiveBook] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const list = await loadShelfBooks(userId);
      if (!active) return;
      setShelfBooks(list);
      const statusEntries = await Promise.all(list.map(async (b) => [b.id, (await loadStatus(userId, b.id)) || "to-read"]));
      if (!active) return;
      setStatuses(Object.fromEntries(statusEntries));
      setLoaded(true);
    })();
    return () => { active = false; };
  }, [userId]);

  const handleAdd = async ({ title, author, pages, cover, year }) => {
    const id = `shelf-${userId}-${Date.now().toString(36)}`;
    const newBook = { id, title, author, cover: cover || null, pages: pages || null, year: year || null, summary: null, accent: userAccent };
    const updated = [...shelfBooks, newBook];
    setShelfBooks(updated);
    setStatuses((s) => ({ ...s, [id]: "to-read" }));
    await saveShelfBooks(userId, updated);
    await saveStatus(userId, id, "to-read");
  };

  const handleStatusChange = async (book, newStatus) => {
    setStatuses((s) => ({ ...s, [book.id]: newStatus }));
    await saveStatus(userId, book.id, newStatus);
    setActiveBook(null);
  };

  const grouped = {
    "up-next": shelfBooks.filter((b) => statuses[b.id] === "up-next"),
    "to-read": shelfBooks.filter((b) => !statuses[b.id] || statuses[b.id] === "to-read"),
    "reading": shelfBooks.filter((b) => statuses[b.id] === "reading"),
    "read": shelfBooks.filter((b) => statuses[b.id] === "read"),
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0F1A2B", padding: "0 0 5rem" }}>
      <div style={{ background: "linear-gradient(180deg, #2A2118, #1C160F)", borderBottom: "3px solid #0B0805", padding: "2.6rem 1.8rem 2.2rem", textAlign: "center", position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: "1.4rem", left: "1.4rem", background: "none", border: "1px solid rgba(244,239,228,0.3)", color: "rgba(244,239,228,0.7)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", padding: "0.4rem 0.8rem", borderRadius: 3, cursor: "pointer" }}>← Back</button>
        <button onClick={onLogout} style={{ position: "absolute", top: "1.4rem", right: "1.4rem", background: "none", border: "1px solid rgba(244,239,228,0.2)", color: "rgba(244,239,228,0.5)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", padding: "0.4rem 0.8rem", borderRadius: 3, cursor: "pointer" }}>Log out</button>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: userAccent, marginBottom: "0.7rem" }}>{USERS[userId].name}'s Reading List</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(2.1rem, 5.5vw, 3.2rem)", lineHeight: 1.05, margin: "0 0 0.5rem", color: "#F4EFE4" }}>{USERS[userId].name}'s Bookshelf</h1>
        <p style={{ color: "rgba(244,239,228,0.55)", fontSize: "0.92rem", margin: "0 auto", maxWidth: "46ch", lineHeight: 1.5 }}>Books on deck — tap a cover for a quick look.</p>
      </div>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "2.8rem 1.8rem 0" }}>
        {!loaded ? (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: "rgba(244,239,228,0.4)" }}>Loading shelf…</div>
        ) : (
          <>
            {grouped["up-next"].length > 0 && (<>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,239,228,0.4)", marginBottom: "0.8rem" }}>Up next</div>
              <ShelfRow books={grouped["up-next"]} statuses={statuses} onOpen={setActiveBook} />
            </>)}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,239,228,0.4)", marginBottom: "0.8rem" }}>To read</div>
            <div style={{ position: "relative", marginBottom: "2.6rem" }}>
              <div style={{ display: "flex", gap: "1.4rem", overflowX: "auto", paddingBottom: "1.4rem", paddingTop: "0.4rem" }}>
                {grouped["to-read"].map((b) => (<ShelfSpine key={b.id} shelfBook={b} status={statuses[b.id] || "to-read"} onClick={() => setActiveBook(b)} />))}
                <AddShelfBookCard userAccent={userAccent} onAdd={handleAdd} />
              </div>
              <div style={{ height: 14, background: "linear-gradient(180deg, #6B4A2E, #4A311C)", borderRadius: 2, boxShadow: "0 4px 8px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.08)" }} />
            </div>
            {grouped["reading"].length > 0 && (<>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,239,228,0.4)", marginBottom: "0.8rem" }}>Currently reading</div>
              <ShelfRow books={grouped["reading"]} statuses={statuses} onOpen={setActiveBook} />
            </>)}
            {grouped["read"].length > 0 && (<>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,239,228,0.4)", marginBottom: "0.8rem" }}>Read</div>
              <ShelfRow books={grouped["read"]} statuses={statuses} onOpen={setActiveBook} />
            </>)}
          </>
        )}
      </div>
      {activeBook && (
        <ShelfPopup shelfBook={activeBook} status={statuses[activeBook.id] || "to-read"} userAccent={userAccent} onClose={() => setActiveBook(null)} onStatusChange={(s) => handleStatusChange(activeBook, s)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHARED CHAT
// ---------------------------------------------------------------------------
const SHARED_CHAT_KEY = "shared:chat";
const CHAT_LAST_READ_KEY = (userId) => `chat:lastRead:${userId}`;

function SharedChat({ activeUser, friends, tooltipText }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState(null); // null = all, userId = specific sender
  const [collapsed, setCollapsed] = useState(false);
  const [lastRead, setLastRead] = useState(() => {
    try { return parseInt(localStorage.getItem(CHAT_LAST_READ_KEY(activeUser.id)) || "0", 10); } catch { return 0; }
  });
  const scrollRef = React.useRef(null);

  useEffect(() => {
    storage.get(SHARED_CHAT_KEY).then((res) => {
      const msgs = res ? JSON.parse(res.value) : [];
      setMessages(msgs);
      setLoaded(true);
    });
    const unsub = subscribeToChatUpdates(SHARED_CHAT_KEY, (msgs) => setMessages(msgs));
    return unsub;
  }, []);

  useEffect(() => {
    if (!collapsed && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, collapsed]);

  const markRead = () => {
    const now = Date.now();
    setLastRead(now);
    try { localStorage.setItem(CHAT_LAST_READ_KEY(activeUser.id), String(now)); } catch {}
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const now = Date.now();
    const newMsg = { userId: activeUser.id, text, ts: now };
    const updated = [...messages, newMsg];
    setMessages(updated);
    setInput("");
    markRead();
    await storage.set(SHARED_CHAT_KEY, JSON.stringify(updated));
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const participants = [{ id: null, name: "All", accent: BRAND.tan }, ...(friends || [])];

  // Unread = messages from others after lastRead
  const unreadFrom = (uid) => messages.filter((m) => m.userId === uid && m.ts > lastRead).length;

  const visibleMessages = filter ? messages.filter((m) => m.userId === filter || m.userId === activeUser.id) : messages;

  return (
    <div style={{ width: "100%", background: `${BRAND.darkCard}cc`, backdropFilter: "blur(10px)", border: `1px solid ${BRAND.cream}14`, borderRadius: 10, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "0.9rem 1.2rem", borderBottom: collapsed ? "none" : `1px solid ${BRAND.cream}14`, display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "1rem" }}>💬</span>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.tan }}>Book Brain Chat</div>
        <TooltipIcon text={tooltipText} color={BRAND.tan} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          {/* Filter buttons */}
          {participants.map((p) => {
            const unread = p.id ? unreadFrom(p.id) : (friends || []).reduce((n, f) => n + unreadFrom(f.id), 0);
            const active = filter === p.id;
            return (
              <button key={p.id || "all"} onClick={() => { setFilter(p.id); if (!collapsed) markRead(); }}
                style={{ position: "relative", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.06em", textTransform: "uppercase", background: active ? `${p.accent}44` : `${p.accent}22`, color: p.accent, padding: "0.2rem 0.55rem", borderRadius: 20, border: `1px solid ${active ? p.accent : "transparent"}`, cursor: "pointer" }}>
                {p.name}
                {unread > 0 && (
                  <span style={{ position: "absolute", top: -5, right: -5, background: BRAND.coral, color: BRAND.cream, borderRadius: "50%", width: 14, height: 14, fontSize: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{unread > 9 ? "9+" : unread}</span>
                )}
              </button>
            );
          })}
          {/* Collapse toggle */}
          <button onClick={() => { setCollapsed((c) => !c); if (collapsed) markRead(); }}
            style={{ background: "none", border: `1px solid ${BRAND.cream}22`, color: `${BRAND.cream}55`, borderRadius: 20, padding: "0.2rem 0.55rem", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem" }}>
            {collapsed ? "▼ Open" : "▲ Close"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div ref={scrollRef} onClick={markRead} style={{ height: 260, overflowY: "auto", padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {!loaded ? (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", color: `${BRAND.cream}44` }}>Loading…</div>
            ) : visibleMessages.length === 0 ? (
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.84rem", color: `${BRAND.cream}33`, fontStyle: "italic", textAlign: "center", marginTop: "2rem" }}>No messages yet — say hello!</div>
            ) : (
              visibleMessages.map((m, i) => {
                const sender = USERS[m.userId];
                const isMe = m.userId === activeUser.id;
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "baseline", marginBottom: "0.2rem" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: sender?.accent }}>{isMe ? "You" : sender?.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: `${BRAND.cream}33` }}>{formatTime(m.ts)}</span>
                    </div>
                    <div style={{ maxWidth: "78%", padding: "0.6rem 0.9rem", borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: isMe ? `${activeUser.accent}33` : `${BRAND.cream}0f`, border: `1px solid ${isMe ? activeUser.accent + "55" : BRAND.cream + "18"}`, fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", lineHeight: 1.5, color: BRAND.cream, wordBreak: "break-word" }}>
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={handleSend} style={{ display: "flex", gap: "0.6rem", padding: "0.8rem 1rem", borderTop: `1px solid ${BRAND.cream}14` }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Message as ${activeUser.name}…`}
              style={{ flex: 1, background: `${BRAND.dark}cc`, border: `1px solid ${BRAND.cream}22`, borderRadius: 20, padding: "0.6rem 1rem", color: BRAND.cream, fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", outline: "none" }} />
            <button type="submit" disabled={!input.trim()} style={{ background: `linear-gradient(135deg, ${activeUser.accent}, ${BRAND.terracotta})`, border: "none", borderRadius: 20, padding: "0.6rem 1.1rem", color: BRAND.cream, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", opacity: input.trim() ? 1 : 0.4, transition: "opacity .15s ease" }}>Send</button>
          </form>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BOOK CHALLENGE — per user, per year reading goal
// ---------------------------------------------------------------------------
function challengeGoalKey(userId, year) { return `${userId}:challenge:${year}:goal`; }

async function loadChallengeGoal(userId, year) {
  try {
    const res = await storage.get(challengeGoalKey(userId, year));
    return res ? parseInt(res.value, 10) : null;
  } catch { return null; }
}
async function saveChallengeGoal(userId, year, goal) {
  try { await storage.set(challengeGoalKey(userId, year), String(goal)); } catch {}
}

function FriendChallenge({ friendId, year }) {
  const friend = USERS[friendId];
  const [goal, setGoal] = useState(null);
  const [booksRead, setBooksRead] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const [savedGoal, customBooks, shelfBooks] = await Promise.all([
        loadChallengeGoal(friendId, year),
        loadCustomBooks(friendId),
        loadShelfBooks(friendId),
      ]);
      if (!active) return;
      setGoal(savedGoal);

      const allBooks = [...friend.books, ...customBooks, ...shelfBooks];
      const seen = new Set();
      const unique = allBooks.filter((b) => { if (seen.has(b.id)) return false; seen.add(b.id); return true; });

      const withData = await Promise.all(unique.map(async (b) => {
        const [status, progress, dateAdded] = await Promise.all([
          loadStatus(friendId, b.id),
          loadProgress(friendId, b.id),
          loadDateAdded(friendId, b.id),
        ]);
        const finishDate = progress?.dateFinished || null;
        const relevantDate = finishDate || dateAdded;
        const bookYear = relevantDate ? parseInt(relevantDate.slice(0, 4), 10) : null;
        return { ...b, status, bookYear, finishDate };
      }));

      if (!active) return;
      setBooksRead(withData.filter((b) => b.status === "read" && b.bookYear === year));
      setLoaded(true);
    })();
    return () => { active = false; };
  }, [friendId, year]);

  const count = booksRead.length;
  const pct = goal ? Math.min(100, Math.round((count / goal) * 100)) : 0;

  return (
    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${BRAND.cream}14` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem" }}>
        <span style={{ fontSize: "0.9rem" }}>👀</span>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: friend.accent }}>
          {friend.name}'s {year} Challenge
        </div>
        {goal && (
          <div style={{ marginLeft: "auto", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.1rem", color: BRAND.cream }}>
            {count} <span style={{ color: `${BRAND.cream}44`, fontWeight: 500, fontSize: "0.9rem" }}>/ {goal}</span>
          </div>
        )}
      </div>

      {!loaded ? (
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: `${BRAND.cream}33` }}>Loading…</div>
      ) : !goal ? (
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem", color: `${BRAND.cream}33`, fontStyle: "italic" }}>{friend.name} hasn't set a goal for {year} yet.</div>
      ) : (
        <>
          <div style={{ position: "relative", height: 8, borderRadius: 6, background: `${BRAND.cream}14`, overflow: "hidden", marginBottom: "0.35rem" }}>
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${friend.accent}, ${BRAND.tan})`, borderRadius: 6, transition: "width .6s ease" }} />
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", color: `${BRAND.cream}44`, marginBottom: "0.8rem" }}>
            {pct >= 100 ? `🎉 ${friend.name} hit their goal!` : `${pct}% — ${Math.max(0, goal - count)} book${goal - count === 1 ? "" : "s"} to go`}
          </div>
          {booksRead.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {booksRead.map((book) => (
                <div key={book.id} title={`${book.title} — ${book.author}`}>
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} style={{ width: 36, height: 52, objectFit: "cover", borderRadius: 3, boxShadow: "0 2px 6px rgba(0,0,0,0.4)", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div style={{ width: 36, height: 52, background: book.accent || friend.accent, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
                      <span style={{ fontSize: "0.85rem" }}>📗</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BookChallenge({ userId, userAccent, friends, tooltipText }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [goal, setGoal] = useState(null);
  const [goalDraft, setGoalDraft] = useState("");
  const [editingGoal, setEditingGoal] = useState(false);
  const [booksRead, setBooksRead] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showFriendId, setShowFriendId] = useState(null);
  const connectedFriends = friends || [];

  // Load goal and qualifying books whenever year changes
  useEffect(() => {
    let active = true;
    setLoaded(false);
    (async () => {
      const [savedGoal, customBooks, shelfBooks] = await Promise.all([
        loadChallengeGoal(userId, year),
        loadCustomBooks(userId),
        loadShelfBooks(userId),
      ]);
      if (!active) return;

      setGoal(savedGoal);
      setGoalDraft(savedGoal ? String(savedGoal) : "");

      // Gather all books from all sources
      const staticBooks = USERS[userId].books;
      const allBooks = [...staticBooks, ...customBooks, ...shelfBooks];

      // Deduplicate by id
      const seen = new Set();
      const unique = allBooks.filter((b) => { if (seen.has(b.id)) return false; seen.add(b.id); return true; });

      // For each book, check status + date
      const withData = await Promise.all(unique.map(async (b) => {
        const [status, progress, dateAdded] = await Promise.all([
          loadStatus(userId, b.id),
          loadProgress(userId, b.id),
          loadDateAdded(userId, b.id),
        ]);
        // Determine the relevant year for this book
        const finishDate = progress?.dateFinished || null;
        const relevantDate = finishDate || dateAdded;
        const bookYear = relevantDate ? parseInt(relevantDate.slice(0, 4), 10) : null;
        return { ...b, status, bookYear, finishDate };
      }));

      if (!active) return;

      const qualifying = withData.filter((b) => b.status === "read" && b.bookYear === year);
      setBooksRead(qualifying);
      setLoaded(true);
    })();
    return () => { active = false; };
  }, [userId, year]);

  const handleSaveGoal = async () => {
    const parsed = parseInt(goalDraft, 10);
    if (!parsed || parsed < 1) return;
    setGoal(parsed);
    setEditingGoal(false);
    await saveChallengeGoal(userId, year, parsed);
  };

  const count = booksRead.length;
  const pct = goal ? Math.min(100, Math.round((count / goal) * 100)) : 0;
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div style={{
      width: "100%",
      background: `${BRAND.darkCard}cc`, backdropFilter: "blur(10px)",
      border: `1px solid ${BRAND.cream}14`, borderRadius: 10, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "1rem 1.2rem", borderBottom: `1px solid ${BRAND.cream}14`, display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "1rem" }}>🏆</span>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: userAccent, display: "flex", alignItems: "center", gap: "0.3rem" }}>
          {USERS[userId].name}'s Reading Challenge <TooltipIcon text={tooltipText} color={userAccent} />
        </div>
        {/* Year selector */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.35rem" }}>
          {yearOptions.map((y) => (
            <button key={y} onClick={() => setYear(y)} style={{
              background: year === y ? `${userAccent}33` : "transparent",
              border: `1px solid ${year === y ? userAccent : `${BRAND.cream}22`}`,
              borderRadius: 20, padding: "0.2rem 0.6rem",
              color: year === y ? userAccent : `${BRAND.cream}55`,
              fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem",
              cursor: "pointer", transition: "all .15s ease",
            }}>{y}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "1.2rem" }}>
        {/* Goal setting */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.1rem", flexWrap: "wrap" }}>
          {goal && !editingGoal ? (
            <>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", color: BRAND.cream, lineHeight: 1 }}>
                {count} <span style={{ color: `${BRAND.cream}44`, fontWeight: 500 }}>/ {goal}</span>
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: `${BRAND.cream}66` }}>
                books read in {year}
              </div>
              <button onClick={() => { setGoalDraft(String(goal)); setEditingGoal(true); }} style={{ marginLeft: "auto", background: "none", border: `1px solid ${BRAND.cream}22`, borderRadius: 20, padding: "0.25rem 0.65rem", color: `${BRAND.cream}44`, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>
                Edit goal
              </button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.84rem", color: `${BRAND.cream}77` }}>Read</span>
              <input
                autoFocus={editingGoal}
                type="number"
                min={1}
                value={goalDraft}
                onChange={(e) => setGoalDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveGoal(); if (e.key === "Escape") setEditingGoal(false); }}
                placeholder="0"
                style={{ width: 64, background: `${BRAND.dark}cc`, border: `1px solid ${userAccent}77`, borderRadius: 6, padding: "0.4rem 0.6rem", color: BRAND.cream, fontFamily: "'JetBrains Mono', monospace", fontSize: "1rem", textAlign: "center", outline: "none" }}
              />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.84rem", color: `${BRAND.cream}77` }}>books in {year}</span>
              <button onClick={handleSaveGoal} style={{ background: userAccent, border: "none", borderRadius: 6, padding: "0.4rem 0.9rem", color: BRAND.cream, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer" }}>Set</button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {goal && (
          <div style={{ marginBottom: "1.2rem" }}>
            <div style={{ position: "relative", height: 10, borderRadius: 6, background: `${BRAND.cream}14`, overflow: "hidden", marginBottom: "0.4rem" }}>
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${userAccent}, ${BRAND.tan})`, borderRadius: 6, transition: "width .6s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", color: `${BRAND.cream}44` }}>
              <span>0</span>
              <span style={{ color: pct >= 100 ? userAccent : `${BRAND.cream}66`, fontWeight: 700 }}>
                {pct >= 100 ? "🎉 Goal reached!" : `${pct}% — ${Math.max(0, goal - count)} book${goal - count === 1 ? "" : "s"} to go`}
              </span>
              <span>{goal}</span>
            </div>
          </div>
        )}

        {/* Book covers */}
        {!loaded ? (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: `${BRAND.cream}33` }}>Loading…</div>
        ) : booksRead.length === 0 ? (
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", color: `${BRAND.cream}33`, fontStyle: "italic" }}>
            {goal ? `No books finished in ${year} yet — mark a book as "read" with a finish date to see it here.` : `Set a goal above to start your ${year} reading challenge.`}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            {booksRead.map((book) => (
              <div key={book.id} title={`${book.title} — ${book.author}`} style={{ position: "relative" }}>
                {book.cover ? (
                  <img src={book.cover} alt={book.title} style={{ width: 44, height: 64, objectFit: "cover", borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.4)", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <div style={{ width: 44, height: 64, background: book.accent || userAccent, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                    <span style={{ fontSize: "1rem" }}>📗</span>
                  </div>
                )}
                {book.finishDate && (
                  <div style={{ position: "absolute", bottom: -4, left: 0, right: 0, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.45rem", color: `${BRAND.cream}99`, whiteSpace: "nowrap" }}>
                    {book.finishDate.slice(5).replace("-", "/")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Toggle friend challenge progress — one button per connected friend */}
        {connectedFriends.length > 0 && (
          <div style={{ marginTop: "1.1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {connectedFriends.map((f) => {
              const isShowing = showFriendId === f.id;
              return (
                <button key={f.id}
                  onClick={() => setShowFriendId(isShowing ? null : f.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.4rem",
                    background: "none", border: `1px solid ${f.accent}44`, borderRadius: 20,
                    padding: "0.3rem 0.8rem", color: f.accent, cursor: "pointer",
                    fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem",
                    letterSpacing: "0.08em", textTransform: "uppercase", transition: "all .15s ease",
                  }}
                >
                  <span>{isShowing ? "▲" : "▼"}</span>
                  {isShowing ? `Hide ${f.name}'s progress` : `${f.name}'s ${year}`}
                </button>
              );
            })}
          </div>
        )}

        {showFriendId && <FriendChallenge friendId={showFriendId} year={year} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SHARED BOOKSHELF — books the current user and their connected friends have read
// ---------------------------------------------------------------------------
function SharedBookshelf({ viewerId, friends, tooltipText }) {
  const [sharedBooks, setSharedBooks] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const friendIds = (friends || []).map((f) => f.id);

  useEffect(() => {
    if (!viewerId || friendIds.length === 0) { setLoaded(true); return; }
    let active = true;
    (async () => {
      const participantIds = [viewerId, ...friendIds];

      const allUserBooks = await Promise.all(participantIds.map(async (uid) => {
        const [customBooks, shelfBooks] = await Promise.all([
          loadCustomBooks(uid),
          loadShelfBooks(uid),
        ]);
        const allBooks = [...USERS[uid].books, ...customBooks, ...shelfBooks];
        const withStatus = await Promise.all(
          allBooks.map(async (b) => ({ ...b, status: await loadStatus(uid, b.id) }))
        );
        const seen = new Set();
        return withStatus.filter((b) => {
          if (b.status !== "read" || seen.has(b.id)) return false;
          seen.add(b.id); return true;
        });
      }));

      if (!active) return;

      const normalize = (str) => (str || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
      const viewerBooks = allUserBooks[0];
      const friendBooks = allUserBooks.slice(1);

      // A book qualifies if the viewer has read it AND at least one friend has read it
      const friendTitleSets = friendBooks.map((fb) => new Set(fb.map((b) => normalize(b.title))));
      const readByFriend = (title) => friendTitleSets.some((s) => s.has(normalize(title)));

      // Collect which friends read each book
      const shared = viewerBooks
        .filter((b) => readByFriend(b.title))
        .map((b) => {
          const readers = friends.filter((f, i) => friendTitleSets[i]?.has(normalize(b.title)));
          return { id: b.id, title: b.title, author: b.author, cover: b.cover || null, accent: b.accent || BRAND.terracotta, readers };
        });

      setSharedBooks(shared);
      setLoaded(true);
    })();
    return () => { active = false; };
  }, [viewerId, friendIds.join(",")]);

  if (!loaded) return null;

  return (
    <div style={{ width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid rgba(217,162,130,.18)", borderLeft: `3px solid ${BRAND.tan}`, borderRadius: 4, padding: "clamp(16px,2vw,22px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: BRAND.tan, display: "flex", alignItems: "center", gap: 6 }}>
          Books we've both read <TooltipIcon text={tooltipText} color={BRAND.tan} />
        </div>
      </div>

      {sharedBooks.length === 0 ? (
        <p style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 15, color: "rgba(242,239,235,.55)", margin: 0 }}>
          No shared reads yet — mark a book as "read" in both libraries to see it here.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {sharedBooks.map((book) => (
            <div key={book.id} style={{ display: "flex", gap: "0.9rem", alignItems: "center" }}>
              {book.cover ? (
                <img src={book.cover} alt={book.title} style={{ width: 36, height: 52, objectFit: "cover", borderRadius: 2, flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }} onError={(e) => { e.target.style.display = "none"; }} />
              ) : (
                <div style={{ width: 36, height: 52, background: book.accent, borderRadius: 2, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "0.9rem" }}>📗</span>
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 17, color: BRAND.cream, lineHeight: 1.15, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</div>
                <div style={{ fontFamily: FONT.body, fontWeight: 300, fontSize: 13, color: BRAND.tan, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.author}</div>
                <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.3rem" }}>
                  {(book.readers || []).map((u) => (
                    <span key={u.id} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", letterSpacing: "0.06em", textTransform: "uppercase", background: `${u.accent}33`, color: u.accent, padding: "0.15rem 0.45rem", borderRadius: 20 }}>{u.name} ✓</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FRIEND READING — shows what each connected friend is currently reading
// ---------------------------------------------------------------------------
function FriendReadingCard({ friend, tooltipText }) {
  const [currentlyReading, setCurrentlyReading] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const [customBooks, shelfBooks] = await Promise.all([
        loadCustomBooks(friend.id),
        loadShelfBooks(friend.id),
      ]);
      const allBooks = [...friend.books, ...customBooks, ...shelfBooks];
      const withStatus = await Promise.all(
        allBooks.map(async (b) => ({ ...b, status: await loadStatus(friend.id, b.id) }))
      );
      if (!active) return;
      const seen = new Set();
      setCurrentlyReading(withStatus.filter((b) => {
        if (b.status !== "reading" || seen.has(b.id)) return false;
        seen.add(b.id); return true;
      }));
      setLoaded(true);
    })();
    return () => { active = false; };
  }, [friend.id]);

  if (!loaded) return null;

  return (
    <div style={{ width: "100%", background: "rgba(255,255,255,.04)", border: `1px solid rgba(217,162,130,.18)`, borderLeft: `3px solid ${friend.accent}`, borderRadius: 4, padding: "clamp(16px,2vw,22px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: friend.accent, display: "flex", alignItems: "center", gap: 6 }}>
          {friend.name} is reading <TooltipIcon text={tooltipText} color={friend.accent} />
        </div>
      </div>
      {currentlyReading.length === 0 ? (
        <p style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 15, color: "rgba(242,239,235,.55)", margin: 0 }}>
          {friend.name} hasn't started anything yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {currentlyReading.map((book) => (
            <div key={book.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {book.cover
                ? <img src={book.cover} alt={book.title} style={{ width: 36, height: 52, objectFit: "cover", borderRadius: 2, flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} onError={(e) => { e.target.style.display = "none"; }} />
                : <div style={{ width: 36, height: 52, background: friend.accent, borderRadius: 2, flexShrink: 0, boxShadow: "inset -5px 0 0 rgba(0,0,0,.14)" }} />}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 17, color: BRAND.cream, lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.title}</div>
                <div style={{ fontFamily: FONT.body, fontWeight: 300, fontSize: 13, color: BRAND.tan, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{book.author}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FriendReading({ friends, tooltipText }) {
  if (!friends || friends.length === 0) return null;
  return (
    <>
      {friends.map((f) => <FriendReadingCard key={f.id} friend={f} tooltipText={tooltipText} />)}
    </>
  );
}

// ---------------------------------------------------------------------------
// ADMIN PANEL — only accessible to the admin user (Amy)
// ---------------------------------------------------------------------------
const ACCENT_PRESETS = ["#F25C5C","#BF755A","#8C5634","#B98D6A","#D1A88C","#7C9E87","#6B8CAE","#A07CC5","#C5876B","#5E9E9E"];

function AdminPanel({ onClose, dynamicUsers, dynamicPasswords, onUserCreated, tooltips, onTooltipsChanged }) {
  const allUsers = Object.values(USERS);
  const [connections, setConnections] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // New user form
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newAccent, setNewAccent] = useState(ACCENT_PRESETS[3]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  useEffect(() => {
    loadConnections().then(setConnections);
  }, []);

  const toggleConnection = (id1, id2) => {
    setConnections((prev) => {
      const exists = hasConnection(id1, id2, prev);
      if (exists) return prev.filter(([a, b]) => !((a === id1 && b === id2) || (a === id2 && b === id1)));
      return [...prev, [id1, id2]];
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveConnections(connections);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError(null);
    const name = newName.trim();
    if (!name) { setCreateError("Name is required."); return; }
    if (!newPassword.trim()) { setCreateError("Password is required."); return; }
    const id = name.toLowerCase().replace(/\s+/g, "");
    if (USERS[id]) { setCreateError(`A user named "${name}" already exists.`); return; }
    setCreating(true);
    const newUser = { id, name, accent: newAccent };
    const result = await saveNewUser(newUser, newPassword.trim(), dynamicUsers || [], dynamicPasswords || {});
    USERS[id] = { ...newUser, books: [] };
    onUserCreated(result);
    setCreating(false);
    setCreateSuccess(true);
    setNewName(""); setNewPassword(""); setNewAccent(ACCENT_PRESETS[3]);
    setTimeout(() => setCreateSuccess(false), 3000);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Remove ${USERS[userId]?.name}? This cannot be undone.`)) return;
    const result = await deleteDynamicUser(userId, dynamicUsers || [], dynamicPasswords || {});
    onUserCreated(result);
  };

  // Build all unique user pairs
  const pairs = [];
  for (let i = 0; i < allUsers.length; i++) {
    for (let j = i + 1; j < allUsers.length; j++) {
      pairs.push([allUsers[i], allUsers[j]]);
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1.5rem",
    }}>
      <div style={{
        background: BRAND.darkCard, border: `1px solid ${BRAND.cream}22`,
        borderTop: `3px solid ${BRAND.coral}`, borderRadius: 12,
        padding: "2rem", width: "100%", maxWidth: 480,
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.6rem" }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: BRAND.coral, marginBottom: "0.3rem" }}>Admin · Access Control</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.4rem", color: BRAND.cream }}>Manage Connections</div>
            <div style={{ fontSize: "0.8rem", color: `${BRAND.cream}66`, marginTop: "0.3rem" }}>Toggle which users can see each other's info and chat.</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: `${BRAND.cream}55`, cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "0.2rem" }}>✕</button>
        </div>

        {/* User list with avatars */}
        <div style={{ marginBottom: "1.4rem" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.8rem" }}>Members</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            {allUsers.map((u) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: `${u.accent}18`, border: `1px solid ${u.accent}44`, borderRadius: 20, padding: "0.3rem 0.7rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.accent }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: u.accent }}>{u.name}</span>
                {u.id === ADMIN_USER_ID && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.5rem", color: BRAND.coral }}>admin</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Connection toggles */}
        <div style={{ marginBottom: "1.6rem" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.8rem" }}>Connections</div>
          {!connections ? (
            <div style={{ fontSize: "0.82rem", color: `${BRAND.cream}44` }}>Loading…</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {pairs.map(([u1, u2]) => {
                const connected = hasConnection(u1.id, u2.id, connections);
                return (
                  <div key={`${u1.id}-${u2.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: `${BRAND.dark}88`, borderRadius: 8, padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", color: BRAND.cream }}>{u1.name}</span>
                      <span style={{ color: `${BRAND.cream}33`, fontSize: "0.8rem" }}>↔</span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", color: BRAND.cream }}>{u2.name}</span>
                    </div>
                    <button
                      onClick={() => toggleConnection(u1.id, u2.id)}
                      style={{
                        width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                        background: connected ? BRAND.coral : `${BRAND.cream}22`,
                        position: "relative", transition: "background .2s ease",
                      }}
                    >
                      <div style={{
                        position: "absolute", top: 3, left: connected ? 23 : 3,
                        width: 18, height: 18, borderRadius: "50%", background: BRAND.cream,
                        transition: "left .2s ease",
                      }} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !connections}
          style={{
            width: "100%", padding: "0.75rem", borderRadius: 8, border: "none", cursor: "pointer",
            background: saved ? "#4caf50" : BRAND.coral, color: BRAND.cream,
            fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase",
            transition: "background .2s ease",
          }}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>

        {/* Divider */}
        <div style={{ margin: "1.6rem 0", height: 1, background: `${BRAND.cream}14` }} />

        {/* Create New User */}
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "1rem" }}>Create New User</div>
        <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <input
            type="text" value={newName} onChange={(e) => { setNewName(e.target.value); setCreateError(null); }}
            placeholder="First name (e.g. Jane)"
            style={{ background: `${BRAND.dark}88`, border: `1px solid ${BRAND.cream}22`, borderRadius: 8, padding: "0.7rem 0.9rem", color: BRAND.cream, fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", outline: "none", width: "100%" }}
          />
          <input
            type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setCreateError(null); }}
            placeholder="Password"
            style={{ background: `${BRAND.dark}88`, border: `1px solid ${BRAND.cream}22`, borderRadius: 8, padding: "0.7rem 0.9rem", color: BRAND.cream, fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", outline: "none", width: "100%" }}
          />
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.5rem" }}>Accent color</div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {ACCENT_PRESETS.map((c) => (
                <button key={c} type="button" onClick={() => setNewAccent(c)}
                  style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: newAccent === c ? `2px solid ${BRAND.cream}` : "2px solid transparent", cursor: "pointer", padding: 0, outline: "none" }}
                />
              ))}
            </div>
          </div>
          {createError && <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: BRAND.coral }}>{createError}</div>}
          <button type="submit" disabled={creating}
            style={{ padding: "0.7rem", borderRadius: 8, border: "none", cursor: "pointer", background: createSuccess ? "#4caf50" : newAccent, color: BRAND.cream, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", transition: "background .2s ease" }}
          >
            {creating ? "Creating…" : createSuccess ? "User Created ✓" : "Create User"}
          </button>
        </form>

        {/* Dynamic users list with delete */}
        {dynamicUsers && dynamicUsers.length > 0 && (
          <div style={{ marginTop: "1.2rem" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.6rem" }}>Added users</div>
            {dynamicUsers.map((u) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: `1px solid ${BRAND.cream}0e` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: u.accent }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", color: BRAND.cream }}>{u.name}</span>
                </div>
                <button onClick={() => handleDeleteUser(u.id)} style={{ background: "none", border: "none", color: `${BRAND.cream}44`, cursor: "pointer", fontSize: "0.8rem", padding: "0.2rem 0.4rem" }}>✕ Remove</button>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ margin: "1.6rem 0", height: 1, background: `${BRAND.cream}14` }} />

        {/* Tooltip Editor */}
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.8rem" }}>Section Tooltips</div>
        <div style={{ fontSize: "0.78rem", color: `${BRAND.cream}55`, fontFamily: "'Inter', sans-serif", marginBottom: "0.8rem" }}>Add instructions that appear as a ⓘ icon on each section. Leave blank to hide.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          {TOOLTIP_SECTIONS.map(({ key, label }) => (
            <div key={key}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.56rem", color: `${BRAND.cream}55`, marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              <textarea
                value={(tooltips || {})[key] || ""}
                onChange={(e) => onTooltipsChanged({ ...(tooltips || {}), [key]: e.target.value })}
                onBlur={async () => { await saveTooltips(tooltips || {}); }}
                placeholder={`Instructions for ${label}…`}
                rows={2}
                style={{ width: "100%", background: `${BRAND.dark}88`, border: `1px solid ${BRAND.cream}22`, borderRadius: 6, padding: "0.55rem 0.7rem", color: BRAND.cream, fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// USER HOME
// ---------------------------------------------------------------------------
function UserHome({ user, onOpenMyBooks, onOpenShelf, onLogout, dynamicUsers, dynamicPasswords, onUserCreated, tooltips, onTooltipsChanged }) {
  const [connections, setConnections] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const isAdmin = user.id === ADMIN_USER_ID;

  useEffect(() => {
    loadConnections().then(setConnections);
  }, [showAdmin]); // reload after admin panel closes

  const friends = connections ? getConnectedUsers(user.id, connections) : [];

  return (
    <div style={{ minHeight: "100vh", background: BRAND.cream, color: BRAND.ink, fontFamily: FONT.body, overflowX: "hidden" }}>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} dynamicUsers={dynamicUsers} dynamicPasswords={dynamicPasswords} onUserCreated={onUserCreated} tooltips={tooltips} onTooltipsChanged={onTooltipsChanged} />}

      {/* Sticky nav */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(242,239,235,.9)", backdropFilter: "saturate(180%) blur(12px)", WebkitBackdropFilter: "saturate(180%) blur(12px)", borderBottom: `1px solid ${BRAND.line}` }}>
        <nav style={{ maxWidth: 1220, margin: "0 auto", padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: 3, background: BRAND.coral, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 600, fontSize: 20, color: BRAND.cream }}>B</span>
            <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: BRAND.ink }}>Book Brain</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isAdmin && (
              <button onClick={() => setShowAdmin(true)} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "8px 14px", borderRadius: 2, cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = BRAND.coral; e.currentTarget.style.borderColor = BRAND.coral; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = BRAND.muted; e.currentTarget.style.borderColor = BRAND.line2; }}>
                ⚙ Admin
              </button>
            )}
            <button onClick={onLogout} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: "0.04em", color: BRAND.muted, background: "none", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => e.currentTarget.style.color = BRAND.coral}
              onMouseLeave={(e) => e.currentTarget.style.color = BRAND.muted}>
              Sign out
            </button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1220, margin: "0 auto", padding: "clamp(44px,7vw,80px) 24px clamp(32px,5vw,56px)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: FONT.body, fontSize: 12.5, letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND.terracotta, marginBottom: 18 }}>
          <span style={{ width: 26, height: 1, background: BRAND.terracotta, display: "inline-block" }} />
          Your reading life <TooltipIcon text={tooltips?.home} color={BRAND.terracotta} />
        </div>
        <h1 style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: "clamp(40px,6vw,76px)", lineHeight: 1.03, letterSpacing: "-0.01em", color: BRAND.ink, margin: "0 0 20px" }}>
          Good to see you,{" "}
          <span style={{ fontStyle: "italic", color: BRAND.coral }}>{user.name}.</span>
        </h1>
        <p style={{ fontFamily: FONT.read, fontSize: "clamp(16px,1.3vw,18px)", lineHeight: 1.6, color: BRAND.muted, margin: 0, maxWidth: "38em" }}>Your library is waiting. Pick up where you left off.</p>
      </section>

      {/* Reading challenge */}
      <section style={{ maxWidth: 1220, margin: "0 auto", padding: "0 24px clamp(24px,3vw,36px)" }}>
        <BookChallenge userId={user.id} userAccent={user.accent} friends={friends} tooltipText={tooltips?.challenge} />
      </section>

      {/* Nav cards */}
      <section style={{ maxWidth: 1220, margin: "0 auto", padding: "0 24px clamp(32px,4vw,48px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 16 }}>
          <button onClick={onOpenMyBooks} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderLeft: `3px solid ${user.accent}`, borderRadius: 4, padding: "clamp(20px,3vw,28px)", textAlign: "left", cursor: "pointer", color: BRAND.ink, boxShadow: "0 1px 2px rgba(20,30,50,.06)", transition: "box-shadow .2s,transform .2s,border-color .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(20,30,50,.10)"; e.currentTarget.style.borderColor = BRAND.tan; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(20,30,50,.06)"; e.currentTarget.style.borderColor = BRAND.line; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>🗂️</span>
              <span style={{ fontFamily: FONT.body, fontSize: 11.5, letterSpacing: "0.2em", textTransform: "uppercase", color: BRAND.terracotta, display: "flex", alignItems: "center", gap: 6 }}>
                Card Catalogue <TooltipIcon text={tooltips?.myBooks} color={BRAND.terracotta} />
              </span>
            </div>
            <h2 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: "clamp(22px,2.5vw,28px)", margin: "0 0 8px", color: BRAND.ink }}>{user.name}'s Book Notes</h2>
            <p style={{ fontFamily: FONT.body, fontWeight: 300, fontSize: 14.5, lineHeight: 1.65, color: BRAND.muted, margin: 0 }}>Full summaries, key ideas, quotes, and reading trackers — all in one place.</p>
          </button>

          <button onClick={onOpenShelf} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderLeft: `3px solid ${BRAND.terracotta}`, borderRadius: 4, padding: "clamp(20px,3vw,28px)", textAlign: "left", cursor: "pointer", color: BRAND.ink, boxShadow: "0 1px 2px rgba(20,30,50,.06)", transition: "box-shadow .2s,transform .2s,border-color .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(20,30,50,.10)"; e.currentTarget.style.borderColor = BRAND.tan; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(20,30,50,.06)"; e.currentTarget.style.borderColor = BRAND.line; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>📚</span>
              <span style={{ fontFamily: FONT.body, fontSize: 11.5, letterSpacing: "0.2em", textTransform: "uppercase", color: BRAND.terracotta, display: "flex", alignItems: "center", gap: 6 }}>
                Reading List <TooltipIcon text={tooltips?.shelf} color={BRAND.terracotta} />
              </span>
            </div>
            <h2 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: "clamp(22px,2.5vw,28px)", margin: "0 0 8px", color: BRAND.ink }}>{user.name}'s Bookshelf</h2>
            <p style={{ fontFamily: FONT.body, fontWeight: 300, fontSize: 14.5, lineHeight: 1.65, color: BRAND.muted, margin: 0 }}>Books on deck — covers, page counts, and read-time estimates.</p>
          </button>
        </div>
      </section>

      {/* Social widgets — espresso section */}
      {friends.length > 0 && (
        <section style={{ background: BRAND.espresso, padding: "clamp(40px,6vw,72px) 0" }}>
          <div style={{ maxWidth: 1220, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ fontFamily: FONT.body, fontSize: 12.5, letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND.tan, marginBottom: 28 }}>Your reading room</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 16, marginBottom: 16 }}>
              <FriendReading friends={friends} tooltipText={tooltips?.friendReading} />
              <SharedBookshelf viewerId={user.id} friends={friends} tooltipText={tooltips?.sharedBooks} />
            </div>
            <SharedChat activeUser={user} friends={friends} tooltipText={tooltips?.chat} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ background: BRAND.espresso2, padding: "28px 24px", borderTop: `1px solid rgba(217,162,130,.14)` }}>
        <div style={{ maxWidth: 1220, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: FONT.display, fontStyle: "italic", fontSize: 18, color: BRAND.tan }}>Turn the page.</span>
          <span style={{ fontFamily: FONT.body, fontSize: 12, color: "rgba(242,239,235,.4)", letterSpacing: "0.08em" }}>© 2026 Book Brain · mybookbrain.com</span>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LOGIN SCREEN
// ---------------------------------------------------------------------------
const PASSWORDS = {
  amy:       import.meta.env.VITE_PASSWORD_AMY       || "estes",
  lynnell:   import.meta.env.VITE_PASSWORD_LYNNELL   || "grube",
  christina: import.meta.env.VITE_PASSWORD_CHRISTINA || "brown",
};

const SESSION_KEY = "bookbrain:loggedInUser";

function LoginScreen({ onLogin, allPasswords }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const userId = username.trim().toLowerCase();
    const user = USERS[userId];
    if (!user) { setError("Name not recognised — try again."); setShake(true); setTimeout(() => setShake(false), 500); return; }
    const passwords = allPasswords || PASSWORDS;
    if (password === passwords[userId]) { sessionStorage.setItem(SESSION_KEY, userId); onLogin(userId); }
    else { setError("Wrong password — try again."); setPassword(""); setShake(true); setTimeout(() => setShake(false), 500); }
  };

  const iStyle = {
    width: "100%", fontFamily: FONT.body, fontSize: "15px", padding: "13px 16px",
    border: `1px solid ${BRAND.line2}`, borderRadius: 2, background: BRAND.paper,
    color: BRAND.ink, outline: "none", transition: "border-color .15s",
  };

  const features = [
    { icon: "📖", title: "Every book, shelved", body: "Search a title — it lands on the right shelf with the cover you remember." },
    { icon: "🔖", title: "Mark your progress", body: "A gentle page tracker that remembers where you left off." },
    { icon: "✏️", title: "Notes in the margins", body: "Keep a quote, tuck a thought into the page. Your marginalia, forever." },
    { icon: "🔥", title: "A club by the fire", body: "Share notes and reading lists with the people you love to read with." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BRAND.cream, color: BRAND.ink, fontFamily: FONT.body, overflowX: "hidden" }}>

      {/* Announcement ticker */}
      <div style={{ background: BRAND.espresso, color: BRAND.tan, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", overflow: "hidden", whiteSpace: "nowrap", borderBottom: `1px solid rgba(217,162,130,.16)` }}>
        <div style={{ display: "flex", width: "max-content", animation: "mg-marquee 36s linear infinite" }}>
          {[0,1].map(k => (
            <span key={k} style={{ display: "flex", gap: 40, padding: "9px 20px 9px 0" }}>
              <span>Your library, beautifully kept</span><span style={{ color: BRAND.coral }}>·</span>
              <span>Track every page you've ever read</span><span style={{ color: BRAND.coral }}>·</span>
              <span>Share shelves with friends</span><span style={{ color: BRAND.coral }}>·</span>
              <span>Turn the page</span><span style={{ color: BRAND.coral }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(242,239,235,.88)", backdropFilter: "saturate(180%) blur(12px)", WebkitBackdropFilter: "saturate(180%) blur(12px)", borderBottom: `1px solid ${BRAND.line}` }}>
        <nav style={{ maxWidth: 1220, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", flex: "none" }}>
            <span style={{ width: 38, height: 38, borderRadius: 3, background: BRAND.coral, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: BRAND.cream, boxShadow: "0 1px 3px rgba(20,30,50,.14)" }}>B</span>
            <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 24, letterSpacing: "0.01em", color: BRAND.ink }}>Book Brain</span>
          </div>
          <a href="#signin" style={{ fontFamily: FONT.body, fontSize: 13.5, letterSpacing: "0.04em", textTransform: "uppercase", background: BRAND.coral, color: "#fff", textDecoration: "none", padding: "11px 20px", borderRadius: 2, whiteSpace: "nowrap", boxShadow: "0 1px 3px rgba(20,30,50,.14)" }}>Sign in</a>
        </nav>
      </header>

      {/* Hero — 2-col on desktop, stacked on mobile */}
      <section style={{ maxWidth: 1220, margin: "0 auto", padding: "clamp(48px,8vw,96px) 24px clamp(40px,6vw,72px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,460px),1fr))", gap: "clamp(32px,5vw,72px)", alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: FONT.body, fontSize: 12.5, letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND.terracotta, marginBottom: 20 }}>
            <span style={{ width: 26, height: 1, background: BRAND.terracotta, display: "inline-block" }} />
            A home for everything you read
          </div>
          <h1 style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: "clamp(42px,6vw,80px)", lineHeight: 1.03, letterSpacing: "-0.01em", color: BRAND.ink, margin: "0 0 22px" }}>
            Build the library<br />you've always{" "}
            <span style={{ fontStyle: "italic", color: BRAND.coral }}>meant to keep.</span>
          </h1>
          <p style={{ fontFamily: FONT.read, fontSize: "clamp(16px,1.4vw,19px)", lineHeight: 1.6, color: BRAND.muted, maxWidth: "32em", margin: "0 0 36px" }}>
            Book Brain is a warm, quiet place to catalogue your books, track every page, and share your reading life with the people you love.
          </p>
          <div style={{ display: "flex", gap: "clamp(20px,4vw,48px)", flexWrap: "wrap" }}>
            {[["38k+","Shelves built"],["2.1M","Pages tracked"],["4.9★","Reader rating"]].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 32, color: BRAND.ink, lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: BRAND.muted, marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Login form panel */}
        <div id="signin" style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 4, padding: "clamp(28px,4vw,44px)", boxShadow: "0 4px 12px rgba(20,30,50,.10)" }}>
          <div style={{ fontFamily: FONT.body, fontSize: 12.5, letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND.terracotta, marginBottom: 16 }}>Sign in to your shelf</div>
          <h2 style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: "clamp(26px,3vw,36px)", lineHeight: 1.05, color: BRAND.ink, margin: "0 0 24px" }}>Welcome back.</h2>

          <form onSubmit={handleSubmit} className={shake ? "shake" : ""} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: BRAND.muted, display: "block", marginBottom: 6 }}>Your name</label>
              <input autoFocus type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(null); }} placeholder="e.g. Amy" style={iStyle} />
            </div>
            <div>
              <label style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: BRAND.muted, display: "block", marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} placeholder="••••••" style={iStyle} />
            </div>
            {error && <div style={{ fontFamily: FONT.body, fontSize: 13, color: BRAND.coral }}>{error}</div>}
            <button type="submit" style={{ fontFamily: FONT.body, fontSize: 13.5, letterSpacing: "0.04em", textTransform: "uppercase", background: BRAND.coral, color: "#fff", border: "none", cursor: "pointer", padding: "14px 24px", borderRadius: 2, boxShadow: "0 4px 12px rgba(20,30,50,.10)", transition: "background .15s", marginTop: 4 }}
              onMouseEnter={(e) => e.currentTarget.style.background = BRAND.coralDeep}
              onMouseLeave={(e) => e.currentTarget.style.background = BRAND.coral}>
              Open your library →
            </button>
          </form>

          <p style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 14, color: BRAND.muted, margin: "20px 0 0", lineHeight: 1.5 }}>
            "It finally feels like my books all live in one warm room."
          </p>
        </div>
      </section>

      {/* Marquee band */}
      <div style={{ background: BRAND.ink, overflow: "hidden", whiteSpace: "nowrap", padding: "16px 0", borderTop: `1px solid ${BRAND.espresso2}`, borderBottom: `1px solid ${BRAND.espresso2}` }}>
        <div style={{ display: "flex", width: "max-content", animation: "mg-marquee 30s linear infinite" }}>
          {[0,1].map(k => (
            <span key={k} style={{ display: "flex", alignItems: "center", gap: 28, paddingRight: 28, fontFamily: FONT.display, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(24px,3vw,42px)", color: BRAND.cream }}>
              <span>Catalogue your shelves</span><span style={{ color: BRAND.coral, fontStyle: "normal" }}>✦</span>
              <span style={{ color: BRAND.tan }}>Track every page</span><span style={{ color: BRAND.coral, fontStyle: "normal" }}>✦</span>
              <span>Write in the margins</span><span style={{ color: BRAND.coral, fontStyle: "normal" }}>✦</span>
              <span style={{ color: BRAND.tan }}>Share with friends</span><span style={{ color: BRAND.coral, fontStyle: "normal" }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <section style={{ maxWidth: 1220, margin: "0 auto", padding: "clamp(56px,8vw,100px) 24px" }}>
        <div style={{ maxWidth: 560, marginBottom: "clamp(36px,5vw,60px)" }}>
          <div style={{ fontFamily: FONT.body, fontSize: 12.5, letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND.terracotta, marginBottom: 14 }}>Everything in its place</div>
          <h2 style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: "clamp(30px,4vw,52px)", lineHeight: 1.06, color: BRAND.ink, margin: 0 }}>A little reverence for the books you keep.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 20 }}>
          {features.map((f) => (
            <div key={f.title} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 4, padding: "clamp(20px,3vw,28px)", boxShadow: "0 1px 2px rgba(20,30,50,.06)", transition: "box-shadow .2s,border-color .2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(20,30,50,.10)"; e.currentTarget.style.borderColor = BRAND.tan; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 2px rgba(20,30,50,.06)"; e.currentTarget.style.borderColor = BRAND.line; }}>
              <div style={{ width: 44, height: 44, borderRadius: 3, background: "rgba(242,92,92,.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontSize: 20 }}>{f.icon}</div>
              <h3 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: BRAND.ink, margin: "0 0 8px", lineHeight: 1.15 }}>{f.title}</h3>
              <p style={{ fontFamily: FONT.body, fontSize: 14.5, lineHeight: 1.65, color: BRAND.muted, margin: 0, fontWeight: 300 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pull quote */}
      <section style={{ background: BRAND.terracotta, color: "#fff", padding: "clamp(56px,8vw,100px) 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: "50%", transform: "translateY(-50%)", fontFamily: FONT.display, fontSize: "clamp(200px,30vw,400px)", lineHeight: 1, color: "rgba(255,255,255,.08)", fontWeight: 600, pointerEvents: "none" }}>"</div>
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative" }}>
          <div style={{ fontFamily: FONT.body, fontSize: 12.5, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,.7)", marginBottom: 24 }}>From a member</div>
          <blockquote style={{ fontFamily: FONT.display, fontWeight: 500, fontStyle: "italic", fontSize: "clamp(26px,4vw,48px)", lineHeight: 1.18, margin: 0, color: "#fff" }}>
            It finally feels like my books all live in one warm room — even the ones I lent out and the ones I'm still pretending I'll finish.
          </blockquote>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 28 }}>
            <span style={{ width: 42, height: 42, borderRadius: "50%", background: BRAND.cream, color: BRAND.terracotta, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 600, fontSize: 20 }}>E</span>
            <div>
              <div style={{ fontFamily: FONT.body, fontSize: 15, color: "#fff" }}>Esme Larkin</div>
              <div style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,.7)" }}>1,204 books · Member since 2023</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: BRAND.espresso, color: BRAND.cream, padding: "clamp(44px,6vw,72px) 24px 28px" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 34, height: 34, borderRadius: 3, background: BRAND.coral, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 600, fontSize: 20, color: BRAND.cream }}>B</span>
            <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: BRAND.cream }}>Book Brain</span>
          </div>
          <p style={{ fontFamily: FONT.read, fontSize: 15, lineHeight: 1.6, color: "rgba(242,239,235,.62)", maxWidth: "30em", margin: "0 0 14px" }}>A warm, quiet home for everything you read — your shelves, your margins, your reading life.</p>
          <div style={{ fontFamily: FONT.display, fontStyle: "italic", fontSize: 19, color: BRAND.tan }}>Turn the page.</div>
          <div style={{ marginTop: 36, paddingTop: 20, borderTop: `1px solid rgba(217,162,130,.18)`, fontFamily: FONT.body, fontSize: 12.5, color: "rgba(242,239,235,.5)" }}>
            © 2026 Book Brain · mybookbrain.com
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ROOT APP
// ---------------------------------------------------------------------------
export default function App() {
  const [loggedInUserId, setLoggedInUserId] = useState(() => sessionStorage.getItem(SESSION_KEY) || null);
  const [screen, setScreen] = useState("userHome");
  const [activeBookId, setActiveBookId] = useState(null);
  const [customBooksVersion, setCustomBooksVersion] = useState(0);
  const [allCustomBooks, setAllCustomBooks] = useState([]);
  const [dynamicUsers, setDynamicUsers] = useState([]);
  const [dynamicPasswords, setDynamicPasswords] = useState({});
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [tooltips, setTooltips] = useState({});

  // Load dynamic users and tooltips once on mount
  useEffect(() => {
    Promise.all([
      loadDynamicUsers(),
      loadTooltips(),
    ]).then(([{ dynamicUsers: du, dynamicPasswords: dp }, tt]) => {
      setDynamicUsers(du);
      setDynamicPasswords(dp);
      setTooltips(tt);
      setUsersLoaded(true);
    });
  }, []);

  const allPasswords = { ...PASSWORDS, ...dynamicPasswords };

  const activeUser = loggedInUserId ? USERS[loggedInUserId] : null;

  useEffect(() => {
    if (!loggedInUserId) { setAllCustomBooks([]); return; }
    loadCustomBooks(loggedInUserId).then(setAllCustomBooks);
  }, [loggedInUserId, customBooksVersion]);

  const staticBooks = activeUser ? activeUser.books : [];
  const activeBook = [...staticBooks, ...allCustomBooks].find((b) => b.id === activeBookId);

  const handleLogin = (userId) => { setLoggedInUserId(userId); setScreen("userHome"); setActiveBookId(null); };
  const handleLogout = () => { sessionStorage.removeItem(SESSION_KEY); setLoggedInUserId(null); setScreen("userHome"); setActiveBookId(null); };
  const goUserHome = () => { setScreen("userHome"); setActiveBookId(null); };

  const handleUserCreated = ({ dynamicUsers: du, dynamicPasswords: dp }) => {
    setDynamicUsers(du);
    setDynamicPasswords(dp);
  };

  if (!usersLoaded) return null; // wait for dynamic users before rendering login

  if (!loggedInUserId) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; }`}</style>
        <LoginScreen onLogin={handleLogin} allPasswords={allPasswords} />
      </div>
    );
  }

  let content;
  if (activeBook && activeUser) {
    content = <BookDashboard userId={activeUser.id} book={activeBook} onBack={goUserHome} onLogout={handleLogout} />;
  } else if (screen === "myBooks" && activeUser) {
    content = <MyBooksHome userId={activeUser.id} userAccent={activeUser.accent} staticBooks={staticBooks} onSelect={(id) => setActiveBookId(id)} onBack={goUserHome} onLogout={handleLogout} />;
  } else if (screen === "shelf" && activeUser) {
    content = <Bookshelf userId={activeUser.id} userAccent={activeUser.accent} onBack={goUserHome} onLogout={handleLogout} />;
  } else if (activeUser) {
    content = <UserHome user={activeUser} onOpenMyBooks={() => setScreen("myBooks")} onOpenShelf={() => setScreen("shelf")} onLogout={handleLogout} dynamicUsers={dynamicUsers} dynamicPasswords={dynamicPasswords} onUserCreated={handleUserCreated} tooltips={tooltips} onTooltipsChanged={setTooltips} />;
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        @media (max-width: 720px) { .casefile-grid { grid-template-columns: 1fr !important; } .quote-form { grid-template-columns: 1fr !important; } }
        * { box-sizing: border-box; }
      `}</style>
      {content}
    </div>
  );
}
