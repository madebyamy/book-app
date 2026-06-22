import React, { useState, useEffect } from 'react';
import { storage } from '../../storage.js';
import { BRAND, FONT, USERS } from '../../constants.js';
import { loadBooks, loadStatus, loadProgress, loadDateAdded } from '../../lib/books.js';
import { TooltipIcon } from '../common/TooltipIcon.jsx';

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

export { loadChallengeGoal };

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

export function BookChallenge({ userId, userAccent, friends, tooltipText }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [goal, setGoal] = useState(null);
  const [goalDraft, setGoalDraft] = useState("");
  const [editingGoal, setEditingGoal] = useState(false);
  const [booksRead, setBooksRead] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showFriendId, setShowFriendId] = useState(null);
  const connectedFriends = friends || [];

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

      const withData = await Promise.all(unique.map(async (b) => {
        const [status, progress, dateAdded] = await Promise.all([
          loadStatus(userId, b.id),
          loadProgress(userId, b.id),
          loadDateAdded(userId, b.id),
        ]);
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
