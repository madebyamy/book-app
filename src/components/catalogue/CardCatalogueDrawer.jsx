// CardCatalogueDrawer — oak cabinet + pulled-out drawer you thumb through.
// Data-agnostic: pass the user's books in; this component owns only view state
// (open drawer, sort, search, which card is forward). Drop into src/components/catalogue/.
import React, { useState, useRef, useEffect, useMemo } from "react";
import { BRAND, FONT } from "../../constants.js";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (iso) => { if (!iso) return ""; const [y, m, d] = iso.split("-").map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
const titleKey = (t) => t.replace(/^(the|a|an)\s+/i, "");
const lastName = (a = "") => a.trim().split(" ").slice(-1)[0] || "";
const firstNames = (a = "") => a.trim().split(" ").slice(0, -1).join(" ");
const stars = (r) => (r ? "★".repeat(r) + "☆".repeat(5 - r) : "Unrated");

const GRAIN = "repeating-linear-gradient(91deg,rgba(60,30,10,0) 0 5px,rgba(60,30,10,.10) 5px 6px,rgba(255,220,170,.05) 6px 9px,rgba(60,30,10,.07) 9px 10px,rgba(0,0,0,0) 10px 17px),repeating-linear-gradient(89deg,rgba(0,0,0,0) 0 23px,rgba(50,25,8,.12) 23px 25px,rgba(0,0,0,0) 25px 41px)";
const OAK = "linear-gradient(180deg,#a8743f,#8e5c2f 55%,#7a4c25)";
const BRASS_PLATE = "linear-gradient(180deg,#EAD39B,#C2A35E 48%,#8F7233)";
const CUP = "linear-gradient(180deg,#6f5722 0,#c2a35e 22%,#ead39b 48%,#a8893f 78%,#7d6327 100%)";
const KNOB = "radial-gradient(circle at 35% 30%,#fff1c8,#c2a35e 45%,#6f5722)";
const SCREW = "radial-gradient(circle at 35% 35%,#fff3cf,#8f7233 70%)";
const BLUE_RULE = "rgba(92,128,168,.22)";
const STEP = 30;         // px each card behind steps up
const DEPTH_Z = 14;      // px each card behind recedes

/**
 * @param books        [{ id, title, author, pages, callNumber, description, rating, genre,
 *                        date (ISO, the date that matters for its drawer), dateKind ("Finished"|"Started"|"Added"|…) }]
 * @param drawers      [{ id, name }]   — e.g. DEFAULT_DRAWERS from constants.js (+ user-added)
 * @param drawerOf     (book) => drawerId   — read from CC_ASSIGN_STORE / status
 * @param onOpenBook   (bookId, orderedIds) => void — open the existing BookModal (orderedIds powers prev/next)
 * @param onAddDrawer  () => void — optional; shows a "+ New drawer" slot
 */
export function CardCatalogueDrawer({ books = [], drawers = [], drawerOf, onOpenBook, onAddDrawer, defaultDrawer, stackDepth = 8, showGuides = true,
  openDrawer, onDrawerChange, extraFaces = [], onRenameDrawer, onRemoveDrawer, editDrawerId, onEditDone }) {
  const [drawerLocal, setDrawerLocal] = useState(defaultDrawer ?? drawers[0]?.id ?? null);
  const controlled = openDrawer !== undefined;
  const drawer = controlled ? openDrawer : drawerLocal;
  const setDrawer = (id) => { if (controlled) onDrawerChange && onDrawerChange(id); else setDrawerLocal(id); };
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  useEffect(() => {
    if (!editDrawerId) return;
    setEditing(editDrawerId);
    setDraft(drawers.find((d) => d.id === editDrawerId)?.name || "");
  }, [editDrawerId]);
  const commitEdit = () => {
    if (!editing) return;
    onRenameDrawer && onRenameDrawer(editing, draft.trim() || "Untitled");
    setEditing(null); setDraft("");
    onEditDone && onEditDone();
  };
  const [sort, setSort] = useState("date");
  const [dir, setDir] = useState("desc");
  const [query, setQuery] = useState("");
  const [activeRaw, setActive] = useState(null);
  const stageRef = useRef(null);
  const q = query.trim().toLowerCase();
  const open = !!q || drawer != null;

  // ---- build the drawer contents (cards + guide dividers) ----
  const items = useMemo(() => {
    let list = q
      ? books.filter((b) => `${b.title} ${b.author} ${b.genre || ""}`.toLowerCase().includes(q))
      : drawer ? books.filter((b) => drawerOf(b) === drawer) : [];
    const key = (b) => sort === "title" ? titleKey(b.title).toLowerCase() : sort === "author" ? `${lastName(b.author)} ${b.author}`.toLowerCase() : (b.date || "");
    list = [...list].sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
    if (dir === "desc") list.reverse();
    const group = (b) => {
      if (sort === "title") return titleKey(b.title)[0]?.toUpperCase() || "#";
      if (sort === "author") return lastName(b.author)[0]?.toUpperCase() || "#";
      if (!b.date) return "Undated";
      const [y, m] = b.date.split("-").map(Number); return `${MONTHS[m - 1]} ${y}`;
    };
    const out = []; let g = null, gi = 0;
    const guides = showGuides && !q;
    list.forEach((b) => {
      const grp = group(b);
      if (grp !== g) { g = grp; if (guides) out.push({ type: "guide", label: grp, gi: gi++ }); }
      out.push({ type: "card", book: b, grp });
    });
    out.forEach((it) => { if (it.type === "guide") it.count = out.filter((x) => x.type === "card" && x.grp === it.label).length; });
    return out;
  }, [books, drawer, sort, dir, q, showGuides, drawerOf]);

  const firstCard = Math.max(0, items.findIndex((x) => x.type === "card"));
  const len = items.length;
  const active = len ? Math.max(0, Math.min(len - 1, activeRaw ?? firstCard)) : 0;
  const cards = items.filter((x) => x.type === "card");
  const step = (d) => setActive((a) => Math.max(0, Math.min(len - 1, (a ?? firstCard) + d)));
  const resetTo = (fn) => { fn(); setActive(null); };
  const openCard = (id) => onOpenBook && onOpenBook(id, cards.map((c) => c.book.id));

  // ---- wheel + keyboard thumbing ----
  const live = useRef({}); live.current = { active, len, step, items, openCard, isOpen: open };
  useEffect(() => {
    let acc = 0, last = 0;
    const onWheel = (e) => {
      const { active: a, len: n, step: s } = live.current, d = e.deltaY > 0 ? 1 : -1;
      if ((d > 0 && a >= n - 1) || (d < 0 && a <= 0)) return; // let the page scroll at the ends
      e.preventDefault(); acc += e.deltaY; const now = Date.now();
      if (Math.abs(acc) > 40 && now - last > 70) { s(acc > 0 ? 1 : -1); acc = 0; last = now; }
    };
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || document.querySelector("[data-book-modal-open]")) return;
      const { step: s, items: its, active: a, openCard: oc, isOpen } = live.current;
      if (!isOpen || !its.length) return;
      if (e.key === "Enter" && tag === "BUTTON") return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); s(1); }
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); s(-1); }
      else if (e.key === "Enter" && its[a]?.type === "card") oc(its[a].book.id);
    };
    let ty = null;
    const onTouchStart = (e) => { ty = e.touches[0].clientY; };
    const onTouchMove = (e) => {
      if (ty == null) return;
      const { active: a, len: n, step: s } = live.current, dy = ty - e.touches[0].clientY, d = dy > 0 ? 1 : -1;
      if ((d > 0 && a >= n - 1) || (d < 0 && a <= 0)) return;
      e.preventDefault();
      if (Math.abs(dy) > 36) { s(d); ty = e.touches[0].clientY; }
    };
    const onTouchEnd = () => { ty = null; };
    const el = stageRef.current;
    if (el) {
      el.addEventListener("wheel", onWheel, { passive: false });
      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchmove", onTouchMove, { passive: false });
      el.addEventListener("touchend", onTouchEnd);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      if (el) {
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchmove", onTouchMove);
        el.removeEventListener("touchend", onTouchEnd);
      }
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // ---- card placement in the stack ----
  const place = (k, jitter) => {
    if (k === 0) return { transform: `translateY(-10px) rotate(${jitter}deg)`, zIndex: 500, opacity: 1, pointerEvents: "auto" };
    if (k > 0 && k <= stackDepth) return { transform: `translateY(${-k * STEP - 10}px) translateZ(${-k * DEPTH_Z}px) rotate(${jitter}deg)`, zIndex: 500 - k, opacity: 1, pointerEvents: "auto" };
    if (k > stackDepth) return { transform: `translateY(${-(stackDepth + 1) * STEP - 10}px) translateZ(${-(stackDepth + 1) * DEPTH_Z}px)`, zIndex: 400 - k, opacity: 0, pointerEvents: "none" };
    if (k >= -4) return { transform: `translateY(${(-k - 1) * 5}px) rotateX(-76deg)`, zIndex: 600 - k, opacity: 1, pointerEvents: "auto" }; // flipped past: leaning toward you
    return { transform: "translateY(24px) rotateX(-86deg)", zIndex: 590, opacity: 0, pointerEvents: "none" };
  };

  const counts = useMemo(() => { const c = {}; books.forEach((b) => { const d = drawerOf(b); c[d] = (c[d] || 0) + 1; }); return c; }, [books, drawerOf]);
  const activeItem = items[active];
  const activeGroup = activeItem ? (activeItem.type === "guide" ? activeItem.label : activeItem.grp) : null;
  const cardPos = activeItem?.type === "card" ? cards.indexOf(activeItem) + 1 : null;
  const drawerName = drawers.find((d) => d.id === drawer)?.name || "";
  const jumps = []; const seen = {};
  items.forEach((it, i) => { const g = it.type === "guide" ? it.label : it.grp; if (!seen[g]) { seen[g] = 1; jumps.push({ label: g, i }); } });

  const S = { type: FONT.type, display: FONT.display, read: FONT.read, body: FONT.body };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* ===== Cabinet ===== */}
      <div style={{ position: "relative", margin: "0 6px 26px" }}>
        <div style={{ height: 30, margin: "0 -14px", borderRadius: "3px 3px 0 0", background: "linear-gradient(180deg,#b9824a 0,#9a6636 18%,#7b4d26 46%,#5a3618 70%,#6d4320 82%,#4a2c14 100%)", boxShadow: "0 6px 10px rgba(0,0,0,.35)" }} />
        <div style={{ height: 10, margin: "0 -6px", background: "linear-gradient(180deg,#3b2210,#6b4220)" }} />
        <div className="ccd-carcass" style={{ background: "linear-gradient(90deg,#4f2f16 0,#6a4220 14px,#5a371a 28px,#5a371a calc(100% - 28px),#6a4220 calc(100% - 14px),#4f2f16 100%)", padding: "14px 28px 16px" }}>
          <div className="ccd-fronts" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {drawers.map((d, i) => {
              const on = !q && d.id === drawer;
              return <DrawerFace key={d.id} name={d.name} count={counts[d.id] || 0} open={on} grainOffset={i}
                editing={editing === d.id} draft={draft} onDraft={setDraft} onCommit={commitEdit}
                onCancelEdit={() => { setEditing(null); setDraft(""); onEditDone && onEditDone(); }}
                onRename={onRenameDrawer ? () => { setEditing(d.id); setDraft(d.name); } : null}
                onRemove={onRemoveDrawer && d.removable && drawers.length > 1 ? () => onRemoveDrawer(d.id) : null}
                onClick={() => { if (editing) return commitEdit(); resetTo(() => { if (on) setDrawer(null); else { setDrawer(d.id); setQuery(""); } }); }} />;
            })}
            {extraFaces.map((f, i) => (
              <DrawerFace key={f.id} name={f.name} sub={f.sub} grainOffset={drawers.length + i} paper={f.paper} onClick={f.onClick} />
            ))}
            {onAddDrawer && <DrawerFace name="+ New drawer" sub="label me" grainOffset={7} paper="#EFE6D2" onClick={onAddDrawer} />}
          </div>
        </div>
        <div style={{ height: 12, margin: "0 -6px", background: "linear-gradient(180deg,#6b4220,#3b2210)" }} />
        <div style={{ position: "relative", height: 26, margin: "0 8px", background: "linear-gradient(180deg,#5a3618,#3a2210)" }}>
          <span style={{ position: "absolute", left: 0, bottom: -10, width: 44, height: 10, background: "#2f1b0c", borderRadius: "0 0 3px 3px" }} />
          <span style={{ position: "absolute", right: 0, bottom: -10, width: 44, height: 10, background: "#2f1b0c", borderRadius: "0 0 3px 3px" }} />
        </div>
      </div>

      {/* ===== Toolbar: search + sort ===== */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, margin: "34px 0 16px" }}>
        <div style={{ position: "relative", flex: "1 1 260px", minWidth: 220 }}>
          <input value={query} onChange={(e) => resetTo(() => setQuery(e.target.value))}
            onKeyDown={(e) => { if (e.key === "Enter" && cards[0]) openCard(cards[0].book.id); if (e.key === "Escape") resetTo(() => setQuery("")); }}
            placeholder="Search all drawers by title, author, or genre"
            style={{ width: "100%", fontFamily: S.body, fontSize: 14.5, padding: "13px 40px 13px 16px", borderRadius: 2, border: `1px solid ${BRAND.line2}`, background: BRAND.paper, color: BRAND.ink, outline: "none" }} />
          {query && <button onClick={() => resetTo(() => setQuery(""))} aria-label="Clear search" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 28, height: 28, border: "none", background: "transparent", color: BRAND.muted, cursor: "pointer" }}>✕</button>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: S.body, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: BRAND.muted }}>Sort</span>
          <div style={{ display: "flex", border: `1px solid ${BRAND.line2}`, borderRadius: 2, overflow: "hidden", background: BRAND.paper }}>
            {[["title", "Title"], ["author", "Author"], ["date", "Date read"]].map(([id, label]) => (
              <button key={id} onClick={() => resetTo(() => { setSort(id); setDir(id === "date" ? "desc" : "asc"); })}
                style={{ fontFamily: S.body, fontSize: 13, border: "none", cursor: "pointer", padding: "11px 14px", whiteSpace: "nowrap", background: sort === id ? BRAND.coral : "transparent", color: sort === id ? "#fff" : BRAND.ink }}>{label}</button>
            ))}
          </div>
          <button onClick={() => resetTo(() => setDir(dir === "asc" ? "desc" : "asc"))} style={{ fontFamily: S.body, fontSize: 13, cursor: "pointer", padding: "11px 14px", borderRadius: 2, border: `1px solid ${BRAND.line2}`, background: BRAND.paper, color: BRAND.ink, whiteSpace: "nowrap" }}>
            {sort === "date" ? (dir === "desc" ? "Newest first ↓" : "Oldest first ↑") : (dir === "asc" ? "A → Z" : "Z → A")}
          </button>
        </div>
      </div>

      {!open && <div style={{ textAlign: "center", padding: "26px 20px", border: `1px dashed ${BRAND.line2}`, borderRadius: 3, fontFamily: S.read, fontStyle: "italic", fontSize: 17, color: BRAND.muted }}>The drawer is shut. Pull one from the cabinet to thumb through its cards.</div>}

      {/* ===== Pulled-out drawer ===== */}
      <div aria-hidden={!open} style={{ borderRadius: 3, overflow: "hidden", pointerEvents: open ? "auto" : "none", visibility: open ? "visible" : "hidden", maxHeight: open ? 900 : 0, opacity: open ? 1 : 0, transform: `translateY(${open ? 0 : -40}px)`, boxShadow: open ? "0 24px 50px rgba(30,15,5,.35),0 0 0 1px #2a1609" : "none", transition: `max-height .55s cubic-bezier(.4,0,.2,1),opacity .4s ease,transform .55s cubic-bezier(.4,0,.2,1),visibility 0s linear ${open ? "0s" : ".55s"}` }}>
        <div ref={stageRef} className="ccd-stage" style={{ position: "relative", height: 640, perspective: 1500, perspectiveOrigin: "50% -15%", overflow: "hidden", clipPath: "inset(0)", background: "linear-gradient(180deg,#150b04 0,#2a170a 24%,#3a2312 60%,#3f2614 100%)" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 120, width: 46, zIndex: 2, clipPath: "polygon(0 0,100% 0,38% 100%,0 100%)", background: `${GRAIN},linear-gradient(90deg,#5a3618,#8a5a2e 70%,#9d6a38)`, pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 120, width: 46, zIndex: 2, clipPath: "polygon(0 0,100% 0,100% 100%,62% 100%)", background: `${GRAIN},linear-gradient(270deg,#5a3618,#7d5028 70%,#8e5e30)`, pointerEvents: "none" }} />

          {items.map((it, i) => {
            const k = i - active, p = place(k, ((i * 37) % 7 - 3) * 0.12);
            const shadow = k === 0 ? "0 -2px 0 rgba(255,255,255,.4) inset, 0 18px 40px rgba(0,0,0,.5)" : "0 -6px 14px rgba(0,0,0,.28)";
            const onClick = (e) => { e.stopPropagation(); if (k !== 0) return setActive(i); if (it.type === "card") openCard(it.book.id); else step(1); };
            return (
              <div key={it.type === "card" ? it.book.id : "g-" + it.label} onClick={onClick} className="ccd-slot"
                style={{ position: "absolute", left: 44, right: 44, bottom: 96, height: 300, transformOrigin: "50% 100%", cursor: "pointer", transition: "transform .5s cubic-bezier(.2,.8,.2,1),opacity .35s ease", ...p }}>
                {it.type === "guide"
                  ? <GuideCard label={it.label} count={it.count} gi={it.gi} shadow={shadow} />
                  : <IndexCard book={it.book} sort={sort} active={k === 0} shadow={shadow} />}
              </div>
            );
          })}
          {len > 0 && (
            <div style={{ position: "absolute", left: 38, right: 38, bottom: 96, height: 300, transformOrigin: "50% 100%", transition: "transform .5s cubic-bezier(.2,.8,.2,1),opacity .35s", ...place(len - active, 0), pointerEvents: "none" }}>
              {/* follower block behind the last card */}
              <div style={{ position: "absolute", left: 0, right: 0, top: 150, bottom: 0, borderRadius: 2, background: `${GRAIN},linear-gradient(180deg,#a8743f,#7a4c25)`, boxShadow: "inset 0 3px 0 rgba(255,225,180,.25),0 -6px 14px rgba(0,0,0,.4)" }}>
                <span style={{ position: "absolute", left: "50%", top: 18, marginLeft: -9, width: 18, height: 18, borderRadius: "50%", background: KNOB }} />
              </div>
            </div>
          )}
          {cards.length === 0 && open && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 200, zIndex: 900, textAlign: "center", padding: "0 60px", fontFamily: S.read, fontStyle: "italic", fontSize: 18, color: "rgba(251,246,232,.78)" }}>
              {q ? `No cards match “${query}”. Try a title, an author’s last name, or a genre.` : "This drawer is empty."}
            </div>
          )}

          {/* drawer front */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, zIndex: 1000, pointerEvents: "none" }}>
            <div style={{ height: 14, background: "linear-gradient(180deg,#c9965d,#a8743f)", boxShadow: "0 -10px 22px rgba(0,0,0,.5)" }} />
            <div style={{ position: "relative", height: 136, background: `${GRAIN},${OAK}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 2px 4px rgba(0,0,0,.35)" }}>
              <span style={{ position: "absolute", inset: "10px 14px", border: "1px solid rgba(40,18,4,.45)", boxShadow: "inset 1px 1px 0 rgba(255,225,180,.18),1px 1px 0 rgba(255,225,180,.14)" }} />
              <LabelPlate name={q ? "Search" : drawerName} sub={`${cards.length} ${cards.length === 1 ? "card" : "cards"}`} big />
              <button onClick={(e) => { e.stopPropagation(); resetTo(() => { setDrawer(null); setQuery(""); }); }} title="Close the drawer" aria-label="Close the drawer"
                style={{ position: "relative", pointerEvents: "auto", cursor: "pointer", padding: 0, marginTop: 10, width: 76, height: 21, borderRadius: "2px 2px 38px 38px / 2px 2px 21px 21px", background: CUP, border: "1px solid #5f4a1d", boxShadow: "0 3px 4px rgba(0,0,0,.45)" }}>
                <span style={{ position: "absolute", left: 8, right: 8, top: 2, height: 9, borderRadius: "0 0 24px 24px", background: "linear-gradient(180deg,rgba(30,15,3,.85),rgba(30,15,3,.25))" }} />
              </button>
              <span className="ccd-hint" style={{ position: "absolute", right: 26, bottom: 18, fontFamily: S.type, fontSize: 10.5, color: "rgba(251,246,232,.72)", textShadow: "0 1px 1px rgba(0,0,0,.5)" }}>click the handle to close</span>
              <span style={{ position: "absolute", bottom: 14, left: "50%", marginLeft: -8, width: 16, height: 16, borderRadius: "50%", background: KNOB, boxShadow: "0 1px 2px rgba(0,0,0,.6)" }} />
            </div>
          </div>
        </div>

        {/* thumb controls */}
        <div style={{ background: BRAND.espresso, padding: "14px 20px 16px", borderTop: "1px solid #000" }}>
          <div className="ccd-ctrl" style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <CtrlBtn onClick={() => step(-1)} label="Previous card">‹</CtrlBtn>
            <input type="range" min={0} max={Math.max(0, len - 1)} value={active} onChange={(e) => setActive(Number(e.target.value))} aria-label="Thumb through cards" style={{ flex: 1, minWidth: 0, accentColor: BRAND.coral }} />
            <CtrlBtn onClick={() => step(1)} label="Next card">›</CtrlBtn>
            <span className="ccd-count" style={{ flex: "none", minWidth: 96, textAlign: "right", fontFamily: S.type, fontSize: 12.5, color: "#FBF6E8" }}>
              {!cards.length ? "0 cards" : cardPos ? `Card ${cardPos} of ${cards.length}` : `${activeItem.label} guide`}
            </span>
          </div>
          {jumps.length > 1 && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 5, marginTop: 12 }}>
              <span style={{ fontFamily: S.body, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(251,246,232,.6)", marginRight: 4 }}>Jump to</span>
              {jumps.map((j) => { const on = j.label === activeGroup; return (
                <button key={j.label} onClick={() => setActive(j.i)} style={{ fontFamily: S.type, fontSize: 12, cursor: "pointer", padding: "5px 9px", borderRadius: 2, border: `1px solid ${on ? BRAND.coral : "rgba(217,162,130,.35)"}`, background: on ? BRAND.coral : "transparent", color: on ? "#fff" : "#FBF6E8" }}>{j.label}</button>
              ); })}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width:720px){.ccd-fronts{grid-template-columns:repeat(2,1fr)!important}}
        @media (max-width:520px){
          .ccd-carcass{padding:12px 14px 14px!important}
          .ccd-fronts{gap:8px!important}
          .ccd-face{height:112px!important}
          .ccd-face .ccd-paper{width:74px!important;height:42px!important;padding:0 3px!important}
          .ccd-face .ccd-name{font-size:11px!important;white-space:normal!important;text-align:center;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere}
          .ccd-stage{height:560px!important}
          .ccd-slot{left:18px!important;right:18px!important}
          .ccd-cardtitle{font-size:21px!important}
          .ccd-hint{display:none!important}
          .ccd-bigpaper{width:140px!important}
          .ccd-guidebig{font-size:40px!important}
          .ccd-ctrl{flex-wrap:wrap;gap:10px!important}
          .ccd-count{order:3;width:100%;text-align:center!important}
          .ccd-tab{width:30%!important;font-size:11px!important}
          .ccd-tab:not(:empty){left:auto!important;right:6%!important}
        }
      `}</style>
    </div>
  );
}

