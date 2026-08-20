import { useProductPermissions } from "./useProductPermissions";

/**
 * Whether LEX screens are gated on permissions.
 *
 * **Currently off.** The `LEX_*` codes are not registered in identity-service
 * yet, so every check would fail and the whole module would be invisible to
 * everyone except a super admin. Until they are registered, LEX renders for any
 * signed-in user and the server stays the real gate — a 403 from Casbin still
 * refuses anything the caller may not do, it simply is not predicted here.
 *
 * To turn gating on: flip this to `true`. Nothing else changes — every screen
 * already asks `can(LEX_PERMISSIONS.X)` for the right code, and the sidebar
 * already knows which entry each one belongs to.
 */
export const LEX_PERMISSIONS_ENFORCED = false;

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
