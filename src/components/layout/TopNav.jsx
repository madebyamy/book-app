import React from 'react';
import { BRAND, FONT } from '../../constants.js';

export function TopNav({ screen, activeBook, onNavigate, onLogout, userName }) {
  const items = [
    { label: "Home",       key: "userHome" },
    { label: "Marginalia", key: "myBooks"  },
    { label: "Journal",    key: "journal"  },
  ];

  const activeKey = activeBook ? null : screen;

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: BRAND.espresso,
      borderBottom: `1px solid rgba(217,162,130,.15)`,
      display: "flex", alignItems: "center",
      padding: "0 clamp(16px, 4vw, 40px)",
      height: 52,
      gap: 4,
    }}>
      {/* Wordmark */}
      <button
        onClick={() => onNavigate("userHome")}
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "0 12px 0 0", marginRight: 8, borderRight: `1px solid rgba(217,162,130,.2)` }}
      >
        <span style={{ width: 26, height: 26, borderRadius: 3, background: BRAND.coral, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: BRAND.cream }}>M</span>
        <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 18, color: BRAND.cream, letterSpacing: ".02em" }}>Marginalia</span>
      </button>

      {/* Nav links */}
      {items.map(({ label, key }) => {
        const active = activeKey === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            style={{
              background: active ? "rgba(242,92,92,.15)" : "none",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT.body,
              fontSize: 13.5,
              letterSpacing: ".03em",
              color: active ? BRAND.coral : "rgba(242,239,235,.65)",
              padding: "6px 14px",
              borderRadius: 4,
              transition: "all .15s",
            }}
          >{label}</button>
        );
      })}

      {/* Spacer + user / logout */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {userName && (
          <span style={{ fontFamily: FONT.body, fontSize: 12.5, color: "rgba(242,239,235,.45)", letterSpacing: ".04em" }}>
            {userName}
          </span>
        )}
        <button
          onClick={onLogout}
          style={{ background: "none", border: `1px solid rgba(217,162,130,.3)`, cursor: "pointer", fontFamily: FONT.body, fontSize: 12, color: "rgba(242,239,235,.55)", padding: "5px 12px", borderRadius: 4, letterSpacing: ".04em", transition: "all .15s" }}
        >Sign out</button>
      </div>
    </nav>
  );
}
