import { useEffect, useMemo, useState } from "react";

import type { PublicSite } from "../../redux/apis/apisTenantSite";
import { useLanguage } from "../../hooks/use-language";
import { languages } from "../../lib/i18n";
import {
  applyCachedTenantTheme,
  applyTenantFavicon,
  applyTenantTheme,
  loadTenantSite,
  loadTenantSitePreview,
  pickCopy,
  resolveSiteHost,
} from "../../utils/tenantSite";
import SiteImage from "./SiteImage";
import SiteUnavailable from "./SiteUnavailable";
import { TenantSiteProvider } from "./TenantSiteContext";
import { SECTION_COMPONENTS, sectionId } from "./sections";
// The platform landing page's stylesheet, scoped under `.fin-landing`. A tenant
// site is the same page dressed in the tenant's own palette, so it reuses those
// styles rather than growing a second set that drifts from them.
import "../../styles/landing.css";

/**
 * A tenant's own public website: its logo, its colours, its copy, its
 * products, served from the same build everyone else gets. Nothing is compiled
 * per tenant — one unauthenticated GET at boot returns a theme and a list of
 * sections, and this renders exactly that list.
 *
 * `previewToken` switches the source to an unpublished draft; the component
 * tree is identical.
 */
const TenantSitePage = ({ previewToken }: { previewToken?: string }) => {
  const host = useMemo(() => resolveSiteHost(), []);
  const { currentLanguage, setLanguage } = useLanguage();
  const [site, setSite] = useState<PublicSite | null>(null);
  const [failed, setFailed] = useState(false);
  const [stuck, setStuck] = useState(false);

  // The last theme seen for this host, applied before the first paint, so a
  // repeat visitor never sees a flash of the default palette.
  const [restoredTheme] = useState(() => (previewToken ? false : applyCachedTenantTheme(host)));

  useEffect(() => {
    let live = true;
    const load = previewToken ? loadTenantSitePreview(previewToken) : loadTenantSite(host);

    load
      .then((loaded) => {
        if (!live) return;
        if (!loaded?.branding) {
          // An envelope read that came back empty looks exactly like an
          // unbranded page with no error anywhere. Treat it as unavailable.
          setFailed(true);
          return;
        }
        applyTenantTheme(loaded.branding);
        applyTenantFavicon(loaded.branding.faviconUrl);
        setSite(loaded);
      })
      .catch(() => {
        // 404, an expired preview token, or the gateway being down all render
        // the same neutral page — see SiteUnavailable.
        if (live) setFailed(true);
      });

    return () => {
      live = false;
    };
  }, [host, previewToken]);

  /** The header only earns its border once the page has moved under it. */
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (site) document.title = site.companyName || document.title;
  }, [site]);

  // The tenant's own default locale, adopted only when this visitor has not
  // already chosen one — their choice outranks the tenant's default. RTL for
  // `ar` is handled by LanguageProvider, which sets `dir` on <html>.
  useEffect(() => {
    const preferred = site?.branding.defaultLocale;
    if (!preferred || localStorage.getItem("language")) return;
    const match = languages.find((language) => language.code === preferred);
    if (match && match.code !== currentLanguage.code) setLanguage(match);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site]);

  if (failed) return <SiteUnavailable />;

  // A neutral skeleton — no logo, no coloured buttons — until the theme is in.
  // Cheapest and most effective guard against showing the wrong brand.
  if (!site) {
    return (
      <main className="fin-landing min-h-screen w-full px-6 py-16 md:px-10" aria-busy="true">
        <div className="ln-wrap space-y-6">
          <div className={`h-10 w-48 rounded-md bg-muted ${restoredTheme ? "" : "opacity-60"}`} />
          <div className="h-64 w-full rounded-lg bg-muted" />
          <div className="h-6 w-2/3 rounded-md bg-muted" />
          <div className="h-6 w-1/2 rounded-md bg-muted" />
        </div>
      </main>
    );
  }

  const locale = currentLanguage.code;
  const companyName = pickCopy(site.companyName, site.companyNameAr, locale);

  // A section with no title of its own gets no nav entry rather than a blank
  // one: the label has to come from the tenant's copy, not from the type name.
  const navItems = site.sections
    .filter((section) => section.type !== "HERO" && section.type !== "FOOTER")
    .map((section) => ({
      href: `#${sectionId(section.type)}`,
      label: pickCopy(section.titleEn, section.titleAr, locale),
    }))
    .filter((item) => item.label);

  return (
    <TenantSiteProvider value={{ site, locale }}>
      <div className="fin-landing min-h-screen">
        {/* Sticky, and it earns its border only once the hero has moved under
            it — the landing page's own header behaviour. */}
        <header className="ln-header" data-stuck={stuck}>
          <div className="ln-wrap flex h-16 items-center justify-between gap-4 px-5">
            <SiteImage
              src={site.branding.logoUrl}
              alt={companyName}
              className="h-8 w-auto object-contain"
              fallback={<span className="text-lg font-semibold">{companyName}</span>}
            />

            {/* Built from what the API actually returned, so the nav can never
                point at a section this tenant does not publish. */}
            {navItems.length > 0 && (
              <nav className="hidden items-center gap-8 lg:flex">
                {navItems.map((item) => (
                  <a className="ln-navlink" key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </header>

        {/* The array is the page: already filtered and sorted by the backend.
            A section that is not in it does not exist here — there is no
            default section to fall back to. */}
        {site.sections.map((section) => {
          const Section = SECTION_COMPONENTS[section.type];
          return Section ? <Section key={`${section.type}-${section.sortOrder}`} section={section} /> : null;
        })}
      </div>
    </TenantSiteProvider>
  );
};

export default TenantSitePage;