function CtrlBtn({ onClick, label, children }) {
  return <button onClick={onClick} aria-label={label} style={{ width: 36, height: 36, flex: "none", borderRadius: 2, border: "1px solid rgba(217,162,130,.4)", background: "transparent", color: "#FBF6E8", cursor: "pointer", fontSize: 16 }}>{children}</button>;
}

function LabelPlate({ name, sub, big, paper = "#FBF6E8" }) {
  return (
    <span style={{ position: "relative", display: "flex", alignItems: "center", gap: big ? 7 : 5, padding: big ? "5px 7px" : "4px 5px", borderRadius: 2, background: BRASS_PLATE, border: "1px solid #5f4a1d", boxShadow: "0 2px 3px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.6)" }}>
      <span style={{ width: big ? 6 : 5, height: big ? 6 : 5, borderRadius: "50%", background: SCREW }} />
      <span className={big ? "ccd-bigpaper" : "ccd-paper"} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: big ? 180 : 112, height: big ? 46 : 38, background: paper, boxShadow: "inset 0 3px 3px -1px rgba(0,0,0,.35)", padding: "0 6px" }}>
        <span className={big ? undefined : "ccd-name"} style={{ fontFamily: FONT.type, fontSize: big ? 16 : 13, lineHeight: 1.1, color: "#2c2014", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{name}</span>
        {sub && <span style={{ fontFamily: FONT.type, fontSize: big ? 10.5 : 9.5, color: "#6b5a44", marginTop: 2 }}>{sub}</span>}
      </span>
      <span style={{ width: big ? 6 : 5, height: big ? 6 : 5, borderRadius: "50%", background: SCREW }} />
    </span>
  );
}

