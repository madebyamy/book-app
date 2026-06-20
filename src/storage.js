// -----------------------------------------------------------------------
// storage.js
//
// Drop-in replacement for the Claude-artifact `window.storage` API.
// Same shape: get(key) / set(key, value) / delete(key) / list(prefix).
//
// Right now this is backed by the browser's localStorage, so the app
// works immediately with zero backend setup — but it only persists on
// one device/browser, which is the same limitation artifacts had.
//
// TO MOVE TO A REAL DATABASE LATER (e.g. Supabase):
//   1. Create a free Supabase project, add a single table:
//        key text primary key, value text
//   2. Replace the body of get/set/delete/list below with calls to the
//      Supabase JS client (`supabase.from('storage').select()...` etc).
//   3. Nothing else in the app needs to change — every component calls
//      `storage.get(...)` / `storage.set(...)`, not localStorage directly.
//
// This file is the ONLY place that needs to change when you're ready
// to add real cross-device sync.
// -----------------------------------------------------------------------

const PREFIX = "book-dashboard:";

function fullKey(key) {
  return `${PREFIX}${key}`;
}

export const storage = {
  async get(key) {
    try {
      const raw = localStorage.getItem(fullKey(key));
      if (raw === null) return null;
      return { key, value: raw };
    } catch (e) {
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(fullKey(key), value);
      return { key, value };
    } catch (e) {
      return null;
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(fullKey(key));
      return { key, deleted: true };
    } catch (e) {
      return null;
    }
  },

  async list(prefix = "") {
    try {
      const keys = [];
      const fullPrefix = fullKey(prefix);
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(fullPrefix)) {
          keys.push(k.slice(PREFIX.length));
        }
      }
      return { keys, prefix };
    } catch (e) {
      return null;
    }
  },
};
