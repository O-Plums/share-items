# Sort your life

<p align="center">
  <a href="https://sortyourlife.fr/">
    <img src="public/logo.png" width="120" alt="Sort your life — logo" />
  </a>
</p>

<p align="center">
  <strong>Live at: <a href="https://sortyourlife.fr/">sortyourlife.fr</a></strong>
</p>

<p align="center">
  🇬🇧 English · <a href="./README.fr.md">🇫🇷 Français</a>
</p>

**Sort your life** helps families share out the items of a clear-out, a move, or an inheritance.
You photograph what you're putting up, you share a link, and everyone says yes or no by swiping — Tinder-style.
You see who's interested and you assign each item to the right person.

---

## Product

### The problem

When you're emptying an apartment or sorting out things to give away or sell, coordination usually happens in endless WhatsApp threads: blurry photos, "I want this one" messages, forgotten replies, duplicates. No one has a clear view of who wants what.

### The solution

Sort your life centralizes everything around **shareable lists** and a personal **photo inventory**:

1. **Photograph** items (camera or gallery), classify them by room, type, and personal tags.
2. **Sort** into lists by intent: keep, donate, sell, or other.
3. **Share** the public link of a list (`/l/[slug]`).
4. Your family **swipes** yes / no on each item, no account required.
5. The organizer reviews the **results** and **assigns** (match) each item to one person who said yes.

### Two experiences, two identities

| Role | Login | Where |
|------|-------|-------|
| **Organizer** | Google or Apple account (Auth.js) | `/dashboard/*` — lists, inventory, results, sharing |
| **Voter** | First name only (+ local anonymous identifier) | `/l/[slug]` — swipe, history, received matches |

A single user can organize their own lists with their account and vote on someone else's link via the "voter" flow, without mixing the two.

### Organizer journey (detailed)

**Inventory** (`/dashboard/inventory`)

- 3-step wizard: photo → room (emojis) → type + optional tags + name.
- Thumbnail grid, filters by room / type / tag, multi-select.
- Assign to an existing list or create a new campaign.
- Edit via bottom sheet, custom rooms ("My rooms").

**Lists** (`/dashboard/lists`)

- Suggested kinds: keep, donate, sell, custom.
- List detail: **Items**, **Results**, **Share** tabs.
- Add items from inventory or create directly inside the list.
- Native share (WhatsApp, SMS, mail…) via the Web Share API when available.
- Guided tour (Driver.js) on the first list, optionally chaining into the first-item walkthrough.

**Results & assignment**

- For each item: list of people who voted **Yes** or **No**.
- **Assign** button (match): a single recipient per item, picked among the Yes votes.
- Moving an item to another list or removing it (back to inventory) clears votes and matches for that list.

### Voter journey (detailed)

**Entry** (`/l/[slug]`)

- Enter a first name or "Continue with Google" (optional, to link votes to the account).
- Identity stored locally (`visitorId`) to remember your history.

**Swipe**

- Full-screen cards, one photo at a time.
- Gestures or **Yes** / **No** buttons, progress bar.
- One vote per item, editable later.

**History** (book icon)

- All your votes on the list, edit in one tap or wipe everything.

**Matches** (tab)

- Items the organizer has assigned to you ("This is for you").

### Glossary

| Term | Meaning |
|------|---------|
| **Vote** | Voter's choice: yes or no on an item. |
| **Swipe** | Discovery mode, item by item. |
| **Match** | Organizer's decision: "this item is for this person" (not a mutual like). |
| **Inventory** | Your personal library of all photographed items. |
| **List** | Shareable campaign (slug, votes, matches) — an item belongs to **only one** list at a time. |
| **Personal tag** | Reusable label (e.g. "Florian's office", "basement"). |

### Business rules

- **1 vote** per item per voter (editable).
- **1 match** per item, reserved for a voter who said **Yes**.
- If a voter switches back to **No**, their match on this item is cancelled.
- Moving or removing an item from a list **clears** votes and matches for that list.
- Item without a list: kept in inventory (`listId` null) until assigned.
- Images: Sharp resize (512 px), JPEG ≤ 500 KB; Vercel Blob in production, `public/uploads/` in local dev.

### Cross-cutting features

- **Mobile-first**: bottom navigation, large tap targets, safe areas.
- **i18n**: French by default, English via switcher (next-intl).
- **PWA**: installable on the home screen (Serwist), prompt on the mobile dashboard.
- **Admin** (`/admin`, allowlisted emails): usage stats and charts.

