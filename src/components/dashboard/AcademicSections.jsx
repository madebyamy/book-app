import React from 'react';

function NodeCard({ node, accent, theme, isOpen, onToggle }) {
  return (
    <div onClick={onToggle} style={{ background: theme.card, border: `1px solid ${isOpen ? accent : theme.border}`, borderRadius: 4, padding: "1.6rem", cursor: "pointer", transition: "border-color .25s ease, transform .25s ease", transform: isOpen ? "translateY(-2px)" : "none" }}>
      <div style={{ fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: "0.7rem" }}>{node.tag}</div>
      <h3 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.3rem", margin: "0 0 0.6rem", color: theme.ink, lineHeight: 1.15 }}>{node.title}</h3>
      <p style={{ fontSize: "0.88rem", lineHeight: 1.55, color: theme.inkSoft, margin: 0 }}>{node.dek}</p>
      {isOpen && (
        <div style={{ marginTop: "1.1rem", paddingTop: "1.1rem", borderTop: `1px solid ${theme.border}` }}>
          {node.points.map((p, i) => (
            <p key={i} style={{ fontSize: "0.85rem", lineHeight: 1.6, color: theme.inkSoft, margin: i === node.points.length - 1 ? 0 : "0 0 0.8rem", paddingLeft: "0.9rem", borderLeft: `2px solid ${theme.border}` }}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function CaseFile({ data, accent, theme }) {
  return (
    <div style={{ marginTop: "3.5rem", background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "1.1rem 1.6rem", borderBottom: `1px solid ${theme.border}`, fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: theme.inkFaint, flexWrap: "wrap" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent, flexShrink: 0 }} />
        <span>{data.tag}</span>
        <span style={{ marginLeft: "auto", opacity: 0.7 }}>{data.meta}</span>
      </div>
      <div style={{ padding: "1.8rem", display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: "1.8rem" }} className="casefile-grid">
        <div>
          <h4 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.45rem", margin: "0 0 0.7rem", color: theme.ink, lineHeight: 1.15 }}>{data.title}</h4>
          {data.story.map((p, i) => (<p key={i} style={{ fontSize: "0.9rem", lineHeight: 1.65, color: theme.inkSoft, margin: i === data.story.length - 1 ? 0 : "0 0 0.8rem" }}>{p}</p>))}
        </div>
        <div style={{ borderLeft: `1px solid ${theme.border}`, paddingLeft: "1.6rem" }}>
          <span style={{ fontFamily: theme.mono, fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: "0.6rem", display: "block" }}>Why it matters to the argument</span>
          <p style={{ fontSize: "0.86rem", lineHeight: 1.6, color: theme.inkSoft, margin: 0 }}>{data.argument}</p>
        </div>
      </div>
    </div>
  );
}

export function AcademicSections({ book, theme, openNode, setOpenNode }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.1rem" }}>
        {book.nodes.map((node, i) => (<NodeCard key={i} node={node} accent={book.accent} theme={theme} isOpen={openNode === i} onToggle={() => setOpenNode(openNode === i ? null : i)} />))}
      </div>
      <CaseFile data={book.caseFile} accent={book.accent} theme={theme} />
      <div style={{ marginTop: "3rem", padding: "1.6rem 1.8rem", background: `${book.accent}14`, border: `1px dashed ${theme.border}`, borderRadius: 4 }}>
        <span style={{ fontFamily: theme.mono, fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: book.accent, display: "block", marginBottom: "0.6rem" }}>Thread</span>
        <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.6, color: theme.inkSoft }}>{book.thread}</p>
      </div>
      <h2 style={{ fontFamily: theme.display, fontWeight: theme.displayWeight, fontSize: "1.7rem", margin: "3.2rem 0 1.2rem", color: theme.ink }}>Lines worth keeping</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.9rem", marginBottom: "1rem" }}>
        {book.keyLines.map((line, i) => (
          <div key={i} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderLeft: `3px solid ${book.accent}`, borderRadius: 3, padding: "1.2rem 1.3rem" }}>
            <p style={{ fontFamily: theme.display, fontStyle: "italic", fontWeight: 500, fontSize: "0.98rem", lineHeight: 1.5, margin: 0, color: theme.ink }}>"{line}"</p>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: theme.mono, fontSize: "0.72rem", color: theme.inkFaint, margin: "0 0 1rem" }}>Paraphrased, not verbatim — out of respect for the author's original wording.</p>
    </>
  );
}
