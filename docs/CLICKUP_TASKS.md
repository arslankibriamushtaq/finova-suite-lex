# ClickUp Tasks — Finova LOS Frontend (feature/ui-migration)

Tasks based on implemented work (not commented out, merged into feature/ui-migration branch).

---

## Task 1: Phase 0 — Project Setup & Configuration

### Subtasks:
- [ ] Tailwind CSS config updated — content paths simplified to include all src files
- [ ] CSS imports cleaned up — removed unused theme variables
- [ ] Branch `feature/ui-migration` created and active

---

## Task 2: Phase 1 — CSS Variables & Token Migration

### Subtasks:
- [ ] `tokens.css` created with full CSS variable token set (shadcn semantic tokens, app theme tokens, status colors)
- [ ] Global styles migrated from `App.tsx` to `tokens.css` — removed hardcoded theme values
- [ ] CSS token styles enhanced with new action color variable
- [ ] Dashboard components migrated to CSS variables (bg colors, text, buttons)
- [ ] Leads component migrated to CSS variables
- [ ] AllCustomers & LeadDetails components migrated to CSS variables
- [ ] Product Management components migrated to CSS variables
- [ ] ThirdPartyDashboard & CMS pages migrated to CSS variables
- [ ] Multiple pages standardized to CSS variables for colors and backgrounds
- [ ] Cross-component styles updated — CSS variables for colors and borders
- [ ] Application-wide components migrated to CSS variables (bg colors, text colors, button styles)

---

## Task 3: Phase 2 — Antd to Shadcn/UI Migration

### Subtasks:
- [ ] Product Management — antd dropdowns replaced with shadcn Select
- [ ] Product Management — antd buttons replaced with shadcn Button
- [ ] Product Management — antd switches replaced with shadcn Switch

---

## Task 4: SSO Login & Authentication

### Subtasks:
- [ ] SSO login flow implemented
- [ ] Logout functionality enhanced across components
- [ ] Login page updated

---

## Task 5: Role-Based Access Control & Employee Management

### Subtasks:
- [ ] Role-based permissions system implemented
- [ ] Employee CRUD operations added
- [ ] Sidebar access control based on roles
- [ ] API endpoints updated for role management

---

## Task 6: Providers Management

### Subtasks:
- [ ] Providers listing page created
- [ ] Add Provider functionality implemented
- [ ] Edit Provider functionality implemented
- [ ] Delete Provider functionality implemented

---

## Task 7: Document Management Refactor

### Subtasks:
- [ ] Document management components refactored to use new API structure
- [ ] `editProductDocument` API added
- [ ] Document handling updated in CreateRequiredDocuments component
- [ ] Document handling updated in RequiredDoc component

---

## Task 8: Product Management Updates

### Subtasks:
- [ ] Product Management page updated with new UI elements
- [ ] Code organization improved for Product Management module

---

## Task 9: Client Management — Middleware API Refactor

### Subtasks:
- [ ] Client management refactored to use middleware APIs
- [ ] AddEditClient component updated

---

## Task 10: Code Quality & Cleanup

### Subtasks:
- [ ] Redundant code sections removed for improved readability
- [ ] Code structure refactored for maintainability across multiple files
