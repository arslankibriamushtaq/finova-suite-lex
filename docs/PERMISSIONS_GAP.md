# Permission Gaps — Sidebar vs. Identity-Service Catalog

**Audience:** backend / identity-service team
**Source of truth (frontend):** [DashboardSideBar.tsx](../src/components/DashboardSideBar/DashboardSideBar.tsx) (`hasAccess()` gates), [useProductPermissions.ts](../src/hooks/useProductPermissions.ts) (in-component `hasPermission()` gates), [getLandingRoute.ts](../src/utils/getLandingRoute.ts)
**Catalog reference:** `GET /identity-service/api/v1/permissions/role/{roleId}` — last audited **2026-07-16**: 174 permission codes across 19 modules.

> ⚠️ The catalog snapshot below is 4 weeks old. Every item marked ❓ must be re-checked against the live catalog before work starts — some may already exist.

---

## 1. How the frontend gates today

Two different mechanisms, two different vocabularies:

| Layer | File | Matches on |
|---|---|---|
| Sidebar menu visibility | `DashboardSideBar.tsx:392` `hasAccess()` | `moduleCode` **or** `moduleName` (exact, case-insensitive), **or** `permissionName` (word-prefix regex) |
| In-page buttons (create/edit/delete) | `useProductPermissions.ts:745` `hasPermission()` | `permissionCode` / `code` / `name` / `permissionName` (exact, case-insensitive) |

Super admin (`realm_access.roles` contains `super_admin`) bypasses both — which is why these gaps are invisible in day-to-day testing and only bite real roles.

**Two failure modes:**

- **Gate asks for a code that does not exist** → menu is hidden from *every* non-super-admin, no matter what role they hold. Feature is effectively unreachable.
- **No gate at all** → menu is shown to *every* logged-in user, including roles that will 403 on the underlying API.

---

## 2. Known module codes (2026-07-16 catalog)

`DASHBOARD`, `ADMIN`, `CUSTOMER`, `PARTNER`, `PERMISSION`, `POLICY`, `PRODUCT`, `LOV`, `PROFILE`, `RISK`, `ROLE`, `WALLET`, `TEST`, `KYC`, `MIDDLEWARE`, `EMPLOYEE`, `ONBOARDING`, `PII`, `FRAUD`

---

## 3. MISSING MODULES — sidebar asks, catalog does not answer

These are the primary asks. Sorted by severity.

### 3.1 Blocking — feature is invisible to all real roles

| # | Sidebar item | Route | Gate in code | Line | Requested module code |
|---|---|---|---|---|---|
| 1 | Notification Orchestrator | `/LOS/NotificationOrchestrator` | `hasAccess("NOTIFICATION")` | [2268](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2268) | `NOTIFICATION` ❓ |
| 2 | Card Management (Dashboard, Cards, Card Products, Card Settings) | `/LOS/CardManagement/*` | `hasAccess("CARD")` | [2348](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2348) | `CARD` ❓ |
| 3 | Exchange Top-up (Countries, Document Types, Providers, Verifications, Payments) | `/LOS/Exchange/*` | `hasAccess("EXCHANGE")` | [2568](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2568) | `EXCHANGE` ❓ |
| 4 | Ledger | `/LOS/Ledger` | `hasAccess("LEDGER")` | [2607](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2607) | `LEDGER` ❓ |
| 5 | Block Codes (All, Compliance, AML, Anti-Fraud, Sanction) | `/LOS/BlockCodes/*` | `hasAccess("block_code_module")` | [2381](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2381) | `BLOCK_CODE` — gate uses a legacy lowercase name that can never match |
| 6 | LMS → Reports (Account Report, Simah Report) | `/Lms/Reports/*` | `hasAccess("reports_module")` | [1217](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1217) | `REPORT` — legacy lowercase name |
| 7 | LMS → General Ledger (GL Entries, Failed Entries, Reconciliation) | `/Lms/LedgerGl/*` | `hasAccess("accounting_financing_module")` | [1460](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1460) | `LEDGER` (or `GL`) — legacy lowercase name |
| 8 | LMS → Chart of account (Accounts, COA Configuration, COA Fields) | `/Lms/ChartOfAccount/*` | `hasAccess("accounting_financing_module")` | [1489](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1489) | `LEDGER` / `COA` — legacy lowercase name |

