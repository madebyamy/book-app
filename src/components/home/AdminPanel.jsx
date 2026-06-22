import React, { useState, useEffect } from 'react';
import { BRAND, FONT, USERS, ADMIN_USER_ID, TOOLTIP_SECTIONS, ACCENT_PRESETS } from '../../constants.js';
import { loadConnections, saveConnections, hasConnection, saveNewUser, deleteDynamicUser } from '../../lib/users.js';
import { saveTooltips } from '../../lib/books.js';

export function AdminPanel({ onClose, dynamicUsers, dynamicPasswords, onUserCreated, tooltips, onTooltipsChanged }) {
  const allUsers = Object.values(USERS);
  const [connections, setConnections] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newAccent, setNewAccent] = useState(ACCENT_PRESETS[3]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  useEffect(() => {
    loadConnections().then(setConnections);
  }, []);

  const toggleConnection = (id1, id2) => {
    setConnections((prev) => {
      const exists = hasConnection(id1, id2, prev);
      if (exists) return prev.filter(([a, b]) => !((a === id1 && b === id2) || (a === id2 && b === id1)));
      return [...prev, [id1, id2]];
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveConnections(connections);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError(null);
    const name = newName.trim();
    if (!name) { setCreateError("Name is required."); return; }
    if (!newPassword.trim()) { setCreateError("Password is required."); return; }
    const id = name.toLowerCase().replace(/\s+/g, "");
    if (USERS[id]) { setCreateError(`A user named "${name}" already exists.`); return; }
    setCreating(true);
    const newUser = { id, name, accent: newAccent };
    const result = await saveNewUser(newUser, newPassword.trim(), dynamicUsers || [], dynamicPasswords || {});
    USERS[id] = { ...newUser, books: [] };
    onUserCreated(result);
    setCreating(false);
    setCreateSuccess(true);
    setNewName(""); setNewPassword(""); setNewAccent(ACCENT_PRESETS[3]);
    setTimeout(() => setCreateSuccess(false), 3000);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Remove ${USERS[userId]?.name}? This cannot be undone.`)) return;
    const result = await deleteDynamicUser(userId, dynamicUsers || [], dynamicPasswords || {});
    onUserCreated(result);
  };

  const pairs = [];
  for (let i = 0; i < allUsers.length; i++) {
    for (let j = i + 1; j < allUsers.length; j++) {
      pairs.push([allUsers[i], allUsers[j]]);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1.5rem" }}>
      <div style={{ background: BRAND.darkCard, border: `1px solid ${BRAND.cream}22`, borderTop: `3px solid ${BRAND.coral}`, borderRadius: 12, padding: "2rem", width: "100%", maxWidth: 480, fontFamily: FONT.body, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.6rem" }}>
          <div>
            <div style={{ fontFamily: FONT.type, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: BRAND.coral, marginBottom: "0.3rem" }}>Admin · Access Control</div>
            <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: "1.4rem", color: BRAND.cream }}>Manage Connections</div>
            <div style={{ fontSize: "0.8rem", color: `${BRAND.cream}66`, marginTop: "0.3rem" }}>Toggle which users can see each other's info and chat.</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: `${BRAND.cream}55`, cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "0.2rem" }}>✕</button>
        </div>

        <div style={{ marginBottom: "1.4rem" }}>
          <div style={{ fontFamily: FONT.type, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.8rem" }}>Members</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            {allUsers.map((u) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: `${u.accent}18`, border: `1px solid ${u.accent}44`, borderRadius: 20, padding: "0.3rem 0.7rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.accent }} />
                <span style={{ fontFamily: FONT.type, fontSize: "0.65rem", color: u.accent }}>{u.name}</span>
                {u.id === ADMIN_USER_ID && <span style={{ fontFamily: FONT.type, fontSize: "0.5rem", color: BRAND.coral }}>admin</span>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "1.6rem" }}>
          <div style={{ fontFamily: FONT.type, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.8rem" }}>Connections</div>
          {!connections ? (
            <div style={{ fontSize: "0.82rem", color: `${BRAND.cream}44` }}>Loading…</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {pairs.map(([u1, u2]) => {
                const connected = hasConnection(u1.id, u2.id, connections);
                return (
                  <div key={`${u1.id}-${u2.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: `${BRAND.dark}88`, borderRadius: 8, padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontFamily: FONT.body, fontSize: "0.88rem", color: BRAND.cream }}>{u1.name}</span>
                      <span style={{ color: `${BRAND.cream}33`, fontSize: "0.8rem" }}>↔</span>
                      <span style={{ fontFamily: FONT.body, fontSize: "0.88rem", color: BRAND.cream }}>{u2.name}</span>
                    </div>
                    <button onClick={() => toggleConnection(u1.id, u2.id)}
                      style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: connected ? BRAND.coral : `${BRAND.cream}22`, position: "relative", transition: "background .2s ease" }}>
                      <div style={{ position: "absolute", top: 3, left: connected ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: BRAND.cream, transition: "left .2s ease" }} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={saving || !connections}
          style={{ width: "100%", padding: "0.75rem", borderRadius: 8, border: "none", cursor: "pointer", background: saved ? "#4caf50" : BRAND.coral, color: BRAND.cream, fontFamily: FONT.type, fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", transition: "background .2s ease" }}>
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>

        <div style={{ margin: "1.6rem 0", height: 1, background: `${BRAND.cream}14` }} />

        <div style={{ fontFamily: FONT.type, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "1rem" }}>Create New User</div>
        <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <input type="text" value={newName} onChange={(e) => { setNewName(e.target.value); setCreateError(null); }} placeholder="First name (e.g. Jane)"
            style={{ background: `${BRAND.dark}88`, border: `1px solid ${BRAND.cream}22`, borderRadius: 8, padding: "0.7rem 0.9rem", color: BRAND.cream, fontFamily: FONT.body, fontSize: "0.9rem", outline: "none", width: "100%" }} />
          <input type="password" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setCreateError(null); }} placeholder="Password"
            style={{ background: `${BRAND.dark}88`, border: `1px solid ${BRAND.cream}22`, borderRadius: 8, padding: "0.7rem 0.9rem", color: BRAND.cream, fontFamily: FONT.body, fontSize: "0.9rem", outline: "none", width: "100%" }} />
          <div>
            <div style={{ fontFamily: FONT.type, fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.5rem" }}>Accent color</div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {ACCENT_PRESETS.map((c) => (
                <button key={c} type="button" onClick={() => setNewAccent(c)}
                  style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: newAccent === c ? `2px solid ${BRAND.cream}` : "2px solid transparent", cursor: "pointer", padding: 0, outline: "none" }} />
              ))}
            </div>
          </div>
          {createError && <div style={{ fontFamily: FONT.type, fontSize: "0.65rem", color: BRAND.coral }}>{createError}</div>}
          <button type="submit" disabled={creating}
            style={{ padding: "0.7rem", borderRadius: 8, border: "none", cursor: "pointer", background: createSuccess ? "#4caf50" : newAccent, color: BRAND.cream, fontFamily: FONT.type, fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", transition: "background .2s ease" }}>
            {creating ? "Creating…" : createSuccess ? "User Created ✓" : "Create User"}
          </button>
        </form>

        {dynamicUsers && dynamicUsers.length > 0 && (
          <div style={{ marginTop: "1.2rem" }}>
            <div style={{ fontFamily: FONT.type, fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.6rem" }}>Added users</div>
            {dynamicUsers.map((u) => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: `1px solid ${BRAND.cream}0e` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: u.accent }} />
                  <span style={{ fontFamily: FONT.body, fontSize: "0.88rem", color: BRAND.cream }}>{u.name}</span>
                </div>
                <button onClick={() => handleDeleteUser(u.id)} style={{ background: "none", border: "none", color: `${BRAND.cream}44`, cursor: "pointer", fontSize: "0.8rem", padding: "0.2rem 0.4rem" }}>✕ Remove</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ margin: "1.6rem 0", height: 1, background: `${BRAND.cream}14` }} />

        <div style={{ fontFamily: FONT.type, fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: `${BRAND.cream}44`, marginBottom: "0.8rem" }}>Section Tooltips</div>
        <div style={{ fontSize: "0.78rem", color: `${BRAND.cream}55`, fontFamily: FONT.body, marginBottom: "0.8rem" }}>Add instructions that appear as a ⓘ icon on each section. Leave blank to hide.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
          {TOOLTIP_SECTIONS.map(({ key, label }) => (
            <div key={key}>
              <div style={{ fontFamily: FONT.type, fontSize: "0.56rem", color: `${BRAND.cream}55`, marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              <textarea
                value={(tooltips || {})[key] || ""}
                onChange={(e) => onTooltipsChanged({ ...(tooltips || {}), [key]: e.target.value })}
                onBlur={async () => { await saveTooltips(tooltips || {}); }}
                placeholder={`Instructions for ${label}…`}
                rows={2}
                style={{ width: "100%", background: `${BRAND.dark}88`, border: `1px solid ${BRAND.cream}22`, borderRadius: 6, padding: "0.55rem 0.7rem", color: BRAND.cream, fontFamily: FONT.body, fontSize: "0.82rem", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
