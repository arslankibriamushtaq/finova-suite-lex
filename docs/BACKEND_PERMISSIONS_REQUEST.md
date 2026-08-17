# Permission Catalog — Backend Request

**One document. Everything the frontend needs from the identity-service permission catalog.**

**Where they must appear:** `GET /identity-service/api/v1/permissions/role/{roleId}`
**Ask:** 11 new modules · 102 new permission codes
**Catalog baseline:** audit of 2026-07-16 — 174 codes across 19 modules (`DASHBOARD, ADMIN, CUSTOMER, PARTNER, PERMISSION, POLICY, PRODUCT, LOV, PROFILE, RISK, ROLE, WALLET, TEST, KYC, MIDDLEWARE, EMPLOYEE, ONBOARDING, PII, FRAUD`). Anything added since can be ticked off rather than re-created.
**Frontend state:** every gate listed here is already wired and shipped. Nothing needs a frontend release — the moment a code is returned by the endpoint, the page and its menu entry become reachable for whoever holds it.

Scope is the **84 pages the sidebar actually renders**. Commented-out menu entries are excluded; nothing here is speculative UI.

---

## Why this is needed

The sidebar and every in-page action are gated on permission codes. A gate whose code is absent from the catalog fails closed — the menu is hidden and the page returns *Permission Denied* — for every role except `super_admin`, which bypasses all gating. So each missing code below is a feature that is currently invisible to real users.

**Test everything with a normal role, never with `super_admin`.** Super admin will show the full sidebar whether or not any of this lands, which makes it useless as a check.

---

## Conventions

- **Code:** `RESOURCE_ACTION`, uppercase, snake — matching the existing catalog (`CUSTOMER_READ`, `PARTNER_MANAGE`).
- **Name:** `View / Create / Update / Delete <Entity>`. The frontend also localizes these names from the code, so keeping the pattern keeps the Arabic and French labels correct.
- **Every module needs a `*_READ`.** Menu visibility is a read decision; a module exposing only write actions can never show its menu.
- **Every module must return a non-empty `moduleCode`.** The post-login landing route matches on `moduleCode` only — a module returning just `moduleName` can never be a landing page.
- **⭐ marks the one code that un-hides a menu.** Everything else is action-level granularity that can follow later.
- **The names here are proposals.** Register whatever you prefer and send us the final list — we will match you, not the other way round.

---

## Priority 1 — eleven codes that unblock everything

If nothing else is done, these eleven make every currently-invisible menu reachable.

| Module | Code | Un-hides |
|---|---|---|
| `NOTIFICATION` | `NOTIFICATION_READ` | Notification Orchestrator |
| `CARD` | `CARD_READ` | Card Management (4 pages) |
| `BLOCK_CODE` | `BLOCK_CODE_READ` | Block Codes (5 pages) |
| `LEDGER` | `LEDGER_READ` | Ledger, General Ledger (3), Chart of account (4) |
| `BNPL` | `BNPL_CATEGORY_READ` | BNPL (2 pages) |
| `SULLIS_CASH` | `SULLIS_CASH_CONFIG_READ` | SullisCash (2 pages) |
| `EXCHANGE` | `EXCHANGE_PROVIDER_READ` | Exchange Top-up (5 pages) |
| `LENDING` | `LENDING_READ` | LMS Dashboard, Loan Management |
| `COLLECTIONS` | `COLLECTIONS_READ` | Collections → Waiver Requests |
| `REPORT` | `REPORT_READ` | Reports (4) + All Reports (6) |
| `CRYPTO` | `CRYPTO_TREASURY_READ` | Crypto (2 pages) |

---

# Part A — New modules

## A1. NOTIFICATION

Backing service: notification-service (`/channels`, `/languages`, `/templates`, `/template-channels`, `/user-notification-prefs`).

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `NOTIFICATION_READ` | View Notifications | Notification Orchestrator — `/LOS/NotificationOrchestrator` |
| `NOTIFICATION_CREATE` | Create Notification | new channel / language / template / template-channel |
| `NOTIFICATION_UPDATE` | Update Notification | edit channel / language / template |
| `NOTIFICATION_DELETE` | Delete Notification | delete channel / language / template |

## A2. CARD

