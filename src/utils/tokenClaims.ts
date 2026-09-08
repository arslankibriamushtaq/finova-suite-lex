import { store } from "../redux/store";

/**
 * Claims off the access token.
 *
 * Several places already decode the JWT inline — the tenant header in
 * `axiosFactoring`, the super-admin check in `useProductPermissions`. This is
 * the same decode, in one place, for the callers that need an identity rather
 * than a role.
 */
export const getTokenClaims = (token?: string): Record<string, unknown> | null => {
  const jwt = token ?? (store.getState() as { block?: { token?: string } })?.block?.token;
  if (!jwt || typeof jwt !== "string") return null;
  try {
    const payload = jwt.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};

/**
 * The signed-in user's id — the Keycloak `sub`, which is what the services
 * record as the actor on a write.
 *
 * Returns `undefined` when it cannot be read. Treat that as "unknown", never as
 * "not this person": a maker-only action gated on a bad comparison would be
 * invisible to the one person entitled to it. Show the action and let the
 * server refuse it instead.
 */
export const getCurrentUserId = (token?: string): string | undefined => {
  const claims = getTokenClaims(token);
  const sub = claims?.sub ?? claims?.user_id ?? claims?.userId;
  return typeof sub === "string" && sub ? sub : undefined;
};
