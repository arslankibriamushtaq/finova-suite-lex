import type { AxiosResponse } from "axios";

import axiosTenancy from "../../utils/axiosTenancy";
import type { SiteBranding, SiteSection, SiteSectionType } from "./apisTenantSite";

/**
 * The tenant admin's **website editor** — `/api/v1/tenant-portal/site/**`.
 *
 * The authenticated half of the tenant website feature. The page these edits
 * produce is `src/pages/TenantSite/`, which reads the public, unauthenticated
 * endpoint in `apisTenantSite.ts`; the two share `SiteBranding` and
 * `SiteSection`, so those types live there and are re-exported here.
 *
 * No tenant id travels in any path or body: `axiosTenancy` sends the bearer
 * token and the server takes the tenant from its `tenant_id` claim. There is
 * therefore no request on this file that could edit another company's site.
 *
 * **Every mutating call returns the whole screen.** Take what came back rather
 * than refetching — the readiness checklist recomputes on each one, so the
 * Launch button's enabled state stays correct for free.
 */

export type { SiteBranding, SiteSection, SiteSectionType } from "./apisTenantSite";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TenantSiteStatus = "DRAFT" | "LIVE" | "PAUSED";

export interface SiteDomain {
  id: string;
  host: string;
  primary: boolean;
  /** The free `{tenant-code}.finova.sa`. Cannot be deleted. */
  platformProvided: boolean;
  verified: boolean;
  verifiedAt: string | null;
  /** The TXT value to publish. `null` once verified. */
  verificationRecordValue: string | null;
}

export interface ReadinessCheck {
  key: string;
  passed: boolean;
  detail: string | null;
}

export interface SiteReadiness {
  ready: boolean;
  checks: ReadinessCheck[];
}

export interface TenantSite {
  status: TenantSiteStatus;
  /** When it last went live; `null` while it never has. */
  publishedAt: string | null;
  primaryHost: string | null;
  domains: SiteDomain[];
  branding: SiteBranding;
  /** Every allowed type, including the ones this tenant is not entitled to. */
  sections: SiteSection[];
  entitledModules: string[];
  readiness: SiteReadiness;
}

/** What `PUT /branding` accepts: the `*Key` fields, never the `*Url` ones. */
export interface BrandingPayload {
  logoKey: string | null;
  logoDarkKey: string | null;
  faviconKey: string | null;
  heroImageKey: string | null;
  primaryColor: string;
  secondaryColor: string | null;
  accentColor: string | null;
  backgroundColor: string;
  textColor: string;
  fontFamily: string | null;
  cornerRadiusPx: number;
  defaultLocale: string;
  supportEmail: string | null;
  supportPhone: string | null;
  socialLinks: Record<string, string>;
}

export type AssetKind = "LOGO" | "LOGO_DARK" | "FAVICON" | "HERO" | "SECTION_IMAGE";

export interface SiteAsset {
  /** A storage identifier, not an address. Save this; never build a URL from it. */
  objectKey: string;
  /** The address to display until the next GET returns a `*Url`. */
  url: string;
  sizeBytes: number;
  contentType: string;
}

export interface PreviewLink {
  token: string;
  url: string;
  expiresAt: string;
}

export interface DomainClaim {
  domain: SiteDomain;
  recordType: string;
  recordName: string;
  recordValue: string;
}

// ---------------------------------------------------------------------------
// Asset rules — enforced server-side; mirrored here so a 4 MB logo fails
// instantly instead of after the upload.
// ---------------------------------------------------------------------------

/**
 * SVG is absent from every row on purpose: it is a document that can carry
 * script, and these files are served from the platform's own origin to the
 * tenant's customers. Do not add it to a file picker.
 *
 * The server identifies a file by its own leading bytes, not by the content
 * type the browser declared, so a renamed `.html` is refused whatever the
 * picker called it. This is a convenience check, not the rule.
 */
export const ASSET_RULES: Record<
  AssetKind,
  { accept: string[]; maxBytes: number; label: string }
> = {
  LOGO: { accept: ["image/png", "image/jpeg", "image/webp"], maxBytes: 512 * 1024, label: "PNG, JPEG or WebP, up to 512 KB" },
  LOGO_DARK: { accept: ["image/png", "image/jpeg", "image/webp"], maxBytes: 512 * 1024, label: "PNG, JPEG or WebP, up to 512 KB" },
  FAVICON: { accept: ["image/png", "image/x-icon", "image/vnd.microsoft.icon"], maxBytes: 128 * 1024, label: "PNG or ICO, up to 128 KB" },
  HERO: { accept: ["image/png", "image/jpeg", "image/webp"], maxBytes: 3 * 1024 * 1024, label: "PNG, JPEG or WebP, up to 3 MB" },
  SECTION_IMAGE: { accept: ["image/png", "image/jpeg", "image/webp"], maxBytes: 2 * 1024 * 1024, label: "PNG, JPEG or WebP, up to 2 MB" },
};

