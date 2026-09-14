# Permission Catalog — Portfolio Management

**One module. 13 codes. Nothing here exists in the catalog today.**

**Where they must appear:** `GET /identity-service/api/v1/permissions/role/{roleId}`
**Ask:** 1 new module (`PORTFOLIO`) · 13 new permission codes
**Owning service for the endpoints:** `portfolio-service`
**Frontend state:** every gate below is already wired and merged on `finova-uat`. Nothing needs a frontend
release — the moment a code is returned by the endpoint, the page and its menu entry become reachable for
whoever holds it.

This is a companion to [BACKEND_PERMISSIONS_REQUEST.md](BACKEND_PERMISSIONS_REQUEST.md), which covers the
other 15 modules and was delivered in identity-service V86–V103. Portfolio Management was built after that
request went out and appears nowhere in it — `grep PORTFOLIO docs/` returns nothing across every document in
this repository. The same conventions apply; they are restated at the end rather than assumed.

---

## Why this is needed

Portfolio Management is gated exactly like every other module: the sidebar group, each menu row, and each
write action inside a page all call `hasAccess` / `hasPermission` with a code. A gate whose code is absent
from the catalog **fails closed**.

So today, for every role except `super_admin`:

- the **Portfolio Management** group does not appear in the sidebar at all
- none of its 14 pages is reachable through the UI
- every create / edit / delete / approve button inside those pages is hidden

`super_admin` bypasses all gating and sees the full module, which is why this has not been obvious.

> **Test with a normal role, never with `super_admin`.** Super admin renders the whole sidebar whether or
> not any of this lands, so it cannot tell you whether the codes work.

---

## The 13 codes

⭐ marks a code that un-hides a menu row. Everything else is action-level granularity inside a page the user
can already open.

| # | Code | Name | What it gates |
|---|---|---|---|
| 1 | `PORTFOLIO` ⭐ | Portfolio Management | The module itself. Without it the whole group is hidden and none of the rows below can be reached, whatever else is granted. |
| 2 | `PORTFOLIO_ADMIN_DASHBOARD_READ` ⭐ | View Portfolio Dashboard | Dashboard Overview, Audit Logs. Also Logs and Notifications, which are currently commented out of the menu. |
| 3 | `PORTFOLIO_INVESTOR_READ` ⭐ | View Investors | The investor book, investor detail, KYC/KYB detail, documents. |
| 4 | `PORTFOLIO_INVESTOR_MANAGE` | Manage Investors | Register an investor, import investors, edit one. |
| 5 | `PORTFOLIO_INVESTOR_VERIFY` | Verify Investor Documents | Approve or reject an uploaded KYC/KYB document. Separate from `_MANAGE` on purpose — see the note below. |
| 6 | `PORTFOLIO_PRODUCT_READ` ⭐ | View Products | Products & Rates, product detail, product configuration. |
| 7 | `PORTFOLIO_PRODUCT_MANAGE` | Manage Products | Create and delete a product; save a product configuration. |
| 8 | `PORTFOLIO_SETTINGS_READ` ⭐ | View Portfolio Settings | System Settings and its four screens: Income Ranges, Initial Invest, Investment Experience, Investment Timeline. |
| 9 | `PORTFOLIO_SETTINGS_MANAGE` | Manage Portfolio Settings | Add / edit / delete an entry on any of those four screens. Also gates Admin Users & Roles, which is currently commented out of the menu. |
| 10 | `PORTFOLIO_INVESTMENT_READ` ⭐ | View Investments | The investments (subscriptions) list and its detail panel. |
| 11 | `PORTFOLIO_INVESTMENT_MANAGE` | Manage Investments | Edit an investment, open the adjustment form, submit an adjustment, delete. |
| 12 | `PORTFOLIO_INVESTMENT_APPROVE` ⭐ | Approve Investments | The Approve Investment queue, and the approve action in it. This one both un-hides a row and gates the action on it. |
| 13 | `PORTFOLIO_ALLOCATION_READ` ⭐ | View Allocation Engine | Allocation Engine, its audit trail, strategies, risk profiles, simulation results. |
| 14 | `PORTFOLIO_ALLOCATION_MANAGE` | Manage Allocation Engine | Create / clone / enable / delete a strategy; create a risk profile; import profiles. |
| 15 | `PORTFOLIO_DASHBOARD_READ` ⭐ | View Portfolio Reports | The Reports index and all 16 report screens beneath it. |
| 16 | `PORTFOLIO_FUND_READ` ⭐ | View Portfolio Ledger | The Ledger screen. Currently commented out of the menu. |

