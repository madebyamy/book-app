import React, { useState, useEffect } from 'react';
import { REEL_THEME as T, REEL_DRAWERS, FONT } from '../../constants.js';
import { loadShows, saveShows, loadReelProgress } from '../../lib/reel.js';
import { AddShowModal } from './AddShowModal.jsx';
import { ShowModal } from './ShowModal.jsx';

const STARS = [1,2,3,4,5];

function TypeBadge({ type }) {
  const labels = { tv:"Series", documentary:"Doc", film:"Film", podcast:"Podcast" };
  return (
    <span style={{ fontFamily:FONT.body, fontSize:9.5, letterSpacing:".14em", textTransform:"uppercase", color:T.accent, background:`${T.accent}18`, padding:"2px 7px", borderRadius:10 }}>
      {labels[type] || type}
    </span>
  );
}

function ShowCard({ show, rating, onOpen }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onOpen} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:"none", border:"none", cursor:"pointer", padding:0, textAlign:"left", width:"100%", borderRadius:6, overflow:"hidden", transition:"transform .2s", transform: hov ? "translateY(-4px)" : "none" }}>
      <div style={{ position:"relative", aspectRatio:"2/3", borderRadius:6, overflow:"hidden", background:T.surface3, boxShadow: hov ? "0 12px 32px rgba(0,0,0,.6)" : "0 4px 16px rgba(0,0,0,.4)", transition:"box-shadow .2s" }}>
        {show.cover
          ? <img src={show.cover} alt={show.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={e=>e.target.style.display="none"} />
          : <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
              <span style={{ fontSize:32 }}>🎬</span>
              <span style={{ fontFamily:FONT.body, fontSize:11, color:T.inkFaint, textAlign:"center", padding:"0 8px", lineHeight:1.3 }}>{show.title}</span>
            </div>
        }
        {/* Hover overlay */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.1) 60%, transparent 100%)", opacity:hov?1:0, transition:"opacity .2s" }}>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"12px 10px" }}>
            <div style={{ fontFamily:FONT.body, fontSize:11.5, fontWeight:600, color:"#fff", lineHeight:1.3, marginBottom:4 }}>{show.title}</div>
            {rating > 0 && (
              <div style={{ display:"flex", gap:2 }}>
                {STARS.map(n => <span key={n} style={{ fontSize:11, color:n<=rating?T.accent:"rgba(255,255,255,.3)" }}>★</span>)}
              </div>
            )}
          </div>
        </div>
        {/* Type badge */}
        <div style={{ position:"absolute", top:8, left:8 }}>
          <TypeBadge type={show.type} />
        </div>
      </div>
      {/* Title below poster */}
      <div style={{ padding:"6px 2px 0" }}>
        <div style={{ fontFamily:FONT.body, fontSize:12, fontWeight:500, color:T.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", lineHeight:1.3 }}>{show.title}</div>
        {show.year && <div style={{ fontFamily:FONT.body, fontSize:11, color:T.muted }}>{show.year}</div>}
      </div>
    </button>
  );
}

function DrawerRow({ drawer, shows, ratings, onOpen, onAddToDrawer }) {
  const [open, setOpen] = useState(drawer.id === "watching" || shows.length > 0);

  if (shows.length === 0 && drawer.id !== "watching") return (
    <div style={{ borderBottom:`1px solid ${T.line}` }}>
      <button onClick={() => setOpen(o=>!o)} style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"14px 0", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
        <span style={{ fontFamily:FONT.body, fontSize:12, color:T.inkFaint }}>{drawer.icon}</span>
        <span style={{ fontFamily:FONT.body, fontSize:12.5, letterSpacing:".1em", textTransform:"uppercase", color:T.inkFaint }}>{drawer.label}</span>
        <span style={{ fontFamily:FONT.body, fontSize:11, color:T.muted, marginLeft:"auto" }}>0</span>
      </button>
    </div>
  );

  return (
    <div style={{ marginBottom: 8 }}>
      <button onClick={() => setOpen(o=>!o)}
        style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"14px 0", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
        <span style={{ fontFamily:FONT.body, fontSize:14 }}>{drawer.icon}</span>
        <span style={{ fontFamily:FONT.body, fontSize:12.5, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:T.ink }}>{drawer.label}</span>
        <span style={{ fontFamily:FONT.body, fontSize:11.5, color:T.accent, background:`${T.accent}18`, padding:"2px 8px", borderRadius:10 }}>{shows.length}</span>
        <span style={{ marginLeft:"auto", fontFamily:FONT.body, fontSize:14, color:T.inkFaint, transition:"transform .2s", transform:open?"rotate(180deg)":"none", display:"inline-block" }}>›</span>
      </button>

      {open && (
        <div style={{ paddingBottom:24 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))", gap:14 }}>
            {shows.map(s => (
              <ShowCard key={s.id} show={s} rating={ratings[s.id] || 0} onOpen={() => onOpen(s)} />
            ))}
          </div>
        </div>
      )}
      <div style={{ height:1, background:T.line, marginBottom:8 }} />
    </div>
  );
}

