# EcoLoop — Client Discovery Questions
### Gap Analysis, Risk Identification & Requirements Validation

> These questions are structured around what the platform currently does vs. what it may need to do in production. Each question is annotated with the **current behavior** and the **gap it surfaces**.

---

## SECTION 1: Authentication & User Identity

**Current behavior**: Login is simulated. No passwords are stored or verified. Any user can log in as any demo account by just typing a name.

---

**Q1.** When a new vendor registers and goes through the onboarding flow, how should the platform verify that the person registering is actually from the company they claim? Is email verification sufficient, or do you need document-based identity proof (like a company registration number check)?

> **Gap**: Currently, any user can register any name and role with no verification. No email OTP, no password confirmation.

---

**Q2.** Clients are businesses (banks, corporations) that are liquidating assets through e-auctions. Should a client also go through the same 4-step onboarding as a vendor, or is there a simpler fast-track registration for institutional clients?

> **Gap**: The current client onboarding is a minimal 4-step flow. No corporate KYC or institutional validation exists.

---

**Q3.** What happens if a vendor changes their company name or CPCB registration number after they've been approved? Should the admin need to re-verify them?

> **Gap**: No re-verification mechanism exists. Profile updates don't trigger admin review.

---

**Q4.** Should an admin be able to **suspend** a vendor mid-auction (e.g., if fraud is detected), and if so, what happens to their active bids?

> **Gap**: Admin can only set status `active/pending/rejected`. There's no suspension of in-flight bids when a vendor is rejected.

---

## SECTION 2: Auction Logic & Integrity

**Current behavior**: Auction start/end dates are stored, but the platform does NOT automatically close auctions at the end date. The winner is determined by the client after the fact. The bid increment is stored but not enforced — a vendor can technically bid any amount.

---

**Q5.** Should auction closeout be **automatic** (the platform auto-selects the highest bidder when the end time passes) or **manual** (the client reviews and manually selects the winner)?

> **Gap**: Currently the UI says "Auction automatically concluded" when `now > endDate`, but no automatic winner is set in the database. The "accept" button was removed and bid acceptance is now entirely time-based in the client view. The actual Bid status is never set to `accepted` by the timer — this is a silent bug.

---

**Q6.** Should the bid increment be **strictly enforced** (a vendor cannot bid less than `currentHighBid + bidIncrement`)? Right now the form on the detail page calculates the minimum but doesn't block lower bids.

> **Gap**: The `requiredBidAmount` is shown as a hint but is not a hard validation. A vendor can bypass the UI and technically submit a lower bid.

---

**Q7.** Do you need an **EMD (Earnest Money Deposit)** mechanism — where a vendor must pay a security deposit before they can bid? The data model has a `highestEmdAmount` field but it is not used anywhere in the UI.

> **Gap**: The `highestEmdAmount` field exists in the `Listing` type but is completely orphaned — no UI or logic references it.

---

**Q8.** Should there be **auction extension logic** — e.g., if a bid comes in within the last 5 minutes of an auction, the end time automatically extends by 5 more minutes (common in industrial e-auctions)?

> **Gap**: The `extensionTime` field exists in the `Listing` type but is never used in any component. The platform will NOT auto-extend auctions.

---

**Q9.** Can a vendor **withdraw a bid** after placing it, or is the bid irrevocable?

> **Gap**: Once a bid is placed, there is no withdrawal option in the UI. The `Bid` status can only go `pending → accepted/rejected` by the system.

---

**Q10.** Can a **client edit their listing** after it has gone live (e.g., correct a typo in the title or extend the auction date)?

> **Gap**: `editListing()` exists and is used in the `client/listings` page. However, there is no restriction preventing edits after the auction has started or received bids. Editing a live auction's base price or dates could be exploited.

---

## SECTION 3: Documents, Compliance & Legal

**Current behavior**: Documents are uploaded using browser-local `URL.createObjectURL()`. This means document URLs are only valid in the current browser session — they will break on page refresh or on a different device. No actual file hosting exists.

---

**Q11.** The platform currently simulates document uploads (pre-auction docs in `client/post`, closing docs in `client/bids`). In production, where should these files be stored — on a cloud storage like **AWS S3, Google Cloud Storage, or Azure Blob**, or does the client have a preferred document management system (e.g., SharePoint)?

