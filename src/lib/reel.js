import { storage } from '../storage.js';

function reelKey(userId)           { return `${userId}:reel:v1`; }
function reelNotesKey(userId, id)  { return `${userId}:reel-notes:${id}`; }
function reelProgressKey(userId, id) { return `${userId}:reel-progress:${id}`; }

export async function loadShows(userId) {
  try {
    const res = await storage.get(reelKey(userId));
    return res ? JSON.parse(res.value) : [];
  } catch { return []; }
}

export async function saveShows(userId, shows) {
  try { await storage.set(reelKey(userId), JSON.stringify(shows)); } catch {}
}

export async function loadReelNotes(userId, showId) {
  try {
    const res = await storage.get(reelNotesKey(userId, showId));
    return res ? JSON.parse(res.value) : [];
  } catch { return []; }
}

export async function saveReelNotes(userId, showId, notes) {
  try { await storage.set(reelNotesKey(userId, showId), JSON.stringify(notes)); } catch {}
}

export async function loadReelProgress(userId, showId) {
  try {
    const res = await storage.get(reelProgressKey(userId, showId));
    return res ? JSON.parse(res.value) : { watchedEpisodes: [], rating: null };
  } catch { return { watchedEpisodes: [], rating: null }; }
}

export async function saveReelProgress(userId, showId, data) {
  try { await storage.set(reelProgressKey(userId, showId), JSON.stringify(data)); } catch {}
}
