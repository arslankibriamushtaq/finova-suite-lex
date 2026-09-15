import axiosTenantProvisioning from "../../utils/axiosTenantProvisioning";

/**
 * A tenant's own public website — the page that tenant's *customers* land on.
 *
 * Contract: `tenant-provisioning-service`, `/api/v1/public/site` (see
 * TENANT_WEBSITES_FRONTEND_GUIDE). Unauthenticated, like the rest of that
 * instance: the hostname identifies the tenant, and an `X-Tenant-Id` header
 * would be something any visitor could forge, so the backend ignores one.
 *
 * This is NOT the Finova platform landing page. Nothing here renders pricing,
 * a subscribe button, the module catalogue or "Book a Demo" — a tenant buys
 * the platform, it does not resell it. See `src/pages/Landing/` for that page.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SiteSectionType =
  | "HERO"
  | "ABOUT"
  | "PRODUCTS"
  | "WHY_US"
  | "INVESTOR_CTA"
  | "FAQ"
  | "CONTACT"
  | "FOOTER";

export interface SiteBranding {
  logoUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  heroImageUrl: string | null;

  /** Always present, always 6-digit hex. */
  primaryColor: string;
  secondaryColor: string | null;
  accentColor: string | null;
  backgroundColor: string;
  textColor: string;

  fontFamily: string | null;
  /** 0–64. */
  cornerRadiusPx: number;
  defaultLocale: string;

  supportEmail: string | null;
  supportPhone: string | null;
  socialLinks: Record<string, string>;

  /** `false` when the brand colour is hard to read on the page background. */
  readableContrast: boolean;

  // Storage identifiers, not addresses — the tenant's own editor writes these
  // back. Never render them.
  logoKey: string | null;
  logoDarkKey: string | null;
  faviconKey: string | null;
  heroImageKey: string | null;
}

export interface SiteSection {
  type: SiteSectionType;
  sortOrder: number;
  /** Always true on the public endpoint; the backend filters before responding. */
  enabled: boolean;
  available: boolean;
  requiresModule: string | null;

  titleEn: string | null;
  titleAr: string | null;
  subtitleEn: string | null;
  subtitleAr: string | null;
  bodyEn: string | null;
  bodyAr: string | null;

  imageUrl: string | null;
  imageKey: string | null;

  ctaLabelEn: string | null;
  ctaLabelAr: string | null;
  ctaTarget: string | null;

  /** Free-form cards / FAQ pairs. `[]` when none; treat every key as optional. */
  items: Record<string, string>[];
}

export interface PublicSite {
  /** Stable id, not for display. */
  tenantCode: string;
  companyName: string;
  companyNameAr: string | null;
  branding: SiteBranding;
  /** Already filtered and ordered by `sortOrder`. */
  sections: SiteSection[];
  /** This tenant's current entitlements, e.g. ["LOS", "LMS", "PORTFOLIO"]. */
  modules: string[];
}

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

/**
 * The one call a tenant page makes. One per page load, not per route change:
 * Kong rate-limits this service at 60 req/min/IP, shared with the signup
 * funnel — see `loadTenantSite` in `src/utils/tenantSite.ts`, which caches it.
 *
 * `host` comes from the browser because this is a Vite SPA with no server
 * render to resolve it first.
 */
export function getPublicSite(host: string): Promise<PublicSite> {
  return axiosTenantProvisioning
    .get("/public/site", { params: { host } })
    .then((res) => res.data?.data);
}

/**
 * A tenant admin's short-lived link to its unpublished draft. No hostname is
 * involved — the token carries the tenant, which is what lets a site be
 * previewed before it has an address. Expires in ~30 minutes, and an expired
 * token answers exactly like an unknown address.
 */
export function getPublicSitePreview(token: string): Promise<PublicSite> {
  return axiosTenantProvisioning
    .get("/public/site/preview", { params: { token } })
    .then((res) => res.data?.data);
}
