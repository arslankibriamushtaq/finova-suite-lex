import type { PublicSite, SiteBranding } from "../redux/apis/apisTenantSite";
import { getPublicSite, getPublicSitePreview } from "../redux/apis/apisTenantSite";

/**
 * Host resolution, theming and caching for a tenant's public website.
 *
 * The whole theming mechanism is `src/styles/tokens.css`: overwrite the
 * variables it defines on `:root` and every component that reads a token
 * follows, with no per-component work. A component that still hardcodes a hex
 * will not follow the tenant — on this page that shows up as a Finova-red
 * button on a tenant's green site.
 */

// ---------------------------------------------------------------------------
// Host
// ---------------------------------------------------------------------------

/**
 * The hostname *is* the tenant identifier: the subdomain the platform gave the
 * tenant on whatever zone this environment serves (DEV:
 * `acme-fin.148.251.185.111.sslip.io`), or the tenant's own `apply.acme.com`
 * once it has proved ownership by DNS. Nothing here depends on which zone that
 * is — the browser's own hostname is the whole input.
 *
 * `?host=` stays in permanently: `localhost` resolves to no tenant, and QA
 * needs to point the page at a tenant without editing a hosts file. The
 * backend accepts the parameter precisely so a browser-side fetch can supply
 * it.
 */
export function resolveSiteHost(): string {
  const override = new URLSearchParams(window.location.search).get("host");
  if (override) return override;
  return window.location.hostname; // no port — the API strips it anyway
}

// ---------------------------------------------------------------------------
// Colour derivation
// ---------------------------------------------------------------------------

type Rgb = { r: number; g: number; b: number };

