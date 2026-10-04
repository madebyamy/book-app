// IndexCardModalFrame — the catalogue-card look for the existing BookModal.
// Wrap BookModal's EXISTING sections (description, notes, file in a drawer, reading dates,
// finished date, Marginalia, remove) in this frame. Do not rewrite their logic.
import React, { useEffect } from "react";
import { BRAND, FONT } from "../../constants.js";

export const cardSection = { borderTop: `1px solid ${BRAND.cardEdge}`, marginTop: 20, paddingTop: 20 };
export const cardSectionLabel = { fontFamily: FONT.type, fontSize: 12.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#4a3a2c", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid rgba(242,92,92,.55)" };
export const cardFieldLabel = { fontFamily: FONT.type, fontSize: 11.5, color: "#4a3a2c" };
export const cardField = { fontFamily: FONT.type, fontSize: 13.5, padding: "10px 12px", borderRadius: 2, border: `1px solid ${BRAND.line2}`, background: "#F3EEE6", color: BRAND.ink, outline: "none" };
export const ruledText = { fontFamily: FONT.read, fontSize: 16, lineHeight: "28px", background: "repeating-linear-gradient(180deg,transparent 0 27px,rgba(92,128,168,.22) 27px 28px)" };
export const darkAction = (on) => ({ display: "inline-flex", alignItems: "center", gap: 9, fontFamily: FONT.type, fontSize: 13.5, cursor: "pointer", padding: "12px 18px", borderRadius: 2, border: `1px solid ${BRAND.espresso}`, background: on ? "transparent" : BRAND.espresso, color: on ? BRAND.espresso : "#FBF6E8" });
export const drawerChip = (on) => ({ fontFamily: FONT.type, fontSize: 13, cursor: "pointer", padding: "11px 16px", borderRadius: 2, border: `1px solid ${on ? BRAND.coral : BRAND.line2}`, background: on ? BRAND.coral : "transparent", color: on ? "#fff" : BRAND.ink, whiteSpace: "nowrap" });

/**
 * @param callNumber  string shown top-left in typewriter
 * @param drawerName  current drawer, shown as a rotated rubber stamp
 * @param onClose / onPrev / onNext   (Esc closes; prev/next walk the drawer's current sort order)
 */
export function IndexCardModalFrame({ callNumber, drawerName, onClose, onPrev, onNext, children }) {
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") onClose && onClose(); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  const navBtn = { fontFamily: FONT.type, fontSize: 12.5, letterSpacing: ".04em", cursor: "pointer", padding: "9px 14px", borderRadius: 2, border: `1px solid ${BRAND.line2}`, background: "transparent", color: BRAND.ink, whiteSpace: "nowrap" };
  return (
    <div data-book-modal-open onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(38,32,32,.66)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(10px,3vw,24px)", animation: "cc-fade .2s ease" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "min(780px,100%)", maxHeight: "92vh", overflow: "auto", background: "#F7F0E1", border: `1px solid ${BRAND.cardEdge}`, borderRadius: 3, boxShadow: "0 30px 80px rgba(0,0,0,.45)", animation: "cc-pop .28s cubic-bezier(.2,.8,.2,1)" }}>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", border: `1px solid ${BRAND.line2}`, background: BRAND.paper, color: BRAND.ink, cursor: "pointer", fontSize: 15, zIndex: 2 }}>✕</button>
        <style>{`@media (max-width:520px){.icm-pad{padding-left:18px!important;padding-right:18px!important}.icm-head{padding-right:56px!important}.icm-nav button{padding:9px 10px!important;font-size:11px!important}}`}</style>
        <div className="icm-pad icm-head" style={{ padding: "20px 64px 12px 34px", borderBottom: "2px solid rgba(242,92,92,.6)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <span style={{ fontFamily: FONT.type, fontSize: 13, color: BRAND.terracotta }}>{callNumber}</span>
          {drawerName && <span style={{ fontFamily: FONT.type, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: BRAND.coral, border: `2px solid ${BRAND.coral}`, padding: "4px 10px", borderRadius: 2, transform: "rotate(-3deg)" }}>{drawerName}</span>}
        </div>
        <div className="icm-pad" style={{ padding: "24px 34px 8px" }}>{children}</div>
        <div className="icm-pad icm-nav" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 34px 22px", marginTop: 10, borderTop: `1px solid ${BRAND.cardEdge}` }}>
          <button onClick={onPrev} style={navBtn}>‹ Previous card</button>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#3a2f2c", boxShadow: "inset 0 2px 3px rgba(0,0,0,.6)" }} aria-hidden />
          <button onClick={onNext} style={navBtn}>Next card ›</button>
        </div>
      </div>
    </div>
  );
}
