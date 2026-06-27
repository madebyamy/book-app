import React, { useState, useEffect, useRef } from 'react';
import { BRAND, FONT } from '../../constants.js';
import { loadJournalEntries, addJournalEntry } from '../../lib/journal.js';

const GOLD = 'rgba(194,163,94,';
const PAGE_BG = '#FDFBF4';
const PAGE_LINE = 'rgba(180,160,120,.18)';
const INK = '#2A1E10';
const INK_MUTED = '#7A6040';

const TYPE_META = {
  rating:   { icon: '⭐', label: 'Rated a book' },
  added:    { icon: '📚', label: 'Added to reading list' },
  finished: { icon: '✅', label: 'Finished a book' },
  quote:    { icon: '❝', label: 'Quoted' },
  note:     { icon: '✍️', label: 'Note' },
  pages:    { icon: '📖', label: 'Reading progress' },
  manual:   { icon: '📝', label: 'Journal entry' },
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function PageContent({ entry, pageNum, isRight, onAddNote, userId }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const taRef = useRef(null);

  const handleSave = async () => {
    if (!draft.trim()) { setAdding(false); return; }
    setSaving(true);
    await addJournalEntry(userId, { type: 'manual', content: draft.trim() });
    setDraft(''); setSaving(false); setAdding(false);
    if (onAddNote) onAddNote();
  };

  const meta = entry ? TYPE_META[entry.type] || TYPE_META.manual : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '32px 28px 24px', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Ruled lines */}
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: 24, right: 24, top: 58 + i * 28, height: 1, background: PAGE_LINE, pointerEvents: 'none' }} />
      ))}
      {/* Left margin line */}
      <div style={{ position: 'absolute', left: 52, top: 24, bottom: 24, width: 1, background: 'rgba(200,80,60,.18)', pointerEvents: 'none' }} />

      {entry ? (
        <>
          <div style={{ fontFamily: 'cursive', fontSize: 11, color: INK_MUTED, marginBottom: 14, position: 'relative', zIndex: 1 }}>{formatDate(entry.date)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 18 }}>{meta.icon}</span>
            <span style={{ fontFamily: FONT.body, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: INK_MUTED }}>{meta.label}</span>
          </div>
          {entry.bookTitle && (
            <div style={{ fontFamily: FONT.display, fontWeight: 600, fontStyle: 'italic', fontSize: 15, color: INK, marginBottom: 10, position: 'relative', zIndex: 1, lineHeight: 1.25 }}>
              {entry.bookTitle}
            </div>
          )}
          {entry.type === 'rating' && entry.stars && (
            <div style={{ fontSize: 18, letterSpacing: 2, marginBottom: 8, position: 'relative', zIndex: 1 }}>
              {'★'.repeat(entry.stars)}{'☆'.repeat(5 - entry.stars)}
            </div>
          )}
          {entry.content && (
            <p style={{ fontFamily: FONT.read, fontSize: 13.5, lineHeight: 1.75, color: INK, margin: '0 0 8px', position: 'relative', zIndex: 1, flex: 1 }}>
              {entry.type === 'quote' && <span style={{ fontFamily: FONT.display, fontSize: 22, color: INK_MUTED, lineHeight: 0, verticalAlign: '-6px', marginRight: 4 }}>"</span>}
              {entry.content}
              {entry.type === 'quote' && <span style={{ fontFamily: FONT.display, fontSize: 22, color: INK_MUTED, lineHeight: 0, verticalAlign: '-6px', marginLeft: 4 }}>"</span>}
            </p>
          )}
          {entry.bookPage && (
            <div style={{ fontFamily: FONT.body, fontSize: 11, color: INK_MUTED, marginTop: 4, position: 'relative', zIndex: 1 }}>p. {entry.bookPage}</div>
          )}
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          {adding ? (
            <div style={{ width: '100%' }}>
              <textarea
                ref={taRef}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                autoFocus
                placeholder="Write your journal entry…"
                rows={7}
                style={{ width: '100%', fontFamily: FONT.read, fontSize: 13.5, lineHeight: 1.75, color: INK, background: 'transparent', border: 'none', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={handleSave} disabled={saving} style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: '.06em', background: '#4A2010', border: 'none', color: '#FBF6E8', padding: '7px 16px', borderRadius: 2, cursor: 'pointer' }}>
                  {saving ? 'Saving…' : 'Save entry'}
                </button>
                <button onClick={() => { setAdding(false); setDraft(''); }} style={{ fontFamily: FONT.body, fontSize: 11, background: 'transparent', border: '1px solid rgba(120,80,40,.3)', color: INK_MUTED, padding: '7px 12px', borderRadius: 2, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, background: 'none', border: '1px dashed rgba(120,80,40,.3)', borderRadius: 4, padding: '20px 28px', cursor: 'pointer', color: INK_MUTED }}
            >
              <span style={{ fontSize: 24 }}>✍️</span>
              <span style={{ fontFamily: FONT.body, fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase' }}>Add a journal entry</span>
            </button>
          )}
        </div>
      )}

      {/* Page number */}
      <div style={{ position: 'absolute', bottom: 16, [isRight ? 'right' : 'left']: 24, fontFamily: 'Georgia, serif', fontSize: 11, color: INK_MUTED, fontStyle: 'italic' }}>
        {pageNum}
      </div>

      {/* Add note button for existing entry pages */}
      {entry && isRight && (
        <button
          onClick={() => onAddNote && onAddNote('prompt')}
          title="Add a journal entry"
          style={{ position: 'absolute', bottom: 10, right: 54, fontFamily: FONT.body, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', background: 'transparent', border: '1px solid rgba(120,80,40,.28)', color: INK_MUTED, padding: '4px 10px', borderRadius: 2, cursor: 'pointer' }}
        >
          + Add note
        </button>
      )}
    </div>
  );
}

function BookCover({ onOpen }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '40px 20px' }}>
      <div style={{ fontFamily: FONT.body, fontSize: 11, letterSpacing: '.26em', textTransform: 'uppercase', color: BRAND.muted, marginBottom: 28 }}>Reading Journal</div>
      <div
        onClick={onOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 300,
          height: 420,
          position: 'relative',
          cursor: 'pointer',
          transform: hovered ? 'translateY(-6px) rotate(-1deg)' : 'none',
          transition: 'transform .3s cubic-bezier(.16,1,.3,1)',
          filter: hovered ? 'drop-shadow(-12px 16px 32px rgba(0,0,0,.5))' : 'drop-shadow(-6px 8px 20px rgba(0,0,0,.38))',
        }}
      >
        {/* Book block / pages edge */}
        <div style={{ position: 'absolute', right: -8, top: 6, bottom: 2, width: 16, background: 'linear-gradient(90deg,#E8DFC8,#D5C9A8,#E8DFC8)', borderRadius: '0 3px 3px 0', boxShadow: '2px 0 4px rgba(0,0,0,.2)' }} />

        {/* Cover */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, #8B4A28 0%, #5A2810 30%, #3D1A08 60%, #6B3520 85%, #4A2010 100%)',
          borderRadius: '3px 6px 6px 3px',
          boxShadow: 'inset 3px 0 8px rgba(0,0,0,.4), inset -1px 0 0 rgba(255,255,255,.06)',
        }}>
          {/* Spine */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 22, background: 'linear-gradient(90deg,#2A1008,#5A2810,#2A1008)', borderRadius: '3px 0 0 3px' }} />

          {/* Outer embossed border */}
          <div style={{ position: 'absolute', inset: '18px 14px', border: `1.5px solid ${GOLD}.32)`, borderRadius: 2 }} />
          <div style={{ position: 'absolute', inset: '22px 18px', border: `1px solid ${GOLD}.18)`, borderRadius: 1 }} />

          {/* Top ornament line */}
          <div style={{ position: 'absolute', top: 48, left: 32, right: 14, height: 1, background: `linear-gradient(90deg,transparent,${GOLD}.45),transparent)` }} />
          <div style={{ position: 'absolute', bottom: 48, left: 32, right: 14, height: 1, background: `linear-gradient(90deg,transparent,${GOLD}.45),transparent)` }} />

          {/* Title */}
          <div style={{
            position: 'absolute', top: 60, left: 32, right: 14,
            textAlign: 'center',
            fontFamily: FONT.display,
            fontWeight: 600,
            fontSize: 10.5,
            letterSpacing: '.34em',
            textTransform: 'uppercase',
            color: `${GOLD}0.8)`,
            textShadow: `0 1px 3px rgba(0,0,0,.7), 0 -1px 0 ${GOLD}.12)`,
          }}>My Reading Journal</div>

          {/* Year embossed */}
          <div style={{
            position: 'absolute',
            top: '50%', left: 32, right: 14,
            transform: 'translateY(-50%)',
            textAlign: 'center',
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: 76,
            lineHeight: 1,
            color: `${GOLD}0.82)`,
            textShadow: `0 3px 8px rgba(0,0,0,.7), 0 1px 0 rgba(255,255,255,.08), 0 -2px 0 rgba(0,0,0,.4)`,
            letterSpacing: '-0.02em',
          }}>2026</div>

          {/* Decorative flourish */}
          <div style={{ position: 'absolute', top: '50%', left: 32, right: 14, marginTop: 52, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${GOLD}.4))` }} />
            <span style={{ fontFamily: FONT.display, fontSize: 14, color: `${GOLD}0.6)` }}>✦</span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${GOLD}.4),transparent)` }} />
          </div>

          {/* "Open journal" hint */}
          <div style={{
            position: 'absolute', bottom: 60, left: 32, right: 14,
            textAlign: 'center',
            fontFamily: FONT.body,
            fontSize: 9.5,
            letterSpacing: '.22em',
            textTransform: 'uppercase',
            color: `${GOLD}0.4)`,
          }}>
            {hovered ? 'Click to open →' : 'Reading Journal'}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28, fontFamily: FONT.read, fontStyle: 'italic', fontSize: 13.5, color: BRAND.muted }}>
        Click the book to open your journal
      </div>
    </div>
  );
}

