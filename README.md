# MyQuinceAños v2 — Next.js + Supabase

## Stack
- **Next.js 14** (App Router)
- **Supabase** (Postgres + Auth + Storage)
- **Tailwind CSS**
- **TypeScript**
- **Vercel** (hosting)

---

## One-Shot Deploy Instructions

### Step 1 — Fill in your secret key
Open `.env.local` and paste your Supabase secret key:
```
SUPABASE_SECRET_KEY=sb_secret_U6bmq...
```
(Click the eye icon in Supabase → Settings → API Keys → Secret keys)

### Step 2 — Install and run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000 — you should see the homepage.

### Step 3 — Push to GitHub
```bash
git init
git add .
git commit -m "MyQuinceAños v2 initial build"
git remote add origin https://github.com/YOUR_USERNAME/myquinceanos-v2.git
git push -u origin main
```

### Step 4 — Deploy to Vercel
1. Go to vercel.com → New Project → Import from GitHub
2. Select `myquinceanos-v2`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://henylbmrhtccjofutjav.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = `sb_publishable_EYeEZxRMEMSwwf5HjMP9UA__fv1iQlR`
   - `SUPABASE_SECRET_KEY` = your secret key
4. Click Deploy

### Step 5 — Add subdomain in GoDaddy
In GoDaddy DNS for myquinceanos.com, add:
- Type: `CNAME`
- Name: `beta`
- Value: `cname.vercel-dns.com`
- TTL: 600

Then in Vercel → Project → Settings → Domains → Add `beta.myquinceanos.com`

---

## Pages Built

| Route | Description |
|---|---|
| `/` | Homepage — hero, budget slider, carousel, categories, reviews |
| `/planning` | Planning Hub — checklist + vendor linking + payment tracker + countdown |
| `/vendors` | Vendor browse with filters |
| `/vendors/[slug]` | Individual vendor profile |
| `/events` | Events page — expos, open houses |
| `/get-listed` | Zero-friction 2-step vendor signup (connects to Supabase) |
| `/vendor-pricing` | Pricing tiers + FAQ |
| `/auth/callback` | Supabase auth redirect handler |

## Next to Build (Phase 2)
- Mom auth (login/signup pages)
- Vendor dashboard (edit profile, upload photos, view leads)
- Admin review moderation panel
- Square payment integration for subscriptions
- Real vendor data from Supabase (replace mock data)

---

## Subdomain Strategy
```
myquinceanos.com        → WordPress (live, untouched)
beta.myquinceanos.com   → This Next.js build
```
Swap DNS when ready to go live.
