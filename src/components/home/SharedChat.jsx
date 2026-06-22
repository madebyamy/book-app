import React, { useState, useEffect } from 'react';
import { storage, subscribeToChatUpdates } from '../../storage.js';
import { BRAND, FONT, USERS, SHARED_CHAT_KEY, CHAT_LAST_READ_KEY } from '../../constants.js';
import { TooltipIcon } from '../common/TooltipIcon.jsx';

export function SharedChat({ activeUser, friends, tooltipText }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState(null);
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
  const unreadFrom = (uid) => messages.filter((m) => m.userId === uid && m.ts > lastRead).length;
  const visibleMessages = filter ? messages.filter((m) => m.userId === filter || m.userId === activeUser.id) : messages;

  return (
    <div style={{ width: "100%", background: `${BRAND.darkCard}cc`, backdropFilter: "blur(10px)", border: `1px solid ${BRAND.cream}14`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "0.9rem 1.2rem", borderBottom: collapsed ? "none" : `1px solid ${BRAND.cream}14`, display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "1rem" }}>💬</span>
        <div style={{ fontFamily: FONT.type, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: BRAND.tan }}>Book Brain Chat</div>
        <TooltipIcon text={tooltipText} color={BRAND.tan} />
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
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
