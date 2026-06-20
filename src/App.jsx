import React, { useState, useEffect, useCallback } from "react";
import { storage } from "./storage.js";

// ---------------------------------------------------------------------------
// DATA: one entry per book. Add more books by adding objects to this array.
//
// Each book has a `format`: "academic" | "simple" | "combined"
//   - "academic" uses: nodes, caseFile, keyLines, thread
//   - "simple" uses: simple.timeline (chronological events), simple.characters
//     (key people/case studies, each with a brief description and how they
//     connect to other people in the timeline)
//   - "combined" requires both sets of fields and renders both sections
// ---------------------------------------------------------------------------
const BOOKS = [
  {
    id: "tipping-point",
    title: "The Tipping Point",
    subtitle: "How Little Things Can Make a Big Difference",
    author: "Malcolm Gladwell",
    year: "2000",
    format: "academic",
    accent: "#C1432B",
    theme: {
      bg: "#EDE8DC",
      card: "#F7F4EC",
      ink: "#1A1612",
      inkSoft: "rgba(26,22,18,0.62)",
      inkFaint: "rgba(26,22,18,0.4)",
      border: "rgba(26,22,18,0.16)",
      display: "'Fraunces', serif",
      body: "'Inter', sans-serif",
      mono: "'JetBrains Mono', monospace",
      displayWeight: 600,
      headerBg: "#1A1612",
      headerInk: "#EDE8DC",
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
      bg: "#16140F",
      card: "#1F1B14",
      ink: "#F2ECDD",
      inkSoft: "rgba(242,236,221,0.66)",
      inkFaint: "rgba(242,236,221,0.42)",
      border: "rgba(242,236,221,0.16)",
      display: "'Fraunces', serif",
      body: "'Inter', sans-serif",
      mono: "'JetBrains Mono', monospace",
      displayWeight: 800,
      headerBg: "#E8B23D",
      headerInk: "#16140F",
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

function quotesKey(bookId) { return `quotes:${bookId}`; }
async function loadQuotes(bookId) {
  try { const res = await storage.get(quotesKey(bookId)); return res ? JSON.parse(res.value) : []; }
  catch (e) { return []; }
}
async function saveQuotes(bookId, items) {
  try { await storage.set(quotesKey(bookId), JSON.stringify(items)); } catch (e) {}
}

function chatKey(bookId) { return `chat:${bookId}`; }
async function loadChat(bookId) {
  try { const res = await storage.get(chatKey(bookId)); return res ? JSON.parse(res.value) : []; }
  catch (e) { return []; }
}
async function saveChat(bookId, messages) {
  try { await storage.set(chatKey(bookId), JSON.stringify(messages)); } catch (e) {}
}

function dateAddedKey(bookId) { return `dateAdded:${bookId}`; }
async function loadDateAdded(bookId) {
  try { const res = await storage.get(dateAddedKey(bookId)); return res ? res.value : null; }
  catch (e) { return null; }
}
async function saveDateAdded(bookId, dateStr) {
  try { await storage.set(dateAddedKey(bookId), dateStr); } catch (e) {}
}
function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
function formatCatalogDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function progressKey(bookId) { return `progress:${bookId}`; }
async function loadProgress(bookId) {
  try {
    const res = await storage.get(progressKey(bookId));
    return res ? JSON.parse(res.value) : null;
  } catch (e) {
    // missing key throws — that's expected for a book with no saved progress yet
    return null;
  }
}
async function saveProgress(bookId, data) {
  try {
    const result = await storage.set(progressKey(bookId), JSON.stringify(data));
    return !!result;
  } catch (e) {
    return false;
  }
}
function daysBetween(fromISO, toISO) {
  const a = new Date(fromISO + "T00:00:00");
  const b = new Date(toISO + "T00:00:00");
  return Math.round((b - a) / 86400000);
}

// ---------------------------------------------------------------------------
// SHELF: a lightweight "want to read" list, separate from the full My Books
// summaries. Seed entries below; user-added entries persist via storage.
// ---------------------------------------------------------------------------
const SHELF_SEED = [];

const SHELF_KEY = "shelf:books";
async function loadShelfBooks() {
  try {
    const res = await storage.get(SHELF_KEY);
    return res ? JSON.parse(res.value) : SHELF_SEED;
  } catch (e) {
    return SHELF_SEED;
  }
}
async function saveShelfBooks(list) {
  try {
    const result = await storage.set(SHELF_KEY, JSON.stringify(list));
    return !!result;
  } catch (e) {
    return false;
  }
}

// Reading status shared by both Bookshelf and My Books cards.
// One of: "to-read" | "up-next" | "reading" | "read"
function statusKey(id) { return `readStatus:${id}`; }
async function loadStatus(id) {
  try {
    const res = await storage.get(statusKey(id));
    return res ? res.value : null;
  } catch (e) {
    return null;
  }
}
async function saveStatus(id, status) {
  try {
    const result = await storage.set(statusKey(id), status);
    return !!result;
  } catch (e) {
    return false;
  }
}

// Custom books promoted from the shelf into My Books once marked
// "reading" or "read" — stored separately and merged with the static BOOKS
// array at render time.
const CUSTOM_BOOKS_KEY = "customBooks:list";
async function loadCustomBooks() {
  try {
    const res = await storage.get(CUSTOM_BOOKS_KEY);
    return res ? JSON.parse(res.value) : [];
  } catch (e) {
    return [];
  }
}
async function saveCustomBooks(list) {
  try {
    const result = await storage.set(CUSTOM_BOOKS_KEY, JSON.stringify(list));
    return !!result;
  } catch (e) {
    return false;
  }
}

// A minimal default theme for promoted/custom books that don't yet have
// a hand-tuned palette pulled from their cover art.
const DEFAULT_THEME = {
  bg: "#EDE8DC", card: "#F7F4EC", ink: "#1A1612",
  inkSoft: "rgba(26,22,18,0.62)", inkFaint: "rgba(26,22,18,0.4)", border: "rgba(26,22,18,0.16)",
  display: "'Fraunces', serif", body: "'Inter', sans-serif", mono: "'JetBrains Mono', monospace",
  displayWeight: 600, headerBg: "#1A1612", headerInk: "#EDE8DC",
};

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

function YourQuotes({ book }) {
  const theme = book.theme;
  const [quotes, setQuotes] = useState([]);
  const [text, setText] = useState("");
  const [page, setPage] = useState("");
  const [link, setLink] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    loadQuotes(book.id).then((items) => { if (active) { setQuotes(items); setLoaded(true); } });
    return () => { active = false; };
  }, [book.id]);

  const handleAdd = useCallback(async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const newItem = { id: Date.now().toString(36), text: trimmed, page: page.trim(), link: link.trim() };
    const updated = [...quotes, newItem];
    setQuotes(updated); setText(""); setPage(""); setLink("");
    await saveQuotes(book.id, updated);
  }, [text, page, link, quotes, book.id]);

  const handleDelete = useCallback(async (id) => {
    const updated = quotes.filter((q) => q.id !== id);
    setQuotes(updated);
    await saveQuotes(book.id, updated);
  }, [quotes, book.id]);

  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.8rem", marginBottom: "1.2rem" }}>
        <h3 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.3rem", margin: 0, color: theme.ink }}>Your quotes</h3>
        <span style={{ fontFamily: theme.mono, fontSize: "0.7rem", color: theme.inkFaint }}>synced to this artifact</span>
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
        <div style={{ fontFamily: theme.mono, fontSize: "0.8rem", color: theme.inkFaint, padding: "1.4rem", border: `1px dashed ${theme.border}`, borderRadius: 3, textAlign: "center" }}>No quotes saved yet for this book — add one above.</div>
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

function BookChat({ book }) {
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
    loadChat(book.id).then((items) => { if (active) { setMessages(items); setLoaded(true); } });
    return () => { active = false; };
  }, [book.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const systemPrompt = `You are a sharp, well-read research companion helping a reader go "down the rabbit hole" starting from the book "${book.title}" by ${book.author} (${book.year}). The book's core ideas: ${book.nodes.map(n => `${n.title} — ${n.dek}`).join(" ")} Central thread: ${book.thread} Use this as a jumping-off point, not a fence — the reader may follow tangents into adjacent ideas, other books, current events, or unrelated curiosities, and that's encouraged. You can use web search for further research on any topic that comes up. Be direct and substantive. Never reproduce more than a short paraphrase of any source's text — discuss ideas in your own words.`;

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
      const apiMessages = updated.map(m => ({ role: m.role, content: m.content }));
      // NOTE: in the Claude artifact sandbox, fetch("https://api.anthropic.com/...")
      // worked because Anthropic's infra injected auth invisibly. A standalone
      // deployed app has no such thing, and an API key must never be embedded
      // in client-side code. This now calls YOUR OWN backend endpoint instead —
      // a small serverless function (see /server/chat-example.js for a starting
      // point) that holds the real Anthropic API key server-side and forwards
      // the request. Set this to your deployed endpoint once it exists.
      const CHAT_ENDPOINT = import.meta.env.VITE_CHAT_ENDPOINT;
      if (!CHAT_ENDPOINT) {
        throw new Error("NO_ENDPOINT_CONFIGURED");
      }
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          messages: apiMessages,
        }),
      });
      const data = await response.json();
      const textBlocks = (data.content || []).filter(b => b.type === "text").map(b => b.text);
      const replyText = textBlocks.join("\n\n").trim() || "I wasn't able to generate a response.";
      const final = [...updated, { role: "assistant", content: replyText }];
      setMessages(final);
      await saveChat(book.id, final);
    } catch (err) {
      if (err.message === "NO_ENDPOINT_CONFIGURED") {
        setError("Chat isn't wired up yet — set VITE_CHAT_ENDPOINT to your backend's chat route (see /server/chat-example.js).");
      } else {
        setError("Something went wrong reaching the assistant. Try again.");
      }
      setMessages(updated);
    } finally {
      setSending(false);
    }
  }, [input, sending, messages, book.id, systemPrompt]);

  const handleClear = useCallback(async () => {
    setMessages([]);
    await saveChat(book.id, []);
  }, [book.id]);

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
            <div style={{ fontFamily: theme.mono, fontSize: "0.78rem", color: theme.inkFaint, lineHeight: 1.6 }}>
              No conversation yet. Start with the book or wander wherever it leads — try "What's the strongest critique of {book.nodes[0].title}?" or follow a tangent into something else entirely. Web search is enabled.
            </div>
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