function DrawerFace({ name, count, sub, open, onClick, grainOffset = 0, paper, editing, draft, onDraft, onCommit, onCancelEdit, onRename, onRemove }) {
  const [hover, setHover] = useState(false);
  const corner = { position: "absolute", top: 8, zIndex: 3, width: 24, height: 24, borderRadius: "50%", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(0,0,0,.4)" };
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="ccd-face"
      style={{ position: "relative", height: 128, borderRadius: 2, background: "#170d06", boxShadow: "inset 0 4px 8px rgba(0,0,0,.85),inset 0 -1px 0 rgba(255,255,255,.06)" }}>
      {editing && (
        <input autoFocus value={draft} maxLength={22} onChange={(e) => onDraft(e.target.value)} onBlur={onCommit}
          onKeyDown={(e) => { if (e.key === "Enter") onCommit(); if (e.key === "Escape") onCancelEdit(); }}
          aria-label="Drawer name"
          style={{ position: "absolute", left: "50%", top: 30, transform: "translateX(-50%)", width: 124, zIndex: 4, border: "1px solid #5f4a1d", outline: "none", background: "#FFFCF2", textAlign: "center", fontFamily: FONT.type, fontSize: 13, color: "#2c2014", padding: "6px 4px", borderRadius: 2 }} />
      )}
      {hover && !editing && onRename && (
        <button onClick={(e) => { e.stopPropagation(); onRename(); }} aria-label={`Rename ${name}`} title="Rename"
          style={{ ...corner, right: 8, border: "1px solid #5f4a1d", background: BRASS_PLATE, color: "#3a2c12" }}>✎</button>
      )}
      {hover && !editing && onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} aria-label={`Delete ${name}`} title="Delete drawer"
          style={{ ...corner, left: 8, border: "1px solid #6f3030", background: "rgba(38,32,32,.7)", color: BRAND.cream, fontSize: 11 }}>✕</button>
      )}
      <button onClick={onClick} aria-label={open ? `Close ${name} drawer` : `Open ${name} drawer`}
        style={{ position: "absolute", inset: 0, cursor: "pointer", border: "none", padding: 0, borderRadius: 2, background: `${GRAIN},${OAK}`, backgroundPosition: `${grainOffset * 37}px ${grainOffset * 11}px, 0 0`,
          filter: hover ? "brightness(1.07)" : "none", transform: open ? "translateY(7px) scale(1.035)" : "none",
          boxShadow: open ? "inset 1px 1px 0 rgba(255,225,180,.25), inset -1px -1px 0 rgba(0,0,0,.35), 0 12px 18px rgba(0,0,0,.6), 0 0 0 2px #C2A35E" : "inset 1px 1px 0 rgba(255,225,180,.22), inset -1px -1px 0 rgba(0,0,0,.4), 0 1px 1px rgba(0,0,0,.4)",
          transition: "transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ position: "absolute", inset: 7, borderRadius: 2, border: "1px solid rgba(40,18,4,.45)", boxShadow: "inset 1px 1px 0 rgba(255,225,180,.18),1px 1px 0 rgba(255,225,180,.14)", pointerEvents: "none" }} />
        <LabelPlate name={name} sub={sub ?? `${count} ${count === 1 ? "card" : "cards"}`} paper={paper} />
        <span style={{ position: "relative", marginTop: 8, width: 58, height: 17, borderRadius: "2px 2px 29px 29px / 2px 2px 17px 17px", background: CUP, border: "1px solid #5f4a1d", boxShadow: "0 3px 4px rgba(0,0,0,.45)" }}>
          <span style={{ position: "absolute", left: 6, right: 6, top: 2, height: 7, borderRadius: "0 0 20px 20px", background: "linear-gradient(180deg,rgba(30,15,3,.85),rgba(30,15,3,.25))" }} />
        </span>
        <span style={{ position: "absolute", bottom: 11, left: "50%", marginLeft: -6, width: 12, height: 12, borderRadius: "50%", background: KNOB, boxShadow: "0 1px 2px rgba(0,0,0,.6)" }} />
      </button>
    </div>
  );
}

