# Active Sidebar Pages

Every menu entry the sidebar can actually render today. Commented-out entries (`//` and `/* */`) are excluded.

**Source:** [DashboardSideBar.tsx](../src/components/DashboardSideBar/DashboardSideBar.tsx)
**Rendered array:** `walletItems` ([2262](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2262)–[2760](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2760)) — this is the only array passed to `<Menu>` at [2920](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2920).

> **Dead code note:** the older `sidebarItems` array ([433](../src/components/DashboardSideBar/DashboardSideBar.tsx#L433)–[2253](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2253)) is **not rendered**. Only two of its entries survive, pulled out by name at [2257](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2257)–[2260](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2260) and re-attached under *Financing* / top level: the **LMS** group and **Connector Management**. Its "LOS" group (Customer Management, Product Management, LOV at lines 465–830) is duplicated — the copy that actually renders is inlined at [2642](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2642)–[2755](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2755).

**Totals:** 20 top-level entries · 74 navigable pages.

---

## Tree

```
Dashboard                                   [DASHBOARD]
Notification Orchestrator                   [NOTIFICATION]
Customer Management                         [CUSTOMER]
├── Users
├── Individuals
└── Business
Risk Management                             [RISK]
├── Blacklist NID
├── Blacklist Mobile
├── Fraud Rule Management
├── Internal Checks Config
└── Device Management
Card Management                             [CARD]
├── Dashboard
├── Cards
├── Card Products
└── Card Settings
Block Codes                                 [block_code_module]
├── All Block Codes
├── Compliance
├── AML
├── Anti-Fraud
└── Sanction
Access Control Management                   [ROLE | PERMISSION | EMPLOYEE]
├── Employees                               [EMPLOYEE]
├── Manage Roles                            [ROLE]
└── Manage Permissions                      [PERMISSION]
Send Money                                  [WALLET]
Internal Transfer                           [WALLET]
Wallet QR                                   [WALLET]
├── QR Codes
└── Scan & Pay
Wallet Transactions Limits                  [WALLET]
Wallet Ledger                               [LEDGER | WALLET]
├── Transactions
└── Account Statements
BNPL                                        [BNPL | WALLET]
├── BNPL Categories
└── BNPL Currency Limits
SullisCash Settings                         [SULLIS_CASH | WALLET]
Exchange Top-up                             [EXCHANGE]
├── Countries
├── Document Types
├── Providers
├── Verifications
└── Payments
Ledger                                      [LEDGER]
General Credit Scoring                      [RISK]
Accounts Limit Setting                      [WALLET]
Financing                                   [DASHBOARD|PRODUCT|LOV|LENDING|COLLECTIONS|LEDGER|RISK]
├── LOS
│   ├── Dashboard
│   ├── Product Management                  [PRODUCT]
│   │   ├── Products                        ["View Products"]
│   │   ├── Contract Template               ["Contract Template"]
│   │   ├── Product Category                ["Product Category"]
│   │   └── Product Sub Category            ["Product Sub Category"]
│   └── LOV                                 [LOV]
│       ├── Source Of Income                ["Source Of Income"]
│       ├── Occupation
│       ├── Source Of Wealth                ["Source Of Wealth"]
│       ├── Source Of Funds                 ["Source Of Funds"]
│       ├── Template Types
│       ├── Net Worth Ranges                ["Net Worth Range"]
│       ├── Purpose of Financing            ["Purpose Of Finance"]
│       ├── Credit Scoring Definitions      ["Credit Scoring Field"]
│       └── Approval Conditions             ["Approval Condition Field"]
└── LMS                                     [LENDING|COLLECTIONS|LEDGER|RISK|PRODUCT|POLICY]
    ├── Dashboard
    ├── Loan Management
    │   └── All Applications
    ├── Reports                             [reports_module]
    │   ├── Account Report
    │   ├── Simah Report
    │   ├── Accounting & Financing
    │   └── Loans Reports
    ├── All Reports
    │   ├── Currency Reports
    │   ├── Ledger & Journal
    │   ├── Lending
    │   ├── Collections & Risk
    │   └── Profitability & Regulatory
    ├── General Ledger                      [accounting_financing_module]
    │   ├── GL Entries
    │   ├── Failed Entries
    │   └── Reconciliation
    ├── Chart of account                    [accounting_financing_module]
    │   ├── Accounts
    │   ├── COA Configuration
    │   └── Chart of accounts field
    ├── Collections
    │   └── Waiver Requests
    └── Setting
        ├── Delinquency
        ├── Rescheduling
        └── Dunning Policy
Connector Management                        [MIDDLEWARE]
├── Environment Settings
│   ├── Providers
│   └── All Provider APIs
└── Clients Management
    ├── Clients
    ├── Client Request Prod
    ├── Client Request Dev
    └── Client Request Test
```

---

## Full page list

`—` in the Gate column means the entry has no `hasAccess()` check and renders for every authenticated user.

### Top-level

| Item | Route | Gate | Line |
|---|---|---|---|
| Dashboard | `/LOS/Wallet/Home` | `DASHBOARD` | [2263](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2263) |
| Notification Orchestrator | `/LOS/NotificationOrchestrator` | `NOTIFICATION` | [2268](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2268) |
| Send Money | `/LOS/Wallet/SendMoney` | `WALLET` | [2472](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2472) |
| Internal Transfer | `/LOS/Wallet/InternalTransfer` | `WALLET` | [2479](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2479) |
| Wallet Transactions Limits | `/LOS/CustomerManagement/WalletTransactionLimits` | `WALLET` | [2509](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2509) |
| SullisCash Settings | `/LOS/SullisCash/Settings` | `SULLIS_CASH` \| `WALLET` | [2561](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2561) |
| Ledger | `/LOS/Ledger` | `LEDGER` | [2607](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2607) |
| General Credit Scoring | `/Lms/Setting/GeneralCreditScoring?tab=general-credit-scoring` | `RISK` | [2614](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2614) |
| Accounts Limit Setting | `/Lms/Setting/GeneralCreditScoring?tab=accounts-limit-setting` | `WALLET` | [2623](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2623) |

### Customer Management — gate `CUSTOMER` ([2276](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2276))

| Item | Route | Gate | Line |
|---|---|---|---|
| Users | `/LOS/CustomerManagement/OnboardingUsers` | — | [2284](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2284) |
| Individuals | `/LOS/CustomerManagement/CustomerList` | — | [2290](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2290) |
| Business | `/LOS/CustomerManagement/Business` | — | [2299](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2299) |

### Risk Management — gate `RISK` ([2309](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2309))

| Item | Route | Gate | Line |
|---|---|---|---|
| Blacklist NID | `/LOS/RiskManagement/BlacklistNid` | — | [2317](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2317) |
| Blacklist Mobile | `/LOS/RiskManagement/BlacklistMobile` | — | [2322](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2322) |
| Fraud Rule Management | `/LOS/RiskManagement/FraudRuleManagement` | — | [2328](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2328) |
| Internal Checks Config | `/LOS/RiskManagement/InternalChecksConfig` | — | [2334](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2334) |
| Device Management | `/LOS/RiskManagement/DeviceManagement` | — | [2340](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2340) |

### Card Management — gate `CARD` ([2348](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2348))

| Item | Route | Gate | Line |
|---|---|---|---|
| Dashboard | `/CardManagement/Dashboard` | — | [2354](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2354) |
| Cards | `/CardManagement/Cards` | — | [2361](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2361) |
| Card Products | `/CardManagement/Products` | — | [2367](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2367) |
| Card Settings | `/CardManagement/Settings` | — | [2373](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2373) |

### Block Codes — gate `block_code_module` ([2381](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2381))

| Item | Route | Gate | Line |
|---|---|---|---|
| All Block Codes | `/LOS/BlockCodes/AllBlockCodes` | — | [2388](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2388) |
| Compliance | `/LOS/BlockCodes/Compliance` | — | [2394](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2394) |
| AML | `/LOS/BlockCodes/AML` | — | [2400](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2400) |
| Anti-Fraud | `/LOS/BlockCodes/AntiFraud` | — | [2406](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2406) |
| Sanction | `/LOS/BlockCodes/Sanction` | — | [2412](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2412) |

### Access Control Management — gate `ROLE` \| `PERMISSION` \| `EMPLOYEE` ([2420](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2420))

| Item | Route | Gate | Line |
|---|---|---|---|
| Employees | `/LOS/Setting/Employees` | `EMPLOYEE` | [2427](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2427) |
| Manage Roles | `/LOS/Setting/RoleList` | `ROLE` | [2433](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2433) |
| Manage Permissions | `/LOS/Setting/AssignPermissions` | `PERMISSION` | [2439](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2439) |

### Wallet QR — gate `WALLET` ([2486](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2486))

| Item | Route | Gate | Line |
|---|---|---|---|
| QR Codes | `/LOS/Wallet/Qr/Codes` | — | [2495](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2495) |
| Scan & Pay | `/LOS/Wallet/Qr/ScanPay` | — | [2501](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2501) |

### Wallet Ledger — gate `LEDGER` \| `WALLET` ([2516](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2516))

| Item | Route | Gate | Line |
|---|---|---|---|
| Transactions | `/LOS/WalletLedger/Transactions` | — | [2523](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2523) |
| Account Statements | `/LOS/WalletLedger/Accounts` | — | [2529](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2529) |

### BNPL — gate `BNPL` \| `WALLET` ([2537](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2537))

| Item | Route | Gate | Line |
|---|---|---|---|
| BNPL Categories | `/LOS/Bnpl/Categories` | — | [2547](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2547) |
| BNPL Currency Limits | `/LOS/Bnpl/CurrencyLimits` | — | [2553](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2553) |

### Exchange Top-up — gate `EXCHANGE` ([2568](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2568))

| Item | Route | Gate | Line |
|---|---|---|---|
| Countries | `/LOS/Exchange/Countries` | — | [2575](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2575) |
| Document Types | `/LOS/Exchange/DocumentTypes` | — | [2581](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2581) |
| Providers | `/LOS/Exchange/Providers` | — | [2587](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2587) |
| Verifications | `/LOS/Exchange/Verifications` | — | [2593](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2593) |
| Payments | `/LOS/Exchange/Payments` | — | [2599](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2599) |

### Financing → LOS — gate `DASHBOARD|PRODUCT|LOV|LENDING|COLLECTIONS|LEDGER|RISK` ([2632](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2632))

| Item | Route | Gate | Line |
|---|---|---|---|
| Dashboard | `/LOS/Dashboard` | — | [2652](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2652) |
| **Product Management** | — | `PRODUCT` | [2660](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2660) |
| ├ Products | `/LOS/ProductManagement` | `"View Products"` | [2666](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2666) |
| ├ Contract Template | `/LOS/NotificationTemplate/ContractTemplate` | `"Contract Template"` | [2672](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2672) |
| ├ Product Category | `/LOS/ProductManagement/ProductCategory` | `"Product Category"` | [2678](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2678) |
| └ Product Sub Category | `/LOS/ProductManagement/ProductSubCategory` | `"Product Sub Category"` | [2684](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2684) |
| **LOV** | — | `LOV` | [2692](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2692) |
| ├ Source Of Income | `/LOS/LOV/SourceOfIncome` | `"Source Of Income"` | [2698](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2698) |
| ├ Occupation | `/LOS/LOV/Occupation` | — | [2704](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2704) |
| ├ Source Of Wealth | `/LOS/LOV/SourceOfWealth` | `"Source Of Wealth"` | [2710](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2710) |
| ├ Source Of Funds | `/LOS/LOV/SourceOfFunds` | `"Source Of Funds"` | [2716](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2716) |
| ├ Template Types | `/LOS/LOV/TemplateTypes` | — | [2722](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2722) |
| ├ Net Worth Ranges | `/LOS/LOV/NetWorthRanges` | `"Net Worth Range"` | [2728](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2728) |
| ├ Purpose of Financing | `/LOS/LOV/PurposeofFinancing` | `"Purpose Of Finance"` | [2734](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2734) |
| ├ Credit Scoring Definitions | `/LOS/LOV/CreditScoringDefinitions` | `"Credit Scoring Field"` | [2740](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2740) |
| └ Approval Conditions | `/LOS/LOV/ApprovalConditions` | `"Approval Condition Field"` | [2746](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2746) |

### Financing → LMS — gate `LENDING|COLLECTIONS|LEDGER|RISK|PRODUCT|POLICY` ([2756](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2756))

| Item | Route | Gate | Line |
|---|---|---|---|
| Dashboard | `/Lms/dashboard` | — | [1146](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1146) |
| **Loan Management** | — | — | [1166](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1166) |
| └ All Applications | `/Lms/LoanManagement/ApplicationManagement` | — | [1174](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1174) |
| **Reports** | — | `reports_module` | [1217](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1217) |
| ├ Account Report | `/Lms/Reports/AccountReportsList` | — | [1225](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1225) |
| ├ Simah Report | `/Lms/Reports/SimahReportsList` | — | [1233](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1233) |
| ├ Accounting & Financing | `/Lms/Reports/AccountingFinancing` | — | [1241](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1241) |
| └ Loans Reports | `/Lms/Reports/loans` | — | [1247](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1247) |
| **All Reports** | — | — | [1419](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1419) |
| ├ Currency Reports | `/Lms/ReportsCenter/currency` | — | [1428](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1428) |
| ├ Ledger & Journal | `/Lms/ReportsCenter/ledger` | — | [1434](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1434) |
| ├ Lending | `/Lms/ReportsCenter/lending` | — | [1440](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1440) |
| ├ Collections & Risk | `/Lms/ReportsCenter/collections` | — | [1446](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1446) |
| └ Profitability & Regulatory | `/Lms/ReportsCenter/profitability` | — | [1452](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1452) |
| **General Ledger** | — | `accounting_financing_module` | [1460](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1460) |
| ├ GL Entries | `/Lms/LedgerGl/Entries` | — | [1469](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1469) |
| ├ Failed Entries | `/Lms/LedgerGl/Failed` | — | [1475](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1475) |
| └ Reconciliation | `/Lms/LedgerGl/Reconciliation` | — | [1481](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1481) |
| **Chart of account** | — | `accounting_financing_module` | [1489](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1489) |
| ├ Accounts | `/Lms/ChartOfAccount/ChartOfAccount` | — | [1497](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1497) |
| ├ COA Configuration | `/Lms/ChartOfAccount/CoaConfiguration` | — | [1504](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1504) |
| └ Chart of accounts field | `/Lms/ChartOfAccount/ChartOfAccountFields` | — | [1510](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1510) |
| **Collections** | — | — | [1519](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1519) |
| └ Waiver Requests | `/Lms/Collections/WaiverRequests` | — | [1526](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1526) |
| **Setting** | — | — | [1535](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1535) |
| ├ Delinquency | `/Lms/Setting/Deliquency` | — | [1560](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1560) |
| ├ Rescheduling | `/Lms/Setting/Rescheduling` | — | [1566](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1566) |
| └ Dunning Policy | `/Lms/Setting/DunningPolicy` | — | [1572](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1572) |

### Connector Management — gate `MIDDLEWARE` ([2759](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2759))

| Item | Route | Gate | Line |
|---|---|---|---|
| **Environment Settings** | — | — | [1870](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1870) |
| ├ Providers | `/ThirdPartyManagement/Providers` | — | [1883](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1883) |
| └ All Provider APIs | `/ThirdPartyManagement/AllProviderApis` | — | [1889](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1889) |
| **Clients Management** | — | — | [1897](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1897) |
| ├ Clients | `/ThirdPartyManagement/Clients` | — | [1904](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1904) |
| ├ Client Request Prod | `/ThirdPartyManagement/RequestHistory/ClientRequestProd` | — | [1910](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1910) |
| ├ Client Request Dev | `/ThirdPartyManagement/RequestHistory/ClientRequestDev` | — | [1916](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1916) |
| └ Client Request Test | `/ThirdPartyManagement/RequestHistory/ClientRequestTest` | — | [1922](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1922) |

---

## Commented out — not rendered

Kept here so nobody re-audits them as "missing".

| Item | Comment style | Line |
|---|---|---|
| Wallet Management (Wallets, Wallet Transactions Limits) | `/* */` | [2447](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2447)–[2471](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2471) |
| System Logs → Laravel Logs | `/* */` | [2047](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2047)–[2061](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2061) |
| Clients Management → Request Detail | `/* */` | [1928](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1928)–[1933](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1933) |
| LOV → Monthly Income | `/* */` | [743](../src/components/DashboardSideBar/DashboardSideBar.tsx#L743)–[748](../src/components/DashboardSideBar/DashboardSideBar.tsx#L748) |
| LOV → List Of Values | `/* */` | [767](../src/components/DashboardSideBar/DashboardSideBar.tsx#L767)–[772](../src/components/DashboardSideBar/DashboardSideBar.tsx#L772) |
| Leads · Opportunities · PEP Customers · Risk Customers · Sanctioned Customers · All Customer Status · Onboard Customers | `//` | [473](../src/components/DashboardSideBar/DashboardSideBar.tsx#L473)–[523](../src/components/DashboardSideBar/DashboardSideBar.tsx#L523) |
| Department Management (Departments, Department Permissions) | `//` | [598](../src/components/DashboardSideBar/DashboardSideBar.tsx#L598)–[619](../src/components/DashboardSideBar/DashboardSideBar.tsx#L619) |
| Factoring Management (all 9 children) | `//` | [832](../src/components/DashboardSideBar/DashboardSideBar.tsx#L832)–[906](../src/components/DashboardSideBar/DashboardSideBar.tsx#L906) |
| Partner Management (Partners List, Partners Commission) | `//` | [989](../src/components/DashboardSideBar/DashboardSideBar.tsx#L989)–[1011](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1011) |
| Settings (Factoring Valley Info, Compliance Requirement) | `//` | [1013](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1013)–[1035](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1035) |
| API Management (All APIs) | `//` | [1060](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1060)–[1075](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1075) |
| Accounting & Financing (Voucher, Day Book, Trial Balance, Ledger) | `//` | [1255](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1255)–[1290](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1290) |
| Loans Reports (Overdue, Non Performing, Due, Early Settlement, Write Off) | `//` | [1293](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1293)–[1340](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1340) |
| Setting → Work Flow Mapping · Invoice Setting · Calculator · Securization · Tools | `//` | [1578](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1578)–[1620](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1620) |
| Logs (Logs, Api Logs, Disburse Amount Api Logs) | `//` | [1631](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1631)–[1657](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1657) |
| Connector → Services Management · Environment APIs · Settings | `//` | [1960](../src/components/DashboardSideBar/DashboardSideBar.tsx#L1960)–[2075](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2075) |
| Investor Dashboard (Notifications, Admin Users & Roles) | `//` | [2230](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2230)–[2252](../src/components/DashboardSideBar/DashboardSideBar.tsx#L2252) |