function DateAddedInverted({ book }) {
  const theme = book.theme;
  const [date, setDate] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    loadDateAdded(book.id).then(async (val) => {
      if (!active) return;
      if (val) { setDate(val); }
      else {
        const today = todayISO();
        await saveDateAdded(book.id, today);
        if (active) setDate(today);
      }
      if (active) setLoaded(true);
    });
    return () => { active = false; };
  }, [book.id]);

  const startEdit = () => { setDraft(date || todayISO()); setEditing(true); };
  const commit = async () => {
    const val = draft || todayISO();
    setDate(val);
    setEditing(false);
    await saveDateAdded(book.id, val);
  };

  if (!loaded) return null;

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontFamily: theme.mono, fontSize: "0.72rem", color: `${theme.headerInk}aa` }}>
      <span style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>Added</span>
      {editing ? (
        <input
          type="date"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
          autoFocus
          style={{ background: theme.headerBg, border: `1px solid ${theme.headerInk}`, color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.72rem", padding: "0.2rem 0.4rem", borderRadius: 2 }}
        />
      ) : (
        <button onClick={startEdit} title="Click to edit" style={{ background: "none", border: "none", borderBottom: `1px dotted ${theme.headerInk}66`, color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.72rem", padding: 0, cursor: "pointer" }}>
          {formatCatalogDate(date)}
        </button>
      )}
    </div>
  );
}

function PageTracker({ book }) {
  const theme = book.theme;
  const accent = book.accent;
  const [loaded, setLoaded] = useState(false);

  // saved = last persisted state; draft = what's currently in the inputs
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
    loadProgress(book.id).then((data) => {
      if (!active) return;
      const next = {
        totalPages: data?.totalPages ?? 300,
        currentPage: data?.currentPage ?? 0,
        finishDate: data?.finishDate ?? "",
        dateFinished: data?.dateFinished ?? "",
      };
      setSaved(next);
      setTotalDraft(String(next.totalPages));
      setPageDraft(String(next.currentPage));
      setFinishDateDraft(next.finishDate);
      setDateFinishedDraft(next.dateFinished);
      setLoaded(true);
    });
    return () => { active = false; };
  }, [book.id]);

  const isDirty =
    totalDraft !== String(saved.totalPages) ||
    pageDraft !== String(saved.currentPage) ||
    finishDateDraft !== saved.finishDate ||
    dateFinishedDraft !== saved.dateFinished;

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    const total = Math.max(1, parseInt(totalDraft, 10) || 1);
    const current = Math.max(0, Math.min(total, parseInt(pageDraft, 10) || 0));
    const justFinished = current >= total && saved.currentPage < saved.totalPages;
    const dateFinishedFinal = dateFinishedDraft || (justFinished ? todayISO() : "");

    const next = { totalPages: total, currentPage: current, finishDate: finishDateDraft, dateFinished: dateFinishedFinal };

    const ok = await saveProgress(book.id, next);

    if (!ok) {
      setSaving(false);
      setSaveError("Save failed — storage didn't confirm the write. Try again.");
      return;
    }

    // verify by reading back, since silent partial failures are otherwise invisible
    const confirmed = await loadProgress(book.id);
    const verified = confirmed
      && confirmed.totalPages === next.totalPages
      && confirmed.currentPage === next.currentPage
      && confirmed.finishDate === next.finishDate
      && confirmed.dateFinished === next.dateFinished;

    setSaving(false);

    if (!verified) {
      setSaveError("Save didn't stick — storage returned different data than expected. Try again.");
      return;
    }

    setSaved(next);
    setTotalDraft(String(total));
    setPageDraft(String(current));
    setDateFinishedDraft(dateFinishedFinal);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  if (!loaded) return null;

  const totalPages = Math.max(1, parseInt(totalDraft, 10) || 1);
  const currentPage = Math.max(0, Math.min(totalPages, parseInt(pageDraft, 10) || 0));
  const pct = totalPages > 0 ? Math.min(100, Math.round((currentPage / totalPages) * 100)) : 0;
  const pagesLeft = Math.max(0, totalPages - currentPage);
  const finished = currentPage >= totalPages && totalPages > 0;

  let paceMessage = null;
  if (finished) {
    paceMessage = dateFinishedDraft ? `Finished on ${formatCatalogDate(dateFinishedDraft)}.` : "Finished — save to record today's date.";
  } else if (finishDateDraft) {
    const today = todayISO();
    const daysLeft = daysBetween(today, finishDateDraft);
    if (daysLeft <= 0) {
      paceMessage = pagesLeft > 0 ? `Target date has passed — ${pagesLeft} pages still to go.` : "Finished — nice work.";
    } else {
      const perDay = Math.ceil(pagesLeft / daysLeft);
      paceMessage = `Read ${perDay} ${perDay === 1 ? "page" : "pages"}/day for ${daysLeft} ${daysLeft === 1 ? "day" : "days"} to finish by ${formatCatalogDate(finishDateDraft)}.`;
    }
  }

  const stops = 10;

  return (
    <div style={{ marginBottom: "2.4rem", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 4, padding: "1.6rem 1.8rem", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.3rem" }}>
        <span style={{ fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: accent }}>Reading tracker</span>
        <span style={{ fontFamily: theme.mono, fontSize: "0.74rem", color: theme.inkSoft }}>
          Page{" "}
          <input
            type="number"
            min={0}
            max={totalPages}
            value={pageDraft}
            onChange={(e) => setPageDraft(e.target.value)}
            style={{ width: 52, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.mono, fontSize: "0.74rem", textAlign: "center", borderRadius: 2, padding: "0.15rem 0.1rem" }}
          />{" "}
          of{" "}
          <input
            type="number"
            min={1}
            value={totalDraft}
            onChange={(e) => setTotalDraft(e.target.value)}
            style={{ width: 56, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.mono, fontSize: "0.74rem", textAlign: "center", borderRadius: 2, padding: "0.15rem 0.1rem" }}
          />{" "}
          pages
        </span>
      </div>

      {/* Domino's-style segmented tracker */}
      <div style={{ position: "relative", padding: "0 0 0.6rem" }}>
        <div style={{ position: "relative", height: 10, borderRadius: 6, background: theme.border, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`, background: accent, borderRadius: 6, transition: "width .35s ease" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex" }}>
            {Array.from({ length: stops - 1 }).map((_, i) => (
              <div key={i} style={{ flex: 1, borderRight: i < stops - 2 ? `2px solid ${theme.bg}` : "none" }} />
            ))}
          </div>
        </div>
        {/* moving marker */}
        <div style={{ position: "absolute", top: -7, left: `calc(${pct}% - 11px)`, width: 22, height: 22, borderRadius: "50%", background: theme.headerBg, border: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.35)", transition: "left .35s ease" }}>
          <span style={{ fontSize: "0.85rem" }} role="img" aria-label="bookmark">🔖</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: theme.mono, fontSize: "0.66rem", letterSpacing: "0.04em", color: theme.inkFaint, marginBottom: "1.4rem" }}>
        <span>START</span>
        <span style={{ color: accent, fontWeight: 700 }}>{pct}%</span>
        <span>{finished ? "FINISHED" : "THE END"}</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.4rem", alignItems: "flex-end", justifyContent: "space-between", paddingTop: "1.1rem", borderTop: `1px solid ${theme.border}`, marginBottom: "1.2rem" }}>
        <div>
          {finished ? (
            <>
              <div style={{ fontFamily: theme.mono, fontSize: "0.64rem", letterSpacing: "0.1em", textTransform: "uppercase", color: theme.inkFaint, marginBottom: "0.4rem" }}>Date finished</div>
              <input
                type="date"
                value={dateFinishedDraft}
                onChange={(e) => setDateFinishedDraft(e.target.value)}
                style={{ background: theme.bg, border: `1px solid ${accent}`, color: theme.ink, fontFamily: theme.mono, fontSize: "0.78rem", padding: "0.35rem 0.55rem", borderRadius: 3 }}
              />
            </>
          ) : (
            <>
              <div style={{ fontFamily: theme.mono, fontSize: "0.64rem", letterSpacing: "0.1em", textTransform: "uppercase", color: theme.inkFaint, marginBottom: "0.4rem" }}>Target finish date</div>
              <input
                type="date"
                value={finishDateDraft}
                onChange={(e) => setFinishDateDraft(e.target.value)}
                style={{ background: theme.bg, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.mono, fontSize: "0.78rem", padding: "0.35rem 0.55rem", borderRadius: 3 }}
              />
              {finishDateDraft && (
                <button onClick={() => setFinishDateDraft("")} style={{ marginLeft: "0.5rem", background: "none", border: "none", color: theme.inkFaint, fontFamily: theme.mono, fontSize: "0.7rem", textDecoration: "underline", cursor: "pointer" }}>clear</button>
              )}
            </>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 220, textAlign: "right" }}>
          {paceMessage ? (
            <p style={{ margin: 0, fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "0.98rem", color: theme.ink, lineHeight: 1.4 }}>{paceMessage}</p>
          ) : (
            <p style={{ margin: 0, fontFamily: theme.mono, fontSize: "0.76rem", color: theme.inkFaint }}>{pagesLeft} pages left · set a finish date for a daily pace</p>
          )}
        </div>
      </div>

      {saveError && (
        <div style={{ marginBottom: "0.8rem", padding: "0.7rem 1rem", background: "#C1432B14", border: "1px solid #C1432B55", borderRadius: 3, fontFamily: theme.mono, fontSize: "0.74rem", color: "#C1432B" }}>
          {saveError}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.8rem" }}>
        {justSaved && (
          <span style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: accent }}>✓ Saved</span>
        )}
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          style={{
            background: isDirty && !saving ? accent : theme.border,
            border: "none",
            color: isDirty && !saving ? theme.headerInk : theme.inkFaint,
            fontFamily: theme.mono,
            fontSize: "0.74rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontWeight: 700,
            padding: "0.55rem 1.3rem",
            borderRadius: 3,
            cursor: isDirty && !saving ? "pointer" : "default",
          }}
        >
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

function Timeline({ events, accent, theme }) {
  return (
    <div style={{ position: "relative", paddingLeft: "1.6rem" }}>
      <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 2, background: theme.border }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "1.6rem" }}>
        {events.map((ev, i) => (
          <div key={i} style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "-1.6rem", top: "0.3rem", width: 10, height: 10, borderRadius: "50%", background: accent, border: `2px solid ${theme.bg}`, boxShadow: `0 0 0 1px ${theme.border}` }} />
            <div style={{ fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase", color: accent, marginBottom: "0.3rem" }}>{ev.when}</div>
            <div style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.05rem", color: theme.ink, marginBottom: "0.25rem", lineHeight: 1.25 }}>{ev.title}</div>
            <p style={{ fontSize: "0.86rem", lineHeight: 1.55, color: theme.inkSoft, margin: 0, maxWidth: "62ch" }}>{ev.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CharacterOutline({ characters, accent, theme }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
      {characters.map((c, i) => (
        <div key={i} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 4, padding: "1.3rem 1.4rem" }}>
          <div style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.1rem", color: theme.ink, marginBottom: "0.4rem", lineHeight: 1.2 }}>{c.name}</div>
          {c.role && <div style={{ fontFamily: theme.mono, fontSize: "0.66rem", letterSpacing: "0.08em", textTransform: "uppercase", color: accent, marginBottom: "0.6rem" }}>{c.role}</div>}
          <p style={{ fontSize: "0.85rem", lineHeight: 1.55, color: theme.inkSoft, margin: c.connections ? "0 0 0.7rem" : 0 }}>{c.description}</p>
          {c.connections && (
            <p style={{ fontSize: "0.78rem", lineHeight: 1.5, color: theme.inkFaint, margin: 0, paddingTop: "0.6rem", borderTop: `1px solid ${theme.border}` }}>
              <span style={{ fontFamily: theme.mono, fontSize: "0.66rem", letterSpacing: "0.06em", textTransform: "uppercase", color: theme.inkFaint }}>Connected to: </span>
              {c.connections}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function SimpleSections({ book, theme }) {
  return (
    <>
      <h2 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.7rem", margin: "0 0 1.3rem", color: theme.ink }}>Timeline</h2>
      <Timeline events={book.simple.timeline} accent={book.accent} theme={theme} />
      <h2 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.7rem", margin: "3.2rem 0 1.3rem", color: theme.ink }}>Who's who</h2>
      <CharacterOutline characters={book.simple.characters} accent={book.accent} theme={theme} />
    </>
  );
}

function FormatToggle({ available, view, setView, accent, theme }) {
  const labels = { academic: "Academic", simple: "Simple", combined: "Combined" };
  return (
    <div style={{ display: "inline-flex", border: `1px solid ${theme.border}`, borderRadius: 4, overflow: "hidden", marginBottom: "1.6rem" }}>
      {available.map((key, i) => {
        const active = view === key;
        return (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              background: active ? accent : "transparent",
              color: active ? theme.headerInk : theme.inkSoft,
              border: "none",
              borderLeft: i === 0 ? "none" : `1px solid ${theme.border}`,
              fontFamily: theme.mono,
              fontSize: "0.7rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              fontWeight: active ? 700 : 500,
              transition: "background .15s ease, color .15s ease",
            }}
          >
            {labels[key]}
          </button>
        );
      })}
    </div>
  );
}

function BookDashboard({ book, onBack }) {
  const theme = book.theme;
  const hasAcademic = !!(book.nodes && book.caseFile && book.keyLines && book.thread);
  const hasSimple = !!(book.simple && book.simple.timeline && book.simple.characters);
  const available = [];
  if (hasAcademic) available.push("academic");
  if (hasSimple) available.push("simple");
  if (hasAcademic && hasSimple) available.push("combined");

  const defaultView = book.format && available.includes(book.format) ? book.format : (available[0] || "academic");
  const [view, setView] = useState(defaultView);
  const [openNode, setOpenNode] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.ink }}>
      <div style={{ padding: "1.4rem 1.8rem", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", gap: "1rem", background: theme.headerBg }}>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${theme.headerInk}55`, color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.75rem", padding: "0.5rem 0.9rem", borderRadius: 3, cursor: "pointer" }}>← All books</button>
        <span style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: `${theme.headerInk}99` }}>{book.author} · {book.year}</span>
        <span style={{ marginLeft: "auto", color: theme.headerInk }}><DateAddedInverted book={book} /></span>
      </div>
      <div style={{ padding: "3rem 1.8rem 5rem", maxWidth: 980, margin: "0 auto" }}>
        <div style={{ fontFamily: theme.mono, fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: book.accent, marginBottom: "0.8rem" }}>Book summary</div>
        <h1 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.02, margin: "0 0 0.6rem", color: theme.ink }}>{book.title}</h1>
        <p style={{ fontSize: "1rem", color: theme.inkSoft, margin: "0 0 1.6rem", maxWidth: "60ch", lineHeight: 1.5 }}>{book.tagline}</p>

        <PageTracker book={book} />

        {!hasAcademic && !hasSimple && (
          <div style={{ marginBottom: "2.4rem", padding: "1.2rem 1.5rem", border: `1px dashed ${theme.border}`, borderRadius: 4, fontFamily: theme.mono, fontSize: "0.78rem", color: theme.inkFaint, lineHeight: 1.6 }}>
            This book was added from the bookshelf and doesn't have a summary yet. Ask Claude in chat to write one up — academic, simple, or combined.
          </div>
        )}

        {available.length > 1 && (
          <FormatToggle available={available} view={view} setView={setView} accent={book.accent} theme={theme} />
        )}

        {view === "academic" && hasAcademic && (
          <AcademicSections book={book} theme={theme} openNode={openNode} setOpenNode={setOpenNode} />
        )}

        {view === "simple" && hasSimple && (
          <SimpleSections book={book} theme={theme} />
        )}

        {view === "combined" && hasAcademic && hasSimple && (
          <>
            <AcademicSections book={book} theme={theme} openNode={openNode} setOpenNode={setOpenNode} />
            <div style={{ marginTop: "3.6rem", paddingTop: "2.4rem", borderTop: `2px solid ${theme.border}` }}>
              <SimpleSections book={book} theme={theme} />
            </div>
          </>
        )}

        <YourQuotes book={book} />
        <BookChat book={book} />
      </div>
    </div>
  );
}

