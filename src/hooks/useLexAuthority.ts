import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { RootState } from "../redux/rootReducer";
import { getAuthorityLevels, type LexAuthorityLevel } from "../redux/apis/apisLexConfig";

/**
 * Which rung of the delegation ladder the signed-in user stands on, and what
 * that lets them decide.
 *
 * Deciding a case is checked server-side against the actor's rung: an L0
 * underwriter closing an L2 case is refused with
 * `422 LEX.CASE.INSUFFICIENT_AUTHORITY`. This hook predicts that check so the
 * button is disabled rather than failing on click — but the server stays the
 * authority, and every caller still handles the 422, because a stale ladder
 * here must not become a silent allow.
 *
 * **The rung comes from the token's realm role, never from the request.** An
 * underwriter's level is an identity fact; a client that could assert its own
 * level could assert any level.
 */

/** `lex_underwriter_l2` → `L2`. The only shape identity-service issues. */
const UNDERWRITER_ROLE = /^lex_underwriter_l(\d+)$/;

/**
 * Roles that are not on the ladder at all. They may decide any case, and the
 * decision records a null level — so the trail shows plainly that no rung
 * approved it.
 */
const OFF_LADDER_ROLES = ["super_admin", "admin", "company_admin", "supervisor", "lex_supervisor"];

const realmRoles = (token?: string): string[] => {
  if (!token || typeof token !== "string") return [];
  try {
    const payload = token.split(".")[1];
    if (!payload) return [];
    const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    const roles = claims?.realm_access?.roles;
    return Array.isArray(roles) ? roles.map((r: unknown) => String(r).toLowerCase()) : [];
  } catch {
    return [];
  }
};

export interface LexAuthority {
  /** The user's own rung, e.g. `L1`. Null when they are not an underwriter. */
  levelCode: string | null;
  /** Ordinal of `levelCode` on this tenant's ladder. Null when off the ladder. */
  ordinal: number | null;
  /** True for admins and supervisors: not on the ladder, and not limited by it. */
  offLadder: boolean;
  levels: LexAuthorityLevel[];
  /**
   * Whether this user may decide a case routed to `assignedLevelCode`.
   *
   * Authority runs upward: a higher rung may decide a lower case, never the
   * reverse. An unknown or absent case level is left to the server rather than
   * blocked here — hiding the button on a case we cannot place would make a
   * decidable case look undecidable.
   */
  canDecideLevel: (assignedLevelCode?: string | null) => boolean;
}

export const useLexAuthority = (): LexAuthority => {
  const token = useSelector((state: RootState) => state.block.token);
  const [levels, setLevels] = useState<LexAuthorityLevel[]>([]);

  const roles = useMemo(() => realmRoles(token), [token]);

  const levelCode = useMemo(() => {
    const match = roles.map((r) => UNDERWRITER_ROLE.exec(r)).find(Boolean);
    return match ? `L${match[1]}` : null;
  }, [roles]);

  const offLadder = useMemo(
    () => !levelCode && roles.some((r) => OFF_LADDER_ROLES.includes(r)),
    [roles, levelCode]
  );

  useEffect(() => {
    // Only an underwriter needs the ordinals; nobody else is compared against them.
    if (!levelCode) return;
    let cancelled = false;
    getAuthorityLevels()
      .then((list) => {
        if (!cancelled) setLevels(list);
      })
      // A ladder we cannot read leaves `ordinal` null, which defers to the
      // server rather than blocking every decision on a failed config call.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [levelCode]);

  const ordinalOf = (code?: string | null): number | null => {
    if (!code) return null;
    const found = levels.find((l) => l.code?.toUpperCase() === String(code).toUpperCase());
    return typeof found?.ordinal === "number" ? found.ordinal : null;
  };

  const ordinal = ordinalOf(levelCode);

  const canDecideLevel = (assignedLevelCode?: string | null): boolean => {
    if (offLadder) return true;
    if (!levelCode) return true; // Not an underwriter — let the server decide.
    const caseOrdinal = ordinalOf(assignedLevelCode);
    if (caseOrdinal === null || ordinal === null) return true; // Unplaceable — defer.
    return ordinal >= caseOrdinal;
  };

  return { levelCode, ordinal, offLadder, levels, canDecideLevel };
};

export default useLexAuthority;