export function TheReel({ userId, onBack }) {
  const [shows, setShows]         = useState([]);
  const [loaded, setLoaded]       = useState(false);
  const [ratings, setRatings]     = useState({});
  const [selectedShow, setSelectedShow] = useState(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [search, setSearch]       = useState("");

  useEffect(() => {
    if (!userId) return;
    loadShows(userId).then(async (list) => {
      setShows(list);
      // Load ratings for all shows
      const ratingMap = {};
      await Promise.all(list.map(async s => {
        const p = await loadReelProgress(userId, s.id);
        if (p?.rating) ratingMap[s.id] = p.rating;
      }));
      setRatings(ratingMap);
      setLoaded(true);
    });
  }, [userId]);

  const updateShows = async (next) => {
    setShows(next);
    await saveShows(userId, next);
  };

  const handleAdd = async (show) => {
    const next = [...shows, show];
    await updateShows(next);
    setShowAdd(false);
  };

  const handleDelete = async (show) => {
    const next = shows.filter(s => s.id !== show.id);
    await updateShows(next);
    setSelectedShow(null);
  };

  const handleShowUpdated = (updatedShow) => {
    setShows(prev => prev.map(s => s.id === updatedShow.id ? { ...s, ...updatedShow } : s));
    if (updatedShow.rating !== undefined) {
      setRatings(prev => ({ ...prev, [updatedShow.id]: updatedShow.rating }));
    }
  };

  const filtered = search.trim()
    ? shows.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.author?.toLowerCase().includes(search.toLowerCase()))
    : shows;

  const byDrawer = (drawerId) => filtered.filter(s => (s.drawerId || "want") === drawerId);

  return (
    <div style={{ minHeight:"100vh", background:T.bg, color:T.ink }}>

      {/* Header */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.line}`, padding:"clamp(20px,4vw,40px) clamp(20px,5vw,48px) clamp(16px,3vw,28px)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 }}>
            <div>
              <div style={{ fontFamily:FONT.body, fontSize:10, letterSpacing:".3em", textTransform:"uppercase", color:T.accent, marginBottom:6 }}>
                🎬 The Reel
              </div>
              <h1 style={{ fontFamily:FONT.display, fontWeight:600, fontSize:"clamp(2rem,5vw,3.2rem)", color:T.ink, margin:0, lineHeight:1.05 }}>
                Your Watchlist
              </h1>
              <p style={{ fontFamily:FONT.body, fontSize:13.5, color:T.inkFaint, margin:"6px 0 0", lineHeight:1.5 }}>
                Documentaries, series, podcasts — and your notes on all of them.
              </p>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              {onBack && (
                <button onClick={onBack} style={{ fontFamily:FONT.body, fontSize:12, letterSpacing:".04em", background:"none", border:`1px solid ${T.line}`, color:T.inkSoft, padding:"8px 14px", borderRadius:4, cursor:"pointer" }}>
                  ← Back
                </button>
              )}
              <button onClick={() => setShowAdd(true)}
                style={{ fontFamily:FONT.body, fontSize:13, letterSpacing:".04em", fontWeight:600, background:T.accent, border:"none", color:T.bg, padding:"9px 18px", borderRadius:4, cursor:"pointer" }}>
                + Add show
              </button>
            </div>
          </div>
          {/* Search */}
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search your watchlist…"
            style={{ fontFamily:FONT.body, fontSize:14, color:T.ink, background:T.surface2, border:`1px solid ${T.line}`, borderRadius:4, padding:"9px 14px", width:"min(360px,100%)", outline:"none", colorScheme:"dark" }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"clamp(20px,4vw,40px) clamp(20px,5vw,48px)" }}>
        {!loaded ? (
          <p style={{ fontFamily:FONT.body, fontSize:14, color:T.inkFaint }}>Loading…</p>
        ) : shows.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 24px" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎬</div>
            <h3 style={{ fontFamily:FONT.display, fontWeight:600, fontSize:22, color:T.ink, margin:"0 0 8px" }}>Your reel is empty</h3>
            <p style={{ fontFamily:FONT.body, fontSize:14, color:T.inkFaint, margin:"0 0 20px" }}>Add a documentary, series, or podcast to get started.</p>
            <button onClick={() => setShowAdd(true)}
              style={{ fontFamily:FONT.body, fontSize:13, letterSpacing:".05em", background:T.accent, border:"none", color:T.bg, padding:"10px 22px", borderRadius:4, cursor:"pointer", fontWeight:600 }}>
              + Add your first show
            </button>
          </div>
        ) : (
          <div>
            {REEL_DRAWERS.map(drawer => (
              <DrawerRow
                key={drawer.id}
                drawer={drawer}
                shows={byDrawer(drawer.id)}
                ratings={ratings}
                onOpen={setSelectedShow}
                onAddToDrawer={() => setShowAdd(true)}
              />
            ))}
            {search && filtered.length === 0 && (
              <p style={{ fontFamily:FONT.body, fontSize:14, color:T.inkFaint, textAlign:"center", padding:"40px 0" }}>No results for "{search}"</p>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && <AddShowModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
      {selectedShow && (
        <ShowModal
          userId={userId}
          show={selectedShow}
          onClose={() => setSelectedShow(null)}
          onShowUpdated={handleShowUpdated}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