function StatusBadge({ status, accent }) {
  if (status === "read") {
    return (
      <div
        title="Finished"
        style={{
          position: "absolute", top: -6, right: -10, width: 34, height: 34, borderRadius: "50%",
          background: accent, border: "2px solid #F4EFE4", display: "flex", alignItems: "center", justifyContent: "center",
          transform: "rotate(-12deg)", boxShadow: "0 2px 5px rgba(0,0,0,0.4)",
        }}
      >
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.03em", color: "#1A1610", textAlign: "center", lineHeight: 1.05 }}>READ</span>
      </div>
    );
  }
  if (status === "reading") {
    return (
      <div
        title="Currently reading"
        style={{
          position: "absolute", top: -6, right: -14, width: 16, height: 38, background: accent,
          boxShadow: "0 2px 5px rgba(0,0,0,0.4)", clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)",
          display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "6px",
        }}
      >
        <span style={{ fontSize: "0.6rem" }} role="img" aria-label="reading">📖</span>
      </div>
    );
  }
  if (status === "up-next") {
    return (
      <div
        title="Up next"
        style={{
          position: "absolute", top: -8, right: -8, width: 28, height: 28, borderRadius: "50%",
          background: "#1A1612", border: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 5px rgba(0,0,0,0.4)",
        }}
      >
        <span style={{ fontSize: "0.72rem", color: accent }}>▶</span>
      </div>
    );
  }
  // to-read
  return (
    <div
      title="To read"
      style={{
        position: "absolute", top: -6, right: -10, width: 30, height: 30, borderRadius: "50%",
        background: "#F4EFE4", border: `2px solid ${accent}`, display: "flex", alignItems: "center", justifyContent: "center",
        transform: "rotate(-12deg)", boxShadow: "0 2px 5px rgba(0,0,0,0.35)",
      }}
    >
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.42rem", fontWeight: 700, letterSpacing: "0.02em", color: accent, textAlign: "center", lineHeight: 1.05 }}>TO<br/>READ</span>
    </div>
  );
}

