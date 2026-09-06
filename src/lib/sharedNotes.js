import { storage } from '../storage.js';

const seenKey = (userId, bookId) => `sharedNotes:seen:${userId}:${bookId}`;

export function getSeenNotes(userId, bookId) {
  try { return new Set(JSON.parse(localStorage.getItem(seenKey(userId, bookId)) || '[]')); } catch { return new Set(); }
}

export function markNotesSeen(userId, bookId, ids) {
  try {
    const existing = getSeenNotes(userId, bookId);
    ids.forEach(id => existing.add(id));
    localStorage.setItem(seenKey(userId, bookId), JSON.stringify([...existing]));
  } catch {}
}

export async function getNewSharedNotes(userId, bookId, friends, currentPage) {
  if (!friends || friends.length === 0) return [];
  const seen = getSeenNotes(userId, bookId);
  const results = [];
  for (const friend of friends) {
    try {
      const res = await storage.get(`${friend.id}:notations:${bookId}`);
      const notes = res ? JSON.parse(res.value) : [];
      notes
        .filter(n => n.shared && !seen.has(n.id) && (!n.page || parseInt(n.page, 10) <= currentPage))
        .forEach(n => results.push({ ...n, authorName: friend.name, authorId: friend.id }));
    } catch {}
  }
  return results;
}