> **Gap**: All uploads are fake. `URL.createObjectURL()` is volatile and session-bound. A real file hosting backend is required for production.

---

**Q12.** Should the **Recycling Certificates** and **Pickup Challans** (currently generated as plain `.txt` files) be proper PDF documents with the EcoLoop logo, digital signatures, and a QR code for verification?

> **Gap**: Currently certificates are plain text blobs. For corporate compliance reporting (CSR/EPR), clients likely need PDF certificates with official formatting.

---

**Q13.** The CPCB authorization number entered by a vendor during onboarding — should the platform **validate it against the official CPCB database** in real-time, or is manual admin review sufficient?

> **Gap**: Currently the CPCB number is just stored as text. There is no API integration to verify it.

---

**Q14.** Are the 4 mandatory pre-auction documents (Auction Notice, T&C, Asset Details, Ownership Proof) standard across all clients, or do some clients (e.g., banks under SARFAESI) have additional mandatory documents?

> **Gap**: The document list is hardcoded in `client/post/page.tsx`. It cannot be customized per client type or industry.

---

## SECTION 4: Payments & Settlement

**Current behavior**: There is no payment system. Bid amounts are just numbers in the database. Settlement is entirely offline.

---

**Q15.** Does the platform need to handle financial transactions (payment gateway, escrow, payout to client), or is money settlement always handled offline through traditional bank transfer/NEFT?

> **Gap**: No payment integration exists. The platform only records the agreed-upon amount.

---

**Q16.** After an auction closes and a winner is confirmed, what is the standard payment timeline? Does the platform need to **track payment status** (e.g., Pending → Payment Received → Documents Released)?

> **Gap**: Currently the "Post-Auction Settlement" section just shows document upload slots. There is no payment status tracking between winning bid → document handover.

---

**Q17.** Does the platform need to generate **GST Tax Invoices** automatically on transaction completion, or is that done externally by the vendor's accounting team?

> **Gap**: The closing documents list includes "Tax Invoice (GST)" as a manually uploaded document. No auto-generation exists.

---

## SECTION 5: Notifications & Communication

**Current behavior**: The platform has an in-app notification system. There are no emails, SMS, or push notifications. Notifications are only delivered if the user is actively logged into the platform.

---

**Q18.** Should vendors be notified via **email or SMS** when a new listing goes live (especially in their preferred material category), or is in-app notification sufficient?

> **Gap**: No email/SMS infrastructure exists. A vendor might miss a new auction entirely if they don't log in.

---

**Q19.** When an auction ends and a vendor wins, should they receive an **automatic email** with the winner confirmation and instructions for the next steps?

> **Gap**: Currently, vendors only see their win status inside the platform. No outbound communication exists.

---

**Q20.** Should there be **real-time, live notifications** during an active auction — e.g., "You have been outbid — your bid of ₹50,000 is no longer the highest"?

> **Gap**: The platform is not real-time. It only shows the current state when a user refreshes or navigates. No WebSocket or polling exists.

---

## SECTION 6: Logistics & Pickups

**Current behavior**: The `vendor/pickups` page derives pickups from bids with status `accepted`. The pickup dates in the UI are estimated (bid date + 7 days) and statuses are randomly seeded for the demo. There is no real logistics or scheduling system.

---

**Q21.** After a bid is won, who is responsible for **scheduling the physical pickup** — the vendor, the client, or the platform? Is there a formal scheduling workflow, or is it coordinated over phone/email outside the platform?

> **Gap**: The platform shows an estimated pickup date but has no actual scheduling mechanism. Vendors cannot propose or confirm actual dates.

---

**Q22.** Should the platform integrate with any **logistics partners** (e.g., Mahindra Logistics, Blue Dart, in-house fleet) for pickup tracking, or is the logistics coordination entirely external?

> **Gap**: No logistics API integration exists. The platform shows a simulated "In Transit" status.

---

**Q23.** Should both the **client and vendor** be able to view the real-time pickup status, and who updates it (the vendor, the platform admin, or a logistics partner API)?

> **Gap**: Pickup status is a local enum that no one can actually update from within the platform currently.

---

## SECTION 7: Admin & Oversight

**Current behavior**: The admin can approve/reject vendors and users, view all listings and transactions, and see reports. All data is shared state — the admin sees everything.

---

