# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (the other lockfiles are obsolete; do not regenerate them).

```bash
pnpm dev      # Next.js dev server (default :3000, falls through to 3001/3002 if busy)
pnpm build    # Production build
pnpm start    # Run built app
pnpm lint     # next lint
```

Prisma (no script wrappers — invoke directly):

```bash
pnpm exec prisma generate            # regenerate client to src/generated/prisma
pnpm exec prisma migrate dev --name <name>   # create/apply a dev migration
pnpm exec prisma migrate deploy      # apply pending migrations
pnpm exec prisma studio              # DB browser
```

`DATABASE_URL` is read from `.env` via `dotenv/config` in `prisma.config.ts` and `src/lib/prisma.ts`. **The schema does NOT declare `url`** — Prisma 7 requires it in `prisma.config.ts`. The Prisma 7 `prisma-client` generator outputs to **`src/generated/prisma`** (not `node_modules`); imports look like `@/generated/prisma/client`.

After modifying `schema.prisma`, run `prisma generate` *and* a migration.

## Architecture

Next.js 16 App Router + React 19 + TypeScript (strict) + Tailwind v4 + shadcn/ui (style `new-york`, base `neutral`, components in `@/components/ui`). Path alias `@/*` → `./src/*`.

### Auth (NextAuth / Auth.js v5)

- `src/auth.config.ts` — **edge-safe** subset (Google provider + `authorized` callback + jwt/session callbacks). Imported by `proxy.ts` so it must NOT pull in bcrypt or Prisma.
- `src/auth.ts` — full config: extends `authConfig`, adds the **Credentials** provider (bcrypt-verified) and the **Prisma adapter**. Exports `{ handlers, auth, signIn, signOut }`. JWT session strategy (Credentials forces JWT when combined with an adapter).
- `src/app/api/auth/[...nextauth]/route.ts` — re-exports `handlers.GET/POST`.
- `src/app/api/auth/register/route.ts` — custom Credentials registration (bcrypt hash, returns the new user). Auto-signs-in after success from the client.
- `src/proxy.ts` — Next.js 16 renamed `middleware.ts` → `proxy.ts`. Uses `auth` to protect non-API routes via the `authorized` callback. The matcher **excludes `/api/*`** intentionally: API handlers call `requireUser()` themselves and return `401 JSON` instead of redirecting (which a middleware match would do).
- `src/app/components/auth/AuthDialog.tsx` + `AuthDialogProvider.tsx` — single modal with Login/Register tabs. Anywhere in the app: `const { open } = useAuthDialog(); open('login' | 'register')`. The dialog also auto-opens on `/?auth=login|register`.
- `src/app/page.tsx` — public landing (server component). If session → `redirect('/finance')`; otherwise renders `Landing` which fires the modal.
- `src/app/components/auth/Providers.tsx` — wraps `SessionProvider` + `AuthDialogProvider`. Mounted in the root layout so the dialog is available everywhere (including outside the dashboard).

**Env vars** (see `.env.template`):

- `AUTH_SECRET` — JWT signing secret. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — from Google Cloud Console. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (adjust port/host per env).
- `AUTH_TRUST_HOST=true` — required when running behind a proxy.

### Domain layer

State flows **only through the API** now. There is no localStorage layer anymore.

- `FinanceProvider` (`src/app/context/finance-context/FinanceContext.tsx`) is mounted **once** in `(DashboardLayout)/layout.tsx`. It uses **SWR** for each resource (`/api/finance/categories`, `/incomes`, `/expenses`, `/debts`, `/savings-goals`, `/budgets`) and exposes the same hook API (`useFinance()`) the components already consumed — mutations call `fetch` then revalidate via `mutate(key)` and emit a `toast` (`sonner`) with the result.
- On first load with no categories, `FinanceProvider` GETs `/api/finance/init` which seeds the default income/expense categories **for the current user**.

### API conventions (`src/app/api/finance/*`)

Every handler follows the same shape:

