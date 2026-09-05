import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const UA = "BookBrainApp/1.0 (mybookbrain.com; contact@mybookbrain.com)";

export default defineConfig({
  plugins: [
    react(),
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
});
