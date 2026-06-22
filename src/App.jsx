import React, { useState, useEffect, useCallback } from "react";
import { storage, subscribeToChatUpdates } from "./storage.js";

// Brand palette — Marginalia warm library aesthetic
const BRAND = {
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
const FONT = {
  display: "'Cormorant Garamond', Georgia, serif",
  read: "'Spectral', Georgia, serif",
  body: "'Jost', system-ui, -apple-system, sans-serif",
  type: "'Special Elite', 'Courier New', ui-monospace, monospace",
};

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
      display: FONT.display, body: FONT.body, mono: FONT.type,
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
      display: FONT.display, body: FONT.body, mono: FONT.type,
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
// loadShelfBooks / saveShelfBooks — legacy store, read-only for migration in loadBooks()
async function loadShelfBooks(userId) {
  try { const res = await storage.get(shelfKey(userId)); return res ? JSON.parse(res.value) : []; } catch (e) { return []; }
}
async function loadStatus(userId, id) {
  try { const res = await storage.get(statusKey(userId, id)); return res ? res.value : null; } catch (e) { return null; }
}
async function saveStatus(userId, id, status) {
  try { const result = await storage.set(statusKey(userId, id), status); return !!result; } catch (e) { return false; }
}
// loadCustomBooks / saveCustomBooks — legacy store, read-only for migration in loadBooks()
async function loadCustomBooks(userId) {
  try { const res = await storage.get(customBooksKey(userId)); return res ? JSON.parse(res.value) : []; } catch (e) { return []; }
}

// ---------------------------------------------------------------------------
// UNIFIED BOOK STORE — single source of truth for all user-added books
// ---------------------------------------------------------------------------
function unifiedBooksKey(userId) { return `${userId}:books:v2`; }

async function loadBooks(userId) {
  try {
    const res = await storage.get(unifiedBooksKey(userId));
    if (res) return JSON.parse(res.value);
    // First run: migrate from old separate stores
    const [shelf, custom] = await Promise.all([loadShelfBooks(userId), loadCustomBooks(userId)]);
    const customIds = new Set(custom.map((b) => b.id));
    const seen = new Set();
    const merged = [];
    for (const b of [...custom, ...shelf]) {
      if (seen.has(b.id)) continue;
      seen.add(b.id);
      merged.push({ ...b, inMarginalia: customIds.has(b.id), drawerId: b.drawerId || null, nodes: b.nodes || [], theme: b.theme || null });
    }
    if (merged.length > 0) await saveBooks(userId, merged);
    return merged;
  } catch { return []; }
}

async function saveBooks(userId, list) {
  try { await storage.set(unifiedBooksKey(userId), JSON.stringify(list)); return true; } catch { return false; }
}

// Returns true if two book records refer to the same work
function booksMatch(a, b) {
  if (a.workId && b.workId) return a.workId === b.workId;
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return norm(a.title) === norm(b.title) && norm(a.author) === norm(b.author);
}

// Load a friend's shared book that matches the given book, along with their quotes/progress
async function loadFriendSharedData(friendId, myBook) {
  try {
    const friendBooks = await loadBooks(friendId);
    const match = friendBooks.find((b) => b.shared && b.inMarginalia && booksMatch(b, myBook));
    if (!match) return null;
    const [quotes, progress, status] = await Promise.all([
      loadQuotes(friendId, match.id),
      loadProgress(friendId, match.id),
      loadStatus(friendId, match.id),
    ]);
    return { book: match, quotes, progress, status };
  } catch { return null; }
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
  display: FONT.display, body: FONT.body, mono: FONT.type,
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
  { key: "myBooks",       label: "Marginalia section" },
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
          <p style={{ fontFamily: FONT.body, fontSize: "0.82rem", color: BRAND.cream, margin: "0 0 0.5rem", lineHeight: 1.5 }}>{text}</p>
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
    const allBooks = await loadBooks(userId);
    const exists = allBooks.some((b) => b.id === book.id);
    const updated = exists
      ? allBooks.map((b) => b.id === book.id ? updatedBook : b)
      : [...allBooks, { ...updatedBook, inMarginalia: false, shared: false, drawerId: "want" }];
    await saveBooks(userId, updated);
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

const MARGINALIA_THEME = {
  bg: BRAND.cream, card: BRAND.paper, ink: BRAND.ink,
  inkSoft: BRAND.muted, inkFaint: "rgba(38,32,32,0.4)", border: BRAND.line,
  display: FONT.display, body: FONT.body, mono: FONT.type,
  displayWeight: 600, headerBg: BRAND.espresso, headerInk: BRAND.cream,
};

function FriendsReadingThis({ userId, book }) {
  const [friendData, setFriendData] = useState([]); // [{friend, data}]
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const connections = await loadConnections();
      const friends = getConnectedUsers(userId, connections);
      const results = await Promise.all(friends.map(async (friend) => {
        const data = await loadFriendSharedData(friend.id, book);
        return data ? { friend, data } : null;
      }));
      if (active) { setFriendData(results.filter(Boolean)); setLoaded(true); }
    })();
    return () => { active = false; };
  }, [userId, book.id, book.shared]);

  if (!loaded || friendData.length === 0) return null;

  return (
    <div style={{ marginTop: "2.4rem", borderTop: `1px solid ${BRAND.line}`, paddingTop: "2rem" }}>
      <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: "1.2rem" }}>Also reading this</div>
      {friendData.map(({ friend, data }) => {
        const pct = data.progress?.totalPages ? Math.round((data.progress.currentPage / data.progress.totalPages) * 100) : null;
        return (
          <div key={friend.id} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 5, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: friend.accent || BRAND.terracotta, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 600, fontSize: 15, color: "#fff", flexShrink: 0 }}>{friend.name[0]}</div>
              <div>
                <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 14, color: BRAND.ink }}>{friend.name}</div>
                {pct !== null && (
                  <div style={{ fontFamily: FONT.body, fontSize: 12, color: BRAND.muted, marginTop: 2 }}>{pct}% through · p.{data.progress.currentPage} of {data.progress.totalPages}</div>
                )}
              </div>
              {data.status && (
                <div style={{ marginLeft: "auto", fontFamily: FONT.body, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: BRAND.terracotta, background: "rgba(191,117,90,.1)", border: "1px solid rgba(191,117,90,.25)", borderRadius: 3, padding: "4px 9px" }}>{data.status.replace(/-/g, " ")}</div>
              )}
            </div>
            {pct !== null && (
              <div style={{ height: 4, borderRadius: 2, background: BRAND.line, marginBottom: 12, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: BRAND.terracotta, borderRadius: 2, transition: "width .4s" }} />
              </div>
            )}
            {data.book.tagline && (
              <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 14, lineHeight: 1.6, color: BRAND.ink, marginBottom: data.quotes?.length ? 12 : 0 }}>{data.book.tagline}</div>
            )}
            {data.quotes?.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: BRAND.muted }}>Highlights</div>
                {data.quotes.slice(0, 3).map((q) => (
                  <div key={q.id} style={{ borderLeft: `2px solid ${BRAND.terracotta}`, paddingLeft: 12 }}>
                    <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.55, color: BRAND.ink }}>"{q.text}"</div>
                    {q.page && <div style={{ fontFamily: FONT.body, fontSize: 11, color: BRAND.muted, marginTop: 3 }}>p. {q.page}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BookDashboard({ userId, book: initialBook, onBack, onLogout }) {
  const [book, setBook] = useState(initialBook);
  const theme = { ...(book.theme ? DEFAULT_THEME : MARGINALIA_THEME), ...(book.theme || {}) };
  const hasAcademic = !!(book.nodes && book.nodes.length && book.caseFile && book.keyLines && book.thread);
  const [openNode, setOpenNode] = useState(null);
  const isUserBook = book.id.startsWith("book-") || book.id.startsWith("shelf-");

  const handleToggleShared = async () => {
    const allBooks = await loadBooks(userId);
    const updated = allBooks.map((b) => b.id === book.id ? { ...b, shared: !b.shared } : b);
    await saveBooks(userId, updated);
    setBook((prev) => ({ ...prev, shared: !prev.shared }));
  };

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

        {/* Share toggle — only for user-added books in Marginalia */}
        {isUserBook && (
          <div style={{ marginTop: "2.4rem", borderTop: `1px solid ${BRAND.line}`, paddingTop: "1.6rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: 4 }}>Share with connections</div>
              <div style={{ fontFamily: FONT.read, fontSize: 13.5, color: BRAND.muted, lineHeight: 1.5 }}>
                {book.shared ? "Your notes and highlights are visible to connected readers who also have this book." : "Share your notes and highlights with connected readers who have this book."}
              </div>
            </div>
            <button onClick={handleToggleShared} style={{ flexShrink: 0, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: book.shared ? BRAND.terracotta : "transparent", border: `1px solid ${book.shared ? BRAND.terracotta : BRAND.line2}`, color: book.shared ? "#fff" : BRAND.muted, padding: "9px 18px", borderRadius: 3, cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap" }}>
              {book.shared ? "✓ Shared" : "Share"}
            </button>
          </div>
        )}

        <FriendsReadingThis userId={userId} book={book} />
        <BookChat userId={userId} book={book} />
      </div>
    </div>
  );
}

function StatusBadge({ status, accent }) {
  if (status === "read") return (
    <div title="Finished" style={{ position: "absolute", top: -6, right: -10, width: 34, height: 34, borderRadius: "50%", background: accent, border: "2px solid #F4EFE4", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-12deg)", boxShadow: "0 2px 5px rgba(0,0,0,0.4)" }}>
      <span style={{ fontFamily: FONT.type, fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.03em", color: "#1A1610", textAlign: "center", lineHeight: 1.05 }}>READ</span>
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
      <span style={{ fontFamily: FONT.type, fontSize: "0.42rem", fontWeight: 700, letterSpacing: "0.02em", color: accent, textAlign: "center", lineHeight: 1.05 }}>TO<br/>READ</span>
    </div>
  );
}

function DeleteConfirmModal({ bookTitle, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(38,32,32,.62)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 5, maxWidth: 420, width: "100%", padding: "32px 28px 24px", boxShadow: "0 16px 40px rgba(20,30,50,.18)" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(242,92,92,.1)", border: `1px solid rgba(242,92,92,.3)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, fontSize: 20 }}>🗑</div>
        <h3 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: BRAND.ink, margin: "0 0 10px", lineHeight: 1.2 }}>Delete this book?</h3>
        <p style={{ fontFamily: FONT.read, fontSize: 15, lineHeight: 1.6, color: BRAND.muted, margin: "0 0 6px" }}>
          Are you sure you want to delete <em>"{bookTitle}"</em>?
        </p>
        <p style={{ fontFamily: FONT.read, fontSize: 13.5, lineHeight: 1.6, color: BRAND.coral, margin: "0 0 26px" }}>
          This will delete all data associated with this book.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "11px 16px", borderRadius: 3, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: BRAND.coral, border: "none", color: "#fff", padding: "11px 16px", borderRadius: 3, cursor: "pointer" }}>Yes, delete</button>
        </div>
      </div>
    </div>
  );
}

function CatalogCard({ userId, book, onSelect, onDelete }) {
  const [date, setDate] = useState(null);
  const [readStatus, setReadStatus] = useState("to-read");
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    <>
      <div style={{ position: "relative" }}>
        {/* Tab */}
        <span style={{ position: "absolute", top: 0, left: 16, width: 110, height: 26, background: BRAND.card, border: `1px solid ${BRAND.cardEdge}`, borderBottom: "none", borderRadius: "5px 5px 0 0", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          <span style={{ fontFamily: FONT.type, fontSize: 10, color: BRAND.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 94 }}>{book.title}</span>
        </span>
        <button onClick={() => onSelect(book.id)} style={{ position: "relative", display: "flex", gap: 16, textAlign: "left", cursor: "pointer", width: "100%", background: BRAND.card, color: BRAND.ink, border: `1px solid ${BRAND.cardEdge}`, borderRadius: "0 0 3px 3px", marginTop: 26, padding: "16px 18px", boxShadow: "0 4px 12px rgba(20,30,50,.10)", transition: "transform .22s,box-shadow .22s" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(20,30,50,.16)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(20,30,50,.10)"; }}>
          <span style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 4, background: book.accent, borderRadius: "3px 0 0 3px" }} />
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
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontFamily: FONT.type, fontSize: 9.5, color: BRAND.muted }}>{book.year}{book.pages ? ` · ${book.pages} pp` : ""}</span>
                {book.shared && <span style={{ fontFamily: FONT.body, fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: BRAND.terracotta, background: "rgba(191,117,90,.12)", border: "1px solid rgba(191,117,90,.3)", borderRadius: 3, padding: "1px 6px" }}>Shared</span>}
              </div>
              <span style={{ fontFamily: FONT.body, fontSize: 11.5, color: BRAND.coral }}>{date ? formatCatalogDate(date) : ""} Read card →</span>
            </div>
          </div>
        </button>
        {onDelete && (
          <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
            title="Delete book"
            style={{ position: "absolute", top: 32, right: 10, zIndex: 2, width: 30, height: 30, borderRadius: "50%", border: `1px solid ${BRAND.line2}`, background: BRAND.paper, color: BRAND.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "background .2s,color .2s,border-color .2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(242,92,92,.1)"; e.currentTarget.style.borderColor = "rgba(242,92,92,.4)"; e.currentTarget.style.color = BRAND.coral; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = BRAND.paper; e.currentTarget.style.borderColor = BRAND.line2; e.currentTarget.style.color = BRAND.muted; }}>
            🗑
          </button>
        )}
      </div>
      {confirmDelete && (
        <DeleteConfirmModal
          bookTitle={book.title}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => { setConfirmDelete(false); onDelete(book.id); }}
        />
      )}
    </>
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


function MyBooksHome({ userId, userAccent, staticBooks, onSelect, onBack, onLogout, onBooksChanged }) {
  const [userBooks, setUserBooks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(null); // bookId to confirm removal

  useEffect(() => {
    let active = true;
    loadBooks(userId).then((list) => { if (active) { setUserBooks(list); setLoaded(true); } });
    return () => { active = false; };
  }, [userId]);

  // Static books always shown; user books filtered to inMarginalia:true
  const userMarginalia = userBooks.filter((b) => b.inMarginalia);
  const staticIds = new Set(staticBooks.map((b) => b.id));
  const allBooks = [...staticBooks, ...userMarginalia.filter((b) => !staticIds.has(b.id))];

  // Remove from Marginalia view (toggle off) — data stays in unified store
  const handleRemoveFromMarginalia = async (bookId) => {
    const updated = userBooks.map((b) => b.id === bookId ? { ...b, inMarginalia: false } : b);
    await saveBooks(userId, updated);
    setUserBooks(updated);
    setRemoveConfirm(null);
    if (onBooksChanged) onBooksChanged();
  };

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
            {USERS[userId].name}'s Marginalia
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
            {allBooks.map((book) => (
              <CatalogCard key={book.id} userId={userId} book={book} onSelect={onSelect}
                onDelete={userMarginalia.some((b) => b.id === book.id) ? () => setRemoveConfirm(book.id) : undefined} />
            ))}
          </div>
        )}
      </div>

      {/* Remove from Marginalia confirmation */}
      {removeConfirm && (() => {
        const book = userBooks.find((b) => b.id === removeConfirm);
        return book ? (
          <div onClick={() => setRemoveConfirm(null)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(38,32,32,.68)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 6, width: "min(420px,100%)", boxShadow: "0 20px 50px rgba(20,30,50,.22)", animation: "cc-pop .22s cubic-bezier(.16,1,.3,1)" }}>
              <div style={{ background: BRAND.espresso, padding: "18px 24px 14px", borderRadius: "6px 6px 0 0" }}>
                <div style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: BRAND.tan, marginBottom: 4 }}>Remove from Marginalia</div>
                <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 18, color: BRAND.cream }}>{book.title}</div>
              </div>
              <div style={{ padding: "20px 24px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
                <p style={{ fontFamily: FONT.read, fontSize: 14, lineHeight: 1.6, color: BRAND.muted, margin: 0 }}>
                  This removes <em>{book.title}</em> from your Marginalia page. All your notes, highlights, and progress are <strong style={{ color: BRAND.ink }}>saved</strong> — the book stays in your Card Catalogue and can be re-added to Marginalia anytime.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setRemoveConfirm(null)} style={{ flex: 1, fontFamily: FONT.body, fontSize: 13, background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "11px", borderRadius: 3, cursor: "pointer" }}>Cancel</button>
                  <button onClick={() => handleRemoveFromMarginalia(removeConfirm)} style={{ flex: 2, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: BRAND.coral, border: "none", color: "#fff", padding: "11px", borderRadius: 3, cursor: "pointer" }}>Remove from Marginalia</button>
                </div>
              </div>
            </div>
          </div>
        ) : null;
      })()}
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

