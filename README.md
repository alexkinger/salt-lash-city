# Salt Lash City

Marketing site for [saltlashcity.com](https://saltlashcity.com).

## Stack

| Piece | Choice | Why |
|-------|--------|-----|
| Frontend hosting | **Vercel** (Hobby free) | Vite/React deploy + serverless API |
| Database | **Supabase** (free tier) | Postgres for lead storage |
| Email | **Resend** (free: 3,000/mo, 100/day) | Transactional lead + auto-reply |
| Bot protection | **Cloudflare Turnstile** (free) | Low-friction captcha |

Designs/Figma can land later — routes, layout, and form wiring are already in place.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The contact API runs on Vercel. Locally, either:

1. `npx vercel dev` (recommended once env vars are set), or  
2. Use `npm run dev` for UI only until you connect services.

## One-time service setup

### 1. Supabase
1. Create a project.
2. Run [`supabase/migrations/001_leads.sql`](supabase/migrations/001_leads.sql) in the SQL editor.
3. Copy **Project URL** → `SUPABASE_URL`
4. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server only)

### 2. Resend
1. Create an account at [resend.com](https://resend.com).
2. Create an API key → `RESEND_API_KEY`
3. Until your domain is verified, keep `LEAD_FROM_EMAIL=Salt Lash City <onboarding@resend.dev>`
4. Set `LEAD_NOTIFICATION_EMAIL` to the salon inbox (comma-separated for multiple)

### 3. Cloudflare Turnstile
1. Add a site in the [Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile).
2. Add hostnames: `localhost`, your Vercel preview domain, and `saltlashcity.com` / `www`.
3. Site key → `VITE_TURNSTILE_SITE_KEY`
4. Secret key → `TURNSTILE_SECRET_KEY`

### 4. Vercel
1. Import this GitHub repo.
2. Add the env vars from `.env.example` (production + preview).
3. Deploy. Custom domain: `saltlashcity.com`.

## Project map

```
api/contact.ts          Lead intake (Turnstile → Supabase → Resend)
src/pages/              Site routes (placeholder content)
src/components/         Layout, header/footer, contact form, Turnstile
src/data/               Services + FAQs (easy to edit before CMS)
supabase/migrations/    Database schema
```

## Reviews (Google + Vagaro)

Combined review feed lives in `public/data/reviews.json` and renders through `ReviewsWidget` (semantic HTML + JSON-LD).

```bash
# Refresh Google reviews (needs Places API key + Place ID)
# Optional: refresh Vagaro via headless browser
set GOOGLE_PLACES_API_KEY=...
set GOOGLE_PLACE_ID=...
set VAGARO_SYNC=1
npm run sync:reviews
```

Notes:
- Google Places returns ~5 newest reviews officially.
- Vagaro has no public reviews API; sync parses their public listing with Playwright when `VAGARO_SYNC=1`.
- Redeploy after sync so Hostinger staging/production gets the updated JSON.

## Scripts

- `npm run dev` — Vite dev server
- `npm run sync:reviews` — refresh Google/Vagaro review feed
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — oxlint
