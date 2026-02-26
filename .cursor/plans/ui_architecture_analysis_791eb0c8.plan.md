---
name: UI Architecture Analysis
overview: A comprehensive technical architecture analysis of the finova-los-frontend project covering the current UI stack, dependency conflicts, architectural problems, and a proposed migration plan to a unified Tailwind + shadcn system.
todos: []
isProject: false
---

# Finova LOS Frontend -- UI Architecture Analysis

---

## 1. Current UI Stack Analysis

### 1.1 UI-Related Dependencies in `package.json`

The project has **77 UI-related packages** out of 145 total dependencies. This is an extremely high ratio indicating significant UI fragmentation.

**CSS Frameworks (3 competing systems):**

- `bootstrap` ^5.3.2 + `react-bootstrap` ^2.9.2
- `tailwindcss` ^4.1.16 + `@tailwindcss/postcss` ^4.1.16 + `tailwind-merge` ^2.4.0 + `tailwindcss-animate` ^1.0.7
- `styled-components` ^6.1.8

**Component Libraries:**

- `antd` ^5.19.2 + `@ant-design/icons` ^6.1.0
- 23 `@radix-ui/*` primitives (accordion, dialog, dropdown-menu, select, tabs, tooltip, etc.)
- `class-variance-authority` ^0.7.0 + `clsx` ^2.1.1 (shadcn utilities)

**Specialized UI Packages (21 separate React component packages):**

- `react-select` ^5.8.0, `react-datepicker` ^7.3.0, `react-multi-date-picker` ^4.5.2
- `react-phone-input-2` ^2.15.1, `react-responsive-modal` ^6.4.2
- `react-beautiful-dnd` ^13.1.1, `react-pro-sidebar` ^1.1.0-alpha.1
- `react-multi-carousel` ^2.8.5, `react-vertical-timeline-component` ^3.6.0
- `react-loading-skeleton` ^3.5.0, `react-spinners` ^0.13.8
- `react-switch` ^7.0.0, `react-tooltip` ^5.28.0, `react-hot-toast` ^2.4.1
- `react-dropzone` ^14.2.3, `react-to-print` ^3.0.5, `react-table-sticky` ^1.1.3
- `react-data-table-component` ^7.5.4

**Icon Libraries (4 competing systems):**

- `@ant-design/icons` ^6.1.0
- `lucide-react` ^0.548.0
- `react-icons` ^5.0.1
- `@fortawesome/react-fontawesome` ^0.2.2 + `@fortawesome/free-solid-svg-icons` ^6.7.2

**Charting (3 libraries):**

- `echarts` ^5.4.3 + `echarts-for-react` ^3.0.2 + `react-echarts-wrapper` ^1.0.3
- `recharts` ^2.12.7

**Pre-processors:**

- `sass` ^1.80.6 + `sass-embedded` ^1.80.2

---

### 1.2 Where Each UI Library Is Used

#### Bootstrap / React-Bootstrap


| Metric                            | Value                                               |
| --------------------------------- | --------------------------------------------------- |
| Files importing `react-bootstrap` | **200+**                                            |
| Files using Bootstrap CSS classes | **400+**                                            |
| Bootstrap CSS loaded via          | CDN in `index.html` (v5.0.2) + npm package (v5.3.2) |


- **Bootstrap CDN (v5.0.2)** loaded in `[index.html](index.html)` (line 13) -- version mismatch with npm v5.3.2
- **Bootstrap CSS also imported directly** in `src/components/ChartSkeleton.tsx` and `src/components/MiniChartSkeleton.tsx`
- `react-bootstrap` components used: `Tab`, `Tabs`, `Row`, `Col`, `Form`, `Button`, `Modal`, `Card`, `Table`, `Nav`, `Dropdown`, `Accordion`, `Pagination`, `ProgressBar`, `Spinner`, `Toast`, `Tooltip`, `ListGroup`, `InputGroup`, `Breadcrumb`, `Carousel`, `Collapse`, `Offcanvas`
- Bootstrap utility classes (d-flex, p-*, m-*, col-*, text-center, bg-*, etc.) are pervasive in 400+ files
- Heaviest usage areas: Customer Management, Loan Management, Landing Pages, Settings

#### Ant Design (antd)


| Metric                              | Value    |
| ----------------------------------- | -------- |
| Files importing `antd`              | **300+** |
| Files importing `@ant-design/icons` | **200+** |


