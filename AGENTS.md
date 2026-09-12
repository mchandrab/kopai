# AGENTS.md — KopAI

> Scaffolded: Vite React JS + Tailwind v3 at repo root (`src/`, `supabase/migrations/`). Verified: `npm install`, scoring calc, `npm run build` (vite v5, 88 modules). `docs/` remains spec source of truth; `docs/DATABASE_SCHEMA.md` mirrors migration SQL exactly.

## What this is
- KopAI: AI-assisted koperasi simpan-pinjam. Roles: `member` (apply loans, AI chat) and `admin` (approve/reject with AI risk data).
- Intended stack (from `docs/TECH_STACK.md`, `docs/ARCHITECTURE.md`): React + Vite + Tailwind frontend; Supabase (Postgres + Auth + RLS) as the only backend; Google Gemini API free tier for AI; Tencent EdgeOne for static hosting/CDN. No custom server.
- Canonical specs: `docs/PRD.md` (features), `docs/DATABASE_SCHEMA.md` (tables), `docs/WORKFLOW.md` (loan → scoring → admin → chatbot flow).

## Scaffolding rules (when creating code)
- Do not add a custom backend (Express/Laravel/etc.). Scoring must be client-side JS or Supabase Functions — `docs/TECH_STACK.md` requires zero-cost/instant scoring with no extra server.
- Expected layout when scaffolded: Vite React app at repo root (`package.json`, `src/`, `vite.config.js`); Supabase SQL migrations under `supabase/` mirroring `docs/DATABASE_SCHEMA.md` exactly.
- Deps to prefer: `@supabase/supabase-js`, `@google/generative-ai` (Gemini free tier). Tailwind per Vite docs.

## Database — do not drift from spec
- Tables/columns/enums in `docs/DATABASE_SCHEMA.md` are canonical: `profiles(id→auth.users, role member|admin)`, `loan_applications(status pending|approved|rejected, ai_credit_score 0–100, ai_risk_level Low|Medium|High)`, `ai_chat_history(sender user|ai)`.
- Any new table or enum change must update `docs/DATABASE_SCHEMA.md` first.
- Supabase RLS is mandatory (members see only own rows; admins see queue). Never ship without RLS policies; never expose `service_role` key to the client.

## AI / scoring constraints
- Credit score output contract: `ai_credit_score` int 0–100 + `ai_risk_level` Low/Medium/High + `ai_recommendation_notes` text, written to `loan_applications` at submit time (see `docs/WORKFLOW.md`).
- Gemini calls only for chatbot (`ai_chat_history`) and recommendation-notes text. Scoring itself must work offline of Gemini (weighted formula on `total_savings`, `business_type`, amount) so loan flow survives free-tier limits.
- Never commit API keys. Required env (Vite): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`.

## Frontend conventions
- Design system: tokens in `tailwind.config.js` (brand blue) + shared classes in `src/index.css` (`.card .field .btn-primary .badge-*`) + shared components in `src/components/ui.jsx` (`Card PageHeader RiskBadge StatusBadge ScoreMeter Stat EmptyState Loading`). Use these, do not inline new styles.
- UI language: Bahasa Indonesia, mobile-first (min touch 44px). Every list page must have an `EmptyState` — never a blank page.

## Environment gotchas
- Runs under XAMPP on Windows (`C:\xampp\htdocs\kopai`) but Vite has its own dev server — run `npm run dev`, do not depend on Apache/MySQL. Use `workdir` param instead of `cd`.
- No test/lint/typecheck config exists yet. Once scaffolded, use the Vite defaults (`npm run dev|build|preview`) and state the exact command you verified with.
