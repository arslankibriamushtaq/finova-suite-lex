import { useSearchParams } from "react-router-dom";

import SiteUnavailable from "./SiteUnavailable";
import TenantSitePage from "./TenantSitePage";

/**
 * A tenant admin's short-lived link to its unpublished draft. Same payload,
 * same component tree, different endpoint — the token carries the tenant,
 * which is what lets a site be previewed before it has an address.
 *
 * The banner is permanent so nobody mistakes a draft for the live site. A
 * missing or expired token falls through to the same neutral unavailable page
 * an unknown hostname gets.
 */
const TenantSitePreviewPage = () => {
  const [params] = useSearchParams();
  const token = params.get("token");

  if (!token) return <SiteUnavailable />;

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-50 bg-foreground px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-background">
        Preview — not published
      </div>
      <TenantSitePage previewToken={token} />
    </div>
  );
};

export default TenantSitePreviewPage;