/** The eight types are fixed; the server rejects anything else. */
export const SECTION_TYPES: SiteSectionType[] = [
  "HERO",
  "ABOUT",
  "PRODUCTS",
  "WHY_US",
  "INVESTOR_CTA",
  "FAQ",
  "CONTACT",
  "FOOTER",
];

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

const unwrap = <T>(res: AxiosResponse<{ data: T }>): T => res.data?.data;

/**
 * The whole screen: the draft, the entitlements, the resolved image URLs and
 * the readiness checklist.
 *
 * **This call creates the site on first use** — the draft, the tenant's free
 * subdomain, and every section in the catalogue already written from the
 * company's registration details (entitled ones switched on, the rest written
 * but off). So it is a write; do not call it speculatively from a dashboard
 * widget. The screen presents what comes back as the tenant's page, and adds
 * no placeholder copy of its own.
 */
export function getTenantSite(): Promise<TenantSite> {
  return axiosTenancy.get("/tenant-portal/site").then(unwrap<TenantSite>);
}

/** Whole object, not a patch — anything left out is cleared. */
export function updateSiteBranding(payload: BrandingPayload): Promise<TenantSite> {
  return axiosTenancy.put("/tenant-portal/site/branding", payload).then(unwrap<TenantSite>);
}

/**
 * Whole set, in order. This is a replace: a section left out of the array is
 * deleted, and `sortOrder` is renumbered from the array order, so reordering
 * is "reorder the array, send it".
 */
export function updateSiteSections(sections: SiteSection[]): Promise<TenantSite> {
  return axiosTenancy.put("/tenant-portal/site/sections", { sections }).then(unwrap<TenantSite>);
}

/**
 * Uploads a file and returns its key. **It saves nothing by itself** — the key
 * still has to go into the branding or the section and be PUT, or an admin who
 * uploads a logo and navigates away has changed nothing.
 */
export function uploadSiteAsset(kind: AssetKind, file: File): Promise<SiteAsset> {
  const body = new FormData();
  body.append("file", file);
  return axiosTenancy
    // The instance leaves a FormData body's content type to the browser, so
    // the multipart boundary survives — see axiosTenancy's request interceptor.
    .post("/tenant-portal/site/assets", body, { params: { kind } })
    .then(unwrap<SiteAsset>);
}

/** Just the checklist. Rarely needed — every save already returns a fresh one. */
export function getSiteReadiness(): Promise<SiteReadiness> {
  return axiosTenancy.get("/tenant-portal/site/readiness").then(unwrap<SiteReadiness>);
}

/** Copies the draft over the published revision. Republishing is normal. */
export function publishSite(): Promise<TenantSite> {
  return axiosTenancy.post("/tenant-portal/site/publish").then(unwrap<TenantSite>);
}

/** Takes the page down. The content is kept and can be relaunched. */
export function unpublishSite(): Promise<TenantSite> {
  return axiosTenancy.post("/tenant-portal/site/unpublish").then(unwrap<TenantSite>);
}

/**
 * A fresh link every press, never a cached one: it expires in about 30 minutes
 * and cannot be renewed, so a cached link silently becomes an "unavailable"
 * page. Anyone holding the URL sees the unpublished draft — treat it as a
 * credential in the UI.
 */
export function createSitePreviewLink(): Promise<PreviewLink> {
  return axiosTenancy.post("/tenant-portal/site/preview-link").then(unwrap<PreviewLink>);
}

export function claimSiteDomain(host: string): Promise<DomainClaim> {
  return axiosTenancy.post("/tenant-portal/site/domains", { host }).then(unwrap<DomainClaim>);
}

/** Checks DNS now. Free to retry, and there is no lockout. */
export function verifySiteDomain(id: string): Promise<SiteDomain> {
  return axiosTenancy
    .post(`/tenant-portal/site/domains/${encodeURIComponent(id)}/verify`)
    .then(unwrap<SiteDomain>);
}

/** The canonical address, one per tenant. Only a verified host can take it. */
export function makeSiteDomainPrimary(id: string): Promise<TenantSite> {
  return axiosTenancy
    .post(`/tenant-portal/site/domains/${encodeURIComponent(id)}/primary`)
    .then(unwrap<TenantSite>);
}

export function deleteSiteDomain(id: string): Promise<TenantSite> {
  return axiosTenancy
    .delete(`/tenant-portal/site/domains/${encodeURIComponent(id)}`)
    .then(unwrap<TenantSite>);
}
