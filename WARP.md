# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Stack: Next.js (App Router) with TypeScript and Tailwind CSS v4.
- Auth: better-auth with OAuth (GitHub, Google) and email/password.
- Database: Postgres via Neon HTTP driver and Drizzle ORM; migrations managed with drizzle-kit.
- Structure: Feature-first modules under src/modules, shared UI components under src/components/ui, DB layer under src/db, and app routes/layouts under src/app.

Commands
Package manager: npm (package-lock.json is present).
- Install dependencies (clean, reproducible): npm ci
- Start dev server (http://localhost:3000): npm run dev
- Build production bundle: npm run build
- Start production server: npm run start
- Lint (ESLint v9 flat config via Next): npm run lint -- .
- Database (Drizzle):
  - Push schema to DB: npm run db:push
  - Open Drizzle Studio: npm run db:studio

Tests
- No test runner is configured in this repo (no Jest/Vitest/Playwright setup found). There is currently no command to run a single test.

Environment and setup
- Required environment variables (from code usage):
  - DATABASE_URL (used by src/db/index.ts and drizzle.config.ts)
  - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET (used by src/lib/auth.ts)
  - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (used by src/lib/auth.ts)
- Drizzle config (drizzle.config.ts) loads dotenv, so values in a .env file will be picked up for DB tasks. Next.js also supports .env.local for runtime. Ensure these variables are available when running dev/build/start and DB commands.

High-level architecture
- App Router (src/app)
  - Global layout: src/app/layout.tsx sets fonts and global CSS.
  - Route groups:
    - (auth): Auth surfaces with their own layout; sign-in and sign-up pages at /sign-in and /sign-up. Both are server components that check the current session and redirect appropriately.
    - (dashboard): Root “/” is within this group. src/app/(dashboard)/page.tsx enforces auth on the server (redirects to /sign-in if no session) and renders OverviewView from the buyer module (src/modules/buyer/overview/overview-view.tsx).
  - API route for Auth: src/app/api/auth/[...all]/route.ts exposes better-auth handlers via toNextJsHandler(auth) for GET/POST.

- Authentication
  - Server configuration: src/lib/auth.ts uses betterAuth with two social providers (GitHub, Google) and email/password enabled. It connects to Postgres using drizzleAdapter(db, { provider: "pg", schema }).
  - Client usage: src/lib/auth-client.ts initializes the client; components use authClient.useSession(), authClient.signIn.*, and authClient.signOut().
  - Server checks: Pages like (auth)/sign-in and (dashboard)/page use auth.api.getSession({ headers: await headers() }) to enforce access/redirects.

- Database layer
  - Connection: src/db/index.ts creates a Neon HTTP driver connection via drizzle(process.env.DATABASE_URL).
  - Schema: src/db/schema.ts defines user, session, account, and verification tables compatible with better-auth.
  - Migrations/workbench: drizzle.config.ts points to schema and out directory ./drizzle; use npm run db:push and npm run db:studio.

- UI system and modules
  - Design system: src/components/ui contains a comprehensive set of UI primitives (e.g., button, input, dialog, sidebar, etc.), largely based on Radix UI and shadcn-style patterns. Sidebar includes a provider/context and responsive behavior.
  - Feature modules: src/modules organizes feature UI into domain-focused areas:
    - auth: Form views for sign-in and sign-up using zod, react-hook-form, and better-auth client actions.
    - buyer: Sections like overview, market, portfolio, transactions, compliance, and AI insights; OverviewView is used on the “/” route.
    - dashboard: Sidebar shell and related UI pieces.
    - home: Present but not the default “/” route; provides a simple authenticated landing view.

- Styling and configuration
  - Tailwind CSS v4 with globals in src/app/globals.css; class utilities via cn in src/lib/utils.ts.
  - TypeScript path alias @/* → src/* (see tsconfig.json). Imports throughout depend on this alias.

Operational notes
- First run (local):
  1) Create .env with DATABASE_URL and OAuth client credentials (GitHub/Google) if you intend to use social sign-in. With only email/password enabled, the DB is still required.
  2) Apply schema: npm run db:push
  3) Start dev: npm run dev, then open http://localhost:3000
- Production: Build with npm run build and serve with npm run start. Ensure all required env vars are present in the environment.

References pulled into this file
- README.md: Dev server instructions and Next.js template notes.
- drizzle.config.ts: DB config and dotenv behavior.
- package.json scripts: dev, build, start, lint, db:push, db:studio.
- tsconfig.json: path alias @/* to src/*.
- Key source files: App Router pages/layouts, auth (server/client), DB schema/connection, buyer module (overview), and UI system.
