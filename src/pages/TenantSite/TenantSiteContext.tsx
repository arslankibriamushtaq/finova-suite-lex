import { createContext, useContext } from "react";

import type { PublicSite } from "../../redux/apis/apisTenantSite";

interface TenantSiteContextValue {
  site: PublicSite;
  /** "en" | "ar" — the active page locale, not necessarily the tenant default. */
  locale: string;
}

const TenantSiteContext = createContext<TenantSiteContextValue | null>(null);

export const TenantSiteProvider = TenantSiteContext.Provider;

export function useTenantSite(): TenantSiteContextValue {
  const value = useContext(TenantSiteContext);
  if (!value) throw new Error("useTenantSite must be used inside a tenant site page");
  return value;
}
