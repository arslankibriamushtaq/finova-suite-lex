// After login the app redirects to the wallet dashboard (/LOS/Wallet/Home). If the
// user's role has no permission for it, land them on the first sidebar page they DO
// have permission for instead. Candidates are ordered to match the sidebar so the
// landing page is the topmost accessible module.

const DEFAULT_ROUTE = "/LOS/Wallet/Home";

interface PermissionModule {
  moduleCode?: string;
}

// module code (identity-service) -> landing route, in sidebar priority order.
const LANDING_CANDIDATES: { code: string; route: string }[] = [
  { code: "DASHBOARD", route: "/LOS/Wallet/Home" },
  { code: "CUSTOMER", route: "/LOS/CustomerManagement/CustomerList" },
  { code: "RISK", route: "/LOS/RiskManagement/BlacklistNid" },
  { code: "PRODUCT", route: "/LOS/ProductManagement" },
  { code: "LOV", route: "/LOS/LOV/EmploymentSector" },
  { code: "EMPLOYEE", route: "/LOS/Setting/Employees" },
  { code: "ROLE", route: "/LOS/Setting/RoleList" },
  { code: "PERMISSION", route: "/LOS/Setting/AssignPermissions" },
];

/**
 * Resolve the post-login landing route.
 * @param permissions the modules-with-permissions array stored in Redux
 * @param isSuperAdmin true when the JWT carries the `super_admin` realm role
 * @returns the first accessible route, or the default wallet dashboard as a fallback
 */
export function getLandingRoute(
  permissions: PermissionModule[] | undefined | null,
  isSuperAdmin: boolean
): string {
  // Super admin can see everything — keep the default landing page.
  if (isSuperAdmin) return DEFAULT_ROUTE;

  const codes = new Set(
    (Array.isArray(permissions) ? permissions : [])
      .map((m) => String(m?.moduleCode || "").toUpperCase())
      .filter(Boolean)
  );

  // If nothing is assigned at all, there is no accessible module — keep the default
  // (the individual page still guards itself); otherwise pick the first the user has.
  const match = LANDING_CANDIDATES.find((c) => codes.has(c.code));
  return match ? match.route : DEFAULT_ROUTE;
}

/** Read the `super_admin` Keycloak realm role from a decoded JWT payload. */
export function isSuperAdminFromToken(decodedToken: any): boolean {
  const roles = decodedToken?.realm_access?.roles;
  return Array.isArray(roles) && roles.includes("super_admin");
}
