# Immu Health — AIP Diet Tracker

Next.js 15 app for tracking the Autoimmune Protocol (AIP) diet, backed by Supabase.

## Architecture

- **Framework**: Next.js 15.5.9 with Turbopack (`next dev --turbo`)
- **Auth/DB**: Supabase (`@supabase/ssr` v0.8, `@supabase/supabase-js` v2.89)
- **UI**: React 19, Tailwind CSS, Radix UI, shadcn/ui components
- **Package manager**: pnpm
- **Port**: 5000

## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Login page (client component, checks session via `useEffect`) |
| `app/dashboard/page.tsx` | Main dashboard after login |
| `app/layout.tsx` | Root layout with `I18nProvider` |
| `middleware.ts` | Clears corrupted Supabase auth cookies before SSR |
| `lib/supabase/client.ts` | Browser-side Supabase client with SSR guard (singleton) |
| `lib/auth.ts` | Auth helpers: signIn, signOut, getSession, etc. |
| `lib/i18n/context.tsx` | Internationalisation context (uses static `createClient` imports) |
| `next.config.mjs` | Config: Turbopack, webpack chunk timeout, allowed dev origins |

## Environment Secrets

Set as Replit secrets (not in `.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (full JWT, ~200 chars)
- `SUPABASE_SERVICE_ROLE_KEY`

## Resolved Issues

1. **Supabase anon key truncated** — was 40 chars; replaced with correct full JWT.
2. **Mixed-export Fast Refresh crash** — removed `export { createBrowserClient }` re-export from `lib/supabase/client.ts`.
3. **SSR SyntaxError on malformed cookies** — `middleware.ts` now parses and deletes invalid `sb-*-auth-token` cookies before SSR runs.
4. **ChunkLoadError** — `lib/i18n/context.tsx` switched from dynamic to static `createClient` imports.
5. **Fast Refresh infinite loop** — Turbopack (`--turbo` flag) used instead of webpack; `next.config.mjs` instructs both Turbopack and webpack to ignore `.next`, `node_modules`, `.cache`, `.git`, `.local` directories (Replit writes to `.cache/replit/toolchain.json`, which was triggering inotify-based recompile loops).

## Dev Command

```bash
pnpm run dev   # runs: next dev --turbo -p 5000 -H 0.0.0.0
```
