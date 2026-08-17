# Backend Request — Wallet GL Accounts permissions

**Status:** outstanding · **Raised:** 2026-08-17 · **Blocks:** one page, for every role except super admin
**Endpoint they must appear in:** `GET /identity-service/api/v1/permissions/role/{roleId}`
**Parent document:** [PERMISSIONS_TO_ADD.md](PERMISSIONS_TO_ADD.md) — this is the delta found when re-auditing the sidebar on 2026-08-17. Everything else in that document still stands; this is the only page added since that has no permission at all.

---

## The ask

Two codes, under the `LEDGER` module.

| Code | Permission name | Action | Who should hold it |
|---|---|---|---|
| `WALLET_GL_ACCOUNT_READ` | View Wallet GL Accounts | read | most back-office roles |
| `WALLET_GL_ACCOUNT_WRITE` | Update Wallet GL Accounts | write | admin / head_of_accounts only |

If `LEDGER` is not the right owner, any module works — the frontend only needs the **code strings** to be final and stable. Tell us which module you register them under.

---

## What they gate

**Page:** Wallet GL Accounts — `/Lms/ChartOfAccount/WalletAccounts`
**Sidebar:** LMS → Chart of account → Wallet GL Accounts
**Component:** [WalletGlAccounts.tsx](../src/pages/lmsPages/LedgerGl/WalletGlAccounts.tsx)

The screen decides **which GL account each wallet rail posts to**. `READ` shows the mapping; `WRITE` changes it.

`WRITE` deserves to be narrow: changing a mapping redirects every wallet transaction posted from that moment on, so a mistake here is not one bad row but a stream of misposted entries until someone notices.

---

## Why it is not already covered

The screen landed after the original catalog request was sent, so it was never in the batch. It currently carries Casbin `object:act` strings rather than catalog codes:

```ts
// src/hooks/useProductPermissions.ts
export const WALLET_GL_ACCOUNT_PERMISSIONS = {
  READ: "ledger.wallet-gl-accounts:read",
  WRITE: "ledger.wallet-gl-accounts:write",
};
```

The identity-service catalog cannot express that shape — it returns `RESOURCE_ACTION` codes — so `hasPermission()` never matches and the page returns *Permission Denied* to every role that is not `super_admin`. This is the same mismatch already resolved for the GL screens, where `gl.entries:read` became `GL_ENTRY_READ`.

---

## Frontend state

Already done, so nothing is pending on our side once the codes exist:

- The constant above has been switched to `WALLET_GL_ACCOUNT_READ` / `WALLET_GL_ACCOUNT_WRITE`.
- The sidebar entry is gated on `WALLET_GL_ACCOUNT_READ`, so it no longer advertises a link that dead-ends in a denial.

Both are inert until the codes are registered — behaviour is unchanged (super admin sees the page, nobody else does). The moment `/permissions/role/{id}` returns them, the page and its menu entry light up for whoever holds them. **No frontend release is needed to activate this.**

---

## Definition of done

1. Both codes are returned by `/permissions/role/{roleId}` with `permissionCode`, `permissionName`, `moduleId`, `action`, `resourceType`, `active`.
2. Their module returns a non-empty `moduleCode`.
3. A test role holding only `WALLET_GL_ACCOUNT_READ` sees the Wallet GL Accounts menu entry and the page, and the save controls stay disabled.
4. Adding `WALLET_GL_ACCOUNT_WRITE` to that role enables the save controls.

**Test with a non-`super_admin` role** — super admin bypasses every gate ([DashboardSideBar.tsx:399](../src/components/DashboardSideBar/DashboardSideBar.tsx#L399)) and will show the page whether or not this lands.