export function BookJournal({ userId, onBack }) {
  const year = new Date().getFullYear();
  const [view, setView] = useState('cover');
  const [entries, setEntries] = useState([]);
  const [spread, setSpread] = useState(0);
  const [flipState, setFlipState] = useState(null); // { dir, fromSpread }
  const [addNoteSpread, setAddNoteSpread] = useState(null);
  const [addNoteDraft, setAddNoteDraft] = useState('');
  const [addNoteSaving, setAddNoteSaving] = useState(false);

  useEffect(() => {
    loadJournalEntries(userId, year).then(e => {
      setEntries(e);
      // Open to last spread
      const last = Math.max(0, Math.floor(e.length / 2) * 2);
      setSpread(last);
    });
  }, [userId, year]);

  const reload = () => {
    loadJournalEntries(userId, year).then(e => {
      setEntries(e);
      // go to last spread (new entry is at end)
      const last = Math.max(0, Math.floor(e.length / 2) * 2);
      setSpread(last);
    });
  };

  // Pad entries to even count so every spread has two slots
  const padded = entries.length % 2 === 0 ? [...entries, null] : entries;
  // Add an extra blank spread at the end for adding entries
  const pages = [...padded, null];

  const totalSpreads = Math.ceil(pages.length / 2);
  const leftEntry = pages[spread * 2] ?? null;
  const rightEntry = pages[spread * 2 + 1] ?? null;
  const canNext = spread < totalSpreads - 1;
  const canPrev = spread > 0;

  const flip = (dir) => {
    if (flipState) return;
    if (dir === 'next' && !canNext) return;
    if (dir === 'prev' && !canPrev) return;
    setFlipState({ dir });
    setTimeout(() => {
      setSpread(s => dir === 'next' ? s + 1 : s - 1);
      setFlipState(null);
    }, 580);
  };

  const handleAddNoteFromPage = async () => {
    if (!addNoteDraft.trim()) { setAddNoteSpread(null); return; }
    setAddNoteSaving(true);
    await addJournalEntry(userId, { type: 'manual', content: addNoteDraft.trim() });
    setAddNoteDraft('');
    setAddNoteSaving(false);
    setAddNoteSpread(null);
    reload();
  };

  const leftPageNum = spread * 2 + 1;
  const rightPageNum = spread * 2 + 2;

  if (view === 'cover') {
    return (
      <div style={{ minHeight: '100vh', background: BRAND.paper }}>
        <div style={{ maxWidth: 1220, margin: '0 auto', padding: '24px 30px' }}>
          <button onClick={onBack} style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: '.06em', background: 'none', border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: '6px 14px', borderRadius: 3, cursor: 'pointer', marginBottom: 8 }}>
            ← Back
          </button>
        </div>
        <BookCover onOpen={() => setView('open')} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1A0E06' }}>
      <style>{`
        @keyframes jrnl-flip-fwd {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(-180deg); }
        }
        @keyframes jrnl-flip-bwd {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(180deg); }
        }
      `}</style>

      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: '1px solid rgba(194,163,94,.15)' }}>
        <button onClick={() => setView('cover')} style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: '.06em', background: 'none', border: `1px solid rgba(194,163,94,.3)`, color: `${GOLD}0.7)`, padding: '6px 14px', borderRadius: 3, cursor: 'pointer' }}>
          ← Cover
        </button>
        <div style={{ fontFamily: FONT.display, fontStyle: 'italic', fontSize: 16, color: `${GOLD}0.75)` }}>
          My Reading Journal · {year}
        </div>
        <button onClick={onBack} style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: '.06em', background: 'none', border: `1px solid rgba(194,163,94,.3)`, color: `${GOLD}0.7)`, padding: '6px 14px', borderRadius: 3, cursor: 'pointer' }}>
          ✕ Close
        </button>
      </div>

      {/* Book stage */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', padding: '30px 16px', gap: 20 }}>

        {/* Prev arrow */}
        <button
          onClick={() => flip('prev')}
          disabled={!canPrev || !!flipState}
          style={{ width: 44, height: 44, borderRadius: '50%', background: canPrev ? 'rgba(194,163,94,.15)' : 'rgba(255,255,255,.04)', border: `1px solid ${canPrev ? `${GOLD}0.4)` : 'rgba(255,255,255,.08)'}`, color: canPrev ? `${GOLD}0.9)` : 'rgba(255,255,255,.15)', fontSize: 18, cursor: canPrev ? 'pointer' : 'default', transition: 'all .2s', flexShrink: 0 }}
          aria-label="Previous page"
        >‹</button>

        {/* Open book */}
        <div style={{ perspective: '1400px', flexShrink: 0 }}>
          <div style={{
            position: 'relative',
            width: 'min(860px, calc(100vw - 140px))',
            height: 'min(560px, 80vh)',
            display: 'flex',
            boxShadow: '0 20px 60px rgba(0,0,0,.7), 0 4px 12px rgba(0,0,0,.5)',
            borderRadius: 2,
          }}>

            {/* Left page */}
            <div style={{
              width: '50%', height: '100%',
              background: PAGE_BG,
              borderRadius: '2px 0 0 2px',
              boxShadow: 'inset -4px 0 12px rgba(0,0,0,.12)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <PageContent
                entry={leftEntry}
                pageNum={leftPageNum}
                isRight={false}
                userId={userId}
                onAddNote={reload}
              />
            </div>

            {/* Spine */}
            <div style={{
              width: 18, flexShrink: 0,
              background: 'linear-gradient(90deg,#3A1A08 0%,#7A3F1A 35%,#8B4A28 50%,#7A3F1A 65%,#3A1A08 100%)',
              boxShadow: '0 0 12px rgba(0,0,0,.5)',
              zIndex: 2,
            }} />

            {/* Right page */}
            <div style={{
              width: '50%', height: '100%',
              background: PAGE_BG,
              borderRadius: '0 2px 2px 0',
              boxShadow: 'inset 4px 0 12px rgba(0,0,0,.12)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <PageContent
                entry={rightEntry}
                pageNum={rightPageNum}
                isRight={true}
                userId={userId}
                onAddNote={(action) => {
                  if (action === 'prompt') setAddNoteSpread(spread);
                  else reload();
                }}
              />
            </div>

            {/* Flipping page overlay */}
            {flipState && (
              <div style={{
                position: 'absolute',
                top: 0,
                ...(flipState.dir === 'next'
                  ? { left: 'calc(50% + 9px)', width: 'calc(50% - 9px)', transformOrigin: 'left center' }
                  : { left: 0, width: 'calc(50% - 9px)', transformOrigin: 'right center' }
                ),
                height: '100%',
                transformStyle: 'preserve-3d',
                animation: `${flipState.dir === 'next' ? 'jrnl-flip-fwd' : 'jrnl-flip-bwd'} 0.58s cubic-bezier(.45,0,.55,1) forwards`,
                zIndex: 20,
                pointerEvents: 'none',
              }}>
                {/* Front face */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: PAGE_BG, boxShadow: flipState.dir === 'next' ? '-4px 0 20px rgba(0,0,0,.25)' : '4px 0 20px rgba(0,0,0,.25)', overflow: 'hidden' }}>
                  <PageContent
                    entry={flipState.dir === 'next' ? rightEntry : leftEntry}
                    pageNum={flipState.dir === 'next' ? rightPageNum : leftPageNum}
                    isRight={flipState.dir === 'next'}
                    userId={userId}
                  />
                </div>
                {/* Back face (pre-rotated 180°) */}
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: PAGE_BG, overflow: 'hidden' }}>
                  {(() => {
                    const nextSpread = flipState.dir === 'next' ? spread + 1 : spread - 1;
                    const backLeft = pages[nextSpread * 2] ?? null;
                    const backRight = pages[nextSpread * 2 + 1] ?? null;
                    const backEntry = flipState.dir === 'next' ? backLeft : backRight;
                    const backPageNum = flipState.dir === 'next' ? nextSpread * 2 + 1 : nextSpread * 2 + 2;
                    return <PageContent entry={backEntry} pageNum={backPageNum} isRight={flipState.dir !== 'next'} userId={userId} />;
                  })()}
                </div>
              </div>
            )}

            {/* Add note overlay */}
            {addNoteSpread === spread && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(253,251,244,.96)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, borderRadius: 2 }}>
                <div style={{ fontFamily: FONT.display, fontStyle: 'italic', fontSize: 20, color: INK, marginBottom: 18 }}>Add a journal entry</div>
                <textarea
                  autoFocus
                  value={addNoteDraft}
                  onChange={e => setAddNoteDraft(e.target.value)}
                  placeholder="Write your note here…"
                  rows={6}
                  style={{ width: '100%', maxWidth: 480, fontFamily: FONT.read, fontSize: 14, lineHeight: 1.75, color: INK, background: 'transparent', border: 'none', borderBottom: `1px solid ${PAGE_LINE}`, outline: 'none', resize: 'none', padding: '8px 0' }}
                />
                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button onClick={handleAddNoteFromPage} disabled={addNoteSaving} style={{ fontFamily: FONT.body, fontSize: 12, letterSpacing: '.06em', background: '#4A2010', border: 'none', color: '#FBF6E8', padding: '9px 22px', borderRadius: 2, cursor: 'pointer' }}>
                    {addNoteSaving ? 'Saving…' : 'Save to journal'}
                  </button>
                  <button onClick={() => { setAddNoteSpread(null); setAddNoteDraft(''); }} style={{ fontFamily: FONT.body, fontSize: 12, background: 'transparent', border: '1px solid rgba(120,80,40,.3)', color: INK_MUTED, padding: '9px 16px', borderRadius: 2, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next arrow */}
        <button
          onClick={() => flip('next')}
          disabled={!canNext || !!flipState}
          style={{ width: 44, height: 44, borderRadius: '50%', background: canNext ? 'rgba(194,163,94,.15)' : 'rgba(255,255,255,.04)', border: `1px solid ${canNext ? `${GOLD}0.4)` : 'rgba(255,255,255,.08)'}`, color: canNext ? `${GOLD}0.9)` : 'rgba(255,255,255,.15)', fontSize: 18, cursor: canNext ? 'pointer' : 'default', transition: 'all .2s', flexShrink: 0 }}
          aria-label="Next page"
        >›</button>
      </div>

      {/* Page indicator */}
      <div style={{ textAlign: 'center', paddingBottom: 20, fontFamily: FONT.body, fontSize: 11, letterSpacing: '.12em', color: `${GOLD}0.4)` }}>
        {entries.length === 0 ? 'No entries yet' : `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} · Page ${leftPageNum}–${rightPageNum}`}
      </div>
    </div>
  );
}