**Q24.** Should there be **multiple admin accounts** with different permission levels (e.g., a "Listing Approver" who can only approve listings, vs. a "Super Admin" who can manage users and settings)?

> **Gap**: Currently there is a single flat admin role. All admins see and can do everything.

---

**Q25.** When an admin **rejects a vendor**, should the vendor receive an automated rejection email with the reason, and should they be allowed to reapply after updating their documents?

> **Gap**: Rejection sets the status to `rejected` in state. No communication is sent, and there's no reapplication workflow.

---

**Q26.** Should the admin be able to **approve or reject** individual listings before they go live on the marketplace, or do all listings from verified clients automatically go live?

> **Gap**: Currently, listings are immediately set to `active` when a client submits them. There is no admin approval step for individual listings.

---

**Q27.** The reports page shows platform-wide stats (total revenue, listings, vendors). Who is this report for? Does it need to be **exportable as a PDF or Excel** for management?

> **Gap**: Reports are in-UI only. No export functionality exists.

---

## SECTION 8: Mobile & Access

**Current behavior**: The platform is now fully responsive with a hamburger drawer navigation. It works on all screen sizes. However, it is a web app — not a native app.

---

**Q28.** Are vendors expected to primarily use the platform on **mobile phones** (while on-site doing inspections), or are they primarily desktop users?

> **Gap**: The current design is desktop-first with mobile support. A true on-site-inspection flow (camera upload, GPS location, offline mode) would require a Progressive Web App (PWA) or React Native app.

---

**Q29.** Should the platform work **offline** in areas with poor cellular connectivity (e.g., a vendor at a factory checking pickup status)?

> **Gap**: The platform requires a live internet connection. There is no service worker or offline caching.

---

## SECTION 9: Data Lifecycle & Privacy

**Current behavior**: All data is stored in browser localStorage. Clearing the browser wipes the entire state. There is no server-side data.

---

**Q30.** How long should auction data (bid records, closing documents, certificates) be **retained**? Is there a legal/compliance obligation to store e-auction bid history for auditing purposes (common in SARFAESI-regulated auctions)?

> **Gap**: localStorage is cleared by the user or browser at any time. No persistent server-side record exists.

---

**Q31.** Who owns the data on the platform — the client organization, the vendor, or EcoLoop? Who can delete a listing and its bid history?

> **Gap**: Any logged-in client can edit or cancel their own listings with no audit trail. No deletion log or soft-delete mechanism exists.

---

## SECTION 10: Business Model

**Q32.** Does EcoLoop charge a **platform fee** (fixed per listing, percentage of final bid, or subscription)? If yes, this needs to be built into the payment/settlement flow.

---

**Q33.** Is the platform intended to be a **multi-tenant SaaS** (many different organizations with isolated data), or a **single-organization deployment** (EcoLoop operates it as a centralized marketplace)?

> **Gap**: Currently the platform is a single shared state. All clients and vendors are in the same pool. Multi-tenancy would require organization-level data isolation.

---

**Q34.** Are there plans to integrate this platform with **government e-auction portals** (like MSTC, eBKray, NARCL) or banking core systems (Finacle, TCS Bancs) for data sync?

> **Gap**: No external system integrations exist. The platform is fully standalone.

---

## Quick Summary of Critical Gaps Discovered

| # | Gap | Severity |
|---|---|---|
| 1 | Auction auto-close doesn't actually set Bid.status = `accepted` | 🔴 Critical Bug |
| 2 | Document uploads are session-only (createObjectURL) | 🔴 Critical for Production |
| 3 | Bid increment is not validated — vendors can bid any amount | 🟠 High |
| 4 | EMD field exists in data model but is completely unused | 🟠 High |
| 5 | No email/SMS notifications | 🟠 High |
| 6 | Pickup scheduling has no real workflow | 🟡 Medium |
| 7 | Vendor rejection has no reapplication path | 🟡 Medium |
| 8 | No listing approval step by admin | 🟡 Medium |
| 9 | Reports have no export (PDF/Excel) | 🟡 Medium |
| 10 | No payment/settlement tracking | 🟡 Medium |
| 11 | Auction extension time field is unused | 🟡 Medium |
| 12 | Certificates are plain text, not PDFs | 🟢 Low (cosmetic) |
| 13 | No multi-admin permission levels | 🟢 Low |
