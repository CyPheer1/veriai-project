# VeriAI — Project Memory File

> Last updated from: Codex session `019e0bf0` + Windsurf session handoff
> Purpose: Continuity document so any new session (Zed AI, Windsurf, Codex, etc.) can pick up exactly where we left off.

---

## 1. What Is This Project?

**VeriAI** is an AI-generated text detection tool aimed at educators, researchers, and academic reviewers. Users paste text or upload PDF/DOCX documents and receive a detailed analysis report with:

- RoBERTa AI-likelihood score
- Stylistic signals
- Statistical signals
- Model-attribution breakdown (which AI model likely generated it)
- Sentence-level highlight segments

The product philosophy is: **evidence before spectacle**, **honest states only**, **probabilistic by default**. It should feel like a serious academic tool, not a flashy SaaS demo.

---

## 2. Architecture

| Layer | Tech | Port |
|-------|------|------|
| Frontend | React + TypeScript + Vite + Tailwind CSS | 3000 |
| Backend | Spring Boot (Java 21) | 8080 |
| AI Service | FastAPI (Python) | 8000 |
| Database | PostgreSQL | 5432 |
| Cache / Queue | Redis | 6379 |
| Workers | Celery | — |
| Monitoring | Prometheus + Grafana | — |

Everything is orchestrated via **Docker Compose** (`docker-compose.yml` at project root).

---

## 3. File Structure (Key Paths)

```
veriai-project/
├── frontend/
│   └── src/app/
│       ├── pages/
│       │   ├── GuestDashboard.tsx          ← Landing page (public)
│       │   ├── LoggedInDashboard.tsx       ← Main scan workspace
│       │   ├── LoginPage.tsx
│       │   ├── SignupPage.tsx              ← Free-only signup
│       │   ├── ScanHistoryPage.tsx
│       │   └── BillingStatusPage.tsx       ← /billing/success + /billing/cancel
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── InputPanel.tsx
│       │   ├── ResultsPanel.tsx
│       │   ├── Sidebar.tsx
│       │   └── ...
│       ├── context/
│       │   └── AppContext.tsx              ← Auth + upgrade + theme state
│       ├── services/
│       │   └── api.ts                      ← All fetch calls to backend
│       └── routes.tsx
├── backend-java/
│   └── src/main/java/com/example/backendjava/
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── BillingController.java      ← /api/v1/billing/*
│       │   └── SubmissionController.java
│       ├── service/
│       │   ├── AuthService.java
│       │   ├── BillingService.java         ← Full Stripe logic
│       │   ├── SubmissionService.java
│       │   ├── QuotaService.java
│       │   └── ...
│       ├── config/
│       │   ├── AppProperties.java          ← All env-backed config (incl. Billing)
│       │   └── SecurityConfig.java
│       └── resources/
│           └── application.properties
├── SERVICE IA/                             ← Python FastAPI AI pipeline
├── docker-compose.yml
└── PROJECT_MEMORY.md                       ← this file
```

---

## 4. Plans & Quota Model

| Feature | Free | Premium (PRO) |
|---------|------|---------------|
| Daily credits | 3,000 | Unlimited (null) |
| Text word limit | 1,000 words | Unlimited (null) |
| File upload (PDF/DOCX) | ❌ Locked (preview shown) | ✅ |
| Full report | ❌ Blurred (upgrade CTA) | ✅ |
| Price | $0 | $10/month (configurable) |

Plan is stored on the `User` entity as `UserPlan` enum: `FREE` or `PRO`.

---

## 5. Auth Flow

- **Register** → POST `/api/v1/auth/register` → creates `FREE` account → returns JWT
- **Login** → POST `/api/v1/auth/login` → returns JWT
- **Me** → GET `/api/v1/auth/me` → returns full user object with quota fields
- Token stored in `localStorage` under key `veriai.auth.token`
- User object cached in `localStorage` under key `veriai.auth.user`
- `AppContext.tsx` manages all auth state; `useApp()` hook exposes it everywhere

---

## 6. What Was Done — Codex Session `019e0bf0`

### 6.1 Dashboard Title State Fix
**Commit:** `622a25d7` — *"Track dashboard draft title state"*

