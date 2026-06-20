# Book Dashboard

A standalone React app — book summaries, a reading tracker, a "want to read"
bookshelf, and an AI chat companion per book.

This was extracted from a Claude artifact. It's structured so you (or Claude
Code) can keep developing it locally, push it to GitHub, and deploy it
without losing any saved data — which the artifact version couldn't
guarantee across edits.

## Run it locally

```bash
npm install
npm run dev
```

Opens at http://localhost:5173. Works immediately — no backend required
for the core app (book summaries, tracker, quotes, bookshelf). Data saves
to your browser's localStorage.

## What's NOT wired up yet

**The "Down the rabbit hole" chat feature** (per-book AI chat with web
search) needs a backend, because a real Anthropic API key can never live
in client-side code. See `/server/chat-example.js` for a starting point —
deploy it as a serverless function (Vercel or Netlify both work well),
then set `VITE_CHAT_ENDPOINT` in a `.env` file to that function's URL.
Until that's set, the chat UI will show a clear message instead of failing
silently.

## Current data storage: localStorage (single device only)

`src/storage.js` currently backs all persistence with `localStorage` — this
means your data only lives in one browser, on one device. That's the
*same* limitation the original artifact had, just without the artifact's
versioning fragility.

### Next step: real cross-device storage

To get data syncing across devices, the cleanest free option is
[Supabase](https://supabase.com) (a free hosted Postgres database with a
simple JS client):

1. Create a free Supabase project.
2. Add one table:
   ```sql
   create table storage (
     key text primary key,
     value text
   );
   ```
3. Install the client: `npm install @supabase/supabase-js`
4. Rewrite the four functions in `src/storage.js` (`get`, `set`, `delete`,
   `list`) to call Supabase instead of `localStorage`. The function
   signatures stay identical — nothing else in the app needs to change,
   since every component already goes through `storage.get(...)` /
   `storage.set(...)`.

This is a good task to hand directly to Claude Code: "rewrite
src/storage.js to use Supabase instead of localStorage, keeping the same
get/set/delete/list interface."

## Deploying

Once pushed to GitHub:

- **Vercel**: import the repo at vercel.com/new — it auto-detects Vite,
  no config needed. Add `VITE_CHAT_ENDPOINT` (and any Supabase keys, once
  added) under Project Settings → Environment Variables.
- **Netlify**: same idea via app.netlify.com — build command `npm run
  build`, publish directory `dist`.

Every `git push` after that auto-redeploys. Your data (once on Supabase)
lives independently of deploys, so code changes never risk losing it.

## Project structure

```
src/
  App.jsx        — the whole app (book data, all components)
  storage.js     — persistence layer (localStorage now, swap for real DB)
  main.jsx       — React entry point
server/
  chat-example.js — starter serverless function for the AI chat feature
```
