import { useProductPermissions } from "./useProductPermissions";

/**
 * Whether LEX screens are gated on permissions.
 *
 * **On.** It was off because LEX had Casbin policy but no entry in the
 * catalogue the frontend reads, so gating would have hidden the module from
 * everyone. `V104__add_lex_module_permissions_and_roles.sql` registered the
 * five LEX modules and their eleven permissions, and `/api/v1/permissions` now
 * returns them — so a check finally means something.
 *
 * The server remains the real gate either way: Casbin refuses anything the
 * caller may not do. What this adds is not security, it is not showing people
 * buttons that would 403.
 */
export const LEX_PERMISSIONS_ENFORCED = true;

/**
 * The permission check every LEX screen uses.
 *
 * Deliberately not `hasPermission` directly: routing every LEX gate through one
 * function means enabling enforcement is a single edit rather than a hunt
 * through fifteen pages, and it keeps the *intent* of each gate in the code
 * (which button belongs to which Casbin object) instead of deleting it now and
 * trying to reconstruct it later.
 */
export const useLexAccess = () => {
  const { hasPermission } = useProductPermissions();

  const can = (permission: string): boolean =>
    LEX_PERMISSIONS_ENFORCED ? hasPermission(permission) : true;

  return { can, enforced: LEX_PERMISSIONS_ENFORCED };
};

export default useLexAccess;
