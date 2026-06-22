import { storage } from '../storage.js';

// ---------------------------------------------------------------------------
// STORAGE KEY HELPERS — all namespaced by userId
// ---------------------------------------------------------------------------
export function quotesKey(userId, bookId) { return `${userId}:quotes:${bookId}`; }
export function notationsKey(userId, bookId) { return `${userId}:notations:${bookId}`; }
export function chatKey(userId, bookId) { return `${userId}:chat:${bookId}`; }
export function dateAddedKey(userId, bookId) { return `${userId}:dateAdded:${bookId}`; }
export function progressKey(userId, bookId) { return `${userId}:progress:${bookId}`; }
export function shelfKey(userId) { return `${userId}:shelf:books`; }
export function statusKey(userId, id) { return `${userId}:readStatus:${id}`; }
export function customBooksKey(userId) { return `${userId}:customBooks:list`; }

export async function loadQuotes(userId, bookId) {
  try { const res = await storage.get(quotesKey(userId, bookId)); return res ? JSON.parse(res.value) : []; } catch (e) { return []; }
}
export async function saveQuotes(userId, bookId, items) {
  try { await storage.set(quotesKey(userId, bookId), JSON.stringify(items)); } catch (e) {}
}
export async function loadNotations(userId, bookId) {
  try { const res = await storage.get(notationsKey(userId, bookId)); return res ? JSON.parse(res.value) : []; } catch (e) { return []; }
}
export async function saveNotations(userId, bookId, items) {
  try { await storage.set(notationsKey(userId, bookId), JSON.stringify(items)); } catch (e) {}
}
export async function loadChat(userId, bookId) {
  try { const res = await storage.get(chatKey(userId, bookId)); return res ? JSON.parse(res.value) : []; } catch (e) { return []; }
}
export async function saveChat(userId, bookId, messages) {
  try { await storage.set(chatKey(userId, bookId), JSON.stringify(messages)); } catch (e) {}
}
export async function loadDateAdded(userId, bookId) {
  try { const res = await storage.get(dateAddedKey(userId, bookId)); return res ? res.value : null; } catch (e) { return null; }
}
export async function saveDateAdded(userId, bookId, dateStr) {
  try { await storage.set(dateAddedKey(userId, bookId), dateStr); } catch (e) {}
}
export async function loadProgress(userId, bookId) {
  try { const res = await storage.get(progressKey(userId, bookId)); return res ? JSON.parse(res.value) : null; } catch (e) { return null; }
}
export async function saveProgress(userId, bookId, data) {
  try { const result = await storage.set(progressKey(userId, bookId), JSON.stringify(data)); return !!result; } catch (e) { return false; }
}
// loadShelfBooks — legacy store, read-only for migration in loadBooks()
export async function loadShelfBooks(userId) {
  try { const res = await storage.get(shelfKey(userId)); return res ? JSON.parse(res.value) : []; } catch (e) { return []; }
}
export async function loadStatus(userId, id) {
  try { const res = await storage.get(statusKey(userId, id)); return res ? res.value : null; } catch (e) { return null; }
}
export async function saveStatus(userId, id, status) {
  try { const result = await storage.set(statusKey(userId, id), status); return !!result; } catch (e) { return false; }
}
// loadCustomBooks — legacy store, read-only for migration in loadBooks()
export async function loadCustomBooks(userId) {
  try { const res = await storage.get(customBooksKey(userId)); return res ? JSON.parse(res.value) : []; } catch (e) { return []; }
}

// ---------------------------------------------------------------------------
// UNIFIED BOOK STORE — single source of truth for all user-added books
// ---------------------------------------------------------------------------
export function unifiedBooksKey(userId) { return `${userId}:books:v2`; }

export async function loadBooks(userId) {
  try {
    const res = await storage.get(unifiedBooksKey(userId));
    if (res) return JSON.parse(res.value);
    // First run: migrate from old separate stores
    const [shelf, custom] = await Promise.all([loadShelfBooks(userId), loadCustomBooks(userId)]);
    const customIds = new Set(custom.map((b) => b.id));
    const seen = new Set();
    const merged = [];
    for (const b of [...custom, ...shelf]) {
      if (seen.has(b.id)) continue;
      seen.add(b.id);
      merged.push({ ...b, inMarginalia: customIds.has(b.id), drawerId: b.drawerId || null, nodes: b.nodes || [], theme: b.theme || null });
    }
    if (merged.length > 0) await saveBooks(userId, merged);
    return merged;
  } catch { return []; }
}

export async function saveBooks(userId, list) {
  try { await storage.set(unifiedBooksKey(userId), JSON.stringify(list)); return true; } catch { return false; }
}

// Returns true if two book records refer to the same work
export function booksMatch(a, b) {
  if (a.workId && b.workId) return a.workId === b.workId;
  const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return norm(a.title) === norm(b.title) && norm(a.author) === norm(b.author);
}

// ---------------------------------------------------------------------------
// TOOLTIPS
// ---------------------------------------------------------------------------
const TOOLTIPS_KEY = "admin:tooltips";

export async function loadTooltips() {
  try {
    const res = await storage.get(TOOLTIPS_KEY);
    return res ? JSON.parse(res.value) : {};
  } catch { return {}; }
}

export async function saveTooltips(tooltips) {
  try { await storage.set(TOOLTIPS_KEY, JSON.stringify(tooltips)); } catch {}
}

// Load a friend's shared book that matches the given book, along with their quotes/progress
export async function loadFriendSharedData(friendId, myBook) {
  try {
    const friendBooks = await loadBooks(friendId);
    const match = friendBooks.find((b) => b.shared && b.inMarginalia && booksMatch(b, myBook));
    if (!match) return null;
    const [quotes, progress, status] = await Promise.all([
      loadQuotes(friendId, match.id),
      loadProgress(friendId, match.id),
      loadStatus(friendId, match.id),
    ]);
    return { book: match, quotes, progress, status };
  } catch { return null; }
}