function CatalogCard({ book, onSelect }) {
  const [date, setDate] = useState(null);
  const [readStatus, setReadStatus] = useState("to-read");

  useEffect(() => {
    let active = true;
    loadDateAdded(book.id).then(async (val) => {
      if (!active) return;
      if (val) { setDate(val); }
      else {
        const today = todayISO();
        await saveDateAdded(book.id, today);
        if (active) setDate(today);
      }
    });
    (async () => {
      const manualStatus = await loadStatus(book.id);
      if (!active) return;
      if (manualStatus) {
        setReadStatus(manualStatus);
        return;
      }
      // fall back to deriving status from the page tracker if no manual status saved yet
      const data = await loadProgress(book.id);
      if (!active) return;
      const total = data?.totalPages ?? 0;
      const current = data?.currentPage ?? 0;
      if (total > 0 && current >= total) setReadStatus("read");
      else if (current > 0) setReadStatus("reading");
      else setReadStatus("to-read");
    })();
    return () => { active = false; };
  }, [book.id]);

  const callNumber = `${book.author.split(" ").pop().slice(0, 3).toUpperCase()}-${book.year}`;

  return (
    <button
      onClick={() => onSelect(book.id)}
      style={{
        position: "relative",
        display: "flex",
        gap: "1.1rem",
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
        background: "#F4EFE4",
        color: "#1A1610",
        border: "1px solid #D8CDB4",
        borderRadius: 2,
        padding: "1.3rem 1.5rem 1.3rem 1.7rem",
        boxShadow: "0 3px 0 rgba(0,0,0,0.18), 0 8px 14px rgba(0,0,0,0.28)",
        transition: "transform .18s ease, box-shadow .18s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 5px 0 rgba(0,0,0,0.2), 0 14px 20px rgba(0,0,0,0.32)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 3px 0 rgba(0,0,0,0.18), 0 8px 14px rgba(0,0,0,0.28)"; }}
    >
      {/* punch hole, card-catalog style */}
      <span style={{ position: "absolute", top: "1.3rem", left: "0.55rem", width: 9, height: 9, borderRadius: "50%", background: "#0F1A2B", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)" }} />
      {/* tab edge in book accent */}
      <span style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 5, background: book.accent }} />

      <div style={{ position: "relative", flexShrink: 0 }}>
        <img src={book.cover} alt={book.title} style={{ width: 56, height: 82, objectFit: "cover", display: "block", boxShadow: "0 2px 6px rgba(0,0,0,0.35)" }} onError={(e) => { e.target.style.display = "none"; }} />
        <StatusBadge status={readStatus} accent={book.accent} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.6rem", marginBottom: "0.45rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", letterSpacing: "0.08em", color: book.accent, fontWeight: 600 }}>{callNumber}</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.62rem", letterSpacing: "0.05em", color: "rgba(26,22,16,0.45)", whiteSpace: "nowrap" }}>{date ? formatCatalogDate(date) : "—"}</span>
        </div>
        <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: "1.18rem", lineHeight: 1.2, marginBottom: "0.25rem" }}>{book.title}</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontStyle: "italic", fontSize: "0.82rem", color: "rgba(26,22,16,0.55)", marginBottom: "0.55rem" }}>{book.subtitle}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(26,22,16,0.6)" }}>{book.author}</span>
          <span style={{ flex: 1, borderBottom: "1px dotted rgba(26,22,16,0.3)", height: 1 }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "rgba(26,22,16,0.6)" }}>{book.year}</span>
        </div>
      </div>
    </button>
  );
}

