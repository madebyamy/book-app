import { storage } from '../storage.js';
import { TOOLTIPS_KEY } from '../constants.js';

export function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function formatCatalogDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
}

export function daysBetween(fromISO, toISO) {
  return Math.round((new Date(toISO + "T00:00:00") - new Date(fromISO + "T00:00:00")) / 86400000);
}

export function estimateReadTime(pages) {
  if (!pages) return null;
  return Math.round(((pages * 250) / 200 / 60) * 10) / 10;
}

export function spineColor(book, SPINE_COLORS) {
  return book.accent || SPINE_COLORS[Math.abs((book.id||"").charCodeAt(0) + (book.id||"").charCodeAt(2||0)) % SPINE_COLORS.length];
}

// ---------------------------------------------------------------------------
// BOOK SEARCH — Open Library API (free, no key required)
// ---------------------------------------------------------------------------
export async function searchBooks(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(query.trim())}&limit=6&fields=title,author_name,number_of_pages_median,cover_i,first_publish_year`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.docs || []).map((d) => ({
      title: d.title || "",
      author: d.author_name?.[0] || "",
      pages: d.number_of_pages_median || null,
      year: d.first_publish_year ? String(d.first_publish_year) : "",
      cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : "",
    }));
  } catch { return []; }
}

export async function loadTooltips() {
  try {
    const res = await storage.get(TOOLTIPS_KEY);
    return res ? JSON.parse(res.value) : {};
  } catch { return {}; }
}

export async function saveTooltips(tooltips) {
  try { await storage.set(TOOLTIPS_KEY, JSON.stringify(tooltips)); } catch {}
}