> The table lists 16 rows because three codes appear in more than one place; **13 distinct codes** are being
> requested. The full distinct list, ready to paste:
>
> ```
> PORTFOLIO
> PORTFOLIO_ADMIN_DASHBOARD_READ
> PORTFOLIO_ALLOCATION_MANAGE
> PORTFOLIO_ALLOCATION_READ
> PORTFOLIO_DASHBOARD_READ
> PORTFOLIO_FUND_READ
> PORTFOLIO_INVESTMENT_APPROVE
> PORTFOLIO_INVESTMENT_MANAGE
> PORTFOLIO_INVESTMENT_READ
> PORTFOLIO_INVESTOR_MANAGE
> PORTFOLIO_INVESTOR_READ
> PORTFOLIO_INVESTOR_VERIFY
> PORTFOLIO_PRODUCT_MANAGE
> PORTFOLIO_PRODUCT_READ
> PORTFOLIO_SETTINGS_MANAGE
> PORTFOLIO_SETTINGS_READ
> ```
>
> (16 lines — `PORTFOLIO_DASHBOARD_READ` and `PORTFOLIO_ADMIN_DASHBOARD_READ` are two different codes; see
> the naming note below, where we ask you to collapse them.)

---

## Menu rows, exactly as the sidebar gates them

Every row under the group, in the order it renders. Routes are relative to `/InvestorDashboard`.

| Row | Gate | Route |
|---|---|---|
| *(the group)* | `PORTFOLIO` | `/Overview` |
| Dashboard Overview | `PORTFOLIO_ADMIN_DASHBOARD_READ` | `/Overview` |
| Investors | `PORTFOLIO_INVESTOR_READ` | `/Investors` |
| Products & Rates | `PORTFOLIO_PRODUCT_READ` | `/Products` |
| System Settings | `PORTFOLIO_SETTINGS_READ` | `/SystemSettings` |
| → Income Ranges | `PORTFOLIO_SETTINGS_READ` | `/SystemSettings/IncomeRanges` |
| → Initial Invest | `PORTFOLIO_SETTINGS_READ` | `/SystemSettings/InitialInvest` |
| → Investment Experience | `PORTFOLIO_SETTINGS_READ` | `/SystemSettings/InvestmentExperience` |
| → Investment Timeline | `PORTFOLIO_SETTINGS_READ` | `/SystemSettings/InvestmentTimeline` |
| Approve Investment | `PORTFOLIO_INVESTMENT_APPROVE` | `/ApproveInvestment` |
| Investments | `PORTFOLIO_INVESTMENT_READ` | `/Investments` |
| Allocation Engine | `PORTFOLIO_ALLOCATION_READ` | `/AllocationEngine` |
| Reports | `PORTFOLIO_DASHBOARD_READ` | `/Reports` |
| Audit Logs | `PORTFOLIO_ADMIN_DASHBOARD_READ` | `/AuditLogs` |

**Commented out of the menu at the client's request, gates left in place.** Register the codes anyway — the
routes still resolve and the rows are five uncommented lines away from returning.

| Row | Gate | Route |
|---|---|---|
| Logs | `PORTFOLIO_ADMIN_DASHBOARD_READ` | `/Logs` |
| Ledger | `PORTFOLIO_FUND_READ` | `/Ledger` |
| Notifications | `PORTFOLIO_ADMIN_DASHBOARD_READ` | `/Notifications` |
| Admin Users & Roles | `PORTFOLIO_SETTINGS_MANAGE` | `/AdminUsers` |

---

## In-page action gates

These hide buttons inside a page the user can already open. Nineteen files, all merged.

| Code | File | Actions behind it |
|---|---|---|
| `PORTFOLIO_INVESTOR_MANAGE` | `investors/InvestorsList.tsx` | Import investors, Add Investor |
| | `investors/AddInvestor.tsx` | Submit the registration form |
| | `investors/InvestorDetail.tsx` | Edit investor |
| | `investors/KycDocuments.tsx` | Upload / replace a KYC document |
| `PORTFOLIO_INVESTOR_VERIFY` | `investors/DocumentPreview.tsx` | Approve / Reject a document |
| | `investors/InvestorDocuments.tsx` | Approve / Reject a document |
| `PORTFOLIO_PRODUCT_MANAGE` | `products/ProductsListNew.tsx` | Create product, Delete product |
| | `products/ProductConfiguration.tsx` | Edit configuration, Save configuration |
| `PORTFOLIO_SETTINGS_MANAGE` | `income-ranges/IncomeRangeList.tsx` | Add, Edit, Delete |
| | `initial-invest/InitialInvestList.tsx` | Add, Edit, Delete |
| | `investment-experience/InvestmentExperienceList.tsx` | Add, Edit, Delete |
| | `investment-timeline/InvestmentTimelineList.tsx` | Add, Edit, Delete |
| `PORTFOLIO_INVESTMENT_MANAGE` | `investments/InvestmentsList.tsx` | Edit, Adjust, Delete |
| | `investments/InvestmentAdjust.tsx` | Submit adjustment |
| | `investors/InvestorDetail.tsx` | Investment actions on the investor's own page |
| `PORTFOLIO_INVESTMENT_APPROVE` | `investments/ApproveInvestment.tsx` | Approve |
| `PORTFOLIO_ALLOCATION_MANAGE` | `allocation/AllocationDashboard.tsx` | Create strategy |
| | `allocation/StrategiesList.tsx` | Create, clone, enable, delete a strategy |
| | `allocation/CreateStrategy.tsx` | Save strategy |
| | `allocation/RiskProfiles.tsx` | Create profile, Import profiles |

