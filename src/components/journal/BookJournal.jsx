import React, { useState, useEffect, useCallback } from 'react';
import { BRAND, FONT } from '../../constants.js';
import { loadJournalEntries, saveJournalEntries } from '../../lib/journal.js';

const GOLD = 'rgba(194,163,94,';
const PAGE_BG = '#FDFBF4';
const PAGE_LINE = 'rgba(180,160,120,.18)';
const INK = '#2A1E10';
const INK_MUTED = '#7A6040';
const MAX_PER_PAGE = 4; // max entries before day spills to next page

const TYPE_META = {
  rating:   { icon: '⭐', label: 'Rated a book' },
  added:    { icon: '📚', label: 'Added to reading list' },
  finished: { icon: '✅', label: 'Finished a book' },
  quote:    { icon: '❝',  label: 'Quote' },
  note:     { icon: '✍️', label: 'Note' },
  pages:    { icon: '📖', label: 'Reading progress' },
  manual:   { icon: '📝', label: 'Journal entry' },
};

function formatDay(isoDay) {
  const [y, m, d] = isoDay.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// Build page list: group entries by day, chunk each day into MAX_PER_PAGE-entry pages
function buildPages(entries) {
  const byDay = {};
  const dayOrder = [];
  for (const e of entries) {
    const day = e.date.slice(0, 10);
    if (!byDay[day]) { byDay[day] = []; dayOrder.push(day); }
    byDay[day].push(e);
  }
  const pages = [];
  for (const day of dayOrder) {
    const items = byDay[day];
    for (let i = 0; i < items.length; i += MAX_PER_PAGE) {
      pages.push({ day, isFirst: i === 0, entries: items.slice(i, i + MAX_PER_PAGE) });
    }
  }
  pages.push({ day: null, isFirst: true, entries: [] }); // blank "add entry" page at end
  return pages;
}

// ── Single page renderer ────────────────────────────────────────────────────
function PageContent({ pageData, pageNum, isRight, userId, onDeleteEntry, onDeleteDay, onAddNote, onAdded }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDay, setConfirmDay] = useState(false);

  const handleSave = async () => {
    if (!draft.trim()) { setAdding(false); return; }
    setSaving(true);
    const { addJournalEntry } = await import('../../lib/journal.js');
    await addJournalEntry(userId, { type: 'manual', content: draft.trim() });
    setDraft(''); setSaving(false); setAdding(false);
    if (onAdded) onAdded();
  };

  const isBlank = !pageData || pageData.entries.length === 0;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '28px 26px 22px', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Ruled lines */}
      {Array.from({ length: 22 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: 22, right: 22, top: 52 + i * 24, height: 1, background: PAGE_LINE, pointerEvents: 'none' }} />
      ))}
      {/* Red margin line */}
      <div style={{ position: 'absolute', left: 46, top: 20, bottom: 20, width: 1, background: 'rgba(200,80,60,.15)', pointerEvents: 'none' }} />

      {isBlank ? (
        // ── Blank add-entry page ──
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          {adding ? (
            <div style={{ width: '100%' }}>
              <textarea autoFocus value={draft} onChange={e => setDraft(e.target.value)}
                placeholder="Write your journal entry…" rows={7}
                style={{ width: '100%', fontFamily: FONT.read, fontSize: 13.5, lineHeight: 1.75, color: INK, background: 'transparent', border: 'none', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={handleSave} disabled={saving} style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: '.06em', background: '#4A2010', border: 'none', color: '#FBF6E8', padding: '7px 16px', borderRadius: 2, cursor: 'pointer' }}>
                  {saving ? 'Saving…' : 'Save entry'}
                </button>
                <button onClick={() => { setAdding(false); setDraft(''); }} style={{ fontFamily: FONT.body, fontSize: 11, background: 'transparent', border: '1px solid rgba(120,80,40,.3)', color: INK_MUTED, padding: '7px 12px', borderRadius: 2, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, background: 'none', border: '1px dashed rgba(120,80,40,.3)', borderRadius: 4, padding: '20px 28px', cursor: 'pointer', color: INK_MUTED }}>
              <span style={{ fontSize: 22 }}>✍️</span>
              <span style={{ fontFamily: FONT.body, fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase' }}>Add a journal entry</span>
            </button>
          )}
        </div>
      ) : (
        // ── Day page ──
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
          {/* Day header */}
          {pageData.isFirst && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexShrink: 0 }}>
              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: INK_MUTED }}>
                {formatDay(pageData.day)}
              </div>
              {confirmDay ? (
                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                  <span style={{ fontFamily: FONT.body, fontSize: 10, color: INK_MUTED }}>Delete day?</span>
                  <button onClick={() => { onDeleteDay && onDeleteDay(pageData.day); setConfirmDay(false); }}
                    style={{ fontFamily: FONT.body, fontSize: 10, background: '#8B2020', border: 'none', color: '#fff', padding: '3px 8px', borderRadius: 2, cursor: 'pointer' }}>Yes</button>
                  <button onClick={() => setConfirmDay(false)}
                    style={{ fontFamily: FONT.body, fontSize: 10, background: 'transparent', border: '1px solid rgba(120,80,40,.3)', color: INK_MUTED, padding: '3px 7px', borderRadius: 2, cursor: 'pointer' }}>No</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDay(true)}
                  title="Delete all entries for this day"
                  style={{ fontFamily: FONT.body, fontSize: 9.5, letterSpacing: '.08em', background: 'transparent', border: '1px solid rgba(140,40,40,.25)', color: 'rgba(140,40,40,.6)', padding: '2px 8px', borderRadius: 2, cursor: 'pointer' }}>
                  Delete day
                </button>
              )}
            </div>
          )}
          {!pageData.isFirst && (
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 11, color: 'rgba(120,90,50,.5)', marginBottom: 8, flexShrink: 0 }}>
              {formatDay(pageData.day)} (cont.)
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(120,80,40,.35),transparent)', marginBottom: 10, flexShrink: 0 }} />

          {/* Entries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, overflow: 'hidden' }}>
            {pageData.entries.map((entry, idx) => {
              const meta = TYPE_META[entry.type] || TYPE_META.manual;
              return (
                <div key={entry.id} style={{ position: 'relative', paddingBottom: idx < pageData.entries.length - 1 ? 10 : 0, borderBottom: idx < pageData.entries.length - 1 ? `1px solid ${PAGE_LINE}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, paddingRight: 22 }}>
                    <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{meta.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: FONT.body, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: INK_MUTED, marginBottom: 2 }}>{meta.label}</div>
                      {entry.bookTitle && (
                        <div style={{ fontFamily: FONT.display, fontWeight: 600, fontStyle: 'italic', fontSize: 13, color: INK, lineHeight: 1.2, marginBottom: 3 }}>{entry.bookTitle}</div>
                      )}
                      {entry.type === 'rating' && entry.stars && (
                        <div style={{ fontSize: 13, letterSpacing: 1, marginBottom: 2, color: '#C2A35E' }}>{'★'.repeat(entry.stars)}{'☆'.repeat(5 - entry.stars)}</div>
                      )}
                      {entry.content && (
                        <p style={{ fontFamily: FONT.read, fontSize: 12.5, lineHeight: 1.6, color: INK, margin: 0 }}>
                          {entry.type === 'quote' && <span style={{ fontFamily: FONT.display, fontSize: 18, color: INK_MUTED, lineHeight: 0, verticalAlign: '-5px', marginRight: 2 }}>"</span>}
                          {entry.content}
                          {entry.type === 'quote' && <span style={{ fontFamily: FONT.display, fontSize: 18, color: INK_MUTED, lineHeight: 0, verticalAlign: '-5px', marginLeft: 2 }}>"</span>}
                        </p>
                      )}
                      {entry.bookPage && (
                        <div style={{ fontFamily: FONT.body, fontSize: 10, color: INK_MUTED, marginTop: 2 }}>p. {entry.bookPage}</div>
                      )}
                    </div>
                  </div>
                  {/* Delete entry button */}
                  <button
                    onClick={() => onDeleteEntry && onDeleteEntry(entry.id)}
                    title="Delete this entry"
                    style={{ position: 'absolute', top: 0, right: 0, width: 18, height: 18, borderRadius: '50%', border: '1px solid rgba(140,40,40,.3)', background: 'transparent', color: 'rgba(140,40,40,.55)', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 }}>
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Page number */}
      <div style={{ position: 'absolute', bottom: 12, [isRight ? 'right' : 'left']: 20, fontFamily: 'Georgia, serif', fontSize: 10, color: INK_MUTED, fontStyle: 'italic', zIndex: 1 }}>
        {pageNum}
      </div>

      {/* Add note button — shown on day pages too */}
      {!isBlank && isRight && onAddNote && (
        <button onClick={onAddNote} title="Add a journal entry"
          style={{ position: 'absolute', bottom: 8, right: 36, fontFamily: FONT.body, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid rgba(120,80,40,.25)', color: INK_MUTED, padding: '3px 9px', borderRadius: 2, cursor: 'pointer', zIndex: 1 }}>
          + note
        </button>
      )}
    </div>
  );
}