function AddBookCard() {
  const [showHint, setShowHint] = useState(false);
  return (
    <div>
      <button
        onClick={() => setShowHint((s) => !s)}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.6rem",
          textAlign: "left",
          cursor: "pointer",
          width: "100%",
          background: "transparent",
          color: "rgba(244,239,228,0.55)",
          border: "1px dashed rgba(244,239,228,0.32)",
          borderRadius: 2,
          padding: "1.1rem 1.5rem",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.78rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          transition: "border-color .15s ease, color .15s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(244,239,228,0.6)"; e.currentTarget.style.color = "#F4EFE4"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(244,239,228,0.32)"; e.currentTarget.style.color = "rgba(244,239,228,0.55)"; }}
      >
        <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span>
        <span>Add a book</span>
      </button>
      {showHint && (
        <div style={{ marginTop: "0.8rem", padding: "1rem 1.2rem", background: "rgba(244,239,228,0.05)", border: "1px solid rgba(244,239,228,0.14)", borderRadius: 3, fontFamily: "'Inter', sans-serif", fontSize: "0.84rem", lineHeight: 1.55, color: "rgba(244,239,228,0.7)" }}>
          New cards can't be filled in from inside the catalog — head back to the chat and tell Claude the book's title and author, and which summary type you'd like: <em>academic</em>, <em>simple</em>, or <em>combined</em>. Claude will write it up and add it here.
        </div>
      )}
    </div>
  );
}

