import React, { useState, useEffect, useCallback } from 'react';
import { REEL_THEME as T, FONT } from '../../constants.js';
import { loadReelNotes, saveReelNotes, loadReelProgress, saveReelProgress } from '../../lib/reel.js';

const STARS = [1,2,3,4,5];
const TYPE_LABELS = { tv:"Series", documentary:"Documentary", film:"Film", podcast:"Podcast" };

function StarRating({ value, onChange }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display:"flex", gap:3 }}>
      {STARS.map(n => (
        <button key={n} type="button"
          onClick={() => onChange(value===n ? 0 : n)}
          onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
          style={{ background:"none", border:"none", cursor:"pointer", padding:"2px", fontSize:20, color:(hov||value)>=n ? T.accent : T.line, transition:"color .1s" }}>
          ★
        </button>
      ))}
    </div>
  );
}

function formatRuntime(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes/60)}h ${minutes%60 > 0 ? `${minutes%60}m` : ""}`.trim();
}

export function ShowModal({ userId, show, onClose, onShowUpdated, onDelete }) {
  const [tab, setTab]               = useState("info");
  const [notes, setNotes]           = useState([]);
  const [noteText, setNoteText]     = useState("");
  const [noteEpisode, setNoteEpisode] = useState("");
  const [noteShare, setNoteShare]   = useState(false);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [progress, setProgress]     = useState({ watchedEpisodes: [], rating: null });
  const [progLoaded, setProgLoaded] = useState(false);
  const [episodes, setEpisodes]     = useState([]);
  const [epLoading, setEpLoading]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [editingRating, setEditingRating] = useState(false);

  // Load notes + progress
  useEffect(() => {
    if (!userId) return;
    loadReelNotes(userId, show.id).then(n => { setNotes(n); setNotesLoaded(true); });
    loadReelProgress(userId, show.id).then(p => { setProgress(p); setProgLoaded(true); });
  }, [userId, show.id]);

  // Fetch episodes from TMDB if we have a tmdbId and it's a series
  useEffect(() => {
    if (!show.tmdbId || show.type === "film" || show.type === "podcast") return;
    if (episodes.length > 0) return;
    setEpLoading(true);
    const seasons = show.seasons || 1;
    // Fetch season 1 (can expand later)
    fetch(`/api/lookup-show?tmdbId=${show.tmdbId}&type=${show.type}&fetchSeason=1`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.episodes) setEpisodes(d.episodes);
        setEpLoading(false);
      })
      .catch(() => setEpLoading(false));
  }, [show.tmdbId, show.type]);

  const saveProgress = async (next) => {
    setProgress(next);
    await saveReelProgress(userId, show.id, next);
  };

  const toggleEpisode = async (epKey) => {
    const watched = new Set(progress.watchedEpisodes || []);
    watched.has(epKey) ? watched.delete(epKey) : watched.add(epKey);
    await saveProgress({ ...progress, watchedEpisodes: Array.from(watched) });
  };

  const handleRating = async (r) => {
    await saveProgress({ ...progress, rating: r });
    onShowUpdated?.({ ...show, rating: r });
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    const trimmed = noteText.trim();
    if (!trimmed) return;
    const newNote = {
      id: Date.now().toString(36),
      text: trimmed,
      episode: noteEpisode.trim() || null,
      tag: "", shared: noteShare,
      addedAt: new Date().toISOString(),
    };
    const updated = [...notes, newNote];
    setNotes(updated);
    setNoteText(""); setNoteEpisode(""); setNoteShare(false);
    await saveReelNotes(userId, show.id, updated);
  };

  const handleDeleteNote = async (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    await saveReelNotes(userId, show.id, updated);
  };

  const watchedSet = new Set(progress.watchedEpisodes || []);
  const totalEp = show.totalEpisodes || episodes.length || null;
  const watchedCount = watchedSet.size;
  const pct = totalEp ? Math.min(100, Math.round((watchedCount / totalEp) * 100)) : 0;

  // Compute episode list for notes selector
  const epOptions = episodes.length > 0
    ? episodes.map(ep => `S${ep.season}E${ep.number}: ${ep.name}`)
    : totalEp
      ? Array.from({ length: totalEp }, (_, i) => `Episode ${i+1}`)
      : [];

  return (
    <>
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:80, background:"rgba(0,0,0,.82)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"32px 16px", overflowY:"auto" }}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:8, width:"min(680px,100%)", boxShadow:"0 32px 80px rgba(0,0,0,.7)", position:"relative" }}>

        {/* Close */}
        <button onClick={onClose} style={{ position:"absolute", top:14, right:14, zIndex:2, background:"none", border:"none", cursor:"pointer", fontFamily:FONT.body, fontSize:22, color:T.inkFaint, lineHeight:1, padding:"4px 8px" }}>×</button>

        {/* Header band */}
        <div style={{ background:T.bg, borderRadius:"8px 8px 0 0", padding:"20px 24px", borderBottom:`1px solid ${T.line}` }}>
          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            {/* Poster */}
            {show.cover
              ? <img src={show.cover} alt="" style={{ width:88, height:132, objectFit:"cover", borderRadius:4, boxShadow:"0 8px 24px rgba(0,0,0,.6)", flexShrink:0 }} onError={e=>e.target.style.display="none"} />
              : <div style={{ width:88, height:132, background:T.surface3, borderRadius:4, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:28 }}>🎬</span>
                </div>
            }
            {/* Meta */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                <span style={{ fontFamily:FONT.body, fontSize:10, letterSpacing:".2em", textTransform:"uppercase", color:T.accent, background:`${T.accent}18`, padding:"2px 8px", borderRadius:12 }}>
                  {TYPE_LABELS[show.type] || show.type}
                </span>
                {show.genres?.map(g => (
                  <span key={g} style={{ fontFamily:FONT.body, fontSize:10, letterSpacing:".1em", textTransform:"uppercase", color:T.muted }}>{g}</span>
                ))}
              </div>
              <h2 style={{ fontFamily:FONT.display, fontWeight:600, fontSize:"clamp(1.3rem,4vw,2rem)", color:T.ink, margin:"0 0 4px", lineHeight:1.1 }}>{show.title}</h2>
              {show.author && <div style={{ fontFamily:FONT.body, fontSize:13, color:T.inkSoft, marginBottom:6 }}>{show.author}</div>}
              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 16px", fontFamily:FONT.body, fontSize:12, color:T.muted, marginBottom:10 }}>
                {show.year && <span>{show.year}</span>}
                {show.seasons > 1 && <span>{show.seasons} seasons</span>}
                {totalEp && <span>{totalEp} episode{totalEp!==1?"s":""}</span>}
                {show.episodeRuntime && <span>{formatRuntime(show.episodeRuntime)} / ep</span>}
                {show.totalRuntime && <span>{formatRuntime(show.totalRuntime)}</span>}
                {show.whereToWatch?.length > 0 && <span style={{ color:T.accent }}>{show.whereToWatch[0]}</span>}
              </div>
              {/* Rating */}
              <StarRating value={progress.rating||0} onChange={handleRating} />
            </div>
          </div>

          {/* Episode progress bar */}
          {totalEp > 0 && (
            <div style={{ marginTop:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontFamily:FONT.body, fontSize:11, color:T.muted, marginBottom:4 }}>
                <span style={{ letterSpacing:".1em", textTransform:"uppercase" }}>Episodes watched</span>
                <span style={{ color:T.accent }}>{watchedCount} / {totalEp} · {pct}%</span>
              </div>
              <div style={{ height:6, borderRadius:4, background:T.surface3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:T.accent, borderRadius:4, transition:"width .35s ease" }} />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:`1px solid ${T.line}`, padding:"0 24px", background:T.surface }}>
          {[["info","Overview"], ["episodes","Episodes"], ["notes","Notes"]].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ fontFamily:FONT.body, fontSize:13, letterSpacing:".04em", padding:"12px 16px", background:"none", border:"none", borderBottom:`2px solid ${tab===key ? T.accent : "transparent"}`, color:tab===key ? T.accent : T.inkFaint, cursor:"pointer", transition:"all .15s", marginBottom:-1 }}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div style={{ padding:"20px 24px 24px" }}>

          {/* ── Overview ── */}
          {tab === "info" && (
            <div>
              {show.description && (
                <p style={{ fontFamily:FONT.read, fontSize:14.5, lineHeight:1.7, color:T.inkSoft, margin:"0 0 16px" }}>{show.description}</p>
              )}
              {show.whereToWatch?.length > 0 && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontFamily:FONT.body, fontSize:11, letterSpacing:".12em", textTransform:"uppercase", color:T.muted, marginBottom:6 }}>Where to watch</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {show.whereToWatch.map(w => (
                      <span key={w} style={{ fontFamily:FONT.body, fontSize:12, color:T.ink, background:T.surface2, border:`1px solid ${T.line}`, padding:"4px 10px", borderRadius:20 }}>{w}</span>
                    ))}
                  </div>
                </div>
              )}
              {!show.description && !show.whereToWatch?.length && (
                <p style={{ fontFamily:FONT.body, fontSize:13, color:T.inkFaint, fontStyle:"italic" }}>No description available. Edit the show to add one.</p>
              )}
            </div>
          )}

          {/* ── Episodes ── */}
          {tab === "episodes" && (
            <div>
              {show.type === "film" || show.type === "podcast" ? (
                <p style={{ fontFamily:FONT.body, fontSize:13, color:T.inkFaint, fontStyle:"italic" }}>
                  {show.type === "film" ? "Films don't have episodes." : "Track individual podcast episodes in your notes below."}
                </p>
              ) : epLoading ? (
                <p style={{ fontFamily:FONT.body, fontSize:13, color:T.inkFaint }}>Loading episodes…</p>
              ) : episodes.length > 0 ? (
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  {episodes.map(ep => {
                    const key = `S${ep.season}E${ep.number}`;
                    const watched = watchedSet.has(key);
                    return (
                      <label key={key} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 12px", borderRadius:4, cursor:"pointer", background:watched ? `${T.accent}0D` : "transparent", border:`1px solid ${watched ? T.accent+"33" : T.line2}`, transition:"all .15s" }}>
                        <input type="checkbox" checked={watched} onChange={() => toggleEpisode(key)}
                          style={{ marginTop:3, flexShrink:0, accentColor:T.accent, cursor:"pointer" }} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontFamily:FONT.body, fontSize:13, fontWeight:500, color:watched ? T.inkSoft : T.ink }}>
                            <span style={{ color:T.muted, marginRight:8 }}>Ep {ep.number}</span>
                            {ep.name}
                          </div>
                          {ep.runtime && <div style={{ fontFamily:FONT.body, fontSize:11, color:T.muted, marginTop:2 }}>{formatRuntime(ep.runtime)}</div>}
                          {ep.overview && <div style={{ fontFamily:FONT.read, fontSize:12, color:T.inkFaint, marginTop:4, lineHeight:1.5 }}>{ep.overview.slice(0,120)}{ep.overview.length>120?"…":""}</div>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : totalEp ? (
                // No TMDB episode data — show simple numbered checklist
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  {Array.from({ length: totalEp }, (_, i) => {
                    const key = `E${i+1}`;
                    const watched = watchedSet.has(key);
                    return (
                      <label key={key} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 12px", borderRadius:4, cursor:"pointer", background:watched?`${T.accent}0D`:"transparent", border:`1px solid ${watched?T.accent+"33":T.line2}`, transition:"all .15s" }}>
                        <input type="checkbox" checked={watched} onChange={() => toggleEpisode(key)} style={{ accentColor:T.accent, cursor:"pointer" }} />
                        <span style={{ fontFamily:FONT.body, fontSize:13, color:watched?T.inkSoft:T.ink }}>Episode {i+1}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontFamily:FONT.body, fontSize:13, color:T.inkFaint, fontStyle:"italic" }}>Add the episode count to see a checklist here.</p>
              )}
            </div>
          )}

          {/* ── Notes ── */}
          {tab === "notes" && (
            <div>
              {/* Add note form */}
              <form onSubmit={handleAddNote} style={{ marginBottom:20 }}>
                <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                  <select value={noteEpisode} onChange={e => setNoteEpisode(e.target.value)}
                    style={{ fontFamily:FONT.body, fontSize:13, color:T.inkSoft, background:T.surface2, border:`1px solid ${T.line}`, borderRadius:3, padding:"7px 10px", flex:"0 0 auto", maxWidth:220, colorScheme:"dark" }}>
                    <option value="">All episodes</option>
                    {epOptions.map(ep => <option key={ep} value={ep}>{ep}</option>)}
                    {epOptions.length === 0 && totalEp && Array.from({length:totalEp},(_,i)=>`Episode ${i+1}`).map(ep => <option key={ep} value={ep}>{ep}</option>)}
                  </select>
                  <label style={{ display:"flex", alignItems:"center", gap:6, fontFamily:FONT.body, fontSize:12, color:T.muted, cursor:"pointer", flexShrink:0 }}>
                    <input type="checkbox" checked={noteShare} onChange={e=>setNoteShare(e.target.checked)} style={{ accentColor:T.accent }} />
                    Share
                  </label>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <textarea value={noteText} onChange={e=>setNoteText(e.target.value)}
                    placeholder="Add a note…" rows={2}
                    style={{ flex:1, fontFamily:FONT.read, fontSize:14, color:T.ink, background:T.surface2, border:`1px solid ${T.line}`, borderRadius:3, padding:"9px 12px", resize:"vertical", lineHeight:1.55, outline:"none", colorScheme:"dark" }} />
                  <button type="submit" disabled={!noteText.trim()}
                    style={{ alignSelf:"flex-end", fontFamily:FONT.body, fontSize:12, letterSpacing:".05em", textTransform:"uppercase", fontWeight:600, background:noteText.trim()?T.accent:T.surface3, border:"none", color:noteText.trim()?T.bg:T.inkFaint, padding:"9px 14px", borderRadius:3, cursor:noteText.trim()?"pointer":"not-allowed", whiteSpace:"nowrap" }}>
                    Add
                  </button>
                </div>
              </form>

              {/* Notes list */}
              {!notesLoaded
                ? <p style={{ fontFamily:FONT.body, fontSize:13, color:T.inkFaint }}>Loading…</p>
                : notes.length === 0
                  ? <p style={{ fontFamily:FONT.body, fontSize:13, color:T.inkFaint, fontStyle:"italic" }}>No notes yet. Start watching and jot things down.</p>
                  : (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {[...notes].reverse().map(n => (
                        <div key={n.id} style={{ background:T.surface2, border:`1px solid ${T.line}`, borderRadius:4, padding:"10px 14px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                            <div style={{ flex:1 }}>
                              {n.episode && (
                                <div style={{ fontFamily:FONT.body, fontSize:10.5, letterSpacing:".1em", textTransform:"uppercase", color:T.accent, marginBottom:4 }}>{n.episode}</div>
                              )}
                              <p style={{ fontFamily:FONT.read, fontSize:14, lineHeight:1.65, color:T.ink, margin:0 }}>{n.text}</p>
                            </div>
                            <button onClick={() => handleDeleteNote(n.id)}
                              style={{ background:"none", border:"none", cursor:"pointer", color:T.inkFaint, fontSize:16, padding:"0 4px", flexShrink:0 }} title="Delete note">×</button>
                          </div>
                          <div style={{ display:"flex", gap:10, marginTop:6, fontFamily:FONT.body, fontSize:11, color:T.muted }}>
                            {n.shared && <span style={{ color:T.accent }}>↗ Shared</span>}
                            <span>{new Date(n.addedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
              }
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop:`1px solid ${T.line}`, padding:"14px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={() => setConfirmDelete(true)}
            style={{ fontFamily:FONT.body, fontSize:12, letterSpacing:".04em", background:"none", border:`1px solid ${T.coral}55`, color:T.coral, padding:"7px 14px", borderRadius:4, cursor:"pointer" }}>
            Remove from Reel
          </button>
          <button onClick={onClose}
            style={{ fontFamily:FONT.body, fontSize:12, letterSpacing:".04em", background:T.surface2, border:`1px solid ${T.line}`, color:T.inkSoft, padding:"7px 14px", borderRadius:4, cursor:"pointer" }}>
            Close
          </button>
        </div>
      </div>
    </div>

    {/* Delete confirmation */}
    {confirmDelete && (
      <div onClick={() => setConfirmDelete(false)} style={{ position:"fixed", inset:0, zIndex:90, background:"rgba(0,0,0,.72)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div onClick={e=>e.stopPropagation()} style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:8, padding:"28px 28px 24px", maxWidth:360, width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,.6)" }}>
          <h3 style={{ fontFamily:FONT.display, fontWeight:600, fontSize:20, color:T.ink, margin:"0 0 10px" }}>Remove from Reel?</h3>
          <p style={{ fontFamily:FONT.body, fontSize:13.5, color:T.inkSoft, margin:"0 0 20px", lineHeight:1.55 }}>
            This will remove <strong style={{ color:T.ink }}>{show.title}</strong> along with all your notes and watch progress.
          </p>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setConfirmDelete(false)} style={{ flex:1, fontFamily:FONT.body, fontSize:13, background:"transparent", border:`1px solid ${T.line}`, color:T.muted, padding:"10px", borderRadius:4, cursor:"pointer" }}>Cancel</button>
            <button onClick={async () => { setDeleting(true); await onDelete?.(show); }} disabled={deleting}
              style={{ flex:1, fontFamily:FONT.body, fontSize:13, background:T.coral, border:"none", color:"#fff", padding:"10px", borderRadius:4, cursor:"pointer", fontWeight:600 }}>
              {deleting ? "Removing…" : "Yes, remove"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
