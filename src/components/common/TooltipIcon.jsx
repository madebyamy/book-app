import React, { useState } from 'react';
import { BRAND, FONT } from '../../constants.js';

export function TooltipIcon({ text, color }) {
  const [show, setShow] = useState(false);
  if (!text) return null;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        onClick={(e) => { e.stopPropagation(); setShow((s) => !s); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: color || BRAND.tan, fontSize: "0.8rem", lineHeight: 1, padding: "0 0.3rem", opacity: 0.7 }}
        title="Help"
      >ⓘ</button>
      {show && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
          background: BRAND.darkCard, border: `1px solid ${BRAND.cream}22`, borderRadius: 8,
          padding: "0.8rem 1rem", zIndex: 100, width: 220, boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}>
          <p style={{ fontFamily: FONT.body, fontSize: "0.82rem", color: BRAND.cream, margin: "0 0 0.5rem", lineHeight: 1.5 }}>{text}</p>
          <button onClick={() => setShow(false)} style={{ background: "none", border: "none", color: `${BRAND.cream}55`, cursor: "pointer", fontSize: "0.7rem", padding: 0 }}>Close</button>
        </div>
      )}
    </div>
  );
}