Backing service: card-management (`/api/v1/admin/cards`, `/api/v1/admin/card-products`).

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `CARD_READ` | View Cards | Dashboard, Cards, card detail, card transactions |
| `CARD_CREATE` | Create Card | issue a card — `POST /admin/cards` |
| `CARD_UPDATE` | Update Card | card limits (`PUT /cards/{id}/limits`), tracking advance |
| `CARD_FREEZE` | Freeze Card | `POST /cards/{id}/freeze` · `/unfreeze` |
| `CARD_BLOCK` | Block Card | `POST /cards/{id}/block` · `/unblock` |
| `CARD_CANCEL` | Cancel Card | `POST /cards/{id}/cancel` |
| `CARD_PRODUCT_READ` | View Card Products | Card Products page |
| `CARD_PRODUCT_CREATE` | Create Card Product | `POST /admin/card-products` |
| `CARD_PRODUCT_UPDATE` | Update Card Product | edit + activate / deactivate |
| `CARD_PRODUCT_DELETE` | Delete Card Product | `DELETE /admin/card-products/{id}` |
| `CARD_SETTINGS_READ` | View Card Settings | Card Settings page |
| `CARD_SETTINGS_UPDATE` | Update Card Settings | tier limits, fees, tier spend limits |

Freeze, block and cancel are separate acts on purpose: the first two are reversible holds, the third is terminal.

## A3. BLOCK_CODE

Backing service: `/block-codes` + `/user-blocks`. The four category pages (Compliance / AML / Anti-Fraud / Sanction) are filtered views of one resource, so one module covers all five pages.

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `BLOCK_CODE_READ` | View Block Codes | All Block Codes, Compliance, AML, Anti-Fraud, Sanction |
| `BLOCK_CODE_CREATE` | Create Block Code | `POST /block-codes` |
| `BLOCK_CODE_UPDATE` | Update Block Code | `PUT /block-codes/{id}` |
| `BLOCK_CODE_DELETE` | Delete Block Code | `DELETE /block-codes/{id}` |
| `USER_BLOCK_APPLY` | Block User | `POST /user-blocks/block` |
| `USER_BLOCK_REMOVE` | Unblock User | `POST /user-blocks/unblock` |

> **Decision needed:** if a compliance officer must not touch sanctions, we need per-category reads (`BLOCK_CODE_COMPLIANCE_READ`, `BLOCK_CODE_AML_READ`, `BLOCK_CODE_ANTI_FRAUD_READ`, `BLOCK_CODE_SANCTION_READ`) and we will gate each page separately. Tell us which model you want.

## A4. LEDGER

Covers the standalone Ledger page, General Ledger, Chart of account and Wallet GL Accounts. **Replaces Casbin `object:act` strings** the frontend used to carry (`gl.entries:read`, `ledger.entries:reverse`, `ledger.wallet-gl-accounts:read`) — the identity catalog cannot express that shape.

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
| `COA_UPDATE` | Update Chart Of Account | incl. activate / deactivate |
| `COA_DELETE` | Delete Chart Of Account | — |
| `COA_CONFIG_READ` | View COA Configuration | Chart of account → COA Configuration |
| `COA_CONFIG_UPDATE` | Update COA Configuration | — |
| `COA_FIELD_READ` | View COA Fields | Chart of account → Chart of accounts field |
| `COA_FIELD_CREATE` | Create COA Field | — |
| `COA_FIELD_UPDATE` | Update COA Field | incl. activate / deactivate |
| `COA_FIELD_DELETE` | Delete COA Field | — |
| `WALLET_GL_ACCOUNT_READ` | View Wallet GL Accounts | Chart of account → Wallet GL Accounts |
| `WALLET_GL_ACCOUNT_WRITE` | Update Wallet GL Accounts | change which GL account a wallet rail posts to |

`WALLET_GL_ACCOUNT_WRITE` deserves to be narrow — admin / head_of_accounts only. Changing a mapping redirects every wallet transaction posted from that moment on, so a mistake is not one bad row but a stream of misposted entries until someone notices.

> **Decision needed:** splitting `GL_*` / `COA_*` / `WALLET_GL_ACCOUNT_*` into their own modules is fine by us. We only need the code strings to be final. Say which module owns them.

## A5. BNPL

wallet-service, Casbin objects `wallet.bnpl.admin-categories` and `wallet.bnpl.admin-currency-limits`.

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `BNPL_CATEGORY_READ` | View BNPL Categories | BNPL → BNPL Categories |
| `BNPL_CATEGORY_CREATE` | Create BNPL Category | — |
| `BNPL_CATEGORY_UPDATE` | Update BNPL Category | — |
| `BNPL_CATEGORY_DELETE` | Delete BNPL Category | — |
| `BNPL_CURRENCY_LIMIT_READ` | View BNPL Currency Limits | BNPL → BNPL Currency Limits |
| `BNPL_CURRENCY_LIMIT_UPDATE` | Update BNPL Currency Limits | — |

