const UA = "BookBrainApp/1.0 (mybookbrain.com; contact@mybookbrain.com)";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { title = "", author = "" } = req.query;
  if (!title.trim()) return res.status(400).json({ error: "title required" });

  const t = encodeURIComponent(title.trim());
  const a = encodeURIComponent(author.trim());
  const fields = "key,title,author_name,number_of_pages_median,cover_i,first_publish_year";

  let docs = [];
  try {
    const url = author.trim()
      ? `https://openlibrary.org/search.json?title=${t}&author=${a}&limit=5&fields=${fields}`
      : `https://openlibrary.org/search.json?title=${t}&limit=5&fields=${fields}`;
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    if (r.ok) {
      const d = await r.json();
      docs = d.docs || [];
    }
    // If author+title returned nothing, try title alone
    if (docs.length === 0 && author.trim()) {
      const r2 = await fetch(
        `https://openlibrary.org/search.json?title=${t}&limit=5&fields=${fields}`,
        { headers: { "User-Agent": UA } }
      );
      if (r2.ok) {
        const d2 = await r2.json();
        docs = d2.docs || [];
      }
    }
  } catch {}

  if (docs.length === 0) {
    return res.status(200).json({ found: false });
  }

  // When author was provided (or only one result), return the best single match with full description
  const returnSingle = author.trim() || docs.length === 1;

  if (returnSingle) {
    const olDoc = docs[0];
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

  // No author — return up to 5 candidates for the user to pick from
  const candidates = docs.slice(0, 5).map((doc) => ({
    title: doc.title || title.trim(),
    author: doc.author_name?.[0] || null,
    pages: doc.number_of_pages_median || null,
    year: doc.first_publish_year ? String(doc.first_publish_year) : null,
    cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
    workId: doc.key || null,
  }));

  return res.status(200).json({ found: true, candidates });
}
