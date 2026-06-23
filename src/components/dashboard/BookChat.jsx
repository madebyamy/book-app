import React, { useState, useEffect, useCallback, useRef } from 'react';
import { loadChat, saveChat } from '../../lib/books.js';

export function BookChat({ userId, book, theme }) {
  theme = theme || book.theme || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  // "normal" | "expanded" | "collapsed"
  const [openState, setOpenState] = useState("normal");
  const scrollRef = useRef(null);

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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: systemPrompt, messages: updated.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ? `${data.error}: ${data.detail}` : (data.error || "API error"));
      const replyText = data.reply || "I wasn't able to generate a response.";
      const final = [...updated, { role: "assistant", content: replyText }];
      setMessages(final);
      await saveChat(userId, book.id, final);
    } catch (err) {
      setError(`Error: ${err.message}`);
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {messages.length > 0 && openState !== "collapsed" && (
            <button onClick={handleClear} style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.inkSoft, fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.35rem 0.7rem", borderRadius: 3, cursor: "pointer" }}>Clear chat</button>
          )}
          {openState !== "collapsed" && (
            <button onClick={() => setOpenState(s => s === "expanded" ? "normal" : "expanded")} style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.inkSoft, fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.35rem 0.7rem", borderRadius: 3, cursor: "pointer" }}>{openState === "expanded" ? "↙ Shrink" : "↗ Expand"}</button>
          )}
          <button onClick={() => setOpenState(s => s === "collapsed" ? "normal" : "collapsed")} style={{ background: "none", border: `1px solid ${theme.border}`, color: theme.inkSoft, fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.35rem 0.7rem", borderRadius: 3, cursor: "pointer" }}>{openState === "collapsed" ? "▼ Open" : "▲ Close"}</button>
        </div>
      </div>
      {openState !== "collapsed" && <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 4, overflow: "hidden" }}>
        <div ref={scrollRef} style={{ maxHeight: openState === "expanded" ? "70vh" : 420, minHeight: 140, overflowY: "auto", padding: "1.4rem 1.6rem", display: "flex", flexDirection: "column", gap: "1rem", transition: "max-height 0.3s ease" }}>
          {!loaded ? (
            <div style={{ fontFamily: theme.mono, fontSize: "0.8rem", color: theme.inkFaint }}>Loading conversation…</div>
          ) : messages.length === 0 ? (
            <div style={{ fontFamily: theme.mono, fontSize: "0.78rem", color: theme.inkFaint, lineHeight: 1.6 }}>No conversation yet. Start with the book or wander wherever it leads.</div>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                <span style={{ fontFamily: theme.mono, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: m.role === "user" ? book.accent : theme.inkFaint, marginBottom: "0.35rem" }}>{m.role === "user" ? "You" : "Gemini"}</span>
                <div style={{ maxWidth: "85%", background: m.role === "user" ? `${book.accent}14` : "transparent", border: m.role === "user" ? `1px solid ${book.accent}55` : "none", borderRadius: 3, padding: m.role === "user" ? "0.7rem 0.95rem" : 0, fontSize: "0.88rem", lineHeight: 1.6, color: theme.ink, whiteSpace: "pre-wrap" }}>{m.content}</div>
              </div>
            ))
          )}
          {sending && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontFamily: theme.mono, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: theme.inkFaint, marginBottom: "0.35rem" }}>Gemini</span>
              <div style={{ fontSize: "0.85rem", color: theme.inkFaint, fontFamily: theme.mono }}>researching…</div>
            </div>
          )}
        </div>
        {error && <div style={{ padding: "0 1.6rem", fontFamily: theme.mono, fontSize: "0.74rem", color: "#C1432B" }}>{error}</div>}
        <form onSubmit={handleSend} style={{ display: "flex", gap: "0.6rem", padding: "1rem 1.4rem", borderTop: `1px solid ${theme.border}` }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything — start here or go wherever it leads…" disabled={sending} style={{ flex: 1, background: theme.bg, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.88rem", padding: "0.65rem 0.9rem", borderRadius: 3 }} />
          <button type="submit" disabled={sending || !input.trim()} style={{ background: book.accent, border: "none", color: theme.headerInk, fontFamily: theme.mono, fontSize: "0.74rem", letterSpacing: "0.05em", textTransform: "uppercase", padding: "0.65rem 1.1rem", borderRadius: 3, cursor: sending ? "default" : "pointer", fontWeight: 600, opacity: sending || !input.trim() ? 0.5 : 1 }}>Send</button>
        </form>
      </div>}
    </div>
  );
}