- Dashboard header title is now an editable `<input>`
- New scan resets title to `"Untitled scan"`
- After **successful** analysis the typed title is kept and status shows `Saved`
- Any text/file **edit** marks the scan as `Draft` and shows today's date
- Logic lives in `LoggedInDashboard.tsx`

### 6.2 Header Title Alignment Fix
**Commit:** `ac335f6f` — *"Constrain dashboard title input width"*

- Title input changed from `max-w-[240px] truncate` → `w-[104px]`
- Long titles now scroll horizontally inside the input instead of pushing nearby header controls out of alignment

### 6.3 Premium Upgrade Flow (No Payment Gateway Yet)
**Commit:** `6f1dfcff` — *"Move premium upgrade into account flow"*

- Signup flow **no longer pretends** there is payment at registration — creates Free account only
- `GuestDashboard` (landing page) has a proper **Free vs Premium** pricing section
- `Header` / dashboard has an **"Upgrade account"** action button for FREE users
- Free users see Premium report sections **blurred** with upgrade CTA overlaid
- File upload in locked state shows a **Premium preview card** (not an ugly disabled `<input>`)
- `ScanHistoryPage` passes the upgrade flow into locked/blurred reports
- Backend: added `POST /api/v1/auth/me/upgrade` endpoint (direct upgrade without payment, used as a seed/test path)
- Build passed (`npm run build` + `bash ./mvnw test`)
- Pushed, pulled on the DigitalOcean droplet, frontend + backend restarted

### 6.4 Full Stripe Payment Integration
**Implemented in the same session block (exact commit unknown — last before usage limit)**

#### Backend
- `BillingService.java` — full Stripe Checkout Session creation + webhook handling
  - Creates Stripe Checkout session via REST (no Stripe SDK — raw HTTP form POST)
  - Handles `checkout.session.completed` webhook event
  - Verifies Stripe-Signature HMAC-SHA256 with replay-attack tolerance (300 s)
  - On success: upgrades `User.plan` → `PRO`
- `BillingController.java`
  - `POST /api/v1/billing/checkout-session` — authenticated, returns `{ url }` for redirect
  - `POST /api/v1/billing/webhook` — public, consumes raw JSON, reads `Stripe-Signature` header
- `AppProperties.Billing` — config class with all Stripe env vars (see §8)
- `application.properties` — all Billing fields mapped to environment variables

#### Frontend
- `api.ts` — `createCheckoutSessionRequest(token)` → hits `/api/v1/billing/checkout-session`
- `AppContext.tsx` — `upgradeToPro()` action calls the above, then does `window.location.assign(checkout.url)` to redirect to Stripe Checkout
- `BillingStatusPage.tsx` — two components:
  - `BillingSuccessPage` — shown at `/billing/success`, calls `refreshUser()` to pull updated plan
  - `BillingCancelPage` — shown at `/billing/cancel`, informs user no charge was made
- `routes.tsx` — routes registered for `/billing/success` and `/billing/cancel`

---

## 7. Deployment Info

| Item | Value |
|------|-------|
| Server | DigitalOcean Droplet |
| IP | `161.35.50.52` |
| User | `root` |
| Project path | `/root/veriai-project` |
| Git branch | `frontend-restart` |
| Remote | fork → `frontend-restart` |

**Typical deploy flow:**
1. `git push` to fork on `frontend-restart`
2. SSH into droplet: `cd /root/veriai-project && git pull`
3. Restart frontend: `docker compose restart frontend` (or `npm run build` + copy dist)
4. Restart backend if Java changed: `docker compose restart backend`
5. Verify: `curl http://161.35.50.52:8080/actuator/health` → `{"status":"UP"}`

---

## 8. Payment Configuration (Stripe)

The entire payment flow is **built and wired**. It is currently **disabled** (`BILLING_ENABLED=false`).

To activate Stripe payments, the following environment variables must be set (on the droplet, in `.env` or `docker-compose.yml`):