// ── Book cover ──────────────────────────────────────────────────────────────
function BookCover({ onOpen }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '40px 20px' }}>
      <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: '.26em', textTransform: 'uppercase', color: BRAND.muted, marginBottom: 28 }}>Reading Journal</div>
      <div onClick={onOpen} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ width: 300, height: 420, position: 'relative', cursor: 'pointer', transform: hovered ? 'translateY(-6px) rotate(-1deg)' : 'none', transition: 'transform .3s cubic-bezier(.16,1,.3,1)', filter: hovered ? 'drop-shadow(-12px 16px 32px rgba(0,0,0,.5))' : 'drop-shadow(-6px 8px 20px rgba(0,0,0,.38))' }}>
        <div style={{ position: 'absolute', right: -8, top: 6, bottom: 2, width: 16, background: 'linear-gradient(90deg,#E8DFC8,#D5C9A8,#E8DFC8)', borderRadius: '0 3px 3px 0', boxShadow: '2px 0 4px rgba(0,0,0,.2)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#8B4A28 0%,#5A2810 30%,#3D1A08 60%,#6B3520 85%,#4A2010 100%)', borderRadius: '3px 6px 6px 3px', boxShadow: 'inset 3px 0 8px rgba(0,0,0,.4),inset -1px 0 0 rgba(255,255,255,.06)' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 22, background: 'linear-gradient(90deg,#2A1008,#5A2810,#2A1008)', borderRadius: '3px 0 0 3px' }} />
          <div style={{ position: 'absolute', inset: '18px 14px', border: `1.5px solid ${GOLD}.32)`, borderRadius: 2 }} />
          <div style={{ position: 'absolute', inset: '22px 18px', border: `1px solid ${GOLD}.18)`, borderRadius: 1 }} />
          <div style={{ position: 'absolute', top: 48, left: 32, right: 14, height: 1, background: `linear-gradient(90deg,transparent,${GOLD}.45),transparent)` }} />
          <div style={{ position: 'absolute', bottom: 48, left: 32, right: 14, height: 1, background: `linear-gradient(90deg,transparent,${GOLD}.45),transparent)` }} />
          <div style={{ position: 'absolute', top: 60, left: 32, right: 14, textAlign: 'center', fontFamily: FONT.display, fontWeight: 600, fontSize: 10.5, letterSpacing: '.34em', textTransform: 'uppercase', color: `${GOLD}0.8)`, textShadow: `0 1px 3px rgba(0,0,0,.7)` }}>My Reading Journal</div>
          <div style={{ position: 'absolute', top: '50%', left: 32, right: 14, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: FONT.display, fontWeight: 700, fontSize: 76, lineHeight: 1, color: `${GOLD}0.82)`, textShadow: `0 3px 8px rgba(0,0,0,.7),0 1px 0 rgba(255,255,255,.08),0 -2px 0 rgba(0,0,0,.4)`, letterSpacing: '-0.02em' }}>2026</div>
          <div style={{ position: 'absolute', top: '50%', left: 32, right: 14, marginTop: 52, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${GOLD}.4))` }} />
            <span style={{ fontFamily: FONT.display, fontSize: 14, color: `${GOLD}0.6)` }}>✦</span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${GOLD}.4),transparent)` }} />
          </div>
          <div style={{ position: 'absolute', bottom: 60, left: 32, right: 14, textAlign: 'center', fontFamily: FONT.body, fontSize: 9.5, letterSpacing: '.22em', textTransform: 'uppercase', color: `${GOLD}0.4)` }}>
            {hovered ? 'Click to open →' : 'Reading Journal'}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 28, fontFamily: FONT.read, fontStyle: 'italic', fontSize: 13.5, color: BRAND.muted }}>Click the book to open your journal</div>
    </div>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────
