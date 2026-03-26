# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start development server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npx shadcn add <component>` — Add a new shadcn/ui component

## Architecture

DattaRemit Admin is a Next.js 16 (App Router) admin dashboard for managing users, activities, referrals, and marketing on the DattaRemit platform. It uses React 19, TypeScript, and Tailwind CSS 4.

### Authentication

- **Clerk** (`@clerk/nextjs`) handles authentication. The middleware in `proxy.ts` protects all routes except `/sign-in`.
- The dashboard layout (`app/(dashboard)/layout.tsx`) verifies admin authorization by calling `GET /admin/stats` on mount. It also initializes the API token getter via `setTokenGetter()` from `lib/api.ts`.
- The custom sign-in page (`app/sign-in/[[...sign-in]]/page.tsx`) handles email/password auth with two-factor verification support.

### API Client (`lib/api.ts`)

- Central API module with typed endpoint functions for all admin operations.
- Uses a token getter pattern: `setTokenGetter()` must be called (with Clerk's `getToken`) before any API calls work.
- All requests go to `NEXT_PUBLIC_API_URL` (default: `http://localhost:5000/api`) with the token in an `x-auth-token` header.
- Endpoints are under `/admin/*` (users, activities, referral-stats, marketing, charts).

### Routing

All authenticated pages live under the `app/(dashboard)/` route group:
- `/` — Dashboard with stats cards and charts (Recharts)
- `/users` — User list with search/filter/pagination
- `/users/[id]` — User detail with profile, addresses, activities
- `/activities` — Activity log with type/status filters
- `/referrals` — Referral leaderboard
- `/marketing` — Influencer/Promoter management
- `/settings` — Admin configuration (persisted to localStorage)

### Data Fetching Hooks (`hooks/`)

- `useApiFetch` — Generic fetch hook with loading/error/refetch states.
- `usePaginatedFetch` — Extends fetching with pagination (default 20/page) and filter dependency tracking. Resets to page 1 on filter change.

### UI Patterns

- **shadcn/ui** components in `components/ui/` built on Radix UI primitives.
- Forms use React Hook Form + Zod validation (`@hookform/resolvers`).
- Toast notifications via `sonner`.
- Theme support (light/dark) via `next-themes` with oklch CSS custom properties in `app/globals.css`.
- Skeletons (`DashboardSkeleton`, `TableSkeleton`) and `ErrorState` component for consistent loading/error UX.
- Dialog components for CRUD actions (add/edit/delete user, change role, add promoter).

### Path Alias

`@/*` maps to the project root (configured in `tsconfig.json`).

### Environment Variables

- `NEXT_PUBLIC_API_URL` — Backend API base URL
- Clerk env vars for authentication (keys configured externally)
