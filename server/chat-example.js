// server/chat-example.js
//
// Example of a minimal serverless backend route for the "Down the rabbit
// hole" chat feature. This is NOT wired up automatically — it's a starting
// point for Claude Code to adapt to whatever host you deploy to.
//
// Why this exists: the React app cannot call api.anthropic.com directly
// with a real API key, because any key embedded in client-side code is
// publicly visible to anyone who opens dev tools. The fix is always the
// same shape: the browser calls YOUR server, your server (which holds the
// secret key in an environment variable, never in committed code) calls
// Anthropic, and forwards the result back.
//
// DEPLOYMENT NOTES:
// - On Vercel: save this as /api/chat.js at the project root (Vercel's
//   convention), and it becomes available at https://yourapp.vercel.app/api/chat
// - On Netlify: save as /netlify/functions/chat.js with Netlify's handler
//   signature instead of this Vercel-style export.
// - Either way: set ANTHROPIC_API_KEY as an environment variable in your
//   hosting provider's dashboard — never commit it to the repo.
// - Then set VITE_CHAT_ENDPOINT in your frontend's .env to the deployed
//   function's URL (e.g. https://yourapp.vercel.app/api/chat).

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { system, messages } = req.body;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system,
        messages,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to reach Anthropic API" });
  }
}
