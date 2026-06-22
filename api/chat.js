export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not set in Vercel environment variables." });

  const { system, messages } = req.body || {};
  if (!messages || !messages.length) return res.status(400).json({ error: "messages are required" });

  // Convert to Gemini format — roles are "user" and "model" (not "assistant")
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  let geminiRes;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          system_instruction: system ? { parts: [{ text: system }] } : undefined,
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
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

  const data = await geminiRes.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I wasn't able to generate a response.";
  return res.status(200).json({ reply: text });
}
