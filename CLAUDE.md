# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Dev server on port 3001 (Vite HMR)
npm run build      # TypeScript check + Vite build (--noEmitOnError false)
npm run lint       # ESLint
npm run format     # Prettier write
npm run format:check  # Prettier check (CI)
npm run test       # Jest with coverage + junit reporter
npm run start      # Preview built dist on port 3003
```

## Active Refactor: UI Migration

This project is being migrated on `feature/ui-migration`. Full details in [docs/UI_MIGRATION_PLAN.md](docs/UI_MIGRATION_PLAN.md), [docs/UI_ARCHITECTURE.md](docs/UI_ARCHITECTURE.md), and [docs/UI_AUDIT.md](docs/UI_AUDIT.md).

**Target stack: Tailwind CSS v4 + shadcn/ui only.**

### Migration Phases

| Phase | Goal |
|---|---|
| 0 | Branch setup, tokens.css, visual baseline — **done** |
| 1 | Replace hardcoded colors with CSS variables — **in progress** |
| 2 | Migrate antd → shadcn/ui components |
| 3 | Migrate Bootstrap → Tailwind |
| 4 | Remove redundant packages |
| 5 | White-label tenant system |

### Governance Rules (enforce these in all new code)

- **No hardcoded hex/RGB colors** — use CSS variables from `src/styles/tokens.css` or Tailwind token classes only.
- **No `style={{}}` for spacing/colors/typography** — use Tailwind utility classes instead.
- **No new antd or Bootstrap imports** — use `src/components/ui/` shadcn components only.
- **Icons: `lucide-react` only** — do not use `@ant-design/icons`, `react-icons`, or FontAwesome.
- **Charts: `recharts` only** — do not use `echarts`, `echarts-for-react`, or `react-echarts-wrapper`.
- **Loading/feedback: shadcn Skeleton/Toast** — do not use `react-loading-skeleton`, `react-spinners`, or `react-hot-toast`.
- **Never remove a package until every usage has been replaced.**
- **One module per PR** — do not mix multiple feature areas in one change.

### Antd → shadcn Replacement Map

| Antd | shadcn/ui target |
|---|---|
| Button | `src/components/ui/button.tsx` |
| Modal | `src/components/ui/dialog.tsx` |
| Select | `src/components/ui/select.tsx` |
| Table | `src/components/shared/DataTable/` (planned) |
| Form/Form.Item | `src/components/ui/form.tsx` + Formik |
| Tabs | `src/components/ui/tabs.tsx` |
| DatePicker | `src/components/ui/calendar.tsx` |
| Icons | `lucide-react` |
| Spin/Skeleton | `src/components/ui/skeleton.tsx` |
| Switch | `src/components/ui/switch.tsx` |
| Checkbox | `src/components/ui/checkbox.tsx` |
| Tag/Badge | `src/components/ui/badge.tsx` |
| Tooltip | `src/components/ui/tooltip.tsx` |

---

## Architecture Overview

**Finova LOS** is a Loan Origination System (LOS) frontend for a Saudi fintech/lending platform. React 18 + TypeScript + Vite SPA.

### App Entry & Providers

`src/main.tsx` wraps the app in: Redux `<Provider>` → `<PersistGate>` → `<LanguageProvider>` → `<App>`.

`src/App.tsx` sets up: `<Toaster>` + `<I18nextProvider>` + React Router `<RouterProvider>`.

### Routing & Layouts

All routes are in `src/Routes/path.tsx`. Layout shells in `src/Layout/`:

| Layout | Usage |
|---|---|
| `Layout.tsx` | Main LMS dashboard (sidebar + header) |
| `LayoutLms.tsx` | LMS-specific flows |
| `LayoutCms.tsx` | CMS content management |
| `LayoutDashboard.tsx` | Dashboard view |
| `LayoutInvestor.tsx` | Investor portal |
| `LayoutLogin.tsx` | Auth/login pages |
| `LandingUserLayout.tsx` | Landing/public pages |
| `LayoutProfile.tsx` | Profile pages |

### Pages

`src/pages/` has four top-level sections:
- `lmsPages/` — LMS pages (customers, loans, applications, compliance, etc.)
- `cmsPages/` — CMS pages (web page management, landing page management)
- `InvestorPages/` — Investor dashboard
- `ThirdPartyDashboard/` — Third-party integration views

### State Management

Redux Toolkit + redux-persist. Single slice: `src/redux/apis/apisSlice.ts` (`auth` slice, key `block`). Persisted to `sessionStorage`.

- `src/redux/store.ts` — store config
- `src/redux/rootReducer.ts` — combines reducers
- `src/redux/hooks.ts` — typed `useAppDispatch` / `useAppSelector`

### API Layer

`src/services/AuthService.ts` — axios instance reading `REACT_APP_API_URL` env var (via `vite-plugin-env-compatible`, which maps `REACT_APP_*` → Vite).

API calls split by domain in `src/redux/apis/`: `apisCrud.ts`, `apisCrudLms.ts`, `apisCrudCms.ts`, `apisCrudFactoring.ts`, `apisCrudProductManagement.ts`, `apisCrudWebPageManagement.ts`, `apisNotificationsCrud.ts`, `apisInvestor.ts`, `apisThirdParty.ts`.

### UI Component System

50 shadcn/ui components in `src/components/ui/` — built on Radix UI primitives using `cva` + `cn()`. This is the **target for all new UI**.

`src/lib/utils.ts` — exports `cn()` (clsx + tailwind-merge). Always use this for class merging.

The planned `src/components/shared/` directory will hold app-specific composites (DataTable, FormField, StatusBadge, PageHeader, DateRangePicker, FileUpload, Charts, etc.).

### Styling Architecture

CSS variable flow:
```
Tenant Config (API) → tokens.css (:root vars) → Tailwind @theme inline → shadcn components → pages
```

1. **`src/styles/tokens.css`** — single source of truth for all CSS variables: shadcn semantic tokens (`--background`, `--primary`, `--border`, etc.), app theme tokens (`--theme-*` prefix), and status colors (`--color-success`, `--color-error`, etc.).
2. **`src/lib/themeTokens.ts`** — JS references to CSS variables. Re-exported from `src/components/Config/Theme.ts`. Use in components that need JS access to theme values.
3. **Tailwind v4** — `src/index.css` maps CSS variables to Tailwind colors via `@theme inline`. `tailwind.config.js` has `preflight: false` (temporary, for Bootstrap coexistence).

RTL/Arabic: `src/styles/arabic-rtl.css`.

### Internationalization

`src/components/i18n.ts` — i18next with EN/AR translations. `LanguageProvider` (`src/hooks/use-language.tsx`) manages language and RTL switching at runtime.

### PDF & Export

`jspdf` + `jspdf-autotable` (PDF generation), `file-saver` (downloads), `xlsx` (Excel export), `papaparse` (CSV parsing), `@react-pdf-viewer` (PDF viewing).

### Known Debt

- 300+ files import `antd`, 200+ import `react-bootstrap`, 400+ use Bootstrap utility classes
- 500+ hardcoded hex colors across 200+ files; 300+ files use inline `style={{}}` for colors/spacing
- Three separate theme systems that don't interoperate (JS Theme.ts, oklch CSS vars, Bootstrap SCSS vars)
- Bootstrap CDN (5.0.2) in `index.html` vs npm (5.3.2) — version mismatch
- Hardcoded `tenantId` in `App.tsx` (blocks white-labeling — Phase 5 work)
- `App.tsx` targets internal generated class names from `react-pro-sidebar` (`.css-vj11vy`, etc.) — fragile