- Used for: `Button`, `Input`, `Select`, `Modal`, `Form`, `DatePicker`, `Table`, `Steps`, `Upload`, `Tabs`, `Switch`, `Radio`, `Checkbox`, `Tag`, `Badge`, `Spin`, `Typography`, `Descriptions`, `Skeleton`, `InputNumber`, `TimePicker`, `Tree`, `Transfer`
- Heaviest usage: Product Management, User & Role Management, LOV components, Compliance, Notifications, Reports

#### Styled-Components


| Metric                        | Value  |
| ----------------------------- | ------ |
| Files using styled-components | **24** |


- Primary use: `createGlobalStyle` for theme-based global CSS (20+ files)
- Only 2-3 files use `styled.div` for actual component-level styling
- `[App.tsx](src/App.tsx)` defines a large `GlobalStyle` block (~130 lines) that applies theme colors to sidebar, headers, buttons, and tabs
- Global styles reference `[Theme.ts](src/components/Config/Theme.ts)` properties directly (e.g., `${themeStyle.secondary}`)

#### Tailwind CSS


| Metric                        | Value                     |
| ----------------------------- | ------------------------- |
| Files using Tailwind classes  | **200+**                  |
| Tailwind config content scope | **6 specific paths only** |


- `[tailwind.config.js](tailwind.config.js)` scopes Tailwind to only: InvestorPages, ProductManagement, `src/components/ui/`, and 3 individual component files
- Preflight is disabled to avoid Bootstrap conflicts
- Primary color overridden to `#000000`
- `[src/index.css](src/index.css)` defines oklch-based CSS variables for a shadcn-compatible design token system (lines 8-61)
- The shadcn UI component library (`src/components/ui/`) contains **50 components** built on Radix UI primitives + Tailwind

#### SCSS


| Metric             | Value |
| ------------------ | ----- |
| Project SCSS files | **2** |


- `[src/assets/scss/custom.scss](src/assets/scss/custom.scss)` -- very large (~188K+ characters), contains Bootstrap variable overrides, custom component styles for headers, footers, landing pages, dashboards, forms, navigation, sidebars, tables, cards, buttons, responsive breakpoints, RTL support
- `[src/assets/scss/styles.scss](src/assets/scss/styles.scss)` -- imports custom.scss, sets body font

#### CSS Files


| Metric            | Value  |
| ----------------- | ------ |
| Project CSS files | **14** |


- `[src/index.css](src/index.css)` -- Tailwind v4 setup + CSS variables + Bootstrap overrides
- 5 component-specific CSS files
- 2 page-specific CSS files
- 4 compiled/minified CSS files (duplicated output of SCSS)
- 1 Arabic RTL stylesheet

#### Hardcoded Color Usage


| Metric              | Value                      |
| ------------------- | -------------------------- |
| Hex color instances | **500+** across 200+ files |
| RGB/RGBA instances  | **150+** across 60+ files  |


Most common hardcoded colors:

- `#1963b9` -- legacy primary blue (100+ occurrences)
- `#000000` / `#000` -- current primary black (80+)
- `#ffffff` / `#fff` -- white (50+)
- `#f5f5f5` / `#f4f4f4` -- light gray backgrounds (40+)
- `#EB0D0D`, `#F84D4D`, `#BC3D3F` -- various reds for errors/status (35+)
- `#3FC380` -- success green (15+)
- `#333`, `#666` -- text grays (30+)

#### Inline Style Usage


| Metric                         | Value    |
| ------------------------------ | -------- |
| Files with inline `style={{}}` | **300+** |


- Used for dynamic status badge colors, layout adjustments, spacing, typography, borders
- Some files have 20+ inline style occurrences
- Frequently mixed with Bootstrap classes on the same elements

---

### 1.3 Theme Configuration (3 Competing Systems)

**System 1: JavaScript Theme Object** -- `[src/components/Config/Theme.ts](src/components/Config/Theme.ts)`

- Static object with hardcoded hex colors for primary, secondary, headers, tables, sidebar, etc.
- Contains bugs: `" red"` (leading space), `"#00000"` (missing digit)
- Consumed by `createGlobalStyle` in App.tsx and 20+ Header/Dashboard components
- Not dynamically loaded; cannot be changed at runtime per tenant

**System 2: CSS Variables (oklch)** -- `[src/index.css](src/index.css)`

- Modern shadcn-compatible token system with `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`
- Only consumed by the 50 shadcn/Tailwind components in `src/components/ui/`
- Supports dark mode via `.dark` class