## A6. SULLIS_CASH

wallet-service. Two distinct Casbin objects, deliberately split so support can read the loan book without being able to re-price the product.

| Code | Permission name | Casbin object | Gates |
|---|---|---|---|
| ⭐ `SULLIS_CASH_CONFIG_READ` | View SullisCash Config | `wallet.sullis-cash.admin-config:read` | SullisCash → Settings |
| `SULLIS_CASH_CONFIG_UPDATE` | Update SullisCash Config | `wallet.sullis-cash.admin-config:update` | save terms — `PUT /api/v1/sullis-cash/admin/config/{currency}` |
| `SULLIS_CASH_LOAN_READ` | View SullisCash Loans | `wallet.sullis-cash.admin-loans:read` | SullisCash → Loans |

Settings is **per currency** (`GET/PUT …/config/{currency}`), and these codes are currency-blind: a role that can price SAR can price every currency. If pricing authority must be split by currency, tell us and we will gate per row. The loan book has no admin write endpoint, so `SULLIS_CASH_LOAN_READ` is its whole surface.

## A7. EXCHANGE

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

## A8. LENDING

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `LENDING_READ` | View Lending | LMS → Dashboard |
| `LENDING_APPLICATION_READ` | View Loan Applications | Loan Management → All Applications |
| `LENDING_APPLICATION_APPROVE` | Approve Loan Application | approve action |
| `LENDING_APPLICATION_REJECT` | Reject Loan Application | reject action |
| `LENDING_APPLICATION_DISBURSE` | Disburse Loan | disbursement action |

## A9. COLLECTIONS

collections-service (`/api/v1/collections/waiver-requests`).

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `COLLECTIONS_READ` | View Collections | Collections group |
| `WAIVER_REQUEST_READ` | View Waiver Requests | Collections → Waiver Requests |
| `WAIVER_REQUEST_APPROVE` | Approve Waiver Request | `POST /waiver-requests/{id}/approve` (+ invoice variant) |
| `WAIVER_REQUEST_REJECT` | Reject Waiver Request | `POST /waiver-requests/{id}/reject` (+ invoice variant) |

## A10. REPORT

Ten report pages, all read-only plus a download.

| Code | Permission name | Gates |
|---|---|---|
| ⭐ `REPORT_READ` | View Reports | Reports (Account, Simah, Accounting & Financing, Loans) + All Reports (Currency, Ledger & Journal, Lending, Collections & Risk, Profitability & Regulatory) |
| `REPORT_EXPORT` | Export Report | CSV / PDF / Excel download on every report |

> **Decision needed:** if reports must be split by audience we will gate per category — `REPORT_ACCOUNT_READ`, `REPORT_SIMAH_READ`, `REPORT_CURRENCY_READ`, `REPORT_LEDGER_READ`, `REPORT_LENDING_READ`, `REPORT_COLLECTIONS_READ`, `REPORT_PROFITABILITY_READ`.

## A11. CRYPTO

crypto-service. Two Casbin objects, split so ops can read the treasury without the customer transfer list, and support can read transfers without touching the treasury.

| Code | Permission name | Casbin object | Gates |
|---|---|---|---|
| ⭐ `CRYPTO_TREASURY_READ` | View Crypto Treasury | `crypto.admin.treasury:read` | Crypto → Treasury |
| `CRYPTO_TREASURY_CREATE` | Create Crypto Treasury Address | `crypto.admin.treasury:create` | register / rotate an address — `POST /api/v1/admin/crypto/treasury` |
| `CRYPTO_TRANSFER_READ` | View Crypto Transfers | `crypto.admin.transfers:read` | Crypto → Transfers |
| `CRYPTO_TRANSFER_UPDATE` | Update Crypto Transfer | `crypto.admin.transfers:update` | reconcile + mark dead — `POST …/{id}/reconcile`, `POST …/{id}/abandon` |

**There is deliberately no `CRYPTO_TRANSFER_CREATE`.** A transfer needs a signature from the user's device and no operator holds a key that could produce one, so crypto-service exposes no admin send endpoint. Please do not register a create code — it would advertise a capability the system does not have, and any support process built on it would be built on nothing.

