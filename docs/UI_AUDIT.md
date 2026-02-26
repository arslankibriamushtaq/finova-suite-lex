# Finova LOS Frontend — UI Audit

**Document type:** Internal audit  
**Audience:** Development team  
**Last updated:** February 2026

---

## Table of Contents

1. [Current UI Stack](#1-current-ui-stack)
2. [Architecture Problems](#2-architecture-problems)
3. [Dependency Conflicts](#3-dependency-conflicts)

---

## 1. Current UI Stack

### 1.1 UI-Related Dependencies

The project has **77 UI-related packages** out of 145 total dependencies.

**CSS frameworks:**
- `bootstrap` ^5.3.2, `react-bootstrap` ^2.9.2
- `tailwindcss` ^4.1.16, `@tailwindcss/postcss` ^4.1.16, `tailwind-merge` ^2.4.0, `tailwindcss-animate` ^1.0.7
- `styled-components` ^6.1.8

**Component libraries:**
- `antd` ^5.19.2, `@ant-design/icons` ^6.1.0
- 23 `@radix-ui/*` primitives (accordion, dialog, dropdown-menu, select, tabs, tooltip, etc.)
- `class-variance-authority` ^0.7.0, `clsx` ^2.1.1

**Specialized UI packages:**
- Form/input: `react-select`, `react-datepicker`, `react-multi-date-picker`, `react-phone-input-2`
- Overlays: `react-responsive-modal`
- Layout: `react-beautiful-dnd`, `react-pro-sidebar`, `react-multi-carousel`, `react-vertical-timeline-component`
- Feedback: `react-loading-skeleton`, `react-spinners`, `react-tooltip`, `react-hot-toast`, `react-switch`
- Data: `react-dropzone`, `react-to-print`, `react-table-sticky`, `react-data-table-component`

**Icon libraries:**
- `@ant-design/icons`, `lucide-react`, `react-icons`, `@fortawesome/react-fontawesome`, `@fortawesome/free-solid-svg-icons`

**Charting:**
- `echarts`, `echarts-for-react`, `react-echarts-wrapper`, `recharts`

**Pre-processors:**
- `sass` ^1.80.6, `sass-embedded` ^1.80.2

---

### 1.2 Usage by Library

#### Bootstrap / React-Bootstrap

| Metric | Value |
|--------|--------|
| Files importing `react-bootstrap` | 200+ |
| Files using Bootstrap CSS classes | 400+ |
| Bootstrap CSS loaded via | CDN in `index.html` (v5.0.2) and npm (v5.3.2) |

- Bootstrap CDN (v5.0.2) in `index.html`; npm package is v5.3.2 (version mismatch).
- Direct Bootstrap CSS imports in `src/components/ChartSkeleton.tsx` and `src/components/MiniChartSkeleton.tsx`.
- react-bootstrap components in use: Tab, Tabs, Row, Col, Form, Button, Modal, Card, Table, Nav, Dropdown, Accordion, Pagination, ProgressBar, Spinner, Toast, Tooltip, ListGroup, InputGroup, Breadcrumb, Carousel, Collapse, Offcanvas.
- Bootstrap utility classes (d-flex, p-*, m-*, col-*, text-center, bg-*, etc.) used in 400+ files.
- Heaviest usage: Customer Management, Loan Management, Landing Pages, Settings.

#### Ant Design (antd)

| Metric | Value |
|--------|--------|
| Files importing `antd` | 300+ |
| Files importing `@ant-design/icons` | 200+ |

- Components used: Button, Input, Select, Modal, Form, DatePicker, Table, Steps, Upload, Tabs, Switch, Radio, Checkbox, Tag, Badge, Spin, Typography, Descriptions, Skeleton, InputNumber, TimePicker, Tree, Transfer.
- Heaviest usage: Product Management, User & Role Management, LOV, Compliance, Notifications, Reports.

#### Styled-Components

| Metric | Value |
|--------|--------|
| Files using styled-components | 24 |

- Primarily `createGlobalStyle` for theme-based global CSS.
- `App.tsx` defines a ~130-line `GlobalStyle` applying theme colors to sidebar, headers, buttons, tabs.
- Global styles reference `src/components/Config/Theme.ts`.
- Only 2–3 files use `styled.div` for component-level styling.

#### Tailwind CSS

| Metric | Value |
|--------|--------|
| Files using Tailwind classes | 200+ |
| Tailwind content scope | 6 specific paths in `tailwind.config.js` |

- Content paths: InvestorPages, ProductManagement, `src/components/ui/`, plus three individual component files.
- Preflight disabled to avoid Bootstrap conflicts.
- Primary color set to `#000000` in config.
- `src/index.css` defines oklch-based CSS variables for shadcn.
- `src/components/ui/` contains 50 shadcn components (Radix + Tailwind).

#### SCSS

| Metric | Value |
|--------|--------|
| Project SCSS files | 2 |

- `src/assets/scss/custom.scss`: large file (~188K+ characters); Bootstrap overrides, headers, footers, landing, dashboards, forms, navigation, sidebars, tables, cards, buttons, breakpoints, RTL.
- `src/assets/scss/styles.scss`: imports custom.scss, sets body font.

#### CSS Files

- `src/index.css`: Tailwind v4, CSS variables, Bootstrap overrides.
- 5 component-specific CSS files.
- 2 page-specific CSS files.
- 4 compiled/minified CSS files (SCSS output).
- `src/styles/arabic-rtl.css`: RTL support.

#### Hardcoded Colors

| Metric | Value |
|--------|--------|
| Hex color instances | 500+ across 200+ files |
| RGB/RGBA instances | 150+ across 60+ files |

Frequent values: `#1963b9`, `#000000`/`#000`, `#ffffff`/`#fff`, `#f5f5f5`/`#f4f4f4`, `#EB0D0D`, `#F84D4D`, `#BC3D3F`, `#3FC380`, `#333`, `#666`.

#### Inline Styles

| Metric | Value |
|--------|--------|
| Files with inline `style={{}}` | 300+ |

Used for status badges, layout, spacing, typography, borders; often mixed with Bootstrap on the same elements.

---

### 1.3 Theme Configuration (Current State)

Three separate systems:

**System 1 — JavaScript theme object** (`src/components/Config/Theme.ts`)

- Static object with hardcoded hex colors (primary, secondary, headers, tables, sidebar).
- Used by `createGlobalStyle` in App.tsx and 20+ Header/Dashboard components.
- Not loaded from API; cannot be switched at runtime per tenant.
- Known issues: `" red"` (leading space), `"#00000"` (missing digit).

**System 2 — CSS variables (oklch)** (`src/index.css`)

- Tokens: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`.
- Consumed only by the 50 shadcn/Tailwind components in `src/components/ui/`.
- Dark mode via `.dark` class.

**System 3 — Bootstrap variables** (`src/assets/scss/custom.scss`)

- `--bs-primary-rgb: 0,0,0` and other Bootstrap overrides.
- Used by Bootstrap-styled components.

---

## 2. Architecture Problems

### 2.1 Inconsistencies

- Three CSS frameworks (Bootstrap, Tailwind, styled-components) with conflicting resets and base styles.
- Two full component libraries with overlapping widgets (antd and react-bootstrap).
- Four icon libraries used inconsistently.
- Three theme systems that do not interoperate.
- Bootstrap CDN (5.0.2) vs npm (5.3.2) can cause rendering differences.
- Multiple charting libraries (ECharts and Recharts).
- Duplicate loading/spinner and toast/notification implementations.

### 2.2 Tight Coupling

- 300+ files import from `antd`; 200+ from `react-bootstrap`.
- Inline styles in 300+ files couple layout and color to component logic.
- `App.tsx` GlobalStyle targets internal class names of `react-pro-sidebar` (e.g. `.css-vj11vy`, `.css-12w9als`, `.css-1654oxy`); these are generated and can break on upgrades.
- Theme.ts is interpolated into `createGlobalStyle`, coupling JS and CSS at runtime.

### 2.3 Theming Limitations

- Theme.ts is static; no API or runtime switch.
- oklch CSS variables apply only to shadcn components; the rest of the app ignores them.
- Redux `setTheme` exists but is commented out and unused.
- Heavy use of `!important` in `index.css` and `custom.scss` makes theme overrides fragile.

### 2.4 White-Labeling Blockers

- Hardcoded tenant ID in `App.tsx`.
- No tenant-based theme loading; theme is build-time only.
- 500+ hardcoded colors across 200+ files.
- Brand name in `index.html` (`Factoring Valley`).
- Logos, favicons, fonts are static.
- Inline hardcoded colors cannot be overridden by theme or CSS variables.
- Multiple theme entry points would all need to become tenant-aware.

### 2.5 Performance

- Bootstrap CSS loaded via CDN and again via npm in components.
- antd likely bundled without clear tree-shaking.
- Three charting stacks (ECharts + wrappers + Recharts) increase bundle size.
- Four icon libraries each add weight; @ant-design/icons alone is ~60KB+ gzipped.
- Large global SCSS file loaded on every page.
- Many Radix primitives overlap with antd/Bootstrap.
- Both `sass` and `sass-embedded` are present.
- Tailwind preflight disabled, with manual resets adding extra CSS.

---

## 3. Dependency Conflicts

### 3.1 Overlapping Responsibilities

| Function | Bootstrap | antd | shadcn/Radix | Other |
|----------|-----------|------|--------------|--------|
| Button | react-bootstrap | antd Button | ui/button.tsx | — |
| Modal/Dialog | react-bootstrap | antd Modal | ui/dialog.tsx | react-responsive-modal |
| Select/Dropdown | react-bootstrap | antd Select | ui/select.tsx | react-select |
| Tabs | react-bootstrap | antd Tabs | ui/tabs.tsx | — |
| Form/Input | react-bootstrap | antd Form/Input | ui/form.tsx | — |
| Table | react-bootstrap | antd Table | ui/table.tsx | react-data-table-component |
| Toast/Notification | react-bootstrap | antd notification | ui/toast.tsx | react-hot-toast |
| Tooltip | react-bootstrap | antd Tooltip | ui/tooltip.tsx | react-tooltip |
| Checkbox | react-bootstrap | antd Checkbox | ui/checkbox.tsx | — |
| Radio | react-bootstrap | antd Radio | ui/radio-group | — |
| Progress Bar | react-bootstrap | antd Progress | ui/progress.tsx | — |
| Accordion | react-bootstrap | antd Collapse | ui/accordion.tsx | — |
| Badge | react-bootstrap | antd Badge | ui/badge.tsx | — |
| Breadcrumb | react-bootstrap | antd Breadcrumb | ui/breadcrumb.tsx | — |
| Pagination | react-bootstrap | antd Pagination | ui/pagination.tsx | — |
| Spinner/Loading | react-bootstrap | antd Spin | ui/skeleton.tsx | react-spinners, react-loading-skeleton |
| Switch | — | antd Switch | ui/switch.tsx | react-switch |
| Date Picker | — | antd DatePicker | ui/calendar.tsx | react-datepicker, react-multi-date-picker |
| Carousel | react-bootstrap | — | ui/carousel.tsx | react-multi-carousel |
| Icons | FontAwesome CDN | @ant-design/icons | lucide-react | react-icons |

Eighteen component categories have three or more implementations.

### 3.2 Bundle Size (Estimated Gzipped)

| Library | Size |
|----------|------|
| antd (full) | ~200–300 KB |
| @ant-design/icons | ~60 KB |
| bootstrap CSS | ~25 KB |
| react-bootstrap | ~40 KB |
| styled-components | ~15 KB |
| echarts | ~300 KB |
| recharts | ~80 KB |
| react-icons (full) | ~50 KB |
| FontAwesome | ~30 KB |
| 23 Radix UI primitives | ~50 KB |
| **Estimated removable UI weight** | **~600–800 KB** |

Current bundle likely exceeds 1MB of UI-related code where a unified stack could be on the order of ~300KB.

---

See also: [UI Architecture](UI_ARCHITECTURE.md), [UI Migration Plan](UI_MIGRATION_PLAN.md).