**System 3: Bootstrap Variables** -- `[src/assets/scss/custom.scss](src/assets/scss/custom.scss)`

- `--bs-primary-rgb: 0,0,0` and Bootstrap SCSS variable overrides
- Consumed by all Bootstrap-styled components

---

## 2. UI Architecture Problems

### 2.1 Inconsistencies

- **3 CSS frameworks** coexist (Bootstrap, Tailwind, styled-components) with conflicting reset/base styles
- **2 component libraries** provide overlapping widgets (antd and react-bootstrap both provide Button, Modal, Table, Form, Tabs, Select, Dropdown, etc.)
- **4 icon libraries** used inconsistently (Ant Design Icons, Lucide, React Icons, FontAwesome)
- **3 theme systems** that don't talk to each other (Theme.ts, CSS variables, Bootstrap variables)
- Bootstrap CDN version (5.0.2) differs from npm package version (5.3.2) creating subtle rendering inconsistencies
- Multiple charting libraries (ECharts + Recharts) for the same purpose
- Duplicate loading/spinner libraries (react-loading-skeleton + react-spinners + antd Spin + Bootstrap Spinner)
- Duplicate toast/notification systems (react-hot-toast + antd notification + Bootstrap Toast + shadcn toast)

### 2.2 Tight Coupling

- 300+ files directly import from `antd`, making it nearly impossible to swap without touching every file
- 200+ files import from `react-bootstrap`, equally coupled
- Inline styles in 300+ files embed layout/color decisions directly in component logic
- `App.tsx` GlobalStyle block (130+ lines) targets internal CSS class names of `react-pro-sidebar` (e.g., `.css-vj11vy`, `.css-12w9als`, `.css-1654oxy`) -- these are auto-generated and will break on any library update
- `[Theme.ts](src/components/Config/Theme.ts)` is consumed via string interpolation in `createGlobalStyle`, creating runtime coupling between JS and CSS

### 2.3 Theming Limitations

- Theme.ts is a static JS object -- cannot be loaded from an API or switched at runtime
- The oklch CSS variable system in `index.css` only reaches the 50 shadcn components; the other 700+ components ignore it
- No mechanism to switch themes dynamically (the Redux `setTheme` action exists but is commented out and unused)
- `!important` overrides are used extensively (30+ occurrences in `index.css` alone, hundreds in `custom.scss`) making theme customization fragile

### 2.4 White-Labeling Blockers

- **Hardcoded tenant ID** in `App.tsx`: `localStorage.setItem("tenantId", "980fb848-...")`
- **No tenant-based theme loading** -- theme is baked into the build
- **500+ hardcoded color values** scattered across 200+ files -- each would need extraction to support white-labeling
- **Brand name hardcoded** in index.html: `<title>Factoring Valley</title>`
- **No dynamic asset loading** -- logos, favicons, fonts are static
- Inline styles with hardcoded colors cannot be overridden by CSS variables or theme configuration
- Multiple theme entry points (Theme.ts, index.css, custom.scss, investorPages.css) would all need to be made tenant-aware

### 2.5 Performance Concerns

- **Bootstrap CSS loaded twice**: via CDN in index.html AND via npm import in component files
- **Full antd library** likely bundled (no evidence of tree-shaking configuration or modular imports)
- **3 charting libraries** (ECharts + ECharts wrapper + Recharts) significantly inflate bundle
- **4 icon libraries** each ship large icon sets; @ant-design/icons alone is ~60KB+ gzipped
- **188K+ character SCSS file** (`custom.scss`) compiled and loaded globally regardless of which page the user visits
- **50 Radix UI primitives** installed but many overlap with antd/Bootstrap components already in use
- `sass` AND `sass-embedded` both installed (only one is needed)
- Tailwind preflight disabled, requiring manual reset workarounds that add CSS weight

---

## 3. Dependency Conflict Analysis

### 3.1 Overlapping Responsibilities

