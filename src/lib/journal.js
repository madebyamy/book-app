import { storage } from '../storage.js';

const key = (userId, year) => `${userId}:journal:${year}`;

export async function loadJournalEntries(userId, year) {
  try {
    const res = await storage.get(key(userId, year));
    return res ? JSON.parse(res.value ?? res) : [];
  } catch { return []; }
}

export async function saveJournalEntries(userId, year, entries) {
  try { await storage.set(key(userId, year), JSON.stringify(entries)); } catch {}
}

export async function addJournalEntry(userId, entry) {
  const year = new Date().getFullYear();
  const existing = await loadJournalEntries(userId, year);
  const newEntry = {
    id: `j${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString(),
    ...entry,
  };
  await saveJournalEntries(userId, year, [...existing, newEntry]);
  return newEntry;
}
