# DattaRemit Admin

Admin dashboard for the DattaRemit platform — manage users, activities, referrals, marketing, and access control. Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + Clerk auth.

See `CLAUDE.md` for deeper architectural notes.

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run test` | Jest |
| `npx shadcn add <component>` | Add a shadcn/ui component |

## Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Auth:** Clerk (`@clerk/nextjs`); middleware in `proxy.ts`. Admin authorization is verified on dashboard mount via `GET /admin/stats`.
- **API:** `lib/api.ts` with a `setTokenGetter()` pattern (must be called with Clerk's `getToken` before any API call works). All endpoints under `/admin/*`.
- **Data fetching:** Custom `useApiFetch` and `usePaginatedFetch` hooks (no React Query in admin).
- **Forms:** React Hook Form + Zod
- **UI:** shadcn/ui (Radix UI + Tailwind CSS 4); Recharts for dashboard charts; fonts: Poppins (primary) and Geist Mono via `next/font/google`.
- **Theming:** Light/dark via `next-themes` with oklch CSS custom properties in `app/globals.css`.

## Routes

All authenticated pages live under `app/(dashboard)/`:

- `/` — Stats cards + Recharts dashboard
- `/users`, `/users/[id]` — User list / detail (search, filter, pagination)
- `/activities` — Activity log with type/status filters
- `/referrals` — Referral leaderboard
- `/marketing` — Influencer / promoter management
- `/access-control` — Allowlist / blocklist management
- `/settings` — Admin configuration (persisted in `localStorage`)

## Environment

- `NEXT_PUBLIC_API_URL` — backend API base URL (defaults to `http://localhost:5000/api`)
- Clerk env vars (publishable / secret keys)

## Path Alias

`@/*` maps to the project root (`tsconfig.json`).

## Docker

Multi-stage build producing a small, non-root image based on Next.js [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output).

### 1. Create `.env` in the repo root

```dotenv
# Build-time — inlined into the client bundle, must be present at `docker build`
NEXT_PUBLIC_API_URL=http://host.docker.internal:5000/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx

# Runtime — server-only secret
CLERK_SECRET_KEY=sk_test_xxx
```

`NEXT_PUBLIC_*` values are inlined into the client bundle at build time, so they must be set before `docker compose up --build`. `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `SIGN_UP_URL` / fallback URLs have sane defaults in `docker-compose.yml` — only override if you need to.

### 2. Build and run

```bash
docker compose up --build         # foreground
docker compose up --build -d      # detached
docker compose down               # stop
```

App is served at http://localhost:3000.