### Out of scope (for now)

- An item in multiple lists at once.
- Payments, auctions, in-app messaging.
- Push notifications ("you've been matched").
- Barcode scan, AI item recognition.

---

## Screenshots

### Creators — building and sharing a list

<p align="center">
  <img src="public/promo/creators/new_list.jpg" width="220" alt="Create a new list" />
  <img src="public/promo/creators/add_first_item.jpg" width="220" alt="Add the first item with a photo" />
  <img src="public/promo/creators/share_link.jpg" width="220" alt="Share the public link of a list" />
</p>
<p align="center"><sub>1. Create a list · 2. Add the first item · 3. Share the link</sub></p>

<p align="center">
  <img src="public/promo/creators/menu.jpg" width="220" alt="All your lists at a glance" />
  <img src="public/promo/creators/see_results_list.jpg" width="220" alt="See who voted yes or no on each item" />
  <img src="public/promo/creators/attribute_results_to_a_match.jpg" width="220" alt="Assign an item to someone who said yes" />
</p>
<p align="center"><sub>4. Browse your lists · 5. See the results · 6. Assign each item to the right person</sub></p>

### Voters — saying yes or no

<p align="center">
  <img src="public/promo/voters/add_name_for_vote.jpg" width="220" alt="Enter a first name to start voting (no account)" />
  <img src="public/promo/voters/tinder_example.jpg" width="220" alt="Tinder-style swipe to say yes or no" />
  <img src="public/promo/voters/see_my_match.jpg" width="220" alt="See the items the organizer assigned to you" />
</p>
<p align="center"><sub>1. Enter your name · 2. Swipe yes or no · 3. See your matches</sub></p>

> Full-resolution captures live in [`public/promo/creators/`](./public/promo/creators/) and [`public/promo/voters/`](./public/promo/voters/).

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS, Framer Motion, Driver.js (onboarding) |
| i18n | next-intl (FR / EN) |
| Database | Prisma + **PostgreSQL** |
| Organizer auth | Auth.js v5 — Google, Apple |
| Images | Sharp · Vercel Blob (prod) · `public/uploads/` (dev) |
| PWA | Serwist |

---

## Run locally

### Requirements

- Node.js 20+
- PostgreSQL (Docker, Neon, Supabase or Postgres.app)

### Install

```bash
git clone https://github.com/O-Plums/sort-your-life.git
cd sort-your-life
npm install
cp .env.example .env
# Edit .env: DATABASE_URL, AUTH_SECRET, AUTH_GOOGLE_* (see below)
npx prisma migrate dev
npm run dev
```

App runs on **http://localhost:8080**.

Without `BLOB_READ_WRITE_TOKEN`, photos are stored in `public/uploads/` (gitignored).

---

## Main routes

### Organizer (signed in)

| Route | Purpose |
|-------|---------|
| `/login` | Google / Apple sign-in |
| `/dashboard/lists` | Lists — create a campaign |
| `/dashboard/[listId]` | Detail: Items · Results · Share |
| `/dashboard/inventory` | Personal inventory |
| `/dashboard/inventory/new` | New item (photo wizard) |
| `/dashboard/[listId]/items/new` | Add an item to a list |

### Voter (public link)

| Route | Purpose |
|-------|---------|
| `/l/[slug]` | Swipe, history, matches, voter account |

### Other

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/admin` | Stats (emails in `ADMIN_EMAILS`) |
| `/legal/cgu` · `/legal/cgv` | Terms of Service · Terms of Sale |

---

## Environment variables

Copy [`.env.example`](./.env.example) to `.env` — **never commit** `.env`.

| Variable | Required | Use |
|----------|----------|-----|
| `DATABASE_URL` | Yes | PostgreSQL |
| `AUTH_SECRET` | Yes | Auth.js session (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Recommended | Organizer + optional voter login |
| `AUTH_APPLE_ID` / `AUTH_APPLE_SECRET` | Optional | Sign in with Apple |
| `BLOB_READ_WRITE_TOKEN` | Vercel prod | Image upload (Blob) |
| `AUTH_URL` | Optional | Public URL if custom domain |
| `ADMIN_EMAILS` | Optional | Access to `/admin` (comma-separated) |
| `NEXT_PUBLIC_APP_NAME` | Optional | Display name (default "Sort your life") |
| `NEXT_PUBLIC_APP_SHORT_NAME` | Optional | Short PWA name (default "Sort") |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public URL for OG / sitemap (default `https://sortyourlife.fr`) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional | Google Search Console token |
| `NEXT_PUBLIC_LEGAL_OWNER_NAME` | Optional | Editor name surfaced on legal pages |
| `NEXT_PUBLIC_LEGAL_EMAIL` | Optional | Contact email on legal pages |
| `NEXT_PUBLIC_GITHUB_URL` | Optional | Override the "Source code" link in the footer |

