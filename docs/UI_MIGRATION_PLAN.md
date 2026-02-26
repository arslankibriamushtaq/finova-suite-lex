# Finova LOS Frontend — UI Migration Plan

**Document type:** Internal technical reference  
**Audience:** Development team  
**Last updated:** February 2026

---

## Table of Contents

1. [Migration Principles](#1-migration-principles)
2. [Phase 0: Preparation](#2-phase-0-preparation-12-days)
3. [Phase 1: Tokens and Hardcoded Colors](#3-phase-1-tokens-and-hardcoded-colors-12-weeks)
4. [Phase 2: Migrate Off antd](#4-phase-2-migrate-off-antd-35-weeks)
5. [Phase 3: Migrate Off Bootstrap](#5-phase-3-migrate-off-bootstrap-23-weeks)
6. [Phase 4: Remove Redundant Packages](#6-phase-4-remove-redundant-packages-1-week)
7. [Phase 5: White-Label System](#7-phase-5-white-label-system-1-week)
8. [Testing Strategy](#8-testing-strategy)
9. [Complexity and Risk](#9-complexity-and-risk)

---

## 1. Migration Principles

- **Module-by-module migration:** Migrate one module (or feature area) at a time. Do not mix multiple modules in a single PR.

- **Small PRs only:** Keep each PR small and reviewable. Prefer many small PRs over few large ones.

- **Never remove dependency before last usage:** Do not remove a dependency from the project until every consumer has been migrated and the last usage has been removed.

- **Visual regression check required:** For any PR that changes UI in a migrated area, require a visual regression check (e.g. screenshot comparison or manual checklist) before merge.

- **Production stability first:** Do not compromise production stability for speed. Roll back or pause migration if regressions appear.

---

## 2. Phase 0: Preparation (1–2 days)

- Create branch `feature/ui-migration` from main.
- Establish visual regression baseline (screenshots of key pages).
- Document all pages/routes for test checklist.
- Extend Tailwind content in `tailwind.config.js` to full src:

  ```js
  content: ["./src/**/*.{js,ts,jsx,tsx}"]
  ```

---

## 3. Phase 1: Tokens and Hardcoded Colors (1–2 weeks)

1. Add `src/styles/tokens.css` with full token set.
2. Document mapping: existing hex values → CSS variable names.
3. Replace hardcoded colors in inline styles with CSS variables or Tailwind classes (one module at a time).
4. Replace `Theme.ts` usage with token references.
5. Move `createGlobalStyle` rules from `App.tsx` into `tokens.css`.
6. Remove styled-components ThemeProvider from `App.tsx`; use plain CSS.

---

## 4. Phase 2: Migrate Off antd (3–5 weeks)

Suggested order:

1. antd Button → shadcn Button
2. antd Input, Select, InputNumber → shadcn equivalents
3. antd Modal → shadcn Dialog
4. antd Table → shared DataTable
5. antd Form / Form.Item → shadcn Form + Formik
6. antd Tabs → shadcn Tabs
7. antd DatePicker, TimePicker → shadcn calendar or temporary keep
8. antd Steps, Upload, Tree, Transfer → custom compositions on shadcn
9. antd icons → lucide-react (maintain mapping table)
10. Remove `antd` and `@ant-design/icons` from package.json

Use wrappers that mirror antd API where helpful, then refactor call sites.

---

## 5. Phase 3: Migrate Off Bootstrap (2–3 weeks)

1. Remove Bootstrap CDN from `index.html`.
2. Replace react-bootstrap Row, Col, Container with Tailwind flex/grid.
3. Replace react-bootstrap Form components with shadcn form primitives.
4. Replace Bootstrap utility classes with Tailwind (e.g. d-flex → flex, p-3 → p-3, etc.).
5. Replace remaining react-bootstrap components (Modal, Card, Navbar, etc.).
6. Remove `bootstrap` and `react-bootstrap` from package.json.
7. Remove `src/assets/scss/custom.scss` and compiled CSS.

Use `convert-tailwind-to-bootstrap.sh` as a reverse mapping reference.

---

## 6. Phase 4: Remove Redundant Packages (1 week)

- styled-components (after Phase 1)
- react-responsive-modal, react-select, react-tooltip, react-switch
- react-hot-toast (use shadcn Toast/Sonner)
- react-loading-skeleton, react-spinners (use shadcn Skeleton)
- react-icons, @fortawesome/* (use lucide-react)
- echarts, echarts-for-react, react-echarts-wrapper (keep recharts)
- sass, sass-embedded
- react-data-table-component, react-table-sticky (after DataTable is in place)
- Duplicate/minified CSS artifacts

---

## 7. Phase 5: White-Label System (1 week)

1. Implement tenant config API and fetch on init.
2. Implement runtime CSS variable injection from config.
3. Make document title, favicon, logo config-driven.
4. Remove hardcoded tenantId from `App.tsx`.
5. Validate with at least two tenant configurations.

---

## 8. Testing Strategy

- **Per-PR:** Visual comparison (screenshots) for changed pages.
- **Feature flag or route:** Optional toggle between old and new UI during migration.
- **Module-by-module:** Migrate one folder (e.g. Settings) end-to-end before the next.
- **Dependencies:** Keep old packages until all consumers are migrated.
- **CI:** Build and lint on every PR.
- **RTL:** Re-verify Arabic RTL after each phase (Tailwind `rtl:` variant).

---

## 9. Complexity and Risk

### Refactor Size: Large

| Dimension | Assessment |
|-----------|------------|
| Files to touch | 700+ of ~800 .tsx files |
| Dependencies to remove | 25–30 packages |
| Estimated effort | 8–12 weeks (1–2 developers) |
| Risk rating | High |

### Risk Factors

- 300+ files depend on antd, 400+ on Bootstrap; each needs review.
- Every page is in scope for regression.
- Many files mix antd, Bootstrap, and inline styles.
- Limited automated test coverage for UI.
- Large custom SCSS with broad impact if removed.
- RTL must be preserved.
- `App.tsx` relies on generated class names from react-pro-sidebar; fragile across upgrades.

### Risk Mitigation

- Migrate by module, not in one big change.
- Keep old dependencies until fully replaced.
- Introduce screenshot-based regression tests before migration.
- Use adapter/wrapper components for high-usage antd components to limit blast radius.
- Deliver in phases; avoid a single large production merge.

---

See also: [UI Audit](UI_AUDIT.md), [UI Architecture](UI_ARCHITECTURE.md).
