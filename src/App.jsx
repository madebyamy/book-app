import React, { useState, useEffect, useCallback } from "react";
import { storage } from "./storage.js";

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

// Brand palette
const BRAND = {
  dark: "#262020",
  darkCard: "#2E2525",
  cream: "#F2EFEB",
  tan: "#D9A282",
  terracotta: "#BF755A",
  coral: "#F25C5C",
};

const USERS = {
  amy: { id: "amy", name: "Amy", accent: "#F25C5C", books: AMY_BOOKS },
  lynnell: { id: "lynnell", name: "Lynnell", accent: "#BF755A", books: LYNNELL_BOOKS },
};

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

function BookDashboard({ userId, book, onBack, onLogout }) {
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
        <h1 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.02, margin: "0 0 0.6rem", color: theme.ink }}>{book.title}</h1>
        <p style={{ fontSize: "1rem", color: theme.inkSoft, margin: "0 0 1.6rem", maxWidth: "60ch", lineHeight: 1.5 }}>{book.tagline}</p>
        <PageTracker userId={userId} book={book} />
        {!hasAcademic && (
          <div style={{ marginBottom: "2.4rem", padding: "1.2rem 1.5rem", border: `1px dashed ${theme.border}`, borderRadius: 4, fontFamily: theme.mono, fontSize: "0.78rem", color: theme.inkFaint, lineHeight: 1.6 }}>
            This book was added from the bookshelf and doesn't have a summary yet.
          </div>
        )}
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
    <button onClick={() => onSelect(book.id)} style={{ position: "relative", display: "flex", gap: "1.1rem", textAlign: "left", cursor: "pointer", width: "100%", background: "#F4EFE4", color: "#1A1610", border: "1px solid #D8CDB4", borderRadius: 2, padding: "1.3rem 1.5rem 1.3rem 1.7rem", boxShadow: "0 3px 0 rgba(0,0,0,0.18), 0 8px 14px rgba(0,0,0,0.28)", transition: "transform .18s ease, box-shadow .18s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 5px 0 rgba(0,0,0,0.2), 0 14px 20px rgba(0,0,0,0.32)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 3px 0 rgba(0,0,0,0.18), 0 8px 14px rgba(0,0,0,0.28)"; }}>
      <span style={{ position: "absolute", top: "1.3rem", left: "0.55rem", width: 9, height: 9, borderRadius: "50%", background: "#0F1A2B", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }} />
      <span style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 5, background: book.accent }} />
      <div style={{ position: "relative", flexShrink: 0 }}>
        {book.cover ? <img src={book.cover} alt={book.title} style={{ width: 56, height: 82, objectFit: "cover", display: "block", boxShadow: "0 2px 6px rgba(0,0,0,0.35)" }} onError={(e) => { e.target.style.display = "none"; }} />
          : <div style={{ width: 56, height: 82, background: book.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.35)", padding: "0.3rem" }}><span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "0.65rem", color: "#1A1612", textAlign: "center", lineHeight: 1.2 }}>{book.title}</span></div>}
        <StatusBadge status={readStatus} accent={book.accent} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.6rem", marginBottom: "0.45rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", letterSpacing: "0.08em", color: book.accent, fontWeight: 600 }}>{callNumber}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.05em", color: "rgba(26,22,16,0.45)", whiteSpace: "nowrap" }}>{date ? formatCatalogDate(date) : "—"}</span>
        </div>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "1.18rem", lineHeight: 1.2, marginBottom: "0.25rem" }}>{book.title}</div>
        {book.subtitle && <div style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(26,22,16,0.55)", marginBottom: "0.55rem" }}>{book.subtitle}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(26,22,16,0.6)" }}>{book.author}</span>
          <span style={{ flex: 1, borderBottom: "1px dotted rgba(26,22,16,0.3)", height: 1 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(26,22,16,0.6)" }}>{book.year}</span>
        </div>
      </div>
    </button>
  );
}

