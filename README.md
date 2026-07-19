# Kedah Court System

Internal case cross-check and search database for lawyers and staff.

## Tech Stack

- **Frontend:** React 19, Vite 7, React Router 7
- **Backend:** Supabase (PostgreSQL + Auth) — direct client calls, no separate REST API
- **Hosting:** Vercel

## Getting Started

```bash
cd client
npm install
cp .env.example .env   # fill in your Supabase project URL + anon key
npm run dev
```

## Structure

- `client/src/pages` — route-level pages
- `client/src/components` — shared UI (Navbar, etc.)
- `client/src/context/AuthContext.jsx` — global auth state
- `client/src/lib/supabaseClient.js` — Supabase client init
- `client/src/styles/globals.css` — dark theme design system
- `supabase/migrations` — database schema

## Access

There is no user login yet. The whole site is gated behind a single shared
password (`client/src/components/PasswordGate.jsx`, currently `6767`) — this
is an access gate, not real security, since the password ships in the
frontend bundle. Swap for real per-user Supabase auth before this holds
anything sensitive.
