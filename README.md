# WeConnect — E-Waste Aggregator Platform

<p align="center">
  <strong>A full-stack B2B e-waste aggregation and reverse auction platform connecting corporates, recyclers, and individuals for compliant electronic waste disposal.</strong>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Platform Flow](#platform-flow)
- [User Roles](#user-roles)
- [Feature Modules](#feature-modules)
- [File Structure](#file-structure)
- [Route Map](#route-map)
- [Demo Credentials](#demo-credentials)
- [Deployment](#deployment)

---

## Overview

WeConnect is an enterprise-grade e-waste aggregator platform built for the Indian market. It digitises the entire lifecycle of e-waste disposal — from corporate requirement uploads and vendor site audits, through sealed/open reverse auctions, to payment settlement and regulatory compliance documentation.

### Key Highlights

- **Reverse Auction Engine** — Invitation → Sealed Bid → Live Open Auction with auto-extension
- **Multi-Role Dashboard** — Admin, Client (Corporate), Vendor (Recycler), Consumer (Individual)
- **End-to-End Compliance** — Form 6, Weight Slips, Recycling & Disposal Certificates
- **Real-Time Bidding** — Live auction with rank visibility, tick-size controls, and extension rules
- **Commission Model** — Automated 5% platform fee calculation with split payment flow
- **Dark Mode** — Global theme toggle across all roles
- **Responsive Design** — Collapsible sidebar, mobile-first layouts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16.2.4** (App Router + Turbopack) |
| Language | **TypeScript** |
| Styling | **Vanilla CSS** + CSS Custom Properties (Design Tokens) |
| State Management | **React Context API** with localStorage persistence |
| Icons | **Google Material Symbols** (Outlined, variable weight) |
| Typography | **Google Fonts** — Outfit (headlines), Inter (body) |
| Build | **Turbopack** (dev), Next.js optimised build (prod) |
| Deployment | **Vercel** (recommended) |

---

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd ecoloop-app

# Install dependencies
npm install

# Run development server
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                     │
│                   (Server + Client)                       │
├─────────────┬───────────┬───────────┬───────────────────┤
│   Admin     │  Client   │  Vendor   │    Consumer       │
│   Module    │  Module   │  Module   │    Module         │
├─────────────┴───────────┴───────────┴───────────────────┤
│              Shared Components Layer                      │
│   Sidebar │ Header │ Cards │ Modals │ AI Assistant       │
├─────────────────────────────────────────────────────────┤
│              AppContext (Global State)                    │
│   Users │ Listings │ Bids │ Audits │ Notifications      │
├─────────────────────────────────────────────────────────┤
│              Types Layer (TypeScript Interfaces)         │
│   User │ Listing │ Bid │ AuditInvitation │ AppState     │
├─────────────────────────────────────────────────────────┤
│              Design System (CSS Custom Properties)       │
│   Colors │ Typography │ Spacing │ Dark/Light Theme      │
└─────────────────────────────────────────────────────────┘
```

### State Management

The app uses a single `AppContext` provider that wraps the entire application:

- **Persistence** — State is serialised to `localStorage` under a versioned key (`weconnect_state_v12`)
- **Mock Data** — On demo login, realistic seed data loads spanning every pipeline stage
- **Actions** — 30+ context actions covering the full lifecycle (onboarding → auction → payment → compliance)
- **No Backend Required** — Fully functional frontend demo with simulated data flows

### Design System

CSS custom properties power a consistent visual language:

```
globals.css
├── Color tokens (primary, surface, on-surface, etc.)
├── Dark mode overrides (prefers-color-scheme + manual toggle)
├── Typography scale (headline, body, label)
├── Component styles (cards, buttons, inputs, badges)
└── Utility classes (gradients, shadows, animations)
```

---

## Platform Flow

```
Client Onboards ──► Requirement Upload ──► Admin Approves Listing
                                                    │
                                                    ▼
                                         Vendor Invitation Window
                                                    │
                                                    ▼
                                    ┌───────────────────────────────┐
                                    │     AUDIT FLOW                │
                                    │  Admin sends site audit       │
                                    │  Vendor accepts/declines      │
                                    │  SPOC details shared          │
                                    │  Vendor submits audit report  │
                                    │  (product match + remarks)    │
                                    └───────────┬───────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────────────┐
                                    │     SEALED BID PHASE          │
                                    │  Vendors submit blind bids    │
                                    │  Client reviews ranked table  │
                                    │  Admin shortlists vendors     │
                                    └───────────┬───────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────────────┐
                                    │     LIVE AUCTION               │
                                    │  Base/Target price set        │
                                    │  Tick size + max extensions   │
                                    │  Real-time rank visibility    │
                                    │  Auto-extension (last 3 min)  │
                                    │  Winner = Rank 1 vendor       │
                                    └───────────┬───────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────────────┐
                                    │     FINAL QUOTE                │
                                    │  Vendor uploads:              │
                                    │   - Product-wise quote        │
                                    │   - Letterhead quotation      │
                                    │  Client approves/rejects      │
                                    └───────────┬───────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────────────┐
                                    │     PAYMENT FLOW               │
                                    │  Vendor sees bank details:    │
                                    │   - Client account (95%)      │
                                    │   - WeConnect account (5%)    │
                                    │  Uploads UTR + screenshot     │
                                    │  Admin confirms payment       │
                                    └───────────┬───────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────────────┐
                                    │     PICKUP & COMPLIANCE        │
                                    │  Vendor schedules pickup      │
                                    │  Uploads:                     │
                                    │   - Form 6                    │
                                    │   - Weight Slip (Empty)       │
                                    │   - Weight Slip (Loaded)      │
                                    │   - Recycling Certificate     │
                                    │   - Disposal Certificate      │
                                    │  Admin verifies               │
                                    │  Client downloads all docs    │
                                    └───────────────────────────────┘
                                                │
                                                ▼
                                          ✅ COMPLETED
```

---

## User Roles

### 🔵 Admin (WeConnect Operations)
Full platform oversight — user approvals, auction management, payment confirmation, compliance verification.

### 🟢 Client (Corporate / Generator)
Organisations disposing of e-waste — post listings, set auction parameters, approve quotes, download compliance docs.

### 🟠 Vendor (Recycler / Dismantler)
CPCB-authorised recyclers — respond to invitations, conduct audits, bid in auctions, upload quotes and compliance docs.

### 🟡 Consumer (Individual)
Individual users disposing small quantities — simplified pickup flow via dedicated consumer dashboard.

---

## Feature Modules

### 1. Onboarding & Authentication
- Multi-role registration (Client / Vendor / Consumer)
- 4-step onboarding wizard (Profile → Documents → Bank → Review)
- Admin manual approval for vendors (CPCB/GST/License verification)
- Role-based login portals

### 2. Listing & Requirement Management
- E-waste listing creation with images, categories, weight, location
- Admin review and approval pipeline
- Requirement sheet upload and standardisation flow
- Client confirmation of product list and target price

### 3. Vendor Audit System
- Admin sends audit invitations to qualified vendors
- SPOC (Single Point of Contact) details shared on acceptance
- Vendor conducts on-site audit
- Product match verification with mandatory remarks on mismatch

### 4. Sealed Bid Phase
- Blind bid submissions (vendors can't see competitors)
- Admin-side comparison table with auto price highlight
- Client review of ranked bid table
- Configurable bid windows with deadlines

### 5. Live Reverse Auction
- Real-time bidding with WebSocket-ready architecture
- Configurable: Base Price, Target Price, Tick Size, Max Tick, Extension Time
- Auto-extension on last-minute bids
- Rank visibility with gap-to-next display
- Bid history timeline

### 6. Final Quote & Deal Closing
- Winner vendor uploads product-wise quote (Excel/PDF) + letterhead
- Client reviews financial breakdown (bid amount, 5% commission, net receivable)
- Approve or reject with remarks
- Admin oversight via Contracts page

### 7. Payment Settlement
- Split payment display (Client account + WeConnect commission)
- Bank details shown on portal for both payees
- UTR / transaction reference upload
- Payment screenshot/proof upload
- Admin verification and confirmation

### 8. Pickup & Compliance
- Vendor schedules pickup date
- Document uploads:
  - **Form 6** (regulatory waste transfer form)
  - **Weight Slip — Empty Vehicle**
  - **Weight Slip — Loaded Vehicle**
  - **Recycling Certificate**
  - **Disposal Certificate**
- Admin reviews and verifies all documents
- Client downloads complete compliance package

### 9. Analytics & Reporting
- **Analytics Hub** — Platform revenue, commission earned, deal velocity, category breakdown
- **Performance Metrics** — Vendor win rates, audit accuracy, compliance scores
- **Document Library** — Central repository with type-based filtering (auction/compliance/onboarding)
- **Reports** — Role-specific insights and export capabilities

### 10. Notifications & Alerts
- Real-time notification system across all roles
- Auction alerts (bid received, highest bid, closing soon)
- Workflow transitions (approval, rejection, payment due)
- Unread badge counts in sidebar

### 11. Dark Mode & UI
- Global light/dark theme toggle
- CSS custom properties for instant theme switching
- Glassmorphism effects, smooth transitions
- Collapsible sidebar with mobile support
- Material Symbols with variable weight fills

---

## File Structure

```
ecoloop-app/
├── public/
│   └── logo 3.png                    # WeConnect logo
│
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── layout.tsx                # Root layout + providers
│   │   ├── page.tsx                  # Landing page
│   │   ├── globals.css               # Design system + theme tokens
│   │   │
│   │   ├── admin/                    # ── ADMIN MODULE ──────────────
│   │   │   ├── layout.tsx            # Admin layout wrapper
│   │   │   ├── page.tsx              # Admin redirect
│   │   │   ├── dashboard/page.tsx    # Main dashboard with KPIs
│   │   │   ├── users/page.tsx        # Client management
│   │   │   ├── vendors/page.tsx      # Vendor approval & management
│   │   │   ├── listings/page.tsx     # Listing review & approval
│   │   │   ├── auctions/page.tsx     # Auction phase pipeline control
│   │   │   ├── auctions/[id]/live/   # Live auction monitor
│   │   │   ├── audits/page.tsx       # Site audit invitation management
│   │   │   ├── contracts/page.tsx    # Final quote review & deal closing
│   │   │   ├── payments/page.tsx     # Payment proof verification
│   │   │   ├── transactions/page.tsx # Transaction history
│   │   │   ├── logistics/page.tsx    # Pickup scheduling & tracking
│   │   │   ├── compliance/page.tsx   # Compliance document verification
│   │   │   ├── documents/page.tsx    # Central document library
│   │   │   ├── performance/page.tsx  # Vendor/client performance metrics
│   │   │   ├── analytics-hub/page.tsx# Revenue & category analytics
│   │   │   ├── reports/page.tsx      # Reports & insights
│   │   │   ├── profile/page.tsx      # Admin profile
│   │   │   └── settings/page.tsx     # Platform settings
│   │   │
│   │   ├── client/                   # ── CLIENT MODULE ─────────────
│   │   │   ├── layout.tsx            # Client layout wrapper
│   │   │   ├── dashboard/page.tsx    # Client dashboard
│   │   │   ├── post/page.tsx         # Create new e-waste listing
│   │   │   ├── listings/page.tsx     # My listings
│   │   │   ├── listings/[id]/        # Listing detail + configure live
│   │   │   ├── bids/page.tsx         # Bids received on listings
│   │   │   ├── sealed-bids/page.tsx  # Sealed bid review table
│   │   │   ├── live-auction/page.tsx # Live auction participation
│   │   │   ├── final-quote/page.tsx  # Final quote approval/rejection
│   │   │   ├── documents/page.tsx    # Compliance doc download
│   │   │   ├── reports/page.tsx      # Client reports
│   │   │   ├── notifications/page.tsx# Notification centre
│   │   │   └── profile/page.tsx      # Client profile & settings
│   │   │
│   │   ├── vendor/                   # ── VENDOR MODULE ─────────────
│   │   │   ├── layout.tsx            # Vendor layout wrapper
│   │   │   ├── dashboard/page.tsx    # Vendor dashboard
│   │   │   ├── marketplace/page.tsx  # Browse available auctions
│   │   │   ├── marketplace/[id]/     # Auction detail view
│   │   │   ├── invitations/page.tsx  # Auction invitations
│   │   │   ├── audits/page.tsx       # Site audit accept/complete flow
│   │   │   ├── live-auction/page.tsx # Live bidding interface
│   │   │   ├── auctions/[id]/        # Auction detail + live
│   │   │   ├── bids/page.tsx         # My bid history
│   │   │   ├── final-quote/page.tsx  # Upload product quote + letterhead
│   │   │   ├── payments/page.tsx     # Payment details + UTR upload
│   │   │   ├── pickups/page.tsx      # Logistics + compliance doc upload
│   │   │   ├── analytics/page.tsx    # Vendor analytics
│   │   │   ├── reports/page.tsx      # Vendor reports
│   │   │   ├── profile/page.tsx      # Profile & document management
│   │   │   └── settings/page.tsx     # Vendor settings
│   │   │
│   │   ├── consumer/                 # ── CONSUMER MODULE ───────────
│   │   │   ├── dashboard/page.tsx    # Consumer dashboard
│   │   │   └── pickup/page.tsx       # Schedule pickup
│   │   │
│   │   ├── onboarding/               # ── ONBOARDING FLOW ───────────
│   │   │   └── [role]/step1-4/       # 4-step wizard per role
│   │   │
│   │   ├── get-started/page.tsx      # Role selection
│   │   ├── admin-login/page.tsx      # Admin login
│   │   ├── client-login/page.tsx     # Client login
│   │   ├── vendor-login/page.tsx     # Vendor login
│   │   ├── user-login/page.tsx       # Consumer/individual login
│   │   └── pending/page.tsx          # Pending approval screen
│   │
│   ├── components/                   # ── SHARED COMPONENTS ─────────
│   │   └── shared/
│   │       ├── Sidebar.tsx           # Collapsible role-based sidebar
│   │       ├── Header.tsx            # Top bar with search & theme
│   │       └── AiAssistantCard.tsx   # AI insight card (admin)
│   │
│   ├── context/
│   │   └── AppContext.tsx            # Global state (30+ actions)
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces
│   │
│   ├── hooks/                        # Custom React hooks
│   └── utils/                        # Utility functions
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

## Route Map

### Static Pages (○) — 50 prerendered routes

| Route | Role | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/get-started` | Public | Role selection |
| `/admin-login` | Public | Admin login portal |
| `/client-login` | Public | Client login portal |
| `/vendor-login` | Public | Vendor login portal |
| `/user-login` | Public | Consumer login portal |
| `/pending` | Public | Pending approval screen |
| | | |
| **Admin** | | |
| `/admin/dashboard` | Admin | Main dashboard with KPIs, activity feed |
| `/admin/users` | Admin | Client management & approval |
| `/admin/vendors` | Admin | Vendor onboarding approval |
| `/admin/listings` | Admin | Listing review pipeline |
| `/admin/auctions` | Admin | Auction phase control (5 stages) |
| `/admin/audits` | Admin | Site audit invitation management |
| `/admin/contracts` | Admin | Final quote review & deal closing |
| `/admin/payments` | Admin | Payment proof verification |
| `/admin/transactions` | Admin | Transaction history log |
| `/admin/logistics` | Admin | Pickup & document tracking |
| `/admin/compliance` | Admin | Compliance verification centre |
| `/admin/documents` | Admin | Central document library |
| `/admin/performance` | Admin | Vendor/client performance metrics |
| `/admin/analytics-hub` | Admin | Revenue, category, deal analytics |
| `/admin/reports` | Admin | Reports & insights |
| `/admin/profile` | Admin | Admin profile |
| `/admin/settings` | Admin | Platform settings |
| | | |
| **Client** | | |
| `/client/dashboard` | Client | Client overview dashboard |
| `/client/post` | Client | Post new e-waste listing |
| `/client/listings` | Client | My listings management |
| `/client/bids` | Client | Bids received on listings |
| `/client/sealed-bids` | Client | Sealed bid ranking review |
| `/client/live-auction` | Client | Live auction monitor |
| `/client/final-quote` | Client | Approve/reject vendor quotes |
| `/client/documents` | Client | Download compliance certificates |
| `/client/reports` | Client | Client reports |
| `/client/notifications` | Client | Notification centre |
| `/client/profile` | Client | Profile & settings |
| | | |
| **Vendor** | | |
| `/vendor/dashboard` | Vendor | Vendor overview dashboard |
| `/vendor/marketplace` | Vendor | Browse open auctions |
| `/vendor/invitations` | Vendor | Auction invitation responses |
| `/vendor/audits` | Vendor | Site audit accept & report flow |
| `/vendor/live-auction` | Vendor | Live bidding interface |
| `/vendor/bids` | Vendor | Bid history |
| `/vendor/final-quote` | Vendor | Upload product-wise quote |
| `/vendor/payments` | Vendor | Payment details & UTR upload |
| `/vendor/pickups` | Vendor | Logistics + compliance uploads |
| `/vendor/analytics` | Vendor | Performance analytics |
| `/vendor/reports` | Vendor | Vendor reports |
| `/vendor/profile` | Vendor | Profile & document management |
| | | |
| **Consumer** | | |
| `/consumer/dashboard` | Consumer | Individual user dashboard |
| `/consumer/pickup` | Consumer | Schedule e-waste pickup |

### Dynamic Pages (ƒ) — 6 server-rendered routes

| Route | Purpose |
|---|---|
| `/admin/auctions/[id]/live` | Admin live auction monitor |
| `/client/listings/[id]/configure-live` | Configure live auction params |
| `/vendor/auctions/[id]` | Vendor auction detail |
| `/vendor/auctions/[id]/live` | Vendor live bidding |
| `/vendor/marketplace/[id]` | Marketplace listing detail |
| `/onboarding/[role]/step1-4` | Dynamic onboarding wizard |

---

## Demo Credentials

| Role | Email | What You'll See |
|---|---|---|
| **Admin** | `process.env.ADMIN_EMAIL` | Full platform — all modules with mock data |
| **Client** | `client@weconnect.com` | Listings, sealed bids, final quote approval, docs |
| **Vendor** | `vendor@weconnect.com` | Audits, bidding, final quote upload, payments |
| **Consumer** | `consumer@weconnect.com` | Individual pickup dashboard |

> **Note:** No password required for demo accounts. The storage key is versioned — to reset mock data, clear localStorage or it auto-refreshes on version bumps.

---

## Context Actions Reference

### Onboarding
| Action | Description |
|---|---|
| `startOnboarding()` | Initiate role-based onboarding |
| `saveOnboardingProfile()` | Save company/contact details |
| `saveOnboardingDocuments()` | Save uploaded documents |
| `saveOnboardingBankDetails()` | Save bank verification |
| `completeOnboarding()` | Finalise and submit for approval |

### Core Operations
| Action | Description |
|---|---|
| `addListing()` | Create new e-waste listing |
| `editListing()` | Update listing fields |
| `updateListingStatus()` | Approve/reject listings |
| `updateAuctionPhase()` | Transition auction stages |
| `addBid()` | Place a bid (sealed or open) |
| `acceptBid()` | Accept winning bid |
| `respondToInvitation()` | Vendor responds to auction invite |
| `transitionAuctionPhase()` | Move auction to next phase |

### Audit Flow
| Action | Description |
|---|---|
| `sendAuditInvitations()` | Admin sends site audit invites with SPOC |
| `respondToAuditInvitation()` | Vendor accepts or declines audit |
| `completeAudit()` | Vendor submits product match + remarks |

### Post-Auction Flow
| Action | Description |
|---|---|
| `submitFinalQuote()` | Vendor uploads quote documents |
| `approveFinalQuote()` | Client approves → unlocks payment |
| `rejectFinalQuote()` | Client rejects with remarks |
| `submitPaymentProof()` | Vendor uploads UTR + screenshot |
| `confirmPayment()` | Admin confirms → unlocks compliance |
| `submitComplianceDocs()` | Vendor uploads 5 compliance documents |
| `verifyCompliance()` | Admin verifies → marks deal complete |

---

## Deployment

### Vercel (Recommended)

```bash
npm run build    # Production build with Turbopack
# Deploy via Vercel CLI or GitHub integration
```

### Environment

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- No environment variables required (frontend-only demo)
- No database required (localStorage persistence)

---

## License

This project is part of an academic internship at **Mirai Intex**. All rights reserved.

---

<p align="center">
  Built with ❤️ by the WeConnect Team<br/>
  <em>E-Waste Aggregator Platform — Connecting Corporates with Certified Recyclers</em>
</p>