function AddBookToMyBooks({ userId, userAccent, onAdded }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    const id = `custom-${userId}-${Date.now().toString(36)}`;
    const newBook = {
      id, title: title.trim(), subtitle: "", author: author.trim(), year: year.trim() || new Date().getFullYear().toString(),
      format: "simple", accent: userAccent, theme: { ...DEFAULT_THEME, headerBg: userAccent, headerInk: "#F4EFE4" },
      cover: "", tagline: "", nodes: [], caseFile: null, keyLines: [], thread: "",
    };
    const existing = await loadCustomBooks(userId);
    await saveCustomBooks(userId, [...existing, newBook]);
    setTitle(""); setAuthor(""); setYear(""); setOpen(false);
    onAdded();
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", cursor: "pointer", width: "100%", background: "transparent", color: "rgba(244,239,228,0.55)", border: "1px dashed rgba(244,239,228,0.32)", borderRadius: 2, padding: "1.1rem 1.5rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.78rem", letterSpacing: "0.06em", textTransform: "uppercase", transition: "border-color .15s ease, color .15s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(244,239,228,0.6)"; e.currentTarget.style.color = "#F4EFE4"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(244,239,228,0.32)"; e.currentTarget.style.color = "rgba(244,239,228,0.55)"; }}>
      <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span>
      <span>Add a book</span>
    </button>
  );

  return (
    <form onSubmit={handleSubmit} style={{ background: "#162338", border: "1px solid rgba(244,239,228,0.2)", borderRadius: 4, padding: "1.2rem", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title" required style={{ background: "#0F1A2B", border: "1px solid rgba(244,239,228,0.28)", color: "#F4EFE4", fontFamily: "'Fraunces', serif", fontSize: "0.9rem", padding: "0.55rem 0.8rem", borderRadius: 3 }} />
      <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" required style={{ background: "#0F1A2B", border: "1px solid rgba(244,239,228,0.28)", color: "#F4EFE4", fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", padding: "0.55rem 0.8rem", borderRadius: 3 }} />
      <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year (optional)" style={{ background: "#0F1A2B", border: "1px solid rgba(244,239,228,0.28)", color: "#F4EFE4", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.82rem", padding: "0.55rem 0.8rem", borderRadius: 3 }} />
      <div style={{ display: "flex", gap: "0.6rem" }}>
        <button type="submit" style={{ flex: 1, background: userAccent, border: "none", color: "#F4EFE4", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", padding: "0.55rem", borderRadius: 3, cursor: "pointer", fontWeight: 700 }}>Add Book</button>
        <button type="button" onClick={() => setOpen(false)} style={{ background: "none", border: "1px solid rgba(244,239,228,0.28)", color: "rgba(244,239,228,0.6)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", padding: "0.55rem 0.9rem", borderRadius: 3, cursor: "pointer" }}>Cancel</button>
      </div>
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

  const allBooks = [...staticBooks, ...customBooks];

  return (
    <div style={{ minHeight: "100vh", background: "#0F1A2B", padding: "0 0 5rem" }}>
      <div style={{ background: "linear-gradient(180deg, #2A2118, #1C160F)", borderBottom: "3px solid #0B0805", padding: "2.6rem 1.8rem 2.2rem", textAlign: "center", position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: "1.4rem", left: "1.4rem", background: "none", border: "1px solid rgba(244,239,228,0.3)", color: "rgba(244,239,228,0.7)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", padding: "0.4rem 0.8rem", borderRadius: 3, cursor: "pointer" }}>← Back</button>
        <button onClick={onLogout} style={{ position: "absolute", top: "1.4rem", right: "1.4rem", background: "none", border: "1px solid rgba(244,239,228,0.2)", color: "rgba(244,239,228,0.5)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", padding: "0.4rem 0.8rem", borderRadius: 3, cursor: "pointer" }}>Log out</button>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: userAccent, marginBottom: "0.7rem" }}>{USERS[userId].name}'s Card Catalog</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(2.1rem, 5.5vw, 3.2rem)", lineHeight: 1.05, margin: "0 0 0.5rem", color: "#F4EFE4" }}>{USERS[userId].name}'s Books</h1>
        <p style={{ color: "rgba(244,239,228,0.55)", fontSize: "0.92rem", margin: "0 auto", maxWidth: "46ch", lineHeight: 1.5 }}>Full summaries — key ideas, highlighted stories, {USERS[userId].name}'s quotes, and reading trackers.</p>
        <div style={{ width: 64, height: 6, background: `linear-gradient(180deg, ${userAccent}, #4a3a20)`, borderRadius: 3, margin: "1.6rem auto 0", boxShadow: "0 2px 4px rgba(0,0,0,0.5)" }} />
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2.6rem 1.8rem 0" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,239,228,0.4)", marginBottom: "1.1rem", borderBottom: "1px solid rgba(244,239,228,0.14)", paddingBottom: "0.6rem" }}>
          {allBooks.length} {allBooks.length === 1 ? "entry" : "entries"} on file
        </div>
        {!loaded ? (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: "rgba(244,239,228,0.4)", padding: "1rem 0" }}>Loading…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {allBooks.map((book) => (<CatalogCard key={book.id} userId={userId} book={book} onSelect={onSelect} />))}
          </div>
        )}
        <div style={{ marginTop: "1.3rem" }}>
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
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    onAdd({ title: title.trim(), author: author.trim() });
    setTitle(""); setAuthor(""); setOpen(false);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", width: 92, height: 124, flexShrink: 0, background: "transparent", border: "1px dashed rgba(244,239,228,0.32)", color: "rgba(244,239,228,0.55)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", cursor: "pointer", flexDirection: "column" }}>
      <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>+</span>
      <span>Add book</span>
    </button>
  );

  return (
    <form onSubmit={handleSubmit} style={{ width: 220, flexShrink: 0, background: "#162338", border: "1px solid rgba(244,239,228,0.2)", borderRadius: 4, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={{ background: "#0F1A2B", border: "1px solid rgba(244,239,228,0.28)", color: "#F4EFE4", fontFamily: "'Fraunces', serif", fontSize: "0.85rem", padding: "0.5rem 0.7rem", borderRadius: 3 }} />
      <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author" style={{ background: "#0F1A2B", border: "1px solid rgba(244,239,228,0.28)", color: "#F4EFE4", fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", padding: "0.5rem 0.7rem", borderRadius: 3 }} />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" style={{ flex: 1, background: userAccent, border: "none", color: "#F4EFE4", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em", padding: "0.5rem", borderRadius: 3, cursor: "pointer", fontWeight: 700 }}>Add</button>
        <button type="button" onClick={() => setOpen(false)} style={{ background: "none", border: "1px solid rgba(244,239,228,0.28)", color: "rgba(244,239,228,0.6)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", padding: "0.5rem 0.7rem", borderRadius: 3, cursor: "pointer" }}>Cancel</button>
      </div>
    </form>
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

  const handleAdd = async ({ title, author }) => {
    const id = `shelf-${userId}-${Date.now().toString(36)}`;
    const newBook = { id, title, author, cover: null, pages: null, summary: null, accent: userAccent };
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
// USER HOME — shown after selecting Amy or Lynnell
// ---------------------------------------------------------------------------
function UserHome({ user, onOpenMyBooks, onOpenShelf, onLogout }) {
  return (
    <div style={{
      minHeight: "100vh", background: BRAND.dark,
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background image */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=80')",
        backgroundSize: "cover", backgroundPosition: "center top",
        opacity: 0.14,
      }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${BRAND.dark}11 0%, ${BRAND.dark}44 50%, ${BRAND.dark}99 100%)` }} />

      {/* Top bar */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.2rem 1.4rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${BRAND.terracotta}, ${BRAND.coral})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>🧠</div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: BRAND.tan }}>Book Brain</span>
        </div>
        <button onClick={onLogout} style={{ background: "none", border: `1px solid ${BRAND.cream}22`, color: `${BRAND.cream}55`, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", padding: "0.4rem 0.8rem", borderRadius: 20, cursor: "pointer", letterSpacing: "0.06em" }}>Log out</button>
      </div>

      {/* Hero */}
      <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1.4rem 3rem" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", letterSpacing: "0.22em", textTransform: "uppercase", color: user.accent, marginBottom: "0.5rem", textAlign: "center" }}>Book Mind</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(2.4rem, 9vw, 3.6rem)", lineHeight: 1.02, margin: "0 0 0.4rem", color: BRAND.cream, textAlign: "center" }}>{user.name}'s</h1>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(2.4rem, 9vw, 3.6rem)", lineHeight: 1.02, margin: "0 0 2rem", color: user.accent, textAlign: "center" }}>Library</h1>

        {/* Decorative divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "2.4rem", width: "100%", maxWidth: 340 }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${BRAND.tan}55)` }} />
          <span style={{ fontSize: "1rem" }}>📖</span>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${BRAND.tan}55)` }} />
        </div>

        {/* Nav cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: 400 }}>
          <button onClick={onOpenMyBooks}
            style={{ background: `${BRAND.darkCard}dd`, backdropFilter: "blur(10px)", border: `1px solid ${BRAND.cream}14`, borderLeft: `3px solid ${user.accent}`, borderRadius: 10, padding: "1.4rem 1.6rem", textAlign: "left", cursor: "pointer", color: BRAND.cream, transition: "transform .18s ease, background .18s ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = `${BRAND.darkCard}ff`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = `${BRAND.darkCard}dd`; }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.3rem" }}>🗂️</span>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: user.accent }}>{user.name}'s Card Catalog</div>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.35rem", marginBottom: "0.3rem" }}>{user.name}'s Books</div>
            <p style={{ margin: 0, fontSize: "0.84rem", color: `${BRAND.cream}66`, lineHeight: 1.5 }}>Full summaries, key ideas, quotes, and reading trackers.</p>
          </button>

          <button onClick={onOpenShelf}
            style={{ background: `${BRAND.darkCard}dd`, backdropFilter: "blur(10px)", border: `1px solid ${BRAND.cream}14`, borderLeft: `3px solid ${BRAND.tan}`, borderRadius: 10, padding: "1.4rem 1.6rem", textAlign: "left", cursor: "pointer", color: BRAND.cream, transition: "transform .18s ease, background .18s ease" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = `${BRAND.darkCard}ff`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = `${BRAND.darkCard}dd`; }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.3rem" }}>📚</span>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.tan }}>{user.name}'s Reading List</div>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.35rem", marginBottom: "0.3rem" }}>{user.name}'s Bookshelf</div>
            <p style={{ margin: 0, fontSize: "0.84rem", color: `${BRAND.cream}66`, lineHeight: 1.5 }}>Books on deck — covers, page counts, read time estimates.</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LOGIN SCREEN
// ---------------------------------------------------------------------------
const PASSWORDS = {
  amy: import.meta.env.VITE_PASSWORD_AMY || "estes",
  lynnell: import.meta.env.VITE_PASSWORD_LYNNELL || "grube",
};

const SESSION_KEY = "bookbrain:loggedInUser";

function LoginScreen({ onLogin }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (password === PASSWORDS[selectedUser]) {
      sessionStorage.setItem(SESSION_KEY, selectedUser);
      onLogin(selectedUser);
    } else {
      setError("Wrong password — try again.");
      setPassword("");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: BRAND.dark,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.2rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background image */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=80')",
        backgroundSize: "cover", backgroundPosition: "center",
        opacity: 1,
      }} />
      {/* Gradient overlay — heavier at bottom for readability */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(to bottom, ${BRAND.dark}22 0%, ${BRAND.dark}55 60%, ${BRAND.dark}aa 100%)`,
      }} />

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .shake { animation: shake 0.45s ease; }
        .user-btn:hover { transform: translateY(-2px); }
        .submit-btn:hover { opacity: 0.88; }
      `}</style>

      {/* Content */}
      <div style={{ position: "relative", width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Brand mark */}
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: `linear-gradient(135deg, ${BRAND.terracotta}, ${BRAND.coral})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "1.2rem", boxShadow: `0 4px 20px ${BRAND.coral}44`,
        }}>
          <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>🧠</span>
        </div>

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND.tan, marginBottom: "0.5rem", textAlign: "center" }}>Welcome to</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(2rem, 8vw, 3rem)", lineHeight: 1.05, margin: "0 0 0.35rem", color: BRAND.cream, textAlign: "center" }}>Book Brain</h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.88rem", color: `${BRAND.cream}66`, margin: "0 0 2.4rem", textAlign: "center", letterSpacing: "0.04em" }}>mybookbrain.com</p>

        <form onSubmit={handleSubmit} className={shake ? "shake" : ""} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          {/* User selector */}
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", letterSpacing: "0.14em", textTransform: "uppercase", color: `${BRAND.cream}55`, margin: "0 0 0.2rem", textAlign: "center" }}>Who's reading today?</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {Object.values(USERS).map((user) => {
              const active = selectedUser === user.id;
              return (
                <button
                  key={user.id}
                  type="button"
                  className="user-btn"
                  onClick={() => { setSelectedUser(user.id); setError(null); setPassword(""); }}
                  style={{
                    background: active ? `${user.accent}20` : `${BRAND.darkCard}cc`,
                    border: `2px solid ${active ? user.accent : `${BRAND.cream}18`}`,
                    borderRadius: 10, padding: "1.1rem 0.8rem", cursor: "pointer", color: BRAND.cream,
                    transition: "all .2s ease", textAlign: "center", backdropFilter: "blur(8px)",
                  }}
                >
                  <div style={{ fontSize: "1.6rem", marginBottom: "0.4rem" }}>📚</div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.2rem" }}>{user.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: active ? user.accent : `${BRAND.cream}44` }}>Book Mind</div>
                </button>
              );
            })}
          </div>

          {/* Password */}
          {selectedUser && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <input
                autoFocus
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder={`${USERS[selectedUser].name}'s password`}
                style={{
                  background: `${BRAND.darkCard}cc`, backdropFilter: "blur(8px)",
                  border: `1.5px solid ${error ? BRAND.coral : `${BRAND.cream}22`}`,
                  borderRadius: 8, padding: "0.9rem 1rem", color: BRAND.cream,
                  fontFamily: "'Inter', sans-serif", fontSize: "1rem", outline: "none",
                  transition: "border-color .15s ease", width: "100%",
                }}
              />
              {error && (
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: BRAND.coral, textAlign: "center" }}>{error}</div>
              )}
              <button
                type="submit"
                className="submit-btn"
                style={{
                  background: `linear-gradient(135deg, ${USERS[selectedUser].accent}, ${BRAND.terracotta})`,
                  border: "none", borderRadius: 8, padding: "0.95rem",
                  color: BRAND.cream, fontFamily: "'Fraunces', serif",
                  fontSize: "1.05rem", fontWeight: 700, cursor: "pointer",
                  boxShadow: `0 4px 16px ${USERS[selectedUser].accent}44`,
                  transition: "opacity .15s ease",
                }}
              >
                Enter {USERS[selectedUser].name}'s Book Mind →
              </button>
            </div>
          )}
        </form>
      </div>
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

  if (!loggedInUserId) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; }`}</style>
        <LoginScreen onLogin={handleLogin} />
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
    content = <UserHome user={activeUser} onOpenMyBooks={() => setScreen("myBooks")} onOpenShelf={() => setScreen("shelf")} onLogout={handleLogout} />;
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
