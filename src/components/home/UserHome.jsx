import React, { useState, useEffect } from 'react';
import { BRAND, FONT, USERS, ADMIN_USER_ID } from '../../constants.js';
import { loadBooks, loadProgress, loadStatus, loadDateAdded, saveProgress } from '../../lib/books.js';
import { loadConnections, getConnectedUsers } from '../../lib/users.js';
import { loadChallengeGoal } from './BookChallenge.jsx';
import { TooltipIcon } from '../common/TooltipIcon.jsx';
import { AdminPanel } from './AdminPanel.jsx';
import { Bookshelf } from '../catalogue/Bookshelf.jsx';
import { BookChallenge } from './BookChallenge.jsx';
import { FriendReading } from './FriendReading.jsx';
import { SharedBookshelf } from './SharedBookshelf.jsx';
import { SharedChat } from './SharedChat.jsx';

export function UserHome({ user, onOpenMyBooks, onLogout, onBooksChanged, dynamicUsers, dynamicPasswords, onUserCreated, tooltips, onTooltipsChanged }) {
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

      {isAdmin && (
        <div style={{ maxWidth: 1220, margin: "0 auto", padding: "10px 30px 0", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setShowAdmin(true)} style={{ fontFamily: FONT.body, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase", background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "7px 13px", borderRadius: 2, cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = BRAND.coral; e.currentTarget.style.borderColor = BRAND.coral; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = BRAND.muted; e.currentTarget.style.borderColor = BRAND.line2; }}>
            ⚙ Admin
          </button>
        </div>
      )}

      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "34px 30px 40px" }}>
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

        {/* Now Reading Tracker */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 10 }}>
          <span style={{ fontFamily: FONT.display, fontStyle: "italic", fontSize: 17, color: BRAND.terracotta }}>Now Reading</span>
          <span style={{ flex: 1, height: 1, background: BRAND.line, display: "block", alignSelf: "center" }} />
          <span style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13.5, color: BRAND.muted }}>Open a book in the catalogue → click <em style={{ color: BRAND.ink }}>"Track my reading"</em> → log your page here each day.</span>
        </div>
        <section style={{ background: BRAND.espresso, borderRadius: 6, padding: "26px 28px 28px", boxShadow: "0 4px 12px rgba(20,30,50,.10)", marginBottom: 22 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: FONT.body, fontSize: 11.5, letterSpacing: "0.26em", textTransform: "uppercase", color: BRAND.tan }}>Now reading</span>
              {nowReading.length > 0 && (
                <span style={{ fontFamily: FONT.body, fontSize: 11.5, letterSpacing: "0.04em", color: "rgba(251,246,232,.5)" }}>{nowReading.length} book{nowReading.length !== 1 ? "s" : ""}</span>
              )}
            </div>
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

              // Pages-per-day needed to hit goal date
              let paceLabel = null;
              const finishDate = book.prog?.finishDate;
              if (finishDate && book.pages) {
                const today = new Date(); today.setHours(0,0,0,0);
                const goal = new Date(finishDate + "T00:00:00");
                const daysLeft = Math.ceil((goal - today) / 86400000);
                const pagesLeft = book.pages - (book.pagesRead || 0);
                if (daysLeft > 0 && pagesLeft > 0) {
                  const ppd = Math.ceil(pagesLeft / daysLeft);
                  paceLabel = { ppd, daysLeft, onTrack: ppd <= 50 };
                } else if (daysLeft <= 0 && pagesLeft > 0) {
                  paceLabel = { overdue: true };
                }
              }

              return (
                <div key={book.id} style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(255,255,255,.04)", border: "1px solid rgba(217,162,130,.18)", borderRadius: 5, padding: "16px 18px" }}>
                  <div style={{ position: "relative", width: 46, height: 66, flexShrink: 0, borderRadius: "2px 3px 3px 2px", background: spine, boxShadow: "inset -6px 0 0 rgba(0,0,0,.16),0 4px 12px rgba(20,30,50,.10)" }}>
                    <span style={{ position: "absolute", left: 6, top: 7, bottom: 7, width: 1, background: "rgba(255,255,255,.25)", display: "block" }} />
                  </div>
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
                    <div style={{ height: 7, width: "100%", background: "rgba(255,255,255,.1)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: BRAND.coral, borderRadius: 99 }} />
                    </div>
                    {paceLabel && (
                      <div style={{ marginTop: 7, fontFamily: FONT.body, fontSize: 12, color: paceLabel.overdue ? BRAND.coral : "rgba(251,246,232,.6)" }}>
                        {paceLabel.overdue
                          ? "Past goal date — update your finish date to keep tracking."
                          : <><span style={{ color: "#FBF6E8", fontWeight: 500 }}>{paceLabel.ppd} pages/day</span> to finish in {paceLabel.daysLeft} day{paceLabel.daysLeft !== 1 ? "s" : ""}</>}
                      </div>
                    )}
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

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(217,162,130,.16)" }}>
            <button onClick={() => document.getElementById("card-catalogue")?.scrollIntoView({ behavior: "smooth" })} style={{ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: FONT.body, fontSize: 13, letterSpacing: "0.03em", cursor: "pointer", padding: "10px 16px", borderRadius: 2, border: "1px dashed rgba(217,162,130,.5)", background: "transparent", color: "#FBF6E8" }}>
              <span style={{ fontSize: 16, color: BRAND.tan }}>+</span> Add a book to your shelf ↓
            </button>
          </div>
        </section>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, marginTop: 30 }}>
          <span style={{ fontFamily: FONT.display, fontStyle: "italic", fontSize: 17, color: BRAND.terracotta, whiteSpace: "nowrap" }}>Reading Challenge</span>
          <span style={{ flex: 1, height: 1, background: BRAND.line, display: "block" }} />
          <span style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13.5, color: BRAND.muted, textAlign: "right" }}>Set a yearly goal. Books you mark <em style={{ color: BRAND.ink }}>"read"</em> count automatically. Compare with friends.</span>
        </div>
        <section style={{ marginTop: 0 }}>
          <BookChallenge userId={user.id} userAccent={user.accent} friends={friends} tooltipText={tooltips?.challenge} />
        </section>

        {/* Card Catalogue inline */}
        <div id="card-catalogue" style={{ marginTop: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ fontFamily: FONT.display, fontStyle: "italic", fontSize: 17, color: BRAND.terracotta, whiteSpace: "nowrap" }}>Card Catalogue</span>
            <span style={{ flex: 1, height: 1, background: BRAND.line, display: "block" }} />
            <span style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13.5, color: BRAND.muted, textAlign: "right" }}>Pull a drawer to browse. Click a card to open notes, quotes & status. <em style={{ color: BRAND.ink }}>Hover a card to rate it with stars.</em></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND.terracotta }}>Card Catalogue</div>
            <button onClick={onOpenMyBooks} style={{ fontFamily: FONT.body, fontSize: 13, color: BRAND.coral, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.03em" }}>Marginalia →</button>
          </div>
          <Bookshelf userId={user.id} userAccent={user.accent} onBooksChanged={onBooksChanged} inline />
        </div>
      </div>

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

      <footer style={{ background: BRAND.espresso2, padding: "28px 30px", borderTop: "1px solid rgba(217,162,130,.14)" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: FONT.display, fontStyle: "italic", fontSize: 18, color: BRAND.tan }}>Turn the page.</span>
          <span style={{ fontFamily: FONT.body, fontSize: 12, color: "rgba(242,239,235,.4)", letterSpacing: "0.08em" }}>© 2026 Marginalia · mybookbrain.com</span>
        </div>
      </footer>
    </div>
  );
}
