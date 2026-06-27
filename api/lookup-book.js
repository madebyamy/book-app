export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { title = "", author = "" } = req.query;
  if (!title.trim()) return res.status(400).json({ error: "title required" });

  const t = encodeURIComponent(title.trim());
  const a = encodeURIComponent(author.trim());

  const [olRes, gbRes] = await Promise.allSettled([
    fetch(
      `https://openlibrary.org/search.json?title=${t}&author=${a}&limit=5&fields=key,title,author_name,number_of_pages_median,cover_i,first_publish_year`
    ),
    fetch(
      `https://www.googleapis.com/books/v1/volumes?q=intitle:${t}${a ? `+inauthor:${a}` : ""}&maxResults=5&langRestrict=en`
    ),
  ]);

  let olDoc = null;
  if (olRes.status === "fulfilled" && olRes.value.ok) {
    const d = await olRes.value.json();
    olDoc = d.docs?.[0] || null;
  }

  let gbItem = null;
  if (gbRes.status === "fulfilled" && gbRes.value.ok) {
    const d = await gbRes.value.json();
    const items = d.items || [];
    const withDesc = items.filter((i) => i.volumeInfo?.description);
    gbItem = (withDesc[0] || items[0])?.volumeInfo || null;
  }

  if (!olDoc && !gbItem) {
    return res.status(200).json({ found: false });
  }

  let cover = null;
  if (gbItem) {
    const thumb = gbItem.imageLinks?.thumbnail || gbItem.imageLinks?.smallThumbnail;
    if (thumb) cover = thumb.replace("http://", "https://");
  }
  if (!cover && olDoc?.cover_i) cover = `https://covers.openlibrary.org/b/id/${olDoc.cover_i}-M.jpg`;

  let desc = gbItem?.description ? gbItem.description.replace(/<[^>]+>/g, "").trim().slice(0, 600) : "";
  let workId = olDoc?.key || null;

  if (!desc && workId) {
    try {
      const workRes = await fetch(`https://openlibrary.org${workId}.json`);
      const work = await workRes.json();
      const raw = typeof work.description === "string" ? work.description : work.description?.value || "";
      desc = raw.replace(/\[.*?\]/g, "").trim().slice(0, 600);
    } catch {}
  }

  return res.status(200).json({
    found: true,
    title: gbItem?.title || olDoc?.title || title.trim(),
    author: gbItem?.authors?.[0] || olDoc?.author_name?.[0] || null,
    pages: gbItem?.pageCount || olDoc?.number_of_pages_median || null,
    year: gbItem?.publishedDate?.slice(0, 4) || (olDoc?.first_publish_year ? String(olDoc.first_publish_year) : null),
    cover,
    desc,
    workId,
  });
}