function MyBooksHome({ onSelect, onBackToLanding }) {
  const [customBooks, setCustomBooks] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadCustomBooks().then((list) => {
      if (active) { setCustomBooks(list); setLoaded(true); }
    });
    return () => { active = false; };
  }, []);

  const allBooks = [...BOOKS, ...customBooks];

  return (
    <div style={{ minHeight: "100vh", background: "#0F1A2B", padding: "0 0 5rem" }}>
      {/* drawer rail */}
      <div style={{ background: "linear-gradient(180deg, #2A2118, #1C160F)", borderBottom: "3px solid #0B0805", padding: "2.6rem 1.8rem 2.2rem", textAlign: "center", position: "relative" }}>
        <button
          onClick={onBackToLanding}
          style={{ position: "absolute", top: "1.4rem", left: "1.4rem", background: "none", border: "1px solid rgba(244,239,228,0.3)", color: "rgba(244,239,228,0.7)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", padding: "0.4rem 0.8rem", borderRadius: 3, cursor: "pointer" }}
        >
          ← Home
        </button>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#D9A24B", marginBottom: "0.7rem" }}>Card Catalog</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(2.1rem, 5.5vw, 3.2rem)", lineHeight: 1.05, margin: "0 0 0.5rem", color: "#F4EFE4" }}>My Books</h1>
        <p style={{ color: "rgba(244,239,228,0.55)", fontSize: "0.92rem", margin: "0 auto", maxWidth: "46ch", lineHeight: 1.5 }}>Drawer of personal book summaries — pull a card to open the full entry.</p>
        {/* brass drawer pull */}
        <div style={{ width: 64, height: 6, background: "linear-gradient(180deg, #D9A24B, #8a6a2e)", borderRadius: 3, margin: "1.6rem auto 0", boxShadow: "0 2px 4px rgba(0,0,0,0.5)" }} />
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "2.6rem 1.8rem 0" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,239,228,0.4)", marginBottom: "1.1rem", borderBottom: "1px solid rgba(244,239,228,0.14)", paddingBottom: "0.6rem" }}>
          {allBooks.length} {allBooks.length === 1 ? "entry" : "entries"} on file
        </div>
        {!loaded ? (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: "rgba(244,239,228,0.4)", padding: "1rem 0" }}>Loading…</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {allBooks.map((book) => (<CatalogCard key={book.id} book={book} onSelect={onSelect} />))}
          </div>
        )}
        <div style={{ marginTop: "1.3rem" }}>
          <AddBookCard />
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
  const minutes = Math.round((pages * 250) / 200); // ~250 wpm reading, ~200 words/page
  const hours = Math.round((minutes / 60) * 10) / 10;
  return hours;
}

function ShelfSpine({ shelfBook, status, onClick }) {
  const accent = shelfBook.accent || "#7A8B6F";
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 92,
        flexShrink: 0,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
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
      {/* shelf ledge shadow under each spine */}
      <div style={{ position: "absolute", bottom: -8, left: "10%", right: "10%", height: 6, background: "radial-gradient(ellipse at center, rgba(0,0,0,0.35), transparent 70%)" }} />
    </button>
  );
}

function ShelfRow({ books, statuses, onOpen }) {
  return (
    <div style={{ position: "relative", marginBottom: "2.6rem" }}>
      <div style={{ display: "flex", gap: "1.4rem", overflowX: "auto", paddingBottom: "1.4rem", paddingTop: "0.4rem" }}>
        {books.map((b) => (
          <ShelfSpine key={b.id} shelfBook={b} status={statuses[b.id] || "to-read"} onClick={() => onOpen(b)} />
        ))}
      </div>
      {/* wooden shelf ledge */}
      <div style={{ height: 14, background: "linear-gradient(180deg, #6B4A2E, #4A311C)", borderRadius: 2, boxShadow: "0 4px 8px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.08)" }} />
    </div>
  );
}