**`CRYPTO_TREASURY_CREATE` is the sensitive one.** That endpoint attaches the KMS/HSM signing handle for the wallet funding every payout, which is why `developer` should hold `CRYPTO_TREASURY_READ` and not it. Neither treasury code exposes key material — the API returns the handle masked to its last six characters.

Role grants per the service's own Casbin migration (`V96__add_crypto_admin_policies.sql`): `super_admin` full · `admin` treasury create+read and transfers read+update · `developer` read on both.

---

# Part B — Codes to add to existing modules

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
| `CUSTOMER` | `BUSINESS_WRITE` | Update Business | approve / reject business documents, block codes |
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

**Two of these fix live over-permissioning, not just hidden menus:**

- **`BUSINESS_*`** — the Business (SME) pages currently borrow `CUSTOMER_READ` / `CUSTOMER_WRITE`, so no role can be given retail-customer access without also getting SME access.
- **`WALLET_TRANSFER_CREATE`** — Send Money and Internal Transfer are admin-initiated money movement gated today by plain `WALLET`, so any wallet-read role can see them.

---

# Part C — Verify only, no action if they already exist

These gates already resolve against the 2026-07-16 catalog. Listed so you can confirm rather than re-create.

| Page | Code relied on |
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

# Part D — Cross-cutting requests

1. **One vocabulary.** identity-service uses `RESOURCE_ACTION` (`CUSTOMER_READ`); wallet-, ledger- and crypto-service use Casbin `object:act` (`gl.entries:read`, `wallet.bnpl.admin-categories:read`, `crypto.admin.treasury:read`). The frontend can only read one catalog. Please surface the Casbin-backed permissions in `/permissions/role/{id}` under their owning module with ordinary `permissionCode` values — the tables above give the mapping we assumed.
2. **Always return `moduleCode`.** Landing-route selection matches on it exclusively.
3. **Every module needs a `*_READ`**, or its menu can never be shown.
4. **Send us the final code list** once registered. Several names here are proposals; we will match whatever you choose.

---

# Part E — Definition of done

1. Every code in Parts A and B is returned by `/permissions/role/{roleId}` with `permissionCode`, `permissionName`, `moduleId`, `action`, `resourceType`, `active`.
2. Every new module returns a non-empty `moduleCode`.
3. Each new module carries at least its ⭐ `*_READ`.
4. A test role holding **only** `LEDGER_READ` shows Ledger, General Ledger and Chart of account — and nothing else.
5. A test role holding **only** `WALLET_GL_ACCOUNT_READ` sees the Wallet GL Accounts page with its save controls disabled; adding `WALLET_GL_ACCOUNT_WRITE` enables them.
6. The three decisions flagged above are answered: Block Codes per-category split, which module owns `GL_*` / `COA_*`, and report granularity.

**Test as a non-`super_admin` role.** Super admin bypasses every gate and will show the full sidebar regardless.

---

# Appendix — flat checklist

Every code in one list, for ticking off.

## New modules