1. `await requireUser()` → 401 JSON if no session. Otherwise gives you `{ userId }`.
2. `await parseJson(request, schema)` → 400 JSON with Zod issues, otherwise `{ data }`.
3. Prisma call **always filtered by `userId`** (use `updateMany` / `deleteMany` with `{ id, userId }` to enforce ownership in mutations; `findFirst` for ownership checks before relations).
4. Return via `json(...)` which runs the response through `serialize()` to convert Prisma `Decimal` instances into JS numbers (JSON has no Decimal type).

Schemas live in `src/lib/finance-schemas.ts` (Zod). Helpers (`requireUser`, `parseJson`, `requireId`, `handleError`, `serialize`, `json`) live in `src/lib/api-utils.ts`.

### Schema (`prisma/schema.prisma`) — key points

- All monetary fields are `Decimal @db.Decimal(20, 8)` (Float would corrupt rounding and can't represent crypto). `interestRate` uses `Decimal(8, 4)`.
- `Income`, `Expense`, `Budget` reference their `Category` via FK only — denormalized `categoryName`/`categoryColor` were removed in migration `decimal_amounts_remove_denorm`. Always `include: { category: true }` in reads.
- Multi-user: `User`, `Account`, `Session`, `VerificationToken` (Auth.js standard) + nullable `userId` on every owned model. **`userId` is nullable for now** to avoid breaking existing data. Once orphan rows are claimed/deleted, run a follow-up migration to make it `NOT NULL`.
- `DebtPayment` and `SavingsContribution` don't carry `userId`; ownership is enforced through their parent (`debt.userId` / `goal.userId`). Mutation endpoints filter on the relation.

### Route layout

- `src/app/page.tsx` — public landing (auth gate + modal trigger).
- `src/app/(DashboardLayout)/` — authenticated app shell. `layout.tsx` mounts `SidebarProvider`, `AppSidebar`, `Header`, and **`FinanceProvider`** (single instance). Every finance page lives inside this group; never re-mount `FinanceProvider` per page.
- `src/app/api/auth/...` — Auth.js handlers + custom register.
- `src/app/api/finance/<resource>/route.ts` — REST per resource. All require auth.

### Components

- `src/components/ui/` — shadcn primitives. Add with `pnpm dlx shadcn@latest add <component>`.
- `src/components/AppSidebar.tsx` — sidebar nav; routes are inlined in `sidebarData`.
- `src/app/components/` — feature components grouped by domain (`finance/`, `auth/`, `dashboard/`, demo apps).
- `src/app/(DashboardLayout)/types/finance/` — domain types. `Income/Expense/Budget` now have `category?: Category` instead of denormalized snapshot fields.

### UI/Styling notes

- Global CSS: `src/app/css/globals.css`. Tailwind v4 via `@tailwindcss/postcss` (no `tailwind.config.js`).
- `next.config.mjs`: `reactStrictMode: false` (legacy), `images.unoptimized: true`.
- UI is largely Spanish.

### Known leftover technical debt (do not panic, but be aware)

- `src/app/(DashboardLayout)/utilities/form/page.tsx` and `src/app/components/utilities/data-table/DataTable.tsx` carry template-era TS errors (`Input variant`, `Badge "lightprimary"`) that fail `pnpm build`. These pages are demo content; safe to delete or fix when convenient.
- `apexcharts`, `aos`, `swiper`, `react-big-calendar`, `react-slick`, `cmdk`, `vaul`, `simplebar-react`, `redux-persist`, `chance` and others are template leftovers. `react-apexcharts` IS used (in `IncomeExpenseChart`, `ExpenseByCategory`). The rest can likely be pruned.
- `userId` columns are nullable. Convert to `NOT NULL` once data is reassigned.
- No tests, no Prettier, no Husky.

## Deployment

- `dockerfile` builds on `node:20-alpine`, runs `npm run start` on `PORT=3001` (note dev defaults to 3000).
- `netlify.toml` is dead config — leftover from a SPA setup, irrelevant for Next.js SSR.
