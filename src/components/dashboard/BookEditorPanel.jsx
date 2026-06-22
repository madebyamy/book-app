import React, { useState, useEffect, useRef } from 'react';
import { loadBooks, saveBooks } from '../../lib/books.js';

export function BookEditorPanel({ userId, book, theme, onSaved }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filling, setFilling] = useState(false);
  const [fillError, setFillError] = useState("");
  const [fillDone, setFillDone] = useState(false);

  const [title, setTitle]     = useState(book.title || "");
  const [subtitle, setSubtitle] = useState(book.subtitle || "");
  const [author, setAuthor]   = useState(book.author || "");
  const [year, setYear]       = useState(book.year || "");
  const [pages, setPages]     = useState(book.pages ? String(book.pages) : "");
  const [cover, setCover]     = useState(book.cover || "");
  const [tagline, setTagline] = useState(book.tagline || "");
  const [thread, setThread]   = useState(book.thread || "");
  const [keyLines, setKeyLines] = useState(book.keyLines && book.keyLines.length ? book.keyLines : [""]);
  const [nodes, setNodes]     = useState(
    book.nodes && book.nodes.length
      ? book.nodes.map((n) => ({ tag: n.tag || "", title: n.title || "", dek: n.dek || "", points: n.points && n.points.length ? n.points : [""] }))
      : [{ tag: "", title: "", dek: "", points: [""] }]
  );
  const [cfTag, setCfTag]         = useState(book.caseFile?.tag || "");
  const [cfMeta, setCfMeta]       = useState(book.caseFile?.meta || "");
  const [cfTitle, setCfTitle]     = useState(book.caseFile?.title || "");
  const [cfStory, setCfStory]     = useState(book.caseFile?.story && book.caseFile.story.length ? book.caseFile.story : [""]);
  const [cfArgument, setCfArgument] = useState(book.caseFile?.argument || "");

  const autoFilledRef = useRef(false);
  const isNewBook = !book.tagline && !book.thread && !(book.nodes?.length);
  const isUserBook = book.theme === null;

  useEffect(() => {
    if (isUserBook && isNewBook && !autoFilledRef.current) {
      autoFilledRef.current = true;
      setOpen(true);
      handleAutoFill();
    }
  }, []);

  const iStyle = { background: `${theme.bg}`, border: `1px solid ${theme.border}`, color: theme.ink, fontFamily: theme.body, fontSize: "0.85rem", padding: "0.5rem 0.75rem", borderRadius: 3, width: "100%", boxSizing: "border-box" };
  const taStyle = { ...iStyle, resize: "vertical", minHeight: 68 };
  const labelStyle = { fontFamily: theme.mono, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: book.accent, display: "block", marginBottom: "0.3rem", marginTop: "0.8rem" };

  const handleAutoFill = async () => {
    setFilling(true);
    setFillError("");
    try {
      const res = await fetch("/api/analyze-book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: book.title, author: book.author }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ? `${err.error}: ${err.detail}` : err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.tagline)  setTagline(data.tagline);
      if (data.thread)   setThread(data.thread);
      if (data.keyLines?.length)  setKeyLines(data.keyLines);
      if (data.nodes?.length) {
        setNodes(data.nodes.map((n) => ({
          tag: n.tag || "",
          title: n.title || "",
          dek: n.dek || "",
          points: n.points?.length ? n.points : [""],
        })));
      }
      if (data.caseFile?.title) {
        setCfTag(data.caseFile.tag || "");
        setCfMeta(data.caseFile.meta || "");
        setCfTitle(data.caseFile.title || "");
        setCfStory(data.caseFile.story?.length ? data.caseFile.story : [""]);
        setCfArgument(data.caseFile.argument || "");
      }
    } catch (err) {
      setFillError(String(err.message || err));
    }
    setFilling(false);
    setFillDone(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const cleanNodes = nodes.filter((n) => n.title.trim()).map((n) => ({
      tag: n.tag.trim(), title: n.title.trim(), dek: n.dek.trim(),
      points: n.points.filter((p) => p.trim()),
    }));
    const cleanKeyLines = keyLines.filter((l) => l.trim());
    const hasCaseFile = cfTitle.trim();
    const updatedBook = {
      ...book,
      title: title.trim() || book.title,
      subtitle: subtitle.trim(),
      author: author.trim() || book.author,
      year: year.trim(),
      pages: pages ? parseInt(pages, 10) : null,
      cover: cover.trim(),
      tagline: tagline.trim(),
      thread: thread.trim(),
      keyLines: cleanKeyLines,
      nodes: cleanNodes,
      caseFile: hasCaseFile ? { tag: cfTag.trim(), meta: cfMeta.trim(), title: cfTitle.trim(), story: cfStory.filter((s) => s.trim()), argument: cfArgument.trim() } : null,
    };
    const allBooks = await loadBooks(userId);
    const exists = allBooks.some((b) => b.id === book.id);
    const updated = exists
      ? allBooks.map((b) => b.id === book.id ? updatedBook : b)
      : [...allBooks, { ...updatedBook, inMarginalia: true, shared: false, drawerId: book.drawerId || "want" }];
    await saveBooks(userId, updated);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onSaved(updatedBook);
  };

  const accent = book.accent;

  return (
    <div style={{ marginTop: "2.5rem", border: `1px solid ${theme.border}`, borderLeft: `3px solid ${accent}`, borderRadius: 6, overflow: "hidden" }}>
      <button onClick={() => setOpen((v) => !v)} style={{ width: "100%", background: `${accent}18`, border: "none", padding: "0.9rem 1.2rem", display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontFamily: theme.mono, fontSize: "0.66rem", letterSpacing: "0.12em", textTransform: "uppercase", color: accent, fontWeight: 700 }}>✏ Edit Book Details</span>
        <span style={{ marginLeft: "auto", fontFamily: theme.mono, fontSize: "0.65rem", color: `${theme.ink}55` }}>{open ? "▲ Close" : "▼ Open"}</span>
      </button>
      {open && (
        <div style={{ padding: "1.2rem 1.4rem", background: theme.card, display: "flex", flexDirection: "column", gap: "0.2rem" }}>

          {/* Auto-fill from AI */}
          <div style={{ marginBottom: "1rem", padding: "0.9rem 1rem", background: `${accent}10`, border: `1px solid ${accent}30`, borderRadius: 5 }}>
            <div style={{ fontFamily: theme.mono, fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: "0.4rem" }}>✨ Auto-fill from online</div>
            <p style={{ fontFamily: theme.mono, fontSize: "0.68rem", color: theme.inkFaint, margin: "0 0 0.7rem", lineHeight: 1.5 }}>
              Fetches a description from Google Books, then uses AI to generate the tagline, argument, key ideas, key lines, and highlighted story. Review before saving.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", flexWrap: "wrap" }}>
              <button
                onClick={handleAutoFill}
                disabled={filling}
                style={{ background: accent, border: "none", color: theme.headerInk || "#fff", fontFamily: theme.mono, fontSize: "0.72rem", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, padding: "0.6rem 1.2rem", borderRadius: 3, cursor: filling ? "default" : "pointer", opacity: filling ? 0.7 : 1, transition: "opacity .2s" }}>
                {filling ? "Fetching & analysing…" : "✨ Auto-fill fields"}
              </button>
              {fillDone && !fillError && (
                <span style={{ fontFamily: theme.mono, fontSize: "0.68rem", color: accent }}>✓ Fields filled — review below and click Save</span>
              )}
              {fillError && (
                <span style={{ fontFamily: theme.mono, fontSize: "0.68rem", color: "#c0392b" }}>⚠ {fillError}</span>
              )}
            </div>
          </div>

          <span style={labelStyle}>Basic Info</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <div><label style={labelStyle}>Title</label><input value={title} onChange={(e) => setTitle(e.target.value)} style={iStyle} /></div>
            <div><label style={labelStyle}>Subtitle</label><input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} style={iStyle} placeholder="Optional" /></div>
            <div><label style={labelStyle}>Author</label><input value={author} onChange={(e) => setAuthor(e.target.value)} style={iStyle} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
              <div><label style={labelStyle}>Year</label><input value={year} onChange={(e) => setYear(e.target.value)} style={iStyle} /></div>
              <div><label style={labelStyle}>Pages</label><input type="number" value={pages} onChange={(e) => setPages(e.target.value)} style={iStyle} /></div>
            </div>
          </div>
          <label style={labelStyle}>Cover image URL</label>
          <input value={cover} onChange={(e) => setCover(e.target.value)} style={iStyle} placeholder="https://…" />
          {cover && <img src={cover} alt="cover preview" style={{ width: 48, height: 68, objectFit: "cover", borderRadius: 3, marginTop: "0.4rem" }} onError={(e) => e.target.style.display = "none"} />}

          <label style={{ ...labelStyle, marginTop: "1.4rem" }}>Tagline</label>
          <textarea value={tagline} onChange={(e) => setTagline(e.target.value)} style={taStyle} placeholder="One-sentence hook shown under the title" />

          <label style={{ ...labelStyle, marginTop: "1.4rem" }}>Overall Thread / Argument</label>
          <textarea value={thread} onChange={(e) => setThread(e.target.value)} style={{ ...taStyle, minHeight: 80 }} placeholder="The book's central argument in 2–3 sentences" />

          {/* Key Lines */}
          <span style={{ ...labelStyle, marginTop: "1.4rem" }}>Lines Worth Keeping</span>
          <p style={{ fontFamily: theme.mono, fontSize: "0.62rem", color: `${theme.ink}55`, margin: "0 0 0.5rem" }}>Paraphrased memorable lines — shown as quote cards</p>
          {keyLines.map((line, i) => (
            <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.35rem", alignItems: "flex-start" }}>
              <textarea value={line} onChange={(e) => { const n = [...keyLines]; n[i] = e.target.value; setKeyLines(n); }} style={{ ...taStyle, minHeight: 48, flex: 1 }} placeholder={`Key line ${i + 1}`} />
              <button onClick={() => setKeyLines(keyLines.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: `${theme.ink}44`, fontSize: "1rem", cursor: "pointer", padding: "0.3rem", lineHeight: 1 }}>✕</button>
            </div>
          ))}
          <button onClick={() => setKeyLines([...keyLines, ""])} style={{ background: "none", border: `1px dashed ${theme.border}`, color: `${theme.ink}55`, fontFamily: theme.mono, fontSize: "0.65rem", padding: "0.4rem 0.8rem", borderRadius: 3, cursor: "pointer", width: "fit-content" }}>+ Add line</button>

          {/* Key Ideas / Nodes */}
          <span style={{ ...labelStyle, marginTop: "1.6rem" }}>Key Ideas</span>
          <p style={{ fontFamily: theme.mono, fontSize: "0.62rem", color: `${theme.ink}55`, margin: "0 0 0.5rem" }}>Each idea becomes an expandable card (like "Rule One" or "New Idea")</p>
          {nodes.map((node, ni) => (
            <div key={ni} style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: "0.9rem", marginBottom: "0.8rem", background: theme.bg }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: theme.mono, fontSize: "0.62rem", color: accent }}>Idea {ni + 1}</span>
                <button onClick={() => setNodes(nodes.filter((_, j) => j !== ni))} style={{ background: "none", border: "none", color: `${theme.ink}44`, fontSize: "0.9rem", cursor: "pointer" }}>✕ Remove</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.4rem", marginBottom: "0.4rem" }}>
                <div><label style={labelStyle}>Tag (e.g. "Rule One")</label><input value={node.tag} onChange={(e) => { const n = [...nodes]; n[ni] = { ...n[ni], tag: e.target.value }; setNodes(n); }} style={iStyle} /></div>
                <div><label style={labelStyle}>Title</label><input value={node.title} onChange={(e) => { const n = [...nodes]; n[ni] = { ...n[ni], title: e.target.value }; setNodes(n); }} style={iStyle} /></div>
              </div>
              <label style={labelStyle}>Summary (dek)</label>
              <textarea value={node.dek} onChange={(e) => { const n = [...nodes]; n[ni] = { ...n[ni], dek: e.target.value }; setNodes(n); }} style={{ ...taStyle, minHeight: 54 }} placeholder="One sentence summarizing this idea" />
              <label style={{ ...labelStyle, marginTop: "0.7rem" }}>Bullet Points</label>
              {node.points.map((pt, pi) => (
                <div key={pi} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem", alignItems: "flex-start" }}>
                  <textarea value={pt} onChange={(e) => { const n = [...nodes]; n[ni].points[pi] = e.target.value; setNodes(n); }} style={{ ...taStyle, minHeight: 44, flex: 1 }} placeholder={`Point ${pi + 1}`} />
                  <button onClick={() => { const n = [...nodes]; n[ni].points = n[ni].points.filter((_, j) => j !== pi); setNodes(n); }} style={{ background: "none", border: "none", color: `${theme.ink}44`, fontSize: "0.9rem", cursor: "pointer", padding: "0.3rem" }}>✕</button>
                </div>
              ))}
              <button onClick={() => { const n = [...nodes]; n[ni].points = [...n[ni].points, ""]; setNodes(n); }} style={{ background: "none", border: `1px dashed ${theme.border}`, color: `${theme.ink}55`, fontFamily: theme.mono, fontSize: "0.62rem", padding: "0.3rem 0.6rem", borderRadius: 3, cursor: "pointer" }}>+ Add point</button>
            </div>
          ))}
          <button onClick={() => setNodes([...nodes, { tag: "", title: "", dek: "", points: [""] }])} style={{ background: "none", border: `1px dashed ${theme.border}`, color: `${theme.ink}55`, fontFamily: theme.mono, fontSize: "0.65rem", padding: "0.4rem 0.8rem", borderRadius: 3, cursor: "pointer", width: "fit-content" }}>+ Add key idea</button>

          {/* Case File / Highlighted Story */}
          <span style={{ ...labelStyle, marginTop: "1.6rem" }}>Highlighted Story</span>
          <p style={{ fontFamily: theme.mono, fontSize: "0.62rem", color: `${theme.ink}55`, margin: "0 0 0.5rem" }}>One featured story or example (shown as a highlighted case file)</p>
          <div style={{ border: `1px solid ${theme.border}`, borderRadius: 4, padding: "0.9rem", background: theme.bg }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "0.4rem" }}>
              <div><label style={labelStyle}>Tag (e.g. "Highlighted story · The Law of the Few")</label><input value={cfTag} onChange={(e) => setCfTag(e.target.value)} style={iStyle} /></div>
              <div><label style={labelStyle}>Meta (date, context)</label><input value={cfMeta} onChange={(e) => setCfMeta(e.target.value)} style={iStyle} placeholder="e.g. April 18, 1775" /></div>
            </div>
            <label style={labelStyle}>Story Title</label>
            <input value={cfTitle} onChange={(e) => setCfTitle(e.target.value)} style={iStyle} />
            <label style={{ ...labelStyle, marginTop: "0.6rem" }}>Story Paragraphs</label>
            {cfStory.map((s, si) => (
              <div key={si} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.3rem", alignItems: "flex-start" }}>
                <textarea value={s} onChange={(e) => { const a = [...cfStory]; a[si] = e.target.value; setCfStory(a); }} style={{ ...taStyle, minHeight: 60, flex: 1 }} placeholder={`Paragraph ${si + 1}`} />
                <button onClick={() => setCfStory(cfStory.filter((_, j) => j !== si))} style={{ background: "none", border: "none", color: `${theme.ink}44`, fontSize: "0.9rem", cursor: "pointer", padding: "0.3rem" }}>✕</button>
              </div>
            ))}
            <button onClick={() => setCfStory([...cfStory, ""])} style={{ background: "none", border: `1px dashed ${theme.border}`, color: `${theme.ink}55`, fontFamily: theme.mono, fontSize: "0.62rem", padding: "0.3rem 0.6rem", borderRadius: 3, cursor: "pointer" }}>+ Add paragraph</button>
            <label style={{ ...labelStyle, marginTop: "0.7rem" }}>Argument / Takeaway</label>
            <textarea value={cfArgument} onChange={(e) => setCfArgument(e.target.value)} style={{ ...taStyle, minHeight: 60 }} placeholder="Why this story matters — the point it proves" />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1.4rem" }}>
            <button onClick={handleSave} disabled={saving} style={{ background: accent, border: "none", color: theme.headerInk || "#fff", fontFamily: theme.mono, fontSize: "0.74rem", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700, padding: "0.65rem 1.6rem", borderRadius: 3, cursor: saving ? "default" : "pointer" }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {saved && <span style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: accent }}>✓ Saved</span>}
          </div>
        </div>
      )}
    </div>
  );
}