function GuideCard({ label, count, gi, shadow }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "#E8D3A8", border: "1px solid #cdb582", borderRadius: 2, boxShadow: shadow }}>
      <div className="ccd-tab" style={{ position: "absolute", top: -24, left: ["56%", "76%", "66%"][gi % 3], width: "22%", height: 25, whiteSpace: "nowrap", overflow: "hidden", background: "#E8D3A8", border: "1px solid #cdb582", borderBottom: "none", borderRadius: "6px 6px 0 0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.type, fontSize: 13, letterSpacing: ".06em", color: "#3a2c12" }}>{label}</div>
      <div style={{ padding: "46px 26px 0", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span className="ccd-guidebig" style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 64, lineHeight: 1, whiteSpace: "nowrap", color: "rgba(58,44,18,.32)" }}>{label}</span>
        <span style={{ fontFamily: FONT.type, fontSize: 12, color: "rgba(58,44,18,.6)" }}>{count} {count === 1 ? "card" : "cards"}</span>
      </div>
    </div>
  );
}

function IndexCard({ book: b, sort, active, shadow }) {
  const lastFirst = `${lastName(b.author)}, ${firstNames(b.author)}`.toUpperCase();
  const primary = sort === "author" ? lastFirst : sort === "title" ? b.title.toUpperCase() : fmt(b.date).toUpperCase();
  const secondary = sort === "author" ? b.title : sort === "title" ? b.author : `${b.title}, ${b.author}`;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#F7F0E1", border: `1px solid ${BRAND.cardEdge}`, borderRadius: 2, boxShadow: shadow, overflow: "hidden" }}>
      {/* header strip — the part you see when the card is stacked */}
      <div style={{ height: 30, padding: "0 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(242,92,92,.55)" }}>
        <span style={{ fontFamily: FONT.type, fontSize: 12.5, color: "#2c2014", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{primary}</span>
        <span style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13, color: BRAND.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: "1 1 0", minWidth: 0 }}>{secondary}</span>
        <span style={{ fontFamily: FONT.type, fontSize: 10.5, color: BRAND.terracotta, flex: "none" }}>{b.callNumber}</span>
      </div>
      <div style={{ padding: "16px 22px 0" }}>
        <div className="ccd-cardtitle" style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 27, lineHeight: 1.08, color: BRAND.ink, marginBottom: 3 }}>{b.title}</div>
        <div style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 15, color: BRAND.muted, marginBottom: 10 }}>{b.author}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", fontFamily: FONT.type, fontSize: 11.5, color: "#4a3a2c", marginBottom: 12 }}>
          {b.date && <span>{b.dateKind || "Added"} {fmt(b.date)}</span>}
          {b.pages ? <span>{b.pages} pp</span> : null}
          <span style={{ color: BRAND.coral }}>{stars(b.rating)}</span>
        </div>
        <div style={{ fontFamily: FONT.read, fontSize: 14, lineHeight: "24px", color: "#3a302a", height: 72, overflow: "hidden", background: `repeating-linear-gradient(180deg,transparent 0 23px,${BLUE_RULE} 23px 24px)` }}>{b.description || "No description yet."}</div>
      </div>
      <div style={{ position: "absolute", right: 18, top: 262, fontFamily: FONT.body, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: BRAND.coral, opacity: active ? 1 : 0 }}>Open card ↵</div>
    </div>
  );
}
