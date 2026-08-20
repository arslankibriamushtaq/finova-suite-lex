/**
 * What a LEX realm role is granted, in the shape the permission store expects.
 *
 * **Why this exists.** The LEX underwriters are Keycloak-only accounts: they
 * carry `lex_underwriter_l0|l1|l2` as a realm role and authenticate with
 * `roleId: null`. `/permissions/role/{id}` needs an id, so there is nothing to
 * ask — and a user with no stored permissions is hidden from every gated
 * module, which is indistinguishable from a user who was granted nothing.
 *
 * This is a **fallback, used only when the server could not answer**
 * (`getPermissionsForCaller` failed or returned empty). It mirrors the grants
 * `V104__add_lex_module_permissions_and_roles.sql` records for these roles —
 * nothing more. It cannot grant access: Casbin still refuses on the server, and
 * every LEX call goes through it. What it restores is the menu.
 *
 * Deliberately LEX-only. Deriving a whole permission set from realm roles on
 * the client would put authority in two places, and they would drift.
 */

export interface PermissionModule {
  moduleCode: string;
  moduleName: string;
  permissionsList: { permissionCode: string; permissionName: string }[];
}

const module_ = (code: string, codes: string[]): PermissionModule => ({
  moduleCode: code,
  moduleName: code,
  permissionsList: codes.map((permissionCode) => ({
    permissionCode,
    permissionName: permissionCode,
  })),
});

/**
 * Cases read + work + decide + escalate, and **read** on config, documents,
 * knowledge and BI.
 *
 * No `LEX_CONFIG_MANAGE`, and no MANAGE anywhere else: an underwriter never
 * authors the rules they are judged against. That separation is what the whole
 * delegation model rests on, so it is stated here rather than left implicit.
 *
 * All three levels get the same set — what separates L0 from L2 is the
 * authority ladder, checked server-side against the case's assigned rung. No
 * permission expresses it; see `useLexAuthority`.
 */
export const LEX_UNDERWRITER_MODULES: PermissionModule[] = [
  module_("LEX_CASES", [
    "LEX_CASES_READ",
    "LEX_CASES_WORK",
    "LEX_CASES_DECIDE",
    "LEX_CASES_ESCALATE",
  ]),
  module_("LEX_CONFIG", ["LEX_CONFIG_READ"]),
  module_("LEX_DOCUMENTS", ["LEX_DOCUMENTS_READ"]),
  module_("LEX_KNOWLEDGE", ["LEX_KNOWLEDGE_READ"]),
  module_("LEX_BI", ["LEX_BI_READ"]),
];

const UNDERWRITER_ROLE = /^lex_underwriter_l\d+$/;

export const isLexUnderwriterRole = (role: string): boolean =>
  UNDERWRITER_ROLE.test(String(role).toLowerCase());

/**
 * The modules to seed for these realm roles, or an empty array when none of
 * them is a LEX role — in which case nothing is seeded and the user stays
 * fail-closed, as they were.
 */
export const lexModulesForRoles = (roles?: unknown): PermissionModule[] => {
  if (!Array.isArray(roles)) return [];
  return roles.some((role) => isLexUnderwriterRole(String(role)))
    ? LEX_UNDERWRITER_MODULES
    : [];
};
