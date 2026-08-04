# UX & Flow Audit — Finova LOS

Audit of user experience and end-to-end flows across the admin console.
Companion to [UI_MIGRATION_PLAN.md](UI_MIGRATION_PLAN.md) (which covers *visual/component* migration).
This document covers **behaviour, flow integrity, and journey completeness** — the things
a component library swap will not fix.

---

## 0. Scope of the codebase

| Metric | Value |
|---|---|
| `.tsx` files | 911 |
| Lines of TSX | ~167,000 |
| Unique route paths | 457 |
| Route entries in `path.tsx` | 663 |
| Eager imports in `path.tsx` | 428 |
| Axios instances | 17 |
| Error boundaries | **0** |
| `React.lazy` / `Suspense` | **0** |
| Files with `aria-label` | 16 (1.8%) |
| Files with responsive breakpoints | 90 (10%) |
| Files with an empty state | 42 (4.6%) |
| Unsaved-change guards | 6 references, whole app |
| `src/components/shared/` | **empty** |

The headline: this is a very large product surface built at speed, where **page count grew
but the connective tissue between pages did not.** Almost every problem below is a
consequence of that.

---

# PART A — Broken foundations

These are not cosmetic. They break the session, lose user work, or leave the user stranded.
Fix these before any new feature flow.

## A1. 🔴 Session expiry is a race condition — can trap the user in a redirect loop

