# Post Hacker News (Show HN)

**Title**: Show HN: Ziffir – Open-source-style SaaS for luxury hotels (AI, real-time, audit)

**Text**:

Hey HN,

We built Ziffir, a SaaS platform for luxury hotels (palaces, 5-star, yachts, jets).

Why this is interesting technically:

1. **Real-time architecture**: Socket.IO with optimistic locking + version conflicts
2. **Cryptographic audit log**: Every action recorded in a hash chain (SHA-256), verifiable via API
3. **AI wine pairing**: Contextual algorithm combining menu + weather + guest history
4. **Multi-tenancy**: Strict hotel isolation with RBAC (9 roles)
5. **Open roadmap**: Users vote on features, we ship what they want

Tech stack: TypeScript, React, Node.js, Express, Prisma, PostgreSQL, Redis, Socket.IO, AWS.

We focused exclusively on luxury (not all hotels like Opera/Mews/Cloudbeds). This let us build features impossible in generalist PMS:
- Wine cellar AI with sommelier knowledge
- Comptable ledger export (FEC format, mandatory in France)
- Multi-team coordination for VIP arrivals
- Do Not Disturb synced with housekeeping

Numbers after 6 months with our pilot (Palace Royal Megève):
- +18% NPS
- -23% energy consumption
- -40% manual interventions by staff
- <2s latency on critical operations

Tech interesting bits:
- We publish our public roadmap at https://www.ziffir.com/roadmap
- Our status page is open: https://status.ziffir.com
- We have a full test suite (E2E + unit, 85% coverage)
- We use blue/green deployment on ECS

Stack details:
- Frontend: React 18, Vite, Framer Motion, TanStack Query
- Backend: Express, Prisma, Socket.IO, Redis adapter
- Auth: JWT in HTTP-only cookies, 2FA TOTP
- Billing: Stripe (subscriptions + Stripe Connect for partners)
- Monitoring: Datadog APM + Sentry
- CI/CD: GitHub Actions, blue/green on AWS ECS

Open questions for HN:
- How do you handle real-time sync at scale? We're at ~5k concurrent sockets per instance
- Anyone else doing hash chain audit logs? We're considering blockchain anchoring
- Real-time pricing on Stripe Connect for partner commissions is tricky

Happy to answer any technical questions!

[Link to GitHub if you want to see code]