```
Function          | Bootstrap          | antd              | shadcn/Radix      | Other
-----------------|--------------------|-------------------|-------------------|------------------
Button            | react-bootstrap    | antd Button       | ui/button.tsx     | --
Modal/Dialog      | react-bootstrap    | antd Modal        | ui/dialog.tsx     | react-responsive-modal
Select/Dropdown   | react-bootstrap    | antd Select       | ui/select.tsx     | react-select
Tabs              | react-bootstrap    | antd Tabs         | ui/tabs.tsx       | --
Form/Input        | react-bootstrap    | antd Form/Input   | ui/form.tsx       | --
Table             | react-bootstrap    | antd Table        | ui/table.tsx      | react-data-table-component
Toast/Notification| react-bootstrap    | antd notification | ui/toast.tsx      | react-hot-toast
Tooltip           | react-bootstrap    | antd Tooltip      | ui/tooltip.tsx    | react-tooltip
Checkbox          | react-bootstrap    | antd Checkbox     | ui/checkbox.tsx   | --
Radio             | react-bootstrap    | antd Radio        | ui/radio-group    | --
Progress Bar      | react-bootstrap    | antd Progress     | ui/progress.tsx   | --
Accordion         | react-bootstrap    | antd Collapse     | ui/accordion.tsx  | --
Badge             | react-bootstrap    | antd Badge        | ui/badge.tsx      | --
Breadcrumb        | react-bootstrap    | antd Breadcrumb   | ui/breadcrumb.tsx | --
Pagination        | react-bootstrap    | antd Pagination   | ui/pagination.tsx | --
Spinner/Loading   | react-bootstrap    | antd Spin         | ui/skeleton.tsx   | react-spinners, react-loading-skeleton
Switch            | --                 | antd Switch       | ui/switch.tsx     | react-switch
Date Picker       | --                 | antd DatePicker   | ui/calendar.tsx   | react-datepicker, react-multi-date-picker
Carousel          | react-bootstrap    | --                | ui/carousel.tsx   | react-multi-carousel
Icons             | FontAwesome CDN    | @ant-design/icons | lucide-react      | react-icons
```

**18 component categories** have 3+ competing implementations. This is extreme redundancy.

### 3.2 Bundle Size Risk Estimate


| Library                           | Estimated Gzipped Size  |
| --------------------------------- | ----------------------- |
| antd (full)                       | ~200-300 KB             |
| @ant-design/icons                 | ~60 KB                  |
| bootstrap CSS                     | ~25 KB                  |
| react-bootstrap                   | ~40 KB                  |
| styled-components                 | ~15 KB                  |
| echarts                           | ~300 KB                 |
| recharts                          | ~80 KB                  |
| react-icons (full)                | ~50 KB                  |
| FontAwesome                       | ~30 KB                  |
| 23 Radix UI primitives            | ~50 KB                  |
| **Estimated removable UI weight** | **~600-800 KB gzipped** |


The current bundle likely ships **1MB+** of UI library code where ~300KB would suffice with a unified system.

---

## 4. Proposed Target Architecture

### 4.1 Target Stack: Tailwind CSS v4 + shadcn/ui

The project already has the foundation:

- 50 shadcn components exist in `src/components/ui/`
- Tailwind v4 is installed and configured
- CSS variables are defined in `src/index.css`
- Radix UI primitives are already dependencies

**Target: Remove Bootstrap, antd, styled-components, and all redundant one-off UI packages.**

### 4.2 Centralized Theme Token System

All design tokens flow from a single source -- CSS custom properties in one file:

```css
/* src/styles/tokens.css */
:root {
  /* Brand colors -- overridden per tenant */
  --brand-primary: oklch(0 0 0);
  --brand-primary-foreground: oklch(0.985 0 0);
  --brand-secondary: oklch(0.97 0 0);
  --brand-accent: oklch(0.577 0.245 27.325);

  /* Semantic colors */
  --color-background: var(--brand-primary-foreground);
  --color-foreground: oklch(0.145 0 0);
  --color-success: oklch(0.65 0.2 145);
  --color-warning: oklch(0.75 0.18 85);
  --color-error: oklch(0.577 0.245 27.325);
  --color-info: oklch(0.6 0.15 250);

  /* Spacing scale, border radius, shadows, typography -- all as variables */
}
```

### 4.3 CSS Variable Strategy

```
Tenant Config (API/JSON)
       |
       v
tokens.css (:root variables)
       |
       v
Tailwind theme (references CSS vars via @theme inline)
       |
       v
shadcn components (use Tailwind classes)
       |
       v
Page/feature components (compose shadcn components)
```

- CSS variables are the single source of truth
- Tailwind maps variables to utility classes via `@theme inline` (already partially done in `index.css`)
- shadcn components consume Tailwind utilities
- No hardcoded colors anywhere in component code
- Dark mode: toggle `.dark` class on `<html>`, variables auto-switch

### 4.4 UI Component Layering Structure