### 3.2 Degraded — currently rescued by an OR-fallback, but the fallback is wrong

`hasAccess([...])` is an **OR**. These items silently fall back to `WALLET`, so anyone with any wallet permission sees them:

| # | Sidebar item | Route | Gate | Line | Requested module code |
|---|---|---|---|---|---|
| 9 | Wallet Ledger (Transactions, Account Statements) | `/LOS/WalletLedger/*` | `["LEDGER","WALLET"]` | [2516](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2516) | `LEDGER` ❓ |
| 10 | BNPL (Categories, Currency Limits) | `/LOS/Bnpl/*` | `["BNPL","WALLET"]` | [2537](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2537) | `BNPL` ❓ |
| 11 | SullisCash Settings | `/LOS/SullisCash/Settings` | `["SULLIS_CASH","WALLET"]` | [2561](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2561) | `SULLIS_CASH` ❓ |
| 12 | Financing (whole LOS/LMS tree) | `/LOS/*`, `/Lms/*` | `["DASHBOARD","PRODUCT","LOV","LENDING","COLLECTIONS","LEDGER","RISK"]` | [2632](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2632) | `LENDING`, `COLLECTIONS` ❓ |
| 13 | Financing → LMS subtree | `/Lms/*` | `["LENDING","COLLECTIONS","LEDGER","RISK","PRODUCT","POLICY"]` | [2756](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2756) | `LENDING`, `COLLECTIONS` ❓ |

---

## 4. UNGATED PAGES — need a code so we can gate them

Currently rendered for **every authenticated user**. Each needs a module + `*_READ` before the frontend can add a gate.

> Scope: active menu entries only. Commented-out entries (LOV → Monthly Income, LOV → List Of Values, Connector → System Logs) are excluded — see [SIDEBAR_ACTIVE_PAGES.md](SIDEBAR_ACTIVE_PAGES.md) for the full rendered/not-rendered split.

| Sidebar item | Route | Line | Proposed module |
|---|---|---|---|
| LMS → Dashboard | `/Lms/dashboard` | [1146](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1146) | `LENDING` |
| LMS → Loan Management → All Applications | `/Lms/LoanManagement/ApplicationManagement` | [1174](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1174) | `LENDING` |
| LMS → All Reports → Currency Reports | `/Lms/ReportsCenter/currency` | [1429](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1429) | `REPORT` |
| LMS → All Reports → Ledger & Journal | `/Lms/ReportsCenter/ledger` | [1435](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1435) | `REPORT` |
| LMS → All Reports → Lending | `/Lms/ReportsCenter/lending` | [1441](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1441) | `REPORT` |
| LMS → All Reports → Collections & Risk | `/Lms/ReportsCenter/collections` | [1447](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1447) | `REPORT` |
| LMS → All Reports → Profitability & Regulatory | `/Lms/ReportsCenter/profitability` | [1453](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1453) | `REPORT` |
| LMS → Collections → Waiver Requests | `/Lms/Collections/WaiverRequests` | [1526](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1526) | `COLLECTIONS` |
| LMS → Setting → Delinquency | `/Lms/Setting/Deliquency` | [1560](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1560) | `POLICY` (exists — just needs wiring) |
| LMS → Setting → Rescheduling | `/Lms/Setting/Rescheduling` | [1566](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1566) | `POLICY` (exists) |
| LMS → Setting → Dunning Policy | `/Lms/Setting/DunningPolicy` | [1572](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1572) | `POLICY` (exists) |
| Connector Mgmt → Environment Settings / Providers / All Provider APIs | `/ThirdPartyManagement/*` | [1870–1894](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1870-L1894) | `MIDDLEWARE` (exists — parent gated at [2759](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2759), children are not) |
| Connector Mgmt → Clients Management + Client Requests (Prod/Dev/Test) | `/ThirdPartyManagement/Clients`, `/RequestHistory/*` | [1897–1931](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1897-L1931) | `MIDDLEWARE` |
| Customer Mgmt → Users | `/LOS/CustomerManagement/OnboardingUsers` | [2284](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2284) | `ONBOARDING` (exists) |
| LOV → Occupation | `/LOS/LOV/Occupation` | [2704](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2704) | `LOV_OCCUPATION_*` |
| LOV → Template Types | `/LOS/LOV/TemplateTypes` | [2722](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2722) | `TEMPLATE_TYPE_*` (exists per constants — needs confirming) |
| Wallet QR → QR Codes / Scan & Pay | `/LOS/Wallet/Qr/*` | [2495–2506](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2495-L2506) | `WALLET_QR_*` |
| Risk Mgmt children (Blacklist NID/Mobile, Fraud Rules, Internal Checks, Devices) | `/LOS/RiskManagement/*` | [2317–2346](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2317-L2346) | `RISK_*` codes exist — sub-item gates just not wired |