function parseHex(hex: string): Rgb | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const int = parseInt(match[1], 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function toHex({ r, g, b }: Rgb): string {
  const part = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** `amount` > 0 mixes toward black, < 0 toward white. */
function shade(rgb: Rgb, amount: number): string {
  const target = amount > 0 ? 0 : 255;
  const weight = Math.abs(amount);
  return toHex({
    r: rgb.r + (target - rgb.r) * weight,
    g: rgb.g + (target - rgb.g) * weight,
    b: rgb.b + (target - rgb.b) * weight,
  });
}

function alpha({ r, g, b }: Rgb, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

/**
 * Write the tenant's palette over the token variables.
 *
 * The API sends one brand colour, not a ramp, so the hover/pressed/soft steps
 * are derived here — otherwise hover states fall back to Finova red on a green
 * tenant. `--brand-*` is the ramp `--primary`, `--ring`, `--accent` and
 * `--destructive` are all defined in terms of, so overwriting it carries most
 * of the app with it; the `--color-*` aliases exist for code written against
 * the integration guide's names.
 *
 * It sends colours, font names and image URLs and nothing else — no
 * stylesheet, no markup, no script. Nothing in this flow may use
 * `dangerouslySetInnerHTML`.
 */
export function applyTenantTheme(branding: SiteBranding): void {
  const root = document.documentElement.style;
  const set = (name: string, value: string | null | undefined) => {
    if (value) root.setProperty(name, value);
  };

  // Background and text first: the largest areas of the page are then right
  // even if the rest arrives a frame later.
  set("--color-bg", branding.backgroundColor);
  set("--color-text", branding.textColor);
  set("--background", branding.backgroundColor);
  set("--card", branding.backgroundColor);
  set("--popover", branding.backgroundColor);
  set("--foreground", branding.textColor);
  set("--card-foreground", branding.textColor);
  set("--popover-foreground", branding.textColor);
  // `--surface-*` is a second, older family of literals that the landing-page
  // stylesheet — which the tenant site reuses — paints its page and header
  // with. Left alone, a tenant with a dark background got tenant-coloured
  // sections sitting on a white page.
  set("--surface-card", branding.backgroundColor);
  set("--surface-card-alt", branding.backgroundColor);

  set("--color-primary", branding.primaryColor);
  set("--color-secondary", branding.secondaryColor);
  set("--color-accent", branding.accentColor);
  set("--font-family-base", branding.fontFamily);

  const primary = parseHex(branding.primaryColor);
  if (primary) {
    // Ramp, light to deep. --primary/--ring/--accent/--destructive follow.
    set("--brand-50", shade(primary, -0.94));
    set("--brand-100", shade(primary, -0.87));
    set("--brand-200", shade(primary, -0.72));
    set("--brand-300", shade(primary, -0.5));
    set("--brand-400", shade(primary, -0.25));
    set("--brand-500", branding.primaryColor);
    set("--brand-600", shade(primary, 0.1));
    set("--brand-700", shade(primary, 0.2));
    set("--brand-800", shade(primary, 0.35));
    set("--brand-900", shade(primary, 0.5));

    set("--color-primary-hover", shade(primary, 0.1));
    set("--color-primary-active", shade(primary, 0.2));
    set("--color-primary-deep", shade(primary, 0.35));
    set("--color-primary-soft", alpha(primary, 0.16));
    set("--color-primary-subtle", alpha(primary, 0.08));
  }

  const radius = `${Math.min(64, Math.max(0, branding.cornerRadiusPx ?? 0))}px`;
  set("--radius", radius);
  set("--radius-md", radius);

  if (branding.fontFamily) {
    document.body.style.fontFamily = branding.fontFamily;
  }

  if (import.meta.env.DEV && branding.readableContrast === false) {
    // The tenant's own launch checklist already warns them, so this never
    // blocks rendering — it is only a signal while developing.
    console.warn(
      "[tenant-site] readableContrast is false: the brand colour is hard to read on the page background."
    );
  }
}

/** A tenant's tab should not show the Finova mark. */
export function applyTenantFavicon(faviconUrl: string | null): void {
  if (!faviconUrl) return;
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
}

// ---------------------------------------------------------------------------
// Flash of the wrong brand
// ---------------------------------------------------------------------------

// Keyed by hostname, or a tenant sees the previous tenant's colours in a
// shared browser.
const themeCacheKey = (host: string) => `tenant-site-theme:${host}`;

/**
 * Apply the last theme seen for this host, synchronously, before the first
 * paint. On a repeat visit there is then no flash of Finova red at all.
 */
export function applyCachedTenantTheme(host: string): boolean {
  try {
    const raw = localStorage.getItem(themeCacheKey(host));
    if (!raw) return false;
    applyTenantTheme(JSON.parse(raw) as SiteBranding);
    return true;
  } catch {
    return false;
  }
}

function cacheTenantTheme(host: string, branding: SiteBranding): void {
  try {
    localStorage.setItem(themeCacheKey(host), JSON.stringify(branding));
  } catch {
    // Private browsing, or storage is full. The page still renders.
  }
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

// One call per page load, not per route change: Kong rate-limits this service
// at 60 req/min/IP, shared with the signup funnel, and the payload only
// changes when a tenant edits its site.
let inFlight: { host: string; promise: Promise<PublicSite> } | null = null;

export function loadTenantSite(host: string): Promise<PublicSite> {
  if (inFlight && inFlight.host === host) return inFlight.promise;
  const promise = getPublicSite(host).then((site) => {
    if (site?.branding) cacheTenantTheme(host, site.branding);
    return site;
  });
  inFlight = { host, promise };
  // A failure must not be cached, or a transient blip pins the page to the
  // unavailable state for the rest of the session.
  promise.catch(() => {
    if (inFlight?.promise === promise) inFlight = null;
  });
  return promise;
}

/** Previews are never cached: the point of a draft is that it keeps changing. */
export function loadTenantSitePreview(token: string): Promise<PublicSite> {
  return getPublicSitePreview(token);
}

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

/**
 * Pick the Arabic field when the page is in Arabic, and **fall back to English
 * when it is empty** — a tenant that only filled in English should show
 * English, not a blank band.
 */
export function pickCopy(
  en: string | null | undefined,
  ar: string | null | undefined,
  locale: string
): string {
  if (locale.startsWith("ar")) return (ar || en || "").trim();
  return (en || ar || "").trim();
}

/** Entitlement gate. The backend checks it too — this is so a tenant's
 *  customers never see a door that will not open. */
export function hasModule(site: PublicSite | null, module: string): boolean {
  return Boolean(site?.modules?.includes(module));
}

/** A tenant running investor portfolios without lending is supported, so an
 *  "Apply for financing" CTA has to be gated as well. */
export const LENDING_MODULES = ["LOS", "LMS"];

export function canApplyForFinancing(site: PublicSite | null): boolean {
  return LENDING_MODULES.some((module) => hasModule(site, module));
}
