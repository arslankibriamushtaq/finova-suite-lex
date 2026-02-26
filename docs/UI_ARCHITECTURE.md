# Finova LOS Frontend — UI Architecture

**Document type:** Internal technical reference  
**Audience:** Development team  
**Last updated:** February 2026

---

## Table of Contents

1. [Target Stack](#1-target-stack)
2. [Centralized Theme Tokens](#2-centralized-theme-tokens)
3. [CSS Variable Flow](#3-css-variable-flow)
4. [Component Layers](#4-component-layers)
5. [Proposed Folder Structure](#5-proposed-folder-structure)
6. [Reusable Component Mapping](#6-reusable-component-mapping)
7. [White-Label Configuration](#7-white-label-configuration)
8. [Development Governance Rules](#8-development-governance-rules)

---

## 1. Target Stack

**Tailwind CSS v4 + shadcn/ui only.**

Existing foundation:

- 50 shadcn components in `src/components/ui/`
- Tailwind v4 installed and configured
- CSS variables in `src/index.css`
- Radix UI primitives already in use

**Goal:** Remove Bootstrap, antd, styled-components, and redundant one-off UI packages.

---

## 2. Centralized Theme Tokens

Single source of truth: CSS custom properties in one file.

```css
/* src/styles/tokens.css */
:root {
  --brand-primary: oklch(0 0 0);
  --brand-primary-foreground: oklch(0.985 0 0);
  --brand-secondary: oklch(0.97 0 0);
  --brand-accent: oklch(0.577 0.245 27.325);

  --color-background: var(--brand-primary-foreground);
  --color-foreground: oklch(0.145 0 0);
  --color-success: oklch(0.65 0.2 145);
  --color-warning: oklch(0.75 0.18 85);
  --color-error: oklch(0.577 0.245 27.325);
  --color-info: oklch(0.6 0.15 250);

  /* Spacing, radius, shadows, typography as variables */
}
```

---

## 3. CSS Variable Flow

```
Tenant Config (API/JSON)
        ↓
tokens.css (:root variables)
        ↓
Tailwind theme (@theme inline)
        ↓
shadcn components (Tailwind classes)
        ↓
Page/feature components (compose shadcn)
```

- CSS variables are the single source of truth.
- Tailwind maps variables via `@theme inline` (extend current setup in `index.css`).
- shadcn components use Tailwind only; no hardcoded colors in components.
- Dark mode: toggle `.dark` on `<html>`; variables switch accordingly.

---

## 4. Component Layers

```
Layer 1: Design Tokens (tokens.css)
Layer 2: Tailwind Utilities (from tokens)
Layer 3: shadcn Primitives (src/components/ui/) — 50 components
Layer 4: Composite Components (src/components/shared/)
Layer 5: Feature Components (src/components/{feature}/)
Layer 6: Page Components (src/pages/)
```

---

## 5. Proposed Folder Structure

```
src/
  styles/
    tokens.css          # Design tokens only
    globals.css         # Resets, fonts, Tailwind imports
    rtl.css             # RTL overrides
  components/
    ui/                 # shadcn primitives (existing)
    shared/             # App-specific composites
      DataTable/
      FormField/
      StatusBadge/
      PageHeader/
      Sidebar/
      DateRangePicker/
      FileUpload/
      RichTextEditor/
      PhoneInput/
      Charts/
    {feature}/          # Existing feature folders
  config/
    theme.ts            # Type-safe theme from API
    white-label.ts      # Tenant branding (logo, title, colors)
  pages/                # Unchanged
```

---

## 6. Reusable Component Mapping

| Need | Target |
|------|--------|
| Button | `src/components/ui/button.tsx` |
| Modal/Dialog | `src/components/ui/dialog.tsx` |
| Select | `src/components/ui/select.tsx` |
| Table | `src/components/shared/DataTable/` (shadcn table + tanstack-table) |
| Form | `src/components/ui/form.tsx` + Formik |
| Toast | `src/components/ui/toast.tsx` (Sonner) |
| Date Picker | `src/components/ui/calendar.tsx` (extend for range/hijri) |
| Icons | `lucide-react` only |
| Charts | `recharts` only |
| Skeleton/Loading | `src/components/ui/skeleton.tsx` |

---

## 7. White-Label Configuration

```typescript
// src/config/white-label.ts
interface TenantBranding {
  tenantId: string;
  name: string;
  logo: string;
  favicon: string;
  colors: {
    primary: string;
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

At app init:

1. Fetch tenant config from API (by tenantId).
2. Set CSS variables on `document.documentElement`.
3. Set document title, favicon, meta tags from config.
4. Store config in Redux for components that need brand name/logo.

No per-tenant rebuild; only API response differs.

---

## 8. Development Governance Rules

- **No hardcoded hex colors:** Do not use hex or RGB/RGBA literals in components or styles. Use design tokens or CSS variables only.

- **No inline style for spacing/colors:** Do not use inline `style={{}}` for spacing, colors, or typography. Use Tailwind or token-based utility classes instead.

- **No new UI libraries:** All net-new UI must use the approved stack (Tailwind + shadcn). Do not add new CSS frameworks, component libraries, or icon sets.

- **All UI from designated sources:** All UI must use components from `src/components/ui` or shared components in `src/components/shared`. Do not introduce one-off or feature-local UI primitives that duplicate these.

- **Icons: lucide-react only:** Use `lucide-react` for all icons. Do not add or use other icon libraries or CDN icon fonts.

- **Tokens are single source of truth:** Design tokens (e.g. in `tokens.css`) are the single source of truth for colors, spacing, radius, shadows, and typography. Components must consume tokens via Tailwind or CSS variables, not define their own values.

---

See also: [UI Audit](UI_AUDIT.md), [UI Migration Plan](UI_MIGRATION_PLAN.md).