export function BookJournal({ userId, onBack }) {
  const year = new Date().getFullYear();
  const [view, setView] = useState('cover');
  const [entries, setEntries] = useState([]);
  const [pageIdx, setPageIdx] = useState(0);
  const [flipState, setFlipState] = useState(null);
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [addNoteDraft, setAddNoteDraft] = useState('');
  const [addNoteSaving, setAddNoteSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 680);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 680);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const loadEntries = useCallback(() => {
    loadJournalEntries(userId, year).then(e => {
      setEntries(e);
      const pages = buildPages(e);
      setPageIdx(Math.max(0, pages.length - 1));
    });
  }, [userId, year]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const deleteEntry = async (id) => {
    const updated = entries.filter(e => e.id !== id);
    await saveJournalEntries(userId, year, updated);
    setEntries(updated);
    const pages = buildPages(updated);
    setPageIdx(p => Math.min(p, Math.max(0, pages.length - 1)));
  };

  const deleteDay = async (day) => {
    const updated = entries.filter(e => e.date.slice(0, 10) !== day);
    await saveJournalEntries(userId, year, updated);
    setEntries(updated);
    const pages = buildPages(updated);
    setPageIdx(p => Math.min(p, Math.max(0, pages.length - 1)));
  };

  const pages = buildPages(entries);
  const totalPages = pages.length;

  // Desktop: show two pages at once (spread); mobile: one page
  // For desktop, pageIdx is the LEFT page index (always even)
  const desktopLeft = isMobile ? null : pages[pageIdx % 2 === 0 ? pageIdx : pageIdx - 1] ?? null;
  const desktopRight = isMobile ? null : pages[pageIdx % 2 === 0 ? pageIdx + 1 : pageIdx] ?? null;
  const desktopSpread = pageIdx % 2 === 0 ? pageIdx : pageIdx - 1;

  const canNext = isMobile ? pageIdx < totalPages - 1 : desktopSpread + 2 <= totalPages - 1;
  const canPrev = isMobile ? pageIdx > 0 : desktopSpread > 0;

  const flip = (dir) => {
    if (flipState) return;
    if (dir === 'next' && !canNext) return;
    if (dir === 'prev' && !canPrev) return;
    setFlipState({ dir });
    setTimeout(() => {
      setPageIdx(p => dir === 'next' ? (isMobile ? p + 1 : p + 2) : (isMobile ? p - 1 : p - 2));
      setFlipState(null);
    }, 480);
  };

  const handleAddNote = async () => {
    if (!addNoteDraft.trim()) { setAddNoteOpen(false); return; }
    setAddNoteSaving(true);
    const { addJournalEntry } = await import('../../lib/journal.js');
    await addJournalEntry(userId, { type: 'manual', content: addNoteDraft.trim() });
    setAddNoteDraft(''); setAddNoteSaving(false); setAddNoteOpen(false);
    loadEntries();
  };

  if (view === 'cover') {
    return (
      <div style={{ minHeight: '100vh', background: BRAND.paper }}>
        <div style={{ maxWidth: 1220, margin: '0 auto', padding: '24px 30px' }}>
          <button onClick={onBack} style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: '.06em', background: 'none', border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: '6px 14px', borderRadius: 3, cursor: 'pointer' }}>← Back</button>
        </div>
        <BookCover onOpen={() => setView('open')} />
      </div>
    );
  }

  const arrowStyle = (active) => ({
    width: 40, height: 40, borderRadius: '50%',
    background: active ? 'rgba(194,163,94,.15)' : 'rgba(255,255,255,.04)',
    border: `1px solid ${active ? `${GOLD}0.4)` : 'rgba(255,255,255,.08)'}`,
    color: active ? `${GOLD}0.9)` : 'rgba(255,255,255,.15)',
    fontSize: 20, cursor: active ? 'pointer' : 'default',
    transition: 'all .2s', flexShrink: 0,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#1A0E06', overflowX: 'hidden' }}>
      <style>{`
        @keyframes jrnl-flip-fwd { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(-180deg); } }
        @keyframes jrnl-flip-bwd { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(180deg); } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(194,163,94,.15)' }}>
        <button onClick={() => setView('cover')} style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: '.06em', background: 'none', border: `1px solid rgba(194,163,94,.3)`, color: `${GOLD}0.7)`, padding: '6px 12px', borderRadius: 3, cursor: 'pointer' }}>← Cover</button>
        <div style={{ fontFamily: FONT.display, fontStyle: 'italic', fontSize: isMobile ? 14 : 16, color: `${GOLD}0.75)` }}>My Reading Journal · {year}</div>
        <button onClick={onBack} style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: '.06em', background: 'none', border: `1px solid rgba(194,163,94,.3)`, color: `${GOLD}0.7)`, padding: '6px 12px', borderRadius: 3, cursor: 'pointer' }}>✕ Close</button>
      </div>

      {/* Book stage */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', padding: isMobile ? '14px 6px' : '28px 14px', gap: isMobile ? 6 : 18 }}>

        <button onClick={() => flip('prev')} disabled={!canPrev || !!flipState} style={arrowStyle(canPrev && !flipState)} aria-label="Previous page">‹</button>

        {/* ── MOBILE: single page ── */}
        {isMobile ? (
          <div style={{ perspective: '900px', flex: 1, maxWidth: 440 }}>
            <div style={{ position: 'relative', width: '100%', height: 'min(600px, 78vh)', background: PAGE_BG, borderRadius: 3, boxShadow: '0 12px 40px rgba(0,0,0,.65),4px 0 0 #8B4A28,6px 0 0 #5A2810,8px 0 0 #3A1A08', overflow: 'hidden' }}>
              <PageContent
                pageData={pages[pageIdx]}
                pageNum={pageIdx + 1}
                isRight userId={userId}
                onDeleteEntry={deleteEntry}
                onDeleteDay={deleteDay}
                onAddNote={() => setAddNoteOpen(true)}
                onAdded={loadEntries}
              />
              {flipState && (
                <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transformOrigin: flipState.dir === 'next' ? 'left center' : 'right center', animation: `${flipState.dir === 'next' ? 'jrnl-flip-fwd' : 'jrnl-flip-bwd'} 0.48s cubic-bezier(.45,0,.55,1) forwards`, zIndex: 20, pointerEvents: 'none' }}>
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: PAGE_BG, overflow: 'hidden' }}>
                    <PageContent pageData={pages[pageIdx]} pageNum={pageIdx + 1} isRight userId={userId} />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: PAGE_BG, overflow: 'hidden' }}>
                    <PageContent pageData={pages[flipState.dir === 'next' ? pageIdx + 1 : pageIdx - 1]} pageNum={flipState.dir === 'next' ? pageIdx + 2 : pageIdx} isRight userId={userId} />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
        /* ── DESKTOP: two-page spread ── */
          <div style={{ perspective: '1400px', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 'min(860px,calc(100vw - 120px))', height: 'min(580px,82vh)', display: 'flex', boxShadow: '0 20px 60px rgba(0,0,0,.7),0 4px 12px rgba(0,0,0,.5)', borderRadius: 2 }}>
              {/* Left page */}
              <div style={{ width: '50%', height: '100%', background: PAGE_BG, borderRadius: '2px 0 0 2px', boxShadow: 'inset -4px 0 12px rgba(0,0,0,.12)', position: 'relative', overflow: 'hidden' }}>
                <PageContent pageData={desktopLeft} pageNum={desktopSpread + 1} isRight={false} userId={userId} onDeleteEntry={deleteEntry} onDeleteDay={deleteDay} onAdded={loadEntries} />
              </div>
              {/* Spine */}
              <div style={{ width: 18, flexShrink: 0, background: 'linear-gradient(90deg,#3A1A08 0%,#7A3F1A 35%,#8B4A28 50%,#7A3F1A 65%,#3A1A08 100%)', boxShadow: '0 0 12px rgba(0,0,0,.5)', zIndex: 2 }} />
              {/* Right page */}
              <div style={{ width: '50%', height: '100%', background: PAGE_BG, borderRadius: '0 2px 2px 0', boxShadow: 'inset 4px 0 12px rgba(0,0,0,.12)', position: 'relative', overflow: 'hidden' }}>
                <PageContent pageData={desktopRight} pageNum={desktopSpread + 2} isRight userId={userId} onDeleteEntry={deleteEntry} onDeleteDay={deleteDay} onAddNote={() => setAddNoteOpen(true)} onAdded={loadEntries} />
              </div>

              {/* Flip overlay — desktop */}
              {flipState && (
                <div style={{ position: 'absolute', top: 0, ...(flipState.dir === 'next' ? { left: 'calc(50% + 9px)', width: 'calc(50% - 9px)', transformOrigin: 'left center' } : { left: 0, width: 'calc(50% - 9px)', transformOrigin: 'right center' }), height: '100%', transformStyle: 'preserve-3d', animation: `${flipState.dir === 'next' ? 'jrnl-flip-fwd' : 'jrnl-flip-bwd'} 0.48s cubic-bezier(.45,0,.55,1) forwards`, zIndex: 20, pointerEvents: 'none' }}>
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: PAGE_BG, boxShadow: flipState.dir === 'next' ? '-4px 0 20px rgba(0,0,0,.25)' : '4px 0 20px rgba(0,0,0,.25)', overflow: 'hidden' }}>
                    <PageContent pageData={flipState.dir === 'next' ? desktopRight : desktopLeft} pageNum={flipState.dir === 'next' ? desktopSpread + 2 : desktopSpread + 1} isRight={flipState.dir === 'next'} userId={userId} />
                  </div>
                  <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: PAGE_BG, overflow: 'hidden' }}>
                    {(() => {
                      const ns = flipState.dir === 'next' ? desktopSpread + 2 : desktopSpread - 2;
                      const bE = flipState.dir === 'next' ? pages[ns] : pages[ns + 1];
                      const bN = flipState.dir === 'next' ? ns + 1 : ns + 2;
                      return <PageContent pageData={bE ?? null} pageNum={bN} isRight={flipState.dir !== 'next'} userId={userId} />;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <button onClick={() => flip('next')} disabled={!canNext || !!flipState} style={arrowStyle(canNext && !flipState)} aria-label="Next page">›</button>
      </div>

      {/* Page indicator */}
      <div style={{ textAlign: 'center', paddingBottom: 18, fontFamily: FONT.body, fontSize: 11, letterSpacing: '.12em', color: `${GOLD}0.4)` }}>
        {entries.length === 0 ? 'No entries yet — actions you take will appear here'
          : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} · Page ${isMobile ? pageIdx + 1 : desktopSpread + 1} of ${totalPages}`}
      </div>

      {/* Add note overlay (shared between mobile/desktop) */}
      {addNoteOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(20,10,4,.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: PAGE_BG, borderRadius: 4, padding: '28px 28px 24px', width: 'min(480px,100%)', boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>
            <div style={{ fontFamily: FONT.display, fontStyle: 'italic', fontSize: 20, color: INK, marginBottom: 16 }}>Add a journal entry</div>
            <textarea autoFocus value={addNoteDraft} onChange={e => setAddNoteDraft(e.target.value)} placeholder="Write your note here…" rows={6}
              style={{ width: '100%', fontFamily: FONT.read, fontSize: 14, lineHeight: 1.75, color: INK, background: 'transparent', border: 'none', borderBottom: `1px solid ${PAGE_LINE}`, outline: 'none', resize: 'none', padding: '8px 0', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={handleAddNote} disabled={addNoteSaving} style={{ flex: 1, fontFamily: FONT.body, fontSize: 13, letterSpacing: '.06em', background: '#4A2010', border: 'none', color: '#FBF6E8', padding: '11px', borderRadius: 2, cursor: 'pointer' }}>
                {addNoteSaving ? 'Saving…' : 'Save to journal'}
              </button>
              <button onClick={() => { setAddNoteOpen(false); setAddNoteDraft(''); }} style={{ fontFamily: FONT.body, fontSize: 13, background: 'transparent', border: '1px solid rgba(120,80,40,.3)', color: INK_MUTED, padding: '11px 16px', borderRadius: 2, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