### SEO

- `robots.txt` generated at `/robots.txt` (allows `/`, blocks `/dashboard`, `/admin`, `/api`, `/l/`, `/login`).
- `sitemap.xml` at `/sitemap.xml`.
- Open Graph + Twitter Card + JSON-LD (WebSite, Organization, SoftwareApplication) on the home page.
- Link the property in **Google Search Console**, drop the token into `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, and submit the sitemap.

OAuth redirect: `{ORIGIN}/api/auth/callback/google` (and `/apple`).

---

## Deploy on Vercel

Detailed guide: **[DEPLOY.md](./DEPLOY.md)**

1. **PostgreSQL** database + env vars on the Vercel project.
2. **Blob** connected (`BLOB_READ_WRITE_TOKEN`).
3. Import the repo — build with `prisma migrate deploy` (`vercel.json` / `scripts/vercel-build.sh`).

---

## npm scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Dev on port **8080** |
| `npm run dev:pwa` | Dev + service worker rebuild |
| `npm run build` | Prisma + migrate deploy + Next build + Serwist |
| `npm start` | Production server |
| `npm run db:migrate` | Prisma migration in dev |
| `npm run db:studio` | Prisma Studio |
| `npm test` | Unit tests (Vitest) |
| `npm run test:watch` | Unit tests in watch mode |

---

## Tests

Unit tests on pure helpers in `src/lib` and `src/i18n` (admin allowlist, slugs, taxonomies, list kinds, tour state, SEO, i18n, attribution, legal…).

```bash
npm test           # run once
npm run test:watch # watch mode
```

Stack: Vitest + happy-dom. Tests live in `tests/unit/*.test.ts` and use the `@/*` alias (resolved via `tsconfigPaths`).

---

## Legal

Public pages: `/legal/cgu` and `/legal/cgv`.

Wording lives in dedicated i18n files `messages/legal/{fr,en}.json` (merged under the `legal` namespace at runtime). Editor identity via env vars:

```bash
NEXT_PUBLIC_LEGAL_OWNER_NAME="First Last"
NEXT_PUBLIC_LEGAL_EMAIL="contact@sortyourlife.fr"
```

Without them, pages display `[À compléter]`. No postal address at the beta stage.

> **Coming before public launch (GDPR + LCEN)**: detailed legal notice + privacy policy.

---

## Acquisition & tracking

Ready-to-copy UTM links (Meta, Google, TikTok, Reddit…) + admin funnel reading guide: **[ACQUISITION.md](./ACQUISITION.md)**.

5 events tracked through Vercel Analytics: `signup`, `list_created`, `invite_sent`, `vote_cast`, `match_reached`.
Funnel + top sources dashboard: `/admin`.

---

## Project structure

```
public/
  promo/
    creators/             # Organizer journey screenshots (README + landing)
    voters/               # Voter journey screenshots
messages/                 # fr.json, en.json (next-intl)
  legal/                  # Legal wording (separated i18n)
src/
  app/
    api/                  # auth, lists, inventory, votes, matches, upload, admin, attribution
    dashboard/            # Organizer space
    l/[slug]/             # Voter experience
    admin/
    legal/                # /legal/cgu, /legal/cgv
    login/
  components/
    ItemWizard.tsx
    onboarding/           # FirstListTour, ItemWizardTour
    IdentityGate.tsx
    AttributionCapture.tsx
    PostSignupSync.tsx
  i18n/
  lib/
prisma/
  schema.prisma
  migrations/
DEPLOY.md
ACQUISITION.md
```

---

## License

[MIT](./LICENSE) — do whatever you want with the code: use it, modify it, fork it, ship it, sell it. No warranty, no restriction.

Two things the MIT license does **not** cover:

- The **"Sort your life" name and logo** (`public/logo.png`, brand colors, marketing copy in `messages/*.json`). Those remain the project's identity — if you fork to build something new, please rename it.
- Photos used in the demo and promo material (`public/promo/**/*.jpg`, `public/uploads/`) — they may belong to third parties.

If in doubt, open an issue or email contact@sortyourlife.fr.
