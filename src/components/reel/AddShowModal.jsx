import React, { useState } from 'react';
import { REEL_THEME as T, FONT } from '../../constants.js';

const TYPES = [
  { value: "tv",       label: "TV Series" },
  { value: "documentary", label: "Documentary" },
  { value: "film",     label: "Film" },
  { value: "podcast",  label: "Podcast" },
];

export function AddShowModal({ onAdd, onClose }) {
  const [type, setType]           = useState("tv");
  const [title, setTitle]         = useState("");
  const [author, setAuthor]       = useState("");   // host/director
  const [description, setDesc]    = useState("");
  const [cover, setCover]         = useState(null);
  const [year, setYear]           = useState("");
  const [seasons, setSeasons]     = useState("");
  const [episodes, setEpisodes]   = useState("");
  const [runtime, setRuntime]     = useState("");   // minutes/ep or total
  const [where, setWhere]         = useState("");   // comma-separated
  const [genres, setGenres]       = useState([]);
  const [tmdbId, setTmdbId]       = useState(null);
  const [podcastId, setPodcastId] = useState(null);
  const [drawerId, setDrawerId]   = useState("want");
  const [error, setError]         = useState("");
  const [fetching, setFetching]   = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [candidates, setCandidates] = useState(null);
  const [preview, setPreview]     = useState(null);

  const inp = {
    width: "100%", fontFamily: FONT.body, fontSize: 14,
    color: T.ink, background: T.surface2,
    border: `1px solid ${T.line}`, borderRadius: 3,
    padding: "9px 12px", outline: "none", boxSizing: "border-box",
    colorScheme: "dark",
  };
  const lbl = {
    fontFamily: FONT.body, fontSize: 11, letterSpacing: ".14em",
    textTransform: "uppercase", color: T.muted, display: "block", marginBottom: 5,
  };

  const applyResult = (d) => {
    if (d.title)       setTitle(d.title);
    if (d.description) setDesc(d.description);
    if (d.cover)       setCover(d.cover);
    if (d.year)        setYear(d.year);
    if (d.seasons)     setSeasons(String(d.seasons));
    if (d.totalEpisodes) setEpisodes(String(d.totalEpisodes));
    if (d.episodeRuntime) setRuntime(String(d.episodeRuntime));
    if (d.totalRuntime)   setRuntime(String(d.totalRuntime));
    if (d.whereToWatch?.length) setWhere(d.whereToWatch.join(", "));
    if (d.genres?.length) setGenres(d.genres);
    if (d.author)       setAuthor(d.author);
    if (d.tmdbId)       setTmdbId(d.tmdbId);
    if (d.podcastId)    setPodcastId(d.podcastId);
    setPreview(d);
    setCandidates(null);
  };

  const doLookup = async (overrideTitle, overrideType, overrideTmdbId) => {
    const t = (overrideTitle || title).trim();
    const tp = overrideType || type;
    const id = overrideTmdbId || null;
    if (!t && !id) return;
    setFetching(true); setFetchError(""); setCandidates(null); setPreview(null);
    try {
      const params = new URLSearchParams({ type: tp });
      if (id)  params.set("tmdbId", id);
      else     params.set("title", t);
      const res = await fetch(`/api/lookup-show?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.found) { setFetchError("no-results"); }
      else if (data.candidates) { setCandidates(data.candidates); }
      else { applyResult(data); }
    } catch { setFetchError("Lookup failed. Check your connection."); }
    setFetching(false);
  };

  const pickCandidate = (c) => {
    if (c.tmdbId) doLookup(c.title, c.type || type, c.tmdbId);
    else applyResult(c);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    onAdd({
      id: `reel-${Date.now()}`,
      type, title: title.trim(),
      description: description.trim() || null,
      cover: cover || null,
      year: year || null,
      seasons: seasons ? parseInt(seasons) : null,
      totalEpisodes: episodes ? parseInt(episodes) : null,
      episodeRuntime: runtime ? parseInt(runtime) : null,
      whereToWatch: where ? where.split(",").map(s => s.trim()).filter(Boolean) : [],
      genres, tmdbId, podcastId,
      drawerId,
      author: author.trim() || null,
      addedAt: new Date().toISOString(),
    });
  };

  const drawers = [
    { id: "watching", label: "Now Watching" },
    { id: "want",     label: "To Watch" },
    { id: "watched",  label: "Finished" },
  ];

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:70, background:"rgba(0,0,0,.78)", backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:8, width:"min(520px,100%)", maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 60px rgba(0,0,0,.5)" }}>

        {/* Header */}
        <div style={{ background:T.bg, padding:"20px 24px 16px", borderBottom:`1px solid ${T.line}`, borderRadius:"8px 8px 0 0" }}>
          <div style={{ fontFamily:FONT.body, fontSize:10, letterSpacing:".28em", textTransform:"uppercase", color:T.accent, marginBottom:6 }}>The Reel</div>
          <h2 style={{ fontFamily:FONT.display, fontWeight:600, fontSize:24, color:T.ink, margin:0, lineHeight:1.1 }}>Add to your watchlist</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:"20px 24px 24px", display:"flex", flexDirection:"column", gap:16 }}>

          {/* Type selector */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => { setType(t.value); setPreview(null); setCandidates(null); }}
                style={{ fontFamily:FONT.body, fontSize:12, letterSpacing:".04em", padding:"5px 12px", borderRadius:20, border:`1px solid ${type===t.value ? T.accent : T.line}`, background: type===t.value ? `${T.accent}22` : "transparent", color: type===t.value ? T.accent : T.inkFaint, cursor:"pointer", transition:"all .15s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Title + lookup */}
          <div>
            <label style={lbl}>Title *</label>
            <div style={{ display:"flex", gap:8 }}>
              <input value={title} onChange={e => { setTitle(e.target.value); setPreview(null); setCandidates(null); }} placeholder={type==="podcast" ? "e.g. Stuff You Missed in History Class" : "e.g. Renaissance: The Blood and the Beauty"} style={{ ...inp, flex:1 }} autoFocus />
              <button type="button" onClick={() => doLookup()} disabled={!title.trim() || fetching}
                style={{ flexShrink:0, fontFamily:FONT.body, fontSize:12, letterSpacing:".04em", background:T.accent, border:"none", color:T.bg, padding:"9px 14px", borderRadius:3, cursor:title.trim()&&!fetching?"pointer":"not-allowed", opacity:title.trim()&&!fetching?1:0.5, whiteSpace:"nowrap", fontWeight:600 }}>
                {fetching ? "Looking…" : "🔍 Look up"}
              </button>
            </div>
          </div>

          {/* Candidate picker */}
          {candidates?.length > 0 && (
            <div style={{ border:`1px solid ${T.line}`, borderRadius:6, overflow:"hidden" }}>
              <div style={{ fontFamily:FONT.body, fontSize:10.5, letterSpacing:".14em", textTransform:"uppercase", color:T.muted, padding:"8px 12px", borderBottom:`1px solid ${T.line}`, background:T.bg }}>
                Select the right title
              </div>
              {candidates.map((c, i) => (
                <button key={i} type="button" onClick={() => pickCandidate(c)}
                  style={{ display:"flex", gap:12, alignItems:"center", width:"100%", padding:"10px 12px", background:"none", border:"none", borderBottom: i<candidates.length-1 ? `1px solid ${T.line2}` : "none", cursor:"pointer", textAlign:"left", transition:"background .12s" }}
                  onMouseEnter={e => e.currentTarget.style.background=T.surface2}
                  onMouseLeave={e => e.currentTarget.style.background="none"}>
                  {c.cover
                    ? <img src={c.cover} alt="" style={{ width:38, height:57, objectFit:"cover", borderRadius:3, flexShrink:0 }} onError={e => e.target.style.display="none"} />
                    : <div style={{ width:38, height:57, background:T.surface3, borderRadius:3, flexShrink:0 }} />
                  }
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:FONT.body, fontSize:13.5, fontWeight:500, color:T.ink, marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</div>
                    <div style={{ fontFamily:FONT.body, fontSize:12, color:T.inkFaint }}>
                      {c.year}{c.author ? ` · ${c.author}` : ""}
                      {c.description ? ` — ${c.description.slice(0,80)}…` : ""}
                    </div>
                  </div>
                </button>
              ))}
              <button type="button" onClick={() => setCandidates(null)}
                style={{ display:"block", width:"100%", padding:"8px 12px", background:"none", border:"none", borderTop:`1px solid ${T.line2}`, fontFamily:FONT.body, fontSize:12, color:T.muted, cursor:"pointer", textAlign:"center" }}>
                None of these — enter manually
              </button>
            </div>
          )}

          {/* Fetch error */}
          {fetchError === "no-results" && (
            <div style={{ fontFamily:FONT.body, fontSize:13, background:`${T.accent}12`, border:`1px solid ${T.accent}33`, borderRadius:4, padding:"10px 14px", color:T.inkSoft }}>
              No match found. Fill in the details below manually.
            </div>
          )}
          {fetchError && fetchError !== "no-results" && (
            <div style={{ fontFamily:FONT.body, fontSize:13, color:T.coral, background:`${T.coral}11`, border:`1px solid ${T.coral}33`, borderRadius:4, padding:"10px 14px" }}>{fetchError}</div>
          )}

          {/* Preview confirmation */}
          {preview && (
            <div style={{ background:T.surface2, border:`1px solid ${T.line}`, borderRadius:4, padding:"10px 14px", display:"flex", gap:12, alignItems:"flex-start" }}>
              {preview.cover && <img src={preview.cover} alt="" style={{ width:48, height:72, objectFit:"cover", borderRadius:3, flexShrink:0 }} onError={e=>e.target.style.display="none"} />}
              <div>
                <div style={{ fontFamily:FONT.body, fontSize:11, color:T.accent, marginBottom:3 }}>✓ Info filled in</div>
                <div style={{ fontFamily:FONT.body, fontSize:13.5, fontWeight:500, color:T.ink }}>{preview.title}</div>
                {preview.year && <div style={{ fontFamily:FONT.body, fontSize:12, color:T.inkFaint, marginTop:2 }}>{preview.year}{preview.seasons ? ` · ${preview.seasons} season${preview.seasons!==1?"s":""}` : ""}{preview.whereToWatch?.length ? ` · ${preview.whereToWatch[0]}` : ""}</div>}
              </div>
            </div>
          )}

          {/* Poster + meta */}
          <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
            <div style={{ flexShrink:0 }}>
              <label style={lbl}>Poster</label>
              {cover
                ? <img src={cover} alt="" style={{ width:72, height:108, objectFit:"cover", borderRadius:4, boxShadow:"0 4px 16px rgba(0,0,0,.5)", display:"block" }} onError={e=>e.target.style.display="none"} />
                : <div style={{ width:72, height:108, background:T.surface3, border:`1px dashed ${T.line}`, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontFamily:FONT.body, fontSize:9, color:T.inkFaint, textAlign:"center" }}>No poster</span>
                  </div>
              }
            </div>
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                <div>
                  <label style={lbl}>Year</label>
                  <input value={year} onChange={e=>setYear(e.target.value)} placeholder="2024" style={inp} />
                </div>
                <div>
                  <label style={lbl}>{type==="film" ? "Runtime (min)" : type==="podcast" ? "Episodes" : "Episodes"}</label>
                  <input type="number" min="1" value={type==="film" ? runtime : episodes} onChange={e => type==="film" ? setRuntime(e.target.value) : setEpisodes(e.target.value)} placeholder={type==="film" ? "120" : "6"} style={inp} />
                </div>
              </div>
              {(type==="tv" || type==="documentary") && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <div>
                    <label style={lbl}>Seasons</label>
                    <input type="number" min="1" value={seasons} onChange={e=>setSeasons(e.target.value)} placeholder="1" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Min / episode</label>
                    <input type="number" min="1" value={runtime} onChange={e=>setRuntime(e.target.value)} placeholder="45" style={inp} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Where to watch */}
          <div>
            <label style={lbl}>Where to watch</label>
            <input value={where} onChange={e=>setWhere(e.target.value)} placeholder="e.g. Prime Video, Netflix" style={inp} />
          </div>

          {/* Host / director */}
          <div>
            <label style={lbl}>{type==="podcast" ? "Host / publisher" : "Director / creator"} <span style={{ textTransform:"none", letterSpacing:0, opacity:.5 }}>(optional)</span></label>
            <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder={type==="podcast" ? "e.g. iHeartPodcasts" : "e.g. BBC Studios"} style={inp} />
          </div>

          {/* Description */}
          <div>
            <label style={lbl}>Description <span style={{ textTransform:"none", letterSpacing:0, opacity:.5 }}>(optional)</span></label>
            <textarea value={description} onChange={e=>setDesc(e.target.value)} rows={3} style={{ ...inp, resize:"vertical", lineHeight:1.55 }} placeholder="What is it about?" />
          </div>

          {/* Drawer */}
          <div>
            <label style={lbl}>Add to</label>
            <div style={{ display:"flex", gap:6 }}>
              {drawers.map(d => (
                <button key={d.id} type="button" onClick={() => setDrawerId(d.id)}
                  style={{ flex:1, fontFamily:FONT.body, fontSize:12, letterSpacing:".03em", padding:"7px 10px", borderRadius:4, border:`1px solid ${drawerId===d.id ? T.accent : T.line}`, background:drawerId===d.id ? `${T.accent}18` : "transparent", color:drawerId===d.id ? T.accent : T.inkFaint, cursor:"pointer", transition:"all .15s" }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {error && <div style={{ fontFamily:FONT.body, fontSize:13, color:T.coral }}>{error}</div>}

          <div style={{ display:"flex", gap:8, marginTop:4 }}>
            <button type="button" onClick={onClose} style={{ flex:1, fontFamily:FONT.body, fontSize:13, background:"transparent", border:`1px solid ${T.line}`, color:T.muted, padding:"11px", borderRadius:4, cursor:"pointer" }}>Cancel</button>
            <button type="submit" style={{ flex:2, fontFamily:FONT.body, fontSize:13, letterSpacing:".06em", textTransform:"uppercase", background:T.accent, border:"none", color:T.bg, padding:"11px", borderRadius:4, cursor:"pointer", fontWeight:600 }}>Add to The Reel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