---

## Endpoints these should protect

The frontend calls `${VITE_API_BASE_URL}/portfolio-service`. Hiding a button is not authorization — please
enforce the same codes server-side on these:

| Endpoint prefix | Read | Write |
|---|---|---|
| `/api/v1/AdminDashBoard` | `PORTFOLIO_ADMIN_DASHBOARD_READ` | — |
| `/api/v1/InvestorKyc`, `/api/v1/InvestorKyb` | `PORTFOLIO_INVESTOR_READ` | `PORTFOLIO_INVESTOR_MANAGE` |
| `/api/v1/Document` | `PORTFOLIO_INVESTOR_READ` | `PORTFOLIO_INVESTOR_VERIFY` (approve/reject) |
| `/api/v1/BusinessShare` | `PORTFOLIO_INVESTOR_READ` | `PORTFOLIO_INVESTOR_MANAGE` |
| `/api/v1/Product`, `/api/v1/ProductConfiguration` | `PORTFOLIO_PRODUCT_READ` | `PORTFOLIO_PRODUCT_MANAGE` |
| `/api/v1/IncomeRange` | `PORTFOLIO_SETTINGS_READ` | `PORTFOLIO_SETTINGS_MANAGE` |
| `/api/v1/InitialInvest` | `PORTFOLIO_SETTINGS_READ` | `PORTFOLIO_SETTINGS_MANAGE` |
| `/api/v1/InvestmentExperience` | `PORTFOLIO_SETTINGS_READ` | `PORTFOLIO_SETTINGS_MANAGE` |
| `/api/v1/InvestmentTimeline` | `PORTFOLIO_SETTINGS_READ` | `PORTFOLIO_SETTINGS_MANAGE` |
| `/api/v1/Investment` | `PORTFOLIO_INVESTMENT_READ` | `PORTFOLIO_INVESTMENT_MANAGE`; approve → `PORTFOLIO_INVESTMENT_APPROVE` |
| `/api/v1/ProductPortfolio` | `PORTFOLIO_ALLOCATION_READ` | `PORTFOLIO_ALLOCATION_MANAGE` |

---

## Three things we would like your opinion on

**1. `PORTFOLIO_DASHBOARD_READ` and `PORTFOLIO_ADMIN_DASHBOARD_READ` are both in use, and the split is not
meaningful.** The first gates the Reports index, the second gates Dashboard Overview and Audit Logs. That is
an accident of how the screens were written, not a decision. If you would rather register one code, tell us
which and we will collapse the frontend onto it — a `PORTFOLIO_REPORT_READ` for Reports and
`PORTFOLIO_DASHBOARD_READ` for the dashboard would read better than what we have.

**2. `PORTFOLIO_INVESTOR_VERIFY` is deliberately not `PORTFOLIO_INVESTOR_MANAGE`.** Approving someone's KYC
document is a compliance decision; editing their address is administration. We would expect an operations
role to hold `_MANAGE` without `_VERIFY`. If your model does not separate those, say so and we will merge
them — but we would rather you kept the split.

**3. `PORTFOLIO_SETTINGS_MANAGE` currently gates Admin Users & Roles.** That is wrong, and it is ours: the
row was added to the settings group and inherited its code. If that screen comes back, it should have its
own code — `PORTFOLIO_ADMIN_MANAGE` or similar — rather than letting anyone who can edit an income range
also administer roles. The row is commented out today, so this is not urgent, but please do not register it
under settings.

---

## Conventions (unchanged from the previous request)

- **Code:** `RESOURCE_ACTION`, uppercase, snake — matching the existing catalog.
- **Name:** `View / Create / Update / Delete <Entity>`. The frontend localizes these names from the code, so
  keeping the pattern keeps the Arabic and French labels correct.
- **Every module needs a `*_READ`.** Menu visibility is a read decision.
- **The module must return a non-empty `moduleCode`.** The post-login landing route matches on `moduleCode`
  only — a module returning just `moduleName` can never be a landing page.
- **Register, then grant.** The previous round was delivered but initially read as missing because
  `role_permissions` had not been written: `/permissions/role/{roleId}` joins that table, so a registered
  code that is not granted is indistinguishable from one that does not exist. Please grant the full set to
  `super_admin` and `admin`, and re-run the Casbin + Redis sync.
- **The names here are proposals.** Register whatever you prefer and send us the final list — we will match
  you, not the other way round, exactly as we did for the nine renames in the previous round.

---

## How the frontend matches

Both gates lower-case the code and compare it against, in order, `permissionCode`, `code`, `name`,
`permissionName` on each permission in `permissionsList` / `permissions`, recursing into `subModulesList` /
`sub_modules`. The module-level gate (`PORTFOLIO`) additionally matches `moduleCode` and `moduleName`.

So an exact `permissionCode` is all that is needed. The display-name fallback exists for older gates and
should not be relied on for anything here.

`/api/v1/permissions` answers as a bare array for some roles and as `{ los: [...] }` for others; the frontend
normalises both. No change requested — noting it so the shape is not treated as a bug.
