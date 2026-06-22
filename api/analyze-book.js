// Vercel serverless function — calls Google Gemini API server-side
// so the API key never reaches the browser.
// Free key: aistudio.google.com → "Get API key" (no credit card needed)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY not set. Add it in Vercel → Settings → Environment Variables.",
    });
  }

  const { title, author } = req.body || {};
  if (!title || !author) {
    return res.status(400).json({ error: "title and author are required" });
  }

  // ── Step 1: fetch description from Google Books (free, no key needed) ────
  let description = "";
  try {
    const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}&maxResults=3&langRestrict=en`;
    const gbRes = await fetch(gbUrl);
    const gbData = await gbRes.json();
    const candidates = (gbData.items || [])
      .map((item) => item.volumeInfo?.description || "")
      .filter(Boolean);
    description = candidates[0] || "";
  } catch {
    // Claude/Gemini will work from title + author alone if this fails
  }

  // ── Step 2: call Gemini to generate structured analysis ──────────────────
  const prompt = `You are a literary analyst creating structured reading journal entries.

Given the book below, return ONLY a valid JSON object — no markdown, no code fences, no explanation. Just the raw JSON.

Use this exact schema:
{
  "tagline": "1–2 compelling sentences capturing the book's core hook or proposition",
  "thread": "2–3 sentences on the central argument — what question does the book answer, and how",
  "keyLines": [
    "memorable paraphrased idea or principle from the book",
    "each should stand alone as a striking insight — aim for 4–5 items"
  ],
  "nodes": [
    {
      "tag": "short label like 'Part One', 'Rule One', or 'Key Idea'",
      "title": "name of this concept or section",
      "dek": "one sentence summarizing what this idea argues",
      "points": [
        "a specific example, case study, or sub-point that supports the idea",
        "aim for 2–4 points per node"
      ]
    }
  ],
  "caseFile": {
    "tag": "Highlighted story · [section or chapter name]",
    "meta": "date, place, or context if known — otherwise leave empty string",
    "title": "name of the key story, case study, or example",
    "story": [
      "paragraph 1 — set up the story",
      "paragraph 2 — what happened and what it revealed"
    ],
    "argument": "one sentence: why this story is the book's load-bearing example"
  }
}

Book: "${title}" by ${author}
${description ? `\nPublisher description:\n${description}` : ""}

Return only the JSON object.`;

  let geminiRes;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
        }),
      }
    );
  } catch (err) {
    return res.status(502).json({ error: "Failed to reach Gemini API", detail: String(err) });
  }

  if (!geminiRes.ok) {
    const errText = await geminiRes.text();
    return res.status(502).json({ error: "Gemini API error", detail: errText });
  }

  const geminiData = await geminiRes.json();
  const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Strip markdown fences if Gemini wrapped the JSON
  const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/m, "").trim();

  let analysis;
  try {
    analysis = JSON.parse(jsonText);
  } catch {
    return res.status(502).json({ error: "Could not parse JSON from Gemini response", raw });
  }

  return res.status(200).json({ ...analysis, description });
}
