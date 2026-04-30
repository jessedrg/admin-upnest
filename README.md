# @upnest/admin

Next.js 14 (App Router) — Upnest internal operations console.

```bash
pnpm install
pnpm dev   # http://localhost:3000
```

## Routes

```
app/
├── login                    ← public (no signup)
├── dashboard                ← global KPIs + activity
├── roles                    ← all roles, all orgs
├── roles/[id]               ← full pipeline + audit
├── candidates               ← global candidate search
├── organizations            ← companies + agencies
├── recruiters               ← all recruiters, performance
├── contracts                ← all contracts, billing
├── stats                    ← platform-level analytics
├── activity                 ← audit log
├── settings                 ← internal config
└── api/auth/[...nextauth]
```

Same `lib/` layer as partners + clients — see `nextjs/README.md`.

## Access

The stub Credentials provider in `lib/auth.ts` accepts any email. To gate this app properly:

1. Add a role check in NextAuth callbacks — only `role: "admin"` users.
2. Replace the Credentials provider with your real IdP (Okta, Workos, etc.).
3. Add a middleware that redirects non-admins.