```
Layer 1: Design Tokens (CSS variables in tokens.css)
    |
Layer 2: Tailwind Utilities (mapped from tokens)
    |
Layer 3: shadcn Primitives (src/components/ui/) -- 50 existing components
    |
Layer 4: Composite Components (src/components/shared/) -- app-specific compositions
    |
Layer 5: Feature Components (src/components/{feature}/) -- business logic + UI
    |
Layer 6: Page Components (src/pages/) -- layout + feature composition
```

### 4.5 Proposed Folder Structure

```
src/
  styles/
    tokens.css              <-- Single source for all design tokens
    globals.css             <-- Base resets, font loading, Tailwind imports
    rtl.css                 <-- RTL overrides
  components/
    ui/                     <-- shadcn primitives (existing 50 components)
    shared/                 <-- Composite reusable components
      DataTable/            <-- Replaces antd Table + react-data-table + Bootstrap Table
      FormField/            <-- Replaces antd Form.Item + Bootstrap Form.Group
      StatusBadge/          <-- Replaces inline-styled status badges
      PageHeader/
      Sidebar/
      DateRangePicker/
      FileUpload/
      RichTextEditor/
      PhoneInput/
      Charts/               <-- Unified chart wrapper (pick one: Recharts)
    {feature}/              <-- Feature-specific components (existing structure)
  config/
    theme.ts                <-- Type-safe theme config loaded from API
    white-label.ts          <-- Tenant branding config (logo, title, colors)
  pages/                    <-- Existing structure unchanged
```

### 4.6 Reusable Component Strategy

Replace the 18 duplicated component categories with single implementations:


| Need             | Target Implementation                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| Button           | `src/components/ui/button.tsx` (already exists)                           |
| Modal/Dialog     | `src/components/ui/dialog.tsx` (already exists)                           |
| Select           | `src/components/ui/select.tsx` (already exists)                           |
| Table            | `src/components/shared/DataTable/` wrapping shadcn table + tanstack-table |
| Form             | `src/components/ui/form.tsx` + formik (already used)                      |
| Toast            | `src/components/ui/toast.tsx` via sonner (already exists)                 |
| Date Picker      | `src/components/ui/calendar.tsx` (extend for range/hijri)                 |
| Icons            | `lucide-react` only (already used by shadcn)                              |
| Charts           | `recharts` only (smaller, React-native)                                   |
| Skeleton/Loading | `src/components/ui/skeleton.tsx` (already exists)                         |


### 4.7 White-Label Configuration System

```typescript
// src/config/white-label.ts
interface TenantBranding {
  tenantId: string;
  name: string;
  logo: string;
  favicon: string;
  colors: {
    primary: string;       // oklch value
    primaryForeground: string;
    secondary: string;
    accent: string;
    destructive: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}
```

At app initialization:

1. Fetch tenant config from API using tenantId
2. Apply colors by setting CSS variables on `document.documentElement`
3. Update document title, favicon, and meta tags dynamically
4. Store config in Redux for components that need brand name/logo

This approach requires zero rebuild per tenant -- just different API responses.

---

## 5. Step-by-Step Migration Plan

### Phase 0: Preparation (1-2 days)

- Create a `feature/ui-migration` branch from main
- Set up a visual regression baseline (screenshot key pages)
- Document all pages/routes for testing checklist
- Extend Tailwind content paths in `tailwind.config.js` to cover ALL src files:
  ```js
  content: ["./src/**/*.{js,ts,jsx,tsx}"]
  ```

### Phase 1: Consolidate Tokens and Remove Hardcoded Colors (1-2 weeks)

**Order:**

1. Create `src/styles/tokens.css` with complete design token set
2. Create a color mapping reference: old hex values --> CSS variable names
3. Batch find-and-replace hardcoded colors in inline styles with CSS variables / Tailwind classes
4. Replace `src/components/Config/Theme.ts` with CSS variable references
5. Remove `createGlobalStyle` from `App.tsx`; move those styles to `tokens.css`
6. Remove `styled-components` from ThemeProvider in App.tsx; use plain CSS

**Risk mitigation:** Each color replacement is visually verifiable. Do one module at a time.

### Phase 2: Migrate Off antd (3-5 weeks -- largest effort)

**Order of component migration (by frequency and isolation):**

1. antd `Button` --> shadcn `Button` (appears in most files)
2. antd `Input`, `Select`, `InputNumber` --> shadcn equivalents
3. antd `Modal` --> shadcn `Dialog`
4. antd `Table` --> shared `DataTable` component
5. antd `Form`, `Form.Item` --> shadcn `Form` with formik
6. antd `Tabs` --> shadcn `Tabs`
7. antd `DatePicker`, `TimePicker` --> shadcn calendar or kept temporarily
8. antd `Steps`, `Upload`, `Tree`, `Transfer` --> custom shadcn compositions
9. antd icons --> lucide-react equivalents (icon mapping table)
10. Remove `antd` and `@ant-design/icons` from package.json

