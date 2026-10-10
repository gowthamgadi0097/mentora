# Mentora

**Mentora** is an AI mentor for smarter learning, built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Prisma + PostgreSQL** and **NextAuth**.

**Features:** AI tutor chat (streaming) · quiz generator · notes summarizer (PDF/text) · study planner · progress dashboard.
**Look and feel:** 6 colour themes (Aurora, Sunset, Ocean, Forest, Ivory, Rose) and 5 backgrounds (Aurora Mesh, Starfield, Blueprint Grid, Waves, Plain), switchable from the **Appearance** menu in the navbar. Choices are saved in the browser.

## Run locally

```bash
npm install
cp .env.example .env.local     # then fill in the values
npm run db:push                # creates tables in your Postgres database
npm run dev                    # http://localhost:3000
```

Required environment variables:

| Variable | Purpose |
|---|---|
| `AI_PROVIDER` | `anthropic`, `openai` or `gemini` |
| `AI_API_KEY` | Key for that provider (server-side only) |
| `AI_MODEL` | Optional model override |
| `DATABASE_URL` | PostgreSQL connection string (Neon or Supabase free tier works) |
| `NEXTAUTH_SECRET` | Random string: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` locally, your live URL when deployed |

## Deploy

This project is set up for **Vercel** and **Render** only.

### Option A: Vercel

1. Push the project to GitHub.
2. On vercel.com choose **Add New > Project** and import the repo (`vercel.json` is already configured).
3. Add the environment variables above (`NEXTAUTH_URL` = your Vercel URL, e.g. `https://your-app.vercel.app`).
4. Deploy. Every push to `main` redeploys. The build runs `prisma db push` to create the tables.

Note: free-tier serverless functions have time limits, which is why chat is streamed. The built-in rate limiter is in-memory, so for stricter limits on Vercel swap `src/lib/ratelimit.ts` for Upstash (same function signature).

### Option B: Render

1. Push the project to GitHub.
2. On render.com choose **New > Blueprint** and select the repo (it reads `render.yaml`), or create a **Web Service** manually.
   - Build command: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - Start command: `npm start`
3. Fill in `AI_API_KEY`, `DATABASE_URL` and `NEXTAUTH_URL` (your `https://<name>.onrender.com` URL) in the dashboard. `NEXTAUTH_SECRET` is generated for you.
4. Deploy. Free instances sleep when idle, so the first request can be slow.

## Project structure

```
prisma/schema.prisma        User, Note, Quiz, Attempt models
src/app/                    Pages and API routes (chat, quiz, attempts, summarize, planner, auth, register)
src/components/             ChatWindow, QuizCard, FileUpload, ProgressChart, Navbar, ThemePicker, Background
src/lib/                    ai.ts (provider client), prompts.ts, auth.ts, db.ts, ratelimit.ts
src/app/globals.css         Colour themes and animated backgrounds (edit the CSS variables to change colours)
vercel.json  render.yaml    Deployment config for Vercel and Render
```

## Customising colours

Open `src/app/globals.css`. Each theme is a block of RGB values such as `[data-theme="ocean"]`. Add a new block, then add its id to `THEMES` in `src/components/ThemeProvider.tsx`.

## Security notes

- AI keys are only used in `/api/*` routes and never sent to the browser.
- Quiz answers stay on the server until the quiz is submitted.
- Never commit `.env.local` (it is in `.gitignore`).