// ---------------------------------------------------------------------------
// CARD CATALOGUE BOOKSHELF — oak drawer cabinet design
// ---------------------------------------------------------------------------

const CC_DRAWER_STORE = (uid) => `marginalia_shelf_drawers_v1_${uid}`;
const CC_ASSIGN_STORE = (uid) => `marginalia_shelf_assign_v1_${uid}`;

const DEFAULT_DRAWERS = [
  { id: "reading", name: "Reading", removable: false },
  { id: "read",    name: "Read",    removable: false },
  { id: "want",    name: "Want to Read", removable: false },
  { id: "upnext",  name: "Up Next", removable: true },
  { id: "dnf",     name: "Did Not Finish", removable: true },
];

const STATUS_TO_DRAWER = { "reading": "reading", "read": "read", "to-read": "want", "up-next": "upnext", "did-not-finish": "dnf" };
const DRAWER_TO_STATUS = { "reading": "reading", "read": "read", "want": "to-read", "upnext": "up-next", "dnf": "did-not-finish" };

const SPINE_COLORS = ["#BF755A","#F25C5C","#2A201B","#D9A282","#9a6a3f","#6B4A3A","#3E7C57","#3a6ea5"];
function spineColor(book) { return book.accent || SPINE_COLORS[Math.abs((book.id||"").charCodeAt(0) + (book.id||"").charCodeAt(2||0)) % SPINE_COLORS.length]; }

const OAK_FACE = `linear-gradient(180deg,rgba(255,255,255,.12),rgba(0,0,0,.06) 38%,rgba(0,0,0,.22)),repeating-linear-gradient(92deg,#9a6232,#9a6232 3px,#945d30 3px,#945d30 7px,#a06a39 7px,#a06a39 11px),linear-gradient(180deg,#B07F49,#6E4422)`;
const BRASS_GRAD = `linear-gradient(180deg,#E8CF93,#C2A35E 55%,#8F7233)`;
const BRASS_GRAD_V = `linear-gradient(180deg,#E8CF93,#C2A35E 52%,#8F7233)`;
const BRASS_BORDER = `1px solid #6f5722`;

function BrassLabelHolder({ name, isEditing, draft, onInput, onKey, onCommit }) {
  return (
    <div style={{ position: "absolute", left: "50%", top: 30, transform: "translateX(-50%)", width: 132, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Brass frame */}
      <div style={{ width: 132, background: BRASS_GRAD_V, border: BRASS_BORDER, borderRadius: 3, padding: 4, boxShadow: "0 2px 3px rgba(0,0,0,.4),inset 0 1px 1px rgba(255,255,255,.55)" }}>
        {/* Cream paper label */}
        <div style={{ background: "#FBF6E8", border: "1px solid #ddceac", borderRadius: 1, minHeight: 42, display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 7px", boxShadow: "inset 0 1px 2px rgba(0,0,0,.14)" }}>
          {isEditing ? (
            <input autoFocus value={draft} onInput={onInput} onKeyDown={onKey} onBlur={onCommit} onClick={(e) => e.stopPropagation()} maxLength={22}
              style={{ width: "100%", border: "none", outline: "none", background: "#FFFCF2", textAlign: "center", fontFamily: FONT.type, fontSize: 13, color: "#2c2014", padding: "2px" }} />
          ) : (
            <span style={{ fontFamily: FONT.type, fontSize: 13, lineHeight: 1.18, letterSpacing: ".01em", color: "#2c2014", textAlign: "center", wordBreak: "break-word" }}>{name}</span>
          )}
        </div>
      </div>
      {/* T drop-pull */}
      <div style={{ width: 8, height: 13, background: `linear-gradient(180deg,#C2A35E,#8F7233)`, border: BRASS_BORDER, borderTop: "none" }} />
      <div style={{ width: 46, height: 11, borderRadius: "0 0 4px 4px", background: BRASS_GRAD, border: BRASS_BORDER, boxShadow: "0 2px 3px rgba(0,0,0,.4),inset 0 1px 1px rgba(255,255,255,.5)" }} />
      {/* Knob */}
      <div style={{ marginTop: 11, width: 19, height: 19, borderRadius: "50%", background: "radial-gradient(circle at 38% 30%,#E8CF93,#C2A35E 52%,#8F7233)", border: BRASS_BORDER, boxShadow: "0 2px 3px rgba(0,0,0,.45),inset 0 1px 1px rgba(255,255,255,.6)" }} />
    </div>
  );
}

function CatalogueDeleteModal({ book, onRemoveFromMarginalia, onDeleteAll, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(38,32,32,.68)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 6, width: "min(480px,100%)", boxShadow: "0 20px 50px rgba(20,30,50,.22)", animation: "cc-pop .22s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ background: BRAND.espresso, padding: "20px 26px 16px", borderRadius: "6px 6px 0 0", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(242,92,92,.2)", border: "1px solid rgba(242,92,92,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🗑</div>
          <div>
            <div style={{ fontFamily: FONT.body, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: BRAND.tan }}>Remove book</div>
            <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 19, color: BRAND.cream, lineHeight: 1.1, marginTop: 2 }}>{book.title}</div>
          </div>
        </div>
        <div style={{ padding: "22px 26px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
          {book.inMarginalia && (
            <button onClick={onRemoveFromMarginalia} style={{ textAlign: "left", background: BRAND.cream, border: `1px solid ${BRAND.line}`, borderRadius: 4, padding: "14px 16px", cursor: "pointer", display: "flex", gap: 13, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20, marginTop: 1 }}>📖</span>
              <div>
                <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 14, color: BRAND.ink, marginBottom: 3 }}>Remove from Marginalia only</div>
                <div style={{ fontFamily: FONT.read, fontSize: 13, lineHeight: 1.5, color: BRAND.muted }}>Hides this book from your Marginalia page. All your notes and progress are kept — you can re-add it to Marginalia anytime from the Card Catalogue.</div>
              </div>
            </button>
          )}
          <button onClick={onDeleteAll} style={{ textAlign: "left", background: "rgba(242,92,92,.05)", border: `1px solid rgba(242,92,92,.3)`, borderRadius: 4, padding: "14px 16px", cursor: "pointer", display: "flex", gap: 13, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, marginTop: 1 }}>🗑</span>
            <div>
              <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 14, color: BRAND.coral, marginBottom: 3 }}>Delete book entirely</div>
              <div style={{ fontFamily: FONT.read, fontSize: 13, lineHeight: 1.5, color: BRAND.muted }}>Permanently removes this book from the Card Catalogue and Marginalia, including all notes, progress, and quotes.</div>
            </div>
          </button>
          <button onClick={onCancel} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "11px", borderRadius: 3, cursor: "pointer", marginTop: 4 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function IndexCard({ book, delay, onOpen, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const [trashHovered, setTrashHovered] = useState(false);
  const tabTitle = book.title.length > 14 ? book.title.slice(0, 13) + "…" : book.title;
  const callNo = book.call || `${book.year || "????"} · ${(book.author || "").split(" ").pop().slice(0, 3).toUpperCase()}`;
  const summary = book.summary || book.tagline || null;
  return (
    <div style={{ flexShrink: 0, width: 220, position: "relative", animation: `cc-pop .4s cubic-bezier(.16,1,.3,1) ${delay}ms both` }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); setTrashHovered(false); }}>
      <div style={{ position: "relative", transition: "transform .26s cubic-bezier(.16,1,.3,1),box-shadow .26s cubic-bezier(.16,1,.3,1)", transform: hovered && !trashHovered ? "translateY(-8px)" : "none", boxShadow: hovered ? "0 16px 40px rgba(20,30,50,.16)" : "0 4px 12px rgba(20,30,50,.10)" }}>
        {/* Tab */}
        <div style={{ marginLeft: 18, width: 118, height: 26, background: "#F6EEDD", border: "1px solid #E2D4BC", borderBottom: "none", borderRadius: "5px 5px 0 0", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 8px", overflow: "hidden" }}>
          <span style={{ fontFamily: FONT.type, fontSize: 10, color: "#4a3a28", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tabTitle}</span>
        </div>
        {/* Card body — clickable to open */}
        <button onClick={onOpen} style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", border: "none", padding: 0, background: "transparent" }}>
          <div style={{ background: "#F6EEDD", border: "1px solid #E2D4BC", borderTop: "none", borderRadius: "0 0 3px 3px", padding: "14px 16px 12px" }}>
            <div style={{ fontFamily: FONT.type, fontSize: 10, letterSpacing: ".04em", color: BRAND.terracotta, borderBottom: "1px solid #C9B79A", paddingBottom: 8, marginBottom: 10 }}>{callNo}</div>
            <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 18, lineHeight: 1.1, color: BRAND.ink, marginBottom: 4 }}>{book.title}</div>
            <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 12.5, color: BRAND.muted, marginBottom: 9 }}>{book.author}</div>
            {summary ? (
              <div style={{ fontFamily: FONT.read, fontSize: 11.5, lineHeight: 1.5, color: "#5a4a38", marginBottom: 9, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{summary}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 9 }}>
                {[0.7, 0.5, 0.3].map((op, i) => <div key={i} style={{ height: 1, background: "#C9B79A", opacity: op }} />)}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: FONT.type, fontSize: 9.5, color: "#8a7a68" }}>{book.pages ? `${book.pages} pp` : ""}</span>
              <span style={{ fontFamily: FONT.body, fontSize: 11, color: BRAND.coral }}>Read card →</span>
            </div>
          </div>
        </button>
      </div>
      {/* Trash button — appears on hover */}
      {hovered && onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(book); }}
          onMouseEnter={() => setTrashHovered(true)}
          onMouseLeave={() => setTrashHovered(false)}
          title="Remove book"
          style={{ position: "absolute", top: 30, right: -10, width: 28, height: 28, borderRadius: "50%", border: `1px solid ${trashHovered ? "rgba(242,92,92,.5)" : "#E2D4BC"}`, background: trashHovered ? "rgba(242,92,92,.12)" : "#F6EEDD", color: trashHovered ? BRAND.coral : "#8a7a68", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, transition: "all .18s", boxShadow: "0 2px 6px rgba(20,30,50,.12)", zIndex: 3 }}>
          🗑
        </button>
      )}
    </div>
  );
}

