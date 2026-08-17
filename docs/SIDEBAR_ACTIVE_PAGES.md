# Active Sidebar Pages

Every menu entry the sidebar can render, with the permission that gates it. Commented-out entries are excluded.

**Source:** [DashboardSideBar.tsx](../src/components/DashboardSideBar/DashboardSideBar.tsx)
**Last re-audited:** 2026-08-17

**Totals:** 24 top-level entries · 84 navigable pages · every one of them gated.

## How the sidebar is assembled

Four arrays, rendered in this order by `<Menu>`:

| Array | Contents |
|---|---|
| `accountingItems` ([2199](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2199)) | Chart of account, General Ledger, All Reports — lifted out of Financing → LMS to the top level |
| `walletItems` ([2318](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2318)) | everything else at top level, including the Financing group |
| `lmsModule` / `connectorModule` ([2191](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2191)) | pulled by name out of `sidebarItems` and re-attached — LMS under Financing, Connector at top level |

> **Dead code:** the rest of `sidebarItems` ([461](../src/components/DashboardSideBar/DashboardSideBar.tsx#L461)–[2188](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2188)) is **not rendered**. Only the LMS and Connector Management entries survive, via the two `.find()` calls above. Its "LOS" group (Customer Management, Product Management, LOV) is a duplicate — the copy that renders is inlined under Financing. Both copies still have to be edited in lockstep.

---

## Tree

Gate shown in brackets. A bare name (`CUSTOMER`) matches a module code; a suffixed one (`CUSTOMER_READ`) matches a permission code.

```
Chart of account                            [LEDGER]
├── Accounts                                [COA_READ]
├── COA Configuration                       [COA_CONFIG_READ]
├── Chart of accounts field                 [COA_FIELD_READ]
└── Wallet GL Accounts                      [WALLET_GL_ACCOUNT_READ]   ← code not yet in catalog
General Ledger                              [LEDGER]
├── GL Entries                              [GL_ENTRY_READ]
├── Failed Entries                          [GL_ENTRY_READ]
└── Reconciliation                          [GL_RECONCILIATION_READ]
All Reports                                 [REPORT_READ]
├── Transactions                            [LEDGER]
├── Currency Reports                        [REPORT_READ]
├── Ledger & Journal                        [REPORT_READ]
├── Lending                                 [REPORT_READ]
├── Collections & Risk                      [REPORT_READ]
└── Profitability & Regulatory              [REPORT_READ]
Dashboard                                   [DASHBOARD]
Notification Orchestrator                   [NOTIFICATION]
Customer Management                         [CUSTOMER]
├── Users                                   [ONBOARDING_READ]
├── Individuals                             [CUSTOMER_READ]
└── Business                                [BUSINESS_READ]
Risk Management                             [RISK]
├── Blacklist NID                           [RISK_BLACKLIST_READ]
├── Blacklist Mobile                        [RISK_BLACKLIST_READ]
├── Fraud Rule Management                   [RISK_FRAUD_RULES_READ]
├── Internal Checks Config                  [RISK_PARAMETERS_READ]
└── Device Management                       [RISK_DEVICES_READ]
Card Management                             [CARD]
├── Dashboard                               [CARD_READ]
├── Cards                                   [CARD_READ]
├── Card Products                           [CARD_PRODUCT_READ]
└── Card Settings                           [CARD_SETTINGS_READ]
Block Codes                                 [BLOCK_CODE]
├── All Block Codes                         [BLOCK_CODE_READ]
├── Compliance                              [BLOCK_CODE_READ]
├── AML                                     [BLOCK_CODE_READ]
├── Anti-Fraud                              [BLOCK_CODE_READ]
└── Sanction                                [BLOCK_CODE_READ]
Access Control Management                   [ROLE | PERMISSION | EMPLOYEE]
├── Employees                               [EMPLOYEE]
├── Manage Roles                            [ROLE]
└── Manage Permissions                      [PERMISSION]
Send Money                                  [WALLET]
Internal Transfer                           [WALLET]
Wallet Transactions Limits                  [WALLET]
BNPL                                        [BNPL]
├── BNPL Categories                         [BNPL_CATEGORY_READ]
└── BNPL Currency Limits                    [BNPL_CURRENCY_LIMIT_READ]
SullisCash                                  [SULLIS_CASH]
├── SullisCash Settings                     [SULLIS_CASH_CONFIG_READ]
└── SullisCash Loans                        [SULLIS_CASH_LOAN_READ]
Crypto                                      [CRYPTO]                   ← module not yet in catalog
├── Crypto Treasury                         [CRYPTO_TREASURY_READ]     ← not yet in catalog
└── Crypto Transfers                        [CRYPTO_TRANSFER_READ]     ← not yet in catalog
Exchange Top-up                             [EXCHANGE]
├── Countries                               [EXCHANGE_COUNTRY_READ]
├── Document Types                          [EXCHANGE_DOCUMENT_TYPE_READ]
├── Providers                               [EXCHANGE_PROVIDER_READ]
├── Verifications                           [EXCHANGE_VERIFICATION_READ]
└── Payments                                [EXCHANGE_PAYMENT_READ]
Ledger                                      [LEDGER]
General Credit Scoring                      [RISK]
Accounts Limit Setting                      [WALLET]
Financing        [DASHBOARD | PRODUCT | LOV | LENDING | COLLECTIONS | LEDGER | RISK]
├── LOS                                     (group, children gated)
│   ├── Dashboard                           [DASHBOARD_READ]
│   ├── Product Management                  [PRODUCT]
│   │   ├── Products                        [PRODUCT_READ]
│   │   ├── Contract Template               [CONTRACT_TEMPLATE_READ]
│   │   ├── Product Category                [PRODUCT_CATEGORY_READ]
│   │   └── Product Sub Category            [PRODUCT_SUB_CATEGORY_READ]
│   └── LOV                                 [LOV]
│       ├── Source Of Income                [LOV_SOI_READ]
│       ├── Occupation                      [LOV_OCCUPATION_READ]
│       ├── Source Of Wealth                [LOV_SOW_READ]
│       ├── Source Of Funds                 [LOV_SOF_READ]
│       ├── Template Types                  [TEMPLATE_TYPE_READ]
│       ├── Net Worth Ranges                [LOV_NWR_READ]
│       ├── Purpose of Financing            [LOV_POF_READ]
│       ├── Credit Scoring Definitions      [RISK_CREDIT_SCORING_FIELDS_READ]
│       └── Approval Conditions             [APPROVAL_CONDITION_FIELD_READ]
└── LMS       [LENDING | COLLECTIONS | LEDGER | RISK | PRODUCT | POLICY]
    ├── Dashboard                           [LENDING_READ]
    ├── Loan Management                     [LENDING_APPLICATION_READ]
    │   └── All Applications                [LENDING_APPLICATION_READ]
    ├── Reports                             [REPORT]
    │   ├── Account Report                  [REPORT_READ]
    │   ├── Simah Report                    [REPORT_READ]
    │   ├── Accounting & Financing          [REPORT_READ]
    │   └── Loans Reports                   [REPORT_READ]
    ├── Collections                         [COLLECTIONS_READ]
    │   └── Waiver Requests                 [WAIVER_REQUEST_READ]
    └── Setting                             [POLICY_READ]
        ├── Delinquency                     [POLICY_READ]
        ├── Rescheduling                    [POLICY_READ]
        └── Dunning Policy                  [POLICY_READ]
Connector Management                        [MIDDLEWARE]
├── Environment Settings                    [MIDDLEWARE_PROVIDER_READ]
│   ├── Providers                           [MIDDLEWARE_PROVIDER_READ]
│   └── All Provider APIs                   [MIDDLEWARE_API_READ]
└── Clients Management                      [MIDDLEWARE_CLIENT_READ]
    ├── Clients                             [MIDDLEWARE_CLIENT_READ]
    ├── Client Request Prod                 [MIDDLEWARE_CLIENT_REQUEST_READ]
    ├── Client Request Dev                  [MIDDLEWARE_CLIENT_REQUEST_READ]
    └── Client Request Test                 [MIDDLEWARE_CLIENT_REQUEST_READ]
```

Three group parents carry no gate of their own — `LOS`, `LMS` and `Connector Management`. That is intentional: each is gated where it is attached (`hasAccess([...]) && lmsModule` at [2892](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2892), `hasAccess("MIDDLEWARE") && connectorModule` at [2895](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2895)), and `LOS` sits inside the already-gated Financing group with every child gated individually.

---

## Codes not yet in the catalog

Everything above resolves against the identity-service catalog **except** these. Their menus are visible to super admin only until the backend registers them.

| Code | Page | Tracked in |
|---|---|---|
| `WALLET_GL_ACCOUNT_READ` / `_WRITE` | Wallet GL Accounts | [BACKEND_PERMISSIONS_REQUEST.md](BACKEND_PERMISSIONS_REQUEST.md) §A4 |
| `CRYPTO`, `CRYPTO_TREASURY_*`, `CRYPTO_TRANSFER_*` | Crypto Treasury, Crypto Transfers | [BACKEND_PERMISSIONS_REQUEST.md](BACKEND_PERMISSIONS_REQUEST.md) §A11 |

---

## Route-level guards

Hiding a menu entry is not access control: routes are reachable by URL, so a page must repeat the decision with `if (!canRead) return <PermissionDenied />`. Pages carrying that guard include the three GL screens, Wallet GL Accounts, SullisCash Loans and Config, Reports Center, and both Onboarding screens. There is no route-level gating in the router itself — the guard has to be in the page.

---

## Commented out — not rendered

Kept here so nobody re-audits them as missing pages.

| Item | Style |
|---|---|
| Wallet Management (Wallets, Wallet Transactions Limits) | `/* */` |
| Wallet Ledger group · Wallet QR (QR Codes, Scan & Pay) | `/* */` |
| System Logs → Laravel Logs · Clients → Request Detail | `/* */` |
| LOV → Monthly Income · List Of Values | `/* */` |
| Leads · Opportunities · PEP Customers · Risk Customers · Sanctioned Customers · All Customer Status · Onboard Customers | `//` |
| Department Management · Factoring Management · Partner Management · API Management | `//` |
| Accounting & Financing (Voucher, Day Book, Trial Balance, Ledger) · Loans Reports (Overdue, NPL, Due, Early Settlement, Write Off) | `//` |
| Setting → Work Flow Mapping · Invoice Setting · Calculator · Securization · Tools | `//` |
| Logs (Logs, Api Logs, Disburse Amount Api Logs) · Investor Dashboard | `//` |
