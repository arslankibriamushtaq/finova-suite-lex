# Permissions to Add — Backend Request

Everything the identity-service permission catalog is missing for the **active sidebar pages** (the 74 pages listed in [SIDEBAR_ACTIVE_PAGES.md](SIDEBAR_ACTIVE_PAGES.md)). Commented-out menu entries are excluded — nothing here is speculative UI.

**Ask:** 11 new modules · 102 new permission codes.
**Endpoint they must appear in:** `GET /identity-service/api/v1/permissions/role/{roleId}`
**Re-audited:** 2026-08-17 against the current sidebar — every gate resolves to a code below or a pre-existing module, with `WALLET_GL_ACCOUNT_*` the sole remaining gap.
**Catalog baseline:** audit of 2026-07-16 — 174 codes across 19 modules (`DASHBOARD, ADMIN, CUSTOMER, PARTNER, PERMISSION, POLICY, PRODUCT, LOV, PROFILE, RISK, ROLE, WALLET, TEST, KYC, MIDDLEWARE, EMPLOYEE, ONBOARDING, PII, FRAUD`). Anything already added since then can be ticked off rather than re-created.

---

## Conventions we're following

- **Code:** `RESOURCE_ACTION`, uppercase, snake — matches the existing catalog (`CUSTOMER_READ`, `PARTNER_MANAGE`).
- **Name:** `View / Create / Update / Delete <Entity>`. This matters: the sidebar currently falls back to regex-matching `permissionName`, so following the convention keeps existing gates working until we switch to code-only matching.
- **Module must return `moduleCode`.** `getLandingRoute()` ([getLandingRoute.ts:44](../src/utils/getLandingRoute.ts#L44)) reads `moduleCode` only — a module that returns just `moduleName` can never be a post-login landing page.
- **⭐ = the minimum code needed to un-hide that menu.** Menu visibility is a read decision; without it the whole group stays invisible no matter which write codes the role holds.

---

## Priority 1 — the 10 ⭐ READ codes

These alone make every currently-invisible menu reachable. Everything else in this document is action-level granularity that can follow.

| Module | Code | Un-hides |
|---|---|---|
| `NOTIFICATION` | `NOTIFICATION_READ` | Notification Orchestrator |
| `CARD` | `CARD_READ` | Card Management (4 pages) |
| `BLOCK_CODE` | `BLOCK_CODE_READ` | Block Codes (5 pages) |
| `LEDGER` | `LEDGER_READ` | Ledger, Wallet Ledger (2), General Ledger (3), Chart of account (3) |
| `BNPL` | `BNPL_CATEGORY_READ` | BNPL (2 pages) |
| `SULLIS_CASH` | `SULLIS_CASH_CONFIG_READ` | SullisCash (Settings + Loans) |
| `EXCHANGE` | `EXCHANGE_PROVIDER_READ` | Exchange Top-up (5 pages) |
| `LENDING` | `LENDING_READ` | LMS Dashboard, Loan Management |
| `COLLECTIONS` | `COLLECTIONS_READ` | Collections → Waiver Requests |
| `REPORT` | `REPORT_READ` | Reports (4) + All Reports (5) |

---

## 1. NOTIFICATION *(new module)*

Backing service: notification-service (`/channels`, `/languages`, `/templates`, `/template-channels`, `/user-notification-prefs`).

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `NOTIFICATION_READ` | View Notifications | Notification Orchestrator — `/LOS/NotificationOrchestrator` |
| `NOTIFICATION_CREATE` | Create Notification | new channel / language / template / template-channel |
| `NOTIFICATION_UPDATE` | Update Notification | edit channel / language / template |
| `NOTIFICATION_DELETE` | Delete Notification | delete channel / language / template |

## 2. CARD *(new module)*

Backing service: card-management (`/api/v1/admin/cards`, `/api/v1/admin/card-products`).

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `CARD_READ` | View Cards | Dashboard, Cards, card detail, card transactions |
| `CARD_CREATE` | Create Card | Issue card — `POST /admin/cards` |
| `CARD_UPDATE` | Update Card | Card limits (`PUT /cards/{id}/limits`), tracking advance |
| `CARD_FREEZE` | Freeze Card | `POST /cards/{id}/freeze` · `/unfreeze` |
| `CARD_BLOCK` | Block Card | `POST /cards/{id}/block` · `/unblock` |
| `CARD_CANCEL` | Cancel Card | `POST /cards/{id}/cancel` |
| `CARD_PRODUCT_READ` | View Card Products | Card Products page |
| `CARD_PRODUCT_CREATE` | Create Card Product | `POST /admin/card-products` |
| `CARD_PRODUCT_UPDATE` | Update Card Product | edit + activate/deactivate |
| `CARD_PRODUCT_DELETE` | Delete Card Product | `DELETE /admin/card-products/{id}` |
| `CARD_SETTINGS_READ` | View Card Settings | Card Settings page |
| `CARD_SETTINGS_UPDATE` | Update Card Settings | tier-limits, fees, tier-spend-limits |

## 3. BLOCK_CODE *(new module)*

Backing service: `/block-codes` + `/user-blocks`. The four category pages (Compliance / AML / Anti-Fraud / Sanction) are filtered views of one resource, so one module covers all five pages.

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `BLOCK_CODE_READ` | View Block Codes | All Block Codes, Compliance, AML, Anti-Fraud, Sanction |
| `BLOCK_CODE_CREATE` | Create Block Code | `POST /block-codes` |
| `BLOCK_CODE_UPDATE` | Update Block Code | `PUT /block-codes/{id}` |
| `BLOCK_CODE_DELETE` | Delete Block Code | `DELETE /block-codes/{id}` |
| `USER_BLOCK_APPLY` | Block User | `POST /user-blocks/block` |
| `USER_BLOCK_REMOVE` | Unblock User | `POST /user-blocks/unblock` |

> If per-category separation is needed (a compliance officer who must not touch sanctions), add `BLOCK_CODE_COMPLIANCE_READ`, `BLOCK_CODE_AML_READ`, `BLOCK_CODE_ANTI_FRAUD_READ`, `BLOCK_CODE_SANCTION_READ` and we'll gate each page individually. Tell us which model you pick.

## 4. LEDGER *(new module)*

Covers the standalone Ledger page, Wallet Ledger, General Ledger and Chart of account. **Replaces the Casbin strings** the frontend currently carries (`gl.entries:read`, `gl.entries:retry`, `ledger.entries:reverse` — [useProductPermissions.ts:108](../src/hooks/useProductPermissions.ts#L108)), which the identity catalog cannot express.

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `LEDGER_READ` | View Ledger | Ledger `/LOS/Ledger`, Wallet Ledger → Transactions |
| `LEDGER_ACCOUNT_READ` | View Account Statements | Wallet Ledger → Account Statements |
| `GL_ENTRY_READ` | View GL Entries | General Ledger → GL Entries, Failed Entries |
| `GL_ENTRY_RETRY` | Retry GL Entry | retry a failed posting |
| `GL_ENTRY_REVERSE` | Reverse GL Entry | reverse a posted entry |
| `GL_RECONCILIATION_READ` | View GL Reconciliation | General Ledger → Reconciliation |
| `COA_READ` | View Chart Of Accounts | Chart of account → Accounts |
| `COA_CREATE` | Create Chart Of Account | — |
| `COA_UPDATE` | Update Chart Of Account | incl. activate/deactivate |
| `COA_DELETE` | Delete Chart Of Account | — |
| `COA_CONFIG_READ` | View COA Configuration | Chart of account → COA Configuration |
| `COA_CONFIG_UPDATE` | Update COA Configuration | — |
| `COA_FIELD_READ` | View COA Fields | Chart of account → Chart of accounts field |
| `COA_FIELD_CREATE` | Create COA Field | `POST /coa-fields` |
| `COA_FIELD_UPDATE` | Update COA Field | incl. activate/deactivate |
| `COA_FIELD_DELETE` | Delete COA Field | deactivate |
| `WALLET_GL_ACCOUNT_READ` | View Wallet GL Accounts | Chart of account → Wallet GL Accounts |
| `WALLET_GL_ACCOUNT_WRITE` | Update Wallet GL Accounts | change which GL account a wallet rail posts to |

> Splitting `GL_*` / `COA_*` into their own modules is fine by us — the frontend only needs the code strings to be stable. Say which module owns them.

**`WALLET_GL_ACCOUNT_*` is the one outstanding ask.** That screen landed after this document was first written, so it was never in the batch. It is the only sidebar entry with no code at all — it currently carries the Casbin strings `ledger.wallet-gl-accounts:read` / `:write` ([useProductPermissions.ts:145](../src/hooks/useProductPermissions.ts#L145)), which the identity catalog cannot express, so the page is reachable by super admin only. Read suits most back-office roles; write is admin / head_of_accounts only, because the blast radius is every wallet transaction posted from then on.

## 5. BNPL *(new module)*

wallet-service, Casbin objects `wallet.bnpl.admin-categories` and `wallet.bnpl.admin-currency-limits`. These exact code names are already in the frontend constants ([useProductPermissions.ts:659](../src/hooks/useProductPermissions.ts#L659)) — matching them means zero frontend change.

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `BNPL_CATEGORY_READ` | View BNPL Categories | BNPL → BNPL Categories |
| `BNPL_CATEGORY_CREATE` | Create BNPL Category | — |
| `BNPL_CATEGORY_UPDATE` | Update BNPL Category | — |
| `BNPL_CATEGORY_DELETE` | Delete BNPL Category | — |
| `BNPL_CURRENCY_LIMIT_READ` | View BNPL Currency Limits | BNPL → BNPL Currency Limits |
| `BNPL_CURRENCY_LIMIT_UPDATE` | Update BNPL Currency Limits | — |

## 6. SULLIS_CASH *(new module)*

wallet-service. Two distinct Casbin objects, deliberately split so support staff can read the loan book without being able to re-price the product. Names already in constants ([useProductPermissions.ts:685](../src/hooks/useProductPermissions.ts#L685)).

| Code | Permission name | Casbin object | Gates |
|---|---|---|---|
| ⭐ `SULLIS_CASH_CONFIG_READ` | View SullisCash Config | `wallet.sullis-cash.admin-config:read` | SullisCash → Settings — `/LOS/SullisCash/Settings` |
| `SULLIS_CASH_CONFIG_UPDATE` | Update SullisCash Config | `wallet.sullis-cash.admin-config:update` | save terms — `PUT /api/v1/sullis-cash/admin/config/{currency}` |
| `SULLIS_CASH_LOAN_READ` | View SullisCash Loans | `wallet.sullis-cash.admin-loans:read` | SullisCash → Loans — `/LOS/SullisCash/Loans` |

**Settings is now per currency.** `GET …/config` lists the configured currencies, `GET …/config/{currency}` reads one (seeding platform defaults on first touch), `PUT …/config/{currency}` saves one. The three codes above are currency-blind — a role that can price SAR can price every currency. If pricing authority needs to be split by currency, tell us and we'll gate per row instead.

**The loan book has no write acts.** There is no admin settle / waive / cancel on a SullisCash loan, so `SULLIS_CASH_LOAN_READ` is the whole surface.

## 7. EXCHANGE *(new module)*

Names already in constants ([useProductPermissions.ts:636](../src/hooks/useProductPermissions.ts#L636)) — please confirm or correct them.

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `EXCHANGE_PROVIDER_READ` | View Exchange Providers | Exchange Top-up → Providers |
| `EXCHANGE_PROVIDER_CREATE` | Create Exchange Provider | — |
| `EXCHANGE_PROVIDER_UPDATE` | Update Exchange Provider | — |
| `EXCHANGE_PROVIDER_DELETE` | Delete Exchange Provider | — |
| `EXCHANGE_COUNTRY_READ` | View Exchange Countries | Exchange Top-up → Countries |
| `EXCHANGE_COUNTRY_CREATE` | Create Exchange Country | — |
| `EXCHANGE_COUNTRY_UPDATE` | Update Exchange Country | — |
| `EXCHANGE_DOCUMENT_TYPE_READ` | View Exchange Document Types | Exchange Top-up → Document Types |
| `EXCHANGE_DOCUMENT_TYPE_CREATE` | Create Exchange Document Type | — |
| `EXCHANGE_DOCUMENT_TYPE_UPDATE` | Update Exchange Document Type | — |
| `EXCHANGE_VERIFICATION_READ` | View Exchange Verifications | Exchange Top-up → Verifications |
| `EXCHANGE_VERIFICATION_REVIEW` | Review Exchange Verification | approve / reject a verification |
| `EXCHANGE_PAYMENT_READ` | View Exchange Payments | Exchange Top-up → Payments |

## 8. LENDING *(new module)*

Also one of the OR-terms on the Financing group gate ([DashboardSideBar.tsx:2632](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2632)).

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `LENDING_READ` | View Lending | LMS → Dashboard |
| `LENDING_APPLICATION_READ` | View Loan Applications | Loan Management → All Applications |
| `LENDING_APPLICATION_APPROVE` | Approve Loan Application | approve action |
| `LENDING_APPLICATION_REJECT` | Reject Loan Application | reject action |
| `LENDING_APPLICATION_DISBURSE` | Disburse Loan | disbursement action |

## 9. COLLECTIONS *(new module)*

collections-service (`/api/v1/collections/waiver-requests`). Also an OR-term on the Financing gate.

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `COLLECTIONS_READ` | View Collections | Collections group |
| `WAIVER_REQUEST_READ` | View Waiver Requests | Collections → Waiver Requests |
| `WAIVER_REQUEST_APPROVE` | Approve Waiver Request | `POST /waiver-requests/{id}/approve` (+ invoice variant) |
| `WAIVER_REQUEST_REJECT` | Reject Waiver Request | `POST /waiver-requests/{id}/reject` (+ invoice variant) |

## 10. REPORT *(new module)*

Nine report pages, all read-only + export.

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `REPORT_READ` | View Reports | Reports (Account, Simah, Accounting & Financing, Loans) + All Reports (Currency, Ledger & Journal, Lending, Collections & Risk, Profitability & Regulatory) |
| `REPORT_EXPORT` | Export Report | CSV / PDF / Excel download on every report |

> Optional granularity if reports must be split by audience — say the word and we'll gate per category: `REPORT_ACCOUNT_READ`, `REPORT_SIMAH_READ`, `REPORT_CURRENCY_READ`, `REPORT_LEDGER_READ`, `REPORT_LENDING_READ`, `REPORT_COLLECTIONS_READ`, `REPORT_PROFITABILITY_READ`.

---

## 10b. CRYPTO *(new module)*

crypto-service. Two Casbin objects, split so ops can read the treasury without the customer transfer list and support can read transfers without touching the treasury. Names already in constants ([useProductPermissions.ts](../src/hooks/useProductPermissions.ts)).

| Code | Permission name | Casbin object | Gates |
|---|---|---|---|
| ⭐ `CRYPTO_TREASURY_READ` | View Crypto Treasury | `crypto.admin.treasury:read` | Crypto → Treasury — `/LOS/Crypto/Treasury` |
| `CRYPTO_TREASURY_CREATE` | Create Crypto Treasury Address | `crypto.admin.treasury:create` | register / rotate an address — `POST /api/v1/admin/crypto/treasury` |
| `CRYPTO_TRANSFER_READ` | View Crypto Transfers | `crypto.admin.transfers:read` | Crypto → Transfers — `/LOS/Crypto/Transfers` |
| `CRYPTO_TRANSFER_UPDATE` | Update Crypto Transfer | `crypto.admin.transfers:update` | reconcile + mark dead — `POST …/{id}/reconcile`, `POST …/{id}/abandon` |

**There is deliberately no `CRYPTO_TRANSFER_CREATE`.** A transfer needs a signature from the user's device and no operator holds a key that could produce one, so crypto-service exposes no admin send endpoint. Please do not register a create code for transfers — one would advertise a capability the system does not have, and any support process built on it would be built on nothing.

**`CRYPTO_TREASURY_CREATE` is the sensitive one.** That endpoint attaches the KMS/HSM signing handle for the wallet funding every payout, which is why `developer` should hold `CRYPTO_TREASURY_READ` and not it. Neither treasury code lets anyone read key material: the API only ever returns the handle masked to its last six characters.

Backend role grants per the service's own Casbin migration (`V96__add_crypto_admin_policies.sql`): `super_admin` full, `admin` treasury create+read and transfers read+update, `developer` read on both.

---

## 11. Codes to add to **existing** modules

| Module | Code | Permission name | Gates |
|---|---|---|---|
| `PRODUCT` | `PRODUCT_SUB_CATEGORY_READ` | View Product Sub Category | Product Management → Product Sub Category |
| `PRODUCT` | `PRODUCT_SUB_CATEGORY_CREATE` | Create Product Sub Category | — |
| `PRODUCT` | `PRODUCT_SUB_CATEGORY_UPDATE` | Update Product Sub Category | — |
| `PRODUCT` | `PRODUCT_SUB_CATEGORY_DELETE` | Delete Product Sub Category | — |
| `PRODUCT` | `CONTRACT_TEMPLATE_READ` | View Contract Template | Product Management → Contract Template |
| `PRODUCT` | `CONTRACT_TEMPLATE_CREATE` | Create Contract Template | — |
| `PRODUCT` | `CONTRACT_TEMPLATE_UPDATE` | Update Contract Template | — |
| `PRODUCT` | `CONTRACT_TEMPLATE_DELETE` | Delete Contract Template | — |
| `LOV` | `LOV_OCCUPATION_READ` | View Occupation | LOV → Occupation |
| `LOV` | `LOV_OCCUPATION_CREATE` | Create Occupation | — |
| `LOV` | `LOV_OCCUPATION_UPDATE` | Update Occupation | — |
| `LOV` | `LOV_OCCUPATION_DELETE` | Delete Occupation | — |
| `CUSTOMER` | `BUSINESS_READ` | View Business | Customer Management → Business (SME) |
| `CUSTOMER` | `BUSINESS_WRITE` | Update Business | approve/reject business docs, block codes |
| `WALLET` | `WALLET_QR_READ` | View Wallet QR | Wallet QR → QR Codes |
| `WALLET` | `WALLET_QR_CREATE` | Create Wallet QR | publish a QR code |
| `WALLET` | `WALLET_QR_PAY` | Pay Wallet QR | Wallet QR → Scan & Pay |
| `WALLET` | `WALLET_TRANSFER_CREATE` | Create Wallet Transfer | Send Money |
| `WALLET` | `WALLET_INTERNAL_TRANSFER_CREATE` | Create Internal Transfer | Internal Transfer |
| `WALLET` | `WALLET_LIMIT_READ` | View Wallet Limits | Wallet Transactions Limits, Accounts Limit Setting |
| `WALLET` | `WALLET_LIMIT_UPDATE` | Update Wallet Limits | edit limits |
| `MIDDLEWARE` | `MIDDLEWARE_PROVIDER_READ` | View Providers | Connector → Environment Settings → Providers |
| `MIDDLEWARE` | `MIDDLEWARE_API_READ` | View Provider APIs | Connector → All Provider APIs |
| `MIDDLEWARE` | `MIDDLEWARE_CLIENT_READ` | View Clients | Connector → Clients |
| `MIDDLEWARE` | `MIDDLEWARE_CLIENT_REQUEST_READ` | View Client Requests | Client Request Prod / Dev / Test |

**Why `BUSINESS_*`:** the Business (SME) pages currently borrow `CUSTOMER_READ`/`CUSTOMER_WRITE` ([useProductPermissions.ts:193](../src/hooks/useProductPermissions.ts#L193)), so no role can hold retail-customer access without also getting SME access.
**Why `WALLET_TRANSFER_CREATE`:** Send Money and Internal Transfer are admin-initiated money movement gated today by plain `WALLET` — any wallet-read role sees them.

---

## 12. Verify only — no action if these already exist

The sidebar gates below already resolve against the 2026-07-16 catalog. Listed so you can confirm rather than re-create.

| Sidebar page | Code relied on |
|---|---|
| Dashboard, Financing → LOS → Dashboard | `DASHBOARD_READ` |
| Customer Management, Individuals | `CUSTOMER_READ` |
| Customer Management → Users | `ONBOARDING_READ` |
| Risk Management → Blacklist NID / Mobile | `RISK_BLACKLIST_READ` |
| Risk Management → Fraud Rule Management | `RISK_FRAUD_RULES_READ` |
| Risk Management → Internal Checks Config, General Credit Scoring | `RISK_PARAMETERS_READ` |
| Risk Management → Device Management | `RISK_DEVICES_READ` |
| Access Control → Employees / Manage Roles / Manage Permissions | `EMPLOYEE_READ` · `ROLE_READ` · `PERMISSION_READ` |
| Product Management → Products | `PRODUCT_READ` |
| Product Management → Product Category | `PRODUCT_CATEGORY_READ` |
| LOV → Source Of Income / Wealth / Funds | `LOV_SOI_READ` · `LOV_SOW_READ` · `LOV_SOF_READ` |
| LOV → Net Worth Ranges / Purpose of Financing | `LOV_NWR_READ` · `LOV_POF_READ` |
| LOV → Credit Scoring Definitions | `RISK_CREDIT_SCORING_FIELDS_READ` |
| LOV → Approval Conditions | `APPROVAL_CONDITION_FIELD_READ` |
| LOV → Template Types | `TEMPLATE_TYPE_READ` |
| LMS → Setting → Delinquency / Rescheduling / Dunning Policy | `POLICY_READ` · `POLICY_WRITE` |
| Connector Management (group) | `MIDDLEWARE_READ` |

---

## 13. Definition of done

1. Every code above is returned by `/permissions/role/{roleId}` with `permissionCode`, `permissionName`, `moduleId`, `action`, `resourceType`, `active`.
2. Every new module returns a non-empty **`moduleCode`** (not just `moduleName`).
3. Each new module carries at least its ⭐ `*_READ`.
4. A test role holding **only** `LEDGER_READ` shows Ledger + Wallet Ledger + General Ledger + Chart of account and nothing else.
5. Send us the final code list — a few names above are our proposals, and we'll match whatever you register rather than the other way round.

**Test as a non-`super_admin` role.** Super admin bypasses every gate ([DashboardSideBar.tsx:393](../src/components/DashboardSideBar/DashboardSideBar.tsx#L393)), so it will show the full sidebar whether or not any of this lands.