---

## 5. NAME-MATCHED GATES — fragile, need real codes

`hasAccess()` falls back to a regex over `permissionName` (the human display string). These gates break the moment someone renames a permission in the admin UI, and several probably never matched at all (e.g. `"View Products"` only matches if `permissionName` literally starts with *"View Products"*; if the catalog says *"Read Product"*, the menu is hidden).

| Gate string | Sidebar item | Line | Confirm / add code |
|---|---|---|---|
| `"View Products"` | Product Management → Products | [571](../src/components/DashboardSideBar/DashboardSideBar.tsx#L571), [2666](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2666) | `PRODUCT_READ` — confirm `permissionName` |
| `"Contract Template"` | Product Management → Contract Template | [577](../src/components/DashboardSideBar/DashboardSideBar.tsx#L577), [2672](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2672) | `CONTRACT_TEMPLATE_*` ❓ (distinct from `TEMPLATE_TYPE_*`) |
| `"Product Category"` | Product Category | [583](../src/components/DashboardSideBar/DashboardSideBar.tsx#L583) | `PRODUCT_CATEGORY_READ` ✅ exists |
| `"Product Sub Category"` | Product Sub Category | [589](../src/components/DashboardSideBar/DashboardSideBar.tsx#L589) | `PRODUCT_SUB_CATEGORY_*` ❓ — no such code in constants |
| `"Source Of Income"` | LOV → Source Of Income | [671](../src/components/DashboardSideBar/DashboardSideBar.tsx#L671) | `LOV_SOI_READ` ✅ |
| `"Source Of Wealth"` | LOV → Source Of Wealth | [683](../src/components/DashboardSideBar/DashboardSideBar.tsx#L683) | `LOV_SOW_READ` ✅ |
| `"Source Of Funds"` | LOV → Source Of Funds | [689](../src/components/DashboardSideBar/DashboardSideBar.tsx#L689) | `LOV_SOF_READ` ✅ |
| `"Net Worth Range"` | LOV → Net Worth Ranges | [701](../src/components/DashboardSideBar/DashboardSideBar.tsx#L701) | `LOV_NWR_READ` ✅ |
| `"Purpose Of Finance"` | LOV → Purpose of Financing | [707](../src/components/DashboardSideBar/DashboardSideBar.tsx#L707) | `LOV_POF_READ` ✅ |
| `"Credit Scoring Field"` | LOV → Credit Scoring Definitions | [773](../src/components/DashboardSideBar/DashboardSideBar.tsx#L773) | `RISK_CREDIT_SCORING_FIELDS_READ` ✅ |
| `"Approval Condition Field"` | LOV → Approval Conditions | [779](../src/components/DashboardSideBar/DashboardSideBar.tsx#L779) | `APPROVAL_CONDITION_FIELD_READ` ✅ |

---

## 6. Action-level codes missing (in-page buttons, not menus)

From [useProductPermissions.ts](../src/hooks/useProductPermissions.ts) — these constants have **no** backend counterpart, so the gated buttons are permanently hidden:

| Constant | Feature | Backend served by | Ask |
|---|---|---|---|
| `CHECKS_TYPES_PERMISSIONS` ([362](../src/hooks/useProductPermissions.ts#L362)) | LOV → Check Types (`/check-type`) | legacy backend | add `CHECK_TYPE_{READ,CREATE,UPDATE,DELETE}` or confirm ungate |
| `SOURCE_OF_REVENUE_PERMISSIONS` ([342](../src/hooks/useProductPermissions.ts#L342)) | LOV → Revenue Source (`/source-of-revenue`) | legacy backend | add `LOV_SOR_*` — **not** the same as `LOV_SOF/SOI/SOW` |
| `VENDOR_PERMISSIONS` ([281](../src/hooks/useProductPermissions.ts#L281)) | Insurance Vendors | legacy backend | add `INSURANCE_VENDOR_*` |
| `API_PERMISSIONS` ([562](../src/hooks/useProductPermissions.ts#L562)) | Partner APIs (`/apis-management/partner-apis`) | legacy backend | add `PARTNER_API_*` — **not** the same as `MIDDLEWARE` provider APIs |
| `PARTNER_PERMISSIONS.DELETE` ([466](../src/hooks/useProductPermissions.ts#L466)) | Delete partner | identity-service | add `PARTNER_DELETE` (currently aliased to `PARTNER_MANAGE`) |
| `DOCUMENT_PERMISSIONS` workflow keys ([158](../src/hooks/useProductPermissions.ts#L158)) | maker/checker/approver | — | confirm whether maker-checker is in scope at all |
| `LEDGER_GL_PERMISSIONS` ([108](../src/hooks/useProductPermissions.ts#L108)) | GL retry / reverse | ledger-service (Casbin) | see §7 — expose in the identity catalog |

---

## 7. Cross-cutting requests

1. **One vocabulary.** Identity-service uses `RESOURCE_ACTION` (`CUSTOMER_READ`). Wallet/ledger-service uses Casbin `object:act` (`gl.entries:read`, `wallet.bnpl.admin-categories:read`). The frontend can only read one catalog. Please surface the Casbin-backed permissions in `/permissions/role/{id}` under their owning module (`LEDGER`, `BNPL`, `SULLIS_CASH`, `WALLET`) with normal `permissionCode` values.
2. **Always return `moduleCode`.** `getLandingRoute()` ([44](../src/utils/getLandingRoute.ts#L44)) matches on `moduleCode` only. Any module returning `moduleName` alone can never be a landing page.
3. **Every module needs a `*_READ`.** Menu visibility is a read decision. Modules that only expose write actions can't be gated at the menu level.
4. **Stable codes over display names.** Once §3 and §5 are covered, we drop the `permissionName` regex in `hasAccess()` and match `moduleCode` + `permissionCode` exclusively.

---

## 8. Suggested rollout

| Phase | Backend | Frontend |
|---|---|---|
| 1 | Add §3.1 modules (`NOTIFICATION`, `CARD`, `EXCHANGE`, `LEDGER`, `BLOCK_CODE`, `REPORT`) with `*_READ` | Replace `block_code_module` / `reports_module` / `accounting_financing_module` with the real codes |
| 2 | Add §3.2 modules (`BNPL`, `SULLIS_CASH`, `LENDING`, `COLLECTIONS`) | Drop the `WALLET` OR-fallbacks |
| 3 | Confirm/add §5 codes | Swap name-matching for code-matching; delete the regex branch |
| 4 | Add §4 codes | Gate the currently-ungated items |
| 5 | Add §6 legacy-module codes (or agree to ungate) | Re-map the four dead constant blocks |

**Verification for each phase:** log in with a role holding only the new module, confirm the sidebar shows exactly that item, and confirm a role without it does not see it (test as a non-`super_admin` role — super admin bypasses every gate).