**Strategy:** Create wrapper components that match antd's API surface initially, then refactor callers gradually.

### Phase 3: Migrate Off Bootstrap (2-3 weeks)

**Order:**

1. Remove Bootstrap CDN from `index.html`
2. Replace `react-bootstrap` layout components (`Row`, `Col`, `Container`) with Tailwind flex/grid
3. Replace `react-bootstrap` `Form` components with shadcn form primitives
4. Replace Bootstrap utility classes (`d-flex`, `p-3`, `mt-2`, etc.) with Tailwind equivalents
5. Replace remaining `react-bootstrap` components (Modal, Card, Navbar, etc.)
6. Remove `bootstrap`, `react-bootstrap` from package.json
7. Delete `src/assets/scss/custom.scss` and compiled CSS files

**Risk mitigation:** Bootstrap-to-Tailwind class mapping is largely mechanical. Use the existing `convert-tailwind-to-bootstrap.sh` script as a reference (it shows the mapping in reverse).

### Phase 4: Remove Redundant Packages (1 week)

1. Remove `styled-components` (after Phase 1)
2. Remove `react-responsive-modal` (replaced by shadcn Dialog)
3. Remove `react-select` (replaced by shadcn Select)
4. Remove `react-tooltip` (replaced by shadcn Tooltip)
5. Remove `react-switch` (replaced by shadcn Switch)
6. Remove `react-hot-toast` (replaced by shadcn Toast/Sonner)
7. Remove `react-loading-skeleton` + `react-spinners` (replaced by shadcn Skeleton)
8. Remove `react-icons`, `@fortawesome/*` (replaced by lucide-react)
9. Remove `echarts`, `echarts-for-react`, `react-echarts-wrapper` (keep recharts only)
10. Remove `sass`, `sass-embedded` (no longer needed)
11. Remove `react-data-table-component`, `react-table-sticky` (replaced by shared DataTable)
12. Remove duplicate/minified CSS files

### Phase 5: White-Label System (1 week)

1. Implement tenant config API fetch
2. Create runtime CSS variable injection from tenant config
3. Make document title, favicon, logo dynamic
4. Remove hardcoded tenantId from App.tsx
5. Test with 2+ tenant configurations

### Testing Strategy Throughout

- **Per-PR visual review:** Screenshot comparison of affected pages before/after
- **Feature-flag approach:** Use a feature flag or route-based toggle to show new UI vs old during migration
- **Module-by-module:** Migrate one folder (e.g., `src/components/Settings/`) completely before moving to the next
- **Parallel running:** Keep old dependencies installed until all their consumers are migrated; do not remove prematurely
- **CI gate:** Run build + lint on every PR to catch broken imports immediately
- **RTL testing:** Verify Arabic RTL support is maintained after each phase (Tailwind has built-in RTL support via `rtl:` variant)

---

## 6. Estimated Complexity Level

### Refactor Size: **LARGE**


| Dimension              | Assessment                        |
| ---------------------- | --------------------------------- |
| Files to touch         | **700+** (out of ~800 .tsx files) |
| Dependencies to remove | **25-30 packages**                |
| Estimated total effort | **8-12 weeks** (1-2 developers)   |
| Risk rating            | **HIGH**                          |


### Risk Factors

- **Scale:** 300+ files depend on antd, 400+ on Bootstrap -- each file needs manual review
- **Regression surface:** Every page in the application is affected
- **Mixed patterns:** Many files use antd + Bootstrap + inline styles simultaneously on the same elements
- **No test suite:** No evidence of unit/integration tests to catch regressions
- **Custom SCSS:** 188K+ characters of custom SCSS with unknown side effects if removed
- **RTL support:** Must be preserved across the migration
- **Hardcoded sidebar class targeting:** App.tsx targets auto-generated CSS classes (`.css-vj11vy`, `.css-12w9als`) that could break at any time

### Risk Mitigation

- Migrate module-by-module, not all-at-once
- Keep old dependencies until fully decoupled
- Invest in screenshot-based regression testing before starting
- Create adapter/wrapper components for the most-used antd components to minimize blast radius
- Ship migration in phases to production behind the main branch, not as one massive merge

