import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const UA = "BookBrainApp/1.0 (mybookbrain.com; contact@mybookbrain.com)";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG  = "https://image.tmdb.org/t/p/w500";

function posterUrl(path) { return path ? `${TMDB_IMG}${path}` : null; }
function firstYear(d) { return d ? d.slice(0,4) : null; }
function parseProviders(data) {
  const us = data?.["watch/providers"]?.results?.US || {};
  return [...new Set([...(us.flatrate?.map(p=>p.provider_name)||[]),...(us.ads?.map(p=>p.provider_name)||[]),...(us.free?.map(p=>p.provider_name)||[])])].slice(0,5);
}
async function tmdbGet(path, key) {
  const sep = path.includes("?") ? "&" : "?";
  const r = await fetch(`${TMDB_BASE}${path}${sep}api_key=${key}`);
  return r.ok ? r.json() : null;
}

export default defineConfig(({ mode }) => {
const env = loadEnv(mode, process.cwd(), '');
return {
  plugins: [
    react(),
    {
      name: "api-lookup-show",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/api/lookup-show")) return next();
          const url = new URL(req.url, "http://localhost");
          const title = url.searchParams.get("title") || "";
          const type  = url.searchParams.get("type") || "tv";
          const tmdbId = url.searchParams.get("tmdbId") || "";
          const key = env.TMDB_API_KEY;
          const reply = (obj) => { res.writeHead(200, {"Content-Type":"application/json"}); res.end(JSON.stringify(obj)); };

          if (!key) return reply({ found: false, error: "TMDB_API_KEY not set in .env" });

          // Season episodes
          const fetchSeason = url.searchParams.get("fetchSeason") || "";
          if (tmdbId && fetchSeason) {
            const mediaType = type === "film" ? "movie" : "tv";
            try {
              const data = await tmdbGet(`/${mediaType}/${tmdbId}/season/${fetchSeason}`, key);
              if (!data?.episodes) return reply({ found:false });
              const episodes = data.episodes.map(ep => ({ number:ep.episode_number, season:ep.season_number, name:ep.name, overview:ep.overview||null, runtime:ep.runtime||null, airDate:ep.air_date||null }));
              return reply({ found:true, episodes });
            } catch { return reply({ found:false }); }
          }

          if (type === "podcast") {
            if (!title.trim()) return reply({ error: "title required" });
            try {
              const t = encodeURIComponent(title.trim());
              const r = await fetch(`https://itunes.apple.com/search?term=${t}&media=podcast&limit=5`);
              const d = r.ok ? await r.json() : null;
              if (!d?.results?.length) return reply({ found: false });
              const candidates = d.results.map(p => ({ type:"podcast", title:p.collectionName, author:p.artistName, cover:p.artworkUrl600||p.artworkUrl100||null, totalEpisodes:p.trackCount||null, year:p.releaseDate?String(new Date(p.releaseDate).getFullYear()):null, whereToWatch:["Apple Podcasts"], podcastId:String(p.collectionId), description:p.genres?.join(", ")||null }));
              if (candidates.length === 1) return reply({ found:true, ...candidates[0] });
              return reply({ found:true, candidates });
            } catch { return reply({ found:false }); }
          }

          if (tmdbId) {
            const mediaType = type === "film" ? "movie" : "tv";
            try {
              const data = await tmdbGet(`/${mediaType}/${tmdbId}?append_to_response=watch/providers`, key);
              if (!data) return reply({ found:false });
              const where = parseProviders(data);
              const base = { found:true, type, tmdbId:data.id, title:data.name||data.title, description:data.overview||null, cover:posterUrl(data.poster_path), year:firstYear(data.first_air_date||data.release_date), genres:data.genres?.slice(0,3).map(g=>g.name)||[], whereToWatch:where };
              if (mediaType === "tv") return reply({ ...base, seasons:data.number_of_seasons||null, totalEpisodes:data.number_of_episodes||null, episodeRuntime:data.episode_run_time?.[0]||null });
              return reply({ ...base, totalRuntime:data.runtime||null });
            } catch { return reply({ found:false }); }
          }

          if (!title.trim()) return reply({ error:"title required" });
          const mediaType = type === "film" ? "movie" : "tv";
          const t = encodeURIComponent(title.trim());
          try {
            const data = await tmdbGet(`/search/${mediaType}?query=${t}&limit=5`, key);
            if (!data?.results?.length) return reply({ found:false });
            const results = data.results.slice(0,5);
            if (results.length === 1) {
              const full = await tmdbGet(`/${mediaType}/${results[0].id}?append_to_response=watch/providers`, key);
              if (!full) return reply({ found:false });
              const where = parseProviders(full);
              const base = { found:true, type, tmdbId:full.id, title:full.name||full.title, description:full.overview||null, cover:posterUrl(full.poster_path), year:firstYear(full.first_air_date||full.release_date), genres:full.genres?.slice(0,3).map(g=>g.name)||[], whereToWatch:where };
              if (mediaType==="tv") return reply({ ...base, seasons:full.number_of_seasons||null, totalEpisodes:full.number_of_episodes||null, episodeRuntime:full.episode_run_time?.[0]||null });
              return reply({ ...base, totalRuntime:full.runtime||null });
            }
            const candidates = results.map(s => ({ type, tmdbId:s.id, title:s.name||s.title, description:s.overview?s.overview.slice(0,180):null, cover:posterUrl(s.poster_path), year:firstYear(s.first_air_date||s.release_date) }));
            return reply({ found:true, candidates });
          } catch { return reply({ found:false }); }
        });
      },
    },
    {
      name: "api-lookup-book",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/api/lookup-book")) return next();
          const url = new URL(req.url, "http://localhost");
          const title = url.searchParams.get("title") || "";
          const author = url.searchParams.get("author") || "";
          if (!title.trim()) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "title required" }));
          }
          const t = encodeURIComponent(title.trim());
          const a = encodeURIComponent(author.trim());
          let olDoc = null;
          try {
            const olUrl = author.trim()
              ? `https://openlibrary.org/search.json?title=${t}&author=${a}&limit=5&fields=key,title,author_name,number_of_pages_median,cover_i,first_publish_year`
              : `https://openlibrary.org/search.json?title=${t}&limit=5&fields=key,title,author_name,number_of_pages_median,cover_i,first_publish_year`;
            const r = await fetch(olUrl, { headers: { "User-Agent": UA } });
            if (r.ok) { const d = await r.json(); olDoc = d.docs?.[0] || null; }
            if (!olDoc && author.trim()) {
              const r2 = await fetch(`https://openlibrary.org/search.json?title=${t}&limit=5&fields=key,title,author_name,number_of_pages_median,cover_i,first_publish_year`, { headers: { "User-Agent": UA } });
              if (r2.ok) { const d2 = await r2.json(); olDoc = d2.docs?.[0] || null; }
            }
          } catch {}
          if (!olDoc) {
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ found: false }));
          }
          const cover = olDoc.cover_i ? `https://covers.openlibrary.org/b/id/${olDoc.cover_i}-M.jpg` : null;
          let desc = "";
          if (olDoc.key) {
            try {
              const workRes = await fetch(`https://openlibrary.org${olDoc.key}.json`, { headers: { "User-Agent": UA } });
              if (workRes.ok) {
                const work = await workRes.json();
                const raw = typeof work.description === "string" ? work.description : work.description?.value || "";
                desc = raw.replace(/\[.*?\]/g, "").trim().slice(0, 600);
              }
            } catch {}
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            found: true,
            title: olDoc.title || title.trim(),
            author: olDoc.author_name?.[0] || null,
            pages: olDoc.number_of_pages_median || null,
            year: olDoc.first_publish_year ? String(olDoc.first_publish_year) : null,
            cover,
            desc,
            workId: olDoc.key || null,
          }));
        });
      },
    },
  ],
};
});