function AddBookModal({ drawers, onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [summary, setSummary] = useState("");
  const [cover, setCover] = useState(null);
  const [year, setYear] = useState("");
  const [drawerId, setDrawerId] = useState(drawers[0]?.id || "want");
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchedPreview, setFetchedPreview] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [workId, setWorkId] = useState(null);

  const fetchBookInfo = async () => {
    if (!title.trim()) return;
    setFetching(true);
    setFetchError("");
    setFetchedPreview(null);
    try {
      const t = encodeURIComponent(title.trim());
      const a = encodeURIComponent(author.trim());

      // Run Open Library search and Google Books in parallel
      const [olRes, gbRes] = await Promise.allSettled([
        fetch(`https://openlibrary.org/search.json?title=${t}&author=${a}&limit=5&fields=key,title,author_name,number_of_pages_median,cover_i,first_publish_year`),
        fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(`${title.trim()} ${author.trim()}`)}&maxResults=5`),
      ]);

      // Parse Open Library
      let olDoc = null;
      if (olRes.status === "fulfilled" && olRes.value.ok) {
        const d = await olRes.value.json();
        olDoc = d.docs?.[0] || null;
      }

      // Parse Google Books
      let gbItem = null;
      if (gbRes.status === "fulfilled" && gbRes.value.ok) {
        const d = await gbRes.value.json();
        const items = d.items || [];
        const withDesc = items.filter((i) => i.volumeInfo?.description);
        gbItem = (withDesc[0] || items[0])?.volumeInfo || null;
      }

      if (!olDoc && !gbItem) {
        setFetchError("No results found — try adjusting the title or author spelling.");
        setFetching(false);
        return;
      }

      // Cover: prefer Google Books (higher quality), fall back to Open Library
      let foundCover = null;
      if (gbItem) {
        const thumb = gbItem.imageLinks?.thumbnail || gbItem.imageLinks?.smallThumbnail;
        if (thumb) foundCover = thumb.replace("http://", "https://");
      }
      if (!foundCover && olDoc?.cover_i) foundCover = `https://covers.openlibrary.org/b/id/${olDoc.cover_i}-M.jpg`;

      // Pages: prefer Google Books (more accurate editions)
      const foundPages = gbItem?.pageCount || olDoc?.number_of_pages_median || null;
      const foundYear = gbItem?.publishedDate?.slice(0, 4) || (olDoc?.first_publish_year ? String(olDoc.first_publish_year) : null);
      const foundAuthor = gbItem?.authors?.[0] || olDoc?.author_name?.[0] || null;
      const foundTitle = gbItem?.title || olDoc?.title || title.trim();

      // Description: prefer Google Books, fall back to Open Library work record
      let desc = "";
      if (gbItem?.description) {
        desc = gbItem.description.replace(/<[^>]+>/g, "").trim().slice(0, 600);
      }
      if (!desc && olDoc?.key) {
        try {
          const workRes = await fetch(`https://openlibrary.org${olDoc.key}.json`);
          const work = await workRes.json();
          const raw = typeof work.description === "string" ? work.description : work.description?.value || "";
          desc = raw.replace(/\[.*?\]/g, "").trim().slice(0, 600);
        } catch {}
      }

      const foundWorkId = olDoc?.key || null;
      if (desc) setSummary(desc);
      if (foundPages) setPages(String(foundPages));
      if (foundAuthor) setAuthor(foundAuthor);
      if (foundTitle) setTitle(foundTitle);
      if (foundYear) setYear(foundYear);
      if (foundCover) setCover(foundCover);
      if (foundWorkId) setWorkId(foundWorkId);
      setFetchedPreview({ title: foundTitle, author: foundAuthor, cover: foundCover, desc, pages: foundPages });
    } catch (err) {
      setFetchError("Lookup failed. Check your connection and try again.");
    }
    setFetching(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    if (!author.trim()) { setError("Author is required."); return; }
    // Auto-fetch if both summary and pages are still empty
    let finalSummary = summary.trim() || null;
    let finalPages = pages ? parseInt(pages, 10) : null;
    let finalCover = cover;
    let finalYear = year;
    if (!finalSummary || !finalPages || !finalCover) {
      setFetching(true);
      try {
        const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title.trim())}&author=${encodeURIComponent(author.trim())}&limit=3&fields=key,author_name,number_of_pages_median,cover_i,first_publish_year`;
        const res = await fetch(searchUrl);
        const data = await res.json();
        const doc = data.docs?.[0];
        if (doc) {
          if (!finalCover && doc.cover_i) finalCover = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
          if (!finalPages && doc.number_of_pages_median) finalPages = doc.number_of_pages_median;
          if (!finalYear && doc.first_publish_year) finalYear = String(doc.first_publish_year);
          if (!finalSummary && doc.key) {
            try {
              const workRes = await fetch(`https://openlibrary.org${doc.key}.json`);
              const work = await workRes.json();
              const raw = typeof work.description === "string" ? work.description : work.description?.value || "";
              if (raw) finalSummary = raw.replace(/\[.*?\]/g, "").trim().slice(0, 600);
            } catch {}
          }
        }
      } catch {}
      setFetching(false);
    }
    onAdd({ title: title.trim(), author: author.trim(), pages: finalPages, summary: finalSummary, cover: finalCover, year: finalYear, drawerId, workId: workId || null });
  };

  const inputStyle = { width: "100%", fontFamily: FONT.body, fontSize: 14, color: BRAND.ink, background: BRAND.cream, border: `1px solid ${BRAND.line2}`, borderRadius: 3, padding: "10px 12px", outline: "none", boxSizing: "border-box" };
  const labelStyle = { fontFamily: FONT.body, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: BRAND.muted, display: "block", marginBottom: 6 };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(38,32,32,.68)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 6, width: "min(500px,100%)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(20,30,50,.22)", animation: "cc-pop .24s cubic-bezier(.16,1,.3,1)" }}>
        {/* Header */}
        <div style={{ background: BRAND.espresso, padding: "22px 26px 18px", borderRadius: "6px 6px 0 0" }}>
          <div style={{ fontFamily: FONT.body, fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: BRAND.tan, marginBottom: 6 }}>Card Catalogue</div>
          <h2 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 26, color: BRAND.cream, margin: 0, lineHeight: 1.1 }}>Add a new book</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "24px 26px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Book title *</label>
            <input value={title} onChange={(e) => { setTitle(e.target.value); setFetchedPreview(null); }} placeholder="e.g. The Midnight Library" style={inputStyle} autoFocus />
          </div>
          <div>
            <label style={labelStyle}>Author *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={author} onChange={(e) => { setAuthor(e.target.value); setFetchedPreview(null); }} placeholder="e.g. Matt Haig" style={{ ...inputStyle, flex: 1 }} />
              <button type="button" onClick={fetchBookInfo} disabled={!title.trim() || !author.trim() || fetching}
                style={{ flexShrink: 0, fontFamily: FONT.body, fontSize: 12, letterSpacing: ".04em", background: BRAND.espresso, border: "none", color: BRAND.cream, padding: "10px 14px", borderRadius: 3, cursor: title.trim() && author.trim() && !fetching ? "pointer" : "not-allowed", opacity: title.trim() && author.trim() && !fetching ? 1 : 0.5, whiteSpace: "nowrap" }}>
                {fetching ? "Looking up…" : "🔍 Look up"}
              </button>
            </div>
          </div>
          {/* Fetch error */}
          {fetchError && (
            <div style={{ fontFamily: FONT.body, fontSize: 13, color: BRAND.coral, background: "rgba(242,92,92,.08)", border: "1px solid rgba(242,92,92,.25)", borderRadius: 4, padding: "10px 14px" }}>{fetchError}</div>
          )}
          {/* Card preview after lookup */}
          {fetchedPreview && (
            <div style={{ background: BRAND.cream, border: `1px solid ${BRAND.line}`, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderBottom: (fetchedPreview.desc || fetchedPreview.pages) ? `1px solid ${BRAND.line}` : "none" }}>
                {fetchedPreview.cover && (
                  <img src={fetchedPreview.cover} alt="" style={{ width: 44, height: 64, objectFit: "cover", borderRadius: 2, boxShadow: "0 2px 6px rgba(0,0,0,.15)", flexShrink: 0 }} onError={(e) => e.target.style.display = "none"} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 15, color: BRAND.ink, lineHeight: 1.2 }}>{fetchedPreview.title}</div>
                  <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13, color: BRAND.muted, marginTop: 3 }}>{fetchedPreview.author}</div>
                  <div style={{ fontFamily: FONT.body, fontSize: 11, color: BRAND.terracotta, marginTop: 4 }}>✓ Info pulled from Google Books</div>
                </div>
              </div>
              {(fetchedPreview.desc || fetchedPreview.pages) && (
                <div style={{ padding: "10px 14px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {fetchedPreview.desc && (
                    <p style={{ fontFamily: FONT.read, fontSize: 13, lineHeight: 1.55, color: BRAND.ink, margin: 0, display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{fetchedPreview.desc}</p>
                  )}
                  {fetchedPreview.pages && (
                    <div style={{ fontFamily: FONT.type, fontSize: 11, color: BRAND.muted }}>{fetchedPreview.pages} pages</div>
                  )}
                </div>
              )}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Pages</label>
              <input type="number" min="1" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 304" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>File in drawer</label>
              <select value={drawerId} onChange={(e) => setDrawerId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {drawers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Short summary <span style={{ textTransform: "none", letterSpacing: 0, opacity: .6 }}>(optional)</span></label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A brief description of the book — appears on the index card." rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }} />
          </div>
          {error && <div style={{ fontFamily: FONT.body, fontSize: 13, color: BRAND.coral }}>{error}</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "12px", borderRadius: 3, cursor: "pointer" }}>Cancel</button>
            <button type="submit" style={{ flex: 2, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".06em", textTransform: "uppercase", background: BRAND.coral, border: "none", color: "#fff", padding: "12px", borderRadius: 3, cursor: "pointer", fontWeight: 500 }}>Add book to catalogue</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BookModal({ userId, book, drawers, currentDrawer, onMove, onClose, onToggleMarginalia, onBooksChanged }) {
  const spine = spineColor(book);
  const callNo = book.call || `${book.year || "????"} · ${(book.author || "").split(" ").pop().slice(0, 3).toUpperCase()}`;
  const readHours = estimateReadTime(book.pages);
  const [coverFailed, setCoverFailed] = useState(false);
  const showCover = book.cover && !coverFailed;

  // Reading tracker state
  const [prog, setProg] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [projEndDate, setProjEndDate] = useState("");
  const [finishedDate, setFinishedDate] = useState("");
  const [trackerSaved, setTrackerSaved] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadProgress(userId, book.id).then((p) => {
      setProg(p);
      setStartDate(p?.startDate || "");
      setProjEndDate(p?.finishDate || "");
      setFinishedDate(p?.dateFinished || "");
      if (p?.tracking === true) setTrackerSaved(true);
    });
  }, [userId, book.id]);

  const handleAddToTracker = async () => {
    const next = { ...(prog || {}), tracking: true, pagesRead: prog?.pagesRead || 0, startDate, finishDate: projEndDate };
    await saveProgress(userId, book.id, next);
    setProg(next);
    setTrackerSaved(true);
    // Move to Reading drawer if not already there
    if (currentDrawer !== "reading") onMove("reading");
    if (onBooksChanged) onBooksChanged();
  };

  const handleFinishedDate = async (date) => {
    setFinishedDate(date);
    if (!date) return;
    const next = { ...(prog || {}), dateFinished: date, tracking: false };
    await saveProgress(userId, book.id, next);
    setProg(next);
    await saveStatus(userId, book.id, "read");
    onMove("read");
    if (onBooksChanged) onBooksChanged();
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(38,32,32,.62)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "cc-fade .2s cubic-bezier(.16,1,.3,1)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "min(820px,100%)", maxHeight: "88vh", overflowY: "auto", display: "grid", gridTemplateColumns: "min(280px,40%) 1fr", background: BRAND.paper, borderRadius: 6, border: `1px solid ${BRAND.line}`, boxShadow: "0 16px 40px rgba(20,30,50,.16)", animation: "cc-pop .26s cubic-bezier(.16,1,.3,1)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, zIndex: 2, width: 34, height: 34, borderRadius: "50%", border: `1px solid ${BRAND.line2}`, background: BRAND.paper, color: BRAND.ink, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        {/* Left — espresso cover */}
        <div style={{ background: BRAND.espresso, padding: "34px 28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
          {showCover ? (
            <img src={book.cover} alt={book.title} style={{ width: 140, height: 204, objectFit: "cover", borderRadius: "3px 5px 5px 3px", boxShadow: "inset -10px 0 0 rgba(0,0,0,.18),0 8px 28px rgba(0,0,0,.45)" }} onError={() => setCoverFailed(true)} />
          ) : (
            <div style={{ position: "relative", width: 148, height: 216, borderRadius: "3px 5px 5px 3px", background: spine, boxShadow: "inset -12px 0 0 rgba(0,0,0,.18),0 16px 40px rgba(20,30,50,.16)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "20px 18px 20px 26px" }}>
              <span style={{ position: "absolute", left: 13, top: 14, bottom: 14, width: 1.5, background: "rgba(255,255,255,.28)", display: "block" }} />
              <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 19, lineHeight: 1.08, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,.3)" }}>{book.title}</div>
              <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 12, color: "rgba(255,255,255,.82)", marginTop: 8 }}>{book.author}</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 14, fontFamily: FONT.body, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(242,239,235,.7)" }}>
            {book.year && <span>{book.year}</span>}
            {book.year && book.pages && <span style={{ opacity: .4 }}>·</span>}
            {book.pages && <span>{book.pages} pp</span>}
            {readHours && <><span style={{ opacity: .4 }}>·</span><span>~{readHours}h</span></>}
          </div>
        </div>
        {/* Right — paper details */}
        <div style={{ padding: "34px 32px 28px" }}>
          <div style={{ fontFamily: FONT.type, fontSize: 10, letterSpacing: ".06em", color: BRAND.terracotta, borderBottom: `1px solid ${BRAND.line}`, paddingBottom: 9, marginBottom: 16 }}>{callNo}</div>
          <h2 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 30, lineHeight: 1.05, color: BRAND.ink, margin: "0 0 4px" }}>{book.title}</h2>
          {book.subtitle && <div style={{ fontFamily: FONT.read, fontSize: 14, color: BRAND.muted, marginBottom: 4 }}>{book.subtitle}</div>}
          <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 15, color: BRAND.muted, marginBottom: 18 }}>by {book.author}</div>
          {(book.tagline || book.summary) && (
            <p style={{ fontFamily: FONT.read, fontSize: 15, lineHeight: 1.65, color: BRAND.ink, margin: "0 0 24px" }}>{book.tagline || book.summary}</p>
          )}
          <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: 11 }}>File in a drawer</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {drawers.map((dr) => {
              const active = currentDrawer === dr.id;
              return (
                <button key={dr.id} onClick={() => onMove(dr.id)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".03em", cursor: "pointer", padding: "10px 15px", borderRadius: 2, border: active ? `1px solid ${BRAND.coral}` : `1px solid ${BRAND.line2}`, background: active ? BRAND.coral : "transparent", color: active ? "#fff" : BRAND.muted, transition: "all .2s" }}>
                  <span>{active ? "✓" : "+"}</span>{dr.name}
                </button>
              );
            })}
          </div>
          {currentDrawer && (
            <div style={{ marginTop: 16, fontFamily: FONT.read, fontStyle: "italic", fontSize: 13.5, color: BRAND.muted }}>
              Filed in the "{drawers.find((d) => d.id === currentDrawer)?.name}" drawer.
            </div>
          )}
          {/* Reading Dates & Tracker */}
          {userId && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${BRAND.line}` }}>
              <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: 14 }}>Reading Dates</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <span style={{ fontFamily: FONT.body, fontSize: 11.5, color: BRAND.muted }}>Start date</span>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    style={{ fontFamily: FONT.body, fontSize: 13, background: BRAND.cream, border: `1px solid ${BRAND.line2}`, color: BRAND.ink, padding: "8px 10px", borderRadius: 3, outline: "none" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <span style={{ fontFamily: FONT.body, fontSize: 11.5, color: BRAND.muted }}>Projected end</span>
                  <input type="date" value={projEndDate} onChange={(e) => setProjEndDate(e.target.value)}
                    style={{ fontFamily: FONT.body, fontSize: 13, background: BRAND.cream, border: `1px solid ${BRAND.line2}`, color: BRAND.ink, padding: "8px 10px", borderRadius: 3, outline: "none" }} />
                </label>
              </div>
              {trackerSaved ? (
                <div style={{ fontFamily: FONT.body, fontSize: 13, color: BRAND.terracotta, background: "rgba(191,117,90,.08)", border: `1px solid rgba(191,117,90,.3)`, borderRadius: 3, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  ✓ On your reading tracker
                </div>
              ) : (
                <button onClick={handleAddToTracker} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: ".03em", background: BRAND.espresso, border: "none", color: BRAND.cream, padding: "11px 18px", borderRadius: 3, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15 }}>📌</span> Add to Book Tracker
                </button>
              )}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${BRAND.line}` }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <span style={{ fontFamily: FONT.body, fontSize: 11.5, color: BRAND.muted }}>Finished date <span style={{ fontStyle: "italic", opacity: .7 }}>— fills in when you complete the book</span></span>
                  <input type="date" value={finishedDate} onChange={(e) => handleFinishedDate(e.target.value)}
                    style={{ fontFamily: FONT.body, fontSize: 13, background: BRAND.cream, border: `1px solid ${BRAND.line2}`, color: BRAND.ink, padding: "8px 10px", borderRadius: 3, outline: "none", maxWidth: 200 }} />
                </label>
                {finishedDate && (
                  <div style={{ marginTop: 8, fontFamily: FONT.read, fontStyle: "italic", fontSize: 13, color: BRAND.terracotta }}>
                    Moved to your Read drawer ✓
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Marginalia toggle */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${BRAND.line}` }}>
            <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: BRAND.muted, marginBottom: 11 }}>Marginalia</div>
            {book.inMarginalia ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "rgba(191,117,90,.08)", border: `1px solid rgba(191,117,90,.3)`, borderRadius: 4, padding: "12px 14px" }}>
                <div style={{ fontFamily: FONT.read, fontSize: 14, color: BRAND.terracotta }}>✓ In your Marginalia</div>
                <button onClick={onToggleMarginalia} style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: ".04em", background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "6px 12px", borderRadius: 3, cursor: "pointer", whiteSpace: "nowrap" }}>Remove</button>
              </div>
            ) : (
              <>
                <p style={{ fontFamily: FONT.read, fontSize: 13.5, lineHeight: 1.55, color: BRAND.muted, margin: "0 0 12px" }}>
                  Add this book to your Marginalia page to track notes, highlights, and reading progress.
                </p>
                <button onClick={onToggleMarginalia} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: BRAND.espresso, border: "none", color: BRAND.cream, padding: "11px 20px", borderRadius: 3, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15 }}>📖</span> Add to Marginalia
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bookshelf({ userId, userAccent, onBack, onLogout, onBooksChanged, inline = false }) {
  const [allBooks, setAllBooks] = useState([]);
  const [drawers, setDrawers] = useState(() => {
    try { const s = localStorage.getItem(CC_DRAWER_STORE(userId)); return s ? JSON.parse(s) : DEFAULT_DRAWERS; } catch { return DEFAULT_DRAWERS; }
  });
  const [openDrawer, setOpenDrawer] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [hoveredDrawer, setHoveredDrawer] = useState(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load all user-added books from unified store
  useEffect(() => {
    let active = true;
    loadBooks(userId).then((list) => {
      if (!active) return;
      // Migrate drawer assignments from old localStorage if needed
      const oldAssign = (() => { try { const r = localStorage.getItem(CC_ASSIGN_STORE(userId)); return r ? JSON.parse(r) : {}; } catch { return {}; } })();
      const migrated = list.map((b) => ({
        ...b,
        drawerId: b.drawerId || oldAssign[b.id] || "want",
      }));
      setAllBooks(migrated);
      setLoaded(true);
    });
    return () => { active = false; };
  }, [userId]);

  const persistDrawers = (nextDrawers) => {
    try { localStorage.setItem(CC_DRAWER_STORE(userId), JSON.stringify(nextDrawers)); } catch {}
  };

  const updateBooks = async (updated) => {
    setAllBooks(updated);
    await saveBooks(userId, updated);
    if (onBooksChanged) onBooksChanged();
  };

  const moveBook = async (book, drawerId) => {
    const updated = allBooks.map((b) => b.id === book.id ? { ...b, drawerId } : b);
    await updateBooks(updated);
    setSelectedBook((prev) => prev?.id === book.id ? { ...prev, drawerId } : prev);
    await saveStatus(userId, book.id, DRAWER_TO_STATUS[drawerId] || "to-read");
  };

  const toggleDrawer = (id) => {
    if (editing) { commitEdit(); return; }
    setOpenDrawer((prev) => (prev === id ? null : id));
  };

  const startEdit = (e, id, name) => { e.stopPropagation(); setEditing(id); setDraft(name); };
  const commitEdit = () => {
    if (!editing) return;
    const name = draft.trim() || "Untitled";
    const next = drawers.map((d) => d.id === editing ? { ...d, name } : d);
    setDrawers(next);
    persistDrawers(next);
    setEditing(null); setDraft("");
  };

  const addDrawer = () => {
    const id = "d" + Date.now();
    const next = [...drawers, { id, name: "New Shelf", removable: true }];
    setDrawers(next);
    persistDrawers(next);
    setEditing(id); setDraft("New Shelf");
  };

  const removeDrawer = (e, id) => {
    e.stopPropagation();
    if (drawers.length <= 1) return;
    const nextDrawers = drawers.filter((d) => d.id !== id);
    const fallback = nextDrawers[0].id;
    const updated = allBooks.map((b) => b.drawerId === id ? { ...b, drawerId: fallback } : b);
    setDrawers(nextDrawers);
    persistDrawers(nextDrawers);
    updateBooks(updated);
    if (openDrawer === id) setOpenDrawer(null);
  };

  const handleAddBook = async ({ title, author, pages, summary, cover, year, drawerId, workId }) => {
    const id = `book-${userId}-${Date.now().toString(36)}`;
    const targetDrawer = drawerId || openDrawer || "want";
    const newBook = { id, title, author, pages: pages || null, summary: summary || null, cover: cover || null, year: year || null, accent: userAccent, drawerId: targetDrawer, inMarginalia: false, shared: false, workId: workId || null, nodes: [], theme: null };
    const updated = [...allBooks, newBook];
    await updateBooks(updated);
    await saveStatus(userId, id, DRAWER_TO_STATUS[targetDrawer] || "to-read");
    setShowAddBook(false);
    setOpenDrawer(targetDrawer);
  };

  const handleToggleMarginalia = async (book) => {
    const updated = allBooks.map((b) => b.id === book.id ? { ...b, inMarginalia: !b.inMarginalia } : b);
    await updateBooks(updated);
    // Update selectedBook so the modal reflects the change immediately
    setSelectedBook((prev) => prev?.id === book.id ? { ...prev, inMarginalia: !prev.inMarginalia } : prev);
  };

  const handleRemoveFromMarginalia = async (book) => {
    const updated = allBooks.map((b) => b.id === book.id ? { ...b, inMarginalia: false } : b);
    await updateBooks(updated);
    setDeleteTarget(null);
  };

  const handleDeleteBook = async (book) => {
    const updated = allBooks.filter((b) => b.id !== book.id);
    await updateBooks(updated);
    await Promise.all([
      storage.delete(`${userId}:progress:${book.id}`),
      storage.delete(`${userId}:status:${book.id}`),
      storage.delete(`${userId}:dateAdded:${book.id}`),
    ]);
    setDeleteTarget(null);
  };

  const booksInDrawer = (id) => allBooks.filter((b) => (b.drawerId || "want") === id);
  const openBooks = openDrawer ? booksInDrawer(openDrawer) : [];
  const openDrawerName = drawers.find((d) => d.id === openDrawer)?.name || "";

  return (
    <div style={{ background: BRAND.cream, overflowX: "hidden", ...(inline ? {} : { minHeight: "100vh" }) }}>
      {/* Header — standalone page only */}
      {!inline && (
        <div style={{ background: BRAND.espresso, borderBottom: "1px solid rgba(217,162,130,.18)", padding: "clamp(24px,4vw,44px) 28px clamp(20px,3vw,32px)" }}>
          <div style={{ maxWidth: 1040, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <button onClick={onBack} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: "none", border: "1px solid rgba(242,239,235,.3)", color: "rgba(242,239,235,.7)", padding: "8px 14px", borderRadius: 2, cursor: "pointer" }}>← Back</button>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowAddBook(true)} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", textTransform: "uppercase", background: BRAND.coral, border: `1px solid ${BRAND.coral}`, color: "#fff", padding: "8px 16px", borderRadius: 2, cursor: "pointer" }}>+ Add book</button>
                <button onClick={onLogout} style={{ fontFamily: FONT.body, fontSize: 13, color: "rgba(242,239,235,.45)", background: "none", border: "none", cursor: "pointer" }}>Sign out</button>
              </div>
            </div>
            <div style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: ".28em", textTransform: "uppercase", color: BRAND.tan, marginBottom: 10 }}>The card catalogue</div>
            <h1 style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: "clamp(30px,4.5vw,52px)", lineHeight: 1.03, letterSpacing: "-.01em", color: BRAND.cream, margin: "0 0 10px" }}>
              Pull a drawer. Find a book. <span style={{ fontStyle: "italic", color: BRAND.coral }}>Open the card.</span>
            </h1>
            <p style={{ fontFamily: FONT.read, fontSize: "clamp(14px,1.2vw,16px)", lineHeight: 1.6, color: "rgba(242,239,235,.62)", margin: 0 }}>Your shelves, filed the old-fashioned way.</p>
          </div>
        </div>
      )}

      {/* Add book modal */}
      {showAddBook && <AddBookModal drawers={drawers} onAdd={handleAddBook} onClose={() => setShowAddBook(false)} />}

      {/* Book card modal */}
      {selectedBook && (
        <BookModal
          userId={userId}
          book={allBooks.find((b) => b.id === selectedBook.id) || selectedBook}
          drawers={drawers}
          currentDrawer={(allBooks.find((b) => b.id === selectedBook.id) || selectedBook).drawerId || "want"}
          onMove={(drawerId) => moveBook(selectedBook, drawerId)}
          onClose={() => setSelectedBook(null)}
          onToggleMarginalia={() => handleToggleMarginalia(selectedBook)}
          onBooksChanged={onBooksChanged}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <CatalogueDeleteModal
          book={deleteTarget}
          onRemoveFromMarginalia={() => handleRemoveFromMarginalia(deleteTarget)}
          onDeleteAll={() => handleDeleteBook(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Cabinet */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "clamp(16px,2.5vw,28px) 28px clamp(48px,7vw,80px)" }}>
        {!loaded ? (
          <div style={{ textAlign: "center", padding: "60px 0", fontFamily: FONT.read, fontStyle: "italic", color: BRAND.muted }}>Loading your catalogue…</div>
        ) : (
          <>
            {/* Oak cabinet frame */}
            <div style={{ padding: 14, borderRadius: 5, background: "linear-gradient(180deg,#6E4422,#4A2C16)", boxShadow: "0 16px 40px rgba(20,30,50,.16),inset 0 1px 0 rgba(255,255,255,.14)", border: "2px solid #3a230f" }}>
              {/* Add Book nameplate button */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                <button onClick={() => setShowAddBook(true)} style={{ background: BRASS_GRAD, border: BRASS_BORDER, borderRadius: 2, padding: "5px 22px", boxShadow: "0 1px 2px rgba(0,0,0,.4),inset 0 1px 1px rgba(255,255,255,.5)", fontFamily: FONT.body, fontSize: 11, letterSpacing: ".34em", textTransform: "uppercase", color: "#3a2c12", cursor: "pointer", transition: "filter .18s", outline: "none" }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.filter = ""}>
                  + Add a Book
                </button>
              </div>

              {/* Drawer grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,160px),1fr))", gap: 9 }}>
                {drawers.map((dr) => {
                  const count = booksInDrawer(dr.id).length;
                  const isOpen = openDrawer === dr.id;
                  const isHovered = hoveredDrawer === dr.id;
                  const isEditingThis = editing === dr.id;
                  return (
                    <div key={dr.id} onClick={() => toggleDrawer(dr.id)}
                      onMouseEnter={() => setHoveredDrawer(dr.id)}
                      onMouseLeave={() => setHoveredDrawer(null)}
                      style={{ position: "relative", height: 166, cursor: "pointer", borderRadius: 3, border: "1px solid #4A2C16", background: OAK_FACE, boxShadow: isOpen ? "inset 0 3px 6px rgba(0,0,0,.35),0 1px 2px rgba(0,0,0,.3)" : "0 2px 4px rgba(0,0,0,.3)", transform: isHovered && !isOpen ? "translateY(2px)" : isOpen ? "translateY(3px)" : "none", transition: "transform .26s cubic-bezier(.16,1,.3,1),box-shadow .26s cubic-bezier(.16,1,.3,1)" }}>
                      {/* Tool buttons — show on hover */}
                      {isHovered && (
                        <>
                          <button onClick={(e) => startEdit(e, dr.id, dr.name)} aria-label="Rename"
                            style={{ position: "absolute", top: 8, right: 8, zIndex: 3, width: 24, height: 24, borderRadius: "50%", border: BRASS_BORDER, cursor: "pointer", background: BRASS_GRAD, color: "#3a2c12", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(0,0,0,.4)" }}>✎</button>
                          {dr.removable && drawers.length > 1 && (
                            <button onClick={(e) => removeDrawer(e, dr.id)} aria-label="Remove"
                              style={{ position: "absolute", top: 8, left: 8, zIndex: 3, width: 24, height: 24, borderRadius: "50%", border: "1px solid #6f3030", cursor: "pointer", background: "rgba(38,32,32,.6)", color: BRAND.cream, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(0,0,0,.4)" }}>✕</button>
                          )}
                        </>
                      )}
                      {/* Brass label */}
                      <BrassLabelHolder name={dr.name} isEditing={isEditingThis} draft={draft}
                        onInput={(e) => setDraft(e.target.value)}
                        onKey={(e) => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") { setEditing(null); setDraft(""); } }}
                        onCommit={commitEdit} />
                      {/* Count label */}
                      <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, textAlign: "center", fontFamily: FONT.body, fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(251,246,232,.82)", textShadow: "0 1px 1px rgba(0,0,0,.4)" }}>
                        {count} {count === 1 ? "card" : "cards"} · {isOpen ? "Open" : "Pull"}
                      </div>
                    </div>
                  );
                })}

                {/* Add drawer slot */}
                <button onClick={addDrawer}
                  style={{ height: 166, cursor: "pointer", borderRadius: 3, border: "2px dashed rgba(251,246,232,.4)", background: "rgba(0,0,0,.18)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "rgba(251,246,232,.78)" }}>
                  <span style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${BRAND.brass}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#E8CF93" }}>+</span>
                  <span style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" }}>Add a drawer</span>
                </button>
              </div>
            </div>

            {/* Open drawer tray */}
            {openDrawer && (
              <div style={{ marginTop: 16, borderRadius: 5, overflow: "hidden", border: "1px solid #4A2C16", boxShadow: "0 16px 40px rgba(20,30,50,.16)", animation: "cc-tray .32s cubic-bezier(.16,1,.3,1)" }}>
                {/* Tray header */}
                <div style={{ background: "linear-gradient(180deg,#B07F49,#6E4422)", padding: "15px 22px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottom: "2px solid rgba(0,0,0,.4)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                    <span style={{ width: 15, height: 15, borderRadius: "50%", background: "radial-gradient(circle at 38% 30%,#E8CF93,#C2A35E)", border: BRASS_BORDER, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontFamily: FONT.body, fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(251,246,232,.72)" }}>Drawer</div>
                      <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 22, color: "#FBF6E8", lineHeight: 1.05 }}>{openDrawerName}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setShowAddBook(true)}
                      style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", background: BRAND.coral, color: "#fff", border: "none", cursor: "pointer", padding: "9px 16px", borderRadius: 2 }}>
                      + Add Book
                    </button>
                    <button onClick={() => setOpenDrawer(null)}
                      style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", background: "rgba(0,0,0,.28)", color: "#FBF6E8", border: "1px solid rgba(251,246,232,.32)", cursor: "pointer", padding: "9px 16px", borderRadius: 2 }}>
                      Close ✕
                    </button>
                  </div>
                </div>
                {/* Felt rail */}
                <div style={{ background: "repeating-linear-gradient(90deg,#3a2618,#3a2618 2px,#412b1b 2px,#412b1b 22px)", padding: "30px 26px 34px" }}>
                  {openBooks.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "26px 10px", fontFamily: FONT.read, fontStyle: "italic", fontSize: 17, color: "rgba(251,246,232,.7)" }}>
                      This drawer is empty. File a book card here to fill it.
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, alignItems: "stretch" }}>
                        {openBooks.map((book, i) => (
                          <IndexCard key={book.id} book={book} delay={i * 50} onOpen={() => setSelectedBook(book)} onDelete={(b) => setDeleteTarget(b)} />
                        ))}
                      </div>
                      <div style={{ fontFamily: FONT.body, fontSize: 11.5, letterSpacing: ".06em", color: "rgba(251,246,232,.55)", marginTop: 16, textAlign: "center" }}>
                        Scroll the rail · tap a card to open it
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {!openDrawer && (
              <div style={{ marginTop: 24, textAlign: "center", fontFamily: FONT.read, fontStyle: "italic", fontSize: 17, color: BRAND.muted }}>
                Select a drawer above to slide it open · hover a drawer to rename it.
              </div>
            )}
          </>
        )}
      </section>

      {/* Marquee band */}
      <div style={{ background: BRAND.ink, overflow: "hidden", whiteSpace: "nowrap", padding: "16px 0", borderTop: `1px solid ${BRAND.espresso2}` }}>
        <div style={{ display: "flex", width: "max-content", animation: "mg-marquee 32s linear infinite" }}>
          {[0, 1].map((k) => (
            <span key={k} style={{ display: "flex", alignItems: "center", gap: 28, paddingRight: 28, fontFamily: FONT.display, fontStyle: "italic", fontWeight: 500, fontSize: "clamp(22px,3vw,38px)", color: BRAND.cream }}>
              <span>File it</span><span style={{ color: BRAND.coral, fontStyle: "normal" }}>✦</span>
              <span style={{ color: BRAND.tan }}>Find it</span><span style={{ color: BRAND.coral, fontStyle: "normal" }}>✦</span>
              <span>Keep it forever</span><span style={{ color: BRAND.coral, fontStyle: "normal" }}>✦</span>
            </span>
          ))}
        </div>
      </div>

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
        <div style={{ fontFamily: FONT.type, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.tan }}>Book Brain Chat</div>
        <TooltipIcon text={tooltipText} color={BRAND.tan} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          {/* Filter buttons */}
          {participants.map((p) => {
            const unread = p.id ? unreadFrom(p.id) : (friends || []).reduce((n, f) => n + unreadFrom(f.id), 0);
            const active = filter === p.id;
            return (
              <button key={p.id || "all"} onClick={() => { setFilter(p.id); if (!collapsed) markRead(); }}
                style={{ position: "relative", fontFamily: FONT.type, fontSize: "0.55rem", letterSpacing: "0.06em", textTransform: "uppercase", background: active ? `${p.accent}44` : `${p.accent}22`, color: p.accent, padding: "0.2rem 0.55rem", borderRadius: 20, border: `1px solid ${active ? p.accent : "transparent"}`, cursor: "pointer" }}>
                {p.name}
                {unread > 0 && (
                  <span style={{ position: "absolute", top: -5, right: -5, background: BRAND.coral, color: BRAND.cream, borderRadius: "50%", width: 14, height: 14, fontSize: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{unread > 9 ? "9+" : unread}</span>
                )}
              </button>
            );
          })}
          {/* Collapse toggle */}
          <button onClick={() => { setCollapsed((c) => !c); if (collapsed) markRead(); }}
            style={{ background: "none", border: `1px solid ${BRAND.cream}22`, color: `${BRAND.cream}55`, borderRadius: 20, padding: "0.2rem 0.55rem", cursor: "pointer", fontFamily: FONT.type, fontSize: "0.55rem" }}>
            {collapsed ? "▼ Open" : "▲ Close"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div ref={scrollRef} onClick={markRead} style={{ height: 260, overflowY: "auto", padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {!loaded ? (
              <div style={{ fontFamily: FONT.type, fontSize: "0.75rem", color: `${BRAND.cream}44` }}>Loading…</div>
            ) : visibleMessages.length === 0 ? (
              <div style={{ fontFamily: FONT.body, fontSize: "0.84rem", color: `${BRAND.cream}33`, fontStyle: "italic", textAlign: "center", marginTop: "2rem" }}>No messages yet — say hello!</div>
            ) : (
              visibleMessages.map((m, i) => {
                const sender = USERS[m.userId];
                const isMe = m.userId === activeUser.id;
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "baseline", marginBottom: "0.2rem" }}>
                      <span style={{ fontFamily: FONT.type, fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: sender?.accent }}>{isMe ? "You" : sender?.name}</span>
                      <span style={{ fontFamily: FONT.type, fontSize: "0.55rem", color: `${BRAND.cream}33` }}>{formatTime(m.ts)}</span>
                    </div>
                    <div style={{ maxWidth: "78%", padding: "0.6rem 0.9rem", borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: isMe ? `${activeUser.accent}33` : `${BRAND.cream}0f`, border: `1px solid ${isMe ? activeUser.accent + "55" : BRAND.cream + "18"}`, fontFamily: FONT.body, fontSize: "0.88rem", lineHeight: 1.5, color: BRAND.cream, wordBreak: "break-word" }}>
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <form onSubmit={handleSend} style={{ display: "flex", gap: "0.6rem", padding: "0.8rem 1rem", borderTop: `1px solid ${BRAND.cream}14` }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Message as ${activeUser.name}…`}
              style={{ flex: 1, background: `${BRAND.dark}cc`, border: `1px solid ${BRAND.cream}22`, borderRadius: 20, padding: "0.6rem 1rem", color: BRAND.cream, fontFamily: FONT.body, fontSize: "0.88rem", outline: "none" }} />
            <button type="submit" disabled={!input.trim()} style={{ background: `linear-gradient(135deg, ${activeUser.accent}, ${BRAND.terracotta})`, border: "none", borderRadius: 20, padding: "0.6rem 1.1rem", color: BRAND.cream, fontFamily: FONT.type, fontSize: "0.7rem", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, cursor: "pointer", opacity: input.trim() ? 1 : 0.4, transition: "opacity .15s ease" }}>Send</button>
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
      const [savedGoal, unifiedBooks] = await Promise.all([
        loadChallengeGoal(friendId, year),
        loadBooks(friendId),
      ]);
      if (!active) return;
      setGoal(savedGoal);

      const staticBooks = friend.books || [];
      const unifiedIds = new Set(unifiedBooks.map((b) => b.id));
      const allBooks = [...staticBooks.filter((b) => !unifiedIds.has(b.id)), ...unifiedBooks];
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
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BRAND.line}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: friend.accent }}>
          {friend.name}'s {year} Challenge
        </div>
        {goal && (
          <div style={{ marginLeft: "auto", fontFamily: FONT.display, fontWeight: 600, fontSize: "1.1rem", color: BRAND.ink }}>
            {count} <span style={{ color: BRAND.muted, fontWeight: 400, fontSize: "0.9rem" }}>/ {goal}</span>
          </div>
        )}
      </div>

      {!loaded ? (
        <div style={{ fontFamily: FONT.body, fontSize: 13, color: BRAND.muted }}>Loading…</div>
      ) : !goal ? (
        <div style={{ fontFamily: FONT.read, fontSize: "0.85rem", color: BRAND.muted, fontStyle: "italic" }}>{friend.name} hasn't set a goal for {year} yet.</div>
      ) : (
        <>
          <div style={{ position: "relative", height: 6, borderRadius: 99, background: BRAND.line, overflow: "hidden", marginBottom: 6 }}>
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${friend.accent}, ${BRAND.tan})`, borderRadius: 99, transition: "width .6s ease" }} />
          </div>
          <div style={{ fontFamily: FONT.body, fontSize: 11, color: BRAND.muted, marginBottom: 10 }}>
            {pct >= 100 ? `🎉 ${friend.name} hit their goal!` : `${pct}% — ${Math.max(0, goal - count)} to go`}
          </div>
          {booksRead.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {booksRead.map((book) => (
                <div key={book.id} title={`${book.title} — ${book.author}`}>
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} style={{ width: 36, height: 52, objectFit: "cover", borderRadius: 2, boxShadow: "0 2px 6px rgba(20,30,50,.12)", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div style={{ width: 36, height: 52, background: book.accent || friend.accent, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(20,30,50,.12)" }}>
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
      const [savedGoal, unifiedBooks] = await Promise.all([
        loadChallengeGoal(userId, year),
        loadBooks(userId),
      ]);
      if (!active) return;

      setGoal(savedGoal);
      setGoalDraft(savedGoal ? String(savedGoal) : "");

      const staticBooks = USERS[userId]?.books || [];
      const unifiedIds = new Set(unifiedBooks.map((b) => b.id));
      const unique = [...staticBooks.filter((b) => !unifiedIds.has(b.id)), ...unifiedBooks];

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
    <div style={{ width: "100%", background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 5, overflow: "hidden", boxShadow: "0 1px 2px rgba(20,30,50,.06)" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BRAND.line}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: BRAND.terracotta, display: "flex", alignItems: "center", gap: 6 }}>
          {USERS[userId].name}'s Reading Challenge <TooltipIcon text={tooltipText} color={BRAND.terracotta} />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {yearOptions.map((y) => (
            <button key={y} onClick={() => setYear(y)} style={{ background: year === y ? BRAND.coral : "transparent", border: `1px solid ${year === y ? BRAND.coral : BRAND.line2}`, borderRadius: 99, padding: "3px 11px", color: year === y ? "#fff" : BRAND.muted, fontFamily: FONT.body, fontSize: 11.5, cursor: "pointer", transition: "all .15s" }}>{y}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {/* Goal setting */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          {goal && !editingGoal ? (
            <>
              <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: "1.5rem", color: BRAND.ink, lineHeight: 1 }}>
                {count} <span style={{ color: BRAND.muted, fontWeight: 400 }}>/ {goal}</span>
              </div>
              <div style={{ fontFamily: FONT.body, fontSize: "0.82rem", color: BRAND.muted }}>books read in {year}</div>
              <button onClick={() => { setGoalDraft(String(goal)); setEditingGoal(true); }} style={{ marginLeft: "auto", background: "none", border: `1px solid ${BRAND.line2}`, borderRadius: 99, padding: "3px 12px", color: BRAND.muted, fontFamily: FONT.body, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>Edit goal</button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: FONT.body, fontSize: "0.84rem", color: BRAND.muted }}>Read</span>
              <input autoFocus={editingGoal} type="number" min={1} value={goalDraft} onChange={(e) => setGoalDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveGoal(); if (e.key === "Escape") setEditingGoal(false); }}
                placeholder="0" style={{ width: 60, background: BRAND.cream, border: `1px solid ${BRAND.line2}`, borderRadius: 2, padding: "6px 8px", color: BRAND.ink, fontFamily: FONT.body, fontSize: "1rem", textAlign: "center", outline: "none" }} />
              <span style={{ fontFamily: FONT.body, fontSize: "0.84rem", color: BRAND.muted }}>books in {year}</span>
              <button onClick={handleSaveGoal} style={{ background: BRAND.coral, border: "none", borderRadius: 2, padding: "7px 16px", color: "#fff", fontFamily: FONT.body, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer" }}>Set</button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {goal && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ position: "relative", height: 7, borderRadius: 99, background: BRAND.line, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(90deg, ${BRAND.coral}, ${BRAND.terracotta})`, borderRadius: 99, transition: "width .6s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT.body, fontSize: 11, color: BRAND.muted }}>
              <span>0</span>
              <span style={{ color: pct >= 100 ? BRAND.coral : BRAND.muted }}>
                {pct >= 100 ? "🎉 Goal reached!" : `${pct}% — ${Math.max(0, goal - count)} to go`}
              </span>
              <span>{goal}</span>
            </div>
          </div>
        )}

        {/* Book covers */}
        {!loaded ? (
          <div style={{ fontFamily: FONT.body, fontSize: 13, color: BRAND.muted }}>Loading…</div>
        ) : booksRead.length === 0 ? (
          <div style={{ fontFamily: FONT.read, fontSize: "0.88rem", color: BRAND.muted, fontStyle: "italic" }}>
            {goal ? `No books finished in ${year} yet — mark a book as "read" to see it here.` : `Set a goal above to start your ${year} reading challenge.`}
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {booksRead.map((book) => (
              <div key={book.id} title={`${book.title} — ${book.author}`} style={{ position: "relative" }}>
                {book.cover ? (
                  <img src={book.cover} alt={book.title} style={{ width: 44, height: 64, objectFit: "cover", borderRadius: 2, boxShadow: "0 2px 6px rgba(20,30,50,.12)", display: "block" }} onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <div style={{ width: 44, height: 64, background: book.accent || BRAND.terracotta, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(20,30,50,.12)" }}>
                    <span style={{ fontSize: "0.9rem" }}>📗</span>
                  </div>
                )}
                {book.finishDate && (
                  <div style={{ position: "absolute", bottom: -4, left: 0, right: 0, textAlign: "center", fontFamily: FONT.type, fontSize: "0.42rem", color: BRAND.muted, whiteSpace: "nowrap" }}>
                    {book.finishDate.slice(5).replace("-", "/")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Friend challenge toggles */}
        {connectedFriends.length > 0 && (
          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {connectedFriends.map((f) => {
              const isShowing = showFriendId === f.id;
              return (
                <button key={f.id} onClick={() => setShowFriendId(isShowing ? null : f.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${f.accent}55`, borderRadius: 99, padding: "4px 12px", color: f.accent, cursor: "pointer", fontFamily: FONT.body, fontSize: 11.5, letterSpacing: "0.04em", textTransform: "uppercase" }}>
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
        const unifiedBooks = await loadBooks(uid);
        const staticBooks = USERS[uid]?.books || [];
        const unifiedIds = new Set(unifiedBooks.map((b) => b.id));
        const allBooks = [...staticBooks.filter((b) => !unifiedIds.has(b.id)), ...unifiedBooks];
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
                    <span key={u.id} style={{ fontFamily: FONT.type, fontSize: "0.55rem", letterSpacing: "0.06em", textTransform: "uppercase", background: `${u.accent}33`, color: u.accent, padding: "0.15rem 0.45rem", borderRadius: 20 }}>{u.name} ✓</span>
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
      const unifiedBooks = await loadBooks(friend.id);
      const staticBooks = friend.books || [];
      const unifiedIds = new Set(unifiedBooks.map((b) => b.id));
      const allBooks = [...staticBooks.filter((b) => !unifiedIds.has(b.id)), ...unifiedBooks];
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
        fontFamily: FONT.body,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.6rem" }}>
          <div>
            <div style={{ fontFamily: FONT.type, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: BRAND.coral, marginBottom: "0.3rem" }}>Admin · Access Control</div>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "1.4rem", color: BRAND.cream }}>Manage Connections</div>
            <div style={{ fontSize: "0.8rem", color: `${BRAND.cream}66`, marginTop: "0.3rem" }}>Toggle which users can see each other's info and chat.</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: `${BRAND.cream}55`, cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "0.2rem" }}>✕</button>
        </div>

        {/* User list with avatars */}
        <div style={{ marginBottom: "1.4rem" }}>
          <div style={{ fontFamily: FONT.type, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.8rem" }}>Members</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            {allUsers.map((u) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: `${u.accent}18`, border: `1px solid ${u.accent}44`, borderRadius: 20, padding: "0.3rem 0.7rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.accent }} />
                <span style={{ fontFamily: FONT.type, fontSize: "0.65rem", color: u.accent }}>{u.name}</span>
                {u.id === ADMIN_USER_ID && <span style={{ fontFamily: FONT.type, fontSize: "0.5rem", color: BRAND.coral }}>admin</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Connection toggles */}
        <div style={{ marginBottom: "1.6rem" }}>
          <div style={{ fontFamily: FONT.type, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.8rem" }}>Connections</div>
          {!connections ? (
            <div style={{ fontSize: "0.82rem", color: `${BRAND.cream}44` }}>Loading…</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {pairs.map(([u1, u2]) => {
                const connected = hasConnection(u1.id, u2.id, connections);
                return (
                  <div key={`${u1.id}-${u2.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: `${BRAND.dark}88`, borderRadius: 8, padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontFamily: FONT.body, fontSize: "0.88rem", color: BRAND.cream }}>{u1.name}</span>
                      <span style={{ color: `${BRAND.cream}33`, fontSize: "0.8rem" }}>↔</span>
                      <span style={{ fontFamily: FONT.body, fontSize: "0.88rem", color: BRAND.cream }}>{u2.name}</span>
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
            fontFamily: FONT.type, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase",
            transition: "background .2s ease",
          }}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>

        {/* Divider */}
        <div style={{ margin: "1.6rem 0", height: 1, background: `${BRAND.cream}14` }} />

        {/* Create New User */}
        <div style={{ fontFamily: FONT.type, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "1rem" }}>Create New User</div>
        <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <input
            type="text" value={newName} onChange={(e) => { setNewName(e.target.value); setCreateError(null); }}
            placeholder="First name (e.g. Jane)"
            style={{ background: `${BRAND.dark}88`, border: `1px solid ${BRAND.cream}22`, borderRadius: 8, padding: "0.7rem 0.9rem", color: BRAND.cream, fontFamily: FONT.body, fontSize: "0.9rem", outline: "none", width: "100%" }}
          />
          <input
            type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setCreateError(null); }}
            placeholder="Password"
            style={{ background: `${BRAND.dark}88`, border: `1px solid ${BRAND.cream}22`, borderRadius: 8, padding: "0.7rem 0.9rem", color: BRAND.cream, fontFamily: FONT.body, fontSize: "0.9rem", outline: "none", width: "100%" }}
          />
          <div>
            <div style={{ fontFamily: FONT.type, fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.5rem" }}>Accent color</div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {ACCENT_PRESETS.map((c) => (
                <button key={c} type="button" onClick={() => setNewAccent(c)}
                  style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: newAccent === c ? `2px solid ${BRAND.cream}` : "2px solid transparent", cursor: "pointer", padding: 0, outline: "none" }}
                />
              ))}
            </div>
          </div>
          {createError && <div style={{ fontFamily: FONT.type, fontSize: "0.65rem", color: BRAND.coral }}>{createError}</div>}
          <button type="submit" disabled={creating}
            style={{ padding: "0.7rem", borderRadius: 8, border: "none", cursor: "pointer", background: createSuccess ? "#4caf50" : newAccent, color: BRAND.cream, fontFamily: FONT.type, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", transition: "background .2s ease" }}
          >
            {creating ? "Creating…" : createSuccess ? "User Created ✓" : "Create User"}
          </button>
        </form>

        {/* Dynamic users list with delete */}
        {dynamicUsers && dynamicUsers.length > 0 && (
          <div style={{ marginTop: "1.2rem" }}>
            <div style={{ fontFamily: FONT.type, fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.6rem" }}>Added users</div>
            {dynamicUsers.map((u) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: `1px solid ${BRAND.cream}0e` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: u.accent }} />
                  <span style={{ fontFamily: FONT.body, fontSize: "0.88rem", color: BRAND.cream }}>{u.name}</span>
                </div>
                <button onClick={() => handleDeleteUser(u.id)} style={{ background: "none", border: "none", color: `${BRAND.cream}44`, cursor: "pointer", fontSize: "0.8rem", padding: "0.2rem 0.4rem" }}>✕ Remove</button>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ margin: "1.6rem 0", height: 1, background: `${BRAND.cream}14` }} />

        {/* Tooltip Editor */}
        <div style={{ fontFamily: FONT.type, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.8rem" }}>Section Tooltips</div>
        <div style={{ fontSize: "0.78rem", color: `${BRAND.cream}55`, fontFamily: FONT.body, marginBottom: "0.8rem" }}>Add instructions that appear as a ⓘ icon on each section. Leave blank to hide.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          {TOOLTIP_SECTIONS.map(({ key, label }) => (
            <div key={key}>
              <div style={{ fontFamily: FONT.type, fontSize: "0.56rem", color: `${BRAND.cream}55`, marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              <textarea
                value={(tooltips || {})[key] || ""}
                onChange={(e) => onTooltipsChanged({ ...(tooltips || {}), [key]: e.target.value })}
                onBlur={async () => { await saveTooltips(tooltips || {}); }}
                placeholder={`Instructions for ${label}…`}
                rows={2}
                style={{ width: "100%", background: `${BRAND.dark}88`, border: `1px solid ${BRAND.cream}22`, borderRadius: 6, padding: "0.55rem 0.7rem", color: BRAND.cream, fontFamily: FONT.body, fontSize: "0.82rem", resize: "vertical", outline: "none", boxSizing: "border-box" }}
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
function UserHome({ user, onOpenMyBooks, onLogout, onBooksChanged, dynamicUsers, dynamicPasswords, onUserCreated, tooltips, onTooltipsChanged }) {
  const currentYear = new Date().getFullYear();
  const [connections, setConnections] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [nowReading, setNowReading] = useState([]);
  const [challengeYear, setChallengeYear] = useState(currentYear);
  const [challengeGoal, setChallengeGoal] = useState(null);
  const [challengeCount, setChallengeCount] = useState(0);
  const [logBookId, setLogBookId] = useState(null);
  const [logPageInput, setLogPageInput] = useState("");
  const isAdmin = user.id === ADMIN_USER_ID;

  useEffect(() => {
    loadConnections().then(setConnections);
  }, [showAdmin]);

  const loadTrackers = async () => {
    const [unifiedBooks, goal] = await Promise.all([
      loadBooks(user.id),
      loadChallengeGoal(user.id, challengeYear),
    ]);
    setChallengeGoal(goal);
    const userStaticBooks = USERS[user.id]?.books || [];
    const unifiedIds = new Set(unifiedBooks.map((b) => b.id));
    const allBooks = [...userStaticBooks.filter((b) => !unifiedIds.has(b.id)), ...unifiedBooks];
    const withProgress = await Promise.all(
      allBooks.map(async (b) => {
        const [prog, status, dateAdded] = await Promise.all([
          loadProgress(user.id, b.id),
          loadStatus(user.id, b.id),
          loadDateAdded(user.id, b.id),
        ]);
        return { ...b, prog, status, dateAdded };
      })
    );
    const trackers = withProgress.filter((b) => b.prog?.tracking === true && b.pages && (b.prog.pagesRead || 0) < b.pages);
    setNowReading(trackers.map((b) => ({ ...b, pagesRead: b.prog.pagesRead || 0 })));
    const readThisYear = withProgress.filter((b) => {
      if (b.status !== "read") return false;
      const date = b.prog?.dateFinished || b.dateAdded;
      return date && parseInt(date.slice(0, 4), 10) === challengeYear;
    });
    setChallengeCount(readThisYear.length);
  };

  useEffect(() => { loadTrackers(); }, [user.id, challengeYear]);

  const handleLogPages = async (book) => {
    const pages = parseInt(logPageInput, 10);
    if (!pages || pages < 0) { setLogBookId(null); return; }
    const existing = book.prog || {};
    await saveProgress(user.id, book.id, { ...existing, pagesRead: Math.min(pages, book.pages || 9999) });
    setLogBookId(null);
    setLogPageInput("");
    loadTrackers();
  };

  const handleRemoveTracker = async (book) => {
    const existing = book.prog || {};
    await saveProgress(user.id, book.id, { ...existing, tracking: false });
    setNowReading((prev) => prev.filter((b) => b.id !== book.id));
  };

  const friends = connections ? getConnectedUsers(user.id, connections) : [];

  return (
    <div style={{ minHeight: "100vh", background: BRAND.cream, color: BRAND.ink, fontFamily: FONT.body, overflowX: "hidden" }}>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} dynamicUsers={dynamicUsers} dynamicPasswords={dynamicPasswords} onUserCreated={onUserCreated} tooltips={tooltips} onTooltipsChanged={onTooltipsChanged} />}

      {/* Admin button — TopNav handles main nav; keep admin access here */}
      {isAdmin && (
        <div style={{ maxWidth: 1220, margin: "0 auto", padding: "10px 30px 0", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setShowAdmin(true)} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "7px 13px", borderRadius: 2, cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = BRAND.coral; e.currentTarget.style.borderColor = BRAND.coral; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = BRAND.muted; e.currentTarget.style.borderColor = BRAND.line2; }}>
            ⚙ Admin
          </button>
        </div>
      )}

      {/* Main content */}
      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "34px 30px 40px" }}>

        {/* Greeting */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: FONT.body, fontSize: 11.5, letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND.terracotta, marginBottom: 14 }}>
            <span style={{ width: 24, height: 1, background: BRAND.terracotta, display: "inline-block" }} />
            Your reading life <TooltipIcon text={tooltips?.home} color={BRAND.terracotta} />
          </div>
          <h1 style={{ fontFamily: FONT.display, fontWeight: 500, fontSize: "clamp(38px,5vw,54px)", lineHeight: 1.02, letterSpacing: "-0.01em", color: BRAND.ink, margin: "0 0 10px" }}>
            Good to see you, <span style={{ fontStyle: "italic", color: BRAND.coral }}>{user.name}.</span>
          </h1>
          <p style={{ fontFamily: FONT.read, fontSize: "clamp(15px,1.3vw,18px)", color: BRAND.muted, margin: 0, lineHeight: 1.6 }}>Your library is waiting. Pick up where you left off.</p>
        </div>

        {/* ===== NOW READING TRACKER (espresso card) ===== */}
        <section style={{ background: BRAND.espresso, borderRadius: 6, padding: "26px 28px 28px", boxShadow: "0 4px 12px rgba(20,30,50,.10)", marginBottom: 22 }}>
          {/* Header row: "Now reading" + year challenge strip */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: FONT.body, fontSize: 11.5, letterSpacing: "0.26em", textTransform: "uppercase", color: BRAND.tan }}>Now reading</span>
              {nowReading.length > 0 && (
                <span style={{ fontFamily: FONT.body, fontSize: 11.5, letterSpacing: "0.04em", color: "rgba(251,246,232,.5)" }}>{nowReading.length} book{nowReading.length !== 1 ? "s" : ""}</span>
              )}
            </div>
            {/* Challenge strip */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 23, color: "#FBF6E8", lineHeight: 1 }}>{challengeCount}</span>
                <span style={{ fontFamily: FONT.body, fontSize: 12, color: "rgba(251,246,232,.74)" }}>/ {challengeGoal || "—"} read in</span>
              </div>
              <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,.06)", padding: 4, borderRadius: 99, border: "1px solid rgba(217,162,130,.22)" }}>
                {[currentYear, currentYear - 1].map((yr) => (
                  <button key={yr} onClick={() => setChallengeYear(yr)} style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: "0.04em", border: "none", cursor: "pointer", padding: "5px 13px", borderRadius: 99, transition: "background .2s,color .2s", background: challengeYear === yr ? BRAND.coral : "transparent", color: challengeYear === yr ? "#fff" : "rgba(251,246,232,.7)" }}>
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tracker rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {nowReading.length === 0 ? (
              <div style={{ textAlign: "center", padding: "22px", fontFamily: FONT.read, fontStyle: "italic", fontSize: 16, color: "rgba(251,246,232,.5)" }}>
                No trackers yet — open a book and log your page to start tracking.
              </div>
            ) : nowReading.map((book) => {
              const pct = Math.min(100, Math.round((book.pagesRead / book.pages) * 100));
              const spineColors = ["#BF755A","#F25C5C","#D9A282","#9a6a3f","#6B4A3A","#3E7C57","#3a6ea5"];
              const spine = book.accent || spineColors[Math.abs((book.id || "").charCodeAt(0)) % spineColors.length];
              const isLogging = logBookId === book.id;
              return (
                <div key={book.id} style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(255,255,255,.04)", border: "1px solid rgba(217,162,130,.18)", borderRadius: 5, padding: "16px 18px" }}>
                  {/* Spine block — 46×66px matching design */}
                  <div style={{ position: "relative", width: 46, height: 66, flexShrink: 0, borderRadius: "2px 3px 3px 2px", background: spine, boxShadow: "inset -6px 0 0 rgba(0,0,0,.16),0 4px 12px rgba(20,30,50,.10)" }}>
                    <span style={{ position: "absolute", left: 6, top: 7, bottom: 7, width: 1, background: "rgba(255,255,255,.25)", display: "block" }} />
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14, marginBottom: 9 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 21, lineHeight: 1.1, color: "#FBF6E8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</div>
                        <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13.5, color: BRAND.tan, marginTop: 2 }}>{book.author}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontFamily: FONT.body, fontSize: 13, color: "#FBF6E8", fontWeight: 500, whiteSpace: "nowrap" }}>
                          p. {book.pagesRead} <span style={{ color: "rgba(251,246,232,.5)" }}>/ {book.pages}</span>
                        </div>
                        <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.coral, marginTop: 2 }}>{pct}%</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 7, width: "100%", background: "rgba(255,255,255,.1)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: BRAND.coral, borderRadius: 99 }} />
                    </div>
                    {/* Inline log input */}
                    {isLogging && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                        <input type="number" min={0} max={book.pages || 9999} value={logPageInput} onChange={(e) => setLogPageInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleLogPages(book); if (e.key === "Escape") { setLogBookId(null); setLogPageInput(""); } }}
                          placeholder={`Current page (max ${book.pages})`} autoFocus
                          style={{ fontFamily: FONT.body, fontSize: 13, background: "rgba(255,255,255,.1)", border: "1px solid rgba(217,162,130,.4)", borderRadius: 2, color: "#FBF6E8", padding: "6px 10px", width: 180, outline: "none" }} />
                        <button onClick={() => handleLogPages(book)} style={{ fontFamily: FONT.body, fontSize: 12, padding: "6px 13px", borderRadius: 2, border: "none", background: BRAND.coral, color: "#fff", cursor: "pointer" }}>Save</button>
                        <button onClick={() => { setLogBookId(null); setLogPageInput(""); }} style={{ fontFamily: FONT.body, fontSize: 12, padding: "6px 10px", borderRadius: 2, border: "1px solid rgba(251,246,232,.2)", background: "transparent", color: "rgba(251,246,232,.6)", cursor: "pointer" }}>Cancel</button>
                      </div>
                    )}
                  </div>
                  {/* Action buttons */}
                  {!isLogging && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, flexShrink: 0 }}>
                      <button onClick={() => { setLogBookId(book.id); setLogPageInput(String(book.pagesRead)); }}
                        style={{ fontFamily: FONT.body, fontSize: 11.5, letterSpacing: "0.04em", cursor: "pointer", padding: "8px 13px", borderRadius: 2, border: "1px solid rgba(217,162,130,.4)", background: "rgba(242,92,92,.14)", color: "#FBF6E8", whiteSpace: "nowrap" }}>
                        + Log pages
                      </button>
                      <button onClick={() => handleRemoveTracker(book)}
                        style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", padding: "5px 13px", borderRadius: 2, border: "1px solid rgba(251,246,232,.18)", background: "transparent", color: "rgba(251,246,232,.5)" }}>
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add tracker */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(217,162,130,.16)" }}>
            <button onClick={() => document.getElementById("card-catalogue")?.scrollIntoView({ behavior: "smooth" })} style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: FONT.body, fontSize: 13, letterSpacing: "0.03em", cursor: "pointer", padding: "10px 16px", borderRadius: 2, border: "1px dashed rgba(217,162,130,.5)", background: "transparent", color: "#FBF6E8" }}>
              <span style={{ fontSize: 16, color: BRAND.tan }}>+</span> Add a book to your shelf ↓
            </button>
          </div>
        </section>

        {/* ===== Card Catalogue (inline) ===== */}
        <div id="card-catalogue">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND.terracotta }}>Card Catalogue</div>
            <button onClick={onOpenMyBooks} style={{ fontFamily: FONT.body, fontSize: 13, color: BRAND.coral, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.03em" }}>Marginalia →</button>
          </div>
          <Bookshelf userId={user.id} userAccent={user.accent} onBooksChanged={onBooksChanged} inline />
        </div>

        {/* Reading challenge — compact strip below cards */}
        <section style={{ marginTop: 8 }}>
          <BookChallenge userId={user.id} userAccent={user.accent} friends={friends} tooltipText={tooltips?.challenge} />
        </section>

      </div>{/* /main content */}

      {/* Reading room — espresso full-bleed, 3-col friend grid */}
      {friends.length > 0 && (
        <section style={{ background: BRAND.espresso, padding: "clamp(40px,6vw,64px) 0" }}>
          <div style={{ maxWidth: 1220, margin: "0 auto", padding: "0 30px" }}>
            <div style={{ fontFamily: FONT.body, fontSize: 12.5, letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND.tan, marginBottom: 26 }}>Reading room</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,280px),1fr))", gap: 16, marginBottom: 22 }}>
              <FriendReading friends={friends} tooltipText={tooltips?.friendReading} />
              <SharedBookshelf viewerId={user.id} friends={friends} tooltipText={tooltips?.sharedBooks} />
            </div>
            <SharedChat activeUser={user} friends={friends} tooltipText={tooltips?.chat} />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ background: BRAND.espresso2, padding: "28px 30px", borderTop: "1px solid rgba(217,162,130,.14)" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: FONT.display, fontStyle: "italic", fontSize: 18, color: BRAND.tan }}>Turn the page.</span>
          <span style={{ fontFamily: FONT.body, fontSize: 12, color: "rgba(242,239,235,.4)", letterSpacing: "0.08em" }}>© 2026 Marginalia · mybookbrain.com</span>
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
    if (password === passwords[userId]) { localStorage.setItem(SESSION_KEY, userId); onLogin(userId); }
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
// TOP NAV
// ---------------------------------------------------------------------------
function TopNav({ screen, activeBook, onNavigate, onLogout, userName }) {
  const items = [
    { label: "Home",       key: "userHome" },
    { label: "Marginalia", key: "myBooks"  },
  ];

  const activeKey = activeBook ? null : screen;

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: BRAND.espresso,
      borderBottom: `1px solid rgba(217,162,130,.15)`,
      display: "flex", alignItems: "center",
      padding: "0 clamp(16px, 4vw, 40px)",
      height: 52,
      gap: 4,
    }}>
      {/* Wordmark */}
      <button
        onClick={() => onNavigate("userHome")}
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "0 12px 0 0", marginRight: 8, borderRight: `1px solid rgba(217,162,130,.2)` }}
      >
        <span style={{ width: 26, height: 26, borderRadius: 3, background: BRAND.coral, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: BRAND.cream }}>M</span>
        <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 18, color: BRAND.cream, letterSpacing: ".02em" }}>Marginalia</span>
      </button>

      {/* Nav links */}
      {items.map(({ label, key }) => {
        const active = activeKey === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            style={{
              background: active ? "rgba(242,92,92,.15)" : "none",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT.body,
              fontSize: 13.5,
              letterSpacing: ".03em",
              color: active ? BRAND.coral : "rgba(242,239,235,.65)",
              padding: "6px 14px",
              borderRadius: 4,
              transition: "all .15s",
            }}
          >{label}</button>
        );
      })}

      {/* Spacer + user / logout */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {userName && (
          <span style={{ fontFamily: FONT.body, fontSize: 12.5, color: "rgba(242,239,235,.45)", letterSpacing: ".04em" }}>
            {userName}
          </span>
        )}
        <button
          onClick={onLogout}
          style={{ background: "none", border: `1px solid rgba(217,162,130,.3)`, cursor: "pointer", fontFamily: FONT.body, fontSize: 12, color: "rgba(242,239,235,.55)", padding: "5px 12px", borderRadius: 4, letterSpacing: ".04em", transition: "all .15s" }}
        >Sign out</button>
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// ROOT APP
// ---------------------------------------------------------------------------
// Parse the current URL path into app state
function parseLocation(userId) {
  const path = window.location.pathname;
  if (!userId) return { screen: "userHome", activeBookId: null };
  const base = `/${userId}`;
  if (path === `${base}/marginalia`) return { screen: "myBooks", activeBookId: null };
  const bookMatch = path.match(new RegExp(`^${base}/book/(.+)$`));
  if (bookMatch) return { screen: "userHome", activeBookId: bookMatch[1] };
  return { screen: "userHome", activeBookId: null };
}

export default function App() {
  const [loggedInUserId, setLoggedInUserId] = useState(() => localStorage.getItem(SESSION_KEY) || null);
  const [screen, setScreen] = useState(() => parseLocation(localStorage.getItem(SESSION_KEY) || null).screen);
  const [activeBookId, setActiveBookId] = useState(() => parseLocation(localStorage.getItem(SESSION_KEY) || null).activeBookId);
  const [booksVersion, setBooksVersion] = useState(0);
  const [allUserBooks, setAllUserBooks] = useState([]);
  const [booksReady, setBooksReady] = useState(false);
  const [dynamicUsers, setDynamicUsers] = useState([]);
  const [dynamicPasswords, setDynamicPasswords] = useState({});
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [tooltips, setTooltips] = useState({});

  // Push a URL path and update state together
  const navigate = useCallback((nextScreen, nextBookId = null, userId = loggedInUserId) => {
    if (!userId) return;
    let path = `/${userId}`;
    if (nextBookId) path = `/${userId}/book/${nextBookId}`;
    else if (nextScreen === "myBooks") path = `/${userId}/marginalia`;
    window.history.pushState({ screen: nextScreen, activeBookId: nextBookId, userId }, "", path);
    setScreen(nextScreen);
    setActiveBookId(nextBookId);
    if (nextBookId) setBooksVersion((v) => v + 1);
  }, [loggedInUserId]);

  // Sync back/forward browser navigation
  useEffect(() => {
    const onPop = (e) => {
      const userId = localStorage.getItem(SESSION_KEY);
      if (!userId) { setLoggedInUserId(null); return; }
      const { screen: s, activeBookId: b } = e.state || parseLocation(userId);
      setScreen(s || "userHome");
      setActiveBookId(b || null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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
    if (!loggedInUserId) { setAllUserBooks([]); setBooksReady(false); return; }
    loadBooks(loggedInUserId).then((books) => {
      setAllUserBooks(books);
      setBooksReady(true);
    });
  }, [loggedInUserId, booksVersion]);

  const staticBooks = activeUser ? activeUser.books : [];
  const activeBook = [...staticBooks, ...allUserBooks].find((b) => b.id === activeBookId);

  // Once books are loaded: if the active book ID isn't found, clear it and go home
  useEffect(() => {
    if (!booksReady || !activeBookId) return;
    const found = [...(activeUser?.books || []), ...allUserBooks].find((b) => b.id === activeBookId);
    if (!found) {
      setActiveBookId(null);
      setScreen("userHome");
    }
  }, [booksReady, allUserBooks, activeBookId]);

  const handleLogin = (userId) => {
    setLoggedInUserId(userId);
    const path = `/${userId}`;
    window.history.pushState({ screen: "userHome", activeBookId: null, userId }, "", path);
    setScreen("userHome");
    setActiveBookId(null);
  };
  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setLoggedInUserId(null);
    window.history.pushState({}, "", "/");
    setScreen("userHome");
    setActiveBookId(null);
  };
  const goUserHome = () => navigate("userHome", null);

  const handleUserCreated = ({ dynamicUsers: du, dynamicPasswords: dp }) => {
    setDynamicUsers(du);
    setDynamicPasswords(dp);
  };

  if (!usersLoaded) return null; // wait for dynamic users before rendering login

  if (!loggedInUserId) {
    return <LoginScreen onLogin={handleLogin} allPasswords={allPasswords} />;
  }

  let content;
  if (activeBookId && !activeBook) {
    // Book id is set but not yet loaded — wait (booksReady effect will recover if never found)
    content = null;
  } else if (activeBook && activeUser) {
    content = <BookDashboard userId={activeUser.id} book={activeBook} onBack={goUserHome} onLogout={handleLogout} />;
  } else if (screen === "myBooks" && activeUser) {
    content = <MyBooksHome userId={activeUser.id} userAccent={activeUser.accent} staticBooks={staticBooks} onSelect={(id) => navigate("userHome", id)} onBack={goUserHome} onLogout={handleLogout} onBooksChanged={() => setBooksVersion((v) => v + 1)} />;
  } else if (activeUser) {
    content = <UserHome user={activeUser} onOpenMyBooks={() => navigate("myBooks")} onLogout={handleLogout} onBooksChanged={() => setBooksVersion((v) => v + 1)} dynamicUsers={dynamicUsers} dynamicPasswords={dynamicPasswords} onUserCreated={handleUserCreated} tooltips={tooltips} onTooltipsChanged={setTooltips} />;
  }

  return (
    <div style={{ fontFamily: FONT.body }}>
      <style>{`
        @media (max-width: 720px) { .casefile-grid { grid-template-columns: 1fr !important; } .quote-form { grid-template-columns: 1fr !important; } }
        * { box-sizing: border-box; }
      `}</style>
      <TopNav
        screen={screen}
        activeBook={activeBook}
        onNavigate={(key) => navigate(key)}
        onLogout={handleLogout}
        userName={activeUser?.name}
      />
      {content}
    </div>
  );
}