**Evidence:** [src/redux/store.ts:7-13](../src/redux/store.ts#L7-L13) and
[src/redux/rootReducer.ts:7-11](../src/redux/rootReducer.ts#L7-L11)

The auth token is persisted **twice, in two different storages**:

```
store.ts      → persistReducer(key: "root",  storage: localStorage)    ← wraps everything
rootReducer.ts → persistReducer(key: "auth", storage: sessionStorage)  ← whitelist includes "token"
```

Nested `persistReducer` means the token lives in **both** `localStorage["persist:root"]`
*and* `sessionStorage["persist:auth"]`.

Now look at what the 401 handlers actually clear:

| Cleared on 401 | How many of the 17 axios instances |
|---|---|
| `localStorage.token` + `userData` | 17 |
| `localStorage["persist:root"]` | **2** ([axios.ts:43](../src/utils/axios.ts#L43), [axiosCardManagement.ts:33](../src/utils/axiosCardManagement.ts#L33)) |
| `sessionStorage["persist:auth"]` | **0** |

Every handler then does `window.location.href = "/login"` — a **hard reload**.
The only thing clearing the persisted token is the async `setToken("")` dispatch, which
redux-persist flushes on a `setTimeout`. That timeout is racing a page navigation.

**When the race is lost:** reload → `PersistGate` rehydrates the token from
`sessionStorage["persist:auth"]` → [PublicRoute.tsx](../src/Routes/PublicRoute.tsx) sees a
token and bounces the user to `/LOS/Dashboard` → the dashboard fires an API call → 401 →
back to `/login`. **Loop.** The user's only escape is manually clearing storage.

**Fix**
1. Delete the nested persist. Keep exactly one `persistReducer`, one storage, one key.
2. Write a single `clearSession()` in `src/utils/session.ts` that calls
   `persistor.purge()`, awaits it, *then* navigates.
3. Collapse all 17 interceptors onto one shared factory (see A2).

## A2. 🔴 17 axios instances with 17 divergent copies of the same error handling

**Evidence:** `src/utils/axios*.ts` — 17 files.

The 401 blocks are copy-paste variants that have drifted apart:

| Instance | Toast on expiry | Guards `pathname !== "/login"` | Clears `persist:root` |
|---|---|---|---|
| `axios.ts` | ✅ | ❌ | ✅ |
| `axiosLms.ts` | ✅ | ❌ | ❌ |
| `axiosCms.ts` | ❌ (silent) | ❌ | ❌ |
| `axiosRiskService.ts` | ❌ (silent) | ❌ | ❌ |
| `axiosFactoring.ts` | ✅ | ✅ | ❌ |
| `axiosThirdParty.ts` | — (401 block **commented out**) | — | — |

Consequences the user actually feels:
- **Silent logouts.** CMS and Risk pages dump you at `/login` with no explanation.
- **Toast storms.** A dashboard firing 6 parallel calls hits 6 interceptors → 6 "Session
  expired" toasts and 6 competing `window.location` assignments.
- **Third-party pages never log you out at all** — the handler is commented out, so you sit
  on a page of empty tables wondering why nothing loads.

**Fix:** one `createApiClient(baseURL, opts)` factory in `src/utils/apiClient.ts`.
Single 401 path, de-duplicated via a module-level `isLoggingOut` flag. Migrate the 17
call-sites to it. No behaviour change per-domain except correctness.

## A3. 🔴 No error boundaries — one render error blanks the entire app

**Evidence:** zero matches for `ErrorBoundary`, `componentDidCatch`, or React Router's
`errorElement` across `src/`.

Any thrown render error — a `null` from an API the component didn't guard, a bad `.map` —
unmounts the whole React tree. The user gets a **white screen**, no message, no recovery.
In a 167k-line app with heavy optional-chaining debt, this is not hypothetical.

**Fix**
1. Add `errorElement` to the root route in [path.tsx](../src/Routes/path.tsx) — a proper
   "Something went wrong" page with *Retry* and *Back to dashboard*.
2. Add a per-route `errorElement` so a broken page keeps the shell (sidebar/header) intact
   and only the content pane shows the error.
3. Wrap independently-failing widgets (dashboard chart tiles) in a local boundary so one
   dead widget doesn't kill the dashboard.

## A4. 🔴 Any logged-in user can reach any of the 457 routes

**Evidence:** [PrivateRoute.tsx](../src/Routes/PrivateRoute.tsx) checks **only** that a token
string exists. It does not validate expiry, and **`path.tsx` contains no permission checks
at all** — the only mention of `NoAccess` is as a manually-navigable landing page.

Meanwhile 173 in-component `hasPermission()` calls across 49 files gate *buttons*.
So permissions hide the button but not the page. Type
`/LOS/Setting/AssignPermissions` in the URL bar and you are in.

The user-facing symptom isn't only a security gap — it's that unauthorised users land on
pages that 403 on every call and render as **broken empty tables with no explanation**.

**Fix:** a `<RequirePermission perm="...">` wrapper element, applied at the route level in
`path.tsx`, rendering `<NoAccess />` on failure. Derive the required permission per route
from the same map that builds the sidebar, so the two can never diverge.

## A5. 🟠 Multi-step wizards lose work and can be entered mid-way

**Evidence:** [createBasicInfo.tsx](../src/components/ProductManagement/createBasicInfo.tsx)
— the 5-step Product Create flow is **5 sibling routes with no parent route and no shared
state container**:

```
/LOS/ProductManagement/Create/BasicInfo
/LOS/ProductManagement/Create/CommodityInfo
/LOS/ProductManagement/Create/ProductSettings
/LOS/ProductManagement/Create/RequiredDocuments
/LOS/ProductManagement/Create/ProductAffiliation
```

State is threaded between them through **hand-rolled `localStorage` + `sessionStorage`
keys** (`productId`, `productFormData`, `selectedCategories`), with manual save/load/clear
logic and `try/catch` around every `JSON.parse`.

Problems:
- **No step guard.** Deep-link to step 4 with no product started → a form bound to nothing.
- **No progress indicator across steps** — each route renders standalone; the user cannot
  see how many steps remain.
- **Abandoned drafts leak.** Storage keys are only cleared on explicit success/cancel.
- **Only 6 unsaved-change guards exist in the entire app** — closing the tab or clicking a
  sidebar link mid-wizard silently discards everything.

**Fix**
1. Convert to a **parent layout route** `/Create` with `<Outlet />`, owning wizard state in
   context (or a `productDraft` slice), with the stepper rendered by the parent.
2. Add a step guard: redirect to step 1 if prerequisites are unmet.
3. Add one reusable `useUnsavedChangesPrompt()` (React Router `useBlocker` +
   `beforeunload`) and apply it to every create/edit form.

Same treatment applies to `add-product-wizard.tsx` (2,074 lines),
`AddInvestor.tsx`, `CreateStrategy.tsx`, and `StepFroms.tsx`.

---

# PART B — Missing flows

Flows a user needs that do not exist anywhere in the product.

## B1. No global search / command palette

457 routes, and the only way to reach one is by hunting through a **3,033-line sidebar**
([DashboardSideBar.tsx](../src/components/DashboardSideBar/DashboardSideBar.tsx)).
There is no way to search for a customer, an application number, or a national ID from
anywhere in the app.

`cmdk` is already installed and [command.tsx](../src/components/ui/command.tsx) exists —
**it is simply never used.**

**Build:** `⌘K` palette with two sections — (a) fuzzy navigation over the route registry,
(b) async entity search (customer / application / loan / national ID) hitting a search
endpoint. This is the single highest-leverage UX addition in the product.

## B2. No unified application pipeline — the core LOS journey is fragmented

The lifecycle of an application is split across **seven sibling list pages**:

```
/LOS/FinancingApplications/PendingFinancing
                          /InProgressFinancing
                          /IncompleteFinancing
                          /ApprovedFinancing
                          /RejectedFinancing
                          /CanceledFinancing
                          /ReschedulingRequest
```

These are seven near-duplicate table components, each with its own copy of filtering,
pagination and column logic. What's missing is the flow itself:

- **No single queue.** An officer cannot see "everything assigned to me, in priority order".
  They must visit 7 pages and mentally merge them.
- **Status is a destination, not a transition.** There is no visible "move this application
  from Pending → In Progress" action with reason capture and audit.
- **No SLA or ageing.** Nothing shows an application has been sitting for 9 days.
- **No assignment/ownership model.** No "assign to underwriter", no workload view.
- **`ApplicationStepper` is decorative.** It renders 9 stage titles
  ([ApplicationStepper.tsx](../src/components/Dashboard/ApplicationStepper.tsx)) — each with
  an empty `tasks: []` array. It shows *where* the application is but offers **no action to
  advance it** and no indication of what is blocking it.

**Build**
1. One `ApplicationsQueue` page: server-side filter by status, owner, product, ageing.
   The 7 routes become saved filter presets that redirect into it.
2. A real **decision panel** on the detail view: Approve / Reject / Request-info, each with
   mandatory reason, document attachment, and a written audit entry.
3. Make the stepper live: per-stage status, blocking reason, and the action to advance.
4. Add SLA ageing badges and an "assigned to me" default.

## B3. No maker–checker / four-eyes approval flow

For a Saudi lending platform this is a compliance expectation, not a nicety. The permission
strings hint at it (`product.maker.submit` appears in
[useProductPermissions.ts](../src/hooks/useProductPermissions.ts)), but there is **no UI for
a pending-approval queue, no reviewer view, and no diff of what the maker changed.**

**Build:** a `PendingApprovals` inbox; a review screen showing before/after; approve/reject
with comment; and a "your submission was rejected because…" notification back to the maker.

## B4. Notifications never arrive

[NotificationInbox.tsx](../src/components/NotificationInbox.tsx) has **no polling, no
WebSocket, no SSE**. The bell only updates on a full page reload. There is an entire
`NotificationOrchestrator` module and 4 template types (Email/SMS/Push/Contract) — a
substantial notification *authoring* system whose *delivery to the in-app user* is inert.

**Build:** polling (30s) as the pragmatic v1, SSE if the backend supports it. Unread badge,
mark-as-read, deep-link from notification → the entity it concerns.

## B5. No bulk actions anywhere

343 files render tables. None support multi-select → act. Every approve, reject, assign or
export is one row at a time. For an ops team processing a daily queue this is the difference
between minutes and hours.

**Build:** selection column + bulk action bar in the shared DataTable (C1), with a
confirmation summary ("Approve 24 applications?") and a per-row result report.

## B6. Destructive actions are largely unconfirmed

247 `handleDelete` occurrences; only 4 `window.confirm` calls and one SweetAlert import.
The overwhelming majority of deletes fire immediately on click. There is **no undo
anywhere.**

**Build:** one `useConfirm()` hook returning a promise, backed by the shadcn
[dialog](../src/components/ui/dialog.tsx). Require typed confirmation for high-impact
deletes. Add undo-toast for reversible ones.

## B7. No onboarding, empty-first-run, or contextual help

`/first-time-login` exists as a route but there is no product tour, no empty-state guidance
("You have no products yet — create your first"), and no inline help on the many
LOV/config screens whose purpose is non-obvious. Only 42 of 911 files render any empty
state at all; the rest show a bare table header over nothing.

## B8. No saved views, and filters don't survive navigation

315 files implement pagination/filtering locally in component state. Filter and page state
is **not** in the URL. So: filter a 5,000-row customer list, open a customer, press Back →
you are on page 1, unfiltered. This is one of the most-felt daily frictions in the app.

**Build:** move all list state into URL search params (`?page=2&status=pending&q=...`).
This makes lists **shareable, bookmarkable, and Back-button-correct** in one change. Then
layer "save this view" on top.

---

# PART C — Flows that don't make sense

Things that exist but are incoherent.

## C1. Three table technologies and no shared DataTable

- 448 files import `antd` · 343 render `<Table` · 216 import `react-bootstrap` · 59 use raw `<table>`
- **`src/components/shared/` is empty** — the DataTable that `CLAUDE.md` calls "planned" was never built.

So sorting, pagination, empty state, loading state, column resizing and export behave
*differently on nearly every page*. Users cannot build muscle memory. This is simultaneously
the biggest consistency bug and the biggest code-duplication problem.

**This is the keystone fix.** Build `src/components/shared/DataTable/` first: server-side
pagination, URL-synced state (B8), selection + bulk actions (B5), empty/loading/error
states, column visibility, and export. Then migrate lists to it, highest-traffic first.

## C2. Route casing is inconsistent — and React Router is case-sensitive

```
"/LOS/…"  → 173 routes
"/Los/…"  →  13 routes   ← e.g. /Los/LOV/CountriesList, /Los/LOV/WealthRanges
```

Plus a third convention for LMS (`Lms/...`, `lms`) and a mix of leading-slash and
relative paths. A hand-typed or documented URL with the wrong casing 404s.

**Fix:** normalise to one casing; add permanent redirects from the old paths so existing
bookmarks survive.

## C3. Duplicated customer and application modules across LOS and LMS

Two separate "all customers" implementations
([components/Customer/AllCustomers.tsx](../src/components/Customer/AllCustomers.tsx) and
[pages/lmsPages/Customers/AllCustomers.tsx](../src/pages/lmsPages/Customers/AllCustomers.tsx),
the latter **3,419 lines**), reachable from different sidebar sections, showing overlapping
data with different columns and different actions.

Users cannot tell which is authoritative. Support cannot tell which one a user means.

**Fix:** pick the canonical one per entity, redirect the other, and delete. Where LOS and
LMS genuinely need different columns, that's a *view preset* of one page, not a second page.

## C4. Reports are 40+ separate routes with no report hub

`Lms/Reports/loans/*` alone has 18 routes, plus `AccountingFinancing/*` (8) and the
investor `Reports/*` (17). No index, no search, no description of what each report does, no
shared date-range/export control. Finding "the one about overdue loans by product" means
guessing from sidebar labels.

**Fix:** a Reports hub — searchable catalogue, grouped by domain, each with a one-line
description, a shared parameter panel, and consistent export.

## C5. The dashboard is a landing pad, not a workspace

Post-login lands on `/LOS/Dashboard`, which presents metrics but **no work**. There is no
"here is your queue", no pending-approval count, no SLA breach warning, no recent activity.
The user's actual first action is always "navigate away".

**Fix:** role-aware dashboard — underwriter sees their queue and ageing items; compliance
sees flagged/PEP/sanctions hits; admin sees system health. Metrics stay, but below the work.

## C6. `tenantId` is hardcoded on every render

[App.tsx:20](../src/App.tsx#L20):

```ts
localStorage.setItem("tenantId", "980fb848-9a36-425e-4632-08dc7fb833c6");
```

This runs on **every render of `App`**, not in an effect, and blocks the Phase 5
white-label goal. (Per prior investigation the backend derives tenant from the JWT and
ignores this header — so it is dead weight that *looks* authoritative, which is worse.)

**Fix:** delete it, or derive from the JWT in one place.

## C7. Feedback channels are fragmented

520 files use `react-hot-toast`, 3 use antd `message`, 1 uses `sonner`, plus 4 raw
`window.confirm` and one SweetAlert. Different notification styles appear in different
corners of the same app. `CLAUDE.md` already forbids `react-hot-toast` for new code, but
there is no migration path for the 520 existing files.

**Fix:** one toast adapter module re-exported under the existing import name, so the 520
call-sites keep compiling while the implementation swaps underneath in a single commit.

## C8. Accessibility and responsiveness are effectively absent

- `aria-label` in **16 of 911** files.
- Responsive breakpoints in **90 of 911** files; 40 hard-coded ≥1000px inline widths.
- No skip-link, no visible focus management on route change, no keyboard path through the
  3,033-line sidebar.

The app is desktop-only in practice and unusable with a screen reader. For a regulated
financial product this carries procurement and compliance risk.

## C9. Everything loads at once

428 eager imports in `path.tsx`, **zero** `React.lazy`. Every user downloads all 457 pages —
CMS, investor portal, third-party dashboard, web-page management — to see one dashboard.
Slow first paint on every cold load, for every role.

**Fix:** route-level `lazy()` + `Suspense` with a shell-preserving skeleton. Split by
top-level section (LOS / LMS / CMS / Investor / ThirdParty) for the largest immediate win.

---

# PART D — Remediation roadmap

Ordered so each phase unblocks the next. Phases 1–2 are prerequisites for everything else.

### Phase 1 — Stop the bleeding (1–2 weeks)
> Nothing here changes a pixel. All of it stops users getting stranded.

| # | Task | Refs |
|---|---|---|
| 1 | Collapse 17 axios instances → one `createApiClient` factory | A2 |
| 2 | Single `clearSession()`; remove nested persist; fix the redirect loop | A1 |
| 3 | Root + per-route `errorElement` | A3 |
| 4 | `useConfirm()` hook; apply to the top ~30 destructive actions | B6 |
| 5 | `useUnsavedChangesPrompt()`; apply to all wizards | A5 |

**Exit criteria:** an expired session always lands on `/login` with one toast and never
loops; a thrown render error keeps the app shell alive.

### Phase 2 — The shared primitives (2–3 weeks)
> Build `src/components/shared/` — the directory that was planned and never created.

| # | Task | Refs |
|---|---|---|
| 6 | `DataTable/` — server pagination, URL state, selection, empty/loading/error, export | C1, B5, B8 |
| 7 | `useListParams()` — URL-synced filter/page/sort | B8 |
| 8 | `PageHeader` with breadcrumbs (currently 34 of 457 routes) | — |
| 9 | `EmptyState`, `ErrorState`, `LoadingState` | B7 |
| 10 | Toast adapter — one implementation behind the existing import name | C7 |

**Exit criteria:** one list page fully migrated to DataTable; Back button restores filters.

### Phase 3 — Route & access integrity (1–2 weeks)

| # | Task | Refs |
|---|---|---|
| 11 | `<RequirePermission>` at route level, driven by the sidebar's permission map | A4 |
| 12 | Normalise route casing + redirects | C2 |
| 13 | Route-level `lazy()` + `Suspense`, split by section | C9 |
| 14 | Convert Product Create to a parent layout route with step guards | A5 |
| 15 | Delete hardcoded `tenantId` | C6 |

### Phase 4 — The core LOS journey (3–4 weeks)
> This is where the product actually gets better.

| # | Task | Refs |
|---|---|---|
| 16 | Unified `ApplicationsQueue`; 7 status routes → filter presets | B2 |
| 17 | Decision panel: approve/reject/request-info + reason + audit | B2 |
| 18 | Make `ApplicationStepper` live — stage status, blockers, advance action | B2 |
| 19 | SLA ageing + assignment/ownership | B2 |
| 20 | Maker–checker approvals inbox with before/after diff | B3 |
| 21 | Bulk actions on the queue | B5 |

### Phase 5 — Navigation & discovery (2 weeks)

| # | Task | Refs |
|---|---|---|
| 22 | `⌘K` global search — routes + entities (`cmdk` already installed) | B1 |
| 23 | Reports hub with searchable catalogue | C4 |
| 24 | Role-aware dashboard showing work, not just metrics | C5 |
| 25 | Notification polling + deep-links | B4 |
| 26 | De-duplicate LOS/LMS customer & application modules | C3 |

### Phase 6 — Accessibility & responsive (ongoing)

| # | Task | Refs |
|---|---|---|
| 27 | Focus management on route change; skip-link | C8 |
| 28 | Keyboard navigation through sidebar; decompose the 3,033-line file | C8 |
| 29 | `aria-label` pass over interactive controls | C8 |
| 30 | Responsive audit of the top 30 pages | C8 |

---

## Quick wins — highest value per hour

If you can only do a handful, do these:

1. **Fix the session-expiry loop** (A1) — a few hours, removes the worst possible experience.
2. **Root `errorElement`** (A3) — under an hour, converts white screens into a recoverable page.
3. **URL-synced list state** (B8) — fixes the most-felt daily friction, page by page.
4. **`⌘K` search** (B1) — the library is already installed; makes 457 routes navigable.
5. **`useConfirm()`** (B6) — stops accidental irreversible deletes.

---

## Two structural notes

**On sequencing with the UI migration.** Phase 2 here (`shared/DataTable`) *is* the antd→shadcn
Table migration from `UI_MIGRATION_PLAN.md` Phase 2. Doing them as one piece of work means
343 table call-sites are touched once instead of twice. Do not run them as separate efforts.

**On the real root cause.** Nearly every item in Part C traces to one thing: there was never a
shared primitive, so each page re-implemented tables, filters, toasts and confirms locally.
457 pages × local re-implementation = 457 slightly different products. Phase 2 is therefore
not a refactor — it is the fix for the category of problem, and every later phase gets cheaper
once it exists.
