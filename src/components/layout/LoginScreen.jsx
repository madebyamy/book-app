import React, { useState } from 'react';
import { BRAND, FONT, USERS, PASSWORDS, SESSION_KEY } from '../../constants.js';

export function LoginScreen({ onLogin, allPasswords }) {
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
