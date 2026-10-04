const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG  = "https://image.tmdb.org/t/p/w500";

function posterUrl(path) { return path ? `${TMDB_IMG}${path}` : null; }
function firstYear(dateStr) { return dateStr ? dateStr.slice(0, 4) : null; }

async function tmdbFetch(path, key) {
  const sep = path.includes("?") ? "&" : "?";
  const r = await fetch(`${TMDB_BASE}${path}${sep}api_key=${key}`);
  if (!r.ok) return null;
  return r.json();
}

function parseProviders(data) {
  const us = data?.["watch/providers"]?.results?.US || {};
  return [...new Set([
    ...(us.flatrate?.map(p => p.provider_name) || []),
    ...(us.ads?.map(p => p.provider_name) || []),
    ...(us.free?.map(p => p.provider_name) || []),
  ])].slice(0, 5);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { title = "", type = "tv", tmdbId = "", podcastId = "" } = req.query;
  const key = process.env.TMDB_API_KEY;
  if (!key) return res.status(500).json({ error: "API not configured" });

  // ── Podcast lookup via iTunes ────────────────────────────────────────────
  if (type === "podcast") {
    if (!title.trim()) return res.status(400).json({ error: "title required" });
    const t = encodeURIComponent(title.trim());
    try {
      const r = await fetch(`https://itunes.apple.com/search?term=${t}&media=podcast&limit=5`);
      if (!r.ok) return res.status(200).json({ found: false });
      const d = await r.json();
      if (!d.results?.length) return res.status(200).json({ found: false });
      const candidates = d.results.map(p => ({
        type: "podcast",
        title: p.collectionName,
        author: p.artistName,
        cover: p.artworkUrl600 || p.artworkUrl100 || null,
        totalEpisodes: p.trackCount || null,
        year: p.releaseDate ? String(new Date(p.releaseDate).getFullYear()) : null,
        whereToWatch: ["Apple Podcasts"],
        podcastId: String(p.collectionId),
        description: p.genres?.join(", ") || null,
      }));
      if (candidates.length === 1) return res.status(200).json({ found: true, ...candidates[0] });
      return res.status(200).json({ found: true, candidates });
    } catch { return res.status(200).json({ found: false }); }
  }

  // ── Season episodes by TMDB id ──────────────────────────────────────────
  const { fetchSeason = "" } = req.query;
  if (tmdbId && fetchSeason) {
    const mediaType = type === "film" ? "movie" : "tv";
    try {
      const data = await tmdbFetch(`/${mediaType}/${tmdbId}/season/${fetchSeason}`, key);
      if (!data?.episodes) return res.status(200).json({ found: false });
      const episodes = data.episodes.map(ep => ({
        number: ep.episode_number,
        season: ep.season_number,
        name: ep.name,
        overview: ep.overview || null,
        runtime: ep.runtime || null,
        airDate: ep.air_date || null,
      }));
      return res.status(200).json({ found: true, episodes });
    } catch { return res.status(200).json({ found: false }); }
  }

  // ── Full details by TMDB id ──────────────────────────────────────────────
  if (tmdbId) {
    const mediaType = type === "film" ? "movie" : "tv";
    try {
      const data = await tmdbFetch(`/${mediaType}/${tmdbId}?append_to_response=watch/providers`, key);
      if (!data) return res.status(200).json({ found: false });
      const whereToWatch = parseProviders(data);
      const base = {
        found: true, type, tmdbId: data.id,
        title: data.name || data.title,
        description: data.overview || null,
        cover: posterUrl(data.poster_path),
        year: firstYear(data.first_air_date || data.release_date),
        genres: data.genres?.slice(0, 3).map(g => g.name) || [],
        whereToWatch,
      };
      if (mediaType === "tv") {
        return res.status(200).json({ ...base, seasons: data.number_of_seasons || null, totalEpisodes: data.number_of_episodes || null, episodeRuntime: data.episode_run_time?.[0] || null });
      }
      return res.status(200).json({ ...base, totalRuntime: data.runtime || null });
    } catch { return res.status(200).json({ found: false }); }
  }

  // ── Search ───────────────────────────────────────────────────────────────
  if (!title.trim()) return res.status(400).json({ error: "title required" });
  const mediaType = type === "film" ? "movie" : "tv";
  const t = encodeURIComponent(title.trim());
  try {
    const data = await tmdbFetch(`/search/${mediaType}?query=${t}&limit=5`, key);
    if (!data?.results?.length) return res.status(200).json({ found: false });

    const results = data.results.slice(0, 5);

    // Single result → fetch full details
    if (results.length === 1) {
      const full = await tmdbFetch(`/${mediaType}/${results[0].id}?append_to_response=watch/providers`, key);
      if (!full) return res.status(200).json({ found: false });
      const whereToWatch = parseProviders(full);
      const base = { found: true, type, tmdbId: full.id, title: full.name || full.title, description: full.overview || null, cover: posterUrl(full.poster_path), year: firstYear(full.first_air_date || full.release_date), genres: full.genres?.slice(0, 3).map(g => g.name) || [], whereToWatch };
      if (mediaType === "tv") return res.status(200).json({ ...base, seasons: full.number_of_seasons || null, totalEpisodes: full.number_of_episodes || null, episodeRuntime: full.episode_run_time?.[0] || null });
      return res.status(200).json({ ...base, totalRuntime: full.runtime || null });
    }

    // Multiple → return candidates for picker
    const candidates = results.map(s => ({
      type, tmdbId: s.id,
      title: s.name || s.title,
      description: s.overview ? s.overview.slice(0, 180) : null,
      cover: posterUrl(s.poster_path),
      year: firstYear(s.first_air_date || s.release_date),
    }));
    return res.status(200).json({ found: true, candidates });
  } catch { return res.status(200).json({ found: false }); }
}
