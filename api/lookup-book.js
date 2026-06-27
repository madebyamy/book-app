const UA = "BookBrainApp/1.0 (mybookbrain.com; contact@mybookbrain.com)";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { title = "", author = "" } = req.query;
  if (!title.trim()) return res.status(400).json({ error: "title required" });

  const t = encodeURIComponent(title.trim());
  const a = encodeURIComponent(author.trim());

  // Search Open Library — with author first, then title-only as fallback
  let olDoc = null;
  try {
    const url = author.trim()
      ? `https://openlibrary.org/search.json?title=${t}&author=${a}&limit=5&fields=key,title,author_name,number_of_pages_median,cover_i,first_publish_year`
      : `https://openlibrary.org/search.json?title=${t}&limit=5&fields=key,title,author_name,number_of_pages_median,cover_i,first_publish_year`;
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.ok) {
      const d = await r.json();
      olDoc = d.docs?.[0] || null;
    }
    // If author+title returned nothing, try title alone
    if (!olDoc && author.trim()) {
      const r2 = await fetch(
        `https://openlibrary.org/search.json?title=${t}&limit=5&fields=key,title,author_name,number_of_pages_median,cover_i,first_publish_year`,
        { headers: { "User-Agent": UA } }
      );
      if (r2.ok) {
        const d2 = await r2.json();
        olDoc = d2.docs?.[0] || null;
      }
    }
  } catch {}

  if (!olDoc) {
    return res.status(200).json({ found: false });
  }

  let cover = olDoc.cover_i ? `https://covers.openlibrary.org/b/id/${olDoc.cover_i}-M.jpg` : null;

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

  return res.status(200).json({
    found: true,
    title: olDoc.title || title.trim(),
    author: olDoc.author_name?.[0] || null,
    pages: olDoc.number_of_pages_median || null,
    year: olDoc.first_publish_year ? String(olDoc.first_publish_year) : null,
    cover,
    desc,
    workId: olDoc.key || null,
  });
}
