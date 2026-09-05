import React, { useState } from 'react';
import { BRAND, FONT } from '../../constants.js';
import { NotificationCenter } from './NotificationCenter.jsx';

export function TopNav({ screen, activeBook, onNavigate, onLogout, userName, userId, friends }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const items = [
    { label: "Home",       key: "userHome" },
    { label: "Marginalia", key: "myBooks"  },
    { label: "Journal",    key: "journal"  },
  ];

  const activeKey = activeBook ? null : screen;

  const handleNav = (key) => {
    onNavigate(key);
    setMenuOpen(false);
  };

  return (
    <>
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
          onClick={() => handleNav("userHome")}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "0 12px 0 0", marginRight: 8, borderRight: `1px solid rgba(217,162,130,.2)`, flexShrink: 0 }}
        >
          <span style={{ width: 26, height: 26, borderRadius: 3, background: BRAND.coral, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.display, fontWeight: 700, fontSize: 16, color: BRAND.cream }}>M</span>
          <span style={{ fontFamily: FONT.display, fontWeight: 600, fontSize: 18, color: BRAND.cream, letterSpacing: ".02em" }}>Marginalia</span>
        </button>

        {/* Desktop nav links — hidden on mobile via media query workaround */}
        <div className="nav-desktop-links" style={{ display: "contents" }}>
          {items.map(({ label, key }) => {
            const active = activeKey === key;
            return (
              <button
                key={key}
                onClick={() => handleNav(key)}
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
                  whiteSpace: "nowrap",
                }}
              >{label}</button>
            );
          })}
        </div>

        {/* Spacer + user / logout (desktop) + hamburger (mobile) */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {/* Desktop: username + notifications + sign out */}
          <span className="nav-desktop-only" style={{ fontFamily: FONT.body, fontSize: 12.5, color: "rgba(242,239,235,.45)", letterSpacing: ".04em" }}>
            {userName}
          </span>
          {userId && friends && <NotificationCenter userId={userId} friends={friends} />}
          <button
            className="nav-desktop-only"
            onClick={onLogout}
            style={{ background: "none", border: `1px solid rgba(217,162,130,.3)`, cursor: "pointer", fontFamily: FONT.body, fontSize: 12, color: "rgba(242,239,235,.55)", padding: "5px 12px", borderRadius: 4, letterSpacing: ".04em", transition: "all .15s" }}
          >Sign out</button>

          {/* Hamburger — mobile only */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", display: "flex", flexDirection: "column", gap: 5, justifyContent: "center" }}
          >
            <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? BRAND.coral : "rgba(242,239,235,.75)", borderRadius: 2, transition: "all .2s", transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
            <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? "transparent" : "rgba(242,239,235,.75)", borderRadius: 2, transition: "all .2s" }} />
            <span style={{ display: "block", width: 22, height: 2, background: menuOpen ? BRAND.coral : "rgba(242,239,235,.75)", borderRadius: 2, transition: "all .2s", transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="nav-mobile-menu"
          style={{
            position: "fixed", top: 52, left: 0, right: 0, zIndex: 99,
            background: BRAND.espresso,
            borderBottom: `1px solid rgba(217,162,130,.2)`,
            padding: "8px 0 12px",
            boxShadow: "0 8px 24px rgba(0,0,0,.3)",
          }}
        >
          {items.map(({ label, key }) => {
            const active = activeKey === key;
            return (
              <button
                key={key}
                onClick={() => handleNav(key)}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  background: active ? "rgba(242,92,92,.12)" : "none",
                  border: "none", cursor: "pointer",
                  fontFamily: FONT.body, fontSize: 15, letterSpacing: ".03em",
                  color: active ? BRAND.coral : "rgba(242,239,235,.8)",
                  padding: "12px 24px",
                  borderLeft: active ? `3px solid ${BRAND.coral}` : "3px solid transparent",
                  transition: "all .15s",
                }}
              >{label}</button>
            );
          })}
          <div style={{ margin: "10px 24px 0", paddingTop: 10, borderTop: "1px solid rgba(217,162,130,.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: FONT.body, fontSize: 13, color: "rgba(242,239,235,.4)" }}>{userName}</span>
              {userId && friends && <NotificationCenter userId={userId} friends={friends} />}
            </div>
            <button
              onClick={() => { setMenuOpen(false); onLogout(); }}
              style={{ background: "none", border: `1px solid rgba(217,162,130,.3)`, cursor: "pointer", fontFamily: FONT.body, fontSize: 12, color: "rgba(242,239,235,.55)", padding: "6px 14px", borderRadius: 4, letterSpacing: ".04em" }}
            >Sign out</button>
          </div>
        </div>
      )}

      {/* CSS: show/hide based on screen width */}
      <style>{`
        @media (min-width: 600px) {
          .nav-hamburger { display: none !important; }
          .nav-mobile-menu { display: none !important; }
          .nav-desktop-only { display: inline-flex !important; align-items: center; }
        }
        @media (max-width: 599px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-only { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