| Env Var | Description |
|---------|-------------|
| `BILLING_ENABLED` | Set to `true` to enable billing endpoints |
| `STRIPE_SECRET_KEY` | Secret key from Stripe Dashboard (`sk_live_...` or `sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) from Stripe Dashboard |
| `STRIPE_PRICE_ID` | Price ID of the Premium product in Stripe (`price_...`) |
| `APP_PUBLIC_URL` | Public URL of the frontend (e.g. `http://161.35.50.52:3000`) |
| `STRIPE_CHECKOUT_MODE` | `payment` (one-time) or `subscription` (monthly) — default: `payment` |
| `STRIPE_SUCCESS_PATH` | Frontend path after success — default: `/billing/success` |
| `STRIPE_CANCEL_PATH` | Frontend path after cancel — default: `/billing/cancel` |
| `PREMIUM_MONTHLY_PRICE_USD` | Display price in UI — default: `10` |

**To fully go live with Stripe:**
1. Create a Stripe account at https://dashboard.stripe.com
2. Create a product + price (one-time or recurring) → copy `price_xxx` ID
3. In Stripe Dashboard → Webhooks → Add endpoint: `http://<YOUR_HOST>:8080/api/v1/billing/webhook`
4. Select event: `checkout.session.completed`
5. Copy the webhook signing secret (`whsec_xxx`)
6. Copy the secret key (`sk_live_xxx` or `sk_test_xxx` for testing)
7. Set all env vars above on the droplet
8. Set `BILLING_ENABLED=true`
9. Restart backend

**To test locally with Stripe CLI:**
```
stripe listen --forward-to localhost:8080/api/v1/billing/webhook
```
Use the CLI-provided webhook secret (`whsec_...`) as `STRIPE_WEBHOOK_SECRET`.

---

## 9. Last Unresolved Request (Session End)

The very last user message before the Codex session hit its usage limit was:

> **"how hard would it be to add payment?"**

The answer is: **it's already done** — the full Stripe integration is in place (see §6.4). The only remaining step is provisioning real Stripe keys and enabling the feature flag (`BILLING_ENABLED=true`). There is nothing left to build unless the user wants:

- Subscription management (cancel subscription, see next billing date)
- Stripe Customer Portal integration
- Invoice / receipt emails (Stripe handles this natively once configured)
- Webhook for `customer.subscription.deleted` to downgrade PRO → FREE on cancellation

---

## 10. Known Issues / TODO

- [ ] **Stripe subscription cancellation webhook** — if using `subscription` mode, the `customer.subscription.deleted` event should downgrade the user back to FREE. This is NOT yet handled in `BillingService.handleWebhook`.
- [ ] **UI bug from last screenshot** — user sent an image (`codex-clipboard-llbsir.png`) showing a UI issue just before the session ended. The agent never saw or handled it. Need to re-identify the issue from the live app or from a new screenshot.
- [ ] **`BILLING_DIRECT_UPGRADE_ENABLED`** — there is a config flag for a direct (non-Stripe) upgrade path (`POST /api/v1/auth/me/upgrade`). It should only be enabled for testing/seeding. Make sure it is `false` in production.
- [ ] **Free plan word limit enforcement** — double-check that the backend `QuotaService` correctly rejects text submissions over 1,000 words for FREE users.
- [ ] **Mobile layout** — the dashboard title input width (`w-[104px]`) may be too narrow on small screens. Evaluate on mobile.

---

## 11. Tech Stack Summary

**Frontend:**
- React 18, TypeScript, Vite
- React Router v6
- Tailwind CSS
- Radix UI (icons + primitives)
- `@radix-ui/react-icons`

**Backend:**
- Java 21, Spring Boot 3
- Spring Security + JWT
- Spring Data JPA + Hibernate
- PostgreSQL (Flyway migrations)
- Lombok
- Springdoc OpenAPI
- RestClient (for outbound HTTP to Stripe and AI service)

**AI Service:**
- Python, FastAPI
- Celery + Redis
- RoBERTa (HuggingFace)
- Custom stylistic + statistical analyzers

---

## 12. Design Tokens (Quick Reference)

| Token | Value |
|-------|-------|
| Primary blue | `#1f5cc4` / `#1263F1` |
| Dark text | `#0F172A` / `#07112f` |
| Body text | `#40516d` / `#52627a` |
| Background | `#f4f7fb` |
| Card border | `#d7dfed` / `#d8e0ec` |
| Success green | `#17633f` |
| Font | `Outfit`, system-ui, sans-serif |
| Border radius (cards) | `20px` / `28px` |
| Border radius (inputs) | `10px` |
| Border radius (buttons) | `10px` / `11px` |

---

*End of memory file. Update this document at the end of every work session.*