function ShelfPopup({ shelfBook, status, onClose, onStatusChange }) {
  const accent = shelfBook.accent || "#7A8B6F";
  const readHours = estimateReadTime(shelfBook.pages);
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,26,43,0.78)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#F4EFE4", color: "#1A1612", borderRadius: 4, maxWidth: 420, width: "100%", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
      >
        <div style={{ display: "flex", gap: "1.1rem", padding: "1.6rem", borderBottom: `3px solid ${accent}` }}>
          {shelfBook.cover ? (
            <img src={shelfBook.cover} alt={shelfBook.title} style={{ width: 76, height: 112, objectFit: "cover", flexShrink: 0, boxShadow: "0 3px 8px rgba(0,0,0,0.3)" }} onError={(e) => { e.target.style.display = "none"; }} />
          ) : (
            <div style={{ width: 76, height: 112, background: accent, flexShrink: 0 }} />
          )}
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
          {shelfBook.needsDetails ? (
            <p style={{ fontSize: "0.86rem", lineHeight: 1.6, color: "rgba(26,22,18,0.6)", margin: "0 0 1.2rem" }}>
              Cover, page count, and summary haven't been filled in yet — ask Claude in chat to look up details for "{shelfBook.title}" by {shelfBook.author}.
            </p>
          ) : (
            <p style={{ fontSize: "0.88rem", lineHeight: 1.6, color: "rgba(26,22,18,0.78)", margin: "0 0 1.2rem" }}>{shelfBook.summary}</p>
          )}

          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(26,22,18,0.5)", marginBottom: "0.6rem" }}>Status</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.4rem" }}>
            {["to-read", "up-next", "reading", "read"].map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                style={{
                  background: status === s ? accent : "transparent",
                  border: `1px solid ${status === s ? accent : "rgba(26,22,18,0.25)"}`,
                  color: status === s ? "#1A1612" : "rgba(26,22,18,0.65)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.68rem",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  padding: "0.4rem 0.7rem",
                  borderRadius: 3,
                  cursor: "pointer",
                  fontWeight: status === s ? 700 : 500,
                }}
              >
                {s === "to-read" ? "To read" : s === "up-next" ? "Up next" : s === "reading" ? "Reading" : "Read"}
              </button>
            ))}
          </div>

          {(status === "reading" || status === "read") && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: accent, margin: "0 0 1rem", lineHeight: 1.5 }}>
              This moves the book into My Books, where it gets its own full page tracker.
            </p>
          )}

          <button
            onClick={onClose}
            style={{ width: "100%", background: "#1A1612", border: "none", color: "#F4EFE4", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.74rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.7rem", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function AddShelfBookCard({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    onAdd({ title: title.trim(), author: author.trim() });
    setTitle("");
    setAuthor("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
          width: 92, height: 124, flexShrink: 0, background: "transparent",
          border: "1px dashed rgba(244,239,228,0.32)", color: "rgba(244,239,228,0.55)",
          fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", cursor: "pointer", flexDirection: "column",
        }}
      >
        <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>+</span>
        <span>Add book</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: 220, flexShrink: 0, background: "#162338", border: "1px solid rgba(244,239,228,0.2)",
        borderRadius: 4, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem",
      }}
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        style={{ background: "#0F1A2B", border: "1px solid rgba(244,239,228,0.28)", color: "#F4EFE4", fontFamily: "'Fraunces', serif", fontSize: "0.85rem", padding: "0.5rem 0.7rem", borderRadius: 3 }}
      />
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Author"
        style={{ background: "#0F1A2B", border: "1px solid rgba(244,239,228,0.28)", color: "#F4EFE4", fontFamily: "'Inter', sans-serif", fontSize: "0.82rem", padding: "0.5rem 0.7rem", borderRadius: 3 }}
      />
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit" style={{ flex: 1, background: "#D9A24B", border: "none", color: "#1A1612", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em", padding: "0.5rem", borderRadius: 3, cursor: "pointer", fontWeight: 700 }}>Add</button>
        <button type="button" onClick={() => setOpen(false)} style={{ background: "none", border: "1px solid rgba(244,239,228,0.28)", color: "rgba(244,239,228,0.6)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", padding: "0.5rem 0.7rem", borderRadius: 3, cursor: "pointer" }}>Cancel</button>
      </div>
      <p style={{ margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", color: "rgba(244,239,228,0.4)", lineHeight: 1.5 }}>
        Cover, page count, and summary get filled in after — ask Claude in chat once it's added.
      </p>
    </form>
  );
}

