// -----------------------------------------------------------------------
// storage.js
//
// Backed by Supabase when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// are set (production). Falls back to localStorage automatically when
// they're not set (local dev without credentials).
//
// Table schema (run once in Supabase SQL editor):
//   create table storage (
//     key text primary key,
//     value text
//   );
//   alter table storage enable row level security;
//   create policy "Public read write" on storage
//     for all using (true) with check (true);
// -----------------------------------------------------------------------

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const USE_SUPABASE = !!(SUPABASE_URL && SUPABASE_KEY);

const PREFIX = "book-dashboard:";
function fullKey(key) { return `${PREFIX}${key}`; }

// ---------------------------------------------------------------------------
// Supabase helpers
// ---------------------------------------------------------------------------
async function sbRequest(method, body) {
  const url = `${SUPABASE_URL}/rest/v1/storage`;
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: method === "POST" ? "resolution=merge-duplicates,return=representation" : "return=representation",
  };
  const res = await fetch(url + (method === "GET" ? body : ""), { method: method === "GET" ? "GET" : "POST", headers, body: method !== "GET" ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`Supabase ${method} failed: ${res.status}`);
  return res.json();
}

async function sbGet(key) {
  const k = fullKey(key);
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/storage?key=eq.${encodeURIComponent(k)}&select=key,value`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) throw new Error(`Supabase GET failed: ${res.status}`);
  const rows = await res.json();
  return rows.length ? { key, value: rows[0].value } : null;
}

async function sbSet(key, value) {
  const k = fullKey(key);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/storage`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({ key: k, value }),
  });
  if (!res.ok) throw new Error(`Supabase SET failed: ${res.status}`);
  return { key, value };
}

async function sbDelete(key) {
  const k = fullKey(key);
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/storage?key=eq.${encodeURIComponent(k)}`,
    { method: "DELETE", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) throw new Error(`Supabase DELETE failed: ${res.status}`);
  return { key, deleted: true };
}

async function sbList(prefix) {
  const fullPrefix = fullKey(prefix);
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/storage?key=like.${encodeURIComponent(fullPrefix + "%")}&select=key`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  if (!res.ok) throw new Error(`Supabase LIST failed: ${res.status}`);
  const rows = await res.json();
  return { keys: rows.map((r) => r.key.slice(PREFIX.length)), prefix };
}

// ---------------------------------------------------------------------------
// localStorage helpers (fallback)
// ---------------------------------------------------------------------------
const local = {
  async get(key) {
    try {
      const raw = localStorage.getItem(fullKey(key));
      return raw !== null ? { key, value: raw } : null;
    } catch { return null; }
  },
  async set(key, value) {
    try { localStorage.setItem(fullKey(key), value); return { key, value }; } catch { return null; }
  },
  async delete(key) {
    try { localStorage.removeItem(fullKey(key)); return { key, deleted: true }; } catch { return null; }
  },
  async list(prefix = "") {
    try {
      const keys = [];
      const fullPrefix = fullKey(prefix);
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(fullPrefix)) keys.push(k.slice(PREFIX.length));
      }
      return { keys, prefix };
    } catch { return null; }
  },
};

// ---------------------------------------------------------------------------
// Exported storage API — same shape regardless of backend
// ---------------------------------------------------------------------------
export const storage = {
  async get(key) {
    if (USE_SUPABASE) return sbGet(key).catch(() => local.get(key));
    return local.get(key);
  },
  async set(key, value) {
    if (USE_SUPABASE) return sbSet(key, value).catch(() => local.set(key, value));
    return local.set(key, value);
  },
  async delete(key) {
    if (USE_SUPABASE) return sbDelete(key).catch(() => local.delete(key));
    return local.delete(key);
  },
  async list(prefix = "") {
    if (USE_SUPABASE) return sbList(prefix).catch(() => local.list(prefix));
    return local.list(prefix);
  },
};

// ---------------------------------------------------------------------------
// Real-time chat subscription (Supabase only)
// Listens for new rows where key = the chat key passed in.
// Returns an unsubscribe function.
// ---------------------------------------------------------------------------
export function subscribeToChatUpdates(chatStorageKey, onUpdate) {
  if (!USE_SUPABASE) return () => {};

  const fullChatKey = fullKey(chatStorageKey);
  let active = true;
  let timeout = null;

  // Poll every 4 seconds as a simple real-time substitute
  // (Supabase Realtime requires an extra SDK — polling works fine for 2 users)
  const poll = async () => {
    if (!active) return;
    try {
      const result = await sbGet(chatStorageKey);
      if (result && active) onUpdate(JSON.parse(result.value));
    } catch {}
    if (active) timeout = setTimeout(poll, 4000);
  };

  poll();
  return () => { active = false; if (timeout) clearTimeout(timeout); };
}