- [ ] `NOTIFICATION_READ`
- [ ] `NOTIFICATION_CREATE`
- [ ] `NOTIFICATION_UPDATE`
- [ ] `NOTIFICATION_DELETE`
- [ ] `CARD_READ`
- [ ] `CARD_CREATE`
- [ ] `CARD_UPDATE`
- [ ] `CARD_FREEZE`
- [ ] `CARD_BLOCK`
- [ ] `CARD_CANCEL`
- [ ] `CARD_PRODUCT_READ`
- [ ] `CARD_PRODUCT_CREATE`
- [ ] `CARD_PRODUCT_UPDATE`
- [ ] `CARD_PRODUCT_DELETE`
- [ ] `CARD_SETTINGS_READ`
- [ ] `CARD_SETTINGS_UPDATE`
- [ ] `BLOCK_CODE_READ`
- [ ] `BLOCK_CODE_CREATE`
- [ ] `BLOCK_CODE_UPDATE`
- [ ] `BLOCK_CODE_DELETE`
- [ ] `USER_BLOCK_APPLY`
- [ ] `USER_BLOCK_REMOVE`
- [ ] `LEDGER_READ`
- [ ] `LEDGER_ACCOUNT_READ`
- [ ] `GL_ENTRY_READ`
- [ ] `GL_ENTRY_RETRY`
- [ ] `GL_ENTRY_REVERSE`
- [ ] `GL_RECONCILIATION_READ`
- [ ] `COA_READ`
- [ ] `COA_CREATE`
- [ ] `COA_UPDATE`
- [ ] `COA_DELETE`
- [ ] `COA_CONFIG_READ`
- [ ] `COA_CONFIG_UPDATE`
- [ ] `COA_FIELD_READ`
- [ ] `COA_FIELD_CREATE`
- [ ] `COA_FIELD_UPDATE`
- [ ] `COA_FIELD_DELETE`
- [ ] `WALLET_GL_ACCOUNT_READ`
- [ ] `WALLET_GL_ACCOUNT_WRITE`
- [ ] `BNPL_CATEGORY_READ`
- [ ] `BNPL_CATEGORY_CREATE`
- [ ] `BNPL_CATEGORY_UPDATE`
- [ ] `BNPL_CATEGORY_DELETE`
- [ ] `BNPL_CURRENCY_LIMIT_READ`
- [ ] `BNPL_CURRENCY_LIMIT_UPDATE`
- [ ] `SULLIS_CASH_CONFIG_READ`
- [ ] `SULLIS_CASH_CONFIG_UPDATE`
- [ ] `SULLIS_CASH_LOAN_READ`
- [ ] `EXCHANGE_PROVIDER_READ`
- [ ] `EXCHANGE_PROVIDER_CREATE`
- [ ] `EXCHANGE_PROVIDER_UPDATE`
- [ ] `EXCHANGE_PROVIDER_DELETE`
- [ ] `EXCHANGE_COUNTRY_READ`
- [ ] `EXCHANGE_COUNTRY_CREATE`
- [ ] `EXCHANGE_COUNTRY_UPDATE`
- [ ] `EXCHANGE_DOCUMENT_TYPE_READ`
- [ ] `EXCHANGE_DOCUMENT_TYPE_CREATE`
- [ ] `EXCHANGE_DOCUMENT_TYPE_UPDATE`
- [ ] `EXCHANGE_VERIFICATION_READ`
- [ ] `EXCHANGE_VERIFICATION_REVIEW`
- [ ] `EXCHANGE_PAYMENT_READ`
- [ ] `LENDING_READ`
- [ ] `LENDING_APPLICATION_READ`
- [ ] `LENDING_APPLICATION_APPROVE`
- [ ] `LENDING_APPLICATION_REJECT`
- [ ] `LENDING_APPLICATION_DISBURSE`
- [ ] `COLLECTIONS_READ`
- [ ] `WAIVER_REQUEST_READ`
- [ ] `WAIVER_REQUEST_APPROVE`
- [ ] `WAIVER_REQUEST_REJECT`
- [ ] `REPORT_READ`
- [ ] `REPORT_EXPORT`
- [ ] `CRYPTO_TREASURY_READ`
- [ ] `CRYPTO_TREASURY_CREATE`
- [ ] `CRYPTO_TRANSFER_READ`
- [ ] `CRYPTO_TRANSFER_UPDATE`

## Existing modules

- [ ] `PRODUCT_SUB_CATEGORY_READ`
- [ ] `PRODUCT_SUB_CATEGORY_CREATE`
- [ ] `PRODUCT_SUB_CATEGORY_UPDATE`
- [ ] `PRODUCT_SUB_CATEGORY_DELETE`
- [ ] `CONTRACT_TEMPLATE_READ`
- [ ] `CONTRACT_TEMPLATE_CREATE`
- [ ] `CONTRACT_TEMPLATE_UPDATE`
- [ ] `CONTRACT_TEMPLATE_DELETE`
- [ ] `LOV_OCCUPATION_READ`
- [ ] `LOV_OCCUPATION_CREATE`
- [ ] `LOV_OCCUPATION_UPDATE`
- [ ] `LOV_OCCUPATION_DELETE`
- [ ] `BUSINESS_READ`
- [ ] `BUSINESS_WRITE`
- [ ] `WALLET_QR_READ`
- [ ] `WALLET_QR_CREATE`
- [ ] `WALLET_QR_PAY`
- [ ] `WALLET_TRANSFER_CREATE`
- [ ] `WALLET_INTERNAL_TRANSFER_CREATE`
- [ ] `WALLET_LIMIT_READ`
- [ ] `WALLET_LIMIT_UPDATE`
- [ ] `MIDDLEWARE_PROVIDER_READ`
- [ ] `MIDDLEWARE_API_READ`
- [ ] `MIDDLEWARE_CLIENT_READ`
- [ ] `MIDDLEWARE_CLIENT_REQUEST_READ`
