# Salt Lash City

Marketing site for [saltlashcity.com](https://saltlashcity.com).

## Stack

| Piece | Choice | Why |
|-------|--------|-----|
| Frontend hosting | **Hostinger static** | Vite/React SPA |
| Backend / CMS | **Firebase** (Auth, Firestore, Storage, Cloud Functions) | Admin login + dynamic content |
| Email | **Resend** | Lead notification + auto-reply |
| Bot protection | **Cloudflare Turnstile** | Low-friction captcha |

Admin UI lives at **`/admin`**. Firebase project should use **Blaze** (pay-as-you-go with free allowance) so the `contact` Cloud Function can call Resend.

## Local setup

```bash
npm install
cp .env.example .env.local
# Fill VITE_FIREBASE_* (and Turnstile if using the form)
npm run dev
```

Without Firebase env vars the public site still renders from static `src/data` + `public/data/reviews.json` fallbacks. Admin login requires Firebase.

## Firebase go-live

1. Create a Firebase project (Salt Lash City Google account — not shared with other orgs).
2. Enable **Authentication → Email/Password**, **Firestore**, **Storage**.
3. Upgrade to **Blaze** and set a [budget alert](https://console.cloud.google.com/billing/budgets).
4. Copy web app config into `.env.local` (`VITE_FIREBASE_*`).
5. Deploy rules + function:

```bash
npx firebase login
npx firebase use YOUR_PROJECT_ID
npx firebase deploy --only firestore:rules,storage,functions
```

6. Set function secrets:

```bash
npx firebase functions:secrets:set TURNSTILE_SECRET_KEY
npx firebase functions:secrets:set RESEND_API_KEY
npx firebase functions:secrets:set LEAD_NOTIFICATION_EMAIL
npx firebase functions:secrets:set LEAD_FROM_EMAIL
```

7. Set `VITE_CONTACT_FUNCTION_URL` to the deployed URL, e.g.  
   `https://us-west1-YOUR_PROJECT_ID.cloudfunctions.net/contact`

8. Create Auth users (Blake + you) in Authentication → Users (no public signup UI).
9. Download a service account JSON as `serviceAccountKey.json` in the repo root (gitignored), then:

```bash
npm run firebase:seed
npm run firebase:set-admin -- blake@example.com
npm run firebase:set-admin -- you@example.com
```

10. `npm run build` and deploy `dist/` to Hostinger.
11. Smoke-test `/admin/login`, edit settings → public site, submit contact form → lead + email.

### Resend

1. API key → function secret `RESEND_API_KEY`
2. Until domain verified: `LEAD_FROM_EMAIL=Salt Lash City <onboarding@resend.dev>`
3. `LEAD_NOTIFICATION_EMAIL` = salon inbox (comma-separated OK)

### Cloudflare Turnstile

1. Add site in the [Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile).
2. Hostnames: `localhost`, Hostinger staging, `saltlashcity.com` / `www`.
3. Site key → `VITE_TURNSTILE_SITE_KEY`
4. Secret → function secret `TURNSTILE_SECRET_KEY`

## Project map

```
src/pages/admin/        Admin SPA (leads, services, settings, reviews, media)
src/hooks/              Auth + CMS hooks (Firebase)
src/lib/firebase.ts     Browser Firebase app
functions/              Cloud Function `contact`
firestore.rules         Public read / admin write
storage.rules           Public read / admin write
scripts/firebase-seed.mjs
scripts/set-admin-claim.mjs
src/data/               Static fallbacks when Firebase unset
```

## Reviews (Google + Vagaro)

```bash
npm run sync:reviews
```

Then either re-run `npm run firebase:seed` or curate rows in `/admin/reviews`.

## Scripts

- `npm run dev` — Vite
- `npm run build` — production build
- `npm run firebase:seed` — seed Firestore from site + reviews JSON
- `npm run firebase:set-admin -- email` — grant admin custom claim
- `npm run sync:reviews` — refresh Google/Vagaro JSON feed
- `npm run lint` — oxlint