function Bookshelf({ onBackToLanding, onPromote }) {
  const [shelfBooks, setShelfBooks] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [activeBook, setActiveBook] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const list = await loadShelfBooks();
      if (!active) return;
      setShelfBooks(list);
      const statusEntries = await Promise.all(list.map(async (b) => [b.id, (await loadStatus(b.id)) || "to-read"]));
      if (!active) return;
      setStatuses(Object.fromEntries(statusEntries));
      setLoaded(true);
    })();
    return () => { active = false; };
  }, []);

  const handleAdd = async ({ title, author }) => {
    const id = `shelf-${Date.now().toString(36)}`;
    const newBook = { id, title, author, cover: null, pages: null, summary: null, accent: "#7A8B6F", needsDetails: true };
    const updated = [...shelfBooks, newBook];
    setShelfBooks(updated);
    setStatuses((s) => ({ ...s, [id]: "to-read" }));
    await saveShelfBooks(updated);
    await saveStatus(id, "to-read");
  };

  const handleStatusChange = async (book, newStatus) => {
    setStatuses((s) => ({ ...s, [book.id]: newStatus }));
    await saveStatus(book.id, newStatus);
    if (newStatus === "reading" || newStatus === "read") {
      await onPromote(book, newStatus);
    }
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
        <button
          onClick={onBackToLanding}
          style={{ position: "absolute", top: "1.4rem", left: "1.4rem", background: "none", border: "1px solid rgba(244,239,228,0.3)", color: "rgba(244,239,228,0.7)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", padding: "0.4rem 0.8rem", borderRadius: 3, cursor: "pointer" }}
        >
          ← Home
        </button>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#D9A24B", marginBottom: "0.7rem" }}>Want to read</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(2.1rem, 5.5vw, 3.2rem)", lineHeight: 1.05, margin: "0 0 0.5rem", color: "#F4EFE4" }}>Bookshelf</h1>
        <p style={{ color: "rgba(244,239,228,0.55)", fontSize: "0.92rem", margin: "0 auto", maxWidth: "46ch", lineHeight: 1.5 }}>Browse what's on the shelf — tap a cover for a quick look.</p>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "2.8rem 1.8rem 0" }}>
        {!loaded ? (
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", color: "rgba(244,239,228,0.4)" }}>Loading shelf…</div>
        ) : (
          <>
            {grouped["up-next"].length > 0 && (
              <>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,239,228,0.4)", marginBottom: "0.8rem" }}>Up next</div>
                <ShelfRow books={grouped["up-next"]} statuses={statuses} onOpen={setActiveBook} />
              </>
            )}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,239,228,0.4)", marginBottom: "0.8rem" }}>To read</div>
            <div style={{ position: "relative", marginBottom: "2.6rem" }}>
              <div style={{ display: "flex", gap: "1.4rem", overflowX: "auto", paddingBottom: "1.4rem", paddingTop: "0.4rem" }}>
                {grouped["to-read"].map((b) => (
                  <ShelfSpine key={b.id} shelfBook={b} status={statuses[b.id] || "to-read"} onClick={() => setActiveBook(b)} />
                ))}
                <AddShelfBookCard onAdd={handleAdd} />
              </div>
              <div style={{ height: 14, background: "linear-gradient(180deg, #6B4A2E, #4A311C)", borderRadius: 2, boxShadow: "0 4px 8px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.08)" }} />
            </div>

            {grouped["reading"].length > 0 && (
              <>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,239,228,0.4)", marginBottom: "0.8rem" }}>Currently reading</div>
                <ShelfRow books={grouped["reading"]} statuses={statuses} onOpen={setActiveBook} />
              </>
            )}
            {grouped["read"].length > 0 && (
              <>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(244,239,228,0.4)", marginBottom: "0.8rem" }}>Read</div>
                <ShelfRow books={grouped["read"]} statuses={statuses} onOpen={setActiveBook} />
              </>
            )}
          </>
        )}
      </div>

      {activeBook && (
        <ShelfPopup
          shelfBook={activeBook}
          status={statuses[activeBook.id] || "to-read"}
          onClose={() => setActiveBook(null)}
          onStatusChange={(s) => handleStatusChange(activeBook, s)}
        />
      )}
    </div>
  );
}

function Landing({ onOpenMyBooks, onOpenShelf }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0F1A2B", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 1.8rem" }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#C1432B", marginBottom: "1rem" }}>Library</div>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "clamp(2.2rem, 6vw, 3.2rem)", lineHeight: 1.05, margin: "0 0 2.6rem", color: "#F4EFE4", textAlign: "center" }}>Welcome back</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", width: "100%", maxWidth: 420 }}>
        <button
          onClick={onOpenMyBooks}
          style={{
            background: "#162338", border: "1px solid rgba(244,239,228,0.18)", borderLeft: "4px solid #C1432B",
            borderRadius: 4, padding: "1.6rem 1.8rem", textAlign: "left", cursor: "pointer", color: "#F4EFE4",
            transition: "transform .18s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
        >
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#C1432B", marginBottom: "0.5rem" }}>Card catalog</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", marginBottom: "0.4rem" }}>My Books</div>
          <p style={{ margin: 0, fontSize: "0.86rem", color: "rgba(244,239,228,0.6)", lineHeight: 1.5 }}>Full summaries — key ideas, highlighted stories, your quotes, and reading trackers.</p>
        </button>

        <button
          onClick={onOpenShelf}
          style={{
            background: "#162338", border: "1px solid rgba(244,239,228,0.18)", borderLeft: "4px solid #D9A24B",
            borderRadius: 4, padding: "1.6rem 1.8rem", textAlign: "left", cursor: "pointer", color: "#F4EFE4",
            transition: "transform .18s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
        >
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#D9A24B", marginBottom: "0.5rem" }}>Want to read</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: "1.5rem", marginBottom: "0.4rem" }}>Bookshelf</div>
          <p style={{ margin: 0, fontSize: "0.86rem", color: "rgba(244,239,228,0.6)", lineHeight: 1.5 }}>A visual shelf of books on deck — covers, page counts, and estimated read time.</p>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing"); // "landing" | "myBooks" | "shelf"
  const [activeId, setActiveId] = useState(null);
  const [customBooksVersion, setCustomBooksVersion] = useState(0);

  const handlePromote = async (shelfBook, status) => {
    const existing = await loadCustomBooks();
    if (existing.some((b) => b.id === shelfBook.id)) return; // already promoted
    const promoted = {
      id: shelfBook.id,
      title: shelfBook.title,
      subtitle: "",
      author: shelfBook.author,
      year: "",
      format: "academic",
      accent: shelfBook.accent || "#7A8B6F",
      theme: DEFAULT_THEME,
      cover: shelfBook.cover || "",
      tagline: shelfBook.needsDetails ? "Details pending — ask Claude to fill in a summary for this book." : (shelfBook.summary || ""),
      nodes: [],
      caseFile: null,
      keyLines: [],
      thread: "",
    };
    const updated = [...existing, promoted];
    await saveCustomBooks(updated);
    setCustomBooksVersion((v) => v + 1);
  };

  const [allCustomBooks, setAllCustomBooks] = useState([]);
  useEffect(() => {
    loadCustomBooks().then(setAllCustomBooks);
  }, [customBooksVersion]);

  const activeBook = [...BOOKS, ...allCustomBooks].find((b) => b.id === activeId);

  let content;
  if (activeBook) {
    content = <BookDashboard book={activeBook} onBack={() => setActiveId(null)} />;
  } else if (screen === "myBooks") {
    content = <MyBooksHome onSelect={setActiveId} onBackToLanding={() => setScreen("landing")} />;
  } else if (screen === "shelf") {
    content = <Bookshelf onBackToLanding={() => setScreen("landing")} onPromote={handlePromote} />;
  } else {
    content = <Landing onOpenMyBooks={() => setScreen("myBooks")} onOpenShelf={() => setScreen("shelf")} />;
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        @media (max-width: 720px) { .casefile-grid { grid-template-columns: 1fr !important; } .quote-form { grid-template-columns: 1fr !important; } }
      `}</style>
      {content}
    </div>
  );
}
