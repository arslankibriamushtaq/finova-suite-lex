# Tenancy — open questions for the backend team

Frontend: `finova-los-frontend`, branch `finova-uat`.
Against `TENANT_ONBOARDING_FRONTEND_GUIDE.md` (rev. 2026-09-01).

The signup flow (§1–§6, §8) is built and matches the guide.

**Status after the second 2026-09-01 reply:** §1–§3 closed, and the BurqPay
return is fixed backend-side. One item left, and it is a value we owe them —
see the end.

---

## 1. `/platform/**` 401 — RESOLVED (expired token)

Answered: the token had simply aged out and the browser kept replaying it. Not
an issuer or audience problem, and the `iss: https://dev-sec.awn-sa.com/` in the
original version of this question was wrong — it was read off a stale hardcoded
sample token in `axiosLms.ts`, not off a live one. Our real tokens come from
`CompanyRealm` / `react-frontend`, as their logs show. Nothing to chase.

**Done on our side:** `axiosTenancy` now refreshes on 401 and replays the
request, falling back to logout only when the refresh itself fails. See
`src/utils/authRefresh.ts`.

## 2. `/auth/sso/login-url` realm — ANSWERED and FIXED backend-side

It targets `CompanyRealm` / `react-frontend`, which is right for this app: our
customers and the superadmin both live there. Tenant administrators live in
`PlatformRealm`, which is why that one account got `user_not_found`.

They have added a `context` parameter (dev): `context=TENANT` returns a
`PlatformRealm` / `tenant-portal` URL, and omitting it is unchanged.

**Nothing to change in this repo — verified live, not assumed:**

| Call | Realm | Client |
|---|---|---|
| no `context` (what we send today) | `CompanyRealm` | `react-frontend` |
| `context=TENANT` | `PlatformRealm` | `tenant-portal` |

`state` is still returned and `scope` decodes correctly after their encoding
fix, so `login.tsx` and `SSOCallback.tsx` keep working untouched.

**For whoever builds the workspace portal:** adding `&context=TENANT` to that
one call is enough to sign a tenant administrator in — but see §3, it cannot
offer the workspace chooser.

## 3. The workspace chooser — whose screen is it? — ANSWERED

§7 describes `POST /api/v1/auth/login` answering with either an `accessToken`
or a `workspaces` list to choose from, and the §9 checklist asks the login to
branch on that.

This app never calls `/auth/login` — the password is typed on Keycloak's own
page, so there is no response here to branch on. Implementing the chooser means
replacing SSO redirect with a password form in this app, which is a login
architecture change rather than a signup one.

**Please confirm** whether the workspace portal login is a separate application
(the guide's header suggests it is). If it is meant to live in this repo
instead, say so and we will build the password form and the chooser against
`/auth/login` with `"context": "TENANT"`.

## 4. Activation route — please pin these to our path

We route the activation screen at:

```
/activate?token=...
```

So the server-side pair must be:

| Variable | Value |
|---|---|
| `PLATFORM_SET_PASSWORD_PATH` | `/activate` |
| `PLATFORM_WEB_BASE_URL` | the origin this frontend is served from, per environment |

Also note our BurqPay return URL is `/tenant/payment/return` — if the checkout's
configured return URL differs, buyers will land on a 404 after paying.

**Please confirm both are set to match.**

---

## Already handled on our side, for reference

- `TENANCY.PAYMENT.AMOUNT_ABOVE_GATEWAY_LIMIT` now sends the buyer back to the
  form rather than offering a retry that cannot succeed.
- The default-password note (§6) needs no UI work: the provisioning screen
  already offers no login button and never mentions a password.

---

## BurqPay return — CLOSED, and we already handle it

They found the real cause: BurqPay posts **twice** to the same `fallback_url` —
once server-side, once from the buyer's browser. The browser hand-back was
always arriving, it just hit a JSON endpoint. Their webhook now tells the two
apart and answers the browser with a 303 to:

```
{PLATFORM_WEB_BASE_URL}/tenant/payment/return?ref=SGN-…&order=PAY-…&status=PAID
```

That is our route already, and `PaymentReturnStep` already prefers `?ref=` over
session storage, so the happy path needed no change.

**One gap this exposed, now fixed.** `ProvisioningStep` read the reference from
session storage *only*. Since the 303 can land in a context where storage was
never written, a buyer could clear the return page and then be bounced to
pricing — after paying. It now accepts `?ref=` the same way, the return page
forwards the reference on the hand-off, and a reference that arrived only on the
URL is persisted to session storage.

We follow their guidance on `status`: it is a first-paint hint only. The
displayed outcome comes from `GET /public/signups/{ref}/payment`, which may
legitimately answer "waiting" for a moment.

---

## `context=TENANT` — wired, and one thing to flag back

`login.tsx` now forwards a `context` query parameter to
`/auth/sso/login-url`, so `/login?context=TENANT` signs a workspace
administrator into `PlatformRealm` / `tenant-portal`. Omitting it is unchanged
(`CompanyRealm` / `react-frontend`), and `SSOCallback` needed no change since
the realm is remembered against `state`.

**Worth flagging: this repo already hosts the tenant billing portal.** The
guidance assumed the workspace portal is entirely elsewhere, but
`/TenantPortal/Profile`, `/Subscription`, `/Entitlements` and `/Invoices` are
routes in this app, scoped to the caller's own `tenant_id`. They need a
`PlatformRealm` token, which this app's login could not issue until now.

That leaves a product question we should settle rather than guess at: how does a
workspace administrator *find* that login? Today it is a hand-built URL. The
options are a separate entry point, a "sign in as workspace admin" affordance on
the login screen, or moving those four pages out into the portal application.
Happy to take direction.

## Still open — one thing, and it is ours to answer

**`PLATFORM_WEB_BASE_URL` per environment.** Understood that `localhost:3000` is
a deliberate hold. The value is now load-bearing for two things, not one — the
activation link *and* the 303 return target — so until it is set for UAT, a real
buyer neither returns from payment nor can activate.

We owe them the origin this frontend is served from per environment. `.env` here
carries only the API base (`http://148.251.185.111:8000`).
