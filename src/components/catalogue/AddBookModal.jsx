import React, { useState } from 'react';
import { BRAND, FONT } from '../../constants.js';

export function AddBookModal({ drawers, onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [summary, setSummary] = useState("");
  const [cover, setCover] = useState(null);
  const [year, setYear] = useState("");
  const [drawerId, setDrawerId] = useState(drawers[0]?.id || "want");
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchedPreview, setFetchedPreview] = useState(null);
  const [fetchError, setFetchError] = useState("");
  const [workId, setWorkId] = useState(null);
  const [addToMarginalia, setAddToMarginalia] = useState(true);

  const fetchBookInfo = async () => {
    if (!title.trim()) return;
    setFetching(true);
    setFetchError("");
    setFetchedPreview(null);
    try {
      const t = encodeURIComponent(title.trim());
      const a = encodeURIComponent(author.trim());

      const [olRes, gbRes] = await Promise.allSettled([
        fetch(`https://openlibrary.org/search.json?title=${t}&author=${a}&limit=5&fields=key,title,author_name,number_of_pages_median,cover_i,first_publish_year`),
        fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(`${title.trim()} ${author.trim()}`)}&maxResults=5`),
      ]);

      let olDoc = null;
      if (olRes.status === "fulfilled" && olRes.value.ok) {
        const d = await olRes.value.json();
        olDoc = d.docs?.[0] || null;
      }

      let gbItem = null;
      if (gbRes.status === "fulfilled" && gbRes.value.ok) {
        const d = await gbRes.value.json();
        const items = d.items || [];
        const withDesc = items.filter((i) => i.volumeInfo?.description);
        gbItem = (withDesc[0] || items[0])?.volumeInfo || null;
      }

      if (!olDoc && !gbItem) {
        setFetchError("no-results");
        setFetching(false);
        return;
      }

      let foundCover = null;
      if (gbItem) {
        const thumb = gbItem.imageLinks?.thumbnail || gbItem.imageLinks?.smallThumbnail;
        if (thumb) foundCover = thumb.replace("http://", "https://");
      }
      if (!foundCover && olDoc?.cover_i) foundCover = `https://covers.openlibrary.org/b/id/${olDoc.cover_i}-M.jpg`;

      const foundPages = gbItem?.pageCount || olDoc?.number_of_pages_median || null;
      const foundYear = gbItem?.publishedDate?.slice(0, 4) || (olDoc?.first_publish_year ? String(olDoc.first_publish_year) : null);
      const foundAuthor = gbItem?.authors?.[0] || olDoc?.author_name?.[0] || null;
      const foundTitle = gbItem?.title || olDoc?.title || title.trim();

      let desc = "";
      if (gbItem?.description) {
        desc = gbItem.description.replace(/<[^>]+>/g, "").trim().slice(0, 600);
      }
      if (!desc && olDoc?.key) {
        try {
          const workRes = await fetch(`https://openlibrary.org${olDoc.key}.json`);
          const work = await workRes.json();
          const raw = typeof work.description === "string" ? work.description : work.description?.value || "";
          desc = raw.replace(/\[.*?\]/g, "").trim().slice(0, 600);
        } catch {}
      }

      const foundWorkId = olDoc?.key || null;
      if (desc) setSummary(desc);
      if (foundPages) setPages(String(foundPages));
      if (foundAuthor) setAuthor(foundAuthor);
      if (foundTitle) setTitle(foundTitle);
      if (foundYear) setYear(foundYear);
      if (foundCover) setCover(foundCover);
      if (foundWorkId) setWorkId(foundWorkId);
      setFetchedPreview({ title: foundTitle, author: foundAuthor, cover: foundCover, desc, pages: foundPages });
    } catch (err) {
      setFetchError("Lookup failed. Check your connection and try again.");
    }
    setFetching(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    if (!author.trim()) { setError("Author is required."); return; }
    let finalSummary = summary.trim() || null;
    let finalPages = pages ? parseInt(pages, 10) : null;
    let finalCover = cover;
    let finalYear = year;
    if (!finalSummary || !finalPages || !finalCover) {
      setFetching(true);
      try {
        const searchUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title.trim())}&author=${encodeURIComponent(author.trim())}&limit=3&fields=key,author_name,number_of_pages_median,cover_i,first_publish_year`;
        const res = await fetch(searchUrl);
        const data = await res.json();
        const doc = data.docs?.[0];
        if (doc) {
          if (!finalCover && doc.cover_i) finalCover = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
          if (!finalPages && doc.number_of_pages_median) finalPages = doc.number_of_pages_median;
          if (!finalYear && doc.first_publish_year) finalYear = String(doc.first_publish_year);
          if (!finalSummary && doc.key) {
            try {
              const workRes = await fetch(`https://openlibrary.org${doc.key}.json`);
              const work = await workRes.json();
              const raw = typeof work.description === "string" ? work.description : work.description?.value || "";
              if (raw) finalSummary = raw.replace(/\[.*?\]/g, "").trim().slice(0, 600);
            } catch {}
          }
        }
      } catch {}
      setFetching(false);
    }
    onAdd({ title: title.trim(), author: author.trim(), pages: finalPages, summary: finalSummary, cover: finalCover, year: finalYear, drawerId, workId: workId || null, inMarginalia: addToMarginalia });
  };

  const inputStyle = { width: "100%", fontFamily: FONT.body, fontSize: 14, color: BRAND.ink, background: BRAND.cream, border: `1px solid ${BRAND.line2}`, borderRadius: 3, padding: "10px 12px", outline: "none", boxSizing: "border-box" };
  const labelStyle = { fontFamily: FONT.body, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: BRAND.muted, display: "block", marginBottom: 6 };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(38,32,32,.68)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: BRAND.paper, border: `1px solid ${BRAND.line}`, borderRadius: 6, width: "min(500px,100%)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(20,30,50,.22)", animation: "cc-pop .24s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ background: BRAND.espresso, padding: "22px 26px 18px", borderRadius: "6px 6px 0 0" }}>
          <div style={{ fontFamily: FONT.body, fontSize: 10.5, letterSpacing: ".24em", textTransform: "uppercase", color: BRAND.tan, marginBottom: 6 }}>Card Catalogue</div>
          <h2 style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 26, color: BRAND.cream, margin: 0, lineHeight: 1.1 }}>Add a new book</h2>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: "24px 26px 26px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Book title *</label>
            <input value={title} onChange={(e) => { setTitle(e.target.value); setFetchedPreview(null); }} placeholder="e.g. The Midnight Library" style={inputStyle} autoFocus />
          </div>
          <div>
            <label style={labelStyle}>Author *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={author} onChange={(e) => { setAuthor(e.target.value); setFetchedPreview(null); }} placeholder="e.g. Matt Haig" style={{ ...inputStyle, flex: 1 }} />
              <button type="button" onClick={fetchBookInfo} disabled={!title.trim() || !author.trim() || fetching}
                style={{ flexShrink: 0, fontFamily: FONT.body, fontSize: 12, letterSpacing: ".04em", background: BRAND.espresso, border: "none", color: BRAND.cream, padding: "10px 14px", borderRadius: 3, cursor: title.trim() && author.trim() && !fetching ? "pointer" : "not-allowed", opacity: title.trim() && author.trim() && !fetching ? 1 : 0.5, whiteSpace: "nowrap" }}>
                {fetching ? "Looking up…" : "🔍 Look up"}
              </button>
            </div>
          </div>
          {fetchError === "no-results" ? (
            <div style={{ fontFamily: FONT.body, fontSize: 13, background: "rgba(191,117,90,.08)", border: "1px solid rgba(191,117,90,.3)", borderRadius: 4, padding: "12px 14px" }}>
              <div style={{ color: BRAND.ink, fontWeight: 500, marginBottom: 4 }}>No match found in our book databases.</div>
              <div style={{ color: BRAND.muted, lineHeight: 1.5 }}>Fill in the details below and click <strong>Add book to catalogue</strong> — you can always auto-fill more info later from the book's detail page.</div>
            </div>
          ) : fetchError ? (
            <div style={{ fontFamily: FONT.body, fontSize: 13, color: BRAND.coral, background: "rgba(242,92,92,.08)", border: "1px solid rgba(242,92,92,.25)", borderRadius: 4, padding: "10px 14px" }}>{fetchError}</div>
          ) : null}
          {fetchedPreview && (
            <div style={{ background: BRAND.cream, border: `1px solid ${BRAND.line}`, borderRadius: 4, padding: "10px 14px" }}>
              <div style={{ fontFamily: FONT.body, fontSize: 11, color: BRAND.terracotta }}>✓ Info filled in from Google Books / Open Library</div>
              {fetchedPreview.desc && (
                <p style={{ fontFamily: FONT.read, fontSize: 13, lineHeight: 1.55, color: BRAND.ink, margin: "6px 0 0", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{fetchedPreview.desc}</p>
              )}
            </div>
          )}

          {/* Cover + pages/year side by side — cover preview on left, fields on right */}
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0 }}>
              <label style={labelStyle}>Cover</label>
              {cover ? (
                <img src={cover} alt="" style={{ width: 72, height: 104, objectFit: "cover", borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,.18)", display: "block" }} onError={(e) => e.target.style.display = "none"} />
              ) : (
                <div style={{ width: 72, height: 104, background: BRAND.cream, border: `1px dashed ${BRAND.line2}`, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: FONT.body, fontSize: 10, color: BRAND.muted, textAlign: "center", lineHeight: 1.4 }}>No cover yet</span>
                </div>
              )}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={labelStyle}>Pages</label>
                <input type="number" min="1" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 304" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Year published</label>
                <input type="number" min="1000" max="2099" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2021" style={inputStyle} />
              </div>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Cover image URL <span style={{ textTransform: "none", letterSpacing: 0, opacity: .6 }}>(optional — auto-filled by lookup)</span></label>
            <input value={cover || ""} onChange={(e) => setCover(e.target.value || null)} placeholder="https://…" style={inputStyle} />
          </div>
          <div>
              <label style={labelStyle}>File in drawer</label>
              <select value={drawerId} onChange={(e) => setDrawerId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {drawers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
          </div>
          <div>
            <label style={labelStyle}>Short summary <span style={{ textTransform: "none", letterSpacing: 0, opacity: .6 }}>(optional)</span></label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A brief description of the book — appears on the index card." rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.55 }} />
          </div>
          {error && <div style={{ fontFamily: FONT.body, fontSize: 13, color: BRAND.coral }}>{error}</div>}
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "12px 14px", background: addToMarginalia ? "rgba(191,117,90,.08)" : BRAND.cream, border: `1px solid ${addToMarginalia ? "rgba(191,117,90,.3)" : BRAND.line2}`, borderRadius: 4, transition: "all .2s" }}>
            <input type="checkbox" checked={addToMarginalia} onChange={(e) => setAddToMarginalia(e.target.checked)} style={{ marginTop: 2, flexShrink: 0, accentColor: BRAND.terracotta }} />
            <div>
              <div style={{ fontFamily: FONT.body, fontWeight: 500, fontSize: 13.5, color: BRAND.ink, marginBottom: 2 }}>📖 Add to Marginalia</div>
              <div style={{ fontFamily: FONT.read, fontSize: 12.5, color: BRAND.muted, lineHeight: 1.5 }}>Opens the full detail view — notes, quotes, reading tracker, and AI-powered book analysis.</div>
            </div>
          </label>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".04em", background: "transparent", border: `1px solid ${BRAND.line2}`, color: BRAND.muted, padding: "12px", borderRadius: 3, cursor: "pointer" }}>Cancel</button>
            <button type="submit" style={{ flex: 2, fontFamily: FONT.body, fontSize: 13, letterSpacing: ".06em", textTransform: "uppercase", background: BRAND.coral, border: "none", color: "#fff", padding: "12px", borderRadius: 3, cursor: "pointer", fontWeight: 500 }}>Add book to catalogue</button>
          </div>
        </form>
      </div>
    </div>
  );
}
