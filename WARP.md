# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Stack: Next.js (App Router, v15) with TypeScript and Tailwind CSS v4.
- Auth: better-auth with OAuth (GitHub, Google) and email/password.
- Database: Postgres via Neon HTTP driver and Drizzle ORM; migrations managed with drizzle-kit.
- Domain: Carbon credit marketplace with buyer/seller roles and compliance tracking.
- Structure: Feature-first modules under src/modules, shared UI primitives under src/components/ui, DB layer under src/db, and app routes/layouts under src/app.

Commands
Package manager: npm (package-lock.json is present).
- Install dependencies (clean): npm ci
- Start dev server (http://localhost:3000): npm run dev
- Build production bundle: npm run build
- Start production server: npm run start
- Lint (ESLint v9 flat config via Next): npm run lint -- .
- Database (Drizzle):
  - Push schema to DB: npm run db:push
  - Open Drizzle Studio: npm run db:studio
  - Seed sample data (requires DATABASE_URL): npx tsx src/db/seed.ts

Tests
- No test runner is configured in this repo (no Jest/Vitest/Playwright setup found). There is currently no command to run a single test.

Environment and setup
- Required environment variables (from code usage):
  - DATABASE_URL (used by src/db/index.ts and drizzle.config.ts)
  - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET (used by src/lib/auth.ts)
  - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (used by src/lib/auth.ts)
  - GEMINI_API_KEY (optional; used by src/lib/gemini.ts for AI insights; falls back if missing)
- Drizzle config (drizzle.config.ts) loads dotenv, so values in a .env file will be picked up for DB tasks. Next.js also supports .env.local for runtime. Ensure these variables are available when running dev/build/start and DB commands.

High-level architecture
- App Router (src/app)
  - Global layout: src/app/layout.tsx sets global CSS and fonts via next/font (Geist family).
  - Route groups and pages:
    - (auth): Auth surfaces with their own layout; sign-in and sign-up pages at /sign-in and /sign-up. Server components check the current session and redirect appropriately.
    - (dashboard): Root "/" is protected on the server (redirects to /sign-in if no session) and renders the buyer overview view. Buyer and seller dashboards live at /buyer-dashboard and /seller-dashboard.
    - Onboarding: /onboarding/role for initial role selection.
    - Verify: /verify for verification-related UI.
  - API routes (server actions):
    - Credits: /api/credits (GET list available credits, POST create seller credit)
    - Projects: /api/projects (GET seller projects, POST create project)
    - Purchase: /api/purchase (POST buyer purchases a credit; updates inventory and creates transaction)
    - User: /api/me (GET current user with role-specific profile)
    - Market insights: /api/market-insights (GET AI-generated insights via Gemini; graceful fallback without key)

- Authentication
  - Server configuration (src/lib/auth.ts): betterAuth with GitHub and Google social providers plus email/password. Connects to Postgres using drizzleAdapter(db, { provider: "pg", schema }). Adds a user "role" field with default "buyer".
  - Client usage (src/lib/auth-client.ts): createAuthClient for use in client components; server code uses auth.api.getSession({ headers }) for redirects/guards.

- Database layer
  - Connection: src/db/index.ts creates a Neon HTTP driver connection via drizzle(process.env.DATABASE_URL). Throws an error if DATABASE_URL is missing.
  - Schema (src/db/schema.ts):
    - Auth tables: user, session, account, verification
    - Domain tables: buyerProfile, sellerProfile, project, carbonCredit, transaction, certificateRecord, wasteLedger
    - Enums: user_role, verification_status, transaction_status, credit_status, project_type
    - Relations: comprehensive Drizzle relations between all entities
  - Migrations/workbench: drizzle.config.ts points to schema and out directory ./drizzle; use npm run db:push and npm run db:studio.
  - Seeding: src/db/seed.ts provides sample data across users, profiles, projects, credits, waste ledger, and transactions (run with npx tsx src/db/seed.ts).

- UI system and modules
  - Design system: src/components/ui contains a broad set of UI primitives (button, input, dialog, sidebar, etc.), primarily Radix/shadcn patterns. Shared layout parts in src/components/layout.
  - Feature modules (src/modules): buyer (overview, market, portfolio, transactions, compliance, AI), seller (dashboard), dashboard (user button). The root dashboard uses buyer/overview.

- Styling and configuration
  - Tailwind CSS v4 with globals in src/app/globals.css and PostCSS plugin (@tailwindcss/postcss). No separate tailwind.config is required.
  - TypeScript path alias @/* → src/* (see tsconfig.json).

Operational notes
- First run (local):
  1) Create .env with DATABASE_URL and OAuth client credentials (GitHub/Google) if you intend to use social sign-in. With only email/password enabled, the DB is still required. Optionally add GEMINI_API_KEY for AI.
  2) Apply schema: npm run db:push
  3) (Optional) Seed sample data: npx tsx src/db/seed.ts
  4) Start dev: npm run dev, then open http://localhost:3000
- Production: Build with npm run build and serve with npm run start. Ensure all required env vars are present.

References pulled into this file
- README.md: Dev server instructions and Next.js template notes.
- drizzle.config.ts: DB config and dotenv behavior.
- package.json scripts: dev, build, start, lint, db:push, db:studio.
- tsconfig.json: path alias @/* to src/*.
- Key source files: App Router pages/layouts, auth (server/client), DB schema/connection, buyer module (overview), UI system, and AI integration (src/lib/gemini.ts).
