// Vercel serverless function — calls Anthropic API server-side
// so the API key never reaches the browser.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured in Vercel environment variables" });
  }

  const { title, author } = req.body || {};
  if (!title || !author) {
    return res.status(400).json({ error: "title and author are required" });
  }

  // ── Step 1: fetch description from Google Books ─────────────────────────
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
    // description stays empty — Claude will work from title/author alone
  }

  // ── Step 2: call Claude to generate structured analysis ──────────────────
  const prompt = `You are a literary analyst creating structured reading journal entries.

Given the book below, return ONLY a valid JSON object — no markdown, no explanation, just the raw JSON. Use the schema exactly as shown.

Schema:
{
  "tagline": "1–2 compelling sentences capturing the book's core hook or proposition",
  "thread": "2–3 sentences on the book's central argument, what question it answers and how",
  "keyLines": [
    "memorable paraphrased idea or principle from the book (aim for 4–5 items)",
    "each should stand alone as a striking, quotable insight"
  ],
  "nodes": [
    {
      "tag": "short label like 'Part One', 'Rule One', 'Key Idea', or chapter name",
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
    "meta": "date, place, or context if known — otherwise leave blank",
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

  let anthropicRes;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
    return res.status(502).json({ error: "Failed to reach Anthropic API", detail: String(err) });
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    return res.status(502).json({ error: "Anthropic API error", detail: errText });
  }

  const anthropicData = await anthropicRes.json();
  const raw = anthropicData.content?.[0]?.text || "";

  // Strip markdown fences if Claude wrapped the JSON
  const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();

  let analysis;
  try {
    analysis = JSON.parse(jsonText);
  } catch {
    return res.status(502).json({ error: "Could not parse JSON from Claude response", raw });
  }

  // Also return the Google Books description so the client can display it
  return res.status(200).json({ ...analysis, description });
}
