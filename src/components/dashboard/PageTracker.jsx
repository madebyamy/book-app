import React, { useState, useEffect } from 'react';
import { loadProgress, saveProgress } from '../../lib/books.js';
import { todayISO, formatCatalogDate, daysBetween } from '../../lib/helpers.js';

export function PageTracker({ userId, book }) {
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